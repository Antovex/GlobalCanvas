#!/bin/sh
set -e

# Retry loop for running migrations (or db push). Adjust attempts / sleep as needed.
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