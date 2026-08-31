from pathlib import Path
root=Path('apps/painel-ldr/src')

# Profissional: mesmo acesso editorial ao e-book, sem alterar funções operacionais.
p=root/'routes/_authenticated/painel-profissional.index.tsx'
t=p.read_text(encoding='utf-8')
if 'data-card="ebook-profissional-ldr"' not in t:
    t=t.replace('import { Link, createFileRoute } from "@tanstack/react-router";','import { Link, createFileRoute } from "@tanstack/react-router";\nimport { BookOpen } from "lucide-react";',1)
    anchor='      <PageHeader title={copy.title} subtitle={copy.subtitle} />\n'
    card='''      <a data-card="ebook-profissional-ldr" href="https://www.lucianoempreendendor.com/" target="_blank" rel="noreferrer" className="mb-4 block rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><BookOpen className="h-6 w-6"/><h2 className="mt-3 font-serif text-2xl">E-book e biblioteca — A Coragem de Começar</h2><p className="mt-2 text-sm">Acesse a plataforma editorial e os conteúdos para empreendedores.</p></a>\n'''
    if anchor in t:t=t.replace(anchor,anchor+card,1)
p.write_text(t,encoding='utf-8')

# Funcionário: benefícios de Psicanálise primeiro, Massagem Laboral em segundo.
p=root/'routes/_portal.funcionario.tsx'
t=p.read_text(encoding='utf-8')
old='(data.benefits as AnyRow[]).map(b=>'
new='[...(data.benefits as AnyRow[])].sort((a,b)=>{const p=(x:AnyRow)=>String(x.catalog_key).startsWith("psicanalise")?0:String(x.catalog_key).startsWith("massagem_laboral")?1:2;return p(a)-p(b);}).map(b=>'
if old in t:t=t.replace(old,new,1)
p.write_text(t,encoding='utf-8')

print('prioridades finais aplicadas')
