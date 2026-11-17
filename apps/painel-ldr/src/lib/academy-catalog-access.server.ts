import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { hasActiveLdrOne } from "@/lib/ldr-one-entitlement.server";
import { isAcademySubscriptionProduct } from "@/lib/academy-unified-catalog";
/** Read-only academic access, independent from billing management and human-service credits. */
export async function getAcademyCatalogAccess(customerId:string):Promise<{active:boolean;ownedKeys:string[]}>{
 const [active,orders]=await Promise.all([
  hasActiveLdrOne(customerId,"academy"),
  supabaseAdmin.from("orders").select("catalog_key,metadata").eq("customer_id",customerId).eq("payment_status","pago"),
 ]);
 if(orders.error&&!active)throw new Error("Não foi possível verificar os conteúdos adquiridos.");
 const keys=new Set<string>();
 for(const order of orders.data??[]){const meta=(order.metadata??{}) as Record<string,unknown>;
  if(meta["source"]==="library_subscription")continue;
  for(const value of [order.catalog_key,meta["product_key"]])if(typeof value==="string"&&isAcademySubscriptionProduct(value))keys.add(value);
 }
 return {active,ownedKeys:[...keys]};
}
