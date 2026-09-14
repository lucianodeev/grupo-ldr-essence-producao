import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, HeartHandshake, MapPin, Share2 } from "lucide-react";
import { academicArticleBySlug, academicToggleArticleSave, academicToggleArticleSupport } from "@/lib/academic-articles-v2.functions";

export const Route=createFileRoute("/_clientarea/cliente/rede-academica/artigo/$slug")({component:AcademicArticlePage});
function AcademicArticlePage(){
  const {slug}=Route.useParams();const qc=useQueryClient();const getArticle=useServerFn(academicArticleBySlug),supportFn=useServerFn(academicToggleArticleSupport),saveFn=useServerFn(academicToggleArticleSave);
  const {data,isLoading,error}=useQuery({queryKey:["academic-article",slug],queryFn:()=>getArticle({data:{slug}})});
  const refresh=()=>qc.invalidateQueries({queryKey:["academic-article",slug]});
  const support=useMutation({mutationFn:(id:string)=>supportFn({data:{articleId:id}}),onSuccess:refresh});
  const save=useMutation({mutationFn:(id:string)=>saveFn({data:{articleId:id}}),onSuccess:refresh});
  if(isLoading)return <div className="mx-auto max-w-4xl p-6 text-sm text-muted-foreground">Carregando artigo…</div>;
  if(error||!data)return <div className="mx-auto max-w-3xl p-6"><div className="rounded-2xl border p-5">Artigo não disponível.</div></div>;
  const share=async()=>{const url=window.location.href;if(navigator.share)await navigator.share({title:data.title,url});else await navigator.clipboard.writeText(url)};
  return <div className="mx-auto max-w-4xl space-y-5 px-3 pb-24 pt-4 sm:px-6 sm:pt-6">
    <Link to="/cliente/rede-academica" className="text-xs font-black text-[#07315a] dark:text-[#efc56d]">← REDE ACADÊMICA</Link>
    <article className="rounded-[30px] border bg-card p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-[#9a772c]"><span>{data.category||"ARTIGO"}</span>{data.location_label&&<span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3"/>{data.location_label}</span>}</div>
      <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">{data.title}</h1>{data.summary&&<p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{data.summary}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1 font-black">{data.author.name}</span><span className="text-muted-foreground">@{data.author.username||"membro"}</span><span className="text-muted-foreground">{new Date(data.created_at).toLocaleDateString()}</span></div>
      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{__html:data.body_html}}/>
      {data.references_text&&<section className="mt-8 border-t pt-6"><h2 className="font-serif text-xl">Referências</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{data.references_text}</p></section>}
      {!!data.keywords?.length&&<div className="mt-6 flex flex-wrap gap-2">{data.keywords.map((x:string)=><span key={x} className="rounded-full border px-3 py-1 text-[11px]">#{x.replace(/\s+/g,"")}</span>)}</div>}
      <div className="mt-8 grid gap-2 border-t pt-4 sm:grid-cols-3"><button onClick={()=>support.mutate(data.id)} className="min-h-11 rounded-xl border px-4 text-xs font-black"><HeartHandshake className="mr-2 inline h-4 w-4"/>{data.supported?"ACOLHIDO":"ACOLHER"} · {data.supportCount}</button><button onClick={()=>save.mutate(data.id)} className="min-h-11 rounded-xl border px-4 text-xs font-black"><Bookmark className="mr-2 inline h-4 w-4"/>{data.saved?"SALVO":"SALVAR"}</button><button onClick={share} className="min-h-11 rounded-xl border px-4 text-xs font-black"><Share2 className="mr-2 inline h-4 w-4"/>COMPARTILHAR</button></div>
    </article>
  </div>
}
