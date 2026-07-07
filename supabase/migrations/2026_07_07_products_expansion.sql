-- Phase 5 · Product Catalog Expansion
-- Adds 9 optional fields to products so we can capture the full product spec
-- extracted by Gemini from the product photo:
--
--   discount_price  → السعر بعد الخصم
--   ingredients     → المكونات (text — free-form list)
--   calories        → السعرات لكل حصة
--   protein_g       → البروتين بالجرام
--   carbs_g         → الكاربوهيدرات بالجرام
--   fat_g           → الدهون بالجرام
--   weight_g        → الوزن بالجرام لكل حصة
--   sku             → SKU للجرد (unique per shop)
--   stock_qty       → كمية المخزون (integer)
--
-- All columns are NULLABLE — existing 6 seed products will not be affected.
-- Backward-compat: the app still reads price/in_stock as before. New fields
-- are optional metadata that admin + Gemini can populate over time.
--
-- Idempotent (safe to re-run).
-- Author: Ana
-- Date: 2026-07-07

BEGIN;

-- ============================================================
-- Step 1 · Add the 9 new columns
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS ingredients    TEXT,
  ADD COLUMN IF NOT EXISTS calories       INTEGER,
  ADD COLUMN IF NOT EXISTS protein_g      NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS carbs_g        NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS fat_g          NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS weight_g       INTEGER,
  ADD COLUMN IF NOT EXISTS sku            TEXT,
  ADD COLUMN IF NOT EXISTS stock_qty      INTEGER;

-- ============================================================
-- Step 2 · Sanity CHECK constraints
-- ============================================================
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_discount_price_nonneg;
ALTER TABLE public.products
  ADD CONSTRAINT products_discount_price_nonneg
  CHECK (discount_price IS NULL OR discount_price >= 0);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_discount_lt_price;
ALTER TABLE public.products
  ADD CONSTRAINT products_discount_lt_price
  CHECK (discount_price IS NULL OR discount_price <= price);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_macros_nonneg;
ALTER TABLE public.products
  ADD CONSTRAINT products_macros_nonneg
  CHECK (
    (calories  IS NULL OR calories  >= 0)
    AND (protein_g IS NULL OR protein_g >= 0)
    AND (carbs_g   IS NULL OR carbs_g   >= 0)
    AND (fat_g     IS NULL OR fat_g     >= 0)
    AND (weight_g  IS NULL OR weight_g  >  0)
    AND (stock_qty IS NULL OR stock_qty >= 0)
  );

-- ============================================================
-- Step 3 · Unique index on SKU (only when set)
-- Partial unique index — allows multiple NULL SKUs but rejects duplicates.
-- ============================================================
DROP INDEX IF EXISTS products_sku_unique;
CREATE UNIQUE INDEX products_sku_unique
  ON public.products (sku)
  WHERE sku IS NOT NULL AND deleted_at IS NULL;

-- ============================================================
-- Verification
-- ============================================================
DO $$
DECLARE
  v_cols int;
BEGIN
  SELECT COUNT(*) INTO v_cols
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='products'
    AND column_name IN (
      'discount_price','ingredients','calories','protein_g','carbs_g',
      'fat_g','weight_g','sku','stock_qty'
    );

  IF v_cols = 9 THEN
    RAISE NOTICE 'PRODUCTS_EXPANSION status = PASS (9/9 columns added)';
  ELSE
    RAISE WARNING 'PRODUCTS_EXPANSION status = FAIL — only % of 9 columns added', v_cols;
  END IF;
END $$;

COMMIT;
