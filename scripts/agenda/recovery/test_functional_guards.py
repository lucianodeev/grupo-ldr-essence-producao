import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

spec=importlib.util.spec_from_file_location('functional',Path(__file__).with_name('verify_recovered.py'))
f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f)

class FunctionalTargetGuards(unittest.TestCase):
    def test_rejects_remote_or_other_database_before_any_sql(self):
        for container,db in [(None,'ldr_restore'),('production','ldr_restore'),
                             ('ldr-recovery-123456abcdef','postgres')]:
            pg=Mock(container=container,db=db)
            with self.assertRaisesRegex(RuntimeError,'require_isolated_recovery_target'):
                f.verify_recovered(pg)
            pg.raw.assert_not_called();pg.json.assert_not_called()

    def test_rejects_network_ports_and_mounts_before_any_sql(self):
        import json
        base={'HostConfig':{'NetworkMode':'none','PortBindings':{}},'Mounts':[]}
        for config in [dict(base,HostConfig={'NetworkMode':'bridge'}),
                       dict(base,HostConfig={'NetworkMode':'none','PortBindings':{'5432/tcp':[]}}),
                       dict(base,Mounts=[{'Source':'/private'}])]:
            pg=Mock(container='ldr-recovery-123456abcdef',db='ldr_restore')
            with patch.object(f.subprocess,'run',return_value=Mock(stdout=json.dumps([config]).encode())):
                with self.assertRaisesRegex(RuntimeError,'no_network_ports_or_mounts'):
                    f.verify_recovered(pg)
            pg.raw.assert_not_called();pg.json.assert_not_called()
