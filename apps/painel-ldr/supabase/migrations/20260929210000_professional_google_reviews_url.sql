alter table public.professional_profiles
  add column if not exists google_reviews_url text;

alter table public.professional_profiles
  drop constraint if exists professional_profiles_google_reviews_url_https;

alter table public.professional_profiles
  add constraint professional_profiles_google_reviews_url_https
  check (google_reviews_url is null or google_reviews_url ~ '^https://');
