#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

set -a
source .env
set +a

TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/student-tracker-backups}"
COMPOSE_FILE="${COMPOSE_FILE_PATH:-docker-compose.prod.yml}"
BACKUP_FILE="${BACKUP_DIR}/studenttracker_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

docker compose --env-file .env -f "$COMPOSE_FILE" exec -T postgres sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$BACKUP_FILE"

echo "Backup saved to $BACKUP_FILE"
