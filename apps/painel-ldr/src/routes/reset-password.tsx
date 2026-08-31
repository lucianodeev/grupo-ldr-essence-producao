import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Definir nova senha — Sistema S8 | Grupo LDR Essence" },
      { name: "description", content: "Definição de nova senha para contas do Sistema S8." },
      { property: "og:title", content: "Definir nova senha — Sistema S8" },
      { property: "og:description", content: "Redefinição de senha de acesso profissional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

const COPY = {
  pt:{title:"Definir nova senha",openLink:"Abra esta página pelo link enviado por e-mail para redefinir sua senha.",newPassword:"Nova senha (mínimo 12 caracteres)",confirm:"Confirmar nova senha",wait:"Aguarde…",save:"Salvar nova senha",min:"A senha deve ter ao menos 12 caracteres.",mismatch:"As senhas não coincidem.",error:"Não foi possível atualizar a senha. Solicite um novo link.",done:"Senha atualizada."},
  en:{title:"Set a new password",openLink:"Open this page using the link sent by email to reset your password.",newPassword:"New password (minimum 12 characters)",confirm:"Confirm new password",wait:"Please wait…",save:"Save new password",min:"The password must contain at least 12 characters.",mismatch:"The passwords do not match.",error:"Could not update the password. Request a new link.",done:"Password updated."},
  fr:{title:"Définir un nouveau mot de passe",openLink:"Ouvrez cette page à partir du lien envoyé par e-mail pour réinitialiser votre mot de passe.",newPassword:"Nouveau mot de passe (12 caractères minimum)",confirm:"Confirmer le nouveau mot de passe",wait:"Veuillez patienter…",save:"Enregistrer le nouveau mot de passe",min:"Le mot de passe doit contenir au moins 12 caractères.",mismatch:"Les mots de passe ne correspondent pas.",error:"Impossible de mettre à jour le mot de passe. Demandez un nouveau lien.",done:"Mot de passe mis à jour."},
  es:{title:"Definir nueva contraseña",openLink:"Abre esta página desde el enlace enviado por correo para restablecer tu contraseña.",newPassword:"Nueva contraseña (mínimo 12 caracteres)",confirm:"Confirmar nueva contraseña",wait:"Espera…",save:"Guardar nueva contraseña",min:"La contraseña debe tener al menos 12 caracteres.",mismatch:"Las contraseñas no coinciden.",error:"No fue posible actualizar la contraseña. Solicita un nuevo enlace.",done:"Contraseña actualizada."},
} as const;

function ResetPassword() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const isRecovery = hash.includes("type=recovery");
    supabase.auth.getSession().then(({ data }) => { setReady(isRecovery || Boolean(data.session)); });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 12) { toast.error(copy.min); return; }
    if (password !== confirm) { toast.error(copy.mismatch); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(copy.error); return; }
    toast.success(copy.done);
    navigate({ to: "/painel-profissional" });
  }

  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-md px-4 py-10 sm:px-6"><section className="s8-card min-w-0"><h1 className="break-words font-serif text-2xl">{copy.title}</h1>{!ready ? <div className="s8-notice mt-4 break-words text-sm leading-6">{copy.openLink}</div> : <form className="mt-2" onSubmit={handleSubmit}><label className="s8-label" htmlFor="new-password">{copy.newPassword}</label><input id="new-password" type="password" autoComplete="new-password" className="s8-field" value={password} onChange={(e) => setPassword(e.target.value)} /><label className="s8-label" htmlFor="confirm-password">{copy.confirm}</label><input id="confirm-password" type="password" autoComplete="new-password" className="s8-field" value={confirm} onChange={(e) => setConfirm(e.target.value)} /><button type="submit" disabled={busy} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-center font-bold text-primary-foreground disabled:opacity-60">{busy ? copy.wait : copy.save}</button></form>}</section></main></div>;
}
