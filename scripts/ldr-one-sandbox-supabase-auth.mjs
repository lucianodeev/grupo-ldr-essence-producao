// Sandbox-only trusted Supabase JWT verification; no production credentials or user-supplied identity claims.
// Requires explicitly configured sandbox issuer, audience and pinned HTTPS JWKS URL.
// Customer association MUST be resolved separately by a trusted sandbox-only directory.
import {createPublicKey,verify as verifySignature} from "node:crypto";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const decode=value=>{if(typeof value!=="string"||!value||value.length>8192||!/^[A-Za-z0-9_-]+$/.test(value))throw Error("Invalid token");return JSON.parse(Buffer.from(value,"base64url").toString("utf8"));};
export async function authenticateSandboxSupabase({request,env,fetcher=fetch,resolveCustomer}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||env?.LDR_ONE_SANDBOX_AUTH_ENABLED!=="true")throw Error("Sandbox auth disabled");
 const issuer=env.LDR_ONE_SANDBOX_AUTH_ISSUER,audience=env.LDR_ONE_SANDBOX_AUTH_AUDIENCE,jwksUrl=env.LDR_ONE_SANDBOX_AUTH_JWKS_URL;
 if(typeof issuer!=="string"||typeof audience!=="string"||!audience||typeof jwksUrl!=="string"||typeof resolveCustomer!=="function")throw Error("Trusted sandbox auth configuration missing");
 const expected=new URL(issuer),keys=new URL(jwksUrl);
 if(expected.protocol!=="https:"||expected.username||expected.password||expected.search||expected.hash||keys.protocol!=="https:"||keys.origin!==expected.origin||keys.username||keys.password||keys.search||keys.hash)throw Error("Invalid sandbox issuer or JWKS origin");
 const authorization=request?.headers?.get("authorization")??"";
 if(!/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization)||authorization.length>12000)return null;
 try{
  const token=authorization.slice(7),parts=token.split("."),header=decode(parts[0]),payload=decode(parts[1]);
  if(!["RS256","ES256"].includes(header.alg)||typeof header.kid!=="string"||!header.kid||header.typ&&header.typ!=="JWT")return null;
  const now=Math.floor(Date.now()/1000);
  if(payload.iss!==issuer||!(payload.aud===audience||Array.isArray(payload.aud)&&payload.aud.includes(audience))||!uuid.test(payload.sub??"")||typeof payload.exp!=="number"||payload.exp<=now||typeof payload.iat!=="number"||payload.iat>now+60||payload.nbf!==undefined&&(typeof payload.nbf!=="number"||payload.nbf>now))return null;
  const response=await fetcher(jwksUrl,{headers:{accept:"application/json"},signal:AbortSignal.timeout(5000),redirect:"error"});
  if(!response.ok)return null;
  const body=await response.text();if(Buffer.byteLength(body)>65536)return null;
  const jwks=JSON.parse(body),key=jwks.keys?.find(k=>k.kid===header.kid&&k.use==="sig"&&k.alg===header.alg&&(
   header.alg==="RS256"
    ? k.kty==="RSA"&&typeof k.n==="string"&&typeof k.e==="string"
    : k.kty==="EC"&&k.crv==="P-256"&&typeof k.x==="string"&&typeof k.y==="string"
  ));
  if(!key)return null;
  const publicKey=createPublicKey({key,format:"jwk"});
  // JOSE ECDSA signatures are fixed-width R || S, not ASN.1 DER.
  const valid=verifySignature("sha256",Buffer.from(parts[0]+"."+parts[1]),header.alg==="ES256"?{key:publicKey,dsaEncoding:"ieee-p1363"}:publicKey,Buffer.from(parts[2],"base64url"));
  if(!valid)return null;
  const customer=await resolveCustomer({userId:payload.sub});
  if(!customer||!uuid.test(customer.customerId??"")||customer.verified!==true)return null;
  return {verified:true,userId:payload.sub,customerId:customer.customerId,email:typeof payload.email==="string"?payload.email:null};
 }catch{return null;}
}
