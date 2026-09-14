import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CalendarDays, CircleDollarSign, HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { networkLanding } from "@/lib/professional-network.functions";

export const Route=createFileRoute("/para-profissionais")({
  loader:()=>networkLanding(),
  head:()=>({meta:[
    {title:"Faça parte da LDR Essence | Sem mensalidade"},
    {name:"description",content:"Crie gratuitamente seu perfil profissional na rede multidisciplinar LDR Essence. A plataforma recebe 20% somente sobre serviços pagos realizados pela plataforma."}
  ]}),
  component:ForProfessionals,
});

const COPY={
pt:{tag:"REDE MULTIDISCIPLINAR DE SAÚDE MENTAL E BEM-ESTAR",title:"Faça parte da LDR Essence.",sub:"Crie gratuitamente seu perfil profissional, disponibilize seus serviços e comece a atender pela plataforma.",primary:"CRIAR MEU PERFIL GRATUITO",secondary:"VER PROFISSIONAIS",free:"SEM MENSALIDADE",fee:"COMISSÃO ÚNICA DE 20%",net:"VOCÊ RECEBE 80%",steps:["Crie seu perfil","Envie suas informações","Aguarde a verificação","Cadastre seus serviços","Organize sua agenda","Comece a atender"],financial:"Não cobramos mensalidade neste momento. Em serviços pagos pela plataforma, a LDR recebe 20% e o profissional recebe 80%.",ethics:"Profissões regulamentadas passam por verificação. A aprovação não garante clientes, faturamento ou encaminhamentos."},
en:{tag:"MULTIDISCIPLINARY MENTAL HEALTH AND WELLBEING NETWORK",title:"Join LDR Essence.",sub:"Create your professional profile free of charge, publish services and provide care through the platform.",primary:"CREATE MY FREE PROFILE",secondary:"VIEW PROFESSIONALS",free:"NO MONTHLY FEE",fee:"SINGLE 20% PLATFORM FEE",net:"YOU RECEIVE 80%",steps:["Create your profile","Send your information","Wait for verification","Add your services","Organize your schedule","Start providing care"],financial:"There is currently no monthly fee. For paid services processed by the platform, LDR receives 20% and the professional receives 80%.",ethics:"Regulated professions are verified. Approval does not guarantee clients, revenue or referrals."},
fr:{tag:"RÉSEAU PLURIDISCIPLINAIRE DE SANTÉ MENTALE ET BIEN-ÊTRE",title:"Rejoignez LDR Essence.",sub:"Créez gratuitement votre profil professionnel, publiez vos services et accompagnez via la plateforme.",primary:"CRÉER MON PROFIL GRATUIT",secondary:"VOIR LES PROFESSIONNELS",free:"SANS ABONNEMENT",fee:"COMMISSION UNIQUE DE 20 %",net:"VOUS RECEVEZ 80 %",steps:["Créez votre profil","Envoyez vos informations","Attendez la vérification","Ajoutez vos services","Organisez votre agenda","Commencez à accompagner"],financial:"Aucun abonnement mensuel n’est facturé actuellement. Pour les services payés via la plateforme, LDR reçoit 20 % et le professionnel 80 %.",ethics:"Les professions réglementées sont vérifiées. L’approbation ne garantit ni clients, ni revenus, ni orientations."},
es:{tag:"RED MULTIDISCIPLINARIA DE SALUD MENTAL Y BIENESTAR",title:"Forma parte de LDR Essence.",sub:"Crea gratuitamente tu perfil profesional, publica servicios y atiende mediante la plataforma.",primary:"CREAR MI PERFIL GRATUITO",secondary:"VER PROFESIONALES",free:"SIN MENSUALIDAD",fee:"COMISIÓN ÚNICA DEL 20 %",net:"RECIBES EL 80 %",steps:["Crea tu perfil","Envía tu información","Espera la verificación","Registra tus servicios","Organiza tu agenda","Comienza a atender"],financial:"Actualmente no cobramos mensualidad. En servicios pagados mediante la plataforma, LDR recibe el 20 % y el profesional el 80 %.",ethics:"Las profesiones reguladas se verifican. La aprobación no garantiza clientes, ingresos ni derivaciones."}
} as const;

function ForProfessionals(){
 const {locale}=useI18n(); const c=COPY[locale];
 const features=[[BadgeCheck,c.free],[CircleDollarSign,c.fee],[HeartHandshake,c.net],[CalendarDays,"AGENDA"],[UsersRound,"PERFIL PROFISSIONAL"],[ShieldCheck,"VERIFICAÇÃO"]];
 return <main className="min-h-screen bg-[#fbf8f1] text-[#0b1428]">
  <header className="border-b border-[#c9a63a]/25 bg-[#0b1428] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6"><Link to="/profissionais" className="font-serif text-xl font-bold">LDR ESSENCE</Link><LanguageSelect/></div></header>
  <section className="bg-[#0b1428] px-4 py-16 text-white sm:px-6 lg:py-24"><div className="mx-auto max-w-5xl text-center"><p className="text-xs font-black tracking-[.18em] text-[#d6b85f]">{c.tag}</p><h1 className="mt-5 font-serif text-4xl sm:text-6xl">{c.title}</h1><p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">{c.sub}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/profissional/login" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#c9a63a] px-7 py-3 font-black text-[#0b1428]">{c.primary}</Link><Link to="/profissionais" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-7 py-3 font-black">{c.secondary}</Link></div></div></section>
  <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,label]:any)=><article key={label} className="rounded-2xl border border-[#c9a63a]/25 bg-white p-5 shadow-sm"><Icon className="h-6 w-6 text-[#8b6a12]"/><p className="mt-3 text-sm font-black">{label}</p></article>)}</div>
  <div className="mt-12 rounded-3xl bg-white p-6 shadow-sm sm:p-8"><h2 className="font-serif text-3xl">Como funciona</h2><ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{c.steps.map((step,i)=><li key={step} className="rounded-2xl border p-5"><span className="text-xs font-black text-[#8b6a12]">0{i+1}</span><p className="mt-2 font-bold">{step}</p></li>)}</ol><div className="mt-8 rounded-2xl bg-[#0b1428] p-6 text-white"><p className="text-lg font-bold">{c.financial}</p><p className="mt-3 text-sm leading-6 text-white/70">{c.ethics}</p></div></div></section>
 </main>;
}
