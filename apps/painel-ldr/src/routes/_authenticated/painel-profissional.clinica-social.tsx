import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { socialClinicProfessionalState } from "@/lib/social-clinic.functions";

export const Route = createFileRoute("/_authenticated/painel-profissional/clinica-social")({ component: SocialClinicStatus });

function SocialClinicStatus() {
  const load = useServerFn(socialClinicProfessionalState);
  const [data,setData]=useState<any>(null),[error,setError]=useState("");
  useEffect(()=>{load().then(setData).catch((e:any)=>setError(e?.message||"Não foi possível carregar."))},[]);
  const a=data?.application;
  return <section className="space-y-5">
    <div><p className="text-xs font-black uppercase tracking-[.18em] text-muted-foreground">Clínica Social LDR</p><h1 className="font-serif text-3xl">Minha candidatura</h1></div>
    {error&&<div className="s8-card text-red-700">{error}</div>}
    {!data&&!error&&<div className="s8-card">Carregando...</div>}
    {data&&!a&&<div className="s8-card"><p>Você ainda não possui candidatura para atender na Clínica Social.</p><Link to="/clinica-social/profissionais" className="mt-4 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Enviar candidatura</Link></div>}
    {a&&<div className="s8-card space-y-3"><div><b>Protocolo:</b> {a.protocol}</div><div><b>Status:</b> {a.status||"new"}</div><div><b>Enviada em:</b> {a.submitted_at?new Date(a.submitted_at).toLocaleString(): "—"}</div>{a.note&&<div><b>Observação:</b> {a.note}</div>}<p className="text-sm text-muted-foreground">A participação depende da aprovação manual do Master. Somente profissionais aprovados e em conformidade podem ser disponibilizados para atendimento.</p></div>}
  </section>
}
