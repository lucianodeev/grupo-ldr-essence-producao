// Read-only vault access. Never returns Stripe keys or the production database key.
import {createDecipheriv} from 'node:crypto';
export const TEST_CALENDAR='e23f50c0bd5d6e0674959daa9ac822861319d9da464bfd6e17327eae3ea457a7@group.calendar.google.com';
// Verified directly in the live Render UI on 2026-11-15. The recovery checkpoint
// predates activation and can still have TEST_CALENDAR as its old active value.
export const PRODUCTION_CALENDAR='9baa053c6264ba1d0ebbfe6b93354427404d1b8f0ecbb7a29e8929cd68bf1825@group.calendar.google.com';
const SOURCE='https://sfrcsrzuoqdscflfuwik.supabase.co';
export async function prepareRemoteCalendar(raw,request=fetch,report=()=>{}){
 let key,bytes;
 try{
  const input=JSON.parse(raw);
  // The recovery payload has an explicitly versioned wrapper; raw maps remain supported.
  const wrapped=input?.schema_version===1&&input?.render_service==='srv-daqq2gfavr4c7394hb1g'&&input?.env;
  const config=wrapped?input.env:input;
  key=Buffer.from(config?.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY??'','base64');
  const readiness={wrapped:!!wrapped,source:config?.SUPABASE_URL?.replace(/\/$/,'')===SOURCE,
   test_destination:config?.GOOGLE_CALENDAR_TEST_ID===TEST_CALENDAR,
   production_distinct:PRODUCTION_CALENDAR!==TEST_CALENDAR,
   snapshot_calendar_recognized:[PRODUCTION_CALENDAR,TEST_CALENDAR].includes(config?.GOOGLE_CALENDAR_ID),
   oauth_client:!!config?.GOOGLE_OAUTH_CLIENT_ID?.endsWith('.apps.googleusercontent.com'),
   oauth_secret:!!config?.GOOGLE_OAUTH_CLIENT_SECRET,source_key:!!config?.SUPABASE_SERVICE_ROLE_KEY,encryption_key:key.length===32};
  report(readiness);
  if(Object.entries(readiness).some(([name,ok])=>name!=='wrapped'&&!ok))throw Error();
  const headers={apikey:config.SUPABASE_SERVICE_ROLE_KEY};
  if(!config.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_'))headers.Authorization='Bearer '+config.SUPABASE_SERVICE_ROLE_KEY;
  const response=await request(SOURCE+'/rest/v1/ldr_calendar_oauth_secrets?select=encrypted_value,granted_scopes&secret_name=eq.google_calendar_refresh_token',{
   method:'GET',redirect:'error',signal:AbortSignal.timeout(15000),headers});
  if(!response.ok)throw Error();
  const rows=await response.json();if(!Array.isArray(rows)||rows.length!==1)throw Error();
  const scopes=rows[0].granted_scopes;
  if(!Array.isArray(scopes)||!scopes.includes('https://www.googleapis.com/auth/calendar.events')||
   !scopes.includes('https://www.googleapis.com/auth/calendar.freebusy'))throw Error();
  bytes=Buffer.from(rows[0].encrypted_value,'base64');if(bytes.length<29)throw Error();
  const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));decipher.setAuthTag(bytes.subarray(12,28));
  const token=Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]);
  if(!token.length)throw Error();
  const result={GOOGLE_OAUTH_CLIENT_ID:config.GOOGLE_OAUTH_CLIENT_ID,GOOGLE_OAUTH_CLIENT_SECRET:config.GOOGLE_OAUTH_CLIENT_SECRET,
   GOOGLE_OAUTH_REFRESH_TOKEN:token.toString('utf8'),GOOGLE_CALENDAR_ID:TEST_CALENDAR,GOOGLE_CALENDAR_TEST_ID:TEST_CALENDAR};
  token.fill(0);return result;
 }catch{throw Error('remote_calendar_config_or_vault_unavailable');}
 finally{key?.fill(0);bytes?.fill(0);}
}
