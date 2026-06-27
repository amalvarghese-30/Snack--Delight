#!/data/data/com.termux/files/usr/bin/bash

set -e

source project.env

BACKUP_DIR="$HOME/deployments/backups"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

BACKUP_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"

echo "========================================"
echo "📦 Creating Backup"
echo "========================================"

cd "$(dirname "$PROJECT_PATH")"

tar -czf "$BACKUP_DIR/$BACKUP_NAME" "$(basename "$PROJECT_PATH")"

echo ""
echo "✅ Backup created successfully."
echo ""
echo "$BACKUP_DIR/$BACKUP_NAME"
