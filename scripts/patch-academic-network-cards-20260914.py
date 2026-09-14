from pathlib import Path

root=Path('apps/painel-ldr/src')

# Public storefront: one premium card, without reordering existing products.
p=root/'components/academy-university-home.tsx'
s=p.read_text(encoding='utf-8')
if 'href="/rede-academica"' not in s:
    anchor='  <section id="cursos"'
    if anchor not in s: raise SystemExit('Home cursos anchor not found')
    card='''  <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6"><a href="/rede-academica" className="group block overflow-hidden rounded-[24px] border border-[#d8cba9] bg-gradient-to-r from-[#071426] via-[#102a4a] to-[#193b62] p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap gap-2 text-[9px] font-black tracking-[.08em]"><span className="rounded-full bg-white/10 px-2.5 py-1">DIÁRIO GRÁTIS</span><span className="rounded-full bg-white/10 px-2.5 py-1">7 DIAS COMPLETOS</span><span className="rounded-full bg-[#e6c873] px-2.5 py-1 text-[#071426]">INCLUÍDO NA ASSINATURA</span></div><h2 className="mt-3 font-serif text-2xl sm:text-3xl">Rede Acadêmica LDR</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Estude. Escreva. Compartilhe. Conecte-se. Uma rede acadêmica com Diário privado, comunidades e troca de conhecimento.</p></div><span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-black text-[#071426]">CONHECER A REDE →</span></div></a></section>\n\n'''
    s=s.replace(anchor,card+anchor,1)
    p.write_text(s,encoding='utf-8')

# Student library: card lives beside the existing academic drawers; nothing is removed/reordered.
p=root/'routes/_clientarea.cliente.biblioteca.tsx'
s=p.read_text(encoding='utf-8')
if 'href="/cliente/rede-academica"' not in s:
    anchor='    <AcademicDrawers locale={locale}/>'
    if anchor not in s: raise SystemExit('Library AcademicDrawers anchor not found')
    card='''    <section className="mb-6"><a href="/cliente/rede-academica" className="group block rounded-[24px] border border-[#d8cba9] bg-gradient-to-r from-[#071426] via-[#102a4a] to-[#193b62] p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black tracking-[.16em] text-[#e7c979]">REDE ACADÊMICA</p><h2 className="mt-2 font-serif text-2xl">Seu diário, suas comunidades e pessoas que compartilham seus interesses.</h2><p className="mt-2 text-sm text-slate-200">Diário privado gratuito · 7 dias completos · comunidade incluída na assinatura.</p></div><span className="inline-flex shrink-0 rounded-xl bg-white px-4 py-3 text-xs font-black text-[#071426]">ENTRAR NA REDE →</span></div></a></section>\n\n'''
    s=s.replace(anchor,card+anchor,1)
    p.write_text(s,encoding='utf-8')

# Admin master: add one link in the existing finance/products group.
p=root/'routes/_authenticated/admin.tsx'
s=p.read_text(encoding='utf-8')
if '"/admin/rede-academica"' not in s:
    anchor='    ["Alunos e Matrículas", "/admin/alunos-matriculas"],\n'
    if anchor not in s: raise SystemExit('Admin students anchor not found')
    s=s.replace(anchor,anchor+'    ["Rede Acadêmica", "/admin/rede-academica"],\n',1)
    p.write_text(s,encoding='utf-8')

print('Academic network integration patch applied safely.')
