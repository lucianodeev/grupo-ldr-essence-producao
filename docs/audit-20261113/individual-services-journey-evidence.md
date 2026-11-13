# Individual services journey — 13 November 2026

## Scope and deployment
Repository: lucianodeev/grupo-ldr-essence-producao.
PR: https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/297
Reviewed head: 039d0f8acf9eca9672063ee72e0e4eb9ff4c7b45.
Merge commit: e1a69b86cd3249ec2b43bed2cdc7d5cc6d43837d.
Render: srv-daqq2gfavr4c7394hb1g, free plan, existing auto deployment from main.
Deploy: dep-dbrm08tbedkc73bhhqb0.

## Behavior
- Public individual-service entry and authenticated catalogue, orders and agenda navigation.
- Clear total price, actual included session count and four-step purchase/scheduling explanation.
- No fixed duration invented: professional confirms duration, format and availability. Payment alone does not reserve a slot.
- Prices remain sourced from existing catalogue. No price changes, invented currency conversion or unverified reference discounts.
- New automatic individual checkout is disabled by default via INDIVIDUAL_SERVICE_CHECKOUT_ENABLED; assisted booking remains available. Existing non-session legacy products are outside this checkout change.
- Prepared checkout derives customer identity from authenticated account and amount/currency from catalogue. Stable request/order/provider idempotency. Failure retains pending order.
- Signed webhook checks customer, product, amount, currency and session. Conditional updates preserve paid/refunded states despite late or concurrent events.
- Full refund received before payment confirmation stays final; delayed completion cannot regrant payment status.
- Partial-refund events record the provider's cumulative refunded amount. This code does not execute financial refunds or proportionally adjust credits.
- Agenda eligibility requires issued credits; hidden reservations consume credits without returning private appointment details.
- Client email linking treats SQL pattern characters literally and additionally checks exact normalized email equality.
- Failed catalogue/agenda reads produce retryable errors rather than misleading empty lists.

## Validation
Final-head CI: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43488559180
Job 132103361947: success, Node 22.
13 professional ownership/availability tests; 17 individual checkout/agenda tests; 18 signed actual webhook handler tests; production build: all passed.
Vercel Agent Review: success; refund ordering finding explicitly marked resolved in 039d0f8.
Local: TypeScript 0 errors; 59 unit tests; 166 regressions including the same 17 individual tests (do not double-count); 18 webhook tests; git diff --check passed.
Synthetic database/provider/signature fixtures only. No real payment, purchase, refund, calendar invitation or production test order was created.

## Boundaries and remaining gate
No database migration/DDL, deletion of existing data, paid-plan purchase, price update or credential change in this release.
Six previously exposed service credentials remain unrotated; their values are excluded from this report and source.
Automatic individual checkout must stay disabled until secure rotation and explicit external payment/credit/scheduling validation. Rotation remains blocked by the previously reported email verification issue.
This report covers individual services only; Central Empresas, Academy and LDR ONE commercial expansion are subsequent stages.

## Live verification
Render status live, finishedAt 2026-11-13T19:10:25.907658Z (20:10 Brussels); commit matched e1a69b86cd3249ec2b43bed2cdc7d5cc6d43837d. Automatic deployment only; no duplicate manual deployment.
Observed in browser after reload:
- https://ldrecossistema.online/ldr-rh-estrategia — new public individual-services entry opens catalogue and states sign-in requirement.
- https://ldrecossistema.online/cliente/contratar — four steps, prices EUR 50 / 114 / 228 / 342 for psychoanalysis, actual 1 / 4 / 8 / 12 sessions; mentorship EUR 75 / 243 / 441. Individual cards explicitly show Assisted booking and Contact our team, confirming checkout gate is off.
- Search Mentoria retains only mentorship products in EUR; selecting BRL shows no matching service rather than converting EUR prices. Filters reset afterwards.
- https://ldrecossistema.online/cliente/agenda — read succeeded and states no eligible paid order/no scheduled meetings for this account. No synthetic reservation or phantom credits.
- https://ldrecossistema.online/cliente/pedidos — existing own orders loaded. Existing order detail shows Refresh status; read-only refresh can be initiated. No new order was created or status changed.
Browser language was English, preserved from the existing session. No real financial or Google Calendar end-to-end transaction was attempted. Paid/pending individual detail behavior was tested with synthetic fixtures, not fabricated production records.
Screenshots captured for the published public entry, catalogue guide and assisted-booking cards; no secrets or customer list in screenshots.
