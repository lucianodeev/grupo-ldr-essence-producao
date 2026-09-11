from pathlib import Path

p = Path('apps/painel-ldr/src/components/digital-reader-v2.tsx')
s = p.read_text(encoding='utf-8')
old = 'livro_menino_mamao:{light:"bg-[#fff4e8] text-[#4b2612]",dark:"bg-[#21120b] text-[#fff3e6]",cardLight:"border-[#e4bd93] bg-white",cardDark:"border-[#754726] bg-[#301b0f]",accent:"#a64b12",soft:"#f6dfc7"}'
new = 'livro_menino_mamao:{light:"bg-[#fbf6f3] text-[#3f0d1d]",dark:"bg-[#2a0814] text-[#fff5f7]",cardLight:"border-[#d9b3bd] bg-[#fffafa]",cardDark:"border-[#7b2944] bg-[#3b0d1e]",accent:"#6f1632",soft:"#f0dbe2"}'
if old not in s:
    raise SystemExit('book reader theme anchor not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
