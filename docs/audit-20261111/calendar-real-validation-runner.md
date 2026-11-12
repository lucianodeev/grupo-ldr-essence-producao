# Controlled real Calendar test

OAuth consent has completed on the published service and the encrypted refresh token is present. Event operations have not yet been tested against Google.

The free Render service does not offer shell/SSH or one-off jobs. No paid resource was created. The existing application has no path for running an isolated event test while agenda operations remain disabled.

This change adds `/api/integrations/google-calendar/validate`, an opt-in administrator-only executor using the existing Google transport and encrypted token vault. It never creates appointments, changes credits, uses customer data or sends invitations. It creates a private five-minute technical event seven days ahead, checks availability, readback, duplicate prevention, conflict detection, rescheduling with stable identity, cancellation and idempotent cancellation. A finally block cleans the deterministic test event even after a failed or timed-out operation. A failed cleanup reports only that test event's ID for recovery.

Access requires the existing verified administrator allowlist, session-bound expiring HMAC token, same-origin POST and atomic one-use nonce. GET displays a confirmation form and never mutates Calendar. No tokens or Google response bodies are returned. The executor is unavailable by default and unavailable while normal agenda operations are enabled.

Before an authorized publication/execution:

1. Explicitly select the test calendar. Set GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_TEST_ID to that same Google calendar ID. A dedicated existing calendar is preferred; using the account's primary calendar must be expressly selected by the owner.
2. Keep AGENDA_INTEGRATION_ENABLED=false. Temporarily set GOOGLE_CALENDAR_VALIDATION_ENABLED=true.
3. Publish this reviewed change and open the executor in the verified administrator session. Submit the form once.
4. Require `ok=true`, all seven check groups, `cleanupComplete=true`, and no remaining test event. Record the sanitized JSON result. Failed cleanup must be resolved before retrying.
5. Disable GOOGLE_CALENDAR_VALIDATION_ENABLED after the test. Do not enable the normal agenda until its separate release gates are met.

The existing 33 Calendar/OAuth/saga/schema tests passed after this change. These are simulated and do not count as real Google event evidence. The transport now omits attendees and sends no updates for explicit empty-attendee technical events; existing customer invitations retain their prior behavior.

Typecheck and local Render build passed. Six compiled-server HTTP assertions passed: GET/POST return 404 by default, 403 without an administrator when opted in, and 404 while normal agenda operations are enabled. The private calendar **LDR — Testes técnicos** was created under the authorized owner's Google account; public access is disabled and no other participant was added. Its identifier must remain in environment configuration, not this public repository. No real event test has run yet; publishing the executor is a separate approval step.
