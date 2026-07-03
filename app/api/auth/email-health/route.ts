import { NextResponse } from 'next/server'

// Public health endpoint. Reports whether email delivery is configured
// on the server WITHOUT exposing any secrets. Safe to call anonymously.
//
// A false in any of these fields tells us Vercel's env vars aren't set up.
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    resend_api_key_present: Boolean(process.env.RESEND_API_KEY),
    resend_from_email_present: Boolean(process.env.RESEND_FROM_EMAIL),
    resend_from_name_present: Boolean(process.env.RESEND_FROM_NAME),
    resend_from_email: process.env.RESEND_FROM_EMAIL || null,
    resend_from_name: process.env.RESEND_FROM_NAME || null,
    // Do NOT include the API key itself. Never.
  }, {
    // Keep this fresh; do not cache.
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
