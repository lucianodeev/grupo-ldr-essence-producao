from pathlib import Path

root = Path(__file__).resolve().parents[1]
drawers = root / "apps/painel-ldr/src/components/academic-drawers.tsx"
shelf = root / "apps/painel-ldr/src/components/academy-subscription-course-shelf.tsx"

s = drawers.read_text()

imp = 'import { ACADEMY_SUBSCRIPTION_COURSES } from "@/lib/academy-subscription-courses.catalog";\n'
anchor = 'import { ACADEMY_FREE_COURSES } from "@/lib/academy-free-courses.catalog";\n'
if imp not in s:
    if anchor not in s:
        raise SystemExit("AcademicDrawers import anchor not found")
    s = s.replace(anchor, anchor + imp, 1)

old_loop = '''    for(const formation of PROFESSIONAL_FORMATIONS){
      const ft=pfText(formation,locale);
      const category=categoryFor(formation.slug,ft.name);
      result[category].push({icon:formation.icon,title:ft.name,meta:`${formation.hours}h · ${formation.modulesCount} ${locale==="pt"?"módulos":locale==="fr"?"modules":locale==="es"?"módulos":"modules"}`,href:formation.learnerPath,tone:formation.theme==="green"?"#047857":formation.theme==="wine"?"#7A3651":"#315F86",triggerText:ft.short});
    }
    return result;'''
new_loop = '''    for(const formation of PROFESSIONAL_FORMATIONS){
      const ft=pfText(formation,locale);
      const category=categoryFor(formation.slug,ft.name);
      result[category].push({icon:formation.icon,title:ft.name,meta:`${formation.hours}h · ${formation.modulesCount} ${locale==="pt"?"módulos":locale==="fr"?"modules":locale==="es"?"módulos":"modules"}`,href:formation.learnerPath,tone:formation.theme==="green"?"#047857":formation.theme==="wine"?"#7A3651":"#315F86",triggerText:ft.short});
    }
    const courseCategory=(category:string):CourseCategoryKey=>{
      if(category==="psicanalise")return "psycho";
      if(category==="marketing"||category==="gestao")return "business";
      if(category==="comportamento"||category==="educacao"||category==="direito")return "humanities";
      return "business";
    };
    const courseIcon=(category:string)=>category==="psicanalise"?"🧠":category==="marketing"?"📣":category==="gestao"?"📊":category==="educacao"?"📚":category==="direito"?"⚖️":"🌱";
    const courseTone=(category:string)=>category==="psicanalise"?"#5b2b86":category==="marketing"?"#985014":category==="gestao"?"#17645e":category==="direito"?"#6E102A":"#3D4778";
    const includedLabel=locale==="pt"?"Incluído na assinatura":locale==="fr"?"Inclus dans l’abonnement":locale==="es"?"Incluido en la suscripción":"Included in subscription";
    const courseLabel=locale==="pt"?"Curso Livre":locale==="fr"?"Cours libre":locale==="es"?"Curso libre":"Non-degree course";
    for(const course of ACADEMY_SUBSCRIPTION_COURSES){
      const category=courseCategory(course.category);
      result[category].push({icon:courseIcon(course.category),title:course.name[locale],meta:`60h · ${courseLabel} · ${includedLabel}`,href:`/cliente/cursos/assinatura/${course.slug}`,tone:courseTone(course.category),triggerText:course.name[locale]});
    }
    return result;'''
if old_loop in s:
    s = s.replace(old_loop, new_loop, 1)
elif 'for(const course of ACADEMY_SUBSCRIPTION_COURSES)' not in s:
    raise SystemExit("AcademicDrawers category loop anchor not found")

drawers.write_text(s)

q = shelf.read_text()
replacements = {
    'pt:{eyebrow:"NOVOS CURSOS · ASSINATURA"': 'pt:{eyebrow:"CURSOS · ASSINATURA"',
    'en:{eyebrow:"NEW COURSES · SUBSCRIPTION"': 'en:{eyebrow:"COURSES · SUBSCRIPTION"',
    'fr:{eyebrow:"NOUVEAUX COURS · ABONNEMENT"': 'fr:{eyebrow:"COURS · ABONNEMENT"',
    'es:{eyebrow:"NUEVOS CURSOS · SUSCRIPCIÓN"': 'es:{eyebrow:"CURSOS · SUSCRIPCIÓN"',
    'formation:"NOVA FORMAÇÃO · 600H"': 'formation:"FORMAÇÃO · 600H"',
    'formation:"NEW TRAINING · 600H"': 'formation:"TRAINING · 600H"',
    'formation:"NOUVELLE FORMATION · 600H"': 'formation:"FORMATION · 600H"',
    'formation:"NUEVA FORMACIÓN · 600H"': 'formation:"FORMACIÓN · 600H"',
}
for a,b in replacements.items():
    q = q.replace(a,b)

needle = 'export function AcademySubscriptionCourseShelf({locale,active=false,publicView=false}:Props){\n  const t=COPY[locale];'
replacement = 'export function AcademySubscriptionCourseShelf({locale,active=false,publicView=false}:Props){\n  if(!publicView)return null;\n  const t=COPY[locale];'
if needle in q:
    q = q.replace(needle,replacement,1)
elif 'if(!publicView)return null;' not in q:
    raise SystemExit("Shelf function anchor not found")

shelf.write_text(q)

# Idempotent patch: only the two Academy presentation components above may be changed.
# Revalidated from the current branch head before merge.
