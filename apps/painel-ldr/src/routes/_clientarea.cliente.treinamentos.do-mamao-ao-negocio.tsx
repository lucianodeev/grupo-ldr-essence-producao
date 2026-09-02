import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Cloud, GraduationCap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clientDoMamaoTrainingExperience, clientSaveDoMamaoTrainingState } from "@/lib/training-commerce.functions";

export const Route = createFileRoute("/_clientarea/cliente/treinamentos/do-mamao-ao-negocio")({ component: DoMamaoTraining });

function DoMamaoTraining() {
  const experienceFn = useServerFn(clientDoMamaoTrainingExperience);
  const saveFn = useServerFn(clientSaveDoMamaoTrainingState);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [syncLabel, setSyncLabel] = useState("Sincronizado com sua conta");
  const [cloudProgress, setCloudProgress] = useState(0);

  const { data, isLoading, error } = useQuery({ queryKey: ["do-mamao-training-experience"], queryFn: () => experienceFn({}) });
  useEffect(() => { if (data) setCloudProgress(data.progressPercent); }, [data]);

  const save = useMutation({
    mutationFn: (state: Record<string, unknown>) => saveFn({ data: { state } }),
    onMutate: () => setSyncLabel("Salvando na nuvem…"),
    onSuccess: (result) => { setCloudProgress(result.progressPercent); setSyncLabel("Sincronizado com sua conta"); },
    onError: () => setSyncLabel("Falha ao sincronizar — sua resposta continua salva neste dispositivo"),
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) return;
      const payload = event.data as { type?: string; key?: string; state?: Record<string, unknown> } | null;
      if (!payload || payload.type !== "ldr-training-state" || payload.key !== "ldr_training_v3_library_ready" || !payload.state) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save.mutate(payload.state!), 650);
    };
    window.addEventListener("message", onMessage);
    return () => { window.removeEventListener("message", onMessage); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [save]);

  if (isLoading) return <div className="s8-card"><p className="text-sm text-muted-foreground">Carregando seu treinamento…</p></div>;
  if (error || !data) return <div className="s8-card"><h1 className="font-serif text-2xl">Do Mamão ao Negócio</h1><p className="mt-2 text-sm text-muted-foreground">Não foi possível abrir o treinamento. Confirme que sua compra já foi aprovada.</p><a href="/cliente/biblioteca" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Voltar à Biblioteca</a></div>;

  return <div className="space-y-4">
    <section className="s8-card" style={{ background: "linear-gradient(145deg,#4b101d,#2b0a11)", color: "#f7ead8", borderColor: "#b58a44" }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><a href="/cliente/treinamentos" className="inline-flex items-center gap-1 text-xs font-bold opacity-80 hover:opacity-100"><ArrowLeft className="h-4 w-4"/> Meus treinamentos</a><p className="mt-4 text-xs font-bold uppercase tracking-[.18em]" style={{color:"#d6ad63"}}>Treinamento · 3 meses · 300 horas</p><h1 className="mt-1 flex items-center gap-2 font-serif text-3xl"><GraduationCap className="h-7 w-7"/> Do Mamão ao Negócio</h1><p className="mt-2 text-sm opacity-85">Sistema S8 · atividades · quizzes · Laboratório de Campo · Projeto de Negócio · fórum · encontros ao vivo</p></div>
        <div className="min-w-[220px] rounded-xl border p-4" style={{borderColor:"#b58a44",background:"rgba(255,255,255,.06)"}}><div className="flex items-center gap-2 text-sm font-bold"><Cloud className="h-4 w-4"/> {syncLabel}</div><div className="mt-3 flex items-center justify-between text-xs"><span>Progresso</span><strong>{cloudProgress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full" style={{width:`${cloudProgress}%`,background:"#d6ad63"}}/></div>{data.cohortNumber ? <p className="mt-3 text-xs">Turma {data.cohortNumber}</p> : null}{data.certificateAvailableAt ? <p className="mt-2 flex items-center gap-1 text-xs"><CheckCircle2 className="h-4 w-4"/> Certificado disponível a partir de {new Date(data.certificateAvailableAt).toLocaleDateString("pt-BR")}</p> : null}</div>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <iframe ref={iframeRef} title="Do Mamão ao Negócio — treinamento completo" srcDoc={data.html} className="block w-full border-0" style={{minHeight:"calc(100vh - 150px)",height:"1200px"}} allow="clipboard-write" />
    </section>
  </div>;
}
