from pathlib import Path

p=Path('apps/painel-ldr/src/routes/_authenticated/admin.tsx')
s=p.read_text(encoding='utf-8')

if 'Rede Comercial / Vendedores' not in s:
    needle='''  { title: "2. Rede de Profissionais LDR", description: "Cadastros, aprovação, serviços, planos, financeiro, repasses e conformidade.", links: ['''
    block='''  { title: "2. Rede Comercial / Vendedores", description: "Candidatos, entrevistas, vendedores aprovados, vendas, comissões e repasses PIX/IBAN.", links: [\n    ["Central de vendedores", "/admin/vendedores"],\n  ]},\n  { title: "3. Rede de Profissionais LDR", description: "Cadastros, aprovação, serviços, planos, financeiro, repasses e conformidade.", links: ['''
    if needle not in s:
        raise SystemExit('sections anchor not found')
    s=s.replace(needle,block,1)
    s=s.replace('{ title: "3. Empresas e funcionários"','{ title: "4. Empresas e funcionários"',1)
    s=s.replace('{ title: "4. Financeiro e produtos"','{ title: "5. Financeiro e produtos"',1)

if '["Administrar vendedores"' not in s:
    needle='''const ownerActions = [\n  ["Revisar profissionais",'''
    repl='''const ownerActions = [\n  ["Administrar vendedores", "Revisar candidatos, acompanhar vendas e liberar comissões da Rede Comercial.", "/admin/vendedores"],\n  ["Revisar profissionais",'''
    if needle not in s:
        raise SystemExit('ownerActions anchor not found')
    s=s.replace(needle,repl,1)

if 'Rede Comercial</Link>' not in s:
    needle='''        <Link to="/admin/rede" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Rede de profissionais</Link>'''
    add='''        <Link to="/admin/vendedores" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Rede Comercial</Link>\n'''
    if needle not in s:
        raise SystemExit('hero links anchor not found')
    s=s.replace(needle,add+needle,1)

p.write_text(s,encoding='utf-8')
print('Unified master admin navigation patched')
