// Read-only smoke check for the isolated Render database. Never prints credentials.
if (process.env.LDR_ONE_SANDBOX_DB_SMOKE !== "yes") throw Error("Explicit sandbox smoke flag required");
if (process.env.RENDER_SERVICE_ID !== "srv-das6drvavr4c7397dflg") throw Error("Wrong Render service");
const raw = process.env.DATABASE_URL;
if (!raw) throw Error("DATABASE_URL missing");
const url = new URL(raw);
if (!["postgres:","postgresql:"].includes(url.protocol) || decodeURIComponent(url.pathname.slice(1)) !== "ldr_one_sandbox_db") throw Error("Wrong database");
const { default: pg } = await import(process.env.LDR_ONE_PG_MODULE_URL || "pg");
const client = new pg.Client({ connectionString: raw, connectionTimeoutMillis: 5000, statement_timeout: 5000 });
try {
  await client.connect();
  const result = await client.query(`SELECT current_database() = 'ldr_one_sandbox_db' AS correct_db,
    to_regclass('public.ldr_one_sandbox_subscriptions') IS NOT NULL AS subscriptions,
    to_regclass('public.ldr_one_sandbox_stripe_events') IS NOT NULL AS events,
    to_regclass('public.ldr_one_sandbox_seat_assignments') IS NOT NULL AS seats`);
  if (!Object.values(result.rows[0]).every(Boolean)) throw Error("Sandbox database schema check failed");
  console.log("LDR ONE SANDBOX DB SMOKE VERIFIED");
} finally { await client.end(); }
