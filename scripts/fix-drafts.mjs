import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'un3ffdsw',
  dataset: 'production',
  apiVersion: '2026-05-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

async function fixDrafts() {
  console.log('Syncing published → drafts...')
  
  const docs = await client.fetch('*[!(_id in path("drafts.**")) && !(_type match "system.*")]')
  console.log(`Found ${docs.length} published documents`)
  
  const mutations = []
  for (const doc of docs) {
    const draftId = `drafts.${doc._id}`
    const draftDoc = { ...doc, _id: draftId }
    delete draftDoc._rev
    delete draftDoc._createdAt
    delete draftDoc._updatedAt
    mutations.push({ createOrReplace: draftDoc })
  }
  
  const batchSize = 50
  for (let i = 0; i < mutations.length; i += batchSize) {
    const batch = mutations.slice(i, i + batchSize)
    await client.mutate(batch)
    console.log(`  ✅ Synced ${Math.min(i + batchSize, mutations.length)}/${mutations.length}`)
  }
  
  console.log('\n✨ All drafts synced! Refresh the Studio.')
}

fixDrafts().catch(console.error)
