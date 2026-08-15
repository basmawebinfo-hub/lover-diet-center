-- Fix: paymob_apply_paid could not tell the caller whether it actually
-- transitioned the order.
--
-- Problem
-- -------
-- The original function ran the pending -> paid UPDATE, then unconditionally
-- SELECTed the order row and returned it. The webhook used the presence of an
-- email in that payload as its "send the receipt" signal.
--
-- On a Paymob retry (Paymob retries a Transaction Processed callback until it
-- gets a clean 200) the UPDATE matches zero rows because the order is already
-- `paid` — but the SELECT still returns the row, so the webhook sent the
-- customer a duplicate receipt email for every retry.
--
-- The webhook's other guard (the payment_events UNIQUE insert) was writing to
-- a column named `payload` that does not exist on the table, so PostgREST
-- rejected every insert and the idempotency gate never fired at all. That is
-- fixed in the route; this migration adds the second, database-level guard so
-- correctness does not depend on the event log succeeding.
--
-- Fix
-- ---
-- Return an `applied` boolean derived from GET DIAGNOSTICS ROW_COUNT. The
-- webhook sends the receipt only when applied = true.
--
-- Backwards compatible: the returned JSON keeps every existing key and only
-- adds `applied`. Signature is unchanged, so no GRANT changes are needed.
--
-- Idempotent: safe to re-run.
--
-- Date: 2026-08-15

BEGIN;

CREATE OR REPLACE FUNCTION public.paymob_apply_paid(
  p_order_id text,
  p_paymob_transaction_id text,
  p_paid_amount numeric,
  p_paid_currency text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
  v_applied integer := 0;
BEGIN
  -- Only advance from pending -> paid. If already paid, this matches 0 rows.
  UPDATE public.orders SET
    payment_status = 'paid',
    payment_provider = 'paymob',
    payment_transaction_id = p_paymob_transaction_id,
    paid_amount = p_paid_amount,
    paid_currency = p_paid_currency,
    paid_at = now(),
    status = 'paid',
    updated_at = now()
  WHERE id = p_order_id
    AND status = 'pending'
    AND (payment_status IS NULL OR payment_status IN ('initiated', 'failed'));

  GET DIAGNOSTICS v_applied = ROW_COUNT;

  -- Return the details the webhook needs to send an email receipt.
  SELECT
    substring(id::text from 1 for 8) AS short_id,
    shipping_email AS email,
    shipping_name,
    total
  INTO v_row
  FROM public.orders
  WHERE id = p_order_id;

  IF v_row IS NULL THEN
    RETURN jsonb_build_object('applied', false);
  END IF;

  RETURN jsonb_build_object(
    'applied', v_applied > 0,
    'email', v_row.email,
    'short_id', v_row.short_id,
    'shipping_name', v_row.shipping_name,
    'total', v_row.total
  );
END;
$$;

REVOKE ALL ON FUNCTION public.paymob_apply_paid(text, text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.paymob_apply_paid(text, text, numeric, text) TO anon, authenticated;

-- ============================================================
-- Verification
-- ============================================================
DO $$
DECLARE
  v_src text;
BEGIN
  SELECT prosrc INTO v_src
  FROM pg_proc
  WHERE proname = 'paymob_apply_paid'
    AND pronamespace = 'public'::regnamespace;

  IF v_src LIKE '%GET DIAGNOSTICS%' AND v_src LIKE '%applied%' THEN
    RAISE NOTICE 'PAYMOB_APPLIED_FLAG status = PASS';
  ELSE
    RAISE WARNING 'PAYMOB_APPLIED_FLAG status = FAIL (function not updated)';
  END IF;
END $$;

COMMIT;
