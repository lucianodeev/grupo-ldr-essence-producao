// Read-only subscription status boundary; no entitlement is inferred from checkout redirects.
import {getSandboxCustomerSubscriptions} from "./ldr-one-sandbox-customer-subscriptions.mjs";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
const origin="https://ldr-one-stripe-sandbox.onrender.com";
export async function handleSandboxSubscriptionStatus({request,authenticate,db,env}){
 if(env?.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||
    env?.LDR_ONE_SANDBOX_STATUS_API_ENABLED!=="true")
  return {status:503,body:{error:"Sandbox status disabled"}};
 const url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==origin||url.search||request.headers.get("origin")!==origin)
  return {status:403,body:{error:"Request forbidden"}};
 const identity=await authenticate(request);
 if(identity?.verified!==true)return {status:401,body:{error:"Authentication required"}};
 try{
  const [subscriptions,entitlement]=await Promise.all([
   getSandboxCustomerSubscriptions({db,identity}),
   checkSandboxEntitlement({db,identity})
  ]);
  return {status:200,body:{subscriptions,entitlement}};
 }catch{return {status:403,body:{error:"Status unavailable"};}}
}
