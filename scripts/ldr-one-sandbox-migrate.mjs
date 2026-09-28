// One-shot CLI only. Never import from the HTTP receiver or run on server boot.
// From a Render shell with private DATABASE_URL configured:
// npm install --no-save --no-package-lock pg
// LDR_ONE_ALLOW_SANDBOX_MIGRATION=yes node scripts/ldr-one-sandbox-migrate.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

if (process.env.LDR_ONE_ALLOW_SANDBOX_MIGRATION !== "yes") throw Error("Explicit sandbox migration flag required");
const raw = process.env.DATABASE_URL;
if (!raw) throw Error("DATABASE_URL must be supplied privately by Render");
const url = new URL(raw);
if (!["postgres:","postgresql:"].includes(url.protocol)) throw Error("PostgreSQL URL required");
if (decodeURIComponent(url.pathname.slice(1)) !== "ldr_one_sandbox_db") throw Error("Wrong database: migration refused");
const { default: pg } = await import(process.env.LDR_ONE_PG_MODULE_URL || "pg");
const client = new pg.Client({ connectionString: raw });
const file = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/ldr-pass/sql/ldr-one-sandbox-schema-REVIEW-ONLY.sql");
const sql = await readFile(file,"utf8");
try {
  await client.connect();
  const db = await client.query("SELECT current_database() AS name");
  if (db.rows[0]?.name !== "ldr_one_sandbox_db") throw Error("Database identity mismatch");
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  const result = await client.query("SELECT to_regclass('public.ldr_one_sandbox_subscriptions') IS NOT NULL AS subscriptions, to_regclass('public.ldr_one_sandbox_stripe_events') IS NOT NULL AS events, to_regclass('public.ldr_one_sandbox_seat_assignments') IS NOT NULL AS seats");
  if (!Object.values(result.rows[0]).every(Boolean)) throw Error("Schema verification failed");
  console.log("LDR ONE isolated sandbox schema verified (no credentials printed)");
} catch (error) {
  try { await client.query("ROLLBACK"); } catch {}
  throw error;
} finally { await client.end(); }
