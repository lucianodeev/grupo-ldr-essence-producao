from pathlib import Path

root = Path('apps/painel-ldr/src')
target = 'https://www.lucianoempreendendor.com/'
old = 'https://www.lucianoempreendedor.com/'

for p in root.rglob('*.tsx'):
    txt = p.read_text(encoding='utf-8')
    if old in txt:
        p.write_text(txt.replace(old, target), encoding='utf-8')

css_path = root / 'styles.css'
css = css_path.read_text(encoding='utf-8')
marker = 'ldr-ebook-editorial-card-20260831'
if marker not in css:
    css += '''

/* ldr-ebook-editorial-card-20260831 */
a[href="https://www.lucianoempreendendor.com/"][class*="rounded-2xl"] {
  background: linear-gradient(145deg,#4b101d,#26080f) !important;
  color: #f7f2e8 !important;
  border-color: #c7a45a !important;
  box-shadow: 0 16px 34px rgba(43,10,17,.18);
}
a[href="https://www.lucianoempreendendor.com/"][class*="rounded-2xl"] h2,
a[href="https://www.lucianoempreendendor.com/"][class*="rounded-2xl"] h3,
a[href="https://www.lucianoempreendendor.com/"][class*="rounded-2xl"] p,
a[href="https://www.lucianoempreendendor.com/"][class*="rounded-2xl"] svg { color:#f7f2e8 !important; }
a[href="https://www.lucianoempreendendor.com/"][class*="rounded-2xl"]::after {
  content:"A CORAGEM DE COMEÇAR"; display:block; margin-top:.75rem; color:#d7b767;
  font-size:.68rem; font-weight:900; letter-spacing:.14em;
}
'''
    css_path.write_text(css, encoding='utf-8')

p = root / 'lib/organization-portal.server.ts'
txt = p.read_text(encoding='utf-8')
txt = txt.replace(
    'select("catalog_key,name,category,currency,amount_cents,package_sessions,active")',
    'select("catalog_key,name,category,currency,amount_cents,package_sessions,active,sort_order")'
)
old_line = 'services: (services ?? []).map((s: any) => ({ ...s, ...(serviceByKey.get(s.catalog_key) ?? {}) })).filter((s: any) => s.name),'
new_line = 'services: (services ?? []).map((s: any) => ({ ...s, ...(serviceByKey.get(s.catalog_key) ?? {}) })).filter((s: any) => s.name).sort((a: any, b: any) => { const priority = (x: any) => String(x.catalog_key).startsWith("psicanalise") ? 0 : String(x.catalog_key).startsWith("massagem_laboral") ? 1 : 2; return priority(a) - priority(b) || Number(a.sort_order ?? 9999) - Number(b.sort_order ?? 9999) || String(a.name).localeCompare(String(b.name)); }),'
if old_line in txt:
    txt = txt.replace(old_line, new_line)
p.write_text(txt, encoding='utf-8')

p = root / 'routes/_clientarea.cliente.index.tsx'
txt = p.read_text(encoding='utf-8')
needle = '<section><h2 className="mb-3 font-serif text-xl">Acessos rápidos</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{QUICK.map'
if needle in txt and 'ebook-external-ldr' not in txt:
    replacement = '<section><h2 className="mb-3 font-serif text-xl">Acessos rápidos</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><a data-card="ebook-external-ldr" href="https://www.lucianoempreendendor.com/" target="_blank" rel="noreferrer" className="rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md"><BookOpen className="h-6 w-6"/><h3 className="mt-3 font-bold">E-book e biblioteca</h3><p className="mt-1 text-sm">Acesse A Coragem de Começar e a plataforma para empreendedores.</p></a>{QUICK.map'
    txt = txt.replace(needle, replacement)
p.write_text(txt, encoding='utf-8')

p = root / 'routes/_clientarea.cliente.contratar.tsx'
txt = p.read_text(encoding='utf-8')
anchor = '    <PageHeader title={t("contract.title")} subtitle={copy.pageSubtitle} />\n'
if anchor in txt and 'priority-services-20260831' not in txt:
    block = '''    <section data-section="priority-services-20260831" className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border-2 border-primary bg-primary p-5 text-primary-foreground shadow-md"><p className="text-xs font-extrabold uppercase tracking-[.16em] opacity-80">1º destaque</p><h2 className="mt-2 font-serif text-2xl">Psicanálise</h2><p className="mt-2 text-sm opacity-90">Sessão individual e pacotes de 4, 8 e 12 sessões. Para empresas, pacotes por funcionário com créditos para acompanhamento.</p></div>
      <div className="rounded-2xl border border-secondary/60 bg-secondary/10 p-5"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">2º destaque</p><h2 className="mt-2 font-serif text-2xl">Massagem Laboral + Hora de Bem-Estar</h2><p className="mt-2 text-sm text-muted-foreground">Bem-estar corporativo com contratação organizada para equipes e empresas.</p></div>
    </section>
'''
    txt = txt.replace(anchor, anchor + block)
p.write_text(txt, encoding='utf-8')

p = root / 'routes/index.tsx'
txt = p.read_text(encoding='utf-8')
if 'data-card="ebook-home-ldr"' not in txt:
    anchor = '      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">'
    card = '      <a data-card="ebook-home-ldr" href="https://www.lucianoempreendendor.com/" target="_blank" rel="noreferrer" className="mt-4 block rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><p className="text-xs font-black uppercase tracking-[.16em]">PLATAFORMA PARA EMPREENDEDORES</p><h2 className="mt-2 font-serif text-2xl">E-book e biblioteca — A Coragem de Começar</h2><p className="mt-2 text-sm">Acesse o e-book, conteúdos e recursos da plataforma.</p></a>\n'
    txt = txt.replace(anchor, card + anchor)
p.write_text(txt, encoding='utf-8')

print('padronizacao concluida')
