import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/human-room")({
  head: () => ({
    meta: [
      { title: "Human Room | Ecossistema LDR" },
      {
        name: "description",
        content:
          "Página oficial do Human Room dentro do Ecossistema LDR Academy. Conheça o projeto e acesse o aplicativo operacional.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Human Room | Ecossistema LDR" },
      {
        property: "og:description",
        content:
          "Projeto do Ecossistema LDR voltado à escuta, participação, reflexão e construção coletiva.",
      },
      { property: "og:url", content: "https://ldracademy.online/human-room" },
    ],
    links: [{ rel: "canonical", href: "https://ldracademy.online/human-room" }],
  }),
  component: HumanRoomOfficialPage,
});

function HumanRoomOfficialPage() {
  return (
    <main className="min-h-screen bg-[#f8f1e7] px-5 py-12 text-[#25170f]">
      <section className="mx-auto max-w-5xl">
        <a href="/ecossistema" className="text-sm font-bold text-[#8a4c18]">
          ← Voltar ao Ecossistema LDR
        </a>

        <div className="mt-7 overflow-hidden rounded-[34px] border border-[#d6ad63]/40 bg-white shadow-xl">
          <div className="bg-[#071426] px-6 py-10 text-white sm:px-10 sm:py-14">
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#d6ad63]">
              Projeto conectado · LDR Academy
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold sm:text-6xl">Human Room</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/78">
              Um espaço digital de escuta, participação e construção coletiva entre pessoas,
              universidades, empresas e organizações.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#071426]">Entrada oficial do projeto</h2>
              <p className="mt-4 text-sm leading-7 text-[#5f554d]">
                O Human Room faz parte do Ecossistema LDR. Esta página em
                <strong> ldracademy.online</strong> é a referência oficial do projeto dentro do
                ecossistema.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#5f554d]">
                O aplicativo operacional continua preservado durante a transição de domínio para
                não interromper contas, salas, inscrições ou fluxos já validados.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="https://www.humanroom.online/"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#071426] px-6 py-3 text-sm font-black text-white"
                >
                  Acessar aplicativo Human Room
                </a>
                <a
                  href="/falar-com-ecossistema?assunto=Human%20Room&source=human-room"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d6ad63] px-6 py-3 text-sm font-black text-[#7a4d14]"
                >
                  Falar com o Ecossistema
                </a>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[#d6ad63]/35 bg-[#fffaf2] p-6">
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#9a6a20]">Estrutura</p>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-[#42526b]">
                <div className="rounded-2xl bg-white p-4">Salas e participação</div>
                <div className="rounded-2xl bg-white p-4">Perfis e onboarding</div>
                <div className="rounded-2xl bg-white p-4">Confirmação e presença</div>
                <div className="rounded-2xl bg-white p-4">Feedback e Human Brief</div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
