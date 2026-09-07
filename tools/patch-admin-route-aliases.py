from pathlib import Path
import re

routes = Path('apps/painel-ldr/src/routes/_authenticated')

mapping = [
    ('painel-profissional.rede-profissionais.tsx','admin.profissionais.tsx','/_authenticated/admin/profissionais'),
    ('painel-profissional.rede-servicos.tsx','admin.profissionais-servicos.tsx','/_authenticated/admin/profissionais-servicos'),
    ('painel-profissional.rede-planos.tsx','admin.profissionais-planos.tsx','/_authenticated/admin/profissionais-planos'),
    ('painel-profissional.rede-profissionais-financeiro.tsx','admin.profissionais-financeiro.tsx','/_authenticated/admin/profissionais-financeiro'),
    ('painel-profissional.rede-profissionais-repasses.tsx','admin.profissionais-repasses.tsx','/_authenticated/admin/profissionais-repasses'),
    ('painel-profissional.rede-profissionais-conformidade.tsx','admin.profissionais-conformidade.tsx','/_authenticated/admin/profissionais-conformidade'),
    ('painel-profissional.rede-profissionais-conteudo.tsx','admin.profissionais-conteudo.tsx','/_authenticated/admin/profissionais-conteudo'),
    ('painel-profissional.equipe.tsx','admin.equipe.tsx','/_authenticated/admin/equipe'),
    ('painel-profissional.catalogo.tsx','admin.catalogo.tsx','/_authenticated/admin/catalogo'),
    ('painel-profissional.acessos.tsx','admin.acessos.tsx','/_authenticated/admin/acessos'),
    ('painel-profissional.notificacoes.tsx','admin.notificacoes.tsx','/_authenticated/admin/notificacoes'),
    ('painel-profissional.mentoria.tsx','admin.mentoria.tsx','/_authenticated/admin/mentoria'),
    ('painel-profissional.s8.tsx','admin.s8.tsx','/_authenticated/admin/s8'),
    ('painel-profissional.treinamentos.tsx','admin.treinamentos.tsx','/_authenticated/admin/treinamentos'),
]

for src_name, dst_name, route_path in mapping:
    src = routes / src_name
    dst = routes / dst_name
    if not src.exists():
        raise SystemExit(f'missing source route: {src_name}')
    text = src.read_text(encoding='utf-8')
    updated, count = re.subn(r'createFileRoute\("[^"]+"\)', f'createFileRoute("{route_path}")', text, count=1)
    if count != 1:
        raise SystemExit(f'route marker not found in {src_name}')
    dst.write_text(updated, encoding='utf-8')

replacements = {
    '/painel-profissional/rede-profissionais':'/admin/profissionais',
    '/painel-profissional/rede-servicos':'/admin/profissionais-servicos',
    '/painel-profissional/rede-planos':'/admin/profissionais-planos',
    '/painel-profissional/rede-profissionais-financeiro':'/admin/profissionais-financeiro',
    '/painel-profissional/rede-profissionais-repasses':'/admin/profissionais-repasses',
    '/painel-profissional/rede-profissionais-conformidade':'/admin/profissionais-conformidade',
    '/painel-profissional/rede-profissionais-conteudo':'/admin/profissionais-conteudo',
    '/painel-profissional/equipe':'/admin/equipe',
    '/painel-profissional/catalogo':'/admin/catalogo',
    '/painel-profissional/acessos':'/admin/acessos',
    '/painel-profissional/notificacoes':'/admin/notificacoes',
    '/painel-profissional/mentoria':'/admin/mentoria',
    '/painel-profissional/s8':'/admin/s8',
    '/painel-profissional/treinamentos':'/admin/treinamentos',
}

for filename in ['admin.tsx','admin.rede.tsx','admin.financeiro.tsx']:
    p = routes / filename
    s = p.read_text(encoding='utf-8')
    for old,new in replacements.items():
        s = s.replace(old,new)
    p.write_text(s,encoding='utf-8')

print(f'created {len(mapping)} admin aliases and normalized central links')
