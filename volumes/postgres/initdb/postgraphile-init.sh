#!/bin/bash
set -e

# Create basic roles and schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" "${POSTGRES_DB}" <<-EOSQL
    -- Create superadmin role
    CREATE ROLE superadmin WITH SUPERUSER;

    -- Create PostGraphile user
    CREATE ROLE ${POSTGRAPHILE_USER} WITH LOGIN PASSWORD '${POSTGRAPHILE_PASSWORD}';
    -- Grant all privileges on the database to the PostGraphile user
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRAPHILE_USER};
    GRANT superadmin TO ${POSTGRAPHILE_USER};

    CREATE ROLE anonymous;
    GRANT anonymous TO ${POSTGRAPHILE_USER};

    CREATE ROLE app_user;
    GRANT app_user TO ${POSTGRAPHILE_USER};

    -- Create the exposed schema if necessary
    CREATE SCHEMA IF NOT EXISTS ${EXPOSED_SCHEMA};
    -- Grant all privileges on the exposed schema to the PostGraphile user
    ALTER SCHEMA ${EXPOSED_SCHEMA} OWNER TO ${POSTGRAPHILE_USER};
EOSQL
