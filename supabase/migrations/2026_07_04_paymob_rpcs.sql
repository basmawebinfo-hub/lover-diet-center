-- Phase 5 · Payments · Paymob RPCs
-- Two SECURITY DEFINER helpers the webhook calls with the anon key.
--
-- SECURITY DEFINER lets these bypass RLS for their limited job. They only
-- update payment-related columns; the CHECK constraint on orders.status
-- still enforces valid transitions.
--
-- Idempotent: safe to re-run.
--
-- Author: Ana (Phase 5 · Payments)
-- Date: 2026-07-04

BEGIN;

-- ============================================================
-- Function: paymob_apply_paid
-- ============================================================
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
BEGIN
  -- Only advance from pending -> paid. If already paid, no-op.
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

  -- Return the details the webhook needs to send an email receipt.
  SELECT
    substring(id from 1 for 8) AS short_id,
    shipping_email AS email,
    shipping_name,
    total
  INTO v_row
  FROM public.orders
  WHERE id = p_order_id;

  IF v_row IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
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
-- Function: paymob_apply_failed
-- ============================================================
CREATE OR REPLACE FUNCTION public.paymob_apply_failed(
  p_order_id text,
  p_paymob_transaction_id text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only flip payment_status if the order is still pending.
  -- Keep status = pending so the user can retry the same order.
  UPDATE public.orders SET
    payment_status = 'failed',
    payment_transaction_id = p_paymob_transaction_id,
    updated_at = now()
  WHERE id = p_order_id
    AND status = 'pending'
    AND (payment_status IS NULL OR payment_status IN ('initiated', 'failed'));
END;
$$;

REVOKE ALL ON FUNCTION public.paymob_apply_failed(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.paymob_apply_failed(text, text) TO anon, authenticated;

-- ============================================================
-- Verification
-- ============================================================
DO $$
DECLARE
  v_paid_ok boolean;
  v_failed_ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'paymob_apply_paid'
      AND pronamespace = 'public'::regnamespace
  ) INTO v_paid_ok;

  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'paymob_apply_failed'
      AND pronamespace = 'public'::regnamespace
  ) INTO v_failed_ok;

  IF v_paid_ok AND v_failed_ok THEN
    RAISE NOTICE 'PAYMOB_RPCS status = PASS (both functions created)';
  ELSE
    RAISE WARNING 'PAYMOB_RPCS status = FAIL — paid_ok=%, failed_ok=%',
      v_paid_ok, v_failed_ok;
  END IF;
END $$;

COMMIT;
