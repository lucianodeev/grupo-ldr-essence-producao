// One-shot rollback-only private Render PostgreSQL integration test. Never mounts a route.
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {hashSandboxPassword} from "./ldr-one-sandbox-local-auth.mjs";
import {loginInvitedSandboxUser,verifyInvitedSandboxSession,logoutInvitedSandboxSession} from "./ldr-one-sandbox-login-service.mjs";
const env={...process.env,LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED:"true",LDR_ONE_SANDBOX_SESSION_ENABLED:"true"};
if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||process.env.LDR_ONE_SANDBOX_LOGIN_DB_SELFTEST!=="yes")throw Error("Sandbox login DB selftest disabled");
if(["LDR_ONE_ALLOW_SANDBOX_MIGRATION","LDR_ONE_SANDBOX_CUSTOMER_MIGRATION","LDR_ONE_SANDBOX_DB_SMOKE","LDR_ONE_SANDBOX_EVENT_INTEGRATION","LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION"].some(k=>process.env[k]==="yes"))throw Error("Conflicting one-shot flags");
const raw=process.env.DATABASE_URL;if(!raw)throw Error("Private sandbox DB missing");
const url=new URL(raw);if(!["postgres:","postgresql:"].includes(url.protocol)||decodeURIComponent(url.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
const {default:pg}=await import(process.env.LDR_ONE_PG_MODULE_URL||"pg");
const db=new pg.Client({connectionString:raw,connectionTimeoutMillis:10000});
let began=false;
try{
 await db.connect();
 const database=await db.query("SELECT current_database() AS name");if(database.rows[0]?.name!=="ldr_one_sandbox_db")throw Error("Database identity mismatch");
 await db.query("BEGIN");began=true;
 for(const name of ["ldr-one-sandbox-invite-auth-REVIEW-ONLY.sql","ldr-one-sandbox-sessions-REVIEW-ONLY.sql"]){
  const sql=await readFile(new URL("../docs/ldr-pass/sql/"+name,import.meta.url),"utf8");await db.query(sql);
 }
 const user=randomUUID(),customer=randomUUID(),email="sandbox-probe-"+randomUUID()+"@example.invalid",password="sandbox-probe-"+randomUUID();
 await db.query("INSERT INTO public.ldr_one_sandbox_customer_members(user_id,customer_id,verified) VALUES($1,$2,true)",[user,customer]);
 await db.query("INSERT INTO public.ldr_one_sandbox_invited_users(user_id,customer_id,email,password_hash,verified,disabled) VALUES($1,$2,$3,$4,true,false)",[user,customer,email,await hashSandboxPassword(password)]);
 const login=await loginInvitedSandboxUser({email,password,db,env});if(!login?.token)throw Error("Private login failed");
 const identity=await verifyInvitedSandboxSession({token:login.token,db,env});if(identity?.userId!==user||identity?.customerId!==customer)throw Error("Session identity mismatch");
 if(await loginInvitedSandboxUser({email,password:"incorrect-password",db,env}))throw Error("Invalid password accepted");
 await db.query("UPDATE public.ldr_one_sandbox_customer_members SET verified=false WHERE user_id=$1",[user]);
 if(await verifyInvitedSandboxSession({token:login.token,db,env}))throw Error("Unverified membership accepted");
 await db.query("UPDATE public.ldr_one_sandbox_customer_members SET verified=true WHERE user_id=$1",[user]);
 if(!await logoutInvitedSandboxSession({token:login.token,db,env}))throw Error("Logout failed");
 if(await verifyInvitedSandboxSession({token:login.token,db,env}))throw Error("Revoked session accepted");
 console.log("LDR ONE SANDBOX PRIVATE LOGIN DB SELFTEST VERIFIED; ALL TEST DATA ROLLED BACK");
}finally{if(began)await db.query("ROLLBACK");await db.end();}
