#!/bin/sh

# Check if the users table exists
TABLE_EXISTS=$(psql $DATABASE_URL -tAc "SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = '$EXPOSED_SCHEMA' AND table_name = 'users'
);")

if [ "$STAGE" = "production" ]; then
  echo "Running graphile-migrate migrate..."
  graphile-migrate migrate
  exit 0
fi

if [ "$TABLE_EXISTS" = "f" ]; then
  echo "Table $EXPOSED_SCHEMA.users does not exist. Running graphile-migrate reset..."
  graphile-migrate reset --erase
  echo "Creating superadmin..."
  graphile-migrate run /db-admin/migrations/create-superadmin.sql
else
  echo "Table $EXPOSED_SCHEMA.users exists."
fi

echo "Running graphile-migrate watch..."
graphile-migrate watch