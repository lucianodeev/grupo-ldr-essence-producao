from pathlib import Path
import re

ROOT = Path("apps/painel-ldr/src")

def patch(path: str, replacements: list[tuple[str, str, str]]) -> None:
    p = ROOT / path
    s = p.read_text(encoding="utf-8")
    original = s
    for old, new, label in replacements:
        if new in s:
            continue
        if old not in s:
            raise SystemExit(f"anchor not found in {path}: {label}")
        s = s.replace(old, new, 1)
    if s != original:
        p.write_text(s, encoding="utf-8")

patch("components/academic-challenges-admin.tsx", [
    (
        'const save=useMutation({mutationFn:()=>saveFn({data:{...form,id:editingId}}),onSuccess:',
        'const save=useMutation({mutationFn:()=>saveFn({data:{...form,...(editingId?{id:editingId}:{})}}),onSuccess:',
        "omit undefined optional challenge id",
    ),
])

patch("components/academic-onboarding-v3.tsx", [
    (
        'base.includes(x)?base.filter(y=>y!==x):base.length<8?[...base,x]:base',
        'base.includes(x)?base.filter((y:string)=>y!==x):base.length<8?[...base,x]:base',
        "explicit onboarding filter parameter type",
    ),
])

p = ROOT / "components/academic-social-v3-feed.tsx"
s = p.read_text(encoding="utf-8")
original = s

old = ' const {data:editorial}=useQuery({queryKey:["academic-editorial-v3",country,mode],queryFn:()=>editorialFn({data:{limit:20,country:country||null,followingOnly:mode==="following"}})});'
new = ' const {data:editorialRaw}=useQuery({queryKey:["academic-editorial-v3",country,mode],queryFn:()=>editorialFn({data:{limit:20,country:country||null,followingOnly:mode==="following"}})});const editorial=editorialRaw as any;'
if old in s:
    s = s.replace(old, new, 1)
elif new not in s:
    raise SystemExit("anchor not found in academic-social-v3-feed.tsx: editorial query")

# TanStack Router requires the route search object even when no search params are used.
# Add it only to dynamic Academic Network links that currently have params but no search prop.
s = re.sub(
    r'(<Link\b(?:(?!search=)[^>])*?\bto="/cliente/rede-academica/(?:artigo|artigo-editorial|perfil|perfil-editorial)/\$[^"]+"(?:(?!search=)[^>])*?\bparams=\{\{[^}]+\}\})(\s+className=)',
    r'\1 search={{} as any}\2',
    s,
)

if s != original:
    p.write_text(s, encoding="utf-8")

print("Academic typecheck patch applied safely.")
