#!/data/data/com.termux/files/usr/bin/bash

set -e

source project.env

BACKUP_DIR="$HOME/deployments/backups"

echo "========================================"
echo "♻️ Restore $PROJECT_NAME"
echo "========================================"

echo ""
echo "Available backups:"
echo ""

ls -lh "$BACKUP_DIR" | grep "$PROJECT_NAME"

echo ""
read -p "Enter backup filename: " BACKUP

if [ ! -f "$BACKUP_DIR/$BACKUP" ]; then
    echo ""
    echo "❌ Backup not found."
    exit 1
fi

echo ""
echo "Stopping project..."

./stop.sh

cd "$(dirname "$PROJECT_PATH")"

echo ""
echo "Removing current project..."

rm -rf "$PROJECT_PATH"

echo ""
echo "Restoring backup..."

tar -xzf "$BACKUP_DIR/$BACKUP"

echo ""
echo "Starting project..."

cd "$PROJECT_PATH"

./start.sh

echo ""
echo "========================================"
echo "✅ Restore Complete!"
echo "========================================"
