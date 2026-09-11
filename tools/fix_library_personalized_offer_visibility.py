from pathlib import Path

p = Path('apps/painel-ldr/src/routes/_clientarea.cliente.biblioteca.tsx')
s = p.read_text(encoding='utf-8')

anchor = '  const trainingEntitled=ownerFullAccess||Boolean(trainingOffer?.entitled);\n'
insert = anchor + '''  const ownedProductCount=[ebookEntitled,bookEntitled,trainingEntitled].filter(Boolean).length;\n  const noneOwned=ownedProductCount===0;\n  const allOwned=ownedProductCount===3;\n  const someOwned=ownedProductCount>0&&!allOwned;\n  const missingProducts=[\n    !ebookEntitled?(locale==="pt"?"eBook A Coragem de Começar":locale==="fr"?"eBook Le Courage de Commencer":locale==="es"?"eBook El Valor de Empezar":"eBook The Courage to Begin"):null,\n    !bookEntitled?(locale==="pt"?"Livro O Menino que Vendia Mamão":locale==="fr"?"Livre Le Garçon qui Vendait des Papayes":locale==="es"?"Libro El Niño que Vendía Papaya":"Book The Boy Who Sold Papaya"):null,\n    !trainingEntitled?(locale==="pt"?"Treinamento Do Mamão ao Negócio":locale==="fr"?"Formation Do Mamão ao Negócio":locale==="es"?"Formación Do Mamão ao Negócio":"Training Do Mamão ao Negócio"):null,\n  ].filter(Boolean) as string[];\n'''
if anchor not in s:
    raise SystemExit('entitlement anchor not found')
s = s.replace(anchor, insert, 1)

combo_marker = '    <section className="overflow-hidden rounded-[28px] border border-[#d7ad54]/70 bg-gradient-to-br from-[#35101e] to-[#5b0824] p-5 text-white shadow-xl sm:p-7">'
comments_marker = '    <section className="rounded-[24px] border border-border/70 bg-background p-5 shadow-sm sm:p-6"><h2 className="flex items-center gap-2 font-serif text-2xl"><MessageCircle'
start = s.find(combo_marker)
end = s.find(comments_marker, start)
if start < 0 or end < 0:
    raise SystemExit('commercial section markers not found')
existing_combo = s[start:end].rstrip()

partial = '''    {noneOwned?(<>\n__EXISTING_COMBO__\n    </>):someOwned?(\n      <section className="rounded-[28px] border border-[#d7ad54]/60 bg-gradient-to-br from-[#fffaf0] to-background p-5 shadow-sm sm:p-6">\n        <div className="flex flex-wrap items-center gap-2">\n          <span className="rounded-full bg-[#d7ad54] px-3 py-1 text-xs font-black text-[#42111d]">{locale==="pt"?"COMPLETE SUA BIBLIOTECA":locale==="fr"?"COMPLÉTEZ VOTRE BIBLIOTHÈQUE":locale==="es"?"COMPLETA TU BIBLIOTECA":"COMPLETE YOUR LIBRARY"}</span>\n          <span className="text-xs font-bold text-muted-foreground">{ownedProductCount}/3 {locale==="pt"?"já liberados":locale==="fr"?"déjà disponibles":locale==="es"?"ya disponibles":"already unlocked"}</span>\n        </div>\n        <h2 className="mt-4 font-serif text-2xl font-semibold">{locale==="pt"?"Falta pouco para completar seus conteúdos":locale==="fr"?"Il vous reste peu pour compléter vos contenus":locale==="es"?"Falta poco para completar tus contenidos":"You're close to completing your content library"}</h2>\n        <p className="mt-2 text-sm leading-6 text-muted-foreground">{locale==="pt"?"Você não será cobrado novamente pelo que já possui. Compre somente o que falta pelos cards acima.":locale==="fr"?"Vous ne serez pas facturé à nouveau pour ce que vous possédez déjà. Achetez uniquement les contenus manquants via les cartes ci-dessus.":locale==="es"?"No se te cobrará de nuevo por lo que ya tienes. Compra únicamente lo que falta en las tarjetas de arriba.":"You will not be charged again for content you already own. Buy only the remaining items from the cards above."}</p>\n        <div className="mt-4 grid gap-2 sm:grid-cols-2">{missingProducts.map((item)=><div key={item} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-bold">{item}</div>)}</div>\n        <p className="mt-4 text-xs font-semibold text-[#8a6816]">{locale==="pt"?"Toque no ícone do conteúdo que falta para ver a opção de compra.":locale==="fr"?"Touchez l’icône du contenu manquant pour voir l’option d’achat.":locale==="es"?"Toca el icono del contenido que falta para ver la opción de compra.":"Tap the missing content icon to see the purchase option."}</p>\n      </section>\n    ):null}\n\n'''
partial = partial.replace('__EXISTING_COMBO__', existing_combo)
s = s[:start] + partial + s[end:]

p.write_text(s, encoding='utf-8')
