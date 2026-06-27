#!/data/data/com.termux/files/usr/bin/bash

set -e

source project.env

echo "========================================"
echo "⬆️ Updating $PROJECT_NAME"
echo "========================================"

cd "$PROJECT_PATH"

echo ""
echo "📥 Pulling latest code..."
git pull

echo ""
echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "🏗 Building project..."
./build.sh

echo ""
echo "🔄 Restarting project..."
./restart.sh

echo ""
echo "========================================"
echo "✅ Update Complete!"
echo "========================================"
