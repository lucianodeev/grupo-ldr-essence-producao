-- REVIEW ONLY: isolated Render PostgreSQL invite-only auth. Do not apply to production.
-- No public signup. No verified rows or credentials are created by this migration.
CREATE TABLE IF NOT EXISTS public.ldr_one_sandbox_invited_users (
 user_id uuid PRIMARY KEY,
 customer_id uuid NOT NULL,
 email text NOT NULL UNIQUE,
 password_hash text NOT NULL,
 verified boolean NOT NULL DEFAULT false,
 disabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT ldr_one_sandbox_invited_email_normalized CHECK(email=lower(email) AND length(email)<=254),
 CONSTRAINT ldr_one_sandbox_invited_hash_format CHECK(password_hash ~ '^scrypt-v1:[a-f0-9]{64}:[a-f0-9]{128}$')
);
-- Before enabling, implement rate limits, secure session issuance, CSRF and explicit invitation verification.
