# LDR Ecosystem — opportunity and entrepreneurship architecture

Status: architecture prepared on the LDR Carreira feature branch. This document does not enable payments, public service listings, or production schema changes.

## Product loop
Learn (LDR Academy) → Connect (Rede Acadêmica) → Work (LDR Carreira) → Build a service business (future Marketplace LDR) → Hire → Grow.

One account may participate in multiple contexts. Roles must not be mutually exclusive. Do not create separate identities for student, candidate, provider, buyer, or employer.

## Domain boundaries
- Academy owns learning/catalog/progress.
- Academic Network owns academic community and knowledge exchange.
- Carreira owns jobs, applications and recruitment processes.
- Future Marketplace owns service offers, service requests and verified service transactions.

Jobs and service offers are different domain objects and must never share a single overloaded table.

## Future-safe identity model
Prefer a stable user identity plus module-specific profiles/relationships. Public profile data, private account data, resumes, recruitment data, academic data, service data and future transaction data remain separated.

Future entities, only when their feature is implemented:
- professional_profiles
- service_offers
- service_requests
- service_engagements
- service_reviews

Do not create these production tables merely to reserve names.

## Entrepreneurship entry
Future CTA: “Começar a empreender”.
Guided flow: skill → service → audience → online/presential → country → languages → price/currency → offer review/moderation → publish.

A course completion must never automatically imply professional qualification. The user chooses which legitimate skills/certificates are public.

## Free core for current phase
- account/profile entry
- job discovery and application
- free job posting
- basic ATS/recruitment pipeline
- academic-network participation under its existing rules
- future basic professional presence/service-offer entry, once Trust & Safety is ready

Do not charge candidates for viewing or applying to jobs.

## Monetization hypotheses — NOT implemented now
Study later, with transparent terms:
1. Fee on a completed service transaction mediated and paid through the marketplace.
2. Optional provider business tools: CRM, proposals, advanced scheduling, reporting, business automation.
3. Optional enterprise tools: multi-recruiter permissions, advanced analytics, integrations/API, high-volume workflow.
4. Paid education remains separate from employment access.

Principle: monetize concrete additional economic/productivity value, not access to job candidacy.

No percentage, price, Stripe Connect, wallet, escrow, KYC, paywall or premium plan is defined in this phase.

## Trust & Safety before service marketplace launch
Require moderation/reporting/blocking controls and policies for fraud, phishing, prohibited/illegal services, fake reviews, impersonation, discriminatory listings and academic fraud. Verified reviews should require a real eligible interaction.

## International
Keep country, city, currency, language, modality and time zone independent. PT/EN/FR/ES are presentation languages; regulated-service and tax rules may vary by jurisdiction.

## Current implementation guardrail
Finish the Carreira core first: jobs → moderation → public listing → applications → private resumes → free ATS → company pipeline. Only low-risk architectural choices should be made now to keep the future marketplace possible.

Production remains unchanged until explicit authorization.
