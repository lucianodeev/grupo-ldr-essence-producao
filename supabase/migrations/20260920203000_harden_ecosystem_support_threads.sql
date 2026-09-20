-- Harden Ecosystem Support attachment authorization and preserve complete threads.
alter table public.ecosystem_contacts add column if not exists upload_token_hash text;
alter table public.ecosystem_contacts add column if not exists upload_token_expires_at timestamptz;

create unique index if not exists ecosystem_contact_attachments_contact_path_idx
on public.ecosystem_contact_attachments(contact_id, storage_path);

drop function if exists public.submit_ecosystem_contact(text,text,text,text,text,text,text,text,boolean,boolean,text);\ncreate function public.submit_ecosystem_contact(
 p_name text,p_email text,p_phone text,p_subject text,p_message text,
 p_source_project text,p_source_url text,p_language text,p_wants_luciano boolean,p_consent boolean,p_website text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $
declare c public.ecosystem_contacts; raw_token text;
begin
 if coalesce(trim(p_website),'')<>'' then raise exception 'Invalid submission'; end if;
 if not p_consent then raise exception 'consent required'; end if;\n if char_length(trim(p_name)) not between 2 and 120 or char_length(trim(p_email)) not between 5 and 254 or position('@' in p_email)<2 or char_length(trim(p_subject)) not between 2 and 100 or char_length(trim(p_message)) not between 5 and 4000 then raise exception 'invalid submission'; end if;\n if p_language not in ('pt','en','fr','es') then raise exception 'invalid language'; end if;
 raw_token:=encode(gen_random_bytes(32),'hex');
 insert into public.ecosystem_contacts(name,email,phone,subject,message,source_project,source_url,language,wants_luciano,consent_contact,upload_token_hash,upload_token_expires_at)
 values(trim(p_name),lower(trim(p_email)),nullif(trim(p_phone),''),trim(p_subject),trim(p_message),coalesce(nullif(trim(p_source_project),''),'LDR Ecosystem'),nullif(trim(p_source_url),''),p_language,coalesce(p_wants_luciano,false),true,encode(digest(raw_token,'sha256'),'hex'),now()+interval '2 hours')
 returning * into c;
 insert into public.ecosystem_contact_messages(contact_id,direction,channel,body,sender,recipient)
 values(c.id,'inbound','email',c.message,c.email,'LDR');
 return jsonb_build_object('protocol',c.protocol,'uploadToken',raw_token);
end $$;
revoke all on function public.submit_ecosystem_contact(text,text,text,text,text,text,text,text,boolean,boolean,text) from public;
grant execute on function public.submit_ecosystem_contact(text,text,text,text,text,text,text,text,boolean,boolean,text) to anon,authenticated;
