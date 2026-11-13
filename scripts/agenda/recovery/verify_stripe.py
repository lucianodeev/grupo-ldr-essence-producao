"""Read-only Stripe configuration audit. Never emit credentials or API bodies."""
import json
import re
import urllib.request
import urllib.parse

EXPECTED_ACCOUNT = 'acct_1U28k7Klx2LyNGeB'
TARGETS = {'https://ldrecossistema.online/api/stripe/webhook',
           'https://ldr-ecossistema-validacao.onrender.com/api/stripe/webhook'}
EVENTS = {'checkout.session.completed', 'checkout.session.expired',
          'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
          'payment_intent.payment_failed', 'charge.refunded'}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

def read(path, key):
    # Fixed origin and GET only; do not follow redirects carrying Authorization.
    if not re.fullmatch(r'/v1/(account|webhook_endpoints\?limit=100(?:&starting_after=we_[A-Za-z0-9]+)?)', path):
        raise ValueError('unsupported audit path')
    req=urllib.request.Request('https://api.stripe.com'+path,
        headers={'Authorization':'Bearer '+key, 'Stripe-Version':'2026-09-30.endive'}, method='GET')
    with urllib.request.build_opener(NoRedirect()).open(req, timeout=20) as response:
        data=response.read(2*1024*1024+1)
    if len(data)>2*1024*1024: raise ValueError('oversized audit response')
    return json.loads(data)

def verify_configuration(env, requester=read):
    key=env.get('STRIPE_SECRET_KEY','')
    mode='live' if re.match(r'^[sr]k_live_',key) else 'test' if re.match(r'^[sr]k_test_',key) else 'unknown'
    result={'mode':mode, 'account_matches_expected':False, 'endpoint_enabled':False,
            'events_complete':False, 'signing_secret_present':bool(env.get('STRIPE_WEBHOOK_SECRET')),
            'configuration_ready':False, 'delivery_verified':False, 'read_only':True}
    if mode=='unknown': return dict(result,code='key_mode_unrecognized')
    try:
        account=requester('/v1/account',key)
        result['account_matches_expected']=account.get('id')==EXPECTED_ACCOUNT
        if not result['account_matches_expected']: return dict(result,code='account_mismatch')
        path='/v1/webhook_endpoints?limit=100'
        for _ in range(10):
            page=requester(path,key)
            rows=page.get('data',[])
            for endpoint in rows:
                if (endpoint.get('url') in TARGETS and endpoint.get('status')=='enabled'
                    and endpoint.get('livemode') is (mode=='live')):
                    result['endpoint_enabled']=True
                    events=set(endpoint.get('enabled_events',[]))
                    if '*' in events or EVENTS<=events: result['events_complete']=True
            if not page.get('has_more'): break
            tail=rows[-1].get('id','') if rows else ''
            if not re.fullmatch(r'we_[A-Za-z0-9]+',tail): return dict(result,code='pagination_invalid')
            path='/v1/webhook_endpoints?limit=100&starting_after='+tail
        else: return dict(result,code='pagination_limit')
        result['configuration_ready']=all(result[k] for k in ('account_matches_expected','endpoint_enabled','events_complete','signing_secret_present'))
        return dict(result,code='configuration_checked_delivery_still_required' if result['configuration_ready'] else 'endpoint_configuration_incomplete')
    except Exception:
        # HTTP errors and bodies may contain account information or credentials.
        return dict(result,code='stripe_read_failed_details_withheld')
