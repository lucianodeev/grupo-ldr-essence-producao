import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { humanRoomClient } from "@/lib/human-room-browser";
export const Route = createFileRoute("/human-room/login")({ component: Page });
function Page() {
  const [m, setM] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "recover" | "reset">("login");
  const rawNext = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
  const next = rawNext?.startsWith("/human-room/") && !rawNext.startsWith("//") ? rawNext : null;
  useEffect(() => {
    const s = humanRoomClient();
    const { data: { subscription } } = s.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    // The SSR client exchanges the PKCE callback before getUser resolves.
    if (new URLSearchParams(location.search).get("recovery") === "1") {
      s.auth.getUser().then(({ data, error }: any) => {
        if (data.user && !error) setMode("reset");
        else { setMode("recover"); setM("Abra o link recebido neste mesmo navegador. Se expirou, solicite outro abaixo."); }
      });
    }
    return () => subscription.unsubscribe();
  }, []);
  async function signInWithGoogle() {
    if (busy) return;
    setBusy(true); setM("");
    const s = humanRoomClient();
    try {
      const redirectTo = location.origin + "/human-room/login" + (next ? "?next=" + encodeURIComponent(next) : "");
      const { data, error } = await s.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } });
      if (error || !data.url) throw error || new Error("Não foi possível iniciar o acesso com Google.");
      location.assign(data.url);
    } catch (error: any) {
      setM(error?.message || "Não foi possível entrar com Google. Tente novamente.");
      setBusy(false);
    }
  }
  async function go(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setM("");
    const f = new FormData(e.currentTarget), email = String(f.get("email") || "").trim(), password = String(f.get("password") || ""), s = humanRoomClient();
    try {
      if (mode === "recover") {
        const { error } = await s.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/human-room/login?recovery=1" });
        if (error) throw error;
        setM("Se houver uma conta para este e-mail, você receberá um link para redefinir a senha. Confira também o spam e abra o link neste mesmo navegador."); return;
      }
      if (mode === "reset") {
        if (password !== String(f.get("confirm"))) { setM("As senhas precisam ser iguais."); return; }
        const { data: { user }, error: authError } = await s.auth.getUser();
        if (authError || !user) { setMode("recover"); setM("O link expirou. Solicite outro."); return; }
        const { error } = await s.auth.updateUser({ password });
        if (error) throw error;
        await s.auth.signOut(); history.replaceState(null, "", "/human-room/login");
        setMode("login"); setM("Senha atualizada. Entre com sua nova senha."); return;
      }
      if (mode === "signup") {
        const { data, error } = await s.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) { setM("Confira seu e-mail para concluir o cadastro. Se já possui conta, entre ou use Esqueci minha senha."); return; }
        location.href = "/human-room/perfil" + (next ? "?next=" + encodeURIComponent(next) : ""); return;
      }
      const { data, error } = await s.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: p, error: profileError } = await s.from("profiles").select("is_adult").eq("id", data.user.id).maybeSingle();
      if (profileError) throw profileError;
      location.href = p?.is_adult ? (next || "/human-room/salas") : ("/human-room/perfil" + (next ? "?next=" + encodeURIComponent(next) : ""));
    } catch (error: any) { setM(error?.message || "Não foi possível concluir. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#f7f5ef] p-5"><form key={mode} onSubmit={go} className="mx-auto mt-20 max-w-lg rounded-3xl border bg-white p-7"><a href="/human-room" className="font-black">HUMAN ROOM</a><h1 className="my-6 font-serif text-4xl font-bold">{mode === "login" ? "Entrar" : mode === "signup" ? "Criar acesso" : mode === "recover" ? "Recuperar senha" : "Definir nova senha"}</h1>
    {mode !== "reset" && <input className="mb-3 w-full rounded-xl border p-4" name="email" type="email" placeholder="E-mail" autoComplete="email" required />}
    {mode !== "recover" && <input className="mb-3 w-full rounded-xl border p-4" name="password" type="password" placeholder="Senha (mínimo 8 caracteres)" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />}
    {mode === "reset" && <input className="mb-3 w-full rounded-xl border p-4" name="confirm" type="password" placeholder="Confirme a nova senha" autoComplete="new-password" minLength={8} required />}
    <button disabled={busy} className="w-full rounded-full bg-[#121826] p-4 font-black text-white disabled:opacity-60">{busy ? "AGUARDE…" : mode === "login" ? "ENTRAR" : mode === "signup" ? "CRIAR ACESSO" : mode === "recover" ? "ENVIAR LINK DE RECUPERAÇÃO" : "SALVAR NOVA SENHA"}</button>
    {(mode === "login" || mode === "signup") && <><div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-gray-200"/><span className="text-xs font-bold text-gray-500">OU</span><div className="h-px flex-1 bg-gray-200"/></div><button type="button" disabled={busy} onClick={signInWithGoogle} className="w-full rounded-full border border-gray-300 bg-white p-4 font-black text-[#121826] disabled:opacity-60">CONTINUAR COM GOOGLE</button></>}
    <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setM(""); }} className="mt-4 w-full text-sm font-bold underline">{mode === "login" ? "CRIAR CONTA" : "JÁ TENHO CONTA"}</button>
    {(mode === "login" || mode === "signup") && <button type="button" onClick={() => { setMode("recover"); setM(""); }} className="mt-4 w-full text-sm font-bold underline">ESQUECI MINHA SENHA</button>}
    {m && <p role="status" className="mt-4 text-sm">{m}</p>}
  </form></main>;
}
