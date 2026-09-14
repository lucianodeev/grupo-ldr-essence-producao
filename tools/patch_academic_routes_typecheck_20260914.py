from pathlib import Path

ROOT = Path("apps/painel-ldr/src")

def replace_once(path: str, old: str, new: str, label: str) -> None:
    p = ROOT / path
    s = p.read_text(encoding="utf-8")
    if new in s:
        return
    if old not in s:
        raise SystemExit(f"anchor not found in {path}: {label}")
    p.write_text(s.replace(old, new, 1), encoding="utf-8")

replace_once(
    "routes/_clientarea.cliente.rede-academica.tsx",
    'export const Route=createFileRoute("/_clientarea/cliente/rede-academica")({validateSearch:(search:Record<string,unknown>)=>({tab:typeof search.tab==="string"?search.tab:undefined}),component:AcademicNetworkPage});',
    'type AcademicNetworkSearch={tab?:string};\nexport const Route=createFileRoute("/_clientarea/cliente/rede-academica")({validateSearch:(search:Record<string,unknown>):AcademicNetworkSearch=>{const tab=search["tab"];return typeof tab==="string"?{tab}:{}},component:AcademicNetworkPage});',
    "make parent academic search optional and index-safe",
)

replace_once(
    "routes/_clientarea.cliente.rede-academica.criar.tsx",
    'export const Route=createFileRoute("/_clientarea/cliente/rede-academica/criar")({validateSearch:(search:Record<string,unknown>)=>({kind:typeof search.kind==="string"?search.kind:undefined}),component:AcademicCreatePage});',
    'type AcademicCreateSearch={kind?:string};\nexport const Route=createFileRoute("/_clientarea/cliente/rede-academica/criar")({validateSearch:(search:Record<string,unknown>):AcademicCreateSearch=>{const kind=search["kind"];return typeof kind==="string"?{kind}:{}},component:AcademicCreatePage});',
    "make create search optional and index-safe",
)

replace_once(
    "lib/academic-editorial-v3.server.ts",
    'const followedIds=new Set((follows??[]).map((x:any)=>x.editorial_profile_id));',
    'const followedIds=new Set<string>((follows??[]).map((x:any)=>String(x.editorial_profile_id??"")).filter(Boolean));',
    "serialize followed editorial profile ids as strings",
)

replace_once(
    "lib/academic-network.server.ts",
    'function mentionedUsernames(body:string){ return [...new Set([...body.matchAll(/(^|\\s)@([a-zA-Z0-9._]{3,30})\\b/g)].map(m=>m[2].toLowerCase()))].slice(0,20); }',
    'function mentionedUsernames(body:string){ return [...new Set([...body.matchAll(/(^|\\s)@([a-zA-Z0-9._]{3,30})\\b/g)].map(m=>m[2]).filter((name):name is string=>Boolean(name)).map(name=>name.toLowerCase()))].slice(0,20); }',
    "guard optional mention regex capture",
)
replace_once(
    "lib/academic-network.server.ts",
    '(data??[]).forEach((x:any,i:number)=>{ if(x?.signedUrl)out.set(unique[i],x.signedUrl); }); return out;',
    '(data??[]).forEach((x:any,i:number)=>{ const path=unique[i];if(x?.signedUrl&&path)out.set(path,x.signedUrl); }); return out;',
    "guard signed URL path index",
)

replace_once(
    "lib/academic-social-v2.server.ts",
    'const mediaPaths=[...new Set((mediaRows??[]).map((x:any)=>x.storage_path).filter(Boolean))]; const mediaUrlMap=new Map<string,string>();',
    'const mediaPaths:string[]=[...new Set<string>((mediaRows??[]).map((x:any)=>String(x.storage_path??"")).filter(Boolean))]; const mediaUrlMap=new Map<string,string>();',
    "type media storage paths as strings",
)
replace_once(
    "lib/academic-social-v2.server.ts",
    'if(mediaPaths.length){const {data:signed}=await db.storage.from("academic-network").createSignedUrls(mediaPaths,3600);(signed??[]).forEach((x:any,i:number)=>{if(x?.signedUrl)mediaUrlMap.set(mediaPaths[i],x.signedUrl)});}',
    'if(mediaPaths.length){const {data:signed}=await db.storage.from("academic-network").createSignedUrls(mediaPaths,3600);(signed??[]).forEach((x:any,i:number)=>{const path=mediaPaths[i];if(x?.signedUrl&&path)mediaUrlMap.set(path,x.signedUrl)});}',
    "guard media signed URL path index",
)

print("Academic route/server type safety patch applied safely.")
