from pathlib import Path
p=Path('apps/painel-ldr/src/components/psychoanalysis-training-page.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('Sim. O acesso vitalício refere-se às conteúdos digitais, textos, materiais e recursos disponibilizados.','Sim. O acesso vitalício refere-se aos conteúdos digitais, textos, materiais e recursos disponibilizados.')
s=s.replace('A referência comercial é a mesma nos dois meios de pagamento: Brasil, R$ 299,99; Europa, € 49,90 — pagamento único.','Brasil: R$ 299,99. Europa: € 49,90. Em ambos os casos, o pagamento é único pelo Stripe.')
assert 'dois meios de pagamento' not in s
assert 'às conteúdos' not in s
p.write_text(s,encoding='utf-8')
print('FAQ cleanup applied')