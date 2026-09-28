# LDR ONE Sandbox — private Render database handoff

Verified: the isolated Render PostgreSQL database `ldr-one-sandbox-db` and the isolated service `ldr-one-stripe-sandbox` are both in Frankfurt. Both are on free plans. Never touch the production Render service or either existing Supabase project.

## Connect without revealing credentials
1. Open https://dashboard.render.com/d/dpg-dash3b3bc2fs73f7vobg-a and find **Connections** / **Internal Database URL**. Do not paste its value into GitHub, chat, screenshots or logs.
2. Open https://dashboard.render.com/web/srv-das6drvavr4c7397dflg, then **Environment**. Add `DATABASE_URL` using the Render private/internal URL; ideally use Render's reference to the database connection property, if offered by the dashboard. The service and database are in the same region. Never use the External Database URL.
3. Keep `LDR_ONE_ALLOW_SANDBOX_MIGRATION` **unset** on the long-running web service. Never run migrations from the web service's start command. Keep `LDR_ONE_SANDBOX_CHECKOUT_ENABLED` unset/false.
4. To apply schema, use a **one-time** trusted job or temporary private shell on Render, using the same repo branch and internal `DATABASE_URL`. Install `pg` in that isolated runtime, set `LDR_ONE_ALLOW_SANDBOX_MIGRATION=yes` for this run only, then execute `node scripts/ldr-one-sandbox-migrate.mjs`. The script refuses any database whose name differs from `ldr_one_sandbox_db`.
5. Inspect the one-time job's successful schema verification output. Unset migration authorization and remove any temporary job afterward. Verify all three sandbox tables exist through a private connection.
6. Only then implement atomic event processing and a real authenticated checkout. The current webhook receiver **does not write to the database** and the checkout helper **does not call Stripe**.

## Cost and security
The free database is temporary and expires 2026-10-27 according to Render. Do not place customer data or production subscriptions in it. Do not create a paid cron job to perform this migration without explicit cost approval. Never enable public database access just to accommodate an external integration.
