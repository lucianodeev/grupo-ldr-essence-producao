#!/usr/bin/env bash
set -euo pipefail
set +x

if [[ ! "${STRIPE_SECRET_KEY_TEST:-}" =~ ^(sk|rk)_test_[A-Za-z0-9]+$ ]]; then
  printf '%s\n' 'Set STRIPE_SECRET_KEY_TEST using a test key for the PR #316 account.' >&2
  exit 1
fi
stripe_test_key="$STRIPE_SECRET_KEY_TEST"
unset STRIPE_SECRET_KEY_TEST
for dependency in docker supabase stripe node npm; do
  if ! command -v "$dependency" >/dev/null; then
    printf 'Missing local dependency: %s\n' "$dependency" >&2
    exit 1
  fi
done
if [[ ! -d node_modules/@supabase/supabase-js ]]; then
  printf '%s\n' 'Run npm ci at the repository root first.' >&2
  exit 1
fi

umask 077
workdir="$(mktemp -d /tmp/ldr-hosted-e2e-XXXXXXXX)"
cleanup() {
  supabase stop --workdir "$workdir" --no-backup >/dev/null 2>&1 || true
  rm -rf -- "$workdir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
supabase init --workdir "$workdir" --yes
# The application and database must both use loopback. Allocate free local ports
# for the disposable project so an unrelated Supabase stack is left alone.
node --input-type=module - "$workdir/supabase/config.toml" <<'NODE'
import fs from "node:fs";
import net from "node:net";
const file = process.argv[2];
const leases = [];
try {
  let config = fs.readFileSync(file, "utf8");
  for (const match of config.matchAll(/^(\s*(?:port|shadow_port|inspector_port)\s*=\s*)(\d+)$/gm)) {
    const lease = net.createServer();
    await new Promise((resolve, reject) => {
      lease.once("error", reject);
      lease.listen(0, "127.0.0.1", resolve);
    });
    leases.push(lease);
    config = config.replace(match[0], match[1] + lease.address().port);
  }
  config = config.replace(/^enable_confirmations = false$/gm, "enable_confirmations = true");
  fs.writeFileSync(file, config);
} finally {
  for (const lease of leases) lease.close();
}
NODE
if ! supabase start --workdir "$workdir" --exclude storage-api,imgproxy,realtime,studio,postgres-meta,edge-runtime,logflare,vector,supavisor >"$workdir/start.log" 2>&1; then
  printf '%s\n' 'Disposable Supabase failed to start. Check the Docker daemon and CLI installation.' >&2
  exit 1
fi
supabase status --workdir "$workdir" -o json >"$workdir/status.json"
npm install --prefix "$workdir/pg" --no-audit --no-fund pg@8.23.1
npm install --prefix "$workdir/browser" --no-audit --no-fund playwright@1.56.1
"$workdir/browser/node_modules/.bin/playwright" install chromium

export AGENDA_PG_PACKAGE="$workdir/pg/package.json"
export PLAYWRIGHT_PACKAGE="$workdir/browser/package.json"
export LDR_LOCAL_SUPABASE_STATUS="$workdir/status.json"
export LDR_LOCAL_BROWSER_IDENTITIES="$workdir/identities.json"
node scripts/agenda/free-supabase-integration.mjs
STRIPE_SECRET_KEY_TEST="$stripe_test_key" \
  LDR_E2E_STRIPE_MODE=hosted LDR_E2E_CONFIRM_ISOLATED=true LDR_E2E_STRIPE_TAX=false \
  node scripts/agenda/ldr-commerce-browser-e2e.mjs
