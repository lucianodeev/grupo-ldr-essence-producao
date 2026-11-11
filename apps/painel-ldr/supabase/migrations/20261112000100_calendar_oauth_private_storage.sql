-- Staging migration only: do not apply until the integration is reviewed.
-- A private schema is intentionally inaccessible through the public Data API.
create schema if not exists ldr_private;
revoke all on schema ldr_private from public, anon, authenticated;

create table if not exists ldr_private.calendar_oauth_nonces (
  nonce text primary key,
  expires_at timestamptz not null
);
revoke all on ldr_private.calendar_oauth_nonces from public, anon, authenticated;

create table if not exists ldr_private.calendar_oauth_secrets (
  secret_name text primary key,
  encrypted_value text not null,
  granted_scopes text not null default '',
  updated_at timestamptz not null default now()
);
revoke all on ldr_private.calendar_oauth_secrets from public, anon, authenticated;

create or replace function ldr_private.claim_calendar_oauth_nonce(p_nonce text, p_ttl_seconds integer)
returns boolean language plpgsql security invoker set search_path = ''
as $$
begin
  if p_nonce !~ '^[A-Za-z0-9_-]{32}$' or p_ttl_seconds < 1 or p_ttl_seconds > 600 then
    raise exception 'invalid oauth nonce';
  end if;
  insert into ldr_private.calendar_oauth_nonces(nonce, expires_at)
  values (p_nonce, now() + make_interval(secs => p_ttl_seconds))
  on conflict (nonce) do nothing;
  return found;
end;
$$;
revoke all on function ldr_private.claim_calendar_oauth_nonce(text, integer) from public, anon, authenticated;
grant usage on schema ldr_private to service_role;
grant select, insert, update on ldr_private.calendar_oauth_secrets to service_role;
grant select, insert on ldr_private.calendar_oauth_nonces to service_role;
grant execute on function ldr_private.claim_calendar_oauth_nonce(text, integer) to service_role;
