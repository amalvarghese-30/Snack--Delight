#!/data/data/com.termux/files/usr/bin/bash

set -e

source project.env

echo "========================================"
echo "🚀 Starting $PROJECT_NAME"
echo "========================================"

# Check project exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Project directory not found!"
    exit 1
fi

# Check frontend build
if [ ! -d "$PROJECT_PATH/dist" ]; then
    echo "❌ dist folder not found."
    echo "Run ./build.sh first."
    exit 1
fi

echo ""
echo "▶ Starting Frontend..."

pm2 delete "$FRONTEND_PM2" >/dev/null 2>&1 || true

pm2 start npm \
    --name "$FRONTEND_PM2" \
    --cwd "$PROJECT_PATH" \
    -- run preview -- --host 0.0.0.0 --port "$FRONTEND_PORT"

echo "Waiting for frontend..."

until curl -s "http://localhost:$FRONTEND_PORT" >/dev/null
do
    sleep 2
done

echo "✅ Frontend started."

echo ""
echo "▶ Starting Backend..."

pm2 delete "$BACKEND_PM2" >/dev/null 2>&1 || true

pm2 start npm \
    --name "$BACKEND_PM2" \
    --cwd "$PROJECT_PATH" \
    -- run start

echo "Waiting for backend..."

until curl -s "http://localhost:$BACKEND_PORT/api/health" >/dev/null
do
    sleep 2
done

echo "✅ Backend started."

echo ""
echo "▶ Starting Web Tunnel..."

pm2 delete "$WEB_PM2" >/dev/null 2>&1 || true

pm2 start bash \
    --name "$WEB_PM2" \
    -- -c "cloudflared tunnel --config ~/.cloudflared/config-snack.yml run $WEB_TUNNEL"

sleep 5

echo "✅ Web Tunnel started."

echo ""
echo "▶ Starting API Tunnel..."

pm2 delete "$API_PM2" >/dev/null 2>&1 || true

pm2 start bash \
    --name "$API_PM2" \
    -- -c "cloudflared tunnel --config ~/.cloudflared/api-snack.yml run $API_TUNNEL"

sleep 5

pm2 save

echo ""
echo "========================================"
echo "🎉 Deployment Complete!"
echo "========================================"

echo "Frontend:"
echo "https://$FRONTEND_DOMAIN"

echo ""
echo "Backend:"
echo "https://$BACKEND_DOMAIN/api/health"

echo ""
pm2 list
