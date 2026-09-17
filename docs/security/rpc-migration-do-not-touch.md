# Do not touch without replacement

Authenticated authorization helpers such as `is_authorized`, `is_superadmin`, and `is_seller_admin` participate in the current authorization model and must not lose authenticated execution until their dependency paths are replaced.