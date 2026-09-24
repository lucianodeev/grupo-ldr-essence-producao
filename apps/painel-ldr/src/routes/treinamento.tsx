import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { isUnifiedPreviewHost, unifiedPreviewTarget } from "@/lib/unified-preview";

const ACADEMY_ECOSYSTEM_URL = "https://ldracademy.online/ecossistema";

export const Route = createFileRoute("/treinamento")({
  head: () => ({
    meta: [
      { title: "Treinamentos LDR | Página movida para LDR Academy" },
      { name: "robots", content: "noindex,follow" },
      { name: "description", content: "A página pública de treinamentos foi centralizada na LDR Academy. Acesse o mapa do ecossistema LDR para continuar." },
      { property: "og:title", content: "Treinamentos LDR agora estão na LDR Academy" },
      { property: "og:description", content: "Centralizamos treinamentos, Biblioteca, LDR PASS e Rede Acadêmica na LDR Academy." },
    ],
    links: [{ rel: "canonical", href: ACADEMY_ECOSYSTEM_URL }],
  }),
  component: TrainingMovedPage,
});

function TrainingMovedPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isUnifiedPreviewHost(window.location.hostname)) {
      const previewTarget = unifiedPreviewTarget(
        ACADEMY_ECOSYSTEM_URL,
        window.location.origin,
        window.location.hostname,
      );
      if (previewTarget) window.location.replace(previewTarget);
      return;
    }
    window.location.replace(ACADEMY_ECOSYSTEM_URL);
  }, []);

  const links = [
    ["Entrada central LDR Academy", "https://ldracademy.online/"],
    ["Mapa do Ecossistema", "https://ldracademy.online/ecossistema"],
    ["LDR PASS", "https://ldracademy.online/ldr-pass"],
    ["Minha Biblioteca", "https://ldracademy.online/cliente/biblioteca"],
    ["Rede Acadêmica", "https://ldracademy.online/cliente/rede-academica"],
  ] as const;

  return (
    <main className="min-h-screen bg-[#071426] px-5 py-16 text-white">
      <section className="mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/[.06] p-6 shadow-2xl sm:p-9">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#f4c76b]">Página movida</p>
        <h1 className="mt-3 font-serif text-4xl font-bold">Treinamentos LDR agora estão na LDR Academy.</h1>
        <p className="mt-4 text-sm text-white/75">
          A antiga página pública de treinamento foi ocultada para evitar duplicidade. Tudo agora referencia a entrada central da LDR Academy, o LDR PASS, a Biblioteca e a Rede Acadêmica.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="rounded-2xl border border-white/15 bg-white/[.08] p-4 text-sm font-black text-[#f4c76b] hover:bg-white/[.12]">
              {label}
              <span className="mt-1 block break-all text-xs font-medium text-white/55">{href}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
