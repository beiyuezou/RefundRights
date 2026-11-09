COMMENT ON COLUMN public.payments.raw_payload IS 'DEPRECATED: no longer written; full PayPal payloads contain payer PII';
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'privacy-retention-cleanup',
  '17 3 * * *',
  $$
    DELETE FROM public.audit_logs WHERE created_at < now() - interval '90 days';
    DELETE FROM public.rate_limit_events WHERE created_at < now() - interval '90 days';
  $$
);