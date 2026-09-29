import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/human-room")({
  head: () => ({
    meta: [
      { title: "Human Room | Ecossistema LDR" },
      { name: "description", content: "Human Room integrado ao Ecossistema LDR: salas, participação, seleção, presença, feedback e Human Brief." },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Human Room | Ecossistema LDR" },
      { property: "og:url", content: "https://ldrrhestrategia.com/human-room" },
    ],
    links: [{ rel: "canonical", href: "https://ldrrhestrategia.com/human-room" }],
  }),
  component: HumanRoomIntegratedPage,
});

function HumanRoomIntegratedPage() {
  return <main className="min-h-screen bg-[#071426] text-white">
    <header className="border-b border-white/10 bg-[#071426] px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <a href="/ecossistema" className="text-sm font-black text-[#f4c76b]">← Ecossistema LDR</a>
        <div className="text-right"><p className="font-serif text-xl font-bold">Human Room</p><p className="text-xs text-white/60">Integrado ao Ecossistema LDR</p></div>
      </div>
    </header>
    <section className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-4 rounded-2xl border border-[#f4c76b]/30 bg-white/[.06] p-4">
        <p className="text-sm leading-6 text-white/80">A versão operacional mais recente do Human Room permanece preservada aqui, incluindo salas, candidaturas, seleção, participação, presença, feedback e Human Brief.</p>
      </div>
      <iframe
        title="Human Room"
        src="https://human-room.vercel.app/human-room"
        className="h-[calc(100vh-170px)] min-h-[720px] w-full rounded-2xl border border-white/15 bg-white"
        allow="clipboard-read; clipboard-write"
      />
      <p className="mt-3 text-center text-xs text-white/60">Se o aplicativo não carregar dentro da página, <a className="font-bold text-[#f4c76b] underline" href="https://www.humanroom.online/" target="_blank" rel="noreferrer">abra o Human Room diretamente</a>.</p>
    </section>
  </main>;
}
