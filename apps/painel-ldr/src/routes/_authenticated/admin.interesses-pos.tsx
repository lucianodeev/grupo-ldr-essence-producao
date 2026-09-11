import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAccess } from "@/lib/central-data";
import { adminPostgraduateInterests, adminUpdatePostgraduateInterestStatus } from "@/lib/postgraduate-interest.functions";

export const Route = createFileRoute("/_authenticated/admin/interesses-pos")({ component: AdminPostgraduateInterests });

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  converted: "Convertido",
  archived: "Arquivado",
};

function AdminPostgraduateInterests() {
  const access = useAccess();
  const listFn = useServerFn(adminPostgraduateInterests);
  const statusFn = useServerFn(adminUpdatePostgraduateInterestStatus);
  const qc = useQueryClient();
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const interests = useQuery({ queryKey: ["admin-postgraduate-interests"], queryFn: () => listFn({}), retry: false });
  const updateStatus = useMutation({
    mutationFn: (input: { id: string; status: string }) => statusFn({ data: input }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["admin-postgraduate-interests"] }); toast.success("Status atualizado."); },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  const list = (interests.data ?? []) as Array<any>;
  const courses = useMemo(() => [...new Map(list.map((row) => [row.course_key, row.course_title])).entries()], [list]);
  const filtered = list.filter((row) => (courseFilter === "all" || row.course_key === courseFilter) && (statusFilter === "all" || row.status === statusFilter));
  const newCount = list.filter((row) => row.status === "new").length;
  const contactedCount = list.filter((row) => row.status === "contacted").length;
  const convertedCount = list.filter((row) => row.status === "converted").length;

  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Interesses em Pós-Graduação</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Pessoas que clicaram em “Tenho interesse” na Biblioteca LDR e autorizaram contato sobre o lançamento do curso escolhido.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Total</p><p className="mt-1 font-serif text-3xl text-[#0B1F3A]">{list.length}</p></div>
        <div className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Novos</p><p className="mt-1 font-serif text-3xl text-[#0B1F3A]">{newCount}</p></div>
        <div className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Contatados</p><p className="mt-1 font-serif text-3xl text-[#0B1F3A]">{contactedCount}</p></div>
        <div className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Convertidos</p><p className="mt-1 font-serif text-3xl text-[#0B1F3A]">{convertedCount}</p></div>
      </div>
    </section>

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-bold text-[#0B1F3A]">Curso<select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"><option value="all">Todos os cursos</option>{courses.map(([key,title]) => <option key={key} value={key}>{title}</option>)}</select></label>
        <label className="text-sm font-bold text-[#0B1F3A]">Status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"><option value="all">Todos os status</option>{Object.entries(STATUS_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
    </section>

    {interests.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível carregar os interessados agora.</div> : interests.isLoading ? <p className="text-sm text-slate-500">Carregando interessados...</p> : filtered.length === 0 ? <section className="rounded-2xl border bg-white p-6 text-sm text-slate-500">Nenhum interessado encontrado para os filtros selecionados.</section> : <section className="grid gap-4 lg:grid-cols-2">{filtered.map((row) => <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#C7A33B]">{row.course_title}</p><h2 className="mt-2 font-serif text-2xl text-[#0B1F3A]">{row.full_name}</h2></div><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-bold text-[#0B1F3A]">{STATUS_LABELS[row.status] ?? row.status}</span></div>
      <div className="mt-4 space-y-2 text-sm"><p><span className="font-bold text-[#0B1F3A]">E-mail:</span> <a className="break-all underline" href={`mailto:${row.email}`}>{row.email}</a></p><p><span className="font-bold text-[#0B1F3A]">Telefone:</span> <a className="underline" href={`tel:${row.phone}`}>{row.phone}</a></p><p className="text-xs text-slate-500">Registrado em {new Date(row.created_at).toLocaleString("pt-BR")}</p></div>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[.1em] text-slate-500">Atualizar status<select disabled={updateStatus.isPending} value={row.status} onChange={(e) => updateStatus.mutate({ id: row.id, status: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-[#0B1F3A]">{Object.entries(STATUS_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </article>)}</section>}

    <Link to="/admin" className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}
