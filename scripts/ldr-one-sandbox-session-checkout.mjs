// Private sandbox-only adapter. Not mounted on a public route.
// Checkout uses the server-resolved opaque session, never client-provided identity.
import {verifyInvitedSandboxSession} from "./ldr-one-sandbox-login-service.mjs";
import {handleAuthenticatedSandboxCheckout} from "./ldr-one-sandbox-authenticated-checkout.mjs";
const origin="https://ldr-one-stripe-sandbox.onrender.com";
const cookieName="ldr_one_sandbox_session";
function extractSessionCookie(request){
 const header=request.headers.get("cookie")||"";
 const matches=header.split(";").map(x=>x.trim()).filter(x=>x.startsWith(cookieName+"="));
 if(matches.length!==1)return null;
 const token=matches[0].slice(cookieName.length+1);
 return /^[a-f0-9]{64}$/.test(token)?token:null;
}
export async function handleSessionBoundSandboxCheckout({request,db,env,stripe,fetcher=fetch,now=Date.now()}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED!=="true"||env?.LDR_ONE_SANDBOX_SESSION_ENABLED!=="true"||env?.LDR_ONE_SANDBOX_CHECKOUT_ENABLED!=="true")return {status:503,body:{ok:false,error:"Sandbox checkout disabled"}};
 if(!request||new URL(request.url).origin!==origin||request.headers.get("origin")!==origin||request.headers.get("x-ldr-one-csrf")!=="1")return {status:403,body:{ok:false,error:"Request not permitted"}};
 return handleAuthenticatedSandboxCheckout({request,db,env,stripe,fetcher,authenticate:async()=>{
  const token=extractSessionCookie(request);
  return token?verifyInvitedSandboxSession({token,db,env,now}):null;
 }});
}
