// POST /api/food/analyze
//
// Estimates the nutrition of a logged meal photo.
//
// Runs on the server for two reasons that both matter: the model key must never
// reach a phone, and the per-user daily cap has to be enforced somewhere the
// client cannot skip — the same lesson as the auth rate limiting, where a
// browser-side pre-check turned out to be no control at all.
//
// The numbers this returns are estimates. The row stays 'pending' until someone
// at the clinic reviews it; this route never writes a reviewed status.
//
// Responses:
//   200 { ok: true, estimate }   -> analysed and saved
//   400 { error }                -> bad input
//   401 { error }                -> not signed in
//   404 { error }                -> log row is not the caller's
//   429 { error, limit }         -> daily cap reached
//   503 { error }                -> analysis not configured on the server

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Photos a single client may analyse per day.
 *
 * A setting, not a constant baked into a release: every analysis costs money,
 * and this can be tuned from the environment once the real per-image cost is
 * known, without a deploy.
 */
const DAILY_LIMIT = Number(process.env.FOOD_ANALYSIS_DAILY_LIMIT ?? '10')

const MODEL = process.env.FOOD_ANALYSIS_MODEL ?? 'claude-sonnet-4-5'

type Body = { logId?: string }

type Estimate = {
  items: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: number
}

function bad(error: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status })
}

const SYSTEM_PROMPT = [
  'You estimate the nutrition of a meal from a photograph for a nutrition clinic.',
  'Reply with JSON only, no prose, matching exactly:',
  '{"items":string,"calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"confidence":number}',
  'The "items" field is a short Arabic description of what is on the plate.',
  'Estimate the portion actually visible, not a standard serving.',
  'The "confidence" field is 0 to 1 and must be genuinely low when the photo is',
  'unclear, the portion size is ambiguous, or the dish is hard to identify — a',
  'clinician reviews these and needs to know which ones to check.',
].join(' ')

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Fail loudly rather than silently saving an empty estimate — a meal row
    // with no numbers and no explanation is worse than a clear error.
    console.error('[food-analyze] ANTHROPIC_API_KEY is not set')
    return bad('Meal analysis is not configured on the server', 503)
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return bad('invalid_body', 400)
  }
  if (!body.logId) return bad('missing_log_id', 400)

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* read-only in this route */
        },
      },
    },
  )

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return bad('not_signed_in', 401)
  const userId = auth.user.id

  // RLS already restricts this to the caller's rows; selecting on both keys
  // makes the intent explicit and turns a mismatch into a 404 rather than a
  // confusing empty result.
  const { data: log } = await supabase
    .from('food_logs')
    .select('id, photo_path, status, logged_on')
    .eq('id', body.logId)
    .eq('user_id', userId)
    .single()

  if (!log) return bad('log_not_found', 404)

  const row = log as { id: string; photo_path: string; logged_on: string }

  // Daily cap, counted over rows that actually consumed an analysis.
  const { count } = await supabase
    .from('food_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('logged_on', row.logged_on)
    .in('status', ['pending', 'confirmed', 'corrected'])

  if ((count ?? 0) > DAILY_LIMIT) {
    return bad('daily_limit_reached', 429, { limit: DAILY_LIMIT })
  }

  // Signed URL rather than a public one: the bucket is private precisely so a
  // meal photo is not readable by anyone holding a guessable link.
  const { data: signed } = await supabase.storage
    .from('food-photos')
    .createSignedUrl(row.photo_path, 120)

  if (!signed?.signedUrl) return bad('photo_unavailable', 404)

  await supabase.from('food_logs').update({ status: 'analyzing' }).eq('id', row.id)

  try {
    const imageRes = await fetch(signed.signedUrl)
    if (!imageRes.ok) throw new Error(`photo fetch ${imageRes.status}`)
    const buf = Buffer.from(await imageRes.arrayBuffer())
    const mediaType = imageRes.headers.get('content-type') ?? 'image/jpeg'

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: buf.toString('base64') },
              },
              { type: 'text', text: 'Estimate the nutrition of this meal.' },
            ],
          },
        ],
      }),
    })

    if (!res.ok) throw new Error(`model ${res.status}`)

    const payload = (await res.json()) as { content?: { type: string; text?: string }[] }
    const text = payload.content?.find((c) => c.type === 'text')?.text ?? ''
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    const est = JSON.parse(json) as Estimate

    const clamp = (n: unknown, max: number) =>
      Math.max(0, Math.min(max, Math.round(Number(n) || 0)))

    const estimate = {
      detected_items: String(est.items ?? '').slice(0, 500),
      calories: clamp(est.calories, 10000),
      protein_g: clamp(est.protein_g, 1000),
      carbs_g: clamp(est.carbs_g, 1000),
      fat_g: clamp(est.fat_g, 1000),
      confidence: Math.max(0, Math.min(1, Number(est.confidence) || 0)),
      // Back to pending, never straight to confirmed: only a person at the
      // clinic moves a row out of pending.
      status: 'pending' as const,
    }

    await supabase.from('food_logs').update(estimate).eq('id', row.id)

    return NextResponse.json({ ok: true, estimate })
  } catch (e) {
    console.error('[food-analyze] failed', (e as Error).message)
    await supabase.from('food_logs').update({ status: 'failed' }).eq('id', row.id)
    return bad('analysis_failed', 502)
  }
}
