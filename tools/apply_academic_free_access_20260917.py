from pathlib import Path
import re

ROOT=Path('apps/painel-ldr/src')

def replace_required(path: Path, old: str, new: str, label: str):
    s=path.read_text()
    if old not in s:
        raise SystemExit(f'missing anchor: {label}')
    path.write_text(s.replace(old,new))

server=ROOT/'lib/academic-network.server.ts'
s=server.read_text()
s=s.replace('const TRIAL_DAYS = 7;\n','')
old='''async function accessFor(userId:string):Promise<Access>{\n  const [admin,sub]=await Promise.all([isAdmin(userId),subscriptionActive(userId)]);\n  let {data:trial}=await db.from("academic_access_trials").select("started_at,expires_at,status").eq("user_id",userId).maybeSingle();\n  if(!trial){\n    const started=new Date(); const expires=new Date(started.getTime()+TRIAL_DAYS*86400000);\n    const {data}=await db.from("academic_access_trials").insert({user_id:userId,started_at:started.toISOString(),expires_at:expires.toISOString(),status:"active"}).select("started_at,expires_at,status").single();\n    trial=data;\n  }\n  const trialActive=trial?.status==="active" && new Date(trial.expires_at).getTime()>Date.now();\n  if(trial?.status==="active"&&!trialActive) await db.from("academic_access_trials").update({status:"expired"}).eq("user_id",userId);\n  return { premium:admin||sub||trialActive, trialActive, trialEndsAt:trial?.expires_at??null, subscriptionActive:sub, isAdmin:admin };\n}\n\nasync function requirePremium(userId:string){ const access=await accessFor(userId); if(!access.premium)fail("Este recurso faz parte da assinatura da LDR Essence Academy."); return access; }\n'''
new='''async function accessFor(userId:string):Promise<Access>{\n  // The Academic Network is free for every authenticated user.\n  // subscriptionActive remains factual and is never used as a social-network entitlement.\n  const [admin,sub]=await Promise.all([isAdmin(userId),subscriptionActive(userId)]);\n  return { premium:true, trialActive:false, trialEndsAt:null, subscriptionActive:sub, isAdmin:admin };\n}\n'''
if old not in s: raise SystemExit('missing anchor: accessFor trial gate')
s=s.replace(old,new)
s=s.replace('await requirePremium(userId); ','')
s=s.replace('const pageSize=access.premium?20:8;','const pageSize=20;')
if 'requirePremium(userId)' in s: raise SystemExit('requirePremium call remains in academic network server')
if 'academic_access_trials' in s: raise SystemExit('academic_access_trials gate remains in academic network server')
server.write_text(s)

route=ROOT/'routes/_clientarea.cliente.rede-academica.tsx'
s=route.read_text()
repls={
 'trial:"7 DIAS COMPLETOS",active:"ASSINATURA ATIVA"':'trial:"REDE ACADÊMICA GRATUITA",active:"ACESSO GRATUITO"',
 'freeTitle:"Você está no acesso gratuito.",freeText:"Leia uma amostra da rede e mantenha seu Diário. Publicar, comentar, salvar e participar das comunidades faz parte da assinatura.",subscription:"Ver assinatura"':'freeTitle:"Rede Acadêmica gratuita.",freeText:"Crie sua conta gratuitamente e participe. Publique, comente, salve e participe das comunidades.",subscription:"Acesso gratuito"',
 'premiumPh:"Assine para publicar na comunidade."':'premiumPh:"Compartilhe com a comunidade."',
 'trial:"7 FULL DAYS",active:"ACTIVE SUBSCRIPTION"':'trial:"FREE ACADEMIC NETWORK",active:"FREE ACCESS"',
 'freeTitle:"You are on free access.",freeText:"Read a sample of the network and keep your Journal. Posting, commenting, saving and joining communities are part of the subscription.",subscription:"View subscription"':'freeTitle:"Free Academic Network.",freeText:"Create your free account and join the community. Post, comment, save and join communities.",subscription:"Free access"',
 'premiumPh:"Subscribe to post in the community."':'premiumPh:"Share with the community."',
 'trial:"7 JOURS COMPLETS",active:"ABONNEMENT ACTIF"':'trial:"RÉSEAU ACADÉMIQUE GRATUIT",active:"ACCÈS GRATUIT"',
 'freeTitle:"Vous êtes en accès gratuit.",freeText:"Consultez un aperçu du réseau et gardez votre Journal. Publier, commenter, enregistrer et rejoindre les communautés fait partie de l’abonnement.",subscription:"Voir l’abonnement"':'freeTitle:"Réseau Académique gratuit.",freeText:"Créez votre compte gratuitement et rejoignez la communauté. Publiez, commentez, enregistrez et participez aux communautés.",subscription:"Accès gratuit"',
 'premiumPh:"Abonnez-vous pour publier dans la communauté."':'premiumPh:"Partagez avec la communauté."',
 'trial:"7 DÍAS COMPLETOS",active:"SUSCRIPCIÓN ACTIVA"':'trial:"RED ACADÉMICA GRATUITA",active:"ACCESO GRATUITO"',
 'freeTitle:"Estás en el acceso gratuito.",freeText:"Lee una muestra de la red y conserva tu Diario. Publicar, comentar, guardar y participar en comunidades forma parte de la suscripción.",subscription:"Ver suscripción"':'freeTitle:"Red Académica gratuita.",freeText:"Crea tu cuenta gratis y participa en la comunidad. Publica, comenta, guarda y participa en comunidades.",subscription:"Acceso gratuito"',
 'premiumPh:"Suscríbete para publicar en la comunidad."':'premiumPh:"Comparte con la comunidad."'
}
for a,b in repls.items():
    if a not in s: raise SystemExit('missing network copy anchor: '+a[:45])
    s=s.replace(a,b)
route.write_text(s)

landing=ROOT/'routes/rede-academica.tsx'
s=landing.read_text()
s=s.replace('Rede acadêmica com diário privado, comunidades, debates, networking e 7 dias de experiência completa.','Rede social acadêmica gratuita com diário privado, comunidades, debates e networking.')
s=s.replace('>COMEÇAR GRATUITAMENTE</Link><Link to="/cliente/biblioteca" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white">FAZER PARTE DA COMUNIDADE</Link>','>CRIAR CONTA GRÁTIS</Link><Link to="/cliente/rede-academica" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white">ENTRAR NA REDE</Link>')
s=s.replace('>DIÁRIO GRÁTIS</span><span className="rounded-full bg-white/10 px-3 py-1.5">7 DIAS COMPLETOS</span><span className="rounded-full bg-white/10 px-3 py-1.5">INCLUÍDO NA ASSINATURA</span>','>REDE ACADÊMICA GRATUITA</span><span className="rounded-full bg-white/10 px-3 py-1.5">CONTA GRÁTIS</span><span className="rounded-full bg-white/10 px-3 py-1.5">SEM CARTÃO</span>')
s=s.replace('COMECE SEM PRESSA</p><h2 className="mt-3 font-serif text-3xl">Seu Diário continua gratuito.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Ao entrar pela primeira vez, você recebe 7 dias da experiência completa. Depois, o Diário permanece gratuito e os recursos completos da Rede continuam incluídos na assinatura da Academy.','PARTICIPE GRATUITAMENTE</p><h2 className="mt-3 font-serif text-3xl">A Rede Acadêmica é gratuita.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Crie sua conta gratuitamente e participe. Publique, compartilhe conhecimento, participe de discussões e conecte-se com a comunidade acadêmica.')
landing.write_text(s)

shell=ROOT/'routes/_clientarea.cliente.tsx'
s=shell.read_text()
for a,b in {
 'academicTitle:"Conecte-se. Compartilhe. Aprenda."':'academicTitle:"Rede Acadêmica Gratuita"',
 'academicButton:"ACESSAR REDE ACADÊMICA"':'academicButton:"ENTRAR NA REDE"',
 'academicTitle:"Connect. Share. Learn."':'academicTitle:"Free Academic Network"',
 'academicButton:"ACCESS ACADEMIC NETWORK"':'academicButton:"ENTER THE NETWORK"',
 'academicTitle:"Connectez-vous. Partagez. Apprenez."':'academicTitle:"Réseau Académique Gratuit"',
 'academicButton:"ACCÉDER AU RÉSEAU ACADÉMIQUE"':'academicButton:"ENTRER DANS LE RÉSEAU"',
 'academicTitle:"Conecta. Comparte. Aprende."':'academicTitle:"Red Académica Gratuita"',
 'academicButton:"ACCEDER A LA RED ACADÉMICA"':'academicButton:"ENTRAR EN LA RED"'
}.items():
    if a not in s: raise SystemExit('missing shell anchor: '+a)
    s=s.replace(a,b)
shell.write_text(s)

print('Academic Network free-access patch applied safely.')
# validation trigger 2026-09-17
