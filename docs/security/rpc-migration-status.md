# RPC migration status

Production database permissions: unchanged.

Next implementation target: identify a concrete browser caller and replace one low-risk anonymous SECURITY DEFINER RPC with a server-side path before revoking its anonymous grant.