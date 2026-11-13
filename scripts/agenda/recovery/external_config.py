"""Optional protected Render configuration input; never print secret values."""
import base64
import json
from pathlib import Path
import re

REQUIRED=(
    'GOOGLE_CALENDAR_ID','GOOGLE_CALENDAR_TEST_ID','GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY',
    'GOOGLE_OAUTH_CLIENT_ID','GOOGLE_OAUTH_CLIENT_SECRET','GOOGLE_OAUTH_STATE_SECRET',
    'GOOGLE_OAUTH_REDIRECT_URI','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET',
    'AGENDA_INTEGRATION_ENABLED','GOOGLE_CALENDAR_VALIDATION_ENABLED',
)


def capture(work, text):
    if not text:
        return False
    try:
        env=json.loads(text)
        assert isinstance(env,dict) and 0<len(env)<=150 and len(text)<=131072
        assert all(isinstance(k,str) and re.fullmatch(r'[A-Z][A-Z0-9_]*',k)
                   and isinstance(v,str) and '\x00' not in v for k,v in env.items())
        assert all(env.get(k) for k in REQUIRED)
        assert env['SUPABASE_URL'].rstrip('/')=='https://sfrcsrzuoqdscflfuwik.supabase.co'
        assert env['GOOGLE_OAUTH_REDIRECT_URI']=='https://ldrecossistema.online/api/integrations/google-calendar/callback'
        assert env['AGENDA_INTEGRATION_ENABLED']=='false'
        assert env['GOOGLE_CALENDAR_VALIDATION_ENABLED']=='false'
        assert len(base64.b64decode(env['GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY'],validate=True))==32
    except Exception:
        raise RuntimeError('external_render_configuration_invalid_details_withheld') from None
    # Existing seal() encrypts this with the database and verifies its exact bytes
    # after decrypting the archive. Do not write any output outside that payload.
    value={'schema_version':1,'render_service':'srv-daqq2gfavr4c7394hb1g','env':env}
    (work/'render-environment.json').write_text(json.dumps(value,sort_keys=True))
    return True


def verify_calendar_key(pg,recovered,run):
    from verify_storage import guard
    guard(pg)
    path=recovered/'render-environment.json'
    if not path.exists():return False
    config=json.loads(path.read_text())
    # Only the encrypted token leaves the isolated SQL client, into local memory.
    token=pg.json("SELECT to_jsonb(encrypted_value) FROM public.ldr_calendar_oauth_secrets WHERE secret_name='google_calendar_refresh_token';",snapshot=False)
    result=run(['node',str(Path(__file__).with_name('verify-calendar-key.mjs'))],
               data=json.dumps({'key':config['env']['GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY'],'ciphertext':token}).encode())
    if result.strip()!=b'PASS recovered Calendar token decryption':
        raise RuntimeError('external_calendar_key_recovery_failed')
    return True
