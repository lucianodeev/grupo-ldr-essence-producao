-- DEVELOPMENT / REVIEW ONLY. Never applied automatically by the web build.
-- Extend the existing orders ledger: do not create another CRM or price table.
BEGIN;
CREATE OR REPLACE FUNCTION public.ldr_guard_service_order_financials()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE old_kind text; new_kind text;
BEGIN
 IF TG_OP <> 'INSERT' THEN old_kind := OLD.metadata->>'checkout_kind'; END IF;
 IF TG_OP <> 'DELETE' THEN new_kind := NEW.metadata->>'checkout_kind'; END IF;
 IF coalesce(old_kind,'') NOT IN ('enterprise_quote','catalog_service')
    AND coalesce(new_kind,'') NOT IN ('enterprise_quote','catalog_service') THEN
   IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'service order history must be retained'; END IF;
 IF current_user NOT IN ('service_role','postgres','supabase_admin') THEN
   IF TG_OP='INSERT' THEN RAISE EXCEPTION 'service orders require server authorization'; END IF;
   IF ROW(NEW.amount_cents,NEW.currency,NEW.catalog_key,NEW.customer_id,NEW.contact_email,
       NEW.title,NEW.description,NEW.metadata,NEW.stripe_checkout_session_id,NEW.payment_status,NEW.created_by)
     IS DISTINCT FROM ROW(OLD.amount_cents,OLD.currency,OLD.catalog_key,OLD.customer_id,OLD.contact_email,
       OLD.title,OLD.description,OLD.metadata,OLD.stripe_checkout_session_id,OLD.payment_status,OLD.created_by) THEN
     RAISE EXCEPTION 'service order financial fields require server authorization';
   END IF;
 END IF;
 IF TG_OP='UPDATE' THEN
   IF new_kind IS DISTINCT FROM old_kind THEN RAISE EXCEPTION 'service order kind is immutable'; END IF;
   IF old_kind='catalog_service' OR OLD.metadata->>'quote_state' IN ('approved','accepted') THEN
     IF ROW(NEW.amount_cents,NEW.currency,NEW.catalog_key,NEW.contact_email,NEW.title,NEW.description,
         NEW.metadata->'sessions',NEW.metadata->'quote_valid_until',NEW.metadata->'contact_id')
       IS DISTINCT FROM ROW(OLD.amount_cents,OLD.currency,OLD.catalog_key,OLD.contact_email,OLD.title,OLD.description,
         OLD.metadata->'sessions',OLD.metadata->'quote_valid_until',OLD.metadata->'contact_id') THEN
       RAISE EXCEPTION 'approved service terms are immutable';
     END IF;
   END IF;
   IF old_kind='enterprise_quote' AND NOT (
     NEW.metadata->>'quote_state'=OLD.metadata->>'quote_state'
     OR (OLD.metadata->>'quote_state'='draft' AND NEW.metadata->>'quote_state'='approved')
     OR (OLD.metadata->>'quote_state'='approved' AND NEW.metadata->>'quote_state'='accepted')) THEN
     RAISE EXCEPTION 'invalid quote transition';
   END IF;
   IF OLD.metadata->>'quote_state'='accepted' AND
      ROW(NEW.customer_id,NEW.metadata->'user_id',NEW.metadata->'customer_id',NEW.metadata->'accepted_by',NEW.metadata->'accepted_at',NEW.metadata->'checkout_expires_at')
      IS DISTINCT FROM ROW(OLD.customer_id,OLD.metadata->'user_id',OLD.metadata->'customer_id',OLD.metadata->'accepted_by',OLD.metadata->'accepted_at',OLD.metadata->'checkout_expires_at') THEN
     RAISE EXCEPTION 'accepted quote identity is immutable';
   END IF;
 END IF;
 IF new_kind='enterprise_quote' THEN
   IF NEW.metadata->>'quote_state' IS NULL OR NEW.metadata->>'quote_state' NOT IN ('draft','approved','accepted') THEN
     RAISE EXCEPTION 'invalid quote state';
   END IF;
   IF NEW.payment_status='pago' AND (NEW.metadata->>'quote_state'<>'accepted' OR NEW.customer_id IS NULL OR NEW.stripe_checkout_session_id IS NULL) THEN
     RAISE EXCEPTION 'unaccepted quote cannot be paid';
   END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.ldr_guard_service_order_financials() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER ldr_service_order_financial_guard
 BEFORE INSERT OR UPDATE OR DELETE ON public.orders
 FOR EACH ROW EXECUTE FUNCTION public.ldr_guard_service_order_financials();

-- Checkout stays closed until this protection exists on the target database.
CREATE FUNCTION public.ldr_enterprise_quote_checkout_ready() RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='public.orders'::regclass
   AND tgname='ldr_service_order_financial_guard' AND tgenabled='O');
$$;
REVOKE ALL ON FUNCTION public.ldr_enterprise_quote_checkout_ready() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ldr_enterprise_quote_checkout_ready() TO service_role;
COMMIT;
