# RPC migration checklist

For each RPC: verify code callers; verify database callers; implement replacement; test replacement; revoke only the minimum grant; run Security Advisor; run Performance Advisor; keep rollback path.