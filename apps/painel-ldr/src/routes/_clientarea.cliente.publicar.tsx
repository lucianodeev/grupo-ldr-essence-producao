import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileUp, Store, WalletCards } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  clientCreateCreatorUploadUrl,
  clientCreatorProducts,
  clientSubmitCreatorProduct,
} from "@/lib/creator-marketplace.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/publicar")({ component: CreatorPublishingPage });

type Locale = "pt" | "en" | "fr" | "es";

const COPY = {
  pt: {
    title: "Publique na LDR Academy",
    intro: "Você cria. A LDR Academy hospeda, vende e entrega. Você recebe 85% de cada venda.",
    noFee: "Sem mensalidade · sem taxa de cadastro · 15% de comissão LDR somente quando houver venda.",
    deadline: "Após aprovação e recebimento de todas as informações necessárias, a publicação pode levar até 5 dias úteis.",
    creator: "Dados do criador",
    product: "Produto",
    files: "Arquivos",
    rights: "Declaro que sou autor, titular dos direitos ou possuo autorização para comercializar este conteúdo.",
    policy: "Estou ciente de que materiais que violem direitos autorais, leis aplicáveis ou políticas da plataforma poderão ser recusados ou removidos.",
    submit: "ENVIAR PARA ANÁLISE",
    sending: "Enviando…",
    mine: "Meus produtos",
    empty: "Você ainda não publicou nenhum produto.",
    first: "PUBLICAR MEU PRIMEIRO PRODUTO",
    suggested: "Preço sugerido",
    priceNote: "O preço final será aprovado pela LDR Academy antes da publicação.",
  },
  en: {
    title: "Publish on LDR Academy",
    intro: "You create. LDR Academy hosts, sells and delivers. You receive 85% of each sale.",
    noFee: "No monthly fee · no listing fee · 15% LDR commission only when a sale happens.",
    deadline: "After approval and receipt of all required information, publication may take up to 5 business days.",
    creator: "Creator details", product: "Product", files: "Files",
    rights: "I declare that I am the author, rights holder or have authorization to sell this content.",
    policy: "I understand that content that violates copyright, applicable law or platform policies may be rejected or removed.",
    submit: "SUBMIT FOR REVIEW", sending: "Submitting…", mine: "My products", empty: "You have not submitted any products yet.", first: "PUBLISH MY FIRST PRODUCT", suggested: "Suggested price", priceNote: "The final price must be approved by LDR Academy before publication.",
  },
  fr: {
    title: "Publiez sur LDR Academy",
    intro: "Vous créez. LDR Academy héberge, vend et livre. Vous recevez 85 % de chaque vente.",
    noFee: "Sans abonnement · sans frais d'inscription · 15 % de commission LDR uniquement en cas de vente.",
    deadline: "Après approbation et réception de toutes les informations nécessaires, la publication peut prendre jusqu'à 5 jours ouvrés.",
    creator: "Données du créateur", product: "Produit", files: "Fichiers",
    rights: "Je déclare être l'auteur, titulaire des droits ou autorisé à commercialiser ce contenu.",
    policy: "Je comprends que les contenus enfreignant les droits d'auteur, la loi ou les règles de la plateforme peuvent être refusés ou retirés.",
    submit: "ENVOYER POUR VALIDATION", sending: "Envoi…", mine: "Mes produits", empty: "Vous n'avez encore soumis aucun produit.", first: "PUBLIER MON PREMIER PRODUIT", suggested: "Prix suggéré", priceNote: "Le prix final doit être approuvé par LDR Academy avant publication.",
  },
  es: {
    title: "Publica en LDR Academy",
    intro: "Tú creas. LDR Academy aloja, vende y entrega. Recibes el 85 % de cada venta.",
    noFee: "Sin mensualidad · sin tarifa de registro · 15 % de comisión LDR solo cuando haya una venta.",
    deadline: "Tras la aprobación y recepción de toda la información necesaria, la publicación puede tardar hasta 5 días hábiles.",
    creator: "Datos del creador", product: "Producto", files: "Archivos",
    rights: "Declaro que soy autor, titular de los derechos o tengo autorización para comercializar este contenido.",
    policy: "Entiendo que los contenidos que infrinjan derechos de autor, leyes aplicables o políticas de la plataforma podrán ser rechazados o retirados.",
    submit: "ENVIAR A REVISIÓN", sending: "Enviando…", mine: "Mis productos", empty: "Aún no has enviado ningún producto.", first: "PUBLICAR MI PRIMER PRODUCTO", suggested: "Precio sugerido", priceNote: "El precio final debe ser aprobado por LDR Academy antes de publicarse.",
  },
} as const;

const STATUS: Record<string, string> = {
  draft: "Rascunho", submitted: "Enviado", under_review: "Em análise", changes_requested: "Ajustes solicitados",
  approved: "Aprovado", preparing: "Em preparação", published: "Publicado", rejected: "Recusado", suspended: "Suspenso",
};

function CreatorPublishingPage() {
  const { locale: rawLocale } = useI18n();
  const locale = (rawLocale === "en" || rawLocale === "fr" || rawLocale === "es" ? rawLocale : "pt") as Locale;
  const t = COPY[locale];
  const listFn = useServerFn(clientCreatorProducts);
  const uploadFn = useServerFn(clientCreateCreatorUploadUrl);
  const submitFn = useServerFn(clientSubmitCreatorProduct);
  const { data: products = [], refetch } = useQuery({ queryKey: ["creator-products"], queryFn: () => listFn({}) });
  const [files, setFiles] = useState<File[]>([]);
  const [rights, setRights] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [busy, setBusy] = useState(false);

  const defaultCurrency = useMemo(() => locale === "pt" ? "EUR" : "EUR", [locale]);

  const mutation = useMutation({
    mutationFn: submitFn,
    onSuccess: async () => {
      toast.success(locale === "pt" ? "Produto enviado para análise." : "Product submitted for review.");
      setFiles([]);
      setRights(false);
      setPolicy(false);
      await refetch();
      const form = document.getElementById("creator-product-form") as HTMLFormElement | null;
      form?.reset();
    },
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rights || !policy) {
      toast.error(locale === "pt" ? "Aceite as declarações obrigatórias." : "Accept the required declarations.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const uploaded: Array<{ path: string; name: string; contentType: string; size: number }> = [];
      for (const file of files) {
        const contentType = file.type || "application/octet-stream";
        const signed = await uploadFn({ data: { fileName: file.name, contentType, size: file.size } });
        const { error } = await supabase.storage.from("creator-submissions-private").uploadToSignedUrl(signed.path, signed.token, file, { contentType });
        if (error) throw error;
        uploaded.push({ path: signed.path, name: file.name, contentType, size: file.size });
      }
      const priceRaw = String(form.get("price") || "").trim().replace(",", ".");
      const cents = priceRaw ? Math.round(Number(priceRaw) * 100) : null;
      await mutation.mutateAsync({ data: {
        creatorName: String(form.get("creatorName") || ""), publicName: String(form.get("publicName") || ""),
        email: String(form.get("email") || ""), phone: String(form.get("phone") || ""), country: String(form.get("country") || ""), city: String(form.get("city") || ""),
        locale, bio: String(form.get("bio") || ""), title: String(form.get("title") || ""), subtitle: String(form.get("subtitle") || ""),
        category: String(form.get("category") || ""), productType: String(form.get("productType") || "other"), shortDescription: String(form.get("shortDescription") || ""),
        description: String(form.get("description") || ""), targetAudience: String(form.get("targetAudience") || ""), productLanguage: String(form.get("productLanguage") || locale),
        suggestedPriceCents: Number.isFinite(cents) ? cents : null, currency: String(form.get("currency") || defaultCurrency) as "BRL" | "EUR" | "USD",
        keywords: String(form.get("keywords") || "").split(",").map(x => x.trim()).filter(Boolean), rightsAccepted: true, files: uploaded,
      } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o produto.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[28px] border border-[#d6ad63]/45 bg-white shadow-sm">
      <div className="bg-[#071426] px-5 py-7 text-white sm:px-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#d6ad63]">LDR CREATORS</p>
        <h1 className="mt-2 font-serif text-3xl">{t.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">{t.intro}</p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
        <div className="rounded-2xl bg-[#f8f3e7] p-4"><WalletCards className="h-5 w-5"/><p className="mt-2 text-2xl font-black">85%</p><p className="text-xs text-muted-foreground">Para o criador</p></div>
        <div className="rounded-2xl bg-[#f8f3e7] p-4"><Store className="h-5 w-5"/><p className="mt-2 text-2xl font-black">15%</p><p className="text-xs text-muted-foreground">Comissão LDR</p></div>
        <div className="rounded-2xl bg-[#f8f3e7] p-4"><FileUp className="h-5 w-5"/><p className="mt-2 text-sm font-black">{t.noFee}</p></div>
      </div>
      <p className="px-5 pb-6 text-xs text-muted-foreground sm:px-7">{t.deadline}</p>
    </section>

    <form id="creator-product-form" onSubmit={onSubmit} className="space-y-5 rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-serif text-2xl">{t.creator}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="creatorName" label="Nome completo *" required/><Field name="publicName" label="Nome público / autor"/>
        <Field name="email" label="E-mail *" type="email" required/><Field name="phone" label="WhatsApp / telefone"/>
        <Field name="country" label="País"/><Field name="city" label="Cidade"/>
      </div>
      <TextArea name="bio" label="Mini biografia"/>

      <h2 className="pt-3 font-serif text-2xl">{t.product}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="title" label="Título *" required/><Field name="subtitle" label="Subtítulo"/>
        <Field name="category" label="Categoria *" required/>
        <label className="text-sm font-semibold">Tipo de produto<select name="productType" className="mt-1 w-full rounded-xl border bg-white px-3 py-3"><option value="ebook">eBook</option><option value="digital_book">Livro digital</option><option value="academic_material">Material acadêmico</option><option value="handout">Apostila</option><option value="course">Curso</option><option value="formation">Formação</option><option value="training">Treinamento</option><option value="professional_material">Material profissional</option><option value="other">Outro</option></select></label>
        <Field name="productLanguage" label="Idioma do conteúdo" defaultValue={locale}/><Field name="targetAudience" label="Público-alvo"/>
      </div>
      <TextArea name="shortDescription" label="Descrição curta"/>
      <TextArea name="description" label="Descrição completa *" required rows={5}/>
      <Field name="keywords" label="Palavras-chave (separadas por vírgula)"/>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">{t.suggested}<input name="price" inputMode="decimal" className="mt-1 w-full rounded-xl border px-3 py-3" placeholder="49,90"/></label>
        <label className="text-sm font-semibold">Moeda<select name="currency" defaultValue={defaultCurrency} className="mt-1 w-full rounded-xl border bg-white px-3 py-3"><option>EUR</option><option>BRL</option><option>USD</option></select></label>
      </div>
      <p className="text-xs text-muted-foreground">{t.priceNote}</p>

      <h2 className="pt-3 font-serif text-2xl">{t.files}</h2>
      <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={e => setFiles(Array.from(e.target.files || []).slice(0, 12))} className="block w-full rounded-xl border p-3 text-sm"/>
      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG ou WEBP · até 25 MB por arquivo.</p>

      <label className="flex gap-3 text-sm"><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)} className="mt-1"/><span>{t.rights}</span></label>
      <label className="flex gap-3 text-sm"><input type="checkbox" checked={policy} onChange={e=>setPolicy(e.target.checked)} className="mt-1"/><span>{t.policy}</span></label>
      <button disabled={busy || mutation.isPending} className="w-full rounded-xl bg-[#d6ad63] px-5 py-4 font-black text-[#071426] disabled:opacity-60">{busy ? t.sending : t.submit}</button>
    </form>

    <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-serif text-2xl">{t.mine}</h2>
      {products.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground"><p>{t.empty}</p><p className="mt-2 font-bold text-foreground">{t.first}</p></div> : <div className="mt-4 grid gap-3">{products.map((p:any)=><article key={p.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{p.title}</h3><p className="text-xs text-muted-foreground">{p.category} · {p.product_type}</p></div><span className="rounded-full bg-[#f8f3e7] px-3 py-1 text-xs font-black">{STATUS[p.status] ?? p.status}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"><Stat label="Vendas" value={(p.gross_sales_cents||0)/100}/><Stat label="Comissão LDR" value={(p.ldr_commission_cents||0)/100}/><Stat label="Seu valor" value={(p.creator_due_cents||0)/100}/><Stat label="Percentual" value="85%"/></div>{p.admin_notes?<p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs">{p.admin_notes}</p>:null}</article>)}</div>}
    </section>
  </div>;
}

function Field(props:{name:string;label:string;type?:string;required?:boolean;defaultValue?:string}){return <label className="text-sm font-semibold">{props.label}<input {...props} className="mt-1 w-full rounded-xl border px-3 py-3"/></label>}
function TextArea(props:{name:string;label:string;required?:boolean;rows?:number}){return <label className="block text-sm font-semibold">{props.label}<textarea name={props.name} required={props.required} rows={props.rows??3} className="mt-1 w-full rounded-xl border px-3 py-3"/></label>}
function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-xl bg-muted/40 p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 font-black">{value}</p></div>}
