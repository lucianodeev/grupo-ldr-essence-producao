import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { addUser, auditLogs, listUsers, removeUser, toggleUserActive } from "@/lib/access.functions";
import type { AppRole } from "@/lib/access.server";

export function AccessManagement() {
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const fetchLogs = useServerFn(auditLogs);
  const create = useServerFn(addUser);
  const toggle = useServerFn(toggleUserActive);
  const remove = useServerFn(removeUser);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("colaborador");

  const users = useQuery({ queryKey: ["access-users"], queryFn: () => fetchUsers({}) });
  const logs = useQuery({ queryKey: ["audit-logs"], queryFn: () => fetchLogs({}) });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["access-users"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
  }

  const createMutation = useMutation({
    mutationFn: () => create({ data: { email, fullName, password, role } }),
    onSuccess: (result) => {
      toast.success(
        result.reusedExistingAccount
          ? "Conta existente vinculada ao painel profissional."
          : "Colaborador cadastrado com sucesso.",
      );
      setEmail("");
      setFullName("");
      setPassword("");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível cadastrar o colaborador."),
  });

  const toggleMutation = useMutation({
    mutationFn: (vars: { targetId: string; isActive: boolean }) => toggle({ data: vars }),
    onSuccess: () => {
      toast.success("Acesso atualizado.");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Ação não permitida."),
  });

  const removeMutation = useMutation({
    mutationFn: (vars: { targetId: string }) => remove({ data: vars }),
    onSuccess: () => {
      toast.success("Acesso removido.");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Ação não permitida."),
  });

  return (
    <div className="space-y-5">
      <section className="s8-card overflow-hidden">
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
            Cadastro de colaborador
          </p>
          <h2 className="mt-1 font-serif text-2xl">Adicionar uma pessoa à equipe</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Use o e-mail real do colaborador. Se esse e-mail já tiver entrado na Área do Cliente ou pelo Google, a mesma conta será vinculada ao painel profissional — não será criada uma conta duplicada.
          </p>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div>
            <label className="s8-label" htmlFor="new-email">
              E-mail do colaborador
            </label>
            <input
              id="new-email"
              type="email"
              autoComplete="email"
              required
              placeholder="nome@empresa.com"
              className="s8-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="s8-label" htmlFor="new-name">
              Nome completo
            </label>
            <input
              id="new-name"
              required
              autoComplete="name"
              placeholder="Nome e sobrenome"
              className="s8-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="s8-label" htmlFor="new-password">
              Senha inicial
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              placeholder="Mínimo de 12 caracteres"
              className="s8-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              A senha não fica visível no painel. O colaborador poderá redefini-la depois pelo fluxo de recuperação de acesso.
            </p>
          </div>
          <div>
            <label className="s8-label" htmlFor="new-role">
              Nível de acesso
            </label>
            <select
              id="new-role"
              className="s8-field"
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
            >
              <option value="colaborador">Colaborador — operação</option>
              <option value="superadmin">Superadmin — acesso total</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Para a equipe comum, mantenha “Colaborador”. Use Superadmin somente para quem realmente precisa administrar acessos.
            </p>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {createMutation.isPending ? "Cadastrando…" : "Cadastrar colaborador"}
            </button>
          </div>
        </form>
      </section>

      <section className="s8-card">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Equipe</p>
            <h3 className="mt-1 font-serif text-xl">Pessoas com acesso</h3>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            {(users.data ?? []).length} {(users.data ?? []).length === 1 ? "acesso" : "acessos"}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3">Nome</th>
                <th className="px-3 py-3">E-mail</th>
                <th className="px-3 py-3">Perfil</th>
                <th className="px-3 py-3">Situação</th>
                <th className="px-3 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(users.data ?? []).map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-3 py-3 font-semibold">{u.fullName ?? "—"}</td>
                  <td className="px-3 py-3">{u.email}</td>
                  <td className="px-3 py-3">{u.role ?? "sem perfil"}</td>
                  <td className="px-3 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{
                        background: u.isActive ? "var(--gold-soft)" : "var(--muted)",
                        color: u.isActive ? "var(--accent-foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary transition hover:bg-accent"
                        onClick={() =>
                          toggleMutation.mutate({ targetId: u.id, isActive: !u.isActive })
                        }
                      >
                        {u.isActive ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-3 py-2 text-xs font-bold text-destructive-foreground transition hover:opacity-90"
                        style={{ background: "var(--destructive)" }}
                        onClick={() => {
                          if (window.confirm("Remover definitivamente o acesso desta pessoa?")) {
                            removeMutation.mutate({ targetId: u.id });
                          }
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="s8-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Segurança</p>
        <h3 className="mt-1 font-serif text-xl">Registros de auditoria</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico das alterações de acesso para facilitar conferência e rastreabilidade.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {(logs.data ?? []).map((log) => (
            <li key={log.id} className="rounded-lg border border-border/60 px-3 py-2">
              <span className="font-semibold">{log.action}</span>{" "}
              <span className="text-muted-foreground">
                — {log.actor_email ?? "—"} • {new Date(log.created_at).toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
          {logs.data?.length === 0 && (
            <li className="text-muted-foreground">Nenhum registro por enquanto.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
