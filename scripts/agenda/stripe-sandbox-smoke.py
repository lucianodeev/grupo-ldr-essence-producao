"""Opt-in, temporary Stripe sandbox only. Never loads application/production credentials.

Requires STRIPE_SANDBOX_CONFIG, STRIPE_CLI and LDR_SANDBOX_OUTPUT outside the repo.
The raw signed webhook evidence is private; do not commit or upload that directory.
"""
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import subprocess
import threading
import time
import tomllib
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

os.umask(0o077)
config = Path(os.environ['STRIPE_SANDBOX_CONFIG']).resolve()
output = Path(os.environ['LDR_SANDBOX_OUTPUT']).resolve()
assert not output.is_relative_to(Path(__file__).resolve().parents[2]), 'Private output must be outside repository'
output.mkdir(parents=True, exist_ok=True)
profile = tomllib.loads(config.read_text())['default']
key = profile['test_mode_api_key']
assert re.fullmatch(r'(?:[sr]k|rkcs)_test_[A-Za-z0-9]+', key), 'Only test keys allowed'
assert profile.get('sandbox_expires_at'), 'Temporary isolated sandbox required'
cli = [os.environ['STRIPE_CLI'], '--config', str(config)]
run_id = str(int(time.time()))
receipts = []
secret = None

def api(path, params=None, idem=None, allow_error=False):
    headers = {'Authorization': 'Bearer '+key}
    if idem: headers['Idempotency-Key'] = idem
    data = urllib.parse.urlencode(params).encode() if params is not None else None
    request = urllib.request.Request('https://api.stripe.com/v1/'+path, data=data, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response: result = json.load(response)
    except urllib.error.HTTPError as error:
        if not allow_error: raise RuntimeError('Stripe sandbox request failed: '+str(error.code)) from None
        result = json.load(error)
    if 'livemode' in result: assert result['livemode'] is False, 'Live response forbidden'
    return result

class Receiver(BaseHTTPRequestHandler):
    def do_POST(self):
        raw = self.rfile.read(int(self.headers['Content-Length'])).decode()
        signature = self.headers.get('Stripe-Signature', '')
        parts = dict(item.split('=',1) for item in signature.split(','))
        expected = hmac.new(secret.encode(), (parts['t']+'.'+raw).encode(), hashlib.sha256).hexdigest()
        valid = hmac.compare_digest(expected, parts.get('v1','')) and abs(time.time()-int(parts['t'])) < 300
        event = json.loads(raw)
        valid = valid and event['livemode'] is False
        if valid:
            receipts.append({'raw':raw,'signature':signature})
            (output/(event['id']+'.json')).write_text(json.dumps(receipts[-1]))
        self.send_response(200 if valid else 400); self.end_headers(); self.wfile.write(b'{}')
    def log_message(self, *args): pass

server = HTTPServer(('127.0.0.1',0), Receiver)
threading.Thread(target=server.serve_forever, daemon=True).start()
log = (output/'listener-private.log').open('w')
listener = subprocess.Popen(cli+['listen','--skip-update','--events','checkout.session.completed,checkout.session.expired,payment_intent.payment_failed,charge.refunded',
    '--forward-to', f'http://127.0.0.1:{server.server_port}/webhook'], stdout=log, stderr=log)
try:
    deadline = time.time()+50
    while time.time()<deadline:
        match = re.search(r'whsec_[A-Za-z0-9]+',(output/'listener-private.log').read_text())
        if match: secret=match.group(); break
        if listener.poll() is not None: raise RuntimeError('Stripe listener exited before readiness')
        time.sleep(.2)
    assert secret, 'No sandbox webhook signing secret received'
    (output/'signing-secret').write_text(secret)
    params = {'mode':'payment','success_url':'https://ldrecossistema.online/cliente/propostas',
        'cancel_url':'https://ldrecossistema.online/cliente/propostas',
        'line_items[0][price_data][currency]':'eur','line_items[0][price_data][unit_amount]':'100',
        'line_items[0][price_data][product_data][name]':'LDR isolated sandbox verification','line_items[0][quantity]':'1'}
    a=api('checkout/sessions',params,'ldr-sandbox-'+run_id)
    b=api('checkout/sessions',params,'ldr-sandbox-'+run_id)
    assert a['id']==b['id'] and a['amount_total']==100
    assert api('checkout/sessions/'+a['id']+'/expire',{})['status']=='expired'
    print('PASS real sandbox Checkout price, idempotent retry and expiration',flush=True)
    result=subprocess.run(cli+['trigger','checkout.session.completed',
        '--add','checkout_session:metadata[checkout_kind]=enterprise_quote',
        '--add','checkout_session:metadata[order_id]=00000000-0000-4000-8000-000000000001',
        '--add','checkout_session:metadata[customer_id]=00000000-0000-4000-8000-000000000002',
        '--add','checkout_session:metadata[catalog_key]='],capture_output=True,timeout=100)
    assert result.returncode==0, 'Stripe sandbox fixture failed'
    deadline=time.time()+30
    while time.time()<deadline and not any(json.loads(r['raw'])['type']=='checkout.session.completed' for r in receipts): time.sleep(.2)
    complete=next(json.loads(r['raw'])['data']['object'] for r in receipts if json.loads(r['raw'])['type']=='checkout.session.completed')
    remote=api('checkout/sessions/'+complete['id'])
    assert remote['payment_status']=='paid' and remote['metadata']['checkout_kind']=='enterprise_quote'
    refund=api('refunds',{'payment_intent':remote['payment_intent']})
    assert refund['status']=='succeeded'
    failed=api('payment_intents',{'amount':'100','currency':'eur','payment_method':'pm_card_chargeDeclined',
        'confirm':'true','automatic_payment_methods[enabled]':'true','automatic_payment_methods[allow_redirects]':'never'},allow_error=True)
    assert failed['error']['code']=='card_declined'
    deadline=time.time()+30
    required={'checkout.session.completed','checkout.session.expired','payment_intent.payment_failed','charge.refunded'}
    while time.time()<deadline and not required.issubset({json.loads(r['raw'])['type'] for r in receipts}): time.sleep(.2)
    assert required.issubset({json.loads(r['raw'])['type'] for r in receipts}), 'Missing signed remote webhook'
    report={'sandboxAccount':profile['account_id'],'livemode':False,'checks':['checkout','idempotency','expiration','successful fixture payment','declined test card','refund','four signed webhook types'],
        'events':sorted({json.loads(r['raw'])['type'] for r in receipts})}
    (output/'report.json').write_text(json.dumps(report,indent=2))
    print('PASS successful sandbox payment, declined test card, refund and four authentic signed webhook types',flush=True)
finally:
    listener.terminate()
    try: listener.wait(timeout=10)
    except subprocess.TimeoutExpired: listener.kill()
    server.shutdown();log.close()
