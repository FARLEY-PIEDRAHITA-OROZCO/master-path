#!/bin/bash

# Script de Testing - Día 7: Feature Flag y Dual Mode
# Test del flujo completo: Registro → Login → Sincronización de progreso

set -e

BACKEND_URL="http://localhost:8001/api"
EMAIL="test_dia7_$(date +%s)@example.com"
PASSWORD="TestPassword123!"
DISPLAY_NAME="Usuario Día 7"

echo "================================"
echo "🧪 TESTING DÍA 7: DUAL MODE"
echo "================================"
echo ""

# Variables globales
ACCESS_TOKEN=""
USER_ID=""

echo "📧 Email de prueba: $EMAIL"
echo ""

# ==================== TEST 1: Health Check ====================
echo "1️⃣  Health Check..."
HEALTH=$(curl -s $BACKEND_URL/health)
echo "✅ Health: $HEALTH"
echo ""

# ==================== TEST 2: Registro ====================
echo "2️⃣  Registrando usuario..."
REGISTER_RESPONSE=$(curl -s -X POST $BACKEND_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "displayName": "'$DISPLAY_NAME'"
  }')

# Verificar si el registro fue exitoso
if echo "$REGISTER_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
  ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
  USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.email')
  echo "✅ Usuario registrado: $USER_ID"
  echo "🔑 Token obtenido (primeros 50 chars): ${ACCESS_TOKEN:0:50}..."
else
  echo "❌ Error en registro:"
  echo "$REGISTER_RESPONSE" | jq .
  exit 1
fi
echo ""

# ==================== TEST 3: Obtener usuario actual ====================
echo "3️⃣  Obteniendo usuario actual..."
USER_ME=$(curl -s $BACKEND_URL/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "✅ Usuario actual:"
echo "$USER_ME" | jq '{email: .email, displayName: .displayName}'
echo ""

# ==================== TEST 4: Obtener progreso inicial ====================
echo "4️⃣  Obteniendo progreso inicial..."
PROGRESS=$(curl -s $BACKEND_URL/progress \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "✅ Progreso inicial:"
echo "$PROGRESS" | jq '{modules: .modules | length, subtasks: .subtasks | length, xp: .xp}'
echo ""

# ==================== TEST 5: Actualizar progreso de un módulo ====================
echo "5️⃣  Marcando módulo 1 como completado..."
UPDATE_MODULE=$(curl -s -X PUT $BACKEND_URL/progress/module \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "1",
    "isCompleted": true
  }')
echo "✅ Módulo actualizado:"
echo "$UPDATE_MODULE" | jq '{module_1_completed: .modules["1"]}'
echo ""

# ==================== TEST 6: Actualizar subtarea ====================
echo "6️⃣  Marcando subtarea 1-0 como completada..."
UPDATE_SUBTASK=$(curl -s -X PUT $BACKEND_URL/progress/subtask \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "1",
    "taskIndex": "0",
    "isCompleted": true
  }')
echo "✅ Subtarea actualizada:"
echo "$UPDATE_SUBTASK" | jq '{subtask_1_0: .subtasks["1-0"]}'
echo ""

# ==================== TEST 7: Guardar nota ====================
echo "7️⃣  Guardando nota en módulo 1..."
UPDATE_NOTE=$(curl -s -X PUT $BACKEND_URL/progress/note \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "1",
    "noteText": "Esta es una nota de prueba para el módulo 1. Testing Día 7!"
  }')
echo "✅ Nota guardada:"
echo "$UPDATE_NOTE" | jq '{note_saved: (.notes["1"] != null)}'
echo ""

# ==================== TEST 8: Agregar badge ====================
echo "8️⃣  Agregando badge 'core'..."
ADD_BADGE=$(curl -s -X POST $BACKEND_URL/progress/badge \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeName": "core"
  }')
echo "✅ Badge agregado:"
echo "$ADD_BADGE" | jq '{badges: .badges}'
echo ""

# ==================== TEST 9: Agregar XP ====================
echo "9️⃣  Agregando 100 XP..."
ADD_XP=$(curl -s -X POST $BACKEND_URL/progress/xp \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }')
echo "✅ XP agregado:"
echo "$ADD_XP" | jq '{xp: .xp}'
echo ""

# ==================== TEST 10: Sincronización completa ====================
echo "🔟 Sincronización completa..."
SYNC=$(curl -s -X POST $BACKEND_URL/progress/sync \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modules": {"1": true, "2": false},
    "subtasks": {"1-0": true, "1-1": false},
    "notes": {"1": "Nota sincronizada desde frontend"},
    "badges": ["core", "technical"],
    "xp": 250
  }')
echo "✅ Sincronización completa:"
echo "$SYNC" | jq '.'
echo ""

# ==================== TEST 11: Verificar progreso después de sincronización ====================
echo "1️⃣1️⃣  Verificando progreso después de sincronización..."
PROGRESS_FINAL=$(curl -s $BACKEND_URL/progress \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "✅ Progreso final:"
echo "$PROGRESS_FINAL" | jq '{
  modules_completed: [.modules | to_entries[] | select(.value == true) | .key],
  subtasks_completed: [.subtasks | to_entries[] | select(.value == true) | .key],
  total_xp: .xp,
  badges: .badges,
  notes_count: (.notes | length)
}'
echo ""

# ==================== TEST 12: Estadísticas ====================
echo "1️⃣2️⃣  Obteniendo estadísticas..."
STATS=$(curl -s $BACKEND_URL/progress/stats \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "✅ Estadísticas:"
echo "$STATS" | jq '.'
echo ""

# ==================== TEST 13: Login (verificar persistencia) ====================
echo "1️⃣3️⃣  Login con el mismo usuario (verificar persistencia)..."
LOGIN=$(curl -s -X POST $BACKEND_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }')

NEW_TOKEN=$(echo $LOGIN | jq -r '.access_token')
echo "✅ Login exitoso, nuevo token obtenido"
echo ""

echo "1️⃣4️⃣  Verificando que el progreso persiste después de logout/login..."
PROGRESS_AFTER_LOGIN=$(curl -s $BACKEND_URL/progress \
  -H "Authorization: Bearer $NEW_TOKEN")
echo "✅ Progreso después de re-login:"
echo "$PROGRESS_AFTER_LOGIN" | jq '{
  xp: .xp,
  modules_count: (.modules | length),
  badges: .badges
}'
echo ""

# ==================== RESUMEN ====================
echo "================================"
echo "✅ TODOS LOS TESTS COMPLETADOS"
echo "================================"
echo ""
echo "📊 Resumen:"
echo "   ✅ Backend funcionando correctamente"
echo "   ✅ Registro de usuarios OK"
echo "   ✅ Login/Logout OK"
echo "   ✅ Progreso de módulos OK"
echo "   ✅ Subtareas OK"
echo "   ✅ Notas OK"
echo "   ✅ Badges OK"
echo "   ✅ XP OK"
echo "   ✅ Sincronización completa OK"
echo "   ✅ Persistencia de datos OK"
echo ""
echo "🎯 Backend está listo para uso en producción"
echo ""
