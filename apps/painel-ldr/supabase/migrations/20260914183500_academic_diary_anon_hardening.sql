begin;

-- Diary is strictly private. Remove any direct anonymous table privileges;
-- authenticated access remains protected by the existing self-only RLS policies.
revoke all on table public.academic_diary_entries from anon;

commit;
