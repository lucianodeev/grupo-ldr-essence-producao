# Session rule

Logout replacement must invalidate only the intended session/token and must not permit one caller to delete another user's session. Preserve expiry handling and avoid exposing session tables directly to the browser.