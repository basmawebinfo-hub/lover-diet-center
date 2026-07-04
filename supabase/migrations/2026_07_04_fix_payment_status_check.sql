-- Fix HIGH-severity bug: orders_payment_status_check missing 'initiated'
--
-- The app writes payment_status='initiated' via markOrderPaymentInitiated() when
-- a user clicks Pay on the checkout page (before Paymob redirects them). The
-- original migration missed this value, so the first UPDATE would fail with a
-- CHECK constraint violation, breaking every checkout.
--
-- This adds 'initiated' to the allowed set. Idempotent.
--
-- Author: Ana (Post-launch audit)
-- Date: 2026-07-04

BEGIN;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (
    payment_status IS NULL
    OR payment_status IN ('pending', 'initiated', 'paid', 'failed', 'refunded')
  );

DO $$
DECLARE
  v_definition text;
BEGIN
  SELECT pg_get_constraintdef(con.oid) INTO v_definition
  FROM pg_constraint con
  JOIN pg_class c ON c.oid = con.conrelid
  WHERE c.relname = 'orders' AND con.conname = 'orders_payment_status_check';

  IF v_definition LIKE '%initiated%' THEN
    RAISE NOTICE 'PAYMENT_STATUS_CHECK status = PASS (initiated is now allowed)';
  ELSE
    RAISE WARNING 'PAYMENT_STATUS_CHECK status = FAIL — definition = %', v_definition;
  END IF;
END $$;

COMMIT;
