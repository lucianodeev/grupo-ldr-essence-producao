# RPC migration rollback

Every grant change must be independently reversible. If a migrated flow fails validation, restore the previous EXECUTE grant before investigating further; do not stack unrelated permission changes.