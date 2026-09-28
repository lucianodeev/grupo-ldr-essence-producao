// Sandbox-only opaque session primitives. Not mounted to public HTTP routes.
import {createHash,randomBytes,timingSafeEqual} from "node:crypto";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tokenPattern=/^[a-f0-9]{64}$/;
export function issueSandboxSession({identity,now=Date.now(),ttlMs=30*60*1000,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_SESSION_ENABLED!=="true")throw Error("Sandbox sessions disabled");
 if(identity?.verified!==true||!uuid.test(identity.userId??"")||!uuid.test(identity.customerId??"")||!Number.isSafeInteger(now)||!Number.isSafeInteger(ttlMs)||ttlMs<60000||ttlMs>30*60*1000)throw Error("Invalid sandbox session request");
 const token=randomBytes(32).toString("hex");
 return {token,tokenHash:createHash("sha256").update(token).digest("hex"),userId:identity.userId,customerId:identity.customerId,expiresAt:new Date(now+ttlMs)};
}
export async function persistSandboxSession({db,session,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_SESSION_ENABLED!=="true"||typeof db?.query!=="function"||!tokenPattern.test(session?.tokenHash??"")||!uuid.test(session?.userId??"")||!uuid.test(session?.customerId??"")||!(session.expiresAt instanceof Date)||Number.isNaN(session.expiresAt.valueOf()))throw Error("Sandbox session persistence unavailable");
 await db.query("INSERT INTO public.ldr_one_sandbox_sessions(token_hash,user_id,customer_id,expires_at) VALUES($1,$2,$3,$4)",[session.tokenHash,session.userId,session.customerId,session.expiresAt]);
}
export async function resolveSandboxSession({db,token,env,now=Date.now(),resolveCustomer}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_SESSION_ENABLED!=="true"||typeof db?.query!=="function"||typeof resolveCustomer!=="function"||!tokenPattern.test(token??""))return null;
 const tokenHash=createHash("sha256").update(token).digest("hex");
 const result=await db.query("SELECT user_id,customer_id,expires_at FROM public.ldr_one_sandbox_sessions WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>$2 LIMIT 2",[tokenHash,new Date(now)]);
 if(result.rows.length!==1)return null;
 const row=result.rows[0];if(!uuid.test(row.user_id??"")||!uuid.test(row.customer_id??"")||new Date(row.expires_at).valueOf()<=now)return null;
 const membership=await resolveCustomer({userId:row.user_id});
 if(membership?.verified!==true||membership.customerId!==row.customer_id)return null;
 return {verified:true,userId:row.user_id,customerId:row.customer_id};
}
export async function revokeSandboxSession({db,token,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_SESSION_ENABLED!=="true"||typeof db?.query!=="function"||!tokenPattern.test(token??""))return false;
 const hash=createHash("sha256").update(token).digest("hex");
 await db.query("UPDATE public.ldr_one_sandbox_sessions SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL",[hash]);
 return true;
}
export const sandboxSessionCookie={name:"ldr_one_sandbox_session",httpOnly:true,secure:true,sameSite:"Strict",path:"/",maxAge:1800};
