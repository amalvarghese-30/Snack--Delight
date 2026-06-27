#!/data/data/com.termux/files/usr/bin/bash

source project.env

echo "=================================="
echo "Building $PROJECT_NAME"
echo "=================================="

cd "$PROJECT_PATH"

echo "Removing old build..."
rm -rf dist

echo "Building..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "Build completed successfully."
else
    echo ""
    echo "Build failed."
    exit 1
fi
