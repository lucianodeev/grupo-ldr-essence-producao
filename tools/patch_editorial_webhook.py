from pathlib import Path
p=Path('apps/painel-ldr/src/routes/api/stripe/webhook.ts')
s=p.read_text(encoding='utf-8')
helper='''async function setEditorialSubscription(metadata: Record<string, string>, object: StripeObject, eventType: string) {\n  const { handleEditorialStripeEvent } = await import("@/lib/editorial-subscription.server");\n  return handleEditorialStripeEvent(metadata, object, eventType);\n}\n\n'''
anchor='''async function setLibrarySubscription(metadata: Record<string, string>, object: StripeObject, eventType: string) {\n  const { handleLibrarySubscriptionStripeEvent } = await import("@/lib/library-subscription.server");\n  return handleLibrarySubscriptionStripeEvent(metadata, object, eventType);\n}\n\n'''
if 'async function setEditorialSubscription(' not in s:
    if anchor not in s: raise SystemExit('Library webhook helper anchor not found')
    s=s.replace(anchor,anchor+helper,1)
editorial='''          // Jornal LDR e Revista LDR: assinaturas editoriais independentes.\n          if (metadata["checkout_kind"] === "editorial_subscription" && (\n            event.type === "checkout.session.completed" ||\n            event.type === "checkout.session.expired" ||\n            event.type === "customer.subscription.created" ||\n            event.type === "customer.subscription.updated" ||\n            event.type === "customer.subscription.deleted" ||\n            event.type === "invoice.payment_succeeded" ||\n            event.type === "invoice.payment_failed"\n          )) {\n            await setEditorialSubscription(metadata, object, event.type);\n          }\n\n'''
marker='''          // Biblioteca LDR: assinatura mensal de conteúdos digitais.\n'''
if '// Jornal LDR e Revista LDR: assinaturas editoriais independentes.' not in s:
    if marker not in s: raise SystemExit('Library subscription handler marker not found')
    s=s.replace(marker,editorial+marker,1)
p.write_text(s,encoding='utf-8')
