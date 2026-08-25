import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, LockKeyhole, ShoppingCart, ReceiptText, MessageCircle, PlayCircle } from "lucide-react";
import { useState } from "react";

import { clientCreateDigitalCheckout, clientDigitalLibrary } from "@/lib/client-portal.functions";
import { clientAddLibraryComment, clientLearningHub, clientSaveProgress } from "@/lib/learning.functions";

export const Route = createFileRoute("/_clientarea/cliente/biblioteca")({ component: ClientLibrary });

function money(cents: number, currency: "BRL" | "EUR") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
}

function ClientLibrary() {
  const fn = useServerFn(clientDigitalLibrary);
  const checkoutFn = useServerFn(clientCreateDigitalCheckout);
  const learningFn = useServerFn(clientLearningHub);
  const commentFn = useServerFn(clientAddLibraryComment);
  const progressFn = useServerFn(clientSaveProgress);
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [productKey, setProductKey] = useState<string>("ebook_coragem_comecar");

  const checkout = useMutation({ mutationFn: (input: { productKey: "ebook_coragem_comecar" | "livro_menino_mamao"; market: "BR" | "INTL" }) => checkoutFn({ data: input }), onSuccess: (result) => { window.location.href = result.url; } });
  const addComment = useMutation({ mutationFn: () => commentFn({ data: { body: comment, productKey } }), onSuccess: async () => { setComment(""); await queryClient.invalidateQueries({ queryKey: ["client-learning-hub"] }); } });
  const saveProgress = useMutation({ mutationFn: (input: { productKey: string; progressPercent: number; currentLocation?: string | null }) => progressFn({ data: input }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client-learning-hub"] }) });

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const paymentState = params?.get("payment");
  const { data, isLoading, error } = useQuery({ queryKey: ["client-digital-library"], queryFn: () => fn({}) });
  const { data: learning } = useQuery({ queryKey: ["client-learning-hub"], queryFn: () => learningFn({}) });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando biblioteca…</p>;
  if (error || !data) return <section className="s8-card"><h1 className="font-serif text-2xl">Minha Biblioteca</h1><p className="mt-2 text-sm text-muted-foreground">Não foi possível carregar sua biblioteca agora.</p></section>;

  const comments = learning?.comments?.filter((c:any)=>c.product_key) ?? [];
  const progress = learning?.progress ?? [];

  return <div className="space-y-5">
    <section className="s8-card" style={{ background: "linear-gradient(145deg,#4b101d,#2b0a11)", color: "#f7ead8", borderColor: "#b58a44" }}><p className="text-xs font-bold uppercase tracking-[0.18em]" style={{color:"#d6ad63"}}>A Coragem de Começar</p><h1 className="mt-1 font-serif text-3xl">Minha Biblioteca</h1><p className="mt-2 max-w-3xl text-sm opacity-85">Seu espaço exclusivo para leitura e conteúdos. Cada produto pago continua protegido e só é liberado após confirmação da compra.</p><a href="/cliente/pedidos" className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline"><ReceiptText className="h-4 w-4"/> Ver pedidos e pagamentos</a></section>

    {paymentState === "success" ? <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Pagamento recebido.</strong> Seu acesso será liberado automaticamente após confirmação.<button type="button" className="ml-2 font-bold underline" onClick={() => queryClient.invalidateQueries({ queryKey: ["client-digital-library"] })}>Atualizar acesso</button></section> : paymentState === "cancel" ? <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Pagamento cancelado. Nenhum conteúdo foi liberado.</section> : null}

    <section className="grid gap-4 md:grid-cols-2" aria-label="Produtos digitais">{data.products.map((product) => { const p = progress.find((x:any)=>x.product_key===product.key); return <article key={product.key} className="s8-card flex min-h-[320px] flex-col"><div className="flex items-start justify-between gap-3"><div className="rounded-xl border border-border bg-accent/50 p-3 text-primary"><BookOpen className="h-6 w-6"/></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.entitled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{product.entitled ? "Disponível" : "Compra necessária"}</span></div><h2 className="mt-5 font-serif text-2xl">{product.title}</h2><p className="mt-2 text-sm text-muted-foreground">{product.description}</p>{p?<div className="mt-4 rounded-xl bg-accent/50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-primary">Continue de onde parou</p><p className="mt-1 text-sm">{p.current_location || "Última leitura"} · {p.progress_percent}%</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-border"><div className="h-full bg-primary" style={{width:`${p.progress_percent}%`}}/></div></div>:null}<div className="mt-5 rounded-xl border border-border bg-background/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor de referência</p><p className="mt-1 font-bold text-primary">Brasil {money(product.priceBrlCents,"BRL")} · Exterior {money(product.priceEurCents,"EUR")}</p></div><div className="mt-auto pt-5">{product.entitled ? <div className="space-y-2"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><div className="flex items-center gap-2 font-bold"><PlayCircle className="h-4 w-4"/> Acesso liberado</div><p className="mt-1 text-xs">Seu conteúdo está disponível nesta biblioteca conforme as permissões da sua compra.</p></div><button type="button" onClick={()=>saveProgress.mutate({productKey:product.key,progressPercent:Math.max(1,p?.progress_percent ?? 1),currentLocation:p?.current_location ?? "Início"})} className="w-full rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary">Marcar ponto de leitura</button></div> : <div><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-4 w-4"/> A leitura permanece bloqueada até a confirmação do pagamento.</div><div className="grid gap-2 sm:grid-cols-2"><button disabled={checkout.isPending} onClick={()=>checkout.mutate({productKey:product.key,market:"BR"})} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><ShoppingCart className="h-4 w-4"/> Comprar Brasil</button><button disabled={checkout.isPending} onClick={()=>checkout.mutate({productKey:product.key,market:"INTL"})} className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-3 text-sm font-bold text-primary"><ShoppingCart className="h-4 w-4"/> Comprar exterior</button></div></div>}</div></article>})}</section>

    <section className="s8-card"><h2 className="flex items-center gap-2 font-serif text-2xl"><MessageCircle className="h-5 w-5"/> Comentários</h2><p className="mt-1 text-sm text-muted-foreground">Envie dúvidas ou comentários sobre seus conteúdos. A equipe responde por aqui.</p><div className="mt-4 grid gap-2">{comments.length ? comments.map((c:any)=><div key={c.id} className={`rounded-xl border p-3 text-sm ${c.author_kind === "professional" ? "bg-accent/70" : "bg-background"}`}><p className="text-xs font-bold text-primary">{c.author_label || (c.author_kind === "professional" ? "Equipe LDR Essence" : "Cliente")}</p><p className="mt-1 whitespace-pre-wrap">{c.body}</p></div>) : <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>}</div><div className="mt-4 grid gap-2"><select value={productKey} onChange={e=>setProductKey(e.target.value)} className="rounded-lg border border-border bg-background p-3 text-sm">{data.products.map(p=><option key={p.key} value={p.key}>{p.title}</option>)}</select><textarea value={comment} onChange={e=>setComment(e.target.value)} className="min-h-24 rounded-lg border border-border bg-background p-3 text-sm" placeholder="Escreva seu comentário…"/><button disabled={!comment.trim() || addComment.isPending} onClick={()=>addComment.mutate()} className="justify-self-start rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">Publicar comentário</button></div></section>
  </div>;
}
