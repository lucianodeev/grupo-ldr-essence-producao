from pathlib import Path

ROOT=Path('apps/painel-ldr/src')

def replace(path, pairs):
    p=ROOT/path
    s=p.read_text(encoding='utf-8')
    original=s
    for old,new in pairs:
        s=s.replace(old,new)
    if s!=original:
        p.write_text(s,encoding='utf-8')
        print('updated', path)
    else:
        print('no change', path)

# Unified access chooser: company/professional stay unchanged; employee + individual access become “Minha Área”.
replace(Path('routes/acesso.tsx'),[
    ('employee:"Funcionário"','employee:"Minha Área"'),('client:"Cliente individual"','client:"Minha Área"'),
    ('employee:"Employee"','employee:"My Area"'),('client:"Individual client"','client:"My Area"'),
    ('employee:"Collaborateur"','employee:"Mon espace"'),('client:"Client individuel"','client:"Mon espace"'),
    ('employee:"Empleado"','employee:"Mi Área"'),('client:"Cliente individual"','client:"Mi Área"'),
])

# Individual/patient/student login and shell.
replace(Path('routes/cliente.login.tsx'),[
    ('Área do Cliente — Grupo LDR Essence','Minha Área — Grupo LDR Essence'),
    ('Acesse sua área de cliente da Grupo LDR Essence para acompanhar pedidos, mentoria, sessões e entregas.','Acesse sua área no Grupo LDR Essence para acompanhar biblioteca, formações, agenda, atendimentos, pedidos e serviços.'),
    ('title="Área do Cliente"','title="Minha Área"'),
    ('subtitle="Entre com sua conta Google para acompanhar pedidos, mentorias e entregas."','subtitle="Entre com sua conta Google para acessar biblioteca, formações, agenda, atendimentos, pedidos e serviços."'),
    ('<p className="text-sm opacity-85">Área do Cliente</p>','<p className="text-sm opacity-85">Minha Área</p>'),
])
replace(Path('routes/_clientarea.cliente.tsx'),[
    ('<p className="text-xs opacity-80">Área do Cliente</p>','<p className="text-xs opacity-80">Minha Área</p>'),
    ('aria-label="Navegação da área do cliente"','aria-label="Navegação da Minha Área"'),
])
replace(Path('routes/cliente.ativar.tsx'),[
    ('Primeiro acesso — Área do Cliente | Grupo LDR Essence','Primeiro acesso — Minha Área | Grupo LDR Essence'),
    ('área de cliente','Minha Área'),('Área do Cliente','Minha Área'),
])
replace(Path('routes/cliente.definir-senha.tsx'),[
    ('Definir senha — Área do Cliente | Grupo LDR Essence','Definir senha — Minha Área | Grupo LDR Essence'),
    ('Definir senha — Área do Cliente','Definir senha — Minha Área'),
    ('área de cliente','Minha Área'),('Área do Cliente','Minha Área'),
])
replace(Path('routes/_clientarea.cliente.contratar.tsx'),[
    ('sua Área do Cliente','sua Minha Área'),
    ('your Client Area','your My Area'),
    ('votre Espace Client','votre espace personnel'),
    ('tu Área de Cliente','tu Mi Área'),
])

# Employee portal: visible product name becomes Minha Área; benefit wording remains employee-specific.
replace(Path('routes/funcionario.login.tsx'),[
    ('Área do Funcionário — Grupo LDR Essence','Minha Área — Grupo LDR Essence'),
    ('title: "Área do Funcionário"','title: "Minha Área"'),
    ('title: "Employee Area"','title: "My Area"'),
    ('title: "Espace Collaborateur"','title: "Mon espace"'),
    ('title: "Área del Empleado"','title: "Mi Área"'),
])
replace(Path('routes/_portal.funcionario.tsx'),[
    ('title:"Área do Funcionário"','title:"Minha Área"'),
    ('title:"Employee Area"','title:"My Area"'),
    ('title:"Espace Collaborateur"','title:"Mon espace"'),
    ('title:"Área del Empleado"','title:"Mi Área"'),
])

# Purchase-access handoff: only client/employee labels change. Company and professional labels stay intact.
replace(Path('routes/acesso-compra.tsx'),[
    ('if (kind === "employee") return "Área do Funcionário";','if (kind === "employee") return "Minha Área";'),
    ('return "Área do Cliente";','return "Minha Área";'),
])

# Professional panel link pointing to the individual area.
replace(Path('components/site-header.tsx'),[
    ('client: "Área do cliente"','client: "Minha Área"'),
    ('client: "Client area"','client: "My Area"'),
    ('client: "Espace client"','client: "Mon espace"'),
    ('client: "Área del cliente"','client: "Mi Área"'),
])

print('label rename complete')
