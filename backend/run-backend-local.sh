#!/bin/bash

# Script para correr el backend localmente
# Uso: ./run-backend-local.sh

echo "      Iniciando Backend FastAPI (Desarrollo Local)"
echo "================================================"
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "server.py" ]; then
    echo "      Error: No se encontró server.py"
    echo "   Por favor, ejecuta este script desde el directorio /backend"
    exit 1
fi

# Verificar si existe .env
if [ ! -f ".env" ]; then
    echo "      Advertencia: No se encontró archivo .env"
    echo "   Creando .env con configuración por defecto..."
    cat > .env << 'EOF'
# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB Configuration (LOCAL)
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# CORS Configuration (LOCAL)
FRONTEND_URL=http://localhost:8000
FRONTEND_DEV_URL=http://127.0.0.1:5500
CORS_ORIGINS=["http://localhost:8000","http://127.0.0.1:5500","http://192.168.56.1:8000"]

# Environment
ENVIRONMENT=development
DEBUG=True
EOF
    echo "Archivo .env creado"
fi

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "      Error: Python 3 no está instalado"
    echo "   Instala Python 3.11+ desde https://www.python.org"
    exit 1
fi

echo "Python encontrado: $(python3 --version)"
echo ""

# Verificar si las dependencias están instaladas
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "      Instalando dependencias..."
    pip install -r requirements.txt
    echo ""
fi

# Verificar si MongoDB está corriendo
echo "Verificando MongoDB..."
if ! mongosh --eval "db.version()" &>/dev/null && ! mongo --eval "db.version()" &>/dev/null; then
    echo "      Advertencia: MongoDB no parece estar corriendo"
    echo "   Asegúrate de iniciar MongoDB antes de continuar"
    echo ""
    echo "   Windows: net start MongoDB"
    echo "   Mac: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo ""
fi

# Iniciar el servidor
echo "Iniciando servidor en http://localhost:8001"
echo "Documentación API: http://localhost:8001/api/docs"
echo "Health Check: http://localhost:8001/api/health"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "================================================"
echo ""

# Correr uvicorn
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
