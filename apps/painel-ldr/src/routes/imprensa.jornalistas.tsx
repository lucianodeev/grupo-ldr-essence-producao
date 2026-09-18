import { FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Newspaper } from "lucide-react";

export const Route=createFileRoute("/imprensa/jornalistas")({
  head:()=>({meta:[{title:"Jornalistas | LDR Imprensa"},{name:"description",content:"Participe da rede de jornalistas e colaboradores do LDR Imprensa."}]}),
  component:Page
});

const endpoint="https://sfrcsrzuoqdscflfuwik.supabase.co/rest/v1/press_contact_requests";
const apiKey="sb_publishable_nN4RVHqSvj84P-GtTJfKgw_QNUGa6Sb";

function Page(){
  const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setState("sending");
    const form=e.currentTarget; const d=new FormData(form);
    const payload={request_type:"journalist_join",name:String(d.get("nome")||"").trim(),email:String(d.get("email")||"").trim(),country:String(d.get("pais")||"").trim(),city:String(d.get("cidade")||"").trim(),role:String(d.get("funcao")||"").trim(),organization:String(d.get("veiculo")||"").trim(),topics:String(d.get("temas")||"").trim(),languages:String(d.get("idiomas")||"").trim(),professional_link:String(d.get("link")||"").trim(),message:String(d.get("apresentacao")||"").trim()};
    try{
      const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","apikey":apiKey,"Authorization":"Bearer "+apiKey,"Prefer":"return=minimal"},body:JSON.stringify(payload)});
      if(!res.ok) throw new Error(await res.text());
      form.reset(); setState("sent");
    }catch(err){ console.error("LDR Imprensa form submission failed",err); setState("error"); }
  }
  return <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
    <header className="bg-[#071f36] text-white"><div className="mx-auto max-w-5xl px-5 py-5"><Link reloadDocument to="/imprensa" className="inline-flex items-center gap-2 text-sm"><ArrowLeft size={17}/> LDR Imprensa</Link></div></header>
    <section className="mx-auto max-w-5xl px-5 py-14 md:py-20">
      <Newspaper className="text-[#8b6c1f]"/><p className="mt-6 text-sm font-black uppercase tracking-widest text-[#8b6c1f]">Rede em formação</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">Jornalismo, conhecimento e novas conexões.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">Jornalistas, comunicadores, correspondentes, editores, estudantes de jornalismo e veículos podem apresentar seu interesse em participar desta nova rede.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">{["Encontrar especialistas e fontes","Acompanhar pautas e projetos","Manifestar interesse em colaborar"].map(x=><div key={x} className="rounded-2xl border border-[#d9d2c0] bg-white p-5"><CheckCircle2 className="text-[#8b6c1f]"/><strong className="mt-4 block">{x}</strong></div>)}</div>
      <form onSubmit={submit} className="mt-10 rounded-3xl border border-[#d9d2c0] bg-white p-6 md:p-8">
        <div><p className="text-sm font-black uppercase tracking-widest text-[#8b6c1f]">Faça parte</p><h2 className="mt-2 text-3xl font-black">Quero participar do LDR Imprensa</h2><p className="mt-2 text-slate-600">Preencha seus dados e envie diretamente por aqui. Você não precisa abrir nenhum aplicativo de e-mail.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field label="Nome *" name="nome" required/><Field label="E-mail *" name="email" type="email" required/><Field label="País *" name="pais" required/><Field label="Cidade" name="cidade"/>
          <Field label="Função *" name="funcao" placeholder="Jornalista, estudante, editor..." required/><Field label="Veículo / organização" name="veiculo"/><Field label="Temas de interesse *" name="temas" required/><Field label="Idiomas *" name="idiomas" required/><Field label="Link profissional" name="link" type="url"/>
        </div>
        <label className="mt-5 block font-bold">Breve apresentação<textarea name="apresentacao" rows={5} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal outline-none focus:ring-2 focus:ring-[#8b6c1f]"/></label>
        <label className="mt-5 flex items-start gap-3 text-sm text-slate-600"><input required type="checkbox" className="mt-1"/> <span>Concordo que os dados informados sejam usados pela LDR para responder a esta manifestação de interesse. Eles não serão publicados automaticamente.</span></label>
        <button disabled={state==="sending"} type="submit" className="mt-7 rounded-full bg-[#071f36] px-7 py-3 font-black text-white disabled:opacity-60">{state==="sending"?"Enviando...":"Enviar manifestação"}</button>
        {state==="sent"&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Manifestação enviada com sucesso. A equipe LDR recebeu seus dados.</p>}
        {state==="error"&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">Não foi possível enviar agora. Tente novamente em alguns instantes.</p>}
      </form>
    </section>
  </main>
}
function Field({label,name,type="text",required=false,placeholder=""}:{label:string;name:string;type?:string;required?:boolean;placeholder?:string}){return <label className="block font-bold">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal outline-none focus:ring-2 focus:ring-[#8b6c1f]"/></label>}
