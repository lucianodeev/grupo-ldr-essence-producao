// Server-only adapter for the isolated LDR ONE sandbox portal.
// Never imports production Supabase and never accepts customer/user IDs from the browser.
import {verifyInvitedSandboxSession,logoutInvitedSandboxSession} from "./ldr-one-sandbox-login-service.mjs";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
import {handleSessionBoundSandboxCheckout} from "./ldr-one-sandbox-session-checkout.mjs";
const service="srv-das6drvavr4c7397dflg",origin="https://ldr-one-stripe-sandbox.onrender.com",cookieName="ldr_one_sandbox_session";
function token(request){const h=request?.headers?.get("cookie")||"";const m=h.split(";").map(x=>x.trim()).filter(x=>x.startsWith(cookieName+"="));if(m.length!==1)return null;const t=m[0].slice(cookieName.length+1);return /^[a-f0-9]{64}$/.test(t)?t:null;}
async function identity({request,db,env,now}){const t=token(request);return t?verifyInvitedSandboxSession({token:t,db,env,now}):null;}
function ready(env,db){return env?.RENDER_SERVICE_ID===service&&env?.LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED==="true"&&env?.LDR_ONE_SANDBOX_SESSION_ENABLED==="true"&&typeof db?.query==="function";}
export async function getSandboxPortalAccess({request,db,env,now=Date.now()}){if(!ready(env,db))return {status:503,body:{allowed:false}};if(new URL(request.url).origin!==origin)return {status:403,body:{allowed:false}};const who=await identity({request,db,env,now});if(!who)return {status:401,body:{allowed:false}};const access=await checkSandboxEntitlement({db,identity:who});return {status:200,body:access};}
export async function startSandboxPortalCheckout(args){if(!ready(args.env,args.db))return {status:503,body:{ok:false}};return handleSessionBoundSandboxCheckout(args);}
export async function logoutSandboxPortal({request,db,env}){if(!ready(env,db)||new URL(request.url).origin!==origin||request.headers.get("origin")!==origin||request.headers.get("x-ldr-one-csrf")!=="1")return {status:403,body:{ok:false}};const t=token(request);if(!t)return {status:401,body:{ok:false}};return {status:await logoutInvitedSandboxSession({token:t,db,env})?200:401,body:{ok:true},clearCookie:cookieName+"=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"};}
