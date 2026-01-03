#!/bin/bash

# Script para iniciar el servidor de desarrollo
# Uso: ./start-dev-server.sh

echo "🚀 Iniciando servidor de desarrollo..."
echo "📂 Directorio: /app"
echo "🌐 Puerto: 8000"
echo ""

# Matar cualquier proceso anterior en el puerto 8000
pkill -f "http-server.*8000" 2>/dev/null || true
sleep 1

# Iniciar servidor
cd /app
http-server -p 8000 -c-1 &

echo ""
echo "✅ Servidor iniciado correctamente!"
echo ""
echo "🌐 Abre tu navegador en: http://localhost:8000"
echo "🔐 Página de autenticación: http://localhost:8000/app/auth.html"
echo ""
echo "Para detener el servidor:"
echo "  pkill -f http-server"
echo ""
echo "📋 Para ver logs, revisa la consola del navegador (F12)"
