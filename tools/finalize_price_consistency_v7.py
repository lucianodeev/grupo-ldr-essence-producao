from pathlib import Path
import re
root=Path('apps/painel-ldr/src')

def rw(rel,fn):
 p=root/rel; s=p.read_text(encoding='utf-8'); n=fn(s); p.write_text(n,encoding='utf-8')

# Internal psychoanalysis locked screen prices.
rw('routes/_clientarea.cliente.treinamentos.psicanalise.tsx',lambda s:s.replace('Brasil · R$ 372,36 · pagamento único','Brasil · R$ 299,99 · pagamento único').replace('Europa · € 65,34','Europa · € 49,90'))

# Do Mamão: keep exactly requested individual one-time price even after launch counter expires.
def training(s):
 s=s.replace('const PRICE_BRL = 59_999;','const PRICE_BRL = 29_999;')
 s=s.replace('const PRICE_EUR = 10_056;','const PRICE_EUR = 4_990;')
 return s
rw('lib/training-commerce.server.ts',training)

# Training public sales: remove crossed higher price / keep same final price in all locales.
def launch(s):
 replacements={
 'normalBR:"R$ 599,99"':'normalBR:"R$ 299,99"','normalEU:"€ 100,56"':'normalEU:"€ 49,90"',
 'normalBR:"R$ 599.99"':'normalBR:"R$ 299.99"','normalEU:"€100.56"':'normalEU:"€49.90"',
 'normalBR:"R$ 599,99"':'normalBR:"R$ 299,99"','normalEU:"100,56 €"':'normalEU:"49,90 €"',
 }
 for a,b in replacements.items(): s=s.replace(a,b)
 # hide redundant normal crossed-price block since normal == current value
 s=s.replace('<p className="text-xs font-black uppercase tracking-[.15em] text-[#efd18e]">{c.normal}</p><div className="mt-2 flex gap-4 text-sm opacity-70"><span className="line-through">{c.normalBR}</span><span className="line-through">{c.normalEU}</span></div><p className="mt-5 text-xs font-black uppercase tracking-[.15em] text-[#efd18e]">{c.launch}</p>','<p className="text-xs font-black uppercase tracking-[.15em] text-[#efd18e]">Pagamento único</p>')
 return s
rw('components/training-launch-page-v2.tsx',launch)

# Library fallback/regular training price consistency; no crossed higher price.
def library(s):
 s=s.replace('"R$ 599,99":"€ 100,56"','"R$ 299,99":"€ 49,90"')
 s=s.replace('R$ 599,99','R$ 299,99').replace('€ 100,56','€ 49,90')
 return s
rw('routes/_clientarea.cliente.biblioteca.tsx',library)

# Assertions.
assert 'R$ 372,36' not in (root/'routes/_clientarea.cliente.treinamentos.psicanalise.tsx').read_text(encoding='utf-8')
assert '€ 65,34' not in (root/'routes/_clientarea.cliente.treinamentos.psicanalise.tsx').read_text(encoding='utf-8')
assert 'const PRICE_BRL = 29_999;' in (root/'lib/training-commerce.server.ts').read_text(encoding='utf-8')
assert 'const PRICE_EUR = 4_990;' in (root/'lib/training-commerce.server.ts').read_text(encoding='utf-8')
print('price consistency v7 applied')