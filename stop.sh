#!/data/data/com.termux/files/usr/bin/bash

source project.env

echo "========================================"
echo "🛑 Stopping $PROJECT_NAME"
echo "========================================"

pm2 delete "$FRONTEND_PM2" >/dev/null 2>&1 || true
pm2 delete "$BACKEND_PM2" >/dev/null 2>&1 || true
pm2 delete "$WEB_PM2" >/dev/null 2>&1 || true
pm2 delete "$API_PM2" >/dev/null 2>&1 || true

pm2 save

echo ""
echo "✅ $PROJECT_NAME stopped."
pm2 list
