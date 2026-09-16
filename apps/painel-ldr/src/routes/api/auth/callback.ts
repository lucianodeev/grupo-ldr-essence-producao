import { createFileRoute } from "@tanstack/react-router";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

import { normalizeSupabaseUrl } from "@/integrations/supabase/config";
import type { Database } from "@/integrations/supabase/types";
import { ACADEMIC_RETURN_COOKIE, academicLoginHref, academicReturnPath } from "@/lib/academic-login-return";

function config(){const supabaseUrl=process.env["SUPABASE_URL"];const supabasePublishableKey=process.env["SUPABASE_PUBLISHABLE_KEY"];if(!supabaseUrl||!supabasePublishableKey)throw new Error("Missing Supabase server configuration");return{supabaseUrl,supabasePublishableKey}}
function isServicePortalCallback(url:URL){return url.searchParams.get("portal")==="services"||/^portal\.ldrrhestrategia\.com$/i.test(url.hostname)}
type OAuthPortal="company"|"employee"|"professional"|null;
function portalFromCookies(cookies:ReturnType<typeof parseCookieHeader>):OAuthPortal{const value=cookies.find(({name})=>name==="ldr_portal_oauth")?.value;return value==="company"||value==="employee"||value==="professional"?value:null}
function clearTemporaryCookie(headers:Headers,name:string){headers.append("set-cookie",serializeCookieHeader(name,"",{path:"/",maxAge:0,sameSite:"lax",secure:true}))}
function portalLoginDestination(portal:OAuthPortal,error?:"missing_code"|"exchange_failed"){const suffix=error?`?auth_error=${error}`:"?auth_complete=1";if(portal==="company")return`/empresa/login${suffix}`;if(portal==="employee")return`/funcionario/login${suffix}`;if(portal==="professional")return`/profissional/login${suffix}`;return error?`/cliente/login?auth_error=${error}`:"/cliente/biblioteca"}

export const Route=createFileRoute("/api/auth/callback")({server:{handlers:{GET:async({request})=>{
 const url=new URL(request.url),code=url.searchParams.get("code"),servicePortal=isServicePortalCallback(url),requestCookies=parseCookieHeader(request.headers.get("cookie")??"");
 // Academic return is a same-origin relative path. Accept it on Academy and Vercel
 // previews alike; the path validator prevents external/open redirects.
 const academicReturn=academicReturnPath(requestCookies.find(({name})=>name===ACADEMIC_RETURN_COOKIE)?.value);
 const adminFlow=url.searchParams.get("admin")==="1"||requestCookies.some(({name,value})=>name==="ldr_admin_oauth"&&value==="1");
 const portalFlow=portalFromCookies(requestCookies),{supabaseUrl,supabasePublishableKey}=config();
 const responseHeaders=new Headers({"cache-control":"no-store, max-age=0, must-revalidate",pragma:"no-cache",expires:"0"});
 const supabase=createServerClient<Database>(normalizeSupabaseUrl(supabaseUrl),supabasePublishableKey,{cookies:{getAll(){return parseCookieHeader(request.headers.get("cookie")??"")},setAll(cookiesToSet,cacheHeaders){cookiesToSet.forEach(({name,value,options})=>responseHeaders.append("set-cookie",serializeCookieHeader(name,value,{...options,path:"/"})));Object.entries(cacheHeaders).forEach(([key,value])=>responseHeaders.set(key,value))}}});
 if(!code){const destination=academicReturn&&!adminFlow&&!portalFlow&&!servicePortal?`${academicLoginHref(academicReturn)}&auth_error=missing_code`:adminFlow?"/login?auth_error=missing_code":portalFlow?portalLoginDestination(portalFlow,"missing_code"):servicePortal?"/cliente/login?portal=services&auth_error=missing_code":"/cliente/login?auth_error=missing_code";if(adminFlow)clearTemporaryCookie(responseHeaders,"ldr_admin_oauth");if(portalFlow)clearTemporaryCookie(responseHeaders,"ldr_portal_oauth");if(academicReturn)clearTemporaryCookie(responseHeaders,ACADEMIC_RETURN_COOKIE);responseHeaders.set("location",destination);return new Response(null,{status:303,headers:responseHeaders})}
 const{error}=await supabase.auth.exchangeCodeForSession(code);
 const destination=academicReturn&&!adminFlow&&!portalFlow&&!servicePortal?(error?`${academicLoginHref(academicReturn)}&auth_error=exchange_failed`:academicReturn):error?(adminFlow?"/login?auth_error=exchange_failed":portalFlow?portalLoginDestination(portalFlow,"exchange_failed"):servicePortal?"/cliente/login?portal=services&auth_error=exchange_failed":"/cliente/login?auth_error=exchange_failed"):(adminFlow?"/admin":portalFlow?portalLoginDestination(portalFlow):servicePortal?"/cliente?portal=services&v=4":"/cliente/biblioteca");
 if(adminFlow)clearTemporaryCookie(responseHeaders,"ldr_admin_oauth");if(portalFlow)clearTemporaryCookie(responseHeaders,"ldr_portal_oauth");if(academicReturn)clearTemporaryCookie(responseHeaders,ACADEMIC_RETURN_COOKIE);responseHeaders.set("location",destination);return new Response(null,{status:303,headers:responseHeaders})
}}}});
