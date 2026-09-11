from pathlib import Path

p = Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s = p.read_text(encoding='utf-8')

old_button = 'className={`min-w-0 rounded-2xl bg-[#0b2341] px-2 py-4 text-center text-white shadow-sm transition ${activeLibraryCategory==="book"?"ring-2 ring-[#d6ad63]":""}`}'
new_button = 'className={`min-w-0 rounded-2xl bg-[#5b0824] px-2 py-4 text-center text-white shadow-sm transition ${activeLibraryCategory==="book"?"ring-2 ring-[#d6ad63]":""}`}'
old_icon = '<div className="rounded-xl bg-[#0b2341] p-3 text-white"><BookOpen className="h-5 w-5"/></div>'
new_icon = '<div className="rounded-xl bg-[#5b0824] p-3 text-white"><BookOpen className="h-5 w-5"/></div>'

if old_button not in s:
    raise SystemExit('book button color anchor not found')
if old_icon not in s:
    raise SystemExit('book icon color anchor not found')

s = s.replace(old_button, new_button, 1)
s = s.replace(old_icon, new_icon, 1)
p.write_text(s, encoding='utf-8')
