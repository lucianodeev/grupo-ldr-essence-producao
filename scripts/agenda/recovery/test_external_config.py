import base64
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('external',Path(__file__).with_name('external_config.py'))
e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)

class ExternalConfigSecurity(unittest.TestCase):
    def config(self):
        d={k:'synthetic only' for k in e.REQUIRED}
        d.update(SUPABASE_URL='https://sfrcsrzuoqdscflfuwik.supabase.co',
                 GOOGLE_OAUTH_REDIRECT_URI='https://ldrecossistema.online/api/integrations/google-calendar/callback',
                 AGENDA_INTEGRATION_ENABLED='false',GOOGLE_CALENDAR_VALIDATION_ENABLED='false',
                 GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY=base64.b64encode(bytes(32)).decode())
        return d

    def test_absent_input_does_not_claim_a_configuration_backup(self):
        with tempfile.TemporaryDirectory() as t:
            self.assertFalse(e.capture(Path(t),'')); self.assertEqual(list(Path(t).iterdir()),[])

    def test_configuration_cannot_target_another_project_or_enable_agenda(self):
        for key,value in [('SUPABASE_URL','https://other.supabase.co'),
                          ('AGENDA_INTEGRATION_ENABLED','true'),
                          ('GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY','invalid'),
                          ('GOOGLE_OAUTH_CLIENT_SECRET','')]:
            d=self.config();d[key]=value
            with tempfile.TemporaryDirectory() as t:
                with self.assertRaisesRegex(RuntimeError,'details_withheld'):
                    e.capture(Path(t),json.dumps(d))
                self.assertEqual(list(Path(t).iterdir()),[])

    def test_capture_preserves_all_config_values_only_inside_payload(self):
        d=self.config();d['SYNTHETIC_EXTRA']='retained value'
        with tempfile.TemporaryDirectory() as t:
            self.assertTrue(e.capture(Path(t),json.dumps(d)))
            self.assertEqual(json.loads((Path(t)/'render-environment.json').read_text())['env'],d)

    def test_actual_calendar_aes_key_roundtrip_and_tamper_rejection_do_not_print_token(self):
        fixture=subprocess.run(['node','--input-type=module','-e',
          "import {createCipheriv} from 'node:crypto'; const key=Buffer.alloc(32),iv=Buffer.alloc(12); const c=createCipheriv('aes-256-gcm',key,iv); const b=Buffer.concat([c.update('synthetic-private-token'),c.final()]); console.log(JSON.stringify({key:key.toString('base64'),ciphertext:Buffer.concat([iv,c.getAuthTag(),b]).toString('base64')}));"],capture_output=True,check=True)
        value=json.loads(fixture.stdout)
        for tampered in (False,True):
            d=dict(value)
            if tampered:
                b=bytearray(base64.b64decode(d['ciphertext']));b[-1]^=1;d['ciphertext']=base64.b64encode(b).decode()
            r=subprocess.run(['node',str(Path(__file__).with_name('verify-calendar-key.mjs'))],input=json.dumps(d).encode(),capture_output=True)
            self.assertEqual(r.returncode,1 if tampered else 0)
            self.assertNotIn(b'synthetic-private-token',r.stdout+r.stderr)
