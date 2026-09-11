import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Film, GraduationCap, MessageCircle, ReceiptText, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { clientCreateDigitalCheckout, clientDigitalLibrary } from "@/lib/client-portal.functions";
import { clientCreateLibrarySubscriptionCheckout, clientLibrarySubscription, clientSetLibrarySubscriptionCancellation } from "@/lib/library-subscription.functions";
import { clientAddLibraryComment, clientLearningHub } from "@/lib/learning.functions";
import { clientCreateDoMamaoTrainingCheckout, clientDoMamaoTrainingOffer } from "@/lib/training-commerce.functions";
import { clientCreatePsychoanalysisCheckout, clientPsychoanalysisOffer } from "@/lib/psychoanalysis-commerce.functions";
import { clientCreateBriefTherapyCheckout, clientBriefTherapyOffer } from "@/lib/brief-therapy-commerce.functions";
import { clientCreateMassotherapyCheckout, clientMassotherapyOffer } from "@/lib/massotherapy-commerce.functions";
import { clientBusiness24Offer, clientCreateBusiness24Checkout } from "@/lib/business24-commerce.functions";
import { clientCreateMentorshipCheckout, clientMentorshipOffer } from "@/lib/mentorship-commerce.functions";
import { clientCreateLeadershipCheckout, clientLeadershipOffer } from "@/lib/leadership-commerce.functions";
import { clientEnrollFreeCareerCourse, clientFreeCareerCourse } from "@/lib/free-career-course.functions";
import { clientEnrollFreeFrenchA1, clientFreeFrenchA1 } from "@/lib/free-french-a1.functions";
import { clientEnrollFreeFirstAid, clientFreeFirstAid } from "@/lib/free-first-aid.functions";
import { useI18n } from "@/lib/i18n";
import { UNDERGRADUATE_COURSES } from "@/lib/undergraduate.catalog";

export const Route=createFileRoute("/_clientarea/cliente/biblioteca")({component:ClientLibraryRoute});

function ClientLibraryRoute(){
  const location=useLocation();
  const pathname=location.pathname.replace(/\/+$/,"")||"/";
  if(pathname!=="/cliente/biblioteca")return <Outlet/>;
  return <ClientLibrary/>;
}

type Locale="pt"|"en"|"fr"|"es";

const TXT={
  pt:{title:"Minha Biblioteca",intro:"Seu espaço exclusivo para leitura, formação e conteúdos.",orders:"Ver pedidos e pagamentos",access:"Acesso liberado",buy:"Comprar",start:"Começar gratuitamente",open:"Acessar curso",comments:"Comentários"},
  en:{title:"My Library",intro:"Your private space for reading, training and content.",orders:"View orders and payments",access:"Access granted",buy:"Buy",start:"Start for free",open:"Open course",comments:"Comments"},
  fr:{title:"Ma Bibliothèque",intro:"Votre espace privé de lecture, formation et contenus.",orders:"Voir les commandes et paiements",access:"Accès autorisé",buy:"Acheter",start:"Commencer gratuitement",open:"Ouvrir le cours",comments:"Commentaires"},
  es:{title:"Mi Biblioteca",intro:"Tu espacio privado de lectura, formación y contenidos.",orders:"Ver pedidos y pagos",access:"Acceso liberado",buy:"Comprar",start:"Comenzar gratis",open:"Abrir curso",comments:"Comentarios"}
} as const;

const SUB_TXT={
  pt:{eyebrow:"ACESSO TOTAL",title:"Assine a Biblioteca LDR",desc:"Uma única assinatura para acessar todos os conteúdos digitais pagos da biblioteca enquanto estiver ativa. Compras avulsas continuam com acesso vitalício.",included:"Cursos, formações, treinamentos, eBooks e livros digitais incluídos",subscribe:"ASSINAR AGORA",active:"Assinatura ativa",cancel:"Cancelar ao fim do período",keep:"Manter assinatura",ending:"Cancelamento agendado"},
  en:{eyebrow:"ALL ACCESS",title:"Subscribe to Biblioteca LDR",desc:"One subscription gives access to all paid digital library content while active. One-time purchases keep lifetime access.",included:"Courses, training, eBooks and digital books included",subscribe:"SUBSCRIBE NOW",active:"Active subscription",cancel:"Cancel at period end",keep:"Keep subscription",ending:"Cancellation scheduled"},
  fr:{eyebrow:"ACCÈS TOTAL",title:"Abonnez-vous à Biblioteca LDR",desc:"Un seul abonnement donne accès à tous les contenus numériques payants tant qu'il reste actif. Les achats à l'unité restent accessibles à vie.",included:"Cours, formations, eBooks et livres numériques inclus",subscribe:"S'ABONNER",active:"Abonnement actif",cancel:"Annuler à la fin de la période",keep:"Maintenir l'abonnement",ending:"Annulation programmée"},
  es:{eyebrow:"ACCESO TOTAL",title:"Suscríbete a Biblioteca LDR",desc:"Una sola suscripción da acceso a todos los contenidos digitales de pago mientras esté activa. Las compras individuales mantienen acceso de por vida.",included:"Cursos, formaciones, eBooks y libros digitales incluidos",subscribe:"SUSCRIBIRME",active:"Suscripción activa",cancel:"Cancelar al final del período",keep:"Mantener suscripción",ending:"Cancelación programada"}
} as const;

function money(c:number,cur:"BRL"|"EUR",locale:Locale){
  return new Intl.NumberFormat(locale==="pt"?(cur==="BRL"?"pt-BR":"pt-PT"):locale==="fr"?"fr-FR":locale==="es"?"es-ES":"en-US",{style:"currency",currency:cur}).format(c/100);
}

function ClientLibrary(){
  const {locale:raw}=useI18n();
  const locale=(raw==="pt"||raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as Locale;
  const t=TXT[locale];
  const subscriptionFn=useServerFn(clientLibrarySubscription),
    subscriptionCheckoutFn=useServerFn(clientCreateLibrarySubscriptionCheckout),
    subscriptionCancelFn=useServerFn(clientSetLibrarySubscriptionCancellation),
    fn=useServerFn(clientDigitalLibrary),
    checkoutFn=useServerFn(clientCreateDigitalCheckout),
    trainingFn=useServerFn(clientDoMamaoTrainingOffer),
    trainingCheckoutFn=useServerFn(clientCreateDoMamaoTrainingCheckout),
    psychoFn=useServerFn(clientPsychoanalysisOffer),
    briefFn=useServerFn(clientBriefTherapyOffer),
    massageFn=useServerFn(clientMassotherapyOffer),
    business24Fn=useServerFn(clientBusiness24Offer),
    psychoCheckoutFn=useServerFn(clientCreatePsychoanalysisCheckout),
    briefCheckoutFn=useServerFn(clientCreateBriefTherapyCheckout),
    massageCheckoutFn=useServerFn(clientCreateMassotherapyCheckout),
    business24CheckoutFn=useServerFn(clientCreateBusiness24Checkout),
    mentorFn=useServerFn(clientMentorshipOffer),
    mentorCheckoutFn=useServerFn(clientCreateMentorshipCheckout),
    leaderFn=useServerFn(clientLeadershipOffer),
    leaderCheckoutFn=useServerFn(clientCreateLeadershipCheckout),
    freeFn=useServerFn(clientFreeCareerCourse),
    freeEnrollFn=useServerFn(clientEnrollFreeCareerCourse),
    frenchFn=useServerFn(clientFreeFrenchA1),
    frenchEnrollFn=useServerFn(clientEnrollFreeFrenchA1),
    firstAidFn=useServerFn(clientFreeFirstAid),
    firstAidEnrollFn=useServerFn(clientEnrollFreeFirstAid),
    learningFn=useServerFn(clientLearningHub),
    commentFn=useServerFn(clientAddLibraryComment);

  const qc=useQueryClient();
  const [active,setActive]=useState<string|null>(null);
  const [comment,setComment]=useState("");
  const [productKey,setProductKey]=useState("ebook_coragem_comecar");

  const {data,isLoading}=useQuery({queryKey:["client-digital-library"],queryFn:()=>fn({})});
  const {data:subscriptionData,refetch:refetchSubscription}=useQuery({queryKey:["library-subscription"],queryFn:()=>subscriptionFn({})});
  const {data:training}=useQuery({queryKey:["training-offer"],queryFn:()=>trainingFn({})});
  const {data:psycho}=useQuery({queryKey:["psycho-offer"],queryFn:()=>psychoFn({})});
  const {data:brief}=useQuery({queryKey:["brief-therapy-offer"],queryFn:()=>briefFn({})});
  const {data:massage}=useQuery({queryKey:["massotherapy-offer"],queryFn:()=>massageFn({})});
  const {data:business24}=useQuery({queryKey:["business24-offer"],queryFn:()=>business24Fn({})});
  const {data:mentor}=useQuery({queryKey:["mentor-offer"],queryFn:()=>mentorFn({})});
  const {data:leader}=useQuery({queryKey:["leader-offer"],queryFn:()=>leaderFn({})});
  const {data:free,refetch:refetchFree}=useQuery({queryKey:["free-career-offer"],queryFn:()=>freeFn({})});
  const {data:french,refetch:refetchFrench}=useQuery({queryKey:["free-french-a1-offer"],queryFn:()=>frenchFn({})});
  const {data:firstAid,refetch:refetchFirstAid}=useQuery({queryKey:["free-first-aid-offer"],queryFn:()=>firstAidFn({})});
  const {data:learning}=useQuery({queryKey:["client-learning-hub"],queryFn:()=>learningFn({})});

  const subscriptionCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>subscriptionCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const subscriptionCancel=useMutation({mutationFn:(cancelAtPeriodEnd:boolean)=>subscriptionCancelFn({data:{cancelAtPeriodEnd}}),onSuccess:()=>refetchSubscription()});
  const checkout=useMutation({mutationFn:(x:{productKey:"ebook_coragem_comecar"|"livro_menino_mamao";market:"BR"|"INTL"})=>checkoutFn({data:x}),onSuccess:r=>location.href=r.url});
  const trainingCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>trainingCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const psychoCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>psychoCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const briefCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>briefCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const massageCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>massageCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const business24Checkout=useMutation({mutationFn:(m:"BR"|"INTL")=>business24CheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const mentorCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>mentorCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const leaderCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>leaderCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});
  const enrollFree=useMutation({mutationFn:()=>freeEnrollFn({}),onSuccess:()=>refetchFree()});
  const enrollFrench=useMutation({mutationFn:()=>frenchEnrollFn({}),onSuccess:()=>refetchFrench()});
  const enrollFirstAid=useMutation({mutationFn:()=>firstAidEnrollFn({}),onSuccess:()=>refetchFirstAid()});
  const addComment=useMutation({mutationFn:()=>commentFn({data:{body:comment,productKey}}),onSuccess:async()=>{setComment("");await qc.invalidateQueries({queryKey:["client-learning-hub"]})}});

  if(isLoading||!data)return <p className="text-sm text-muted-foreground">Carregando biblioteca…</p>;

  const market:"BR"|"INTL"=data.market==="BR"?"BR":"INTL";
  const owner=(data.customer?.email??"").trim().toLowerCase()==="llucianouam@gmail.com";
  const ebook=data.products.find(p=>p.key==="ebook_coragem_comecar"),book=data.products.find(p=>p.key==="livro_menino_mamao");
  const ent={ebook:owner||!!ebook?.entitled,book:owner||!!book?.entitled,training:owner||!!training?.entitled,psycho:owner||!!psycho?.entitled,brief:owner||!!brief?.entitled,massage:owner||!!massage?.entitled,business24:owner||!!business24?.entitled,mentor:owner||!!mentor?.entitled,leader:owner||!!leader?.entitled,free:owner||!!free?.entitled,french:owner||!!french?.entitled,firstAid:owner||!!firstAid?.entitled};
  const comments=learning?.comments?.filter((c:any)=>c.product_key)??[];
  const card=(key:string,label:string,bg:string,icon="grad")=><button onClick={()=>setActive(active===key?null:key)} className={`min-w-0 rounded-2xl px-1 py-4 text-center text-white shadow-sm ${bg} ${active===key?"ring-2 ring-[#d6ad63]":""}`}>{icon==="book"?<BookOpen className="mx-auto h-5 w-5"/>:icon==="film"?<Film className="mx-auto h-5 w-5"/>:<GraduationCap className="mx-auto h-5 w-5"/>}<p className="mt-2 text-[8px] font-black leading-none sm:text-[10px]">{label}</p></button>;
  const buyFormation=(kind:"psycho"|"brief"|"massage"|"mentor"|"leader",mut:any,color:string)=><button onClick={()=>mut.mutate(market)} className={`mt-3 w-full rounded-xl ${color} px-4 py-3 text-sm font-black text-white`}><ShoppingCart className="mr-2 inline h-4 w-4"/>Quero começar minha formação</button>;
  const postgrads=[
    {key:"ia-negocios-gestao",icon:"🤖",title:"Inteligência Artificial Aplicada aos Negócios e à Gestão",highlight:true},
    {key:"gestao-pessoas-lideranca-rh",icon:"👥",title:"Gestão Estratégica de Pessoas, Liderança e RH"},
    {key:"empreendedorismo-inovacao-negocios",icon:"🚀",title:"Empreendedorismo, Inovação e Gestão de Negócios"},
    {key:"carreira-mentoria-desenvolvimento",icon:"💼",title:"Gestão de Carreira, Mentoria e Desenvolvimento Profissional"},
    {key:"marketing-vendas-ia",icon:"📈",title:"Marketing Digital, Vendas e Inteligência Artificial"},
    {key:"negocios-internacionais-expansao",icon:"🌍",title:"Negócios Internacionais e Expansão de Empresas"},
    {key:"psicanalise-cultura-comportamento",icon:"🧠",title:"Psicanálise, Cultura e Comportamento Organizacional"}
  ];

  return <div className="min-w-0 space-y-6 pb-8">
    <section className="rounded-[28px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#102d50] px-5 py-7 text-white shadow-xl sm:px-8">
      <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#d6ad63]">LDR Plataforma</p>
      <h1 className="mt-2 font-serif text-4xl text-[#fff7e7]">{t.title}</h1>
      <p className="mt-2 text-sm text-white/75">{t.intro}</p>
      <a href="/cliente/pedidos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold"><ReceiptText className="h-4 w-4"/>{t.orders}</a>
    </section>

    <section className="rounded-[28px] border border-[#d6ad63]/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#a77b2e]">{SUB_TXT[locale].eyebrow}</p>
          <h2 className="mt-1 font-serif text-2xl text-[#0b2341]">{SUB_TXT[locale].title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{SUB_TXT[locale].desc}</p>
          <p className="mt-3 text-xs font-bold text-[#0b2341]">✓ {SUB_TXT[locale].included}</p>
        </div>
        <div className="w-full shrink-0 rounded-2xl bg-[#071426] p-4 text-white sm:w-[280px]">
          <p className="text-xs text-white/70">{subscriptionData?.active?SUB_TXT[locale].active:subscriptionData?.promoActive?(locale==="pt"?"PROMOÇÃO 24H · 50% OFF NO 1º MÊS":locale==="fr"?"PROMO 24H · -50% LE 1ER MOIS":locale==="es"?"PROMO 24H · 50% EN EL 1ER MES":"24H PROMO · 50% OFF FIRST MONTH"):SUB_TXT[locale].title}</p>
          {!subscriptionData?.active&&subscriptionData?.promoActive?<>
            <p className="mt-2 text-xs text-white/55 line-through">{market==="BR"?money(subscriptionData?.priceBrlCents??3990,"BRL",locale):money(subscriptionData?.priceEurCents??990,"EUR",locale)} / mês</p>
            <p className="mt-1 text-3xl font-black text-[#ffd84d]">{market==="BR"?money(subscriptionData?.promoFirstBrlCents??1995,"BRL",locale):money(subscriptionData?.promoFirstEurCents??495,"EUR",locale)}<span className="text-xs font-medium text-white/70"> / primeiro mês</span></p>
            <p className="mt-2 text-xs font-bold text-white/80">{locale==="pt"?"A partir do 2º mês: ":locale==="fr"?"À partir du 2e mois : ":locale==="es"?"Desde el 2º mes: ":"From month 2: "}{market==="BR"?money(subscriptionData?.priceBrlCents??3990,"BRL",locale):money(subscriptionData?.priceEurCents??990,"EUR",locale)} / mês</p>
          </>:<p className="mt-1 text-2xl font-black text-[#f2cf83]">{market==="BR"?money(subscriptionData?.priceBrlCents??3990,"BRL",locale):money(subscriptionData?.priceEurCents??990,"EUR",locale)}<span className="text-xs font-medium text-white/65"> / mês</span></p>}
          {subscriptionData?.active?<div className="mt-3"><p className="text-xs text-white/75">{subscriptionData?.subscription?.cancel_at_period_end?SUB_TXT[locale].ending:"Renovação automática"}</p><button disabled={subscriptionCancel.isPending} onClick={()=>subscriptionCancel.mutate(!subscriptionData?.subscription?.cancel_at_period_end)} className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-xs font-black text-[#071426]">{subscriptionData?.subscription?.cancel_at_period_end?SUB_TXT[locale].keep:SUB_TXT[locale].cancel}</button></div>:<button disabled={subscriptionCheckout.isPending} onClick={()=>subscriptionCheckout.mutate(market)} className="mt-3 w-full rounded-xl bg-[#d6ad63] px-4 py-3 text-sm font-black text-[#281605]">{SUB_TXT[locale].subscribe}</button>}
        </div>
      </div>
    </section>

    <section className="rounded-[28px] border bg-background/90 p-4 shadow-sm sm:p-6">
      <h2 className="font-serif text-2xl">{t.title}</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">Seus conteúdos e próximos passos em um só lugar.</p>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-10 sm:gap-3">
        {card("ebook","eBooks","bg-[#5b0824]","book")}
        {card("book","Livros","bg-[#5b0824]","book")}
        <a href="/cliente/biblioteca/jornal-ldr" className="min-w-0 rounded-2xl bg-[#0b2341] px-1 py-4 text-center text-white shadow-sm"><div className="mx-auto text-lg">📰</div><p className="mt-2 text-[8px] font-black leading-none sm:text-[10px]">Jornal LDR</p><p className="mt-1 text-[7px] text-white/70">0,90/mês</p></a>
        <a href="/cliente/biblioteca/revista-ldr" className="min-w-0 rounded-2xl bg-[#6b0d2b] px-1 py-4 text-center text-white shadow-sm"><div className="mx-auto text-lg">📖</div><p className="mt-2 text-[8px] font-black leading-none sm:text-[10px]">Revista LDR</p><p className="mt-1 text-[7px] text-white/70">0,90/mês</p></a>
        {card("training","Negócios","bg-[#d6ad63]")}
        {card("psycho","Psicanálise","bg-[#5b2b86]")}
        {card("brief","Terapia Breve","bg-[#17645e]")}
        {card("massage","Massoterapia","bg-[#0F5E7A]")}
        <a href="/cliente/orientacao-psicanalitica" className="min-w-0 rounded-2xl bg-[#263b63] px-1 py-4 text-center text-white shadow-sm"><span className="mx-auto block text-lg">✍️</span><p className="mt-2 text-[8px] font-black leading-none sm:text-[10px]">Orientação Escrita</p></a>
        {card("business24","Negócio 24h","bg-[#c85a24]")}
        {card("mentor","Mentoria","bg-[#0b5cab]")}
        {card("leader","Liderança","bg-[#0f5132]")}
        {card("hr","RH 600h","bg-[#047857]")}
        {card("free","Gratuito","bg-[#b85c2e]","book")}
        {card("ai","IA","bg-[#143d59]")}
        {card("film","Filme","bg-[#35101e]","film")}
      </div>
      {active?<div className="mt-4 rounded-2xl border bg-white p-5 shadow-inner">
        {active==="hr"?<div className="rounded-2xl border border-[#a7d7c1] bg-gradient-to-br from-[#f3fbf7] to-[#ecfdf5] p-5">
          <span className="rounded-full bg-[#047857] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-white">100% GRATUITA · 600 HORAS</span>
          <h3 className="mt-4 font-serif text-2xl text-[#065f46]">Formação em Gestão de Pessoas e Recursos Humanos</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">12 módulos · 600 horas · 100% online · leitura e atividades · estude no seu ritmo.</p>
          <a href="/cliente/formacoes/gestao-pessoas-rh" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#047857] px-4 py-3 text-sm font-black text-white">COMEÇAR GRATUITAMENTE</a>
        </div>:active==="free"?<div>
          <div className="mb-4 flex items-center justify-between gap-3"><div><span className="rounded-full bg-[#fff0e8] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#9a4828]">Cursos gratuitos</span><h3 className="mt-3 font-serif text-2xl text-[#5d2917]">Escolha seu curso gratuito</h3></div><span className="rounded-full bg-[#0b2341] px-3 py-1 text-xs font-black text-white">3 cursos</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[#efd0bf] bg-[#fffaf7] p-4"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#9a4828]">Carreira</span><h4 className="mt-2 font-serif text-xl text-[#5d2917]">Como Organizar sua Carreira e Dar o Próximo Passo Profissional</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">7 aulas · 7 dias · 15–20 min/dia · 100% leitura · sem aulas ao vivo · acesso sem expiração.</p>{ent.free?<a href="/cliente/cursos/organizar-carreira" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#b85c2e] px-4 py-3 text-sm font-black text-white">{t.open}</a>:<button disabled={enrollFree.isPending} onClick={()=>enrollFree.mutate()} className="mt-4 w-full rounded-xl bg-[#b85c2e] px-4 py-3 text-sm font-black text-white">{t.start}</button>}</article>
            <article className="rounded-2xl border border-[#8ca7c5] bg-gradient-to-br from-[#f8fbff] to-[#fff8f8] p-4"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#123f73]">🇫🇷 Francês · A1</span><h4 className="mt-2 font-serif text-xl text-[#0b294a]">Francês Básico para Negócios — Nível A1</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">30 aulas · 30 dias · 10 horas · 100% leitura · sem aulas ao vivo · acesso sem expiração.</p>{ent.french?<a href="/cliente/cursos/frances-negocios-a1" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#123f73] px-4 py-3 text-sm font-black text-white">{t.open}</a>:<button disabled={enrollFrench.isPending} onClick={()=>enrollFrench.mutate()} className="mt-4 w-full rounded-xl bg-[#123f73] px-4 py-3 text-sm font-black text-white">{t.start}</button>}</article>
            <article className="rounded-2xl border border-[#efb2b2] bg-gradient-to-br from-[#fffafa] to-[#fff3f3] p-4"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#b4232a]">⛑️ Primeiros Socorros</span><h4 className="mt-2 font-serif text-xl text-[#7f1d1d]">Primeiros Socorros — Noções Básicas</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">30 aulas · 30 dias · 10 horas · 100% leitura · sem aulas ao vivo · acesso sem expiração.</p>{ent.firstAid?<a href="/cliente/cursos/primeiros-socorros" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#b4232a] px-4 py-3 text-sm font-black text-white">{t.open}</a>:<button disabled={enrollFirstAid.isPending} onClick={()=>enrollFirstAid.mutate()} className="mt-4 w-full rounded-xl bg-[#b4232a] px-4 py-3 text-sm font-black text-white">{t.start}</button>}</article>
          </div>
        </div>:active==="ai"?<div className="rounded-2xl border border-[#9ec1d6] bg-gradient-to-br from-[#f5fbff] to-[#eef5f8] p-5"><span className="rounded-full bg-[#143d59] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-white">EM BREVE</span><h3 className="mt-4 font-serif text-2xl text-[#143d59]">🤖 Inteligência Artificial Aplicada ao Trabalho e aos Negócios</h3><p className="mt-3 text-base font-black text-[#143d59]">O melhor curso de Inteligência Artificial você vai encontrar aqui.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Do zero à aplicação prática da IA no trabalho, nos negócios e na produtividade.</p><div className="mt-4 w-full rounded-xl border border-[#143d59]/20 bg-white px-4 py-3 text-center text-sm font-black text-[#143d59]">🔒 Em breve na Biblioteca LDR</div></div>:active==="ebook"&&ebook?<div><h3 className="font-serif text-xl">A Coragem de Começar</h3>{ent.ebook?<a href="/cliente/biblioteca/ebook_coragem_comecar" className="mt-4 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Acessar eBook</a>:<button onClick={()=>checkout.mutate({productKey:"ebook_coragem_comecar",market})} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-white">{t.buy}</button>}</div>:active==="book"&&book?<div><h3 className="font-serif text-xl">O Menino que Vendia Mamão</h3>{ent.book?<a href="/cliente/biblioteca/livro_menino_mamao" className="mt-4 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Acessar livro</a>:<button onClick={()=>checkout.mutate({productKey:"livro_menino_mamao",market})} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-white">{t.buy}</button>}</div>:active==="training"?<div><h3 className="font-serif text-xl">Do Mamão ao Negócio</h3><p className="mt-2 text-sm text-muted-foreground">Formação para empreendedores, atividades práticas e percurso estruturado.</p>{ent.training?<a href="/cliente/treinamentos/do-mamao-ao-negocio" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#d6ad63] px-4 py-3 font-bold text-[#281605]">Acessar treinamento</a>:<button onClick={()=>trainingCheckout.mutate(market)} className="mt-4 w-full rounded-xl bg-[#d6ad63] px-4 py-3 font-bold text-[#281605]">{market==="BR"?money(training?.priceBrlCents??29999,"BRL",locale):money(training?.priceEurCents??4990,"EUR",locale)}</button>}</div>:active==="psycho"?<div><h3 className="font-serif text-xl text-[#32155c]">Formação Online em Psicanálise</h3><p className="mt-2 text-sm text-muted-foreground">14 módulos · 220 unidades · percurso formativo completo.</p>{ent.psycho?<a href="/cliente/treinamentos/psicanalise" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#5b2b86] px-4 py-3 font-black text-white">Acessar formação</a>:buyFormation("psycho",psychoCheckout,"bg-[#5b2b86]")}</div>:active==="business24"?<div><h3 className="font-serif text-xl text-[#8a3b17]">Formação Negócio em 24 Horas</h3><p className="mt-2 text-sm text-muted-foreground">9 módulos · 90 aulas · 360 horas · 100% online · sem encontros ao vivo · projeto final avaliado.</p>{ent.business24?<a href="/cliente/treinamentos/negocio-24-horas" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#c85a24] px-4 py-3 font-black text-white">Acessar formação</a>:<button onClick={()=>business24Checkout.mutate(market)} className="mt-4 w-full rounded-xl bg-[#c85a24] px-4 py-3 font-black text-white">Quero começar · {market==="BR"?money(business24?.priceBrlCents??29999,"BRL",locale):money(business24?.priceEurCents??4990,"EUR",locale)}</button>}</div>:active==="brief"?<div><h3 className="font-serif text-xl text-[#103d3a]">Formação em Terapia Breve Psicanalítica</h3><p className="mt-2 text-sm text-muted-foreground">15 módulos · 300 aulas · 1.200 horas · 6 encontros ao vivo.</p>{ent.brief?<a href="/cliente/treinamentos/terapia-breve-psicanalitica" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#17645e] px-4 py-3 font-black text-white">Acessar formação</a>:buyFormation("brief",briefCheckout,"bg-[#17645e]")}</div>:active==="massage"?<div><h3 className="font-serif text-xl text-[#083B50]">Formação Completa em Massoterapia</h3><p className="mt-2 text-sm text-muted-foreground">15 módulos · 300 aulas · 1.200 horas · 6 a 12 meses · 100% online · sem encontros ao vivo.</p>{ent.massage?<a href="/cliente/treinamentos/massoterapia" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#0F5E7A] px-4 py-3 font-black text-white">Acessar formação</a>:buyFormation("massage",massageCheckout,"bg-[#0F5E7A]")}</div>:active==="mentor"?<div><h3 className="font-serif text-xl text-[#0f2f57]">Formação em Mentoria Profissional e de Carreira</h3><p className="mt-2 text-sm text-muted-foreground">3 meses · 90 aulas · 1 aula/dia · ≈40 min/dia · acesso digital vitalício.</p>{ent.mentor?<a href="/cliente/treinamentos/mentoria-carreira" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#0b5cab] px-4 py-3 font-black text-white">Acessar formação</a>:buyFormation("mentor",mentorCheckout,"bg-[#0b5cab]")}</div>:active==="leader"?<div><h3 className="font-serif text-xl text-[#0f5132]">Formação em Liderança e Gestão de Pessoas</h3><p className="mt-2 text-sm text-muted-foreground">3 meses · 90 aulas · 1 aula/dia · ≈40 min/dia · acesso digital vitalício.</p>{ent.leader?<a href="/cliente/treinamentos/lideranca-gestao" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#0f5132] px-4 py-3 font-black text-white">Acessar formação</a>:buyFormation("leader",leaderCheckout,"bg-[#0f5132]")}</div>:<div><h3 className="font-serif text-xl">O Menino que Vendia Mamão</h3><p className="mt-2 text-sm text-muted-foreground">Filme em produção. Ainda não há conteúdo liberado.</p></div>}
      </div>:null}
    </section>

        <section className="rounded-[28px] border border-[#d6ad63]/40 bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#163b67] p-5 text-white shadow-lg sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><span className="rounded-full bg-[#d6ad63] px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-[#281605]">🎓 Graduações · Em breve</span><h2 className="mt-4 font-serif text-3xl text-[#fff7e7]">Futuras graduações LDR</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">Propostas acadêmicas preliminares em modelo Live Semipresencial. Conheça as grades e registre seu interesse no lançamento.</p></div><span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold">A partir de R$ 99,90/mês*</span></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{UNDERGRADUATE_COURSES.map(course=><article key={course.key} className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-sm backdrop-blur"><div className="flex items-start justify-between gap-3"><div className="text-3xl">{course.icon}</div><span className="rounded-full bg-[#d6ad63] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[#281605]">Em breve</span></div><h3 className="mt-4 font-serif text-xl leading-snug text-white">{course.title}</h3><div className="mt-4 space-y-1.5 text-xs text-white/78"><p><b className="text-white">Duração prevista:</b> {course.years} anos · {course.semesters} semestres</p><p><b className="text-white">Modalidade:</b> 🔴 Live + 🏫 Semipresencial</p><p><b className="text-white">Valor:</b> a partir de R$ 99,90/mês*</p></div><a href={`/cliente/graduacao/${course.key}`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#d6ad63] px-4 py-3 text-sm font-black text-[#281605]">CONHECER A PROPOSTA</a></article>)}</div>
      <p className="mt-5 text-[11px] leading-5 text-white/60">*Valor de referência para pré-lançamento. Duração, modalidade, grade e condições poderão mudar antes da eventual abertura oficial de matrículas. Oferta futura sujeita a instituição de ensino superior devidamente credenciada e às exigências regulatórias aplicáveis.</p>
    </section>

<section className="rounded-[28px] border border-[#d6ad63]/35 bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#102d50] p-5 text-white shadow-lg sm:p-7">
      <div className="max-w-3xl"><span className="rounded-full bg-[#d6ad63] px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-[#281605]">🎓 Pós-Graduações · Lançamento em breve</span><h2 className="mt-4 font-serif text-3xl text-[#fff7e7]">Sua próxima especialização pode começar aqui.</h2><p className="mt-2 text-sm leading-6 text-white/75">Novas pós-graduações online estão sendo desenvolvidas para unir conhecimento, mercado e aplicação prática.</p></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{postgrads.map(course=><article key={course.title} className={`relative rounded-2xl border p-5 ${course.highlight?"border-[#d6ad63] bg-[#fff7e7] text-[#071426] shadow-lg":"border-white/15 bg-white/5 text-white"}`}>{course.highlight?<span className="absolute right-4 top-4 rounded-full bg-[#d6ad63] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[#281605]">DESTAQUE</span>:null}<div className="text-2xl">{course.icon}</div><p className={`mt-4 text-[10px] font-black uppercase tracking-[.14em] ${course.highlight?"text-[#9a6d20]":"text-[#d6ad63]"}`}>Pós-Graduação · Em breve</p><h3 className="mt-2 font-serif text-xl leading-snug">{course.title}</h3><a href={`/cliente/interesse-pos/${course.key}`} className={`mt-5 block rounded-xl border px-3 py-2 text-center text-xs font-black transition hover:-translate-y-0.5 ${course.highlight?"border-[#d6ad63]/60 bg-white text-[#0b2341] hover:bg-[#fff3cf]":"border-white/15 bg-white/10 text-white hover:bg-white/15"}`}>Tenho interesse</a></article>)}</div>
      <p className="mt-5 text-[11px] leading-5 text-white/60">Programas em desenvolvimento · oferta futura sujeita à parceria e validação acadêmica da instituição de ensino responsável.</p>
    </section>

    <section className="rounded-[28px] border bg-[#fffdf8] p-5 shadow-sm sm:p-7">
      <div><span className="rounded-full bg-[#0b2341] px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-white">📚 Formações Profissionais</span><h2 className="mt-4 font-serif text-3xl text-[#0b2341]">Formações para desenvolver sua prática profissional</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Acesse as formações já disponíveis na Biblioteca LDR sem alterar suas regras atuais de compra e acesso.</p></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="relative rounded-2xl border-2 border-[#34a77b] bg-gradient-to-br from-[#f0fdf7] to-[#ecfdf5] p-5 shadow-sm">
          <span className="absolute right-4 top-4 rounded-full bg-[#047857] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-white">100% GRATUITA</span>
          <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#047857]">Gestão de Pessoas e RH</span>
          <h3 className="mt-2 pr-16 font-serif text-xl text-[#065f46]">Formação em Gestão de Pessoas e Recursos Humanos</h3>
          <p className="mt-2 text-sm text-muted-foreground">600 horas · 12 módulos · 100% online · leitura e atividades · no seu ritmo.</p>
          <a href="/cliente/formacoes/gestao-pessoas-rh" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#047857] px-4 py-3 text-sm font-black text-white">COMEÇAR GRATUITAMENTE</a>
        </article>
        <article className="rounded-2xl border border-[#d9c6ea] bg-[#fbf7ff] p-5"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#5b2b86]">Psicanálise</span><h3 className="mt-2 font-serif text-xl text-[#32155c]">Formação Online em Psicanálise</h3><p className="mt-2 text-sm text-muted-foreground">14 módulos · 220 unidades · percurso formativo completo.</p>{ent.psycho?<a href="/cliente/treinamentos/psicanalise" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#5b2b86] px-4 py-3 text-sm font-black text-white">Acessar formação</a>:buyFormation("psycho",psychoCheckout,"bg-[#5b2b86]")}</article>
        <article className="rounded-2xl border border-[#9fc9bf] bg-[#f1faf7] p-5"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#17645e]">Terapia Breve · 1.200h</span><h3 className="mt-2 font-serif text-xl text-[#103d3a]">Formação em Terapia Breve Psicanalítica</h3><p className="mt-2 text-sm text-muted-foreground">15 módulos · 300 aulas · 1.200 horas · 6 encontros ao vivo.</p>{ent.brief?<a href="/cliente/treinamentos/terapia-breve-psicanalitica" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#17645e] px-4 py-3 text-sm font-black text-white">Acessar formação</a>:buyFormation("brief",briefCheckout,"bg-[#17645e]")}</article>
        <article className="rounded-2xl border border-[#b8cee5] bg-[#f7fbff] p-5"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#0b5cab]">Mentoria e Carreira</span><h3 className="mt-2 font-serif text-xl text-[#0f2f57]">Formação em Mentoria Profissional e de Carreira</h3><p className="mt-2 text-sm text-muted-foreground">3 meses · 90 aulas · 1 aula/dia · ≈40 min/dia · acesso digital vitalício.</p>{ent.mentor?<a href="/cliente/treinamentos/mentoria-carreira" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#0b5cab] px-4 py-3 text-sm font-black text-white">Acessar formação</a>:buyFormation("mentor",mentorCheckout,"bg-[#0b5cab]")}</article>
        <article className="rounded-2xl border border-[#b8d8c8] bg-[#f6fbf8] p-5"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#0f5132]">Liderança</span><h3 className="mt-2 font-serif text-xl text-[#0f5132]">Formação em Liderança e Gestão de Pessoas</h3><p className="mt-2 text-sm text-muted-foreground">3 meses · 90 aulas · 1 aula/dia · ≈40 min/dia · acesso digital vitalício.</p>{ent.leader?<a href="/cliente/treinamentos/lideranca-gestao" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#0f5132] px-4 py-3 text-sm font-black text-white">Acessar formação</a>:buyFormation("leader",leaderCheckout,"bg-[#0f5132]")}</article>
      </div>
    </section>

    <section className="rounded-[28px] border bg-background p-5">
      <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5"/><h2 className="font-serif text-xl">{t.comments}</h2></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr_auto]">
        <select value={productKey} onChange={e=>setProductKey(e.target.value)} className="rounded-xl border bg-background px-3 py-2 text-sm">
          <option value="ebook_coragem_comecar">eBook</option>
          <option value="livro_menino_mamao">Livro</option>
          <option value="treinamento_do_mamao_ao_negocio">Negócios</option>
          <option value="formacao_psicanalise">Psicanálise</option>
          <option value="formacao_terapia_breve_psicanalitica">Terapia Breve Psicanalítica</option>
          <option value="formacao_negocio_24_horas">Negócio em 24 Horas</option>
          <option value="formacao_mentoria_profissional_carreira">Mentoria</option>
          <option value="formacao_lideranca_gestao_pessoas">Liderança</option>
          <option value="formacao_gratuita_gestao_pessoas_rh">Formação gratuita — Gestão de Pessoas e RH</option>
          <option value="curso_gratuito_organizar_carreira">Curso gratuito — Carreira</option>
          <option value="curso_gratuito_frances_negocios_a1">Curso gratuito — Francês A1</option>
          <option value="curso_gratuito_primeiros_socorros">Curso gratuito — Primeiros Socorros</option>
        </select>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2} className="rounded-xl border p-3 text-sm" placeholder="Escreva seu comentário…"/>
        <button disabled={!comment.trim()||addComment.isPending} onClick={()=>addComment.mutate()} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Publicar</button>
      </div>
      <div className="mt-4 space-y-2">{comments.slice(0,6).map((c:any)=><div key={c.id} className="rounded-xl border p-3 text-sm"><p>{c.body}</p></div>)}</div>
    </section>
  </div>;
}
