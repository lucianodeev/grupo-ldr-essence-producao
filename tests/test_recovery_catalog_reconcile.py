"""Synthetic-only regression checks for isolated platform catalog reconciliation."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("ldr_recovery_prepare", ROOT / "scripts/agenda/recovery/prepare.py")
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)

class FakeTarget:
    container = "ldr-recovery-123456789abc"
    db = "ldr_restore"
    def __init__(self, catalog):
        self.catalog = catalog
        self.sql = []
    def json(self, sql, snapshot=False):
        return self.catalog
    def raw(self, sql, snapshot=False):
        self.sql.append(sql)

class CatalogReconciliationTests(unittest.TestCase):
    def test_platform_extras_are_removed_only_in_isolated_clone(self):
        catalog = [
            {"kind":"constraint","schema":"net","table":"_http_response","name":"extension_extra","definition":"CHECK (id > 0)"},
            {"kind":"policy","value":{"schemaname":"net","tablename":"_http_response","policyname":"extension_extra","roles":["public"]}},
        ]
        target = FakeTarget(catalog)
        manifest = {"sequences":[],"catalog":[],"tables":[]}
        with patch.object(mod, "PLATFORM_TABLES", (("net","_http_response"),)):
            mod.restore_platform_state(target, Path("/nonexistent/ldr-synthetic-fixture"), manifest)
        sql = "\n".join(target.sql)
        self.assertIn('DROP CONSTRAINT "extension_extra"', sql)
        self.assertIn('DROP POLICY "extension_extra"', sql)
    def test_unexpected_application_constraint_fails_closed(self):
        target = FakeTarget([{"kind":"constraint","schema":"public","table":"appointments","name":"extra","definition":"CHECK (id > 0)"}])
        with self.assertRaises(mod.Blocked):
            mod.restore_platform_state(target, Path("/nonexistent/ldr-synthetic-fixture"), {"sequences":[],"catalog":[],"tables":[]})
    def test_unexpected_application_policy_fails_closed(self):
        target = FakeTarget([{"kind":"policy","value":{"schemaname":"public","tablename":"appointments","policyname":"extra","roles":["public"]}}])
        with self.assertRaises(mod.Blocked):
            mod.restore_platform_state(target, Path("/nonexistent/ldr-synthetic-fixture"), {"sequences":[],"catalog":[],"tables":[]})
    def test_matching_platform_rules_are_preserved(self):
        constraint = {"kind":"constraint","schema":"net","table":"_http_response","name":"same","definition":"CHECK (id > 0)"}
        target = FakeTarget([constraint])
        mod.restore_platform_state(target, Path("/nonexistent/ldr-synthetic-fixture"), {"sequences":[],"catalog":[constraint],"tables":[]})
        self.assertNotIn("DROP CONSTRAINT", "\n".join(target.sql))

if __name__ == "__main__":
    unittest.main()
