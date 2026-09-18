import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { LanguageSelect, useI18n } from "@/lib/i18n";
export const Route = createFileRoute("/carreira/empresa")({ component: CompanyArea });
const COPY = {
 pt: ["Área da empresa", "Publique vagas gratuitamente e acompanhe seu processo seletivo.", "Publicar vaga", "Acessar candidaturas", "Guia de triagem responsável", "Vagas abertas"],
 en: ["Company area", "Post jobs for free and manage your recruitment process.", "Post a job", "Access applications", "Responsible screening guide", "Open jobs"],
 fr: ["Espace entreprise", "Publiez gratuitement et suivez votre recrutement.", "Publier une offre", "Accéder aux candidatures", "Guide de sélection responsable", "Offres ouvertes"],
 es: ["Área de empresa", "Publica vacantes gratis y sigue tu proceso de selección.", "Publicar vacante", "Acceder a candidaturas", "Guía de selección responsable", "Vacantes abiertas"],
};
function CompanyArea() {
 const { pathname } = useLocation(); const { locale } = useI18n(); const t = COPY[locale];
 if (pathname.replace(/\/+$/, "") !== "/carreira/empresa") return <Outlet />;
 return <main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto max-w-5xl"><header className="flex flex-wrap items-center justify-between gap-4"><Link reloadDocument to="/carreira" className="font-bold text-[#07345b]">LDR Carreira</Link><LanguageSelect /></header><h1 className="mt-10 text-3xl font-bold text-[#07345b]">{t[0]}</h1><p className="mt-3 text-slate-600">{t[1]}</p><nav className="mt-8 grid gap-4 sm:grid-cols-2">{["/carreira/empresa/publicar", "/carreira/empresa/candidaturas", "/carreira/empresa/guia-triagem-responsavel", "/carreira/vagas"].map((to,i)=><Link reloadDocument key={to} to={to} className="flex min-h-14 items-center rounded-2xl border border-slate-200 bg-white p-5 font-bold text-[#07345b]">{t[i+2]}</Link>)}</nav></div></main>;
}
