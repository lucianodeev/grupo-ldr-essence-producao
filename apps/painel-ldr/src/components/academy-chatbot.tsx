import { useEffect, useMemo, useState } from "react";
import { BookOpen, Bot, ChevronLeft, ExternalLink, GraduationCap, MessageCircle, Search, X } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";

const SUPPORT_URL = "/falar-com-ecossistema";

type Locale = "pt" | "en" | "fr" | "es";
type Topic = "courses" | "formations" | "free" | "business" | "psychoanalysis" | "career" | "books" | "editorial" | "library" | "human";

const ANNOUNCEMENT: Record<Locale, string> = {
  pt: "Conteúdo em constante evolução. A LDR Essence Academy é atualizada regularmente para trazer novos conhecimentos e uma experiência de aprendizagem cada vez melhor.",
  en: "Content that keeps evolving. LDR Essence Academy is regularly updated to bring you new knowledge and an ever-improving learning experience.",
  fr: "Contenu en constante évolution. LDR Essence Academy est régulièrement mise à jour afin de vous proposer de nouvelles connaissances et une expérience d'apprentissage toujours meilleure.",
  es: "Contenido en constante evolución. LDR Essence Academy se actualiza regularmente para ofrecerte nuevos conocimientos y una experiencia de aprendizaje cada vez mejor.",
};

const COPY: Record<Locale, {
  help: string; title: string; subtitle: string; hello: string; prompt: string; search: string; back: string; close: string;
  noResult: string; human: string; visit: string; open: string; topics: Record<Topic, string>;
}> = {
  pt: {
    help: "💬 Falar com o Ecossistema", title: "Suporte do Ecossistema LDR", subtitle: "Atendimento central do Ecossistema", hello: "Olá 👋 Sou o assistente do Ecossistema LDR.", prompt: "Encontre informações do Ecossistema ou fale com nosso suporte central. Todo atendimento humano é feito por Falar com o Ecossistema.", search: "Digite o que você procura…", back: "Voltar", close: "Fechar", noResult: "Não encontrei exatamente o que você procura. Posso te encaminhar para nosso atendimento.", human: "Falar com o Ecossistema", visit: "Ver opções", open: "Abrir", topics: { courses:"🎓 Cursos", formations:"📚 Formações", free:"🎁 Cursos gratuitos", business:"💼 Empreendedorismo", psychoanalysis:"🧠 Psicanálise", career:"🌍 Carreira", books:"📖 Livros e eBooks", editorial:"📖 Revista Psicanálise no Mundo", library:"🔎 Explorar biblioteca", human:"🎧 Falar com o Ecossistema" }
  },
  en: {
    help: "💬 Ecosystem Support", title: "LDR Ecosystem Support", subtitle: "Central Ecosystem Support", hello: "Hi 👋 I’m the LDR Ecosystem assistant.", prompt: "I can help you find courses, professional programs, free content, books, the Revista Psicanálise no Mundo and more. What are you looking for?", search: "Type what you are looking for…", back: "Back", close: "Close", noResult: "I couldn’t find exactly what you are looking for. I can connect you with our support team.", human: "Talk to Ecosystem Support", visit: "See options", open: "Open", topics: { courses:"🎓 Courses", formations:"📚 Programs", free:"🎁 Free courses", business:"💼 Entrepreneurship", psychoanalysis:"🧠 Psychoanalysis", career:"🌍 Career", books:"📖 Books & eBooks", editorial:"📖 Revista Psicanálise no Mundo", library:"🔎 Explore library", human:"🎧 Talk to the Ecosystem" }
  },
  fr: {
    help: "💬 Support de l’écosystème", title: "Support de l’Écosystème LDR", subtitle: "Support central de l’écosystème", hello: "Bonjour 👋 Je suis l’assistant de l’Écosystème LDR.", prompt: "Je peux vous aider à trouver des cours, formations, contenus gratuits, livres, la Revista Psicanálise no Mundo et autres contenus. Que recherchez-vous ?", search: "Écrivez ce que vous recherchez…", back: "Retour", close: "Fermer", noResult: "Je n’ai pas trouvé exactement ce que vous recherchez. Je peux vous orienter vers notre service d’assistance.", human: "Contacter le support de l’écosystème", visit: "Voir les options", open: "Ouvrir", topics: { courses:"🎓 Cours", formations:"📚 Formations", free:"🎁 Cours gratuits", business:"💼 Entrepreneuriat", psychoanalysis:"🧠 Psychanalyse", career:"🌍 Carrière", books:"📖 Livres et eBooks", editorial:"📖 Revista Psicanálise no Mundo", library:"🔎 Explorer la bibliothèque", human:"🎧 Parler à l’écosystème" }
  },
  es: {
    help: "💬 Soporte del Ecosistema", title: "Soporte del Ecosistema LDR", subtitle: "Soporte central del Ecosistema", hello: "Hola 👋 Soy el asistente del Ecosistema LDR.", prompt: "Puedo ayudarte a encontrar cursos, formaciones, contenidos gratuitos, libros, la Revista Psicanálise no Mundo y otros contenidos. ¿Qué buscas?", search: "Escribe lo que buscas…", back: "Volver", close: "Cerrar", noResult: "No encontré exactamente lo que buscas. Puedo derivarte a nuestro equipo de atención.", human: "Hablar con el soporte del Ecosistema", visit: "Ver opciones", open: "Abrir", topics: { courses:"🎓 Cursos", formations:"📚 Formaciones", free:"🎁 Cursos gratuitos", business:"💼 Emprendimiento", psychoanalysis:"🧠 Psicoanálisis", career:"🌍 Carrera", books:"📖 Libros y eBooks", editorial:"📖 Revista Psicanálise no Mundo", library:"🔎 Explorar biblioteca", human:"🎧 Hablar con el Ecosistema" }
  },
};

const DESTINATIONS: Record<Exclude<Topic, "human">, { href: string; icon: typeof BookOpen }> = {
  courses: { href: "/treinamento", icon: GraduationCap },
  formations: { href: "/formacao-psicanalise", icon: GraduationCap },
  free: { href: "/cliente/biblioteca/cursos-gratuitos", icon: GraduationCap },
  business: { href: "/treinamento", icon: GraduationCap },
  psychoanalysis: { href: "/formacao-psicanalise", icon: BookOpen },
  career: { href: "/cliente/biblioteca", icon: GraduationCap },
  books: { href: "/cliente/biblioteca", icon: BookOpen },
  editorial: { href: "/cliente/biblioteca/publicacoes/revista-psicanalise-no-mundo", icon: BookOpen },
  library: { href: "/cliente/biblioteca", icon: BookOpen },
};

const KEYWORDS: Record<Exclude<Topic, "human" | "library">, string[]> = {
  courses: ["curso", "course", "cours", "curso"],
  formations: ["formação", "formacao", "formation", "program", "training"],
  free: ["gratuito", "gratis", "free", "gratuit", "gratuito"],
  business: ["empreender", "empreendedor", "negócio", "negocio", "business", "entrepreneur", "entrepreneuriat", "emprendimiento"],
  psychoanalysis: ["psicanálise", "psicanalise", "psychoanalysis", "psychanalyse", "psicoanálisis", "psicoanalisis"],
  career: ["carreira", "career", "carrière", "carrera", "mentoria", "mentoring"],
  books: ["livro", "ebook", "book", "livre", "libro"],
  editorial: ["revista", "jornal", "magazine", "journal", "revue", "periódico", "periodico", "psicanálise no mundo", "psicanalise no mundo"],
};

const EDITORIAL_INFO: Record<Locale, string> = {
  pt: "Revista Psicanálise no Mundo · 🇧🇷 R$ 3,90 por semana · 🇪🇺 € 3,90 por semana. Assinatura semanal recorrente, separada da assinatura principal da biblioteca.",
  en: "Revista Psicanálise no Mundo · 🇧🇷 R$ 3.90 per week · 🇪🇺 € 3.90 per week. Recurring weekly subscription, separate from the main library subscription.",
  fr: "Revista Psicanálise no Mundo · 🇧🇷 R$ 3,90 par semaine · 🇪🇺 3,90 € par semaine. Abonnement hebdomadaire récurrent, séparé de l’abonnement principal à la bibliothèque.",
  es: "Revista Psicanálise no Mundo · 🇧🇷 R$ 3,90 por semana · 🇪🇺 € 3,90 por semana. Suscripción semanal recurrente, separada de la suscripción principal de la biblioteca.",
};

export function AcademyChatbot() {
  const { locale } = useI18n();
  const location = useLocation();
  const lang = (locale in COPY ? locale : "pt") as Locale;
  const baseCopy = COPY[lang];
  const careerCopy = { pt:{title:"LDR Carreira",hello:"Olá 👋 Sou o assistente do LDR Carreira.",prompt:"Você é profissional ou representa uma empresa? Posso orientar seu cadastro ou conectar você ao atendimento.",help:"Dúvidas sobre o LDR Carreira?"}, en:{title:"LDR Carreira",hello:"Hi 👋 I’m the LDR Carreira assistant.",prompt:"Are you a professional or representing a company? I can guide your registration or connect you with support.",help:"Questions about LDR Carreira?"}, fr:{title:"LDR Carreira",hello:"Bonjour 👋 Je suis l’assistant LDR Carreira.",prompt:"Êtes-vous professionnel ou représentez-vous une entreprise ? Je peux vous guider dans l’inscription ou vous mettre en contact avec notre équipe.",help:"Des questions sur LDR Carreira ?"}, es:{title:"LDR Carreira",hello:"Hola 👋 Soy el asistente de LDR Carreira.",prompt:"¿Eres profesional o representas a una empresa? Puedo orientarte con el registro o conectarte con nuestro equipo.",help:"¿Dudas sobre LDR Carreira?"} } as const;
  const careerPage = location.pathname === "/carreira" || location.pathname.startsWith("/carreira/");
  const inlineAssistant = careerPage || location.pathname === "/empresa/login" || location.pathname.startsWith("/ebooks/") || location.pathname.startsWith("/cliente/ebooks/") || location.pathname.startsWith("/cliente/biblioteca");
  const careerActions = { pt:{candidate:"👤 Sou profissional",company:"🏢 Sou empresa",human:"💬 Falar com a LDR"}, en:{candidate:"👤 I’m a professional",company:"🏢 I’m a company",human:"💬 Talk to LDR"}, fr:{candidate:"👤 Je suis professionnel",company:"🏢 Je suis une entreprise",human:"💬 Parler à LDR"}, es:{candidate:"👤 Soy profesional",company:"🏢 Soy empresa",human:"💬 Hablar con LDR"} } as const;
  const c = careerPage ? {...baseCopy,...careerCopy[lang]} : baseCopy;
  const showAnnouncement = location.pathname === "/" || location.pathname === "/cliente/biblioteca";
  const academicNetwork = location.pathname.startsWith("/cliente/rede-academica");
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [query, setQuery] = useState("");
  const [primaryInstance, setPrimaryInstance] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (root.dataset['ldrAcademyChatbot'] === "1") return;
    root.dataset['ldrAcademyChatbot'] = "1";
    setPrimaryInstance(true);
    return () => {
      if (root.dataset['ldrAcademyChatbot'] === "1") delete root.dataset['ldrAcademyChatbot'];
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => setTeaser(true), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  const searchMatch = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return null;
    return (Object.entries(KEYWORDS) as Array<[Exclude<Topic, "human" | "library">, string[]]>).find(([, words]) => words.some((word) => normalized.includes(word)))?.[0] ?? null;
  }, [query]);

  const activeTopic = searchMatch ?? selected;
  const destination = activeTopic && activeTopic !== "human" ? DESTINATIONS[activeTopic] : null;

  function choose(topic: Topic) {
    if (topic === "human") {
      const source = encodeURIComponent(location.pathname);
      window.location.href = `${SUPPORT_URL}?source=${source}&lang=${lang}`;
      return;
    }
    setQuery("");
    setSelected(topic);
  }

  if (!primaryInstance) return null;

  return (
    <>
      {showAnnouncement && (
        <div className="fixed inset-x-0 top-0 z-[110] overflow-hidden border-b border-[#d6ad63]/30 bg-[#071426] py-2 text-white shadow-sm" role="status" aria-live="polite">
          <div className="ldr-academy-ticker flex w-max min-w-full items-center motion-reduce:animate-none">
            {[0,1].map((item) => (
              <div key={item} className="flex shrink-0 items-center gap-4 px-4 text-[11px] font-bold tracking-[.04em] sm:px-8 sm:text-xs">
                <span className="text-[#d6ad63]">✦ LDR ESSENCE ACADEMY</span>
                <span>{ANNOUNCEMENT[lang]}</span>
                <span className="text-[#d6ad63]">✦</span>
              </div>
            ))}
          </div>
          <style>{`@keyframes ldrAcademyTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}.ldr-academy-ticker{animation:ldrAcademyTicker 28s linear infinite}@media (prefers-reduced-motion:reduce){.ldr-academy-ticker{animation:none}}`}</style>
        </div>
      )}

      <div className={inlineAssistant ? "relative z-[30] mx-auto flex max-w-6xl flex-col items-end px-5 py-4" : "fixed z-[95]"} style={inlineAssistant ? undefined : { bottom: academicNetwork ? "calc(11rem + env(safe-area-inset-bottom))" : "calc(1rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}>
        {!open && teaser && !academicNetwork && !inlineAssistant && (
          <div className="mb-3 ml-auto flex max-w-[18rem] items-start gap-2 rounded-2xl border border-[#d5bd78]/50 bg-white p-3 text-sm text-slate-800 shadow-2xl">
            <Bot className="mt-0.5 h-5 w-5 shrink-0 text-[#102a43]" aria-hidden="true" />
            <button type="button" onClick={() => { setOpen(true); setTeaser(false); }} className="text-left font-semibold leading-5">{c.help}</button>
            <button type="button" onClick={() => setTeaser(false)} aria-label={c.close} className="ml-auto rounded-full p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          </div>
        )}

        {open && (
          <section role="dialog" aria-label={c.title} className="mb-3 flex max-h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-[#d5bd78]/40 bg-white shadow-2xl">
            <header className="flex items-center gap-3 bg-[#102a43] px-4 py-4 text-white">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d5bd78] text-[#102a43]"><Bot className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="font-black">{c.title}</p><p className="text-xs text-white/75">{c.subtitle}</p></div>
              {(selected || query) && <button type="button" onClick={() => { setSelected(null); setQuery(""); }} aria-label={c.back} className="rounded-full p-2 hover:bg-white/10"><ChevronLeft className="h-5 w-5" /></button>}
              <button type="button" onClick={() => setOpen(false)} aria-label={c.close} className="rounded-full p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </header>

            <div className="overflow-y-auto p-4">
              <div className="rounded-2xl bg-[#f7f1df] p-3 text-sm leading-6 text-slate-800">
                <strong>{c.hello}</strong><br />{c.prompt}
              </div>

              <label className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 focus-within:border-[#102a43]">
                <Search className="h-4 w-4 text-slate-500" />
                <input value={query} onChange={(event) => { setQuery(event.target.value); setSelected(null); }} placeholder={c.search} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              </label>

              {!query && !selected && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(Object.keys(c.topics) as Topic[]).map((topic) => (
                    <button key={topic} type="button" onClick={() => choose(topic)} className={topic === "human" ? "col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left text-sm font-bold text-emerald-800 transition hover:bg-emerald-100" : "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-bold text-slate-800 transition hover:border-[#d5bd78] hover:bg-[#fbf8ef]"}>{c.topics[topic]}</button>
                  ))}
                </div>
              )}

              {(query || selected) && (
                <div className="mt-4">
                  {destination && activeTopic ? (
                    <article className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#102a43] text-white"><destination.icon className="h-5 w-5" /></div>
                        <div><p className="text-xs font-black uppercase tracking-[.12em] text-[#9a7a2f]">Ecossistema LDR</p><p className="font-black text-slate-900">{c.topics[activeTopic]}</p></div>
                      </div>
                      {activeTopic === "editorial" && <p className="mt-3 text-sm leading-6 text-slate-700">{EDITORIAL_INFO[lang]}</p>}
                      <a href={destination.href} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-3 text-sm font-black text-white hover:bg-[#173b5f]">{c.open}<ExternalLink className="h-4 w-4" /></a>
                    </article>
                  ) : query ? (
                    <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                      <p>{c.noResult}</p>
                      <a href={`${SUPPORT_URL}?source=${encodeURIComponent(location.pathname)}&lang=${lang}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-3 font-black text-white"><MessageCircle className="h-4 w-4" />{c.human}</a>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        )}

        <button type="button" onClick={() => { setOpen((value) => !value); setTeaser(false); }} aria-label={c.help} aria-expanded={open} className={`ml-auto flex items-center justify-center gap-2 rounded-full border border-[#fff0c2] bg-[#F4B942] text-sm font-black text-[#071426] shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#FFD36B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B942] focus-visible:ring-offset-2 ${academicNetwork ? "h-12 w-12 p-0 sm:h-14 sm:w-auto sm:px-4 sm:py-3" : "min-h-14 px-4 py-3"}`}>
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          <span className="hidden sm:inline">{c.help}</span>
        </button>
      </div>
    </>
  );
}