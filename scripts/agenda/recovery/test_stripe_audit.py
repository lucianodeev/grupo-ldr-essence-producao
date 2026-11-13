import importlib.util
import json
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('stripe_audit',Path(__file__).with_name('verify_stripe.py'))
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)

class StripeAuditTests(unittest.TestCase):
    def env(self): return {'STRIPE_SECRET_KEY':'sk_test_synthetic_only', 'STRIPE_WEBHOOK_SECRET':'synthetic_signing_only'}
    def endpoint(self): return {'url':sorted(s.TARGETS)[0], 'status':'enabled','livemode':False,'enabled_events':sorted(s.EVENTS)}
    def test_get_inventory_and_no_secret_output(self):
        calls=[]
        def request(path,key):
            calls.append(path)
            return {'id':s.EXPECTED_ACCOUNT} if path=='/v1/account' else {'data':[self.endpoint()],'has_more':False}
        result=s.verify_configuration(self.env(),request)
        self.assertTrue(result['configuration_ready']); self.assertFalse(result['delivery_verified'])
        self.assertEqual(calls,['/v1/account','/v1/webhook_endpoints?limit=100'])
        self.assertNotIn('synthetic',json.dumps(result))
    def test_wrong_account_stops_before_webhook_read(self):
        calls=[]
        def request(path,key): calls.append(path); return {'id':'acct_other'}
        self.assertEqual(s.verify_configuration(self.env(),request)['code'],'account_mismatch')
        self.assertEqual(calls,['/v1/account'])
    def test_disabled_wrong_mode_or_missing_async_events_are_not_ready(self):
        for patch in ({'status':'disabled'},{'livemode':True},{'enabled_events':['checkout.session.completed']}):
            endpoint={**self.endpoint(),**patch}
            result=s.verify_configuration(self.env(),lambda path,key: {'id':s.EXPECTED_ACCOUNT} if path=='/v1/account' else {'data':[endpoint]})
            self.assertFalse(result['configuration_ready'])
    def test_api_errors_are_sanitized_and_invalid_keys_never_use_network(self):
        def fail(path,key): raise RuntimeError('private '+key)
        result=s.verify_configuration(self.env(),fail)
        self.assertEqual(result['code'],'stripe_read_failed_details_withheld'); self.assertNotIn('private',json.dumps(result))
        self.assertEqual(s.verify_configuration({'STRIPE_SECRET_KEY':'invalid'},fail)['code'],'key_mode_unrecognized')
    def test_pagination_and_wildcard_events(self):
        def request(path,key):
            if path=='/v1/account': return {'id':s.EXPECTED_ACCOUNT}
            if 'starting_after' not in path:return {'data':[{'id':'we_fixture'}],'has_more':True}
            return {'data':[{**self.endpoint(),'enabled_events':['*']}],'has_more':False}
        self.assertTrue(s.verify_configuration(self.env(),request)['configuration_ready'])
