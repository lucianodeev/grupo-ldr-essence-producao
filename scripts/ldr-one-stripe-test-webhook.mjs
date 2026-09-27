// Optional one-time migration for isolated Render free web service.
// Must never run on ordinary startup; fails closed if explicitly requested migration fails.
if (process.env.LDR_ONE_ALLOW_SANDBOX_MIGRATION === "yes") {
  if (process.env.RENDER_SERVICE_ID !== "srv-das6drvavr4c7397dflg") {
    throw Error("Migration refused: wrong Render service");
  }
  const { execFileSync } = await import("node:child_process");
  try {
    execFileSync("npm", ["install", "--no-save", "--no-package-lock", "--ignore-scripts", "pg"], {
      cwd: process.cwd(), timeout: 120000, stdio: "pipe"
    });
    execFileSync(process.execPath, ["scripts/ldr-one-sandbox-migrate.mjs"], {
      cwd: process.cwd(), timeout: 30000, stdio: "pipe", env: process.env
    });
    console.log("LDR ONE SANDBOX MIGRATION VERIFIED");
  } catch {
    console.error("LDR ONE SANDBOX MIGRATION FAILED; no receiver started");
    process.exit(1);
  }
}
// Isolated Stripe test webhook receiver. Does not persist, grant access or call Stripe.
// Never deploy on the production app or configure live-mode events here.
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
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
  console.log(JSON.stringify({sandbox:true,eventType:String(event.type??"unknown"),received:true}));
  // Intentionally do not grant entitlements; integration testing requires an isolated database.
  res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({received:true,sandbox:true}));
}).listen(port,"0.0.0.0",()=>console.log("Isolated test webhook listening"));
