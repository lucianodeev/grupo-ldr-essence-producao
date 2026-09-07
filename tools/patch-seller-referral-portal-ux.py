from pathlib import Path

# ---------- seller referral landing: preserve plan metadata
p=Path('apps/painel-ldr/src/routes/seller-referral.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('try { sessionStorage.setItem("ldr_seller_referral", ref); } catch { /* storage optional */ }', 'try { sessionStorage.setItem("ldr_seller_referral", ref); sessionStorage.setItem("ldr_seller_referral_data", JSON.stringify(data)); } catch { /* storage optional */ }')
p.write_text(s,encoding='utf-8')

# ---------- company subscription page
p=Path('apps/painel-ldr/src/routes/_portal.assinatura-empresa.tsx')
s=p.read_text(encoding='utf-8')
if 'function sellerReferralFromBrowser()' not in s:
    anchor='const money = (cents: number, currency: string, locale: Locale) => new Intl.NumberFormat(INTL[locale], { style: "currency", currency }).format(cents / 100);'
    helper='''\nfunction sellerReferralFromBrowser() {\n  if (typeof window === "undefined") return "";\n  const query = new URLSearchParams(window.location.search).get("seller_ref") || "";\n  if (query) { try { sessionStorage.setItem("ldr_seller_referral", query); } catch {} return query; }\n  try { return sessionStorage.getItem("ldr_seller_referral") || ""; } catch { return ""; }\n}\nfunction sellerReferralData() {\n  if (typeof window === "undefined") return null as any;\n  try { const raw=sessionStorage.getItem("ldr_seller_referral_data"); return raw ? JSON.parse(raw) : null; } catch { return null; }\n}\n'''
    if anchor not in s: raise SystemExit('company subscription money anchor missing')
    s=s.replace(anchor,anchor+helper,1)
if 'const sellerReferral = sellerReferralFromBrowser();' not in s:
    anchor='const custom = useMemo(() => calculateCustomCompanyPlan({ region, employees, services, extraCredits }), [region, employees, services, extraCredits]);'
    add='''\n  const sellerReferral = sellerReferralFromBrowser();\n  const referralData = sellerReferralData();\n'''
    if anchor not in s: raise SystemExit('company custom anchor missing')
    s=s.replace(anchor,anchor+add,1)
# preselect market
old='''  useEffect(() => {\n    void load();\n    const params = new URLSearchParams(window.location.search);'''
new='''  useEffect(() => {\n    const rd = sellerReferralData();\n    if (rd?.portal_kind === "company" && (rd.market === "EU" || rd.market === "BR")) setRegion(rd.market);\n    void load();\n    const params = new URLSearchParams(window.location.search);'''
if old in s: s=s.replace(old,new,1)
# pass referral
old='checkout({ data: { planCode, region, employees: count, services: selectedServices, extraCredits: credits } })'
new='checkout({ data: { planCode, region, employees: count, services: selectedServices, extraCredits: credits, sellerReferral: sellerReferral || null } })'
if old not in s: raise SystemExit('company checkout call anchor missing')
s=s.replace(old,new,1)
# preserve referral when company setup is needed
s=s.replace('<Link to="/empresa" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{copy.goCompany}</Link>', '<a href={sellerReferral ? `/empresa?seller_ref=${encodeURIComponent(sellerReferral)}` : "/empresa"} className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{copy.goCompany}</a>',1)
# referral notice near main hero intro
needle='<p className="mt-4 max-w-2xl leading-7 opacity-90">{copy.intro}</p>'
if needle in s and 'Plano indicado pela Rede Comercial LDR' not in s:
    s=s.replace(needle,needle+'{sellerReferral && <p className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-sm"><strong>Plano indicado pela Rede Comercial LDR.</strong> Use o mesmo e-mail informado ao vendedor. A comissão só é atribuída após o pagamento confirmado pela Stripe.</p>}',1)
p.write_text(s,encoding='utf-8')

# ---------- company portal: continue referral after company setup
p=Path('apps/painel-ldr/src/routes/_portal.empresa.tsx')
s=p.read_text(encoding='utf-8')
if 'ldr_seller_referral' not in s:
    # add a small helper before component
    marker='function CompanyPortal()'
    helper='''function pendingSellerReferral(){if(typeof window==="undefined")return "";const q=new URLSearchParams(window.location.search).get("seller_ref")||"";if(q){try{sessionStorage.setItem("ldr_seller_referral",q)}catch{}return q}try{return sessionStorage.getItem("ldr_seller_referral")||""}catch{return ""}}\n'''
    if marker not in s: raise SystemExit('company portal component anchor missing')
    s=s.replace(marker,helper+marker,1)
    # use effect after component start / states - safest insert before return by locating first loading guard
    guard='if(loading)'
    if guard in s:
        s=s.replace(guard,'const sellerReferral=pendingSellerReferral();useEffect(()=>{if(!loading&&data?.organization&&sellerReferral){window.location.replace(`/assinatura-empresa?seller_ref=${encodeURIComponent(sellerReferral)}`)}},[loading,data?.organization?.id,sellerReferral]);'+guard,1)
    else:
        # fallback: query string preserved manually by setup route isn't critical, sessionStorage remains
        print('warning: company loading guard not found; session storage still preserves referral')
p.write_text(s,encoding='utf-8')

# ---------- professional login
p=Path('apps/painel-ldr/src/routes/profissional.login.tsx')
s=p.read_text(encoding='utf-8')
if 'sellerRef' not in s:
    s=s.replace('import { useCallback, useEffect, useState } from "react";','import { useCallback, useEffect, useMemo, useState } from "react";',1)
    anchor='  const [busy,setBusy(false);'
    # code is minified differently; insert after c/COPY state exact known text
    anchor='  const [busy,setBusy(false);'
    # fallback actual contains const [busy,setBusy]=useState(false);
    actual='  const [busy,setBusy]=useState(false);'
    add='''\n  const sellerRef=useMemo(()=>typeof window==="undefined"?"":new URLSearchParams(window.location.search).get("seller_ref")||"",[]);\n  useEffect(()=>{if(sellerRef){try{sessionStorage.setItem("ldr_seller_referral",sellerRef)}catch{}}},[sellerRef]);'''
    if actual not in s: raise SystemExit('professional login busy anchor missing')
    s=s.replace(actual,actual+add,1)
    s=s.replace('window.location.replace(isActiveApproved?"/painel-profissional":"/profissional-onboarding");','window.location.replace((isActiveApproved?"/painel-profissional":"/profissional-onboarding")+(sellerRef?`?seller_ref=${encodeURIComponent(sellerRef)}`:""));',1)
    s=s.replace('},[load]);','},[load,sellerRef]);',1)
    s=s.replace('options:{redirectTo:`${window.location.origin}/profissional/login`,skipBrowserRedirect:true}', 'options:{redirectTo:`${window.location.origin}/profissional/login${sellerRef?`?seller_ref=${encodeURIComponent(sellerRef)}`:""}`,skipBrowserRedirect:true}',1)
p.write_text(s,encoding='utf-8')

# ---------- professional onboarding
p=Path('apps/painel-ldr/src/routes/profissional-onboarding.tsx')
s=p.read_text(encoding='utf-8')
if 'function sellerReferralId()' not in s:
    marker='function money(c:number,currency:string)'
    helper='''function sellerReferralId(){if(typeof window==="undefined")return "";const q=new URLSearchParams(window.location.search).get("seller_ref")||"";if(q){try{sessionStorage.setItem("ldr_seller_referral",q)}catch{}return q}try{return sessionStorage.getItem("ldr_seller_referral")||""}catch{return ""}}\nfunction sellerReferralPlan(){if(typeof window==="undefined")return null as any;try{const r=sessionStorage.getItem("ldr_seller_referral_data");return r?JSON.parse(r):null}catch{return null}}\n'''
    if marker not in s: raise SystemExit('professional onboarding marker missing')
    s=s.replace(marker,helper+marker,1)
# pass referral to checkout
old='checkout({data:{planId:id}})'
new='checkout({data:{planId:id,sellerReferral:sellerReferralId()||null}})'
if old not in s: raise SystemExit('professional onboarding checkout call missing')
s=s.replace(old,new,1)
# market selection must honor seller referral
old='const market=f.countryCode==="BR"?"BR":"EU";'
new='const referralPlan=sellerReferralPlan();const market=referralPlan?.portal_kind==="professional"&&["EU","BR"].includes(referralPlan.market)?referralPlan.market:(f.countryCode==="BR"?"BR":"EU");'
if old not in s: raise SystemExit('professional onboarding market anchor missing')
s=s.replace(old,new,1)
# only matching referred plan when metadata known
old='const plans=(data.plans??[]).filter((p:AnyRow)=>p.market===market);'
new='const plans=(data.plans??[]).filter((p:AnyRow)=>p.market===market&&(!referralPlan?.plan_code||p.plan_code===referralPlan.plan_code));'
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# ---------- professional panel
p=Path('apps/painel-ldr/src/routes/profissional-painel.tsx')
s=p.read_text(encoding='utf-8')
if 'sellerReferralForSubscription' not in s:
    marker='function ProfessionalPanel()'
    helper='''function sellerReferralForSubscription(){if(typeof window==="undefined")return "";const q=new URLSearchParams(window.location.search).get("seller_ref")||"";if(q){try{sessionStorage.setItem("ldr_seller_referral",q)}catch{}return q}try{return sessionStorage.getItem("ldr_seller_referral")||""}catch{return ""}}\n'''
    if marker not in s: raise SystemExit('professional panel marker missing')
    s=s.replace(marker,helper+marker,1)
s=s.replace('subscribe({data:{planId:', 'subscribe({data:{sellerReferral:sellerReferralForSubscription()||null,planId:')
p.write_text(s,encoding='utf-8')

print('seller referral portal UX patched')
