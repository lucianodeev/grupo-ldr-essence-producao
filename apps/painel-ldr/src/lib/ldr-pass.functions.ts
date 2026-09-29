import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
function emailOf(c:Record<string,unknown>){return typeof c["email"]==="string"?c["email"] as string:null}
export const clientLdrPass=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{const {getLdrPassContext}=await import("@/lib/ldr-pass.server");return getLdrPassContext(context.userId,emailOf(context.claims))});
export const clientCreateLdrPassCheckout=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((d:{plan:"individual"|"business";market:"EU"|"BR";billing:"monthly"|"annual";seats?:number;source?:string})=>d).handler(async({context,data})=>{
 if(!["individual","business"].includes(data.plan)||!["EU","BR"].includes(data.market)||!["monthly","annual"].includes(data.billing))throw new Error("Plano inválido.");
 const seats=data.plan==="individual"?1:Number(data.seats??0);if(!Number.isSafeInteger(seats)||(data.plan==="business"&&(seats<2||seats>10000)))throw new Error("Quantidade de colaboradores inválida.");
 const {createLdrPassCheckout}=await import("@/lib/ldr-pass.server");return createLdrPassCheckout(context.userId,emailOf(context.claims),data.plan,data.market,data.billing,data.source??"ecossistema",seats)
});
