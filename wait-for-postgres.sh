#!/usr/bin/env sh
# wait-for-postgres.sh
# Adapted from https://docs.docker.com/compose/startup-order/

set -e

host="$1"
shift
cmd="$@"

until pg_isready -h "$host" -p "5432" > /dev/null 2> /dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
