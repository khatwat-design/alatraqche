#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./storage/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_DATABASE:-alatraqche}"
DB_USER="${DB_USERNAME:-alatraqche}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

mkdir -p "$BACKUP_DIR"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-acl \
  -F c -f "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

echo "✅ DB backup: $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

tar -czf "$BACKUP_DIR/storage_${TIMESTAMP}.tar.gz" \
  -C "$(dirname storage)" "$(basename storage)/app" \
  "$(basename storage)/logs"

echo "✅ Storage backup: $BACKUP_DIR/storage_${TIMESTAMP}.tar.gz"

find "$BACKUP_DIR" -name "*.dump" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "✅ Old backups cleaned (retention: $RETENTION_DAYS days)"
