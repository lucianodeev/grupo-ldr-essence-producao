// One-shot isolated integration: real private invite login -> authenticated checkout -> Stripe TEST -> expire.
// Test identities are transactional and rolled back. No card, public route, or entitlement.
import {randomUUID} from "node:crypto";
import {hashSandboxPassword} from "./ldr-one-sandbox-local-auth.mjs";
import {loginInvitedSandboxUser} from "./ldr-one-sandbox-login-service.mjs";
import {handleSessionBoundSandboxCheckout} from "./ldr-one-sandbox-session-checkout.mjs";
import {resolveSandboxStripeConfig} from "./ldr-one-sandbox-stripe-config.mjs";
import {readFile} from "node:fs/promises";
const service="srv-das6drvavr4c7397dflg",origin="https://ldr-one-stripe-sandbox.onrender.com";
if(process.env.RENDER_SERVICE_ID!==service||process.env.LDR_ONE_SANDBOX_AUTH_CHECKOUT_SELFTEST!=="yes")throw Error("Isolated selftest disabled");
const forbidden=["LDR_ONE_ALLOW_SANDBOX_MIGRATION","LDR_ONE_SANDBOX_CUSTOMER_MIGRATION","LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION","LDR_ONE_SANDBOX_LOGIN_DB_SELFTEST","LDR_ONE_SANDBOX_REAL_DELIVERY_PROBE"];
if(forbidden.some(k=>process.env[k]==="yes"))throw Error("Conflicting sandbox operation");
const url=new URL(process.env.DATABASE_URL??"");if(!["postgres:","postgresql:"].includes(url.protocol)||decodeURIComponent(url.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
const {default:pg}=await import(process.env.LDR_ONE_PG_MODULE_URL||"pg");
const db=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
const env={...process.env,LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED:"true",LDR_ONE_SANDBOX_SESSION_ENABLED:"true",LDR_ONE_SANDBOX_CHECKOUT_ENABLED:"true"};
const selection={plan:"individual",cycle:"monthly",seats:1};
const {secret,priceId}=resolveSandboxStripeConfig(env,selection);
let sessionId=null,started=false;
async function stripe(path,params,options={}){
 const res=await fetch("https://api.stripe.com/v1/"+path,{method:"POST",headers:{Authorization:"Bearer "+secret,"Content-Type":"application/x-www-form-urlencoded",...(options.idempotencyKey?{"Idempotency-Key":options.idempotencyKey}:{})},body:params,signal:AbortSignal.timeout(15000)});
 if(!res.ok)throw Error("Stripe TEST HTTP "+res.status);return res.json();
}
try{
 await db.connect();const check=await db.query("SELECT current_database() AS name");if(check.rows[0]?.name!=="ldr_one_sandbox_db")throw Error("Database mismatch");
 await db.query("BEGIN");started=true;
 for(const name of ["ldr-one-sandbox-invite-auth-REVIEW-ONLY.sql","ldr-one-sandbox-sessions-REVIEW-ONLY.sql"]){await db.query(await readFile(new URL("../docs/ldr-pass/sql/"+name,import.meta.url),"utf8"));}
 const user=randomUUID(),customer=randomUUID(),email="checkout-"+randomUUID()+"@example.invalid",password="test-"+randomUUID();
 await db.query("INSERT INTO public.ldr_one_sandbox_customer_members(user_id,customer_id,verified) VALUES($1,$2,true)",[user,customer]);
 await db.query("INSERT INTO public.ldr_one_sandbox_invited_users(user_id,customer_id,email,password_hash,verified,disabled) VALUES($1,$2,$3,$4,true,false)",[user,customer,email,await hashSandboxPassword(password)]);
 const login=await loginInvitedSandboxUser({email,password,db,env});if(!login?.token)throw Error("Private login failed");
 const request=new Request(origin+"/internal/checkout",{method:"POST",headers:{origin,"content-type":"application/json","x-ldr-one-csrf":"1",cookie:"ldr_one_sandbox_session="+login.token},body:JSON.stringify(selection)});
 const result=await handleSessionBoundSandboxCheckout({request,db,env,stripe:async(params,options)=>{const created=await stripe("checkout/sessions",params,options);sessionId=created.id;return created;}});
 if(result.status!==200||!sessionId||!result.body.url.startsWith("https://checkout.stripe.com/"))throw Error("Authenticated Stripe TEST checkout failed");
 const row=await db.query("SELECT customer_id,user_id,status,stripe_checkout_session_id FROM public.ldr_one_sandbox_subscriptions WHERE stripe_checkout_session_id=$1",[sessionId]);
 if(row.rows.length!==1||row.rows[0].customer_id!==customer||row.rows[0].user_id!==user||row.rows[0].status!=="pending")throw Error("Customer-scoped pending checkout mismatch");
 const expired=await stripe("checkout/sessions/"+encodeURIComponent(sessionId)+"/expire",new URLSearchParams());if(expired.status!=="expired")throw Error("Stripe TEST expiration failed");sessionId=null;
 console.log("LDR ONE SANDBOX AUTHENTICATED REAL STRIPE TEST CHECKOUT VERIFIED");
}catch{console.error("LDR ONE SANDBOX AUTHENTICATED REAL STRIPE TEST CHECKOUT FAILED");process.exitCode=1;
}finally{
 if(sessionId){try{await stripe("checkout/sessions/"+encodeURIComponent(sessionId)+"/expire",new URLSearchParams());}catch{console.error("TEST checkout requires manual expiration");process.exitCode=1;}}
 if(started){try{await db.query("ROLLBACK");console.log("LDR ONE SANDBOX AUTH CHECKOUT DB ROLLBACK VERIFIED");}catch{process.exitCode=1;}}
 await db.end();
}
