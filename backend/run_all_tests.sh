#!/bin/bash
# Script de testing completo para Día 5
# Ejecuta todos los tests unitarios e integración

echo "========================================"
echo "📋 TESTING COMPLETO - DÍA 5"
echo "========================================"
echo ""
echo "Fecha: $(date)"
echo "Backend: FastAPI + MongoDB"
echo ""

# Asegurarse de que el backend está corriendo
echo "🔧 Verificando servicios..."
sudo supervisorctl status backend
sudo supervisorctl status mongodb
echo ""

# Cambiar al directorio del backend
cd /app/backend

# 1. Tests Unitarios
echo "========================================"
echo "🧪 TESTS UNITARIOS"
echo "========================================"
echo ""

echo "📦 Tests de Password Utils..."
python -m pytest tests/test_password_utils.py -v --tb=short -q
echo ""

echo "📦 Tests de Validators..."
python -m pytest tests/test_validators.py -v --tb=short -q
echo ""

echo "📦 Tests de JWT Service..."
python -m pytest tests/test_jwt_service.py -v --tb=short -q
echo ""

# 2. Tests de Integración
echo "========================================"
echo "🔗 TESTS DE INTEGRACIÓN"
echo "========================================"
echo ""

echo "📡 Tests de Auth Endpoints..."
python -m pytest tests/test_auth_endpoints.py -v --tb=short -q
echo ""

echo "📡 Tests de User Endpoints..."
python -m pytest tests/test_user_endpoints.py -v --tb=short -q
echo ""

echo "📡 Tests de Progress Endpoints..."
python -m pytest tests/test_progress_endpoints.py -v --tb=short -q
echo ""

# 3. Resumen Final
echo "========================================"
echo "📊 RESUMEN FINAL"
echo "========================================"
echo ""
python -m pytest tests/ -v --tb=short --co -q | tail -5
echo ""

# 4. Ejecutar todos los tests y generar reporte
echo "Ejecutando TODOS los tests..."
python -m pytest tests/ -v --tb=short > /app/backend/test_results_day5.txt 2>&1

# Mostrar resumen
echo ""
echo "========================================"
tail -20 /app/backend/test_results_day5.txt
echo "========================================"
echo ""
echo "✅ Reporte completo guardado en: /app/backend/test_results_day5.txt"
echo ""
