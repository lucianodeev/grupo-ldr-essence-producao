from pathlib import Path

access=Path('apps/painel-ldr/src/routes/api/seller-purchase-access.ts')
s=access.read_text(encoding='utf-8')
old='redirectTo: `${origin}/cliente/definir-senha`,'
new='redirectTo: `${origin}/cliente/definir-senha?next=${encodeURIComponent(target)}`,'
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('access redirect anchor not found')
access.write_text(s,encoding='utf-8')

pw=Path('apps/painel-ldr/src/routes/cliente.definir-senha.tsx')
s=pw.read_text(encoding='utf-8')
anchor='function SetPasswordPage() {'
helper='''function safePurchaseTarget(value: string | null) {\n  const allowed = new Set([\n    "/cliente", "/cliente/biblioteca", "/cliente/treinamentos", "/cliente/mentoria",\n    "/empresa", "/funcionario", "/painel-profissional",\n  ]);\n  return value && allowed.has(value) ? value : "/cliente";\n}\n\n'''
if 'function safePurchaseTarget' not in s:
    if anchor not in s: raise SystemExit('password component anchor not found')
    s=s.replace(anchor,helper+anchor,1)
old_nav='navigate({ to: "/cliente", replace: true });'
new_nav='window.location.replace(safePurchaseTarget(new URLSearchParams(window.location.search).get("next")));'
if old_nav in s:
    s=s.replace(old_nav,new_nav,1)
elif new_nav not in s:
    raise SystemExit('password navigation anchor not found')
pw.write_text(s,encoding='utf-8')

activate=Path('apps/painel-ldr/src/routes/cliente.ativar.tsx')
s=activate.read_text(encoding='utf-8')
s=s.replace('import { useState } from "react";','import { useEffect, useState } from "react";',1)
state='  const [sent, setSent] = useState(false);\n'
effect='''  const [sent, setSent] = useState(false);\n\n  useEffect(() => {\n    const value = new URLSearchParams(window.location.search).get("email");\n    if (value && value.includes("@")) setEmail(value.trim().toLowerCase());\n  }, []);\n'''
if 'new URLSearchParams(window.location.search).get("email")' not in s:
    if state not in s: raise SystemExit('activation state anchor not found')
    s=s.replace(state,effect,1)
activate.write_text(s,encoding='utf-8')
print('seller purchase access redirects patched')
