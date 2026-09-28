// Read-only route smoke for the production candidate. No auth, billing or data mutations.
const base=(process.env.LDR_ONE_SMOKE_BASE_URL||"").replace(/\/$/,"");
if(!/^https:\/\//.test(base))throw Error("HTTPS smoke base required");
const routes=(process.env.LDR_ONE_SMOKE_ROUTES||"/,/cliente,/profissional,/empresa,/cliente/biblioteca,/clinica-social,/carreira").split(",").map(x=>x.trim()).filter(Boolean);
const results=[];
for(const route of routes){const url=new URL(route,base);if(url.origin!==new URL(base).origin)throw Error("Cross-origin route refused");try{const r=await fetch(url,{method:"GET",redirect:"manual",signal:AbortSignal.timeout(12000),headers:{"user-agent":"LDR-ONE-release-smoke/1.0"}});const ok=(r.status>=200&&r.status<400)||[401,403].includes(r.status);results.push({route,status:r.status,ok,location:r.headers.get("location")?.slice(0,160)||null});}catch(e){results.push({route,status:0,ok:false,error:e.name});}}
console.log(JSON.stringify({base,results},null,2));if(results.some(x=>!x.ok))process.exitCode=1;
