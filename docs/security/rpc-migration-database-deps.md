# Database dependencies

Function-body references and catalog dependencies must be checked before grant changes. PL/pgSQL dependencies may not be fully represented in `pg_depend`, so use function-definition inspection as an additional signal.