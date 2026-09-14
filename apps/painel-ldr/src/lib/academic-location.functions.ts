import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const auth=[requireSupabaseAuth] as const;

type NominatimAddress={
  city?:string;
  town?:string;
  village?:string;
  municipality?:string;
  suburb?:string;
  state?:string;
  country?:string;
};
type NominatimResult={
  display_name?:string;
  name?:string;
  type?:string;
  address?:NominatimAddress;
};
export type AcademicLocationSuggestion={label:string;city:string;country:string};

function clean(value:unknown,max:number){return String(value??"").trim().replace(/\s+/g," ").slice(0,max)}

export const academicLocationSearch=createServerFn({method:"GET"})
  .middleware(auth)
  .inputValidator((data:{query:string;locale?:string})=>({query:clean(data.query,120),locale:clean(data.locale,8)}))
  .handler(async({data})=>{
    if(data.query.length<3)return [] as AcademicLocationSuggestion[];
    const params=new URLSearchParams({q:data.query,format:"jsonv2",addressdetails:"1",limit:"6",dedupe:"1"});
    const response=await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`,{
      headers:{
        Accept:"application/json",
        "Accept-Language":data.locale||"pt",
        "User-Agent":"LDR-Academy-Academic-Network/1.0 (https://ldracademy.online)"
      },
      signal:AbortSignal.timeout(5000)
    });
    if(!response.ok)throw new Error("A busca de localização está indisponível no momento.");
    const raw:unknown=await response.json();
    if(!Array.isArray(raw))return [] as AcademicLocationSuggestion[];
    const out:AcademicLocationSuggestion[]=[];
    const seen=new Set<string>();
    for(const item of raw){
      if(!item||typeof item!=="object")continue;
      const place=item as NominatimResult;
      const address=place.address??{};
      const city=clean(address.city||address.town||address.village||address.municipality||address.suburb||address.state,80);
      const country=clean(address.country,80);
      const label=clean(place.display_name||place.name,160);
      if(!label)continue;
      const key=`${label}|${city}|${country}`.toLowerCase();
      if(seen.has(key))continue;
      seen.add(key);
      out.push({label,city,country});
      if(out.length>=5)break;
    }
    return out;
  });
