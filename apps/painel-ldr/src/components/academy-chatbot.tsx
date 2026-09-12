import { useEffect, useMemo, useState } from "react";
import { BookOpen, Bot, ChevronLeft, ExternalLink, GraduationCap, MessageCircle, Search, X } from "lucide-react";

import { useI18n } from "@/lib/i18n";

const WHATSAPP_URL = "https://wa.me/32492923605?text=Ol%C3%A1%2C%20vim%20pela%20LDR%20Academy%20e%20gostaria%20de%20ajuda.";

type Locale = "pt" | "en" | "fr" | "es";
type Topic = "courses" | "formations" | "free" | "business" | "psychoanalysis" | "career" | "books" | "editorial" | "library" | "human";

const COPY: Record<Locale, {
  help: string; title: string; subtitle: string; hello: string; prompt: string; search: string; back: string; close: string;
  noResult: string; human: string; visit: string; open: string; topics: Record<Topic, string>;
}> = {
  pt: {
    help: "Posso ajudar?", title: "LDR Academy", subtitle: "Assistente virtual", hello: "Olá 👋 Sou o assistente da LDR Academy.", prompt: "Posso te ajudar a encontrar cursos, formações, conteúdos gratuitos, livros, revistas e outros conteúdos. O que você procura?", search: "Digite o que você procura…", back: "Voltar", close: "Fechar", noResult: "Não encontrei exatamente o que você procura. Posso te encaminhar para nosso atendimento.", human: "Falar com atendimento no WhatsApp", visit: "Ver opções", open: "Abrir", topics: { courses:"🎓 Cursos", formations:"📚 Formações", free:"🎁 Cursos gratuitos", business:"💼 Empreendedorismo", psychoanalysis:"🧠 Psicanálise", career:"🌍 Carreira", books:"📖 Livros e eBooks", editorial:"📰 Revistas e jornais", library:"🔎 Explorar biblioteca", human:"💬 Falar com atendimento" }
  },
  en: {
    help: "Can I help?", title: "LDR Academy", subtitle: "Virtual assistant", hello: "Hi 👋 I’m the LDR Academy assistant.", prompt: "I can help you find courses, professional programs, free content, books, magazines and more. What are you looking for?", search: "Type what you are looking for…", back: "Back", close: "Close", noResult: "I couldn’t find exactly what you are looking for. I can connect you with our support team.", human: "Talk to support on WhatsApp", visit: "See options", open: "Open", topics: { courses:"🎓 Courses", formations:"📚 Programs", free:"🎁 Free courses", business:"💼 Entrepreneurship", psychoanalysis:"🧠 Psychoanalysis", career:"🌍 Career", books:"📖 Books & eBooks", editorial:"📰 Magazines & news", library:"🔎 Explore library", human:"💬 Talk to support" }
  },
  fr: {
    help: "Besoin d’aide ?", title: "LDR Academy", subtitle: "Assistant virtuel", hello: "Bonjour 👋 Je suis l’assistant de LDR Academy.", prompt: "Je peux vous aider à trouver des cours, formations, contenus gratuits, livres, magazines et autres contenus. Que recherchez-vous ?", search: "Écrivez ce que vous recherchez…", back: "Retour", close: "Fermer", noResult: "Je n’ai pas trouvé exactement ce que vous recherchez. Je peux vous orienter vers notre service d’assistance.", human: "Parler au service client sur WhatsApp", visit: "Voir les options", open: "Ouvrir", topics: { courses:"🎓 Cours", formations:"📚 Formations", free:"🎁 Cours gratuits", business:"💼 Entrepreneuriat", psychoanalysis:"🧠 Psychanalyse", career:"🌍 Carrière", books:"📖 Livres et eBooks", editorial:"📰 Revues et journaux", library:"🔎 Explorer la bibliothèque", human:"💬 Parler au service client" }
  },
  es: {
    help: "¿Puedo ayudarte?", title: "LDR Academy", subtitle: "Asistente virtual", hello: "Hola 👋 Soy el asistente de LDR Academy.", prompt: "Puedo ayudarte a encontrar cursos, formaciones, contenidos gratuitos, libros, revistas y otros contenidos. ¿Qué buscas?", search: "Escribe lo que buscas…", back: "Volver", close: "Cerrar", noResult: "No encontré exactamente lo que buscas. Puedo derivarte a nuestro equipo de atención.", human: "Hablar con atención por WhatsApp", visit: "Ver opciones", open: "Abrir", topics: { courses:"🎓 Cursos", formations:"📚 Formaciones", free:"🎁 Cursos gratuitos", business:"💼 Emprendimiento", psychoanalysis:"🧠 Psicoanálisis", career:"🌍 Carrera", books:"📖 Libros y eBooks", editorial:"📰 Revistas y periódicos", library:"🔎 Explorar biblioteca", human:"💬 Hablar con atención" }
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
  editorial: { href: "/cliente/biblioteca/revista-ldr", icon: BookOpen },
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
  editorial: ["revista", "jornal", "magazine", "journal", "revue", "periódico", "periodico"],
};

export function AcademyChatbot() {
  const { locale } = useI18n();
  const lang = (locale in COPY ? locale : "pt") as Locale;
  const c = COPY[lang];
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [query, setQuery] = useState("");

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
      window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setQuery("");
    setSelected(topic);
  }

  return (
    <div className="fixed z-[95]" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}>
      {!open && teaser && (
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
                      <div><p className="text-xs font-black uppercase tracking-[.12em] text-[#9a7a2f]">LDR Academy</p><p className="font-black text-slate-900">{c.topics[activeTopic]}</p></div>
                    </div>
                    <a href={destination.href} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-3 text-sm font-black text-white hover:bg-[#173b5f]">{c.open}<ExternalLink className="h-4 w-4" /></a>
                  </article>
                ) : query ? (
                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <p>{c.noResult}</p>
                    <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-black text-white"><MessageCircle className="h-4 w-4" />{c.human}</a>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      )}

      <button type="button" onClick={() => { setOpen((value) => !value); setTeaser(false); }} aria-label={c.help} aria-expanded={open} className="ml-auto flex min-h-14 items-center gap-2 rounded-full border border-[#d5bd78]/70 bg-[#102a43] px-4 py-3 text-sm font-black text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#173b5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d5bd78] focus-visible:ring-offset-2">
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">{c.help}</span>
      </button>
    </div>
  );
}
