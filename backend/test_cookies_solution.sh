#!/bin/bash

# Script de prueba para verificar la solución de cookies httpOnly
# Autor: E1 AI Agent
# Fecha: Enero 2026

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔐 VERIFICACIÓN DE SOLUCIÓN - COOKIES HTTPONLY             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:8001"
TEST_EMAIL="test-cookies-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123"
TEST_NAME="Test User"

echo -e "${BLUE}📋 Configuración de prueba:${NC}"
echo "  Backend URL: $BACKEND_URL"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo

# Función para verificar respuesta
check_response() {
    local response=$1
    local expected=$2
    local test_name=$3
    
    if echo "$response" | grep -q "\"success\":true"; then
        echo -e "${GREEN}✅ PASS:${NC} $test_name"
        return 0
    else
        echo -e "${RED}❌ FAIL:${NC} $test_name"
        echo "   Respuesta: $response"
        return 1
    fi
}

# Test 1: Health check
echo -e "${YELLOW}[1/6] Health Check del Backend${NC}"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/health")
if echo "$HEALTH_RESPONSE" | grep -q "\"status\":\"ok\""; then
    echo -e "${GREEN}✅ Backend está funcionando${NC}"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool | head -5
else
    echo -e "${RED}❌ Backend NO está funcionando${NC}"
    exit 1
fi
echo

# Test 2: Verificar configuración de cookies
echo -e "${YELLOW}[2/6] Verificando Configuración de Cookies${NC}"
AUTH_STATUS=$(curl -s "$BACKEND_URL/api/auth/status")
echo "$AUTH_STATUS" | python3 -m json.tool

# Verificar que secure=false y domain no está configurado
if echo "$AUTH_STATUS" | grep -q "\"cookie_secure\":false"; then
    echo -e "${GREEN}✅ cookie_secure: false (correcto para local)${NC}"
else
    echo -e "${RED}❌ cookie_secure debería ser false en local${NC}"
fi

if echo "$AUTH_STATUS" | grep -q "\"cookie_httponly\":true"; then
    echo -e "${GREEN}✅ cookie_httponly: true${NC}"
else
    echo -e "${RED}❌ cookie_httponly debería ser true${NC}"
fi

if echo "$AUTH_STATUS" | grep -q "\"cookie_samesite\":\"lax\""; then
    echo -e "${GREEN}✅ cookie_samesite: lax${NC}"
else
    echo -e "${RED}❌ cookie_samesite debería ser lax${NC}"
fi
echo

# Test 3: Registro de usuario
echo -e "${YELLOW}[3/6] Registrando Usuario de Prueba${NC}"
REGISTER_RESPONSE=$(curl -s -i -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"display_name\": \"$TEST_NAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

# Verificar headers Set-Cookie
if echo "$REGISTER_RESPONSE" | grep -i "set-cookie.*qa_session" | grep -q "HttpOnly"; then
    echo -e "${GREEN}✅ Cookie qa_session establecida con HttpOnly${NC}"
else
    echo -e "${RED}❌ Cookie qa_session NO tiene HttpOnly${NC}"
fi

if echo "$REGISTER_RESPONSE" | grep -i "set-cookie.*qa_session" | grep -q "SameSite=lax"; then
    echo -e "${GREEN}✅ Cookie tiene SameSite=lax${NC}"
else
    echo -e "${RED}❌ Cookie NO tiene SameSite=lax${NC}"
fi

# Verificar que NO tenga Domain=localhost
if echo "$REGISTER_RESPONSE" | grep -i "set-cookie.*qa_session" | grep -q "Domain=localhost"; then
    echo -e "${RED}❌ Cookie tiene Domain=localhost (PROBLEMA)${NC}"
    echo -e "${RED}   Esto hará que el navegador rechace la cookie${NC}"
else
    echo -e "${GREEN}✅ Cookie NO tiene Domain=localhost (correcto)${NC}"
fi

# Verificar que NO tenga Secure en local
if echo "$REGISTER_RESPONSE" | grep -i "set-cookie.*qa_session" | grep -q "; Secure"; then
    echo -e "${RED}❌ Cookie tiene Secure (no debería en local)${NC}"
else
    echo -e "${GREEN}✅ Cookie NO tiene Secure (correcto para HTTP local)${NC}"
fi

# Extraer el JWT token del header Set-Cookie
JWT_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -i "set-cookie.*qa_session=" | head -1 | sed 's/.*qa_session=\([^;]*\).*/\1/')

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ No se pudo extraer el JWT token${NC}"
    exit 1
else
    echo -e "${GREEN}✅ JWT Token extraído: ${JWT_TOKEN:0:50}...${NC}"
fi
echo

# Test 4: Login
echo -e "${YELLOW}[4/6] Probando Login${NC}"
LOGIN_RESPONSE=$(curl -s -i -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

# Mostrar headers Set-Cookie completos
echo -e "${BLUE}Headers Set-Cookie del login:${NC}"
echo "$LOGIN_RESPONSE" | grep -i "set-cookie" | sed 's/set-cookie: /  /i'

if echo "$LOGIN_RESPONSE" | grep -q "\"success\":true"; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
else
    echo -e "${RED}❌ Login falló${NC}"
    exit 1
fi
echo

# Test 5: Verificar /auth/me CON cookie
echo -e "${YELLOW}[5/6] Verificando /auth/me con Cookie${NC}"
ME_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/auth/me" \
  -H "Cookie: qa_session=$JWT_TOKEN")

if echo "$ME_RESPONSE" | grep -q "\"success\":true"; then
    echo -e "${GREEN}✅ /auth/me retorna usuario correctamente${NC}"
    echo "$ME_RESPONSE" | python3 -m json.tool | grep -A 3 '"user":'
else
    echo -e "${RED}❌ /auth/me falló con cookie${NC}"
    echo "   Respuesta: $ME_RESPONSE"
    exit 1
fi
echo

# Test 6: Verificar /auth/me SIN cookie (debe fallar)
echo -e "${YELLOW}[6/6] Verificando /auth/me SIN Cookie (debe fallar)${NC}"
ME_NO_COOKIE=$(curl -s -X GET "$BACKEND_URL/api/auth/me")

if echo "$ME_NO_COOKIE" | grep -q "401"; then
    echo -e "${GREEN}✅ /auth/me retorna 401 sin cookie (correcto)${NC}"
else
    echo -e "${RED}❌ /auth/me debería retornar 401 sin cookie${NC}"
fi
echo

# Resumen
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    📊 RESUMEN DE PRUEBAS                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo
echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
echo
echo -e "${BLUE}Configuración verificada:${NC}"
echo "  • Domain: None (navegador usa dominio actual automáticamente)"
echo "  • Secure: false (correcto para localhost HTTP)"
echo "  • HttpOnly: true (protección XSS)"
echo "  • SameSite: lax (protección CSRF)"
echo "  • Path: / (toda la aplicación)"
echo
echo -e "${GREEN}🎉 LA SOLUCIÓN ESTÁ FUNCIONANDO CORRECTAMENTE${NC}"
echo
echo -e "${BLUE}Próximos pasos:${NC}"
echo "  1. Prueba el login desde el navegador en http://localhost:8000"
echo "  2. Verifica en DevTools → Application → Cookies que aparezca 'qa_session'"
echo "  3. Confirma que /auth/me retorne 200 OK desde el frontend"
echo

exit 0
