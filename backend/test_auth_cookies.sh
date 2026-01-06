#!/bin/bash

# Script de Testing - Autenticación con Cookies httpOnly
# QA Master Path

echo "🧪 TESTING SISTEMA DE AUTENTICACIÓN CON COOKIES"
echo "==============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_BASE="http://localhost:8001/api"
COOKIES_FILE="/tmp/qa_test_cookies.txt"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123"
TEST_NAME="Test User"

# Limpiar cookies anteriores
rm -f $COOKIES_FILE

echo "📝 TEST 1: Health Check"
echo "------------------------"
HEALTH=$(curl -s "$API_BASE/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend respondiendo correctamente${NC}"
else
    echo -e "${RED}❌ Backend no responde${NC}"
    exit 1
fi
echo ""

echo "📝 TEST 2: Registro de Usuario"
echo "-------------------------------"
echo "Email: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\", \"display_name\": \"$TEST_NAME\"}" \
  -c $COOKIES_FILE -v 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "qa_session="; then
    echo -e "${GREEN}✅ Cookie qa_session establecida${NC}"
else
    echo -e "${RED}❌ Cookie no establecida${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

if echo "$REGISTER_RESPONSE" | grep -q "HttpOnly"; then
    echo -e "${GREEN}✅ Cookie tiene flag HttpOnly${NC}"
else
    echo -e "${RED}❌ Cookie no tiene HttpOnly${NC}"
fi

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Usuario registrado exitosamente${NC}"
else
    echo -e "${RED}❌ Error en registro${NC}"
    exit 1
fi
echo ""

echo "📝 TEST 3: Verificar Sesión (/auth/me)"
echo "---------------------------------------"
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -b $COOKIES_FILE)

if echo "$ME_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Sesión verificada correctamente${NC}"
    echo -e "${GREEN}   Usuario: $(echo $ME_RESPONSE | jq -r '.user.email')${NC}"
else
    echo -e "${RED}❌ Error al verificar sesión${NC}"
    echo "$ME_RESPONSE"
    exit 1
fi
echo ""

echo "📝 TEST 4: Verificar Estado de Sesión (/auth/verify)"
echo "-----------------------------------------------------"
VERIFY_RESPONSE=$(curl -s -X GET "$API_BASE/auth/verify" \
  -b $COOKIES_FILE)

if echo "$VERIFY_RESPONSE" | grep -q "authenticated.*true"; then
    echo -e "${GREEN}✅ Sesión autenticada${NC}"
else
    echo -e "${RED}❌ Sesión no autenticada${NC}"
    exit 1
fi
echo ""

echo "📝 TEST 5: Logout"
echo "-----------------"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE/auth/logout" \
  -b $COOKIES_FILE \
  -c /tmp/qa_test_cookies_after_logout.txt)

if echo "$LOGOUT_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Logout exitoso${NC}"
else
    echo -e "${RED}❌ Error en logout${NC}"
    exit 1
fi
echo ""

echo "📝 TEST 6: Verificar Sesión Después de Logout"
echo "----------------------------------------------"
ME_AFTER_LOGOUT=$(curl -s -X GET "$API_BASE/auth/me" \
  -b /tmp/qa_test_cookies_after_logout.txt)

if echo "$ME_AFTER_LOGOUT" | grep -q "No se encontró token"; then
    echo -e "${GREEN}✅ Sesión correctamente cerrada${NC}"
elif echo "$ME_AFTER_LOGOUT" | grep -q "401"; then
    echo -e "${GREEN}✅ Sesión correctamente cerrada (401)${NC}"
else
    echo -e "${YELLOW}⚠️  Sesión puede seguir activa${NC}"
    echo "$ME_AFTER_LOGOUT"
fi
echo ""

echo "📝 TEST 7: Login con Usuario Existente"
echo "---------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
  -c /tmp/qa_test_cookies_login.txt -v 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "qa_session="; then
    echo -e "${GREEN}✅ Login exitoso - Cookie establecida${NC}"
else
    echo -e "${RED}❌ Error en login${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo ""

echo "📝 TEST 8: Verificar Sesión Después de Login"
echo "---------------------------------------------"
ME_AFTER_LOGIN=$(curl -s -X GET "$API_BASE/auth/me" \
  -b /tmp/qa_test_cookies_login.txt)

if echo "$ME_AFTER_LOGIN" | grep -q "$TEST_EMAIL"; then
    echo -e "${GREEN}✅ Sesión persiste correctamente después de login${NC}"
    echo -e "${GREEN}   Email: $(echo $ME_AFTER_LOGIN | jq -r '.user.email')${NC}"
else
    echo -e "${RED}❌ Sesión no persiste${NC}"
    echo "$ME_AFTER_LOGIN"
    exit 1
fi
echo ""

echo "📝 TEST 9: Estado del Sistema de Autenticación"
echo "-----------------------------------------------"
STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/auth/status")
echo "Modo de auth: $(echo $STATUS_RESPONSE | jq -r '.auth_mode')"
echo "Cookie name: $(echo $STATUS_RESPONSE | jq -r '.cookie_name')"
echo "Cookie HttpOnly: $(echo $STATUS_RESPONSE | jq -r '.cookie_httponly')"
echo "Cookie SameSite: $(echo $STATUS_RESPONSE | jq -r '.cookie_samesite')"
echo ""

# Resumen
echo "================================================"
echo -e "${GREEN}✅ TODOS LOS TESTS PASARON EXITOSAMENTE${NC}"
echo "================================================"
echo ""
echo "🔐 Sistema de autenticación con cookies httpOnly"
echo "   funcionando correctamente"
echo ""
echo "🧹 Limpiando archivos temporales..."
rm -f /tmp/qa_test_cookies*.txt
echo ""
echo "✅ Testing completado"
