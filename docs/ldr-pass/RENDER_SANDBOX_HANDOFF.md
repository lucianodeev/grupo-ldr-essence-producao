# Render-only LDR ONE sandbox handoff

Verified on 2026-09-27:
- Existing isolated Render service: `ldr-one-stripe-sandbox` (auto-deploy OFF), URL `https://ldr-one-stripe-sandbox.onrender.com`.
- Current service branch: `fix/ldr-one-conflict-free-integration-20260926`.
- Current build: `echo ready`; start: `node scripts/ldr-one-stripe-test-webhook.mjs`.
- Existing script on current branch only verifies signed test-mode events; it does not call Stripe, persist subscriptions, or grant access.
- Main application Render service: `ldr-ecossistema-validacao`, main branch, auto-deploy ON. Do not alter.

Safe integration sequence:
1. Keep isolated receiver running on its existing branch until tests of the new ONE code pass.
2. Run `.github/workflows/ldr-one-sandbox-unit.yml` against this PR and resolve any failures.
3. Add isolated persistence and end-to-end test checkout in this branch only, with explicit account ownership and webhook event replay protection.
4. Only after successful isolated tests, explicitly switch the sandbox Render service branch to this branch, preserving auto-deploy OFF; verify its build/start commands and test-only environment variables by name without exposing values.
5. Manually deploy only the sandbox service. Verify `/health`, signed test-mode webhook, rejection of live-mode events, duplicate events, subscription lifecycle and five-seat minimum.
6. Keep all production deployment and live Stripe keys out of scope. No Vercel dependency.

IMPORTANT: The available Render connector does not expose an update-service branch/build/start action. Do not claim the branch was changed automatically. Use the Render dashboard for that specific configuration step, or another authorized service management interface if one becomes available.
