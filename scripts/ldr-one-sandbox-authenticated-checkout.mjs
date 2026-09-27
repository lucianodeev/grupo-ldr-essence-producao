// Framework-neutral server-only boundary for future authenticated sandbox route.
// Identity MUST be returned by trusted session middleware, never parsed from request JSON.
import {resolveSandboxStripeConfig,verifySandboxPrice} from "./ldr-one-sandbox-stripe-config.mjs";
import {prepareSandboxCheckout} from "./ldr-one-sandbox-checkout-service.mjs";
const allowedOrigin="https://ldr-one-stripe-sandbox.onrender.com";
export async function handleAuthenticatedSandboxCheckout({request,authenticate,db,stripe,env,fetcher=fetch}){
 if(env.LDR_ONE_SANDBOX_CHECKOUT_ENABLED!=="true"||env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg")return {status:503,body:{ok:false,error:"Sandbox checkout disabled"}};
 const url=new URL(request.url);
 if(url.origin!==allowedOrigin||url.pathname!=="/internal/checkout"||url.search||url.hash||request.method!=="POST"||request.headers.get("origin")!==allowedOrigin||
    request.headers.get("content-type")?.split(";")[0]?.trim()!=="application/json")return {status:403,body:{ok:false,error:"Request not permitted"}};
 const length=Number(request.headers.get("content-length")??"0");
 if(!Number.isFinite(length)||length>4096)return {status:413,body:{ok:false,error:"Request too large"}};
 // Authenticate BEFORE reading user-provided selection or contacting Stripe.
 if(typeof authenticate!=="function")return {status:503,body:{ok:false,error:"Trusted authentication unavailable"}};
 const identity=await authenticate(request);
 if(!identity?.verified||!identity.userId||!identity.customerId)return {status:401,body:{ok:false,error:"Authentication required"}};
 let input;
 try{const raw=await request.text();if(Buffer.byteLength(raw)>4096)throw Error("Too large");input=JSON.parse(raw);}
 catch{return {status:400,body:{ok:false,error:"Invalid request"}};}
 if(!input||typeof input!=="object"||Array.isArray(input)||
    Object.keys(input).some(k=>!["plan","cycle","seats"].includes(k)))return {status:400,body:{ok:false,error:"Invalid selection"}};
 const selection={plan:input.plan,cycle:input.cycle,seats:input.seats};
 let config;
 try{config=resolveSandboxStripeConfig(env,selection);await verifySandboxPrice({secret:config.secret,priceId:config.priceId,selection,fetcher});}
 catch{return {status:503,body:{ok:false,error:"Test checkout unavailable"}};}
 try{
  const result=await prepareSandboxCheckout({db,stripe,authenticated:{userId:identity.userId,customerId:identity.customerId,email:identity.email??null,stripeCustomerId:identity.stripeCustomerId??null},selection,priceId:config.priceId,origin:allowedOrigin});
  return {status:200,body:{ok:true,url:result.url}};
 }catch{return {status:503,body:{ok:false,error:"Test checkout unavailable"}};}
}
