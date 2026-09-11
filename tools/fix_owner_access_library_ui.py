from pathlib import Path
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s=p.read_text(encoding='utf-8')
anchor='  const bookProgress=progress.find((x:any)=>x.product_key==="livro_menino_mamao");\n'
insert=anchor+'  const ownerFullAccess=(data.customer?.email??"").trim().toLowerCase()==="llucianouam@gmail.com";\n  const ebookEntitled=ownerFullAccess||Boolean(ebookProduct?.entitled);\n  const bookEntitled=ownerFullAccess||Boolean(bookProduct?.entitled);\n  const trainingEntitled=ownerFullAccess||Boolean(trainingOffer?.entitled);\n'
if anchor not in s: raise SystemExit('anchor missing')
s=s.replace(anchor,insert,1)
s=s.replace('ebookProduct.entitled?','ebookEntitled?',2)
s=s.replace('bookProduct.entitled?','bookEntitled?',2)
s=s.replace('trainingOffer?.entitled?','trainingEntitled?',2)
s=s.replace('>Treinamentos</p></button>','>Treinamento</p></button>',1)
s=s.replace('text-[9px] font-black sm:text-xs">Treinamento','text-[8px] font-black tracking-[-0.02em] sm:text-[11px]">Treinamento',1)
p.write_text(s,encoding='utf-8')
