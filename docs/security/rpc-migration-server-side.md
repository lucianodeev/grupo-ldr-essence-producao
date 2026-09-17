# Server-side migration principle

Privileged operations should move behind server-side code using the service role only where required, with explicit authorization and input validation. Do not expose the service-role credential to browser code.