#!/bin/bash
# Script de testing manual de endpoints con curl
# Día 5 - Testing Backend Completo

echo "========================================"
echo "🧪 TESTING MANUAL DE ENDPOINTS"
echo "========================================"
echo ""

BASE_URL="http://localhost:8001"
EMAIL="manual_test_$(date +%s)@example.com"
PASSWORD="TestPassword123"
DISPLAY_NAME="Manual Test User"

echo "📧 Email de prueba: $EMAIL"
echo ""

# 1. REGISTRO
echo "1️⃣ POST /api/auth/register - Registro de usuario"
echo "----------------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"display_name\":\"$DISPLAY_NAME\",\"password\":\"$PASSWORD\"}")

echo "$REGISTER_RESPONSE" | python -m json.tool | head -30
echo ""

# Extraer token
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "🔑 Access Token obtenido: ${ACCESS_TOKEN:0:50}..."
echo ""

# 2. LOGIN
echo "2️⃣ POST /api/auth/login - Login"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE" | python -m json.tool | head -20
echo ""

# 3. PERFIL DE USUARIO
echo "3️⃣ GET /api/user/me - Obtener perfil"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python -m json.tool
echo ""

# 4. ACTUALIZAR PERFIL
echo "4️⃣ PUT /api/user/me - Actualizar perfil"
echo "----------------------------------------"
curl -s -X PUT "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Updated Name","photo_url":"https://example.com/photo.jpg"}' | python -m json.tool
echo ""

# 5. ACTUALIZAR CONFIGURACIÓN
echo "5️⃣ PUT /api/user/me/settings - Actualizar configuración"
echo "----------------------------------------"
curl -s -X PUT "$BASE_URL/api/user/me/settings" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notifications":false,"theme":"light","language":"en"}' | python -m json.tool
echo ""

# 6. OBTENER PROGRESO
echo "6️⃣ GET /api/progress - Obtener progreso"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/progress" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python -m json.tool
echo ""

# 7. ACTUALIZAR MÓDULO
echo "7️⃣ PUT /api/progress/module - Actualizar módulo"
echo "----------------------------------------"
curl -s -X PUT "$BASE_URL/api/progress/module" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"module_id":"1","is_completed":true}' | python -m json.tool
echo ""

# 8. ACTUALIZAR SUBTAREA
echo "8️⃣ PUT /api/progress/subtask - Actualizar subtarea"
echo "----------------------------------------"
curl -s -X PUT "$BASE_URL/api/progress/subtask" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"module_id":"1","task_index":0,"is_completed":true}' | python -m json.tool
echo ""

# 9. ACTUALIZAR NOTA
echo "9️⃣ PUT /api/progress/note - Actualizar nota"
echo "----------------------------------------"
curl -s -X PUT "$BASE_URL/api/progress/note" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"module_id":"1","note_text":"Esta es mi nota de prueba"}' | python -m json.tool
echo ""

# 10. AGREGAR BADGE
echo "🔟 POST /api/progress/badge - Agregar badge"
echo "----------------------------------------"
curl -s -X POST "$BASE_URL/api/progress/badge" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"badge_name":"first-steps"}' | python -m json.tool
echo ""

# 11. AGREGAR XP
echo "1️⃣1️⃣ POST /api/progress/xp - Agregar XP"
echo "----------------------------------------"
curl -s -X POST "$BASE_URL/api/progress/xp" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100}' | python -m json.tool
echo ""

# 12. SINCRONIZAR PROGRESO
echo "1️⃣2️⃣ POST /api/progress/sync - Sincronizar progreso"
echo "----------------------------------------"
curl -s -X POST "$BASE_URL/api/progress/sync" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"modules":{"1":true,"2":true},"subtasks":{"1-0":true,"2-0":true},"notes":{"1":"Nota 1"},"badges":["core","technical"],"xp":250}' | python -m json.tool
echo ""

# 13. ESTADÍSTICAS DE PROGRESO
echo "1️⃣3️⃣ GET /api/progress/stats - Estadísticas de progreso"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/progress/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python -m json.tool
echo ""

# 14. ESTADÍSTICAS DE USUARIO
echo "1️⃣4️⃣ GET /api/user/stats - Estadísticas de usuario"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/user/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python -m json.tool
echo ""

# 15. HEALTH CHECK
echo "1️⃣5️⃣ GET /api/health - Health check"
echo "----------------------------------------"
curl -s -X GET "$BASE_URL/api/health" | python -m json.tool
echo ""

echo "========================================"
echo "✅ TESTING MANUAL COMPLETADO"
echo "========================================"
echo ""
echo "📧 Usuario de prueba: $EMAIL"
echo "🔑 Token (primeros 50 chars): ${ACCESS_TOKEN:0:50}..."
echo ""
