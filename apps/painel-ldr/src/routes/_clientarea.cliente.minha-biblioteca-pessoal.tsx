import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileText, Pencil, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  clientCreatePersonalLibraryUploadUrl,
  clientDeletePersonalLibraryFile,
  clientOpenPersonalLibraryFile,
  clientPersonalLibraryFiles,
  clientRegisterPersonalLibraryFile,
  clientUpdatePersonalLibraryFile,
} from "@/lib/personal-library.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/minha-biblioteca-pessoal")({ component: PersonalLibraryPage });

type L = "pt" | "en" | "fr" | "es";
const BUCKET = "personal-library-private";
const CATEGORIES = ["Livros", "Estudos", "Artigos", "Trabalho", "Psicanálise", "Negócios", "Carreira", "Outros"];
const COPY = {
  pt:{title:"Minha Biblioteca Pessoal",sub:"Seus documentos, organizados em um só lugar.",privacy:"Seus arquivos são privados e não são publicados na LDR Essence Academy.",add:"ADICIONAR PDF",first:"ADICIONAR MEU PRIMEIRO PDF",empty:"Você ainda não adicionou nenhum PDF.",emptySub:"Monte sua biblioteca pessoal gratuitamente.",search:"Buscar por título…",all:"Todas as categorias",open:"ABRIR",edit:"EDITAR",remove:"EXCLUIR",uploading:"Enviando…",limit:"PDF · até 50 MB por arquivo · até 100 arquivos",confirm:"Excluir este PDF da sua biblioteca pessoal?"},
  en:{title:"My Personal Library",sub:"Your documents, organized in one place.",privacy:"Your files are private and are not published on LDR Essence Academy.",add:"ADD PDF",first:"ADD MY FIRST PDF",empty:"You have not added any PDFs yet.",emptySub:"Build your personal library for free.",search:"Search by title…",all:"All categories",open:"OPEN",edit:"EDIT",remove:"DELETE",uploading:"Uploading…",limit:"PDF · up to 50 MB each · up to 100 files",confirm:"Delete this PDF from your personal library?"},
  fr:{title:"Ma Bibliothèque Personnelle",sub:"Vos documents, organisés au même endroit.",privacy:"Vos fichiers sont privés et ne sont pas publiés sur LDR Essence Academy.",add:"AJOUTER UN PDF",first:"AJOUTER MON PREMIER PDF",empty:"Vous n’avez encore ajouté aucun PDF.",emptySub:"Créez gratuitement votre bibliothèque personnelle.",search:"Rechercher par titre…",all:"Toutes les catégories",open:"OUVRIR",edit:"MODIFIER",remove:"SUPPRIMER",uploading:"Envoi…",limit:"PDF · 50 Mo max. par fichier · 100 fichiers max.",confirm:"Supprimer ce PDF de votre bibliothèque personnelle ?"},
  es:{title:"Mi Biblioteca Personal",sub:"Tus documentos, organizados en un solo lugar.",privacy:"Tus archivos son privados y no se publican en LDR Essence Academy.",add:"AÑADIR PDF",first:"AÑADIR MI PRIMER PDF",empty:"Todavía no has añadido ningún PDF.",emptySub:"Crea tu biblioteca personal gratis.",search:"Buscar por título…",all:"Todas las categorías",open:"ABRIR",edit:"EDITAR",remove:"ELIMINAR",uploading:"Subiendo…",limit:"PDF · hasta 50 MB por archivo · hasta 100 archivos",confirm:"¿Eliminar este PDF de tu biblioteca personal?"},
} as const;

function formatBytes(value:number){ if(value<1024)return `${value} B`; if(value<1024*1024)return `${(value/1024).toFixed(1)} KB`; return `${(value/1024/1024).toFixed(1)} MB`; }

function PersonalLibraryPage(){
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as L;
  const t=COPY[locale];
  const listFn=useServerFn(clientPersonalLibraryFiles);
  const uploadFn=useServerFn(clientCreatePersonalLibraryUploadUrl);
  const registerFn=useServerFn(clientRegisterPersonalLibraryFile);
  const openFn=useServerFn(clientOpenPersonalLibraryFile);
  const updateFn=useServerFn(clientUpdatePersonalLibraryFile);
  const deleteFn=useServerFn(clientDeletePersonalLibraryFile);
  const qc=useQueryClient();
  const inputRef=useRef<HTMLInputElement>(null);
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("");
  const [error,setError]=useState("");

  const {data,isLoading}=useQuery({queryKey:["personal-library-files"],queryFn:()=>listFn({})});

  const upload=useMutation({
    mutationFn:async(file:File)=>{
      if(file.type!=="application/pdf")throw new Error("Envie somente arquivos PDF.");
      const prepared=await uploadFn({data:{fileName:file.name,contentType:file.type,size:file.size}});
      const {error:storageError}=await supabase.storage.from(BUCKET).uploadToSignedUrl(prepared.path,prepared.token,file,{contentType:"application/pdf"});
      if(storageError)throw new Error("Não foi possível enviar o PDF.");
      const title=file.name.replace(/\.pdf$/i,"").trim()||"PDF";
      return registerFn({data:{path:prepared.path,title,originalFileName:file.name,size:file.size,category:"Outros"}});
    },
    onSuccess:async()=>{setError("");await qc.invalidateQueries({queryKey:["personal-library-files"]});},
    onError:(e:any)=>setError(e?.message||"Não foi possível enviar o PDF."),
  });

  const remove=useMutation({mutationFn:(id:string)=>deleteFn({data:{id}}),onSuccess:()=>qc.invalidateQueries({queryKey:["personal-library-files"]}),onError:(e:any)=>setError(e?.message||"Não foi possível excluir.")});
  const update=useMutation({mutationFn:(x:{id:string;title?:string;category?:string})=>updateFn({data:x}),onSuccess:()=>qc.invalidateQueries({queryKey:["personal-library-files"]}),onError:(e:any)=>setError(e?.message||"Não foi possível atualizar.")});

  const files=useMemo(()=>{
    const list=data?.files??[];
    const q=query.trim().toLowerCase();
    return list.filter((f:any)=>(!category||f.category===category)&&(!q||String(f.title).toLowerCase().includes(q)));
  },[data,query,category]);

  async function handleFile(file?:File){ if(!file)return; setError(""); await upload.mutateAsync(file).catch(()=>undefined); if(inputRef.current)inputRef.current.value=""; }
  async function openFile(id:string){ try{const r=await openFn({data:{id}}); window.open(r.url,"_blank","noopener,noreferrer");}catch(e:any){setError(e?.message||"Não foi possível abrir.");} }
  function editFile(file:any){
    const title=window.prompt(locale==="pt"?"Novo título do PDF:":"PDF title:",file.title);
    if(title===null)return;
    const cat=window.prompt(locale==="pt"?`Categoria (${CATEGORIES.join(", ")}):`:"Category:",file.category||"Outros");
    if(cat===null)return;
    update.mutate({id:file.id,title,category:CATEGORIES.includes(cat)?cat:"Outros"});
  }

  return <div className="space-y-6">
    <section className="rounded-[28px] border border-[#d6ad63]/35 bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#9a6b1f]">LDR ESSENCE ACADEMY</p>
      <h1 className="mt-2 font-serif text-3xl text-[#071426]">{t.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{t.sub}</p>
      <div className="mt-4 rounded-xl bg-[#f7f2e8] px-4 py-3 text-sm text-[#5d4720]">🔒 {t.privacy}</div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e=>handleFile(e.target.files?.[0])}/>
        <button type="button" disabled={upload.isPending} onClick={()=>inputRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#071426] px-5 py-3 text-sm font-black text-white disabled:opacity-60"><Upload className="h-4 w-4"/>{upload.isPending?t.uploading:t.add}</button>
        <span className="text-xs text-slate-500">{t.limit}</span>
      </div>
      {error?<p className="mt-3 text-sm font-semibold text-red-700">{error}</p>:null}
    </section>

    <section className="grid gap-3 sm:grid-cols-[1fr_220px]">
      <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm"/></label>
      <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option value="">{t.all}</option>{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select>
    </section>

    {isLoading?<p className="text-sm text-slate-500">Carregando…</p>:files.length===0?<section className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center"><FileText className="mx-auto h-10 w-10 text-slate-400"/><h2 className="mt-3 font-serif text-2xl text-[#071426]">{t.empty}</h2><p className="mt-2 text-sm text-slate-500">{t.emptySub}</p><button type="button" onClick={()=>inputRef.current?.click()} className="mt-5 rounded-xl bg-[#d6ad63] px-5 py-3 text-sm font-black text-[#071426]">{t.first}</button></section>:<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{files.map((file:any)=><article key={file.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="rounded-xl bg-[#eef3f8] p-3"><FileText className="h-6 w-6 text-[#0d2d4d]"/></div><span className="rounded-full bg-[#f5f0e6] px-2.5 py-1 text-[10px] font-black uppercase text-[#7a5a22]">{file.category||"Outros"}</span></div><h3 className="mt-4 font-serif text-xl leading-tight text-[#071426]">{file.title}</h3>{file.author?<p className="mt-1 text-sm text-slate-500">{file.author}</p>:null}<p className="mt-3 text-xs text-slate-400">{formatBytes(Number(file.file_size||0))} · {new Date(file.created_at).toLocaleDateString()}</p><div className="mt-5 grid grid-cols-3 gap-2"><button type="button" onClick={()=>openFile(file.id)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#071426] px-2 py-2 text-[11px] font-black text-white"><ExternalLink className="h-3.5 w-3.5"/>{t.open}</button><button type="button" onClick={()=>editFile(file)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-[11px] font-black text-slate-700"><Pencil className="h-3.5 w-3.5"/>{t.edit}</button><button type="button" onClick={()=>{if(window.confirm(t.confirm))remove.mutate(file.id)}} className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-[11px] font-black text-red-700"><Trash2 className="h-3.5 w-3.5"/>{t.remove}</button></div></article>)}</section>}
  </div>;
}
