# Google Calendar validation — 12 November 2026

Baseline: PR #273, commit b04516ba8776b7ff5fef1c56953bca046a558434.

The Render OAuth client ID, client secret, redirect URI, state signing secret and AES-256 encryption key have been saved. AGENDA_INTEGRATION_ENABLED remains false. Existing variables were preserved. No secret values are recorded here.

## Executed evidence

- Local: 33 existing Calendar/OAuth/saga/schema tests passed, zero failures. Google responses are mocked; this does not validate the supplied live credentials or Google consent.
- Initial typecheck exposed missing generated OAuth route entries. Regenerated routeTree.gen.ts; typecheck then passed. Local Render build passed.
- Compiled-server HTTP smoke (synthetic configuration, no production credentials): start/callback both return 404 with setup disabled and 403 without an administrator session with setup enabled, always keeping AGENDA_INTEGRATION_ENABLED=false (four assertions passed).
- Retrieved complete GitHub job logs, with successful results at the baseline:
  - [OAuth: 27 tests](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43118999587)
  - [Full SQL: 31 PostgreSQL controls and 19 Calendar tests](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43118987535)
  - [Concurrency](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43118987543)
  - [Permissions](https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43118987642)
- Public callback GET returned HTTP 404 (the deployed application is still da91c4fc, without these OAuth routes).
- Render deployment list: dep-dbq51bajnfac739rbl2g remains live; the earlier automatic API-triggered build dep-dbqmmrdbedkc73e4ed4g was canceled before publication. Subsequent credentials were saved through the UI's Save only option.

## Correction

OAuth start/callback previously depended on AGENDA_INTEGRATION_ENABLED, making consent impossible while the agenda remained disabled. Both now require the independent GOOGLE_CALENDAR_OAUTH_SETUP_ENABLED=true, defaulting to unavailable. Verified administrator authentication, session-bound signed state, single-use nonce and encrypted token storage remain required. Booking/calendar operations retain their existing agenda flag.

## Remaining gates for real consent

1. Review and authorize publication of the OAuth routes and the versioned private storage migration 20261112000100_calendar_oauth_private_storage.sql; no production migration is authorized by this validation.
2. Configure GOOGLE_CALENDAR_OAUTH_ADMIN_UIDS with the explicitly authorized Supabase user's UUID, and GOOGLE_CALENDAR_ID with the authorized test calendar's ID. Do not infer either from an email address.
3. After approved publication, enable only GOOGLE_CALENDAR_OAUTH_SETUP_ENABLED for controlled administrator consent; retain AGENDA_INTEGRATION_ENABLED=false.
4. Complete Google consent, validate encrypted refresh-token persistence, and run create/reschedule/cancel/idempotency against synthetic events in the authorized test calendar before enabling normal operations.
5. The client secret was supplied in chat. Replace it securely before activation; do not put the replacement in chat, source, logs or evidence.

No live token exchange, event creation or production SQL write has been performed in this validation. Saving configuration is not evidence that the Google credential pair works.
