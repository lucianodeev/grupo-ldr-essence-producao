// Read-only subscription status boundary; no entitlement is inferred from checkout redirects.
import {getSandboxCustomerSubscriptions} from "./ldr-one-sandbox-customer-subscriptions.mjs";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
const origin="https://ldr-one-stripe-sandbox.onrender.com";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function handleSandboxSubscriptionStatus({request,authenticate,db,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||
    env?.LDR_ONE_SANDBOX_STATUS_API_ENABLED!=="true")
  return {status:503,body:{error:"Sandbox status disabled"}};
 const url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==origin||url.pathname!=="/status"||url.search||url.hash||request.headers.get("origin")!==origin)
  return {status:403,body:{error:"Request forbidden"}};
 if(typeof authenticate!=="function"||!db||typeof db.query!=="function")return {status:503,body:{error:"Trusted status dependencies unavailable"}};
 let identity;
 try{identity=await authenticate(request);}catch{return {status:401,body:{error:"Authentication failed"}};}
 if(identity?.verified!==true||!uuid.test(identity.userId??"")||!uuid.test(identity.customerId??""))return {status:401,body:{error:"Authentication required"}};
 try{
  const [subscriptions,entitlement]=await Promise.all([
   getSandboxCustomerSubscriptions({db,identity}),
   checkSandboxEntitlement({db,identity})
  ]);
  return {status:200,body:{subscriptions,entitlement}};
 }catch{return {status:403,body:{error:"Status unavailable"}};}
}
