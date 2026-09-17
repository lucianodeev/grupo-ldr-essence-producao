# SECURITY DEFINER search_path

Any SECURITY DEFINER function retained or introduced must use an explicit safe `search_path` appropriate to its dependencies, including `pg_temp` ordering where applicable.