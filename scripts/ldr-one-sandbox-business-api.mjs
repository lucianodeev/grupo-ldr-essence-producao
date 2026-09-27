// Framework-neutral business API boundary; mount ONLY behind trusted session middleware.
// This is not a public HTTP server or an authorization provider.
import {listSandboxBusinessSeats} from "./ldr-one-sandbox-seat-roster.mjs";
import {assignSandboxBusinessSeat} from "./ldr-one-sandbox-business-seats.mjs";
import {revokeSandboxBusinessSeat} from "./ldr-one-sandbox-revoke-seat.mjs";
const service="srv-das6drvavr4c7397dflg";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function handleSandboxBusinessSeats({request,authenticate,verifyMember,db,env}){
 if(env?.RENDER_SERVICE_ID!==service||env?.LDR_ONE_SANDBOX_BUSINESS_API_ENABLED!=="true")
  return {status:503,body:{error:"Sandbox business API disabled"}};
 const url=new URL(request.url);
 if(url.origin!=="https://ldr-one-stripe-sandbox.onrender.com"||
    !["GET","POST","DELETE"].includes(request.method))
  return {status:403,body:{error:"Request forbidden"}};
 if(["POST","DELETE"].includes(request.method)&&
    (request.headers.get("origin")!==url.origin||request.headers.get("content-type")?.split(";")[0]?.trim()!=="application/json"))
  return {status:403,body:{error:"Request forbidden"}};
 const identity=await authenticate(request);
 if(identity?.verified!==true||identity?.businessAdmin!==true)
  return {status:403,body:{error:"Verified company administrator required"}};
 const subscriptionId=url.searchParams.get("subscriptionId");
 if(!uuid.test(subscriptionId??""))return {status:400,body:{error:"Invalid subscription"}};
 try{
  if(request.method==="GET"){
   const roster=await listSandboxBusinessSeats({db,identity,subscriptionId});
   return {status:200,body:roster};
  }
  if(Number(request.headers.get("content-length")??"0")>1024)return {status:413,body:{error:"Request too large"}};
  const raw=await request.text();
  if(Buffer.byteLength(raw)>1024)return {status:413,body:{error:"Request too large"}};
  let input;
  try{input=JSON.parse(raw);}catch{return {status:400,body:{error:"Invalid JSON"};}}
  if(!input||typeof input!=="object"||Array.isArray(input)||
     Object.keys(input).length!==1||!uuid.test(input.memberUserId??""))
   return {status:400,body:{error:"Invalid member"}};
  if(request.method==="POST"){
   if(typeof verifyMember!=="function")return {status:503,body:{error:"Membership directory unavailable"}};
   return {status:200,body:await assignSandboxBusinessSeat({db,identity,subscriptionId,memberUserId:input.memberUserId,verifyMember})};
  }
  return {status:200,body:await revokeSandboxBusinessSeat({db,identity,subscriptionId,memberUserId:input.memberUserId})};
 }catch{return {status:403,body:{error:"Operation not permitted"};}}
}
