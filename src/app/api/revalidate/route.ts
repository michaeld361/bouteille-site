import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sanity webhook endpoint for on-demand revalidation.
 * 
 * Set up in Sanity: Settings → API → Webhooks
 * URL: https://your-domain.com/api/revalidate
 * Secret: (set SANITY_REVALIDATE_SECRET env var)
 * Trigger on: Create, Update, Delete
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  // Validate secret if configured
  if (process.env.SANITY_REVALIDATE_SECRET && secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    // Revalidate all language paths
    revalidatePath('/en', 'layout')
    revalidatePath('/fr', 'layout')
    revalidatePath('/nl', 'layout')

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
