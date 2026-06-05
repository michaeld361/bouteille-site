import { createClient, type SanityClient, type Mutation } from '@sanity/client'
import { NextRequest, NextResponse } from 'next/server'
import { SCHEMA_CONFIG } from '@/lib/admin-schema'

// ---------------------------------------------------------------------------
// Sanity client (server-side only, authenticated)
// ---------------------------------------------------------------------------

const client: SanityClient = createClient({
  projectId: 'un3ffdsw',
  dataset: 'production',
  apiVersion: '2026-05-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a JSON response with the given status code. */
function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

/** Return a JSON error response. */
function errorResponse(message: string, status = 400) {
  return json({ error: message }, status)
}

/**
 * For a collection's titleField, extract a displayable string.
 * If the underlying schema field is an i18n type the value will be an array
 * like `[{ _key: 'en', value: '...' }]` — we pull the English value.
 */
function extractDisplayTitle(
  doc: Record<string, unknown>,
  titleField: string,
  docType: string,
): string | undefined {
  const raw = doc[titleField]
  if (raw == null) return undefined
  if (typeof raw === 'string') return raw

  // Check if the field is i18n via the schema config
  const fieldDefs =
    (SCHEMA_CONFIG.fields as Record<string, Array<{ name: string; type: string }>>)[docType] ?? []
  const fieldDef = fieldDefs.find((f) => f.name === titleField)
  const isI18n = fieldDef?.type === 'i18nString' || fieldDef?.type === 'i18nText'

  if (isI18n && Array.isArray(raw)) {
    const en = (raw as Array<{ _key: string; value: string }>).find((v) => v._key === 'en')
    return en?.value ?? (raw as Array<{ _key: string; value: string }>)[0]?.value
  }

  return String(raw)
}

/**
 * Given an array of documents that may include both published and draft
 * versions, de-duplicate so that the draft is preferred when both exist.
 */
function deduplicatePreferDraft<T extends { _id: string }>(docs: T[]): T[] {
  const map = new Map<string, T>()

  for (const doc of docs) {
    const publishedId = doc._id.replace(/^drafts\./, '')
    const existing = map.get(publishedId)

    // Prefer drafts over published
    if (!existing || doc._id.startsWith('drafts.')) {
      map.set(publishedId, doc)
    }
  }

  return Array.from(map.values())
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')

    // ------- action=schema -------
    if (action === 'schema') {
      // Transform SCHEMA_CONFIG into the { types: [...] } format the admin UI expects
      type FieldDef = { name: string; title: string; type: string; description?: string; options?: string[] }
      const fieldsMap = SCHEMA_CONFIG.fields as Record<string, FieldDef[]>

      const mapFields = (typeName: string) =>
        fieldsMap[typeName]?.map((f) => ({
          name: f.name,
          title: f.title,
          type: f.type,
          description: f.description,
          options: f.options ? { list: f.options } : undefined,
        })) || []

      const types = [
        ...SCHEMA_CONFIG.singletons.map((s) => ({
          name: s.type,
          title: s.title,
          singleton: true,
          titleField: 'title',
          fields: mapFields(s.type),
        })),
        ...SCHEMA_CONFIG.collections.map((c) => ({
          name: c.type,
          title: c.title,
          singleton: false,
          titleField: c.titleField,
          fields: mapFields(c.type),
        })),
      ]
      return json({ types })
    }

    // ------- action=get -------
    if (action === 'get') {
      const id = searchParams.get('id')
      if (!id) {
        return errorResponse('Missing required query param: id')
      }

      // Query for both draft and published, prefer draft
      const query = `*[_id == $draftId || _id == $publishedId] | order(_id desc)[0]`
      const params = { draftId: `drafts.${id}`, publishedId: id }

      const doc = await client.fetch(query, params, { perspective: 'raw' })

      if (!doc) {
        return errorResponse(`Document not found: ${id}`, 404)
      }

      return json({ document: doc })
    }

    // ------- action=list -------
    if (action === 'list') {
      const type = searchParams.get('type')
      if (!type) {
        return errorResponse('Missing required query param: type')
      }

      // Fetch both published and draft documents of this type
      const query = `*[_type == $type] | order(_createdAt desc)`
      const docs = await client.fetch(query, { type }, { perspective: 'raw' })

      // De-duplicate, preferring drafts
      const deduped = deduplicatePreferDraft(docs as Array<{ _id: string }>)

      // Find the collection config to extract display titles
      const collectionConfig = SCHEMA_CONFIG.collections.find((c) => c.type === type)
      const enriched = deduped.map((doc: Record<string, unknown>) => {
        const result: Record<string, unknown> = { ...doc }
        if (collectionConfig?.titleField) {
          result._displayTitle = extractDisplayTitle(
            doc,
            collectionConfig.titleField,
            type,
          )
        }
        return result
      })

      return json({ documents: enriched, total: enriched.length })
    }

    return errorResponse(
      'Unknown or missing action. Supported: schema, get, list',
    )
  } catch (err) {
    console.error('[admin API GET]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return errorResponse(message, 500)
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

interface PostBody {
  action?: string
  mutations?: Array<Record<string, unknown>>
  id?: string
  fields?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostBody
    const { action } = body

    // ------- action=mutate -------
    if (action === 'mutate') {
      if (!Array.isArray(body.mutations) || body.mutations.length === 0) {
        return errorResponse('mutations must be a non-empty array')
      }

      const result = await client.mutate(body.mutations as Mutation[])
      return json({ success: true, result })
    }

    // ------- action=patch -------
    if (action === 'patch') {
      const { id, fields } = body
      if (!id) {
        return errorResponse('Missing required field: id')
      }
      if (!fields || typeof fields !== 'object' || Object.keys(fields).length === 0) {
        return errorResponse('fields must be a non-empty object')
      }

      // 1. Fetch the current document (draft preferred, then published)
      const query = `*[_id == $draftId || _id == $publishedId] | order(_id desc)[0]`
      const params = { draftId: `drafts.${id}`, publishedId: id }
      const existing = await client.fetch(query, params, { perspective: 'raw' })

      // 2. Build the merged document — publish directly (not as draft)
      const publishedId = id.replace(/^drafts\./, '')
      const merged: Record<string, unknown> = {
        ...(existing ?? {}),
        ...fields,
        _id: publishedId,
        _type: existing?._type ?? id, // fallback: use the id as type for singletons
      }
      // Remove draft-specific keys
      delete merged._rev

      // 3. createOrReplace with the PUBLISHED ID so changes appear on the live site
      const result = await client.createOrReplace(merged as Parameters<SanityClient['createOrReplace']>[0])

      // 4. Clean up any leftover draft
      try {
        await client.delete(`drafts.${publishedId}`)
      } catch {
        // Draft may not exist — that's fine
      }

      return json({ success: true, document: result })
    }

    // ------- action=delete -------
    if (action === 'delete') {
      const { id } = body
      if (!id) {
        return errorResponse('Missing required field: id')
      }

      // Delete both published and draft versions
      const tx = client.transaction()
      tx.delete(id)
      tx.delete(`drafts.${id}`)
      const result = await tx.commit()

      return json({ success: true, result })
    }

    return errorResponse(
      'Unknown or missing action. Supported: mutate, patch, delete',
    )
  } catch (err) {
    console.error('[admin API POST]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return errorResponse(message, 500)
  }
}
