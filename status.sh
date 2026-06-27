#!/data/data/com.termux/files/usr/bin/bash

source project.env

echo "========================================"
echo "📊 $PROJECT_NAME Status"
echo "========================================"

echo ""
echo "Local Frontend"
curl -I "http://localhost:$FRONTEND_PORT" 2>/dev/null | head -1

echo ""
echo "Local Backend"
curl "http://localhost:$BACKEND_PORT/api/health"

echo ""
echo "Public Frontend"
curl -I "https://$FRONTEND_DOMAIN" 2>/dev/null | head -1

echo ""
echo "Public Backend"
curl "https://$BACKEND_DOMAIN/api/health"

echo ""
echo "========================================"
echo "PM2 Processes"
echo "========================================"

pm2 list
