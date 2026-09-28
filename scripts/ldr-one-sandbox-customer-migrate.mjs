// One-shot isolated customer directory migration, guarded by explicit startup flag.
import {readFile} from "node:fs/promises";
if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||process.env.LDR_ONE_SANDBOX_CUSTOMER_MIGRATION!=="yes")throw Error("Wrong sandbox migration context");
const raw=process.env.DATABASE_URL;if(!raw)throw Error("Missing private database");
const url=new URL(raw);if(!["postgres:","postgresql:"].includes(url.protocol)||decodeURIComponent(url.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
const {default:pg}=await import(process.env.LDR_ONE_PG_MODULE_URL||"pg");
const db=new pg.Client({connectionString:raw});
try{
 await db.connect();
 const name=await db.query("SELECT current_database() AS name");if(name.rows[0]?.name!=="ldr_one_sandbox_db")throw Error("Database mismatch");
 const sql=await readFile(new URL("../docs/ldr-pass/sql/ldr-one-sandbox-customer-directory-REVIEW-ONLY.sql",import.meta.url),"utf8");
 await db.query("BEGIN");await db.query(sql);await db.query("COMMIT");
 const check=await db.query("SELECT to_regclass('public.ldr_one_sandbox_customer_members') IS NOT NULL AS ready");
 if(check.rows[0]?.ready!==true)throw Error("Customer directory verification failed");
 console.log("LDR ONE SANDBOX CUSTOMER DIRECTORY VERIFIED");
}catch(e){try{await db.query("ROLLBACK");}catch{}throw e;}finally{await db.end();}
