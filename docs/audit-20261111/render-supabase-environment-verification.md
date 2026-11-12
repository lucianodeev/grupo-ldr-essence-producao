# Render / Supabase environment verification — 2026-11-11

## Verified Render service
- Workspace: My Workspace (`tea-daqpr6nf3r2c73bnaijg`)
- Production-facing Render service: `ldr-ecossistema-validacao` (`srv-daqq2gfavr4c7394hb1g`)
- Repository: `lucianodeev/grupo-ldr-essence-producao`
- Deployed branch: `main`
- Auto-deploy on commit: enabled
- URL: https://ldr-ecossistema-validacao.onrender.com
- Dashboard: https://dashboard.render.com/web/srv-daqq2gfavr4c7394hb1g
- Feature branch being validated: `feat/central-empresas-ldr` (not the Render deployment branch)
- Separate Render sandbox: `ldr-one-stripe-sandbox` (`srv-das6drvavr4c7397dflg`), branch `feat/ldr-one-sandbox-entitlements-20260927`, auto-deploy disabled.

## Supabase verification
Connected Supabase projects:
- `sfrcsrzuoqdscflfuwik` (account default project)
- `lcvuuqtdboucayrysdvc` (human-room)

The connected account default project does not contain `public.appointments` or `confirm_mentorship_session_tx`, despite those being referenced in the repository's legacy types and application code. This is not sufficient evidence to assert which project Render uses.

**The available Render service detail API does not return environment variable values.** The project reference used by Render cannot be verified from this API response. Do not infer it from project names, legacy types or a connected Supabase project.

## Safe next actions
1. Verify only the project ref (not credentials) from the Render service's `SUPABASE_URL` or `VITE_SUPABASE_URL` in dashboard environment settings. Do not copy API keys into issues, commits, or chat.
2. Inspect the verified target project's tables, enums, functions and migrations using read-only queries.
3. Prepare reviewed migration and application changes for `mentorship_sessions.appointment_id`, `confirmed_at`, `s8_sessions` link handling, and delivery approval/adjustment statuses, or redesign using existing schema.
4. Run typecheck, build, 59 unit tests, 139 regressions, HTTP smoke tests and related workflows; compare counts with the latest actual run.
5. Keep the branch and PR unmerged; production deploy and schema DDL require separate explicit approval.

No Render configuration, production data, or database schema was changed by this inspection.
