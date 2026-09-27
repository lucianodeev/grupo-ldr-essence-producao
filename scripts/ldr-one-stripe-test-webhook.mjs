// One-time isolated customer directory migration; disabled on ordinary startup.
if(process.env.LDR_ONE_SANDBOX_CUSTOMER_MIGRATION==="yes"){
 if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||
    ["LDR_ONE_ALLOW_SANDBOX_MIGRATION","LDR_ONE_SANDBOX_DB_SMOKE","LDR_ONE_SANDBOX_EVENT_INTEGRATION","LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION"].some(k=>process.env[k]==="yes"))
  throw Error("Customer directory migration guard");
 const {execFileSync}=await import("node:child_process");
 try{
  execFileSync("npm",["install","--prefix","/tmp/ldr-one-migration","--no-package-lock","--ignore-scripts","--omit=dev","pg"],{cwd:"/tmp",timeout:60000,stdio:"pipe"});
  const result=execFileSync(process.execPath,["scripts/ldr-one-sandbox-customer-migrate.mjs"],{
   cwd:process.cwd(),timeout:30000,stdio:"pipe",
   env:{...process.env,LDR_ONE_PG_MODULE_URL:"file:///tmp/ldr-one-migration/node_modules/pg/lib/index.js"}
  }).toString();
  if(!result.includes("LDR ONE SANDBOX CUSTOMER DIRECTORY VERIFIED"))throw Error("Verification missing");
  console.log("LDR ONE SANDBOX CUSTOMER DIRECTORY VERIFIED");
 }catch{console.error("LDR ONE SANDBOX CUSTOMER DIRECTORY FAILED");process.exit(1);}
}
// Optional one-time migration for isolated Render free web service.
// Must never run on ordinary startup; fails closed if explicitly requested migration fails.
if (process.env.LDR_ONE_ALLOW_SANDBOX_MIGRATION === "yes") {
  if (process.env.RENDER_SERVICE_ID !== "srv-das6drvavr4c7397dflg") {
    throw Error("Migration refused: wrong Render service");
  }
  const { execFileSync } = await import("node:child_process");
  let stage = "dependency-install";
  try {
    execFileSync("npm", ["install", "--prefix", "/tmp/ldr-one-migration", "--no-package-lock", "--ignore-scripts", "--omit=dev", "pg"], {
      cwd: "/tmp", timeout: 60000, stdio: "pipe"
    });
    stage = "database-migration";
    const migration = execFileSync(process.execPath, ["scripts/ldr-one-sandbox-migrate.mjs"], {
      cwd: process.cwd(), timeout: 30000, stdio: "pipe",
      env: { ...process.env, LDR_ONE_PG_MODULE_URL: "file:///tmp/ldr-one-migration/node_modules/pg/lib/index.js" }
    });
    if (!migration.toString().includes("LDR ONE isolated sandbox schema verified")) throw Error("Migration verification missing");
    console.log("LDR ONE SANDBOX MIGRATION VERIFIED");
  } catch {
    console.error("LDR ONE SANDBOX MIGRATION FAILED at stage: " + stage + "; no receiver started");
    process.exit(1);
  }
}
// Optional read-only database verification, never enabled during normal startup.
if (process.env.LDR_ONE_SANDBOX_DB_SMOKE === "yes") {
  if (process.env.LDR_ONE_ALLOW_SANDBOX_MIGRATION === "yes") throw Error("Conflicting sandbox operations");
  if (process.env.RENDER_SERVICE_ID !== "srv-das6drvavr4c7397dflg") throw Error("Wrong sandbox service");
  const { execFileSync } = await import("node:child_process");
  try {
    execFileSync("npm", ["install", "--prefix", "/tmp/ldr-one-migration", "--no-package-lock", "--ignore-scripts", "--omit=dev", "pg"], {cwd:"/tmp",timeout:60000,stdio:"pipe"});
    const output = execFileSync(process.execPath, ["scripts/ldr-one-sandbox-db-smoke.mjs"], {
      cwd:process.cwd(),timeout:30000,stdio:"pipe",
      env:{...process.env,LDR_ONE_PG_MODULE_URL:"file:///tmp/ldr-one-migration/node_modules/pg/lib/index.js"}
    });
    if (!output.toString().includes("LDR ONE SANDBOX DB SMOKE VERIFIED")) throw Error("Verification missing");
    console.log("LDR ONE SANDBOX DB SMOKE VERIFIED");
  } catch {
    console.error("LDR ONE SANDBOX DB SMOKE FAILED; no receiver started");
    process.exit(1);
  }
}
// One-time rollback-only database event integration; never on regular boot.
if (process.env.LDR_ONE_SANDBOX_EVENT_INTEGRATION === "yes") {
  if (process.env.RENDER_SERVICE_ID !== "srv-das6drvavr4c7397dflg" ||
      process.env.LDR_ONE_ALLOW_SANDBOX_MIGRATION === "yes") throw Error("Integration test guard");
  const { execFileSync } = await import("node:child_process");
  try {
    execFileSync("npm", ["install", "--prefix", "/tmp/ldr-one-migration", "--no-package-lock", "--ignore-scripts", "--omit=dev", "pg"], {cwd:"/tmp",timeout:60000,stdio:"pipe"});
    const result=execFileSync(process.execPath,["scripts/ldr-one-sandbox-event-integration.mjs"],{
      cwd:process.cwd(),timeout:30000,stdio:"pipe",
      env:{...process.env,LDR_ONE_PG_MODULE_URL:"file:///tmp/ldr-one-migration/node_modules/pg/lib/index.js"}
    });
    if(!result.toString().includes("LDR ONE SANDBOX EVENT INTEGRATION VERIFIED"))throw Error("Integration verification missing");
    console.log("LDR ONE SANDBOX EVENT INTEGRATION VERIFIED");
  } catch {
    console.error("LDR ONE SANDBOX EVENT INTEGRATION FAILED; receiver not started");
    process.exit(1);
  }
}
// One-shot real Stripe TEST checkout integration, never run on ordinary startup.
if(process.env.LDR_ONE_SANDBOX_CHECKOUT_INTEGRATION==="yes"){
 if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg")throw Error("Wrong sandbox service");
 const {execFileSync}=await import("node:child_process");
 try{
  execFileSync("npm",["install","--prefix","/tmp/ldr-one-migration","--no-package-lock","--ignore-scripts","--omit=dev","pg"],{cwd:"/tmp",timeout:60000,stdio:"pipe"});
  const result=execFileSync(process.execPath,["scripts/ldr-one-sandbox-checkout-integration.mjs"],{
   cwd:process.cwd(),timeout:60000,stdio:"pipe",
   env:{...process.env,LDR_ONE_PG_MODULE_URL:"file:///tmp/ldr-one-migration/node_modules/pg/lib/index.js"}
  }).toString();
  if(!result.includes("LDR ONE SANDBOX REAL TEST CHECKOUT DB INTEGRATION VERIFIED")||
     !result.includes("LDR ONE SANDBOX REAL TEST CHECKOUT CLEANUP VERIFIED"))throw Error("Verification incomplete");
  console.log("LDR ONE SANDBOX REAL TEST CHECKOUT DB INTEGRATION VERIFIED");
  console.log("LDR ONE SANDBOX REAL TEST CHECKOUT CLEANUP VERIFIED");
 }catch{console.error("LDR ONE SANDBOX REAL TEST CHECKOUT DB INTEGRATION FAILED");process.exit(1);}
}
// Isolated Stripe test webhook receiver. Does not persist, grant access or call Stripe.
// Never deploy on the production app or configure live-mode events here.
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
// Safe startup diagnostics; never log database URL, hostname, user or password.
const databaseUrl = process.env.DATABASE_URL;
let dbConfig = "missing";
if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    dbConfig = ["postgres:","postgresql:"].includes(parsed.protocol)
      && decodeURIComponent(parsed.pathname.slice(1)) === "ldr_one_sandbox_db"
      ? "configured-for-sandbox" : "invalid-or-wrong-database";
  } catch { dbConfig = "invalid-or-wrong-database"; }
}
console.log("LDR ONE SANDBOX DB CONFIG: " + dbConfig);
// Persistence is explicitly opt-in, sandbox-only, and requires the private database.
const persistSandboxEvents=process.env.LDR_ONE_SANDBOX_PERSIST_EVENTS==="yes";
let eventDb=null;
if(persistSandboxEvents){
  if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg")throw Error("Sandbox persistence forbidden on other services");
  const dbUrl=process.env.DATABASE_URL;
  if(!dbUrl)throw Error("Private sandbox database required");
  const parsed=new URL(dbUrl);
  if(!["postgres:","postgresql:"].includes(parsed.protocol)||decodeURIComponent(parsed.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
  const {execFileSync}=await import("node:child_process");
  execFileSync("npm",["install","--prefix","/tmp/ldr-one-migration","--no-package-lock","--ignore-scripts","--omit=dev","pg"],{cwd:"/tmp",timeout:60000,stdio:"pipe"});
  const {default:pg}=await import("file:///tmp/ldr-one-migration/node_modules/pg/lib/index.js");
  eventDb=new pg.Pool({connectionString:dbUrl,max:2,connectionTimeoutMillis:5000,statement_timeout:10000});
  const check=await eventDb.query("SELECT current_database() AS db");
  if(check.rows[0]?.db!=="ldr_one_sandbox_db")throw Error("Sandbox database identity mismatch");
  console.log("LDR ONE SANDBOX EVENT PERSISTENCE READY");
}
const secret=process.env.LDR_ONE_STRIPE_TEST_WEBHOOK_SECRET ?? "";
const ready=/^whsec_[A-Za-z0-9]+$/.test(secret);
if(!ready)console.log("Sandbox receiver started in setup-only mode; all webhook POST requests are blocked until test signing secret is configured.");
const port=Number(process.env.PORT || 10000);
createServer(async(req,res)=>{
  if(req.url==="/health"&&req.method==="GET"){res.writeHead(200);res.end("sandbox only");return;}
  if(req.url!=="/stripe/test-webhook"||req.method!=="POST"){res.writeHead(404);res.end();return;}
  if(!ready){res.writeHead(503);res.end("Sandbox webhook not configured");return;}
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>1024*1024){res.writeHead(413);res.end();return;}chunks.push(chunk);}
  const raw=Buffer.concat(chunks);
  const header=req.headers["stripe-signature"];
  const fields=String(header??"").split(",").map(x=>x.trim());
  const timestamp=fields.find(x=>x.startsWith("t="))?.slice(2);
  const signatures=fields.filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
  if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300){
    res.writeHead(400);res.end("Invalid signature timestamp");return;
  }
  const expected=createHmac("sha256",secret).update(timestamp+".").update(raw).digest();
  const verified=signatures.some(x=>/^[a-f0-9]{64}$/i.test(x)&&timingSafeEqual(Buffer.from(x,"hex"),expected));
  if(!verified){res.writeHead(400);res.end("Invalid signature");return;}
  let event;
  try{event=JSON.parse(raw.toString("utf8"));}catch{res.writeHead(400);res.end("Invalid JSON");return;}
  if(event?.livemode!==false){res.writeHead(400);res.end("Only test events accepted");return;}
  if(persistSandboxEvents){
    let client;
    try{
      const {processSignedSandboxEvent}=await import("./ldr-one-sandbox-webhook-bridge.mjs");
      client=await eventDb.connect();
      const outcome=await processSignedSandboxEvent(client,event);
      console.log(JSON.stringify({sandbox:true,eventType:String(event.type??"unknown"),persisted:outcome.handled===true}));
    }catch{
      console.error("LDR ONE SANDBOX SIGNED EVENT PERSISTENCE FAILED");
      res.writeHead(500);res.end("Sandbox persistence unavailable");return;
    }finally{client?.release();}
  }else{
    console.log(JSON.stringify({sandbox:true,eventType:String(event.type??"unknown"),received:true,persisted:false}));
  }
  res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({received:true,sandbox:true}));
}).listen(port,"0.0.0.0",async()=>{
  console.log("Isolated test webhook listening");
  // Explicit one-shot test: local signed HTTP delivery and cleanup of synthetic rows.
  if(process.env.LDR_ONE_SANDBOX_SIGNED_HTTP_SELFTEST!=="yes")return;
  if(!persistSandboxEvents||!ready||process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"){
    console.error("LDR ONE SIGNED HTTP SELFTEST GUARD FAILED");process.exitCode=1;return;
  }
  const {randomUUID}=await import("node:crypto");
  const recordId=randomUUID(),customerId=randomUUID(),userId=randomUUID();
  const evtId="evt_"+randomUUID().replaceAll("-","");
  let created=false;
  try{
    await eventDb.query("INSERT INTO public.ldr_one_sandbox_subscriptions(id,customer_id,user_id,plan,billing_cycle,seats) VALUES($1,$2,$3,'individual','monthly',1)",[recordId,customerId,userId]);
    created=true;
    const body=JSON.stringify({id:evtId,created:Math.floor(Date.now()/1000),livemode:false,type:"customer.subscription.updated",data:{object:{id:"sub_"+randomUUID().replaceAll("-",""),status:"active",metadata:{sandbox:"true",checkout_kind:"ldr_one_subscription",ldr_one_subscription_id:recordId,customer_id:customerId}}}});
    const deliver=async()=>{
      const stamp=Math.floor(Date.now()/1000);
      const signature=createHmac("sha256",secret).update(stamp+"."+body).digest("hex");
      return fetch("http://127.0.0.1:"+port+"/stripe/test-webhook",{method:"POST",headers:{"stripe-signature":"t="+stamp+",v1="+signature},body,signal:AbortSignal.timeout(10000)});
    };
    const first=await deliver();
    if(first.status!==200)throw Error("Signed delivery rejected");
    const status=await eventDb.query("SELECT status FROM public.ldr_one_sandbox_subscriptions WHERE id=$1",[recordId]);
    if(status.rows[0]?.status!=="active")throw Error("Activation missing");
    const second=await deliver();
    if(second.status!==200)throw Error("Duplicate delivery rejected");
    const count=await eventDb.query("SELECT count(*)::int AS n FROM public.ldr_one_sandbox_stripe_events WHERE stripe_event_id=$1",[evtId]);
    if(count.rows[0]?.n!==1)throw Error("Duplicate event inserted");
    console.log("LDR ONE SANDBOX SIGNED HTTP SELFTEST VERIFIED");
  }catch{
    console.error("LDR ONE SANDBOX SIGNED HTTP SELFTEST FAILED");
    process.exitCode=1;
  }finally{
    if(created){
      try{
        await eventDb.query("DELETE FROM public.ldr_one_sandbox_stripe_events WHERE subscription_id=$1",[recordId]);
        await eventDb.query("DELETE FROM public.ldr_one_sandbox_subscriptions WHERE id=$1",[recordId]);
        console.log("LDR ONE SANDBOX SIGNED HTTP SELFTEST CLEANUP VERIFIED");
      }catch{console.error("LDR ONE SANDBOX SIGNED HTTP SELFTEST CLEANUP FAILED");process.exitCode=1;}
    }
  }
});
