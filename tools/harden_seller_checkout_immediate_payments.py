from pathlib import Path
p=Path('apps/painel-ldr/src/routes/api/seller-checkout.ts')
s=p.read_text(encoding='utf-8')
old='''          params.set("mode", mode);\n          params.set("line_items[0][price]", priceId);'''
new='''          params.set("mode", mode);\n          // Seller checkout intentionally uses card-only immediate confirmation so the existing production webhook set is sufficient.\n          // This avoids delayed-payment methods that would require additional async webhook events.\n          params.append("payment_method_types[]", "card");\n          metadata["seller_commission_scope"] = "initial_checkout";\n          params.set("line_items[0][price]", priceId);'''
if old not in s:
    raise SystemExit('checkout params anchor not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('seller checkout hardened to immediate card payments')
