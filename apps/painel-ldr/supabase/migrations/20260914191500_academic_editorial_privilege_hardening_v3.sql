-- Social V3 least-privilege hardening. RLS remains enabled; remove broad default table grants.
revoke all on public.academic_editorial_profiles from authenticated, anon;
revoke all on public.academic_editorial_posts from authenticated, anon;
revoke all on public.academic_editorial_articles from authenticated, anon;
revoke all on public.academic_editorial_comments from authenticated, anon;
revoke all on public.academic_editorial_settings from authenticated, anon;
revoke all on public.academic_editorial_reactions from authenticated, anon;
revoke all on public.academic_saved_editorial_posts from authenticated, anon;
revoke all on public.academic_editorial_user_comments from authenticated, anon;
revoke all on public.academic_editorial_follows from authenticated, anon;
revoke all on public.academic_network_preferences from authenticated, anon;

grant select on public.academic_editorial_profiles, public.academic_editorial_posts, public.academic_editorial_articles, public.academic_editorial_comments, public.academic_editorial_settings to authenticated;
grant select,insert,delete on public.academic_editorial_reactions, public.academic_saved_editorial_posts, public.academic_editorial_follows to authenticated;
grant select,insert,update,delete on public.academic_editorial_user_comments to authenticated;
grant select,insert,update on public.academic_network_preferences to authenticated;
