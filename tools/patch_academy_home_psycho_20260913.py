# exact one-line production-safe patch
from pathlib import Path
p=Path('apps/painel-ldr/src/components/academy-university-home.tsx')
s=p.read_text(encoding='utf-8')
old='{id:"psy",title:"Formação Online em Psicanálise",desc:"Teoria, prática clínica, leituras orientadas e encontros ao vivo.",meta:"1.200h · 220 aulas",price:"R$ 299,99 · € 49,90",href:"/formacao-psicanalise",kind:"psicanalise",icon:"🧠",accent:"#5b2b86"}'
new='{id:"psy",title:"Formação em Psicanálise · Autismo + Atuação Internacional",desc:"Psicanálise, autismo, neurodiversidade, atuação internacional, projetos e avaliações, com 6 encontros ao vivo.",meta:"1.200h · 15 módulos · 240 unidades",price:"R$ 299,99 · € 49,90",href:"/formacao-psicanalise",kind:"psicanalise",icon:"🧠",accent:"#5b2b86"}'
assert s.count(old)==1, f'expected exactly one stale psycho card, found {s.count(old)}'
p.write_text(s.replace(old,new),encoding='utf-8')
print('patched exactly one Home psychoanalysis card')
