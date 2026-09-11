import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, logAuthEvent } from "@/lib/access.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Acesso profissional — Sistema S8 | Grupo LDR Essence" },{ name: "description", content: "Área de autenticação para profissionais autorizados do Sistema S8." },{ name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

const COPY = {
  pt:{title:"Acesso profissional",recover:"Recuperar senha",intro:"Entre com sua senha ou com sua conta Google autorizada.",email:"E-mail",password:"Senha",wait:"Aguarde…",send:"Enviar instruções",enter:"Entrar com senha",google:"Entrar com Google",or:"ou",back:"Voltar para o login",forgot:"Esqueci minha senha",noAccess:"Não possui acesso? Solicite ao superadministrador do Grupo LDR Essence.",home:"Voltar ao início",loginError:"Não foi possível entrar. Verifique suas credenciais.",googleError:"Não foi possível iniciar o acesso com Google.",recoverDone:"Se este e-mail estiver cadastrado, você receberá as instruções em instantes."},
  en:{title:"Professional access",recover:"Recover password",intro:"Sign in with your password or an authorized Google account.",email:"Email",password:"Password",wait:"Please wait…",send:"Send instructions",enter:"Sign in with password",google:"Sign in with Google",or:"or",back:"Back to sign in",forgot:"Forgot my password",noAccess:"No access yet? Ask a Grupo LDR Essence super administrator.",home:"Back to home",loginError:"Could not sign in. Check your credentials.",googleError:"Could not start Google sign-in.",recoverDone:"If this email is registered, password reset instructions will be sent shortly."},
  fr:{title:"Accès professionnel",recover:"Récupérer le mot de passe",intro:"Connectez-vous avec votre mot de passe ou un compte Google autorisé.",email:"E-mail",password:"Mot de passe",wait:"Veuillez patienter…",send:"Envoyer les instructions",enter:"Se connecter avec le mot de passe",google:"Se connecter avec Google",or:"ou",back:"Retour à la connexion",forgot:"Mot de passe oublié",noAccess:"Pas encore d’accès ? Demandez à un superadministrateur du Grupo LDR Essence.",home:"Retour à l’accueil",loginError:"Connexion impossible. Vérifiez vos identifiants.",googleError:"Impossible de démarrer la connexion Google.",recoverDone:"Si cet e-mail est enregistré, les instructions de réinitialisation seront envoyées dans quelques instants."},
  es:{title:"Acceso profesional",recover:"Recuperar contraseña",intro:"Entra con tu contraseña o con una cuenta de Google autorizada.",email:"Correo electrónico",password:"Contraseña",wait:"Espera…",send:"Enviar instrucciones",enter:"Entrar con contraseña",google:"Entrar con Google",or:"o",back:"Volver al inicio de sesión",forgot:"Olvidé mi contraseña",noAccess:"¿Aún no tienes acceso? Solicítalo a un superadministrador del Grupo LDR Essence.",home:"Volver al inicio",loginError:"No fue posible entrar. Verifica tus credenciales.",googleError:"No fue posible iniciar el acceso con Google.",recoverDone:"Si este correo está registrado, recibirás las instrucciones en unos instantes."},
} as const;

function LoginPage() {
  const { locale } = useI18n(); const copy = COPY[locale];
  const fetchAccess = useServerFn(getMyAccess); const logEvent = useServerFn(logAuthEvent);
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const [recovering,setRecovering]=useState(false);

  async function routeAfterAuth(){
    let target="/painel-profissional";
    try { const access=await fetchAccess({}); if(access.authorized&&access.role==="superadmin") target="/admin"; } catch {}
    try { await logEvent({data:{action:"auth.login"}}); } catch {}
    window.location.replace(target);
  }
  async function handleSignIn(event:React.FormEvent){event.preventDefault();setBusy(true);const {error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(error){setBusy(false);toast.error(copy.loginError);return;}await routeAfterAuth();}
  async function handleGoogle(){
    setBusy(true);
    const {data,error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${window.location.origin}/login`,skipBrowserRedirect:true}});
    if(error||!data.url){setBusy(false);toast.error(copy.googleError);return;}
    window.location.assign(data.url);
  }
  async function handleRecover(event:React.FormEvent){event.preventDefault();setBusy(true);await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:`${window.location.origin}/reset-password`});setBusy(false);toast.success(copy.recoverDone);}

  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6"><section className="s8-card min-w-0"><h1 className="break-words font-serif text-2xl">{recovering?copy.recover:copy.title}</h1><p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{copy.intro}</p><form className="mt-4" onSubmit={recovering?handleRecover:handleSignIn}><label className="s8-label" htmlFor="email">{copy.email}</label><input id="email" type="email" required autoComplete="email" className="s8-field" value={email} onChange={(e)=>setEmail(e.target.value)}/>{!recovering&&<><label className="s8-label" htmlFor="password">{copy.password}</label><input id="password" type="password" required autoComplete="current-password" className="s8-field" value={password} onChange={(e)=>setPassword(e.target.value)}/></>}<button type="submit" disabled={busy} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-center font-bold text-primary-foreground disabled:opacity-60">{busy?copy.wait:recovering?copy.send:copy.enter}</button></form>{!recovering&&<><div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-border"/><span className="text-xs text-muted-foreground">{copy.or}</span><div className="h-px flex-1 bg-border"/></div><button type="button" disabled={busy} onClick={handleGoogle} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-bold text-primary hover:bg-accent disabled:opacity-60">{copy.google}</button></>}<button type="button" className="mt-4 break-words text-left text-sm font-semibold text-primary underline" onClick={()=>setRecovering(v=>!v)}>{recovering?copy.back:copy.forgot}</button><p className="mt-6 break-words text-xs leading-5 text-muted-foreground">{copy.noAccess}{" "}<Link to="/" className="underline">{copy.home}</Link></p></section></main></div>;
}
