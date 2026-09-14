from pathlib import Path

# Root feed: preserve all validated routing/tabs/profile/diary logic and swap only the feed renderer.
root=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
s=root.read_text()
anchor='import { useI18n } from "@/lib/i18n";'
imp='import { AcademicSocialV3Feed } from "@/components/academic-social-v3-feed";'
if imp not in s:
    if anchor not in s: raise SystemExit('root import anchor missing')
    s=s.replace(anchor,anchor+'\n'+imp,1)
start=s.find('function Feed(')
end=s.find('function ActionButton',start)
if start<0 or end<0: raise SystemExit('feed boundaries not found')
replacement='function Feed(props:any){return <AcademicSocialV3Feed {...props}/>}\n\n'
current=s[start:end]
if current != replacement:
    s=s[:start]+replacement+s[end:]
old_nav='flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[8px] font-black leading-none tracking-[-.02em]'
new_nav='flex min-h-[54px] min-w-0 overflow-hidden flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[7px] font-black leading-none tracking-[-.03em]'
if old_nav in s:
    s=s.replace(old_nav,new_nav)
if 'className="whitespace-nowrap"' in s:
    s=s.replace('className="whitespace-nowrap"', 'className="block max-w-full truncate whitespace-nowrap"')
root.write_text(s)

# Master Admin: add transparent editorial controls without replacing existing moderation/challenges.
admin=Path('apps/painel-ldr/src/routes/_authenticated/admin.rede-academica.tsx')
s=admin.read_text()
anchor='import { AcademicChallengesAdmin } from "@/components/academic-challenges-admin";'
imp='import { AcademicEditorialAdminV3 } from "@/components/academic-editorial-admin-v3";'
if imp not in s:
    if anchor not in s: raise SystemExit('admin import anchor missing')
    s=s.replace(anchor,anchor+'\n'+imp,1)
if '<AcademicEditorialAdminV3/>' not in s:
    anchor='    <AcademicChallengesAdmin/>'
    if anchor not in s: raise SystemExit('admin component anchor missing')
    s=s.replace(anchor,'    <AcademicEditorialAdminV3/>\n'+anchor,1)
admin.write_text(s)

# Chatbot: on the academic network keep only a compact floating button above bottom navigation.
chat=Path('apps/painel-ldr/src/components/academy-chatbot.tsx')
s=chat.read_text()
anchor='  const showAnnouncement = location.pathname === "/" || location.pathname === "/cliente/biblioteca";'
if 'const academicNetwork =' not in s:
    if anchor not in s: raise SystemExit('chat location anchor missing')
    s=s.replace(anchor,anchor+'\n  const academicNetwork = location.pathname.startsWith("/cliente/rede-academica");',1)
if '{!open && teaser && !academicNetwork && (' not in s:
    if '{!open && teaser && (' in s:
        s=s.replace('{!open && teaser && (','{!open && teaser && !academicNetwork && (',1)
    else:
        raise SystemExit('chat teaser anchor missing')
old='className="ml-auto flex min-h-14 items-center gap-2 rounded-full border border-[#fff0c2] bg-[#F4B942] px-4 py-3 text-sm font-black text-[#071426] shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#FFD36B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B942] focus-visible:ring-offset-2"'
new='className={`ml-auto flex items-center justify-center gap-2 rounded-full border border-[#fff0c2] bg-[#F4B942] text-sm font-black text-[#071426] shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#FFD36B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B942] focus-visible:ring-offset-2 ${academicNetwork ? "h-12 w-12 p-0 sm:h-14 sm:w-auto sm:px-4 sm:py-3" : "min-h-14 px-4 py-3"}`}'
if old in s:
    s=s.replace(old,new,1)
elif 'academicNetwork ? "h-12 w-12 p-0 sm:h-14 sm:w-auto sm:px-4 sm:py-3"' not in s:
    raise SystemExit('chat button class anchor missing')
chat.write_text(s)
