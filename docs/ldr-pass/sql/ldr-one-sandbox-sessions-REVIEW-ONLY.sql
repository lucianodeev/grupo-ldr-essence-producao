-- REVIEW ONLY. Isolated Render sandbox only; never run on production.
CREATE TABLE IF NOT EXISTS public.ldr_one_sandbox_sessions (
 token_hash char(64) PRIMARY KEY,
 user_id uuid NOT NULL,
 customer_id uuid NOT NULL,
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT sandbox_session_token_hash CHECK(token_hash ~ '^[a-f0-9]{64}$')
);
CREATE INDEX IF NOT EXISTS ldr_one_sandbox_sessions_expiry ON public.ldr_one_sandbox_sessions(expires_at);
-- Keep sessions private; purge expired rows in a controlled maintenance job.
