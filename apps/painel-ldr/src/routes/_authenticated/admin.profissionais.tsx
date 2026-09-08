import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  professionalNetworkAdmin,
  professionalNetworkFinancialUpdate,
  professionalNetworkPreparePayout,
  professionalNetworkReview,
  professionalNetworkUpsert,
} from "@/lib/professional-network-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/profissionais")({
  component: NetworkAdmin,
});
type AnyRow = Record<string, any>;
type Model = "subscription" | "commission" | "exempt";
type ProfessionalForm = {
  profileId: string;
  email: string;
  displayName: string;
  professionalTitle: string;
  slug: string;
  categoryId: string;
  countryCode: string;
  city: string;
  languages: string;
  onlineEnabled: boolean;
  inPersonEnabled: boolean;
  engagementModel: Model;
  commissionPercent: string;
  publish: boolean;
};

const EMPTY_FORM: ProfessionalForm = {
  profileId: "",
  email: "",
  displayName: "",
  professionalTitle: "",
  slug: "",
  categoryId: "",
  countryCode: "BE",
  city: "",
  languages: "pt, fr",
  onlineEnabled: true,
  inPersonEnabled: false,
  engagementModel: "subscription",
  commissionPercent: "10",
  publish: false,
};
const FIELD_CLASS =
  "mt-1 min-h-11 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "pt-PT", {
    style: "currency",
    currency,
  }).format((cents || 0) / 100);
}

function modelLabel(model: Model | undefined) {
  if (model === "commission") return "Comissão por atendimento";
  if (model === "exempt") return "Isento / parceria administrativa";
  return "Assinatura mensal";
}

function NetworkAdmin() {
  const load = useServerFn(professionalNetworkAdmin);
  const review = useServerFn(professionalNetworkReview);
  const upsert = useServerFn(professionalNetworkUpsert);
  const updateFinancial = useServerFn(professionalNetworkFinancialUpdate);
  const preparePayout = useServerFn(professionalNetworkPreparePayout);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [commission, setCommission] = useState("10");
  const [payoutDays, setPayoutDays] = useState("30");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProfessionalForm>(EMPTY_FORM);

  const refresh = async () => {
    const result = await load();
    setData(result);
    const currentCommission = (result.config ?? []).find(
      (item: AnyRow) => item.config_key === "platform_commission_rate",
    );
    const currentDays = (result.config ?? []).find(
      (item: AnyRow) => item.config_key === "payout_frequency_days",
    );
    setCommission(String(Number(currentCommission?.numeric_value ?? 0.1) * 100));
    setPayoutDays(String(Number(currentDays?.numeric_value ?? 30)));
  };
  useEffect(() => {
    void refresh();
  }, []);

  const profiles = (data?.profiles ?? []) as AnyRow[];
  const plans = (data?.plans ?? []) as AnyRow[];
  const payments = (data?.payments ?? []) as AnyRow[];
  const payouts = (data?.payouts ?? []) as AnyRow[];
  const categories = (data?.categories ?? []) as AnyRow[];
  const paid = payments.filter(
    (payment) => payment.status === "paid" || payment.status === "partially_refunded",
  );
  const gmv = paid.reduce((sum, payment) => sum + Number(payment.gross_amount_cents || 0), 0);
  const fee = paid.reduce((sum, payment) => sum + Number(payment.platform_fee_cents || 0), 0);

  function closeForm() {
    setForm(EMPTY_FORM);
    setFormOpen(false);
  }
  function editProfessional(profile: AnyRow) {
    setForm({
      profileId: profile.id,
      email: profile.account?.email || "",
      displayName: profile.display_name || "",
      professionalTitle: profile.professional_title || "",
      slug: profile.slug || "",
      categoryId: profile.category_id || "",
      countryCode: profile.country_code || "BE",
      city: profile.city || "",
      languages: (profile.languages || []).join(", "),
      onlineEnabled: Boolean(profile.online_enabled),
      inPersonEnabled: Boolean(profile.in_person_enabled),
      engagementModel: profile.account?.engagement_model || "subscription",
      commissionPercent: String(Number(profile.account?.custom_commission_rate || 0.1) * 100),
      publish: Boolean(profile.is_public && profile.profile_status === "active"),
    });
    setFormOpen(true);
    requestAnimationFrame(() =>
      document
        .getElementById("cadastro-profissional")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  async function saveProfessional(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await upsert({
        data: {
          profileId: form.profileId || undefined,
          email: form.email || undefined,
          displayName: form.displayName,
          professionalTitle: form.professionalTitle,
          slug: form.slug || undefined,
          categoryId: form.categoryId,
          countryCode: form.countryCode,
          city: form.city || undefined,
          languages: form.languages
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          onlineEnabled: form.onlineEnabled,
          inPersonEnabled: form.inPersonEnabled,
          engagementModel: form.engagementModel,
          commissionPercent:
            form.engagementModel === "commission" ? Number(form.commissionPercent) : null,
          publish: form.publish,
        },
      });
      toast.success(form.profileId ? "Profissional atualizado." : "Profissional cadastrado.");
      closeForm();
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o profissional.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function doReview(
    profileId: string,
    action: "approve" | "pause" | "suspend" | "request_documents",
  ) {
    setBusy(true);
    try {
      await review({
        data: {
          profileId,
          action,
          identityVerified: true,
          documentsVerified: true,
          profileVerified: true,
        },
      });
      toast.success("Perfil atualizado.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setBusy(false);
    }
  }
  async function saveFinance() {
    setBusy(true);
    try {
      await updateFinancial({
        data: { commissionPercent: Number(commission), payoutFrequencyDays: Number(payoutDays) },
      });
      toast.success("Configuração financeira atualizada.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function makePayout(profile: AnyRow) {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    setBusy(true);
    try {
      await preparePayout({
        data: {
          professionalAccountId: profile.professional_account_id,
          periodStart: first.toISOString().slice(0, 10),
          periodEnd: last.toISOString().slice(0, 10),
          currency: profile.account?.preferred_currency === "BRL" ? "BRL" : "EUR",
        },
      });
      toast.success("Ciclo de repasse preparado.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível preparar o repasse.");
    } finally {
      setBusy(false);
    }
  }

  if (!data)
    return <p className="text-sm text-muted-foreground">Carregando Rede de Profissionais…</p>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-primary">
            Marketplace + Comunidade
          </p>
          <h1 className="mt-1 font-serif text-4xl">Rede de Profissionais LDR</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestão de profissionais, aprovação, planos, comissão, atendimentos e repasses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setFormOpen(true);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-black text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          CADASTRAR PROFISSIONAL
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="PROFISSIONAIS" value={profiles.length} />
        <Stat
          label="PERFIS ATIVOS"
          value={
            profiles.filter((profile) => profile.profile_status === "active" && profile.is_public)
              .length
          }
        />
        <Stat label="ATENDIMENTOS PAGOS" value={paid.length} />
        <Stat
          label="REPASSES PENDENTES"
          value={payouts.filter((payout) => payout.status !== "paid").length}
        />
      </div>

      {formOpen ? (
        <section
          id="cadastro-profissional"
          className="scroll-mt-24 rounded-3xl border border-primary/30 bg-card p-5 shadow-lg sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-primary">
                GESTÃO MANUAL
              </p>
              <h2 className="mt-1 font-serif text-2xl">
                {form.profileId ? "Editar profissional" : "Cadastrar profissional"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastre sem alterar os profissionais existentes. Convites usam o login oficial do
                Painel LDR.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Fechar formulário"
              className="grid h-11 w-11 place-items-center rounded-full border"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form
            onSubmit={saveProfessional}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label="E-mail de acesso">
              <input
                required={!form.profileId}
                disabled={Boolean(form.profileId)}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={FIELD_CLASS}
                placeholder="profissional@email.com"
              />
            </Field>
            <Field label="Nome público">
              <input
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="URL pública (slug)">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={FIELD_CLASS}
                placeholder="nome-do-profissional"
              />
            </Field>
            <Field label="Título profissional" wide>
              <input
                required
                value={form.professionalTitle}
                onChange={(e) => setForm({ ...form, professionalTitle: e.target.value })}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Área de atuação">
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={FIELD_CLASS}
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_pt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="País (código)">
              <input
                required
                minLength={2}
                maxLength={2}
                value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value.toUpperCase() })}
                className={`${FIELD_CLASS} uppercase`}
              />
            </Field>
            <Field label="Cidade / região pública">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Idiomas (separados por vírgula)">
              <input
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Modelo comercial">
              <select
                value={form.engagementModel}
                onChange={(e) => setForm({ ...form, engagementModel: e.target.value as Model })}
                className={FIELD_CLASS}
              >
                <option value="subscription">Assinatura mensal</option>
                <option value="commission">Comissão por atendimento</option>
                <option value="exempt">Isento / parceria administrativa</option>
              </select>
            </Field>
            {form.engagementModel === "commission" ? (
              <Field label="Comissão (10% a 20%)">
                <input
                  required
                  type="number"
                  min="10"
                  max="20"
                  step="0.1"
                  value={form.commissionPercent}
                  onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
                  className={FIELD_CLASS}
                />
              </Field>
            ) : null}
            <div className="flex flex-wrap items-center gap-5 sm:col-span-2 lg:col-span-3">
              <Check
                label="Atendimento online"
                checked={form.onlineEnabled}
                onChange={(checked) => setForm({ ...form, onlineEnabled: checked })}
              />
              <Check
                label="Atendimento presencial"
                checked={form.inPersonEnabled}
                onChange={(checked) => setForm({ ...form, inPersonEnabled: checked })}
              />
              <Check
                label="Publicar / ativar perfil"
                checked={form.publish}
                onChange={(checked) => setForm({ ...form, publish: checked })}
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
              <button
                disabled={busy}
                className="min-h-11 rounded-xl bg-primary px-6 py-3 font-black text-primary-foreground disabled:opacity-50"
              >
                {busy ? "SALVANDO…" : "SALVAR PROFISSIONAL"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="min-h-11 rounded-xl border px-6 py-3 font-bold"
              >
                CANCELAR
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Configurações financeiras</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="Comissão padrão da plataforma (%)">
            <input
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              type="number"
              min="0"
              max="50"
              step="0.1"
              className={FIELD_CLASS}
            />
          </Field>
          <Field label="Periodicidade do repasse (dias)">
            <input
              value={payoutDays}
              onChange={(e) => setPayoutDays(e.target.value)}
              type="number"
              min="1"
              max="90"
              className={FIELD_CLASS}
            />
          </Field>
          <button
            disabled={busy}
            onClick={saveFinance}
            className="min-h-11 self-end rounded-xl bg-primary px-4 py-3 font-black text-primary-foreground"
          >
            SALVAR
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border p-4">
              <p className="text-xs font-black text-primary">{plan.market}</p>
              <p className="font-bold">{plan.name}</p>
              <p className="mt-2 text-xl font-black">
                {money(plan.amount_cents, plan.currency)}/mês
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Profissionais e aprovações</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Profissional</th>
                <th>País</th>
                <th>Modelo</th>
                <th>Cadastro</th>
                <th>Conformidade</th>
                <th>Perfil</th>
                <th>Assinatura</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0">
                  <td className="py-3">
                    <strong>{profile.display_name}</strong>
                    <p className="max-w-xs text-xs text-muted-foreground">
                      {profile.professional_title}
                    </p>
                    <p className="text-xs text-muted-foreground">{profile.account?.email}</p>
                  </td>
                  <td>{profile.country_code}</td>
                  <td>
                    {modelLabel(profile.account?.engagement_model)}
                    {profile.account?.engagement_model === "commission" ? (
                      <p className="text-xs font-bold">
                        {Number(profile.account.custom_commission_rate || 0) * 100}%
                      </p>
                    ) : null}
                  </td>
                  <td>{profile.account?.status}</td>
                  <td>{profile.compliance_status}</td>
                  <td>
                    {profile.profile_status}
                    {profile.is_public ? " · público" : ""}
                  </td>
                  <td>{profile.subscription?.status || "—"}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busy}
                        onClick={() => editProfessional(profile)}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"
                      >
                        <Pencil className="h-3 w-3" />
                        EDITAR
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => doReview(profile.id, "approve")}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
                      >
                        ATIVAR / PUBLICAR
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => doReview(profile.id, "request_documents")}
                        className="rounded-lg border px-3 py-2 text-xs font-bold"
                      >
                        PEDIR DOC.
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => doReview(profile.id, "pause")}
                        className="rounded-lg border px-3 py-2 text-xs font-bold"
                      >
                        DESATIVAR
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => makePayout(profile)}
                        className="rounded-lg border px-3 py-2 text-xs font-bold"
                      >
                        FECHAR REPASSE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-3xl border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Financeiro da Rede</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="GMV (histórico carregado)" value={money(gmv, paid[0]?.currency || "EUR")} />
          <Stat label="RECEITA DE COMISSÃO" value={money(fee, paid[0]?.currency || "EUR")} />
          <Stat label="PAGAMENTOS" value={payments.length} />
          <Stat label="REPASSES" value={payouts.length} />
        </div>
        <div className="mt-5 rounded-xl bg-muted/50 p-4 text-xs leading-5">
          Valores BRL e EUR devem ser analisados separadamente quando houver operações nas duas
          moedas. O painel não faz conversão cambial automática.
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`text-sm font-bold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2 text-sm font-bold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}
function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-primary">{value}</p>
    </div>
  );
}
