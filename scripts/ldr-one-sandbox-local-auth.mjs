// Dedicated sandbox-only credential verifier. No public registration or production identity reuse.
// The caller must retrieve an explicitly invited and verified account from the private sandbox DB.
import {scrypt as scryptCallback,timingSafeEqual,randomBytes} from "node:crypto";
import {promisify} from "node:util";
const scrypt=promisify(scryptCallback);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function hashSandboxPassword(password,{salt=randomBytes(32)}={}){
 if(typeof password!=="string"||password.length<14||Buffer.byteLength(password)>1024||salt.length!==32)throw Error("Invalid sandbox password");
 const derived=await scrypt(password,salt,64,{N:16384,r:8,p:1,maxmem:32*1024*1024});
 return "scrypt-v1:"+salt.toString("hex")+":"+derived.toString("hex");
}
export async function verifySandboxPassword(password,stored){
 if(typeof password!=="string"||Buffer.byteLength(password)>1024||typeof stored!=="string")return false;
 const match=/^scrypt-v1:([a-f0-9]{64}):([a-f0-9]{128})$/.exec(stored);
 if(!match)return false;
 try{const actual=await scrypt(password,Buffer.from(match[1],"hex"),64,{N:16384,r:8,p:1,maxmem:32*1024*1024});return timingSafeEqual(actual,Buffer.from(match[2],"hex"));}catch{return false;}
}
export async function authenticateInvitedSandboxUser({email,password,db,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_LOCAL_AUTH_ENABLED!=="true")return null;
 if(!db||typeof db.query!=="function"||typeof email!=="string"||email.length>254||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||typeof password!=="string")return null;
 const normalized=email.trim().toLowerCase();
 const result=await db.query("SELECT user_id,customer_id,password_hash FROM public.ldr_one_sandbox_invited_users WHERE email=$1 AND verified=true AND disabled=false LIMIT 2",[normalized]);
 if(result.rows.length!==1)return null;
 const row=result.rows[0];if(!safeUuid.test(row.user_id??"")||!safeUuid.test(row.customer_id??"")||!await verifySandboxPassword(password,row.password_hash))return null;
 // No tokens or session issued here: require separate secure session transport before mounting a login route.
 return {verified:true,userId:row.user_id,customerId:row.customer_id};
}
