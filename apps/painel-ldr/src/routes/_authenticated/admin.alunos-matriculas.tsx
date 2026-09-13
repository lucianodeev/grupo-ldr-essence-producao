import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpenCheck, GraduationCap, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { adminAcademyEnrollments } from "@/lib/admin-academy-enrollments.functions";
import { useAccess } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/alunos-matriculas")({ component: AdminAcademyStudents });

const ACCESS_LABELS = { gratuito: "Gratuito", avulso: "Compra avulsa", assinatura: "Assinatura" } as const;
const STATUS_LABELS = { ativo: "Ativo", concluido: "Concluído", inativo: "Inativo" } as const;

function date(value: string) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "—";
}

function AdminAcademyStudents() {
  const access = useAccess();
  const load = useServerFn(adminAcademyEnrollments);
  const query = useQuery({ queryKey: ["admin-academy-enrollments"], queryFn: () => load({}), staleTime: 30_000 });
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("todos");
  const [accessType, setAccessType] = useState("todos");
  const [status, setStatus] = useState("todos");

  const courseOptions = useMemo(() => [...new Set((query.data?.students ?? []).flatMap((student) => student.courses.map((item) => item.title)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [query.data]);
  const students = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return (query.data?.students ?? []).flatMap((student) => {
      const courses = student.courses.filter((item) =>
        (course === "todos" || item.title === course) &&
        (accessType === "todos" || item.accessType === accessType) &&
        (status === "todos" || item.status === status),
      );
      const matchesText = !term || student.name.toLocaleLowerCase("pt-BR").includes(term) || student.email.toLocaleLowerCase("pt-BR").includes(term) || courses.some((item) => item.title.toLocaleLowerCase("pt-BR").includes(term));
      return courses.length && matchesText ? [{ ...student, courses }] : [];
    });
  }, [query.data, search, course, accessType, status]);

  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const metrics = query.data?.metrics;
  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">LDR Essence Academy</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div><h1 className="flex items-center gap-3 font-serif text-3xl text-[#0B1F3A] sm:text-4xl"><UsersRound className="h-8 w-8"/>Alunos e Matrículas</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Visão consolidada dos alunos matriculados em cursos gratuitos, compras avulsas e conteúdos liberados pela assinatura.</p></div>{query.data?.generatedAt ? <p className="text-xs text-slate-500">Atualizado em {new Date(query.data.generatedAt).toLocaleString("pt-BR")}</p> : null}</div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Alunos",metrics?.totalStudents],["Matrículas",metrics?.totalEnrollments],["Gratuitas",metrics?.freeEnrollments],["Avulsas",metrics?.oneTimeEnrollments],["Por assinatura",metrics?.subscriptionEnrollments]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-[#C7A33B]/30 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</p><p className="mt-2 font-serif text-3xl text-[#0B1F3A]">{value ?? "—"}</p></div>)}</div>
    </section>

    <section className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.5fr)_repeat(3,minmax(150px,1fr))]">
        <label className="relative"><span className="sr-only">Buscar aluno ou curso</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno, e-mail ou curso" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm"/></label>
        <select aria-label="Filtrar por curso" value={course} onChange={(event) => setCourse(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="todos">Todos os cursos</option>{courseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select aria-label="Filtrar por acesso" value={accessType} onChange={(event) => setAccessType(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="todos">Todos os acessos</option><option value="gratuito">Gratuito</option><option value="avulso">Compra avulsa</option><option value="assinatura">Assinatura</option></select>
        <select aria-label="Filtrar por situação" value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="todos">Todas as situações</option><option value="ativo">Ativo</option><option value="concluido">Concluído</option><option value="inativo">Inativo</option></select>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">{students.length} aluno(s) encontrado(s)</p>
    </section>

    {query.isError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Não foi possível carregar as matrículas agora. Recarregue a página para tentar novamente.</div> : null}
    {query.isLoading ? <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Carregando alunos e matrículas...</div> : null}
    {!query.isLoading && !query.isError && students.length === 0 ? <div className="rounded-2xl border border-dashed border-[#C7A33B] bg-white p-10 text-center"><GraduationCap className="mx-auto h-10 w-10 text-[#C7A33B]"/><h2 className="mt-3 font-serif text-2xl text-[#0B1F3A]">Nenhum aluno encontrado</h2><p className="mt-2 text-sm text-slate-500">Ajuste os filtros ou aguarde a primeira matrícula.</p></div> : null}
    <section className="grid gap-4">{students.map((student) => <article key={student.id} className="overflow-hidden rounded-2xl border border-[#C7A33B]/35 bg-white shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-[#F8F3E8]/60 p-5"><div><h2 className="font-serif text-2xl text-[#0B1F3A]">{student.name}</h2><p className="mt-1 break-all text-sm text-slate-500">{student.email || "E-mail não informado"}</p></div><span className="rounded-full bg-[#0B1F3A] px-3 py-1 text-xs font-bold text-white">{student.courses.length} curso(s)</span></div><div className="grid gap-3 p-4 sm:p-5">{student.courses.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="flex items-center gap-2 font-bold text-[#0B1F3A]"><BookOpenCheck className="h-4 w-4 shrink-0 text-[#C7A33B]"/>{item.title}</h3><p className="mt-2 text-xs text-slate-500">Matrícula: {date(item.enrolledAt)}</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#F8F3E8] px-3 py-1 text-xs font-bold text-[#0B1F3A]">{ACCESS_LABELS[item.accessType]}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "concluido" ? "bg-emerald-50 text-emerald-700" : item.status === "inativo" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"}`}>{STATUS_LABELS[item.status]}</span></div></div><div className="mt-4"><div className="flex justify-between text-xs font-semibold text-slate-500"><span>Progresso</span><span>{item.progressPercent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#C7A33B]" style={{ width: `${item.progressPercent}%` }}/></div></div></div>)}</div></article>)}</section>
    <Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}
