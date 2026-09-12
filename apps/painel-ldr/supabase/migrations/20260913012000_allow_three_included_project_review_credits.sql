-- Allow multiple included project-review credits per enrollment.
-- The current Do Mamão ao Negócio flow includes three monthly project reviews.
drop index if exists public.uq_training_project_review_credit_included;
