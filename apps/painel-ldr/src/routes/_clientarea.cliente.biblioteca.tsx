import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Film, GraduationCap, LockKeyhole, MessageCircle, ReceiptText, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { clientCreateDigitalCheckout, clientDigitalLibrary } from "@/lib/client-portal.functions";
import { clientAddLibraryComment, clientLearningHub } from "@/lib/learning.functions";
import { clientCreateDoMamaoTrainingCheckout, clientDoMamaoTrainingOffer } from "@/lib/training-commerce.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/biblioteca")({ component: ClientLibrary });

type Locale = "pt" | "en" | "fr" | "es";

const COPY = {
  pt: { eyebrow:"A Coragem de Começar", title:"Minha Biblioteca", intro:"Seu espaço exclusivo para leitura e conteúdos. Produtos pagos são liberados somente após confirmação da compra.", orders:"Ver pedidos e pagamentos", paid:"Pagamento recebido.", paidBody:"Estamos confirmando sua compra e liberando o acesso automaticamente.", refresh:"Atualizar acesso", cancelled:"Pagamento cancelado. Nenhum conteúdo foi liberado.", buyState:"Disponível para compra", accessState:"Acesso liberado", value:"Valor", locked:"A leitura permanece bloqueada até a confirmação do pagamento.", buy:"Comprar", access:"Acessar", training:"Treinamento", trainingMeta:"Treinamento · 3 meses · 300 horas", trainingDesc:"Sistema S8, teoria, quizzes, atividades objetivas e escritas, Laboratório de Campo, Projeto de Negócio, fórum e 4 encontros ao vivo.", trainingLocked:"O treinamento completo é liberado somente após a confirmação do pagamento.", buyTraining:"Comprar treinamento", accessTraining:"Acessar treinamento", progress:"Progresso", cohort:"Turma", film:"Filme", filmTitle:"O Menino que Vendia Mamão", filmState:"Em produção", filmText:"Adaptação cinematográfica em desenvolvimento. Ainda não há compra nem conteúdo liberado na Biblioteca.", comments:"Comentários", commentsHelp:"Envie dúvidas ou comentários sobre seus conteúdos. A equipe responde por aqui.", none:"Nenhum comentário ainda.", write:"Escreva seu comentário…", publish:"Publicar comentário", team:"Equipe LDR Essence", client:"Cliente", readerEbook:"Acessar eBook", readerBook:"Acessar livro" },
  en: { eyebrow:"The Courage to Begin", title:"My Library", intro:"Your private space for reading and content. Paid products are unlocked only after payment confirmation.", orders:"View orders and payments", paid:"Payment received.", paidBody:"We are confirming your purchase and unlocking access automatically.", refresh:"Refresh access", cancelled:"Payment cancelled. No content was unlocked.", buyState:"Available to buy", accessState:"Access granted", value:"Price", locked:"Reading remains locked until payment is confirmed.", buy:"Buy", access:"Open", training:"Training", trainingMeta:"Training · 3 months · 300 hours", trainingDesc:"S8 System, theory, quizzes, objective and written activities, Field Lab, Business Project, forum and 4 live meetings.", trainingLocked:"The full training is unlocked only after payment confirmation.", buyTraining:"Buy training", accessTraining:"Open training", progress:"Progress", cohort:"Cohort", film:"Film", filmTitle:"The Boy Who Sold Papaya", filmState:"In production", filmText:"Film adaptation in development. There is no purchase or content available in the Library yet.", comments:"Comments", commentsHelp:"Send questions or comments about your content. The team replies here.", none:"No comments yet.", write:"Write your comment…", publish:"Publish comment", team:"LDR Essence Team", client:"Client", readerEbook:"Open eBook", readerBook:"Open book" },
  fr: { eyebrow:"Le Courage de Commencer", title:"Ma Bibliothèque", intro:"Votre espace privé de lecture et de contenus. Les produits payants sont débloqués uniquement après confirmation du paiement.", orders:"Voir les commandes et paiements", paid:"Paiement reçu.", paidBody:"Nous confirmons votre achat et débloquons automatiquement l’accès.", refresh:"Actualiser l’accès", cancelled:"Paiement annulé. Aucun contenu n’a été débloqué.", buyState:"Disponible à l’achat", accessState:"Accès autorisé", value:"Prix", locked:"La lecture reste verrouillée jusqu’à la confirmation du paiement.", buy:"Acheter", access:"Ouvrir", training:"Formation", trainingMeta:"Formation · 3 mois · 300 heures", trainingDesc:"Système S8, théorie, quiz, activités objectives et écrites, Laboratoire de Terrain, Projet d’Entreprise, forum et 4 rencontres en direct.", trainingLocked:"La formation complète est débloquée uniquement après confirmation du paiement.", buyTraining:"Acheter la formation", accessTraining:"Ouvrir la formation", progress:"Progression", cohort:"Groupe", film:"Film", filmTitle:"Le Garçon qui Vendait des Papayes", filmState:"En production", filmText:"Adaptation cinématographique en développement. Aucun achat ni contenu n’est encore disponible dans la Bibliothèque.", comments:"Commentaires", commentsHelp:"Envoyez vos questions ou commentaires sur vos contenus. L’équipe répond ici.", none:"Aucun commentaire pour le moment.", write:"Écrivez votre commentaire…", publish:"Publier le commentaire", team:"Équipe LDR Essence", client:"Client", readerEbook:"Ouvrir l’eBook", readerBook:"Ouvrir le livre" },
  es: { eyebrow:"El Valor de Empezar", title:"Mi Biblioteca", intro:"Tu espacio privado de lectura y contenidos. Los productos de pago se desbloquean únicamente después de confirmar el pago.", orders:"Ver pedidos y pagos", paid:"Pago recibido.", paidBody:"Estamos confirmando tu compra y liberando el acceso automáticamente.", refresh:"Actualizar acceso", cancelled:"Pago cancelado. No se liberó ningún contenido.", buyState:"Disponible para comprar", accessState:"Acceso liberado", value:"Precio", locked:"La lectura permanece bloqueada hasta la confirmación del pago.", buy:"Comprar", access:"Abrir", training:"Entrenamiento", trainingMeta:"Entrenamiento · 3 meses · 300 horas", trainingDesc:"Sistema S8, teoría, cuestionarios, actividades objetivas y escritas, Laboratorio de Campo, Proyecto de Negocio, foro y 4 encuentros en vivo.", trainingLocked:"El entrenamiento completo se libera únicamente después de confirmar el pago.", buyTraining:"Comprar entrenamiento", accessTraining:"Abrir entrenamiento", progress:"Progreso", cohort:"Grupo", film:"Película", filmTitle:"El Niño que Vendía Papaya", filmState:"En producción", filmText:"Adaptación cinematográfica en desarrollo. Todavía no hay compra ni contenido disponible en la Biblioteca.", comments:"Comentarios", commentsHelp:"Envía dudas o comentarios sobre tus contenidos. El equipo responde aquí.", none:"Aún no hay comentarios.", write:"Escribe tu comentario…", publish:"Publicar comentario", team:"Equipo LDR Essence", client:"Cliente", readerEbook:"Abrir eBook", readerBook:"Abrir libro" },
} as const;

const PRODUCT_COPY = {
  ebook_coragem_comecar: {
    pt: { title:"A Coragem de Começar", desc:"eBook de empreendedorismo, coragem e recomeços." },
    en: { title:"The Courage to Begin", desc:"An eBook about entrepreneurship, courage and new beginnings." },
    fr: { title:"Le Courage de Commencer", desc:"Un eBook sur l’entrepreneuriat, le courage et les nouveaux départs." },
    es: { title:"El Valor de Empezar", desc:"Un eBook sobre emprendimiento, valentía y nuevos comienzos." },
  },
  livro_menino_mamao: {
    pt: { title:"O Menino que Vendia Mamão", desc:"Livro autobiográfico sobre trabalho, recomeços, estratégia e a coragem de continuar construindo." },
    en: { title:"The Boy Who Sold Papaya", desc:"An autobiographical book about work, new beginnings, strategy and the courage to keep building." },
    fr: { title:"Le Garçon qui Vendait des Papayes", desc:"Un livre autobiographique sur le travail, les nouveaux départs, la stratégie et le courage de continuer à construire." },
    es: { title:"El Niño que Vendía Papaya", desc:"Un libro autobiográfico sobre trabajo, nuevos comienzos, estrategia y el valor de seguir construyendo." },
  },
} as const;

function money(cents: number, currency: "BRL" | "EUR", locale: Locale) {
  const code = locale === "pt" ? (currency === "BRL" ? "pt-BR" : "pt-PT") : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";
  return new Intl.NumberFormat(code, { style: "currency", currency }).format(cents / 100);
}

function ClientLibrary() {
  const { locale: currentLocale } = useI18n();
  const locale = (currentLocale === "pt" || currentLocale === "en" || currentLocale === "fr" || currentLocale === "es" ? currentLocale : "pt") as Locale;
  const copy = COPY[locale];
  const fn = useServerFn(clientDigitalLibrary);
  const checkoutFn = useServerFn(clientCreateDigitalCheckout);
  const trainingOfferFn = useServerFn(clientDoMamaoTrainingOffer);
  const trainingCheckoutFn = useServerFn(clientCreateDoMamaoTrainingCheckout);
  const learningFn = useServerFn(clientLearningHub);
  const commentFn = useServerFn(clientAddLibraryComment);
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [productKey, setProductKey] = useState<string>("ebook_coragem_comecar");

  const checkout = useMutation({ mutationFn: (input: { productKey: "ebook_coragem_comecar" | "livro_menino_mamao"; market: "BR" | "INTL" }) => checkoutFn({ data: input }), onSuccess: (result) => { window.location.href = result.url; } });
  const trainingCheckout = useMutation({ mutationFn: (market: "BR" | "INTL") => trainingCheckoutFn({ data: { market } }), onSuccess: (result) => { window.location.href = result.url; } });
  const addComment = useMutation({ mutationFn: () => commentFn({ data: { body: comment, productKey } }), onSuccess: async () => { setComment(""); await queryClient.invalidateQueries({ queryKey: ["client-learning-hub"] }); } });

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const paymentState = params?.get("payment");
  const { data, isLoading, error } = useQuery({ queryKey: ["client-digital-library"], queryFn: () => fn({}) });
  const { data: trainingOffer } = useQuery({ queryKey: ["client-do-mamao-training-offer", paymentState], queryFn: () => trainingOfferFn({}) });
  const { data: learning } = useQuery({ queryKey: ["client-learning-hub"], queryFn: () => learningFn({}) });

  if (isLoading) return <p className="text-sm text-muted-foreground">{locale === "pt" ? "Carregando biblioteca…" : locale === "fr" ? "Chargement de la bibliothèque…" : locale === "es" ? "Cargando biblioteca…" : "Loading library…"}</p>;
  if (error || !data) return <section className="s8-card"><h1 className="font-serif text-2xl">{copy.title}</h1><p className="mt-2 text-sm text-muted-foreground">{locale === "pt" ? "Não foi possível carregar sua biblioteca agora." : locale === "fr" ? "Impossible de charger votre bibliothèque pour le moment." : locale === "es" ? "No fue posible cargar tu biblioteca ahora." : "Your library could not be loaded right now."}</p></section>;

  const comments = learning?.comments?.filter((c: any) => c.product_key) ?? [];
  const progress = learning?.progress ?? [];
  const market: "BR" | "INTL" = data.market === "BR" ? "BR" : "INTL";
  const trainingPrice = trainingOffer ? (market === "BR" ? money(trainingOffer.priceBrlCents, "BRL", locale) : money(trainingOffer.priceEurCents, "EUR", locale)) : market === "BR" ? "R$ 599,99" : "€ 100,56";

  return <div className="min-w-0 space-y-5">
    <section className="s8-card" style={{ background:"linear-gradient(145deg,#4b101d,#2b0a11)", color:"#f7ead8", borderColor:"#b58a44" }}>
      <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{color:"#d6ad63"}}>{copy.eyebrow}</p>
      <h1 className="mt-1 !text-[#f7ead8] font-serif text-3xl sm:text-4xl">{copy.title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 opacity-85">{copy.intro}</p>
      <a href="/cliente/pedidos" className="mt-4 inline-flex min-h-11 items-center gap-2 break-words text-sm font-bold underline"><ReceiptText className="h-4 w-4 shrink-0" /> {copy.orders}</a>
    </section>

    {paymentState === "success" ? <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>{copy.paid}</strong> {copy.paidBody}<button type="button" className="ml-2 font-bold underline" onClick={async () => { await Promise.all([queryClient.invalidateQueries({queryKey:["client-digital-library"]}), queryClient.invalidateQueries({queryKey:["client-do-mamao-training-offer"]}), queryClient.invalidateQueries({queryKey:["client-learning-hub"]})]); }}>{copy.refresh}</button></section> : paymentState === "cancel" ? <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{copy.cancelled}</section> : null}

    <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={copy.title}>
      {data.products.map((product) => {
        const p = progress.find((x: any) => x.product_key === product.key);
        const regionalPrice = market === "BR" ? money(product.priceBrlCents, "BRL", locale) : money(product.priceEurCents, "EUR", locale);
        const pc = PRODUCT_COPY[product.key][locale];
        const readerLabel = product.key === "ebook_coragem_comecar" ? copy.readerEbook : copy.readerBook;
        return <article key={product.key} className="s8-card flex min-h-[360px] min-w-0 flex-col overflow-hidden">
          <div className="flex min-w-0 items-start justify-between gap-3"><div className="shrink-0 rounded-xl border border-border bg-accent/50 p-3 text-primary"><BookOpen className="h-6 w-6" /></div><span className={`max-w-[65%] rounded-full px-3 py-1 text-center text-xs font-bold ${product.entitled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{product.entitled ? copy.accessState : copy.buyState}</span></div>
          <h2 className="mt-5 break-words font-serif text-2xl">{pc.title}</h2><p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{pc.desc}</p>
          {p && product.entitled ? <div className="mt-4 rounded-xl bg-accent/50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-primary">{copy.progress}</p><p className="mt-1 text-sm">{p.current_location || ""}{p.current_location ? " · " : ""}{p.progress_percent}%</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-border"><div className="h-full bg-primary" style={{width:`${p.progress_percent}%`}} /></div></div> : null}
          <div className="mt-4 rounded-xl border border-border bg-background/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.value}</p><p className="mt-1 font-bold text-primary">{regionalPrice}</p></div>
          <div className="mt-auto pt-5">{product.entitled ? <a href={`/cliente/biblioteca/${product.key}`} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">{readerLabel}</a> : <><div className="mb-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" /> {copy.locked}</div><button type="button" disabled={checkout.isPending} onClick={() => checkout.mutate({productKey:product.key,market})} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"><ShoppingCart className="h-4 w-4" /> {copy.buy}</button></>}</div>
        </article>;
      })}

      <article className="s8-card flex min-h-[360px] min-w-0 flex-col overflow-hidden" data-product="do-mamao-ao-negocio" style={{borderColor:"#b58a44"}}>
        <div className="flex items-start justify-between gap-3"><div className="shrink-0 rounded-xl border p-3" style={{borderColor:"#b58a44",background:"#4b101d",color:"#d6ad63"}}><GraduationCap className="h-6 w-6" /></div><span className={`max-w-[65%] rounded-full px-3 py-1 text-center text-xs font-bold ${trainingOffer?.entitled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{trainingOffer?.entitled ? copy.accessState : copy.buyState}</span></div>
        <p className="mt-5 break-words text-xs font-bold uppercase tracking-[.14em]" style={{color:"#b58a44"}}>{copy.trainingMeta}</p><h2 className="mt-1 break-words font-serif text-2xl">Do Mamão ao Negócio</h2><p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{copy.trainingDesc}</p>
        {trainingOffer?.entitled ? <div className="mt-4 rounded-xl bg-accent/50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-primary">{copy.progress}</p><p className="mt-1 text-sm">{trainingOffer.progressPercent}%{trainingOffer.cohortNumber ? ` · ${copy.cohort} ${trainingOffer.cohortNumber}` : ""}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-border"><div className="h-full bg-primary" style={{width:`${trainingOffer.progressPercent}%`}} /></div></div> : null}
        <div className="mt-4 rounded-xl border border-border bg-background/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.value}</p><p className="mt-1 font-bold text-primary">{trainingPrice}</p></div>
        <div className="mt-auto pt-5">{trainingOffer?.entitled ? <a href="/cliente/treinamentos/do-mamao-ao-negocio" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">{copy.accessTraining}</a> : <><div className="mb-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" /> {copy.trainingLocked}</div><button type="button" disabled={trainingCheckout.isPending || !trainingOffer} onClick={() => trainingCheckout.mutate(market)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"><ShoppingCart className="h-4 w-4" /> {copy.buyTraining}</button></>}</div>
      </article>

      <article className="s8-card flex min-h-[360px] min-w-0 flex-col overflow-hidden" data-product="filme-menino-mamao">
        <div className="flex items-start justify-between gap-3"><div className="shrink-0 rounded-xl border border-border bg-accent/50 p-3 text-primary"><Film className="h-6 w-6" /></div><span className="rounded-full bg-amber-100 px-3 py-1 text-center text-xs font-bold text-amber-900">{copy.filmState}</span></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-primary">{copy.film}</p><h2 className="mt-1 break-words font-serif text-2xl">{copy.filmTitle}</h2><p className="mt-3 break-words text-sm leading-6 text-muted-foreground">{copy.filmText}</p>
      </article>
    </section>

    <section className="s8-card min-w-0"><h2 className="flex items-center gap-2 font-serif text-2xl"><MessageCircle className="h-5 w-5 shrink-0" /> {copy.comments}</h2><p className="mt-1 break-words text-sm text-muted-foreground">{copy.commentsHelp}</p><div className="mt-4 grid gap-2">{comments.length ? comments.map((c:any) => <div key={c.id} className={`min-w-0 rounded-xl border p-3 text-sm ${c.author_kind === "professional" ? "bg-accent/70" : "bg-background"}`}><p className="text-xs font-bold text-primary">{c.author_label || (c.author_kind === "professional" ? copy.team : copy.client)}</p><p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p></div>) : <p className="text-sm text-muted-foreground">{copy.none}</p>}</div><div className="mt-4 grid gap-2"><select value={productKey} onChange={(e)=>setProductKey(e.target.value)} className="min-h-11 rounded-lg border border-border bg-background p-3 text-sm">{data.products.map((p)=><option key={p.key} value={p.key}>{PRODUCT_COPY[p.key][locale].title}</option>)}<option value="do-mamao-ao-negocio">Do Mamão ao Negócio</option></select><textarea value={comment} onChange={(e)=>setComment(e.target.value)} className="min-h-24 rounded-lg border border-border bg-background p-3 text-sm" placeholder={copy.write} /><button type="button" disabled={!comment.trim() || addComment.isPending} onClick={()=>addComment.mutate()} className="min-h-11 justify-self-start rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{copy.publish}</button></div></section>
  </div>;
}
