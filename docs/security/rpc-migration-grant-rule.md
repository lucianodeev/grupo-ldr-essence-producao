# Grant rule

After migration, grant EXECUTE only to roles that actually require the function. Prefer service_role for internal privileged helpers and authenticated only where the application authorization model explicitly requires direct authenticated execution.