#!/bin/sh
set -e

# This entrypoint ensures the Prisma client is generated for the container
# runtime and then applies migrations (or falls back to `prisma db push`
# when there are no migrations). It retries until the database is available.

MAX_RETRIES=20
SLEEP_SECONDS=3
i=0

echo "Generating Prisma client for container runtime..."
# generate client for the linux target inside the container (safe to run even if already generated)
npx prisma generate --schema=prisma/schema.prisma || true

echo "Waiting for database to be ready and applying migrations (if present)..."

until [ $i -ge $MAX_RETRIES ]
do
  # Try to apply migrations if migration files exist
  if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations)" ]; then
    if npx prisma migrate deploy --schema=prisma/schema.prisma; then
      echo "Migrations applied."
      break
    fi
  else
    # No migrations folder or it's empty — push schema to DB so the container can start
    echo "No migrations found in image; attempting prisma db push to sync schema..."
    if npx prisma db push --schema=prisma/schema.prisma; then
      echo "Schema pushed to database."
      break
    fi
  fi

  i=$((i+1))
  echo "DB not ready yet - retry $i/$MAX_RETRIES. Sleeping ${SLEEP_SECONDS}s..."
  sleep $SLEEP_SECONDS
done

if [ $i -ge $MAX_RETRIES ]; then
  echo "Failed to apply migrations or push schema after $MAX_RETRIES attempts, exiting."
  exit 1
fi

echo "Starting app..."
exec npm start
MAX_RETRIES=20
SLEEP_SECONDS=3
i=0

echo "Waiting for database to be ready..."

until [ $i -ge $MAX_RETRIES ]
do
  # Try to run a simple prisma command to check DB connectivity.
  if npx prisma migrate deploy; then
    echo "Migrations applied."
    break
  fi
  i=$((i+1))
  echo "DB not ready yet - retry $i/$MAX_RETRIES. Sleeping ${SLEEP_SECONDS}s..."
  sleep $SLEEP_SECONDS
done

if [ $i -ge $MAX_RETRIES ]; then
  echo "Failed to apply migrations after $MAX_RETRIES attempts, exiting."
  exit 1
fi

# Start the app
echo "Starting app..."
exec npm start