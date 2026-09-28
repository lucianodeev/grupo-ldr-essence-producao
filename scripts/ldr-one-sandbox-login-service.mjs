// Private sandbox-only login orchestration. Never mounted to a public route.
import {authenticateInvitedSandboxUser} from "./ldr-one-sandbox-local-auth.mjs";
import {issueSandboxSession,persistSandboxSession,resolveSandboxSession,revokeSandboxSession} from "./ldr-one-sandbox-sessions.mjs";
import {createSandboxCustomerResolver} from "./ldr-one-sandbox-customer-directory.mjs";
const service="srv-das6drvavr4c7397dflg";
function ready(env,db){return env?.RENDER_SERVICE_ID===service&&env?.LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED==="true"&&env?.LDR_ONE_SANDBOX_SESSION_ENABLED==="true"&&typeof db?.query==="function";}
export async function loginInvitedSandboxUser({email,password,db,env,now=Date.now()}){
 if(!ready(env,db))return null;
 const resolveCustomer=createSandboxCustomerResolver({db,env});
 const identity=await authenticateInvitedSandboxUser({email,password,db,env,resolveCustomer});
 if(!identity)return null;
 const session=issueSandboxSession({identity,now,env});
 await persistSandboxSession({db,session,env});
 return {token:session.token,expiresAt:session.expiresAt};
}
export async function verifyInvitedSandboxSession({token,db,env,now=Date.now()}){
 if(!ready(env,db))return null;
 return resolveSandboxSession({token,db,env,now,resolveCustomer:createSandboxCustomerResolver({db,env})});
}
export async function logoutInvitedSandboxSession({token,db,env}){
 if(!ready(env,db))return false;
 return revokeSandboxSession({token,db,env});
}
