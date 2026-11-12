import contextlib
import importlib.util
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('recovery',Path(__file__).with_name('prepare.py'))
r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)

class RecoverySecurityTests(unittest.TestCase):
    def test_restore_errors_never_disclose_arbitrary_sql_or_object_names(self):
        for message, code in [
            (b'ERROR: pg_cron can only be loaded via shared_preload_libraries; private-value', 'isolated_restore_shared_preload_required'),
            (b'ERROR: can only be created in database private-db', 'isolated_restore_extension_database_mismatch'),
            (b'ERROR: unrecognized configuration parameter "transaction_timeout"', 'isolated_restore_unknown_parameter_transaction_timeout'),
            (b'ERROR: schema "graphql" already exists; private-credential', 'isolated_restore_schema_already_exists_graphql'),
            (b'ERROR: schema "private-secret" already exists; private-credential', 'isolated_restore_duplicate_object'),
            (b'ERROR: extension "pg_net" is not available; private-value', 'isolated_restore_extension_unavailable_pg_net'),
            (b'ERROR: private-credential private-sql private-customer', 'isolated_restore_failed_details_withheld'),
        ]:
            self.assertEqual(r.restore_failure_code(message),code)
            self.assertNotIn('private',r.restore_failure_code(message))
    def test_schema_preflight_dump_is_explicit_and_full_dump_remains_default(self):
        with tempfile.TemporaryDirectory() as p,patch.object(r,'run') as run:
            def emit(*args,**kwargs): kwargs['output'].write(b'synthetic')
            run.side_effect=emit
            pg=r.Pg(container='ldr-recovery-test')
            pg.dump(Path(p)/'schema.dump',schema_only=True)
            self.assertIn('--schema-only',run.call_args.args[0])
            pg.dump(Path(p)/'full.dump')
            self.assertNotIn('--schema-only',run.call_args.args[0])

    def test_official_ca_is_pinned_and_read_only_inside_client(self):
        self.assertEqual(r.sha(r.ROOT_CA), r.ROOT_CA_SHA256)
        cmd=r.Pg(remote_env={'PGPASSWORD':'synthetic-secret'}).command('psql')
        self.assertIn('type=bind,src='+str(r.ROOT_CA)+',dst='+r.ROOT_CA_CONTAINER_PATH+',readonly', cmd)
        self.assertNotIn('synthetic-secret', ' '.join(cmd))
        with patch.object(r,'sha',return_value='modified'):
            with self.assertRaisesRegex(r.Blocked,'official_database_ca_checksum_mismatch'):
                r.Pg(remote_env={'PGPASSWORD':'synthetic'}).command('psql')
    def test_snapshot_error_categories_never_include_credentials(self):
        for message, expected in [
            (b'password authentication failed for user private-user password=private-value', 'snapshot_database_authentication_failed'),
            (b'SSL error: certificate verify failed host=private-host', 'snapshot_tls_verification_failed'),
            (b'FATAL: Tenant or user not found private-user', 'snapshot_pooler_tenant_or_user_not_found'),
            (b'permission denied for private-table', 'snapshot_database_permission_denied'),
        ]:
            self.assertEqual(r.snapshot_failure_code(message), expected)
            self.assertNotIn('private', r.snapshot_failure_code(message))
    def test_unknown_snapshot_errors_are_fully_withheld(self):
        self.assertEqual(r.snapshot_failure_code(b'private-credential private-sql private-data'),
                         'snapshot_export_failed_details_withheld')

    def test_rejects_arbitrary_remote_hosts_before_credentials(self):
        with patch.dict(os.environ,{'LDR_BACKUP_DB_HOST':'attacker.example','LDR_BACKUP_DB_PASSWORD':'not-a-real-secret'}):
            with self.assertRaisesRegex(r.Blocked,'unapproved_database_host'): r.remote_environment()
    def test_accepts_only_this_project_and_region_with_read_only_source(self):
        for host in ['db.'+r.PROJECT+'.supabase.co','aws-0-eu-north-1.pooler.supabase.com']:
            with patch.dict(os.environ,{'LDR_BACKUP_DB_HOST':host,'LDR_BACKUP_DB_PASSWORD':'synthetic'}):
                env=r.remote_environment()
                self.assertIn('default_transaction_read_only=on',env['PGOPTIONS'])
                self.assertEqual(env['PGPORT'],'5432')
                self.assertEqual(env['PGSSLMODE'],'verify-full')
                self.assertEqual(env['PGSSLROOTCERT'],r.ROOT_CA_CONTAINER_PATH)
    def test_subprocess_failure_never_exposes_stderr_or_secret(self):
        result=subprocess.CompletedProcess([],1,b'',b'credential=private-value customer=private-name')
        with patch.object(r.subprocess,'run',return_value=result):
            with self.assertRaisesRegex(r.Blocked,'subprocess_failed_details_withheld') as e: r.run(['synthetic'])
        self.assertNotIn('private',str(e.exception))
    def test_password_not_embedded_in_source_command(self):
        env={'PGPASSWORD':'synthetic-secret'}
        cmd=r.Pg(remote_env=env).command('pg_dump','--format=custom')
        self.assertNotIn('synthetic-secret',' '.join(cmd))
        self.assertIn('PGPASSWORD',cmd)
    def test_restore_targets_container_only(self):
        local=r.Pg(container='ldr-recovery-synthetic',user='ldr_restore_admin',db='ldr_restore')
        self.assertEqual(local.command('psql')[:4],['docker','exec','-i','ldr-recovery-synthetic'])
        self.assertNotIn('PGHOST',local.command('psql'))
    def test_identifiers_and_literals_escape_sql_delimiters(self):
        self.assertEqual(r.identifier('a"b'),'"a""b"')
        self.assertEqual(r.literal("a'b"),"'a''b'")
    def test_storage_redirect_refused(self):
        with self.assertRaisesRegex(r.Blocked,'storage_redirect_refused'): r.NoRedirect().redirect_request(None,None,None,None,None,None)
    def test_weak_backup_passphrase_refused(self):
        with tempfile.TemporaryDirectory() as p:
            base=Path(p);work=base/'payload';work.mkdir();out=base/'out';out.mkdir()
            with self.assertRaisesRegex(r.Blocked,'minimum_24'): r.seal(work,out,'short')
            self.assertFalse(list(out.iterdir()))
    @unittest.skipUnless(__import__('shutil').which('gpg'),'official GnuPG required')
    def test_ciphertext_decrypts_to_exact_payload_and_hides_plaintext(self):
        with tempfile.TemporaryDirectory() as p:
            base=Path(p);work=base/'payload';work.mkdir();out=base/'out';out.mkdir()
            secret=b'synthetic sensitive fixture for archive verification'
            (work/'database.dump').write_bytes(secret)
            recovered=r.seal(work,out,'synthetic passphrase for test only 2026')
            self.assertEqual((recovered/'database.dump').read_bytes(),secret)
            self.assertNotIn(secret,(out/'recovery.tar.gpg').read_bytes())
            self.assertEqual([f.name for f in out.iterdir()],['recovery.tar.gpg'])
    def test_role_dump_never_includes_passwords(self):
        with tempfile.TemporaryDirectory() as p,patch.object(r,'run') as run:
            r.Pg(container='ldr-recovery-test').roles(Path(p)/'roles.sql')
            self.assertIn('--no-role-passwords',run.call_args.args[0])
    def test_no_remote_mutations_in_workflow(self):
        text=Path('.github/workflows/ldr-recovery-preparation.yml').read_text()
        self.assertNotIn('pull_request_target',text)
        self.assertIn('environment: ldr-backup',text)
        self.assertIn("github.ref == 'refs/heads/main'",text)
        self.assertNotIn('if: always()',text)
        self.assertNotIn('render',text.lower())
        self.assertNotIn('supabase db push',text)
    def test_production_gate_is_always_closed(self):
        text=Path(__file__).with_name('prepare.py').read_text()
        self.assertIn("'production_gate':False",text)
        self.assertIn("'project_backup_complete':False",text)

if __name__=='__main__': unittest.main()
