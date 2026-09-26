/** Isolated LDR ONE processing pipeline, NOT registered as a live Stripe route.
 * Input MUST originate from a signature-verified Stripe event; subscription
 * identity MUST be resolved independently from trusted server records.
 */
import { claimLdrOneWebhookEvent, finishLdrOneWebhookEvent } from "./ldr-one-webhook-inbox.server.ts";
import { applyVerifiedLdrOneSubscriptionEvent } from "./ldr-one-atomic-subscription.server.ts";
type Db={rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:{message?:string}|null}>};
type Event={id:string;created:number;type:string;status:string;stripeSubscriptionId:string;stripeCustomerId?:string|null;stripeCheckoutSessionId?:string|null;periodStart?:number|null;periodEnd?:number|null;cancelAtPeriodEnd?:boolean|null};
export async function processVerifiedLdrOneEvent(db:Db,rowId:string,event:Event){
 const claim=await claimLdrOneWebhookEvent(db,event.id,event.type);
 if(claim.decision==="acknowledge") return "duplicate" as const;
 if(claim.decision==="retry_later") throw new Error("LDR ONE event is already processing; Stripe must retry");
 if(claim.decision==="reject") throw new Error("LDR ONE event exceeded retry policy; manual reconciliation required");
 let decision: "applied"|"duplicate"|"stale";
 try{
   decision=await applyVerifiedLdrOneSubscriptionEvent(db,rowId,event);
 }catch(error){
   try{await finishLdrOneWebhookEvent(db,event.id,claim.token,false,error instanceof Error?error.message:"unknown error");}
   catch(finishError){throw new AggregateError([error,finishError],"LDR ONE event processing and claim release failed");}
   throw error;
 }
 // Once the atomic update succeeds, do not mark it failed if acknowledgement
 // fails. Let Stripe retry; the atomic event cursor prevents a second update.
 await finishLdrOneWebhookEvent(db,event.id,claim.token,true);
 return decision;
}
