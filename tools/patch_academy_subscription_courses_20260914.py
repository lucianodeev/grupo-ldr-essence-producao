from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/"apps"/"painel-ldr"/"src"


def write_if_changed(path:Path, text:str):
    old=path.read_text()
    if old!=text:
        path.write_text(text)
        print(f"updated {path.relative_to(ROOT)}")
    else:
        print(f"unchanged {path.relative_to(ROOT)}")

# 1) Subscription backend: reuse the existing subscription state and Stripe checkout.
p=APP/"lib"/"library-subscription.server.ts"
s=p.read_text()
imp='import { ACADEMY_SUBSCRIPTION_COURSES } from "@/lib/academy-subscription-courses.catalog";\n'
if imp not in s:
    first_import_end=s.find("\n", s.find("import "))+1
    s=s[:first_import_end]+imp+s[first_import_end:]
if "const CORE_INCLUDED_PRODUCTS = [" not in s:
    s=s.replace("const INCLUDED_PRODUCTS = [", "const CORE_INCLUDED_PRODUCTS = [", 1)
marker="] as const;"
start=s.find("const CORE_INCLUDED_PRODUCTS = [")
end=s.find(marker,start)
if start<0 or end<0:
    raise SystemExit("Could not locate core subscription product list")
end+=len(marker)
extra='''\nconst INCLUDED_PRODUCTS: ReadonlyArray<readonly [string,string]> = [\n  ...CORE_INCLUDED_PRODUCTS,\n  ...ACADEMY_SUBSCRIPTION_COURSES.map((course)=>[course.productKey, course.name.pt] as const),\n  ["formacao_gestao_projetos_600h", "Formação em Gestão de Projetos"],\n];'''
if "formacao_gestao_projetos_600h" not in s[end:end+700]:
    s=s[:end]+extra+s[end:]
write_if_changed(p,s)

# 2) Client library: add the new shelf without replacing existing drawers/cards.
p=APP/"routes"/"_clientarea.cliente.biblioteca.tsx"
s=p.read_text()
imp='import { AcademySubscriptionCourseShelf } from "@/components/academy-subscription-course-shelf";\n'
anchor='import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";\n'
if imp not in s:
    if anchor not in s: raise SystemExit("Library import anchor not found")
    s=s.replace(anchor,anchor+imp,1)
# Preserve current hardcoded inclusion logic and add only the new formation slug.
m=re.search(r'const includedProfessionalSlugs=new Set\(\[(.*?)\]\);',s,re.S)
if m and '"gestao-projetos-600h"' not in m.group(1):
    replacement=m.group(0)[:-3]+',"gestao-projetos-600h"]);'
    s=s[:m.start()]+replacement+s[m.end():]
# Add shelf just after the existing library hero.
if '<AcademySubscriptionCourseShelf locale={locale}' not in s:
    hero=s.find('return <div className="min-w-0 space-y-6 pb-8">')
    if hero<0: raise SystemExit("Library hero start not found")
    section_end=s.find('</section>',hero)
    if section_end<0: raise SystemExit("Library hero end not found")
    section_end+=len('</section>')
    shelf='\n    <AcademySubscriptionCourseShelf locale={locale} active={owner||Boolean(subscriptionData?.active)} />'
    s=s[:section_end]+shelf+s[section_end:]
write_if_changed(p,s)

# 3) Public sales page: surface the same collection, but keep access behind subscription/login.
p=APP/"components"/"library-sales-home.tsx"
s=p.read_text()
imp='import { AcademySubscriptionCourseShelf } from "@/components/academy-subscription-course-shelf";\n'
anchor='import { PSYCHOANALYSIS_EBOOKS } from "@/lib/psychoanalysis-ebooks.catalog";\n'
if imp not in s:
    if anchor not in s: raise SystemExit("Sales import anchor not found")
    s=s.replace(anchor,anchor+imp,1)
if '<AcademySubscriptionCourseShelf locale={locale} publicView />' not in s:
    hero=s.find('<section id="top"')
    if hero<0: raise SystemExit("Sales hero start not found")
    section_end=s.find('</section>',hero)
    if section_end<0: raise SystemExit("Sales hero end not found")
    section_end+=len('</section>')
    shelf='\n\n    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><AcademySubscriptionCourseShelf locale={locale} publicView /></section>'
    s=s[:section_end]+shelf+s[section_end:]
write_if_changed(p,s)

print("academy subscription course integration patch complete")
