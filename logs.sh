#!/data/data/com.termux/files/usr/bin/bash

source project.env

case "$1" in
    frontend)
        pm2 logs "$FRONTEND_PM2"
        ;;
    backend)
        pm2 logs "$BACKEND_PM2"
        ;;
    web)
        pm2 logs "$WEB_PM2"
        ;;
    api)
        pm2 logs "$API_PM2"
        ;;
    *)
        echo ""
        echo "Usage:"
        echo "./logs.sh frontend"
        echo "./logs.sh backend"
        echo "./logs.sh web"
        echo "./logs.sh api"
        ;;
esac
