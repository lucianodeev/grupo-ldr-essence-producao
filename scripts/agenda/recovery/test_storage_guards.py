import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

spec=importlib.util.spec_from_file_location('storage_guard',Path(__file__).with_name('verify_storage.py'))
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)

class StorageRecoveryGuards(unittest.TestCase):
    def test_remote_or_unrelated_targets_are_rejected_before_docker_or_sql(self):
        for container,db in [(None,'ldr_restore'),('production','ldr_restore'),('ldr-recovery-123456abcdef','postgres')]:
            pg=Mock(container=container,db=db)
            with patch.object(s.subprocess,'run') as run:
                with self.assertRaisesRegex(RuntimeError,'disposable_recovery_database'):s.guard(pg)
                run.assert_not_called();pg.raw.assert_not_called()

    def test_archive_names_cannot_escape_the_storage_backend_root(self):
        for field,value in [('bucket_id','../escape'),('name','nested/../../escape'),
                            ('name','/absolute'),('version','../escape'),('name','x\\y')]:
            obj={'bucket_id':'fixture','name':'nested/file','version':'version'};obj[field]=value
            with self.assertRaisesRegex(RuntimeError,'unsafe_backend_path'):s.backend_path(obj)

    def test_production_import_cannot_enable_synthetic_diagnostics(self):
        self.assertFalse(s.SYNTHETIC_DIAGNOSTICS)
