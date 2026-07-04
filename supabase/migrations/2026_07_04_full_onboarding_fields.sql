-- Full Onboarding Fields — Phase 3 part 4 (PR #35 companion)
-- Adds 5 optional columns to public.profiles:
--   city                  TEXT       (free text)
--   medical_conditions    TEXT[]     (user-declared list, free strings)
--   allergies             TEXT[]     (user-declared list, free strings)
--   food_preferences      TEXT[]     (user-declared list, free strings)
--   terms_accepted_at     TIMESTAMPTZ (auto-populated on onboarding completion)
--
-- Design notes:
-- - All new columns are NULL-able. No default.
-- - No new indexes. These columns are not filter targets for v1.
-- - No RLS changes. Existing profiles_own + profiles_admin_all policies cover
--   the new columns automatically (they apply to the row, not per-column).
-- - No lookup tables, no enums, no reference tables. TEXT[] gives the wizard
--   room to grow with free-form values while Dr. Wael reviews the vocabulary.
-- - Existing users are NOT re-blocked. isOnboardingComplete() is unchanged;
--   these 5 columns are treated as optional metadata everywhere.
--
-- Idempotent: safe to re-run.
-- Verification block at the bottom returns status = PASS on success.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city               TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
  ADD COLUMN IF NOT EXISTS allergies          TEXT[],
  ADD COLUMN IF NOT EXISTS food_preferences   TEXT[],
  ADD COLUMN IF NOT EXISTS terms_accepted_at  TIMESTAMPTZ;

COMMIT;

-- =========================================================
-- Verification
-- =========================================================
DO $$
DECLARE
  missing INT := 0;
BEGIN
  SELECT 5 - COUNT(*) INTO missing
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN ('city', 'medical_conditions', 'allergies', 'food_preferences', 'terms_accepted_at');

  IF missing = 0 THEN
    RAISE NOTICE 'FULL_ONBOARDING_FIELDS status = PASS (5/5 columns added)';
  ELSE
    RAISE EXCEPTION 'FULL_ONBOARDING_FIELDS status = FAIL (missing % columns)', missing;
  END IF;
END $$;
