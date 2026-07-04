<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## Project memory & roadmap

The authoritative source for this project's state, roadmap, open issues,
architecture memory, and changelog is the **TextQL Context Library** under
`loversdc/`. Any AI session or engineer picking up this project should read,
in order:

1. `loversdc/PROJECT_CONTEXT.md` — everything a new session needs
2. `loversdc/PROJECT_MEMORY.md` — permanent architecture memory
3. `loversdc/PROJECT_STATE.md` — current status snapshot
4. `loversdc/OPEN_ISSUES.md` — register of known issues
5. `loversdc/NEXT_STEPS.md` — prioritized roadmap
6. `loversdc/CHANGELOG_FULL.md` — every merged PR + SQL migration
7. `loversdc/FINAL_AUDIT.md` — audit scoreboard

The `/loversdc` chat command in TextQL loads all seven files automatically.

## Deprioritized: Vercel edge compression (EXT-01)

As of 2026-07-04, the Vercel edge compression issue is reclassified as a
**Tracked External Issue** (`EXT-01` in `OPEN_ISSUES.md`). Root cause is
Vercel platform-side; no engineering time is budgeted unless it becomes
production-blocking. `compress: true` in `next.config.mjs` stays as-is. Do
NOT re-open work on this without first checking `OPEN_ISSUES.md` for the
re-open trigger.

## Current queue

1. **Phase 1** — Currency Consistency Fix (USD canonical) — single PR.
2. **Phase 2** — Dashboard PRs 1-6 (Profile / Weight / Meal Plan / Orders /
   Notifications / Shop & Checkout Polish), one PR at a time.
3. **Phase 3** — Admin (Sessions Booking UI, Analytics, Audit Log Viewer,
   Full Onboarding Fields).
4. **Phase 4** — Production Improvements (Rate Limiting, Image Cache TTL,
   Landing → Server Components, Supabase out of landing bundle, shared UI
   primitives).
5. **Phase 5** — v1.1 (AI Nutrition Assistant, AI Weekly Plans, Paymob,
   Stripe, Arabic SSR, Admin MFA).

For every PR: analyze → implement → verify → deploy → regression → update
all six Context Library memory files. Never start multiple major features
in parallel; finish one PR completely before moving to the next.
