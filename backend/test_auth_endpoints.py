"""
Script de testing para endpoints de autenticación
Prueba todos los endpoints /api/auth/*
"""
import sys
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"

def print_test_header(test_name):
    """Imprimir encabezado de test"""
    print("\n" + "="*60)
    print(f"🧪 TEST: {test_name}")
    print("="*60)

def print_result(passed, message):
    """Imprimir resultado de test"""
    if passed:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")
    return passed

# Variables globales para almacenar tokens
test_user_email = f"testuser_{datetime.now().timestamp()}@example.com"
test_user_password = "TestPassword123"
access_token = None
refresh_token = None
user_id = None


def test_register():
    """Test: Registro de usuario"""
    global access_token, refresh_token, user_id
    
    print_test_header("Registro de Usuario")
    
    data = {
        "email": test_user_email,
        "display_name": "Test User",
        "password": test_user_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
        result = response.json()
        
        if response.status_code == 201:
            if result.get("success") and result.get("access_token"):
                access_token = result["access_token"]
                refresh_token = result["refresh_token"]
                user_id = result["user"]["id"]
                print_result(True, "Usuario registrado correctamente")
                print(f"   User ID: {user_id}")
                print(f"   Email: {result['user']['email']}")
                return True
            else:
                print_result(False, "Respuesta incompleta")
                print(json.dumps(result, indent=2))
                return False
        else:
            print_result(False, f"Status code: {response.status_code}")
            print(json.dumps(result, indent=2))
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_register_duplicate():
    """Test: Registro duplicado (debe fallar)"""
    print_test_header("Registro Duplicado (debe fallar)")
    
    data = {
        "email": test_user_email,
        "display_name": "Duplicate User",
        "password": test_user_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
        
        if response.status_code == 400:
            print_result(True, "Registro duplicado rechazado correctamente")
            return True
        else:
            print_result(False, f"Debería fallar pero status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_login():
    """Test: Login de usuario"""
    global access_token, refresh_token
    
    print_test_header("Login de Usuario")
    
    data = {
        "email": test_user_email,
        "password": test_user_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
        result = response.json()
        
        if response.status_code == 200:
            if result.get("success") and result.get("access_token"):
                access_token = result["access_token"]
                refresh_token = result["refresh_token"]
                print_result(True, "Login exitoso")
                print(f"   Access token: {access_token[:50]}...")
                return True
            else:
                print_result(False, "Respuesta incompleta")
                return False
        else:
            print_result(False, f"Status code: {response.status_code}")
            print(json.dumps(result, indent=2))
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_login_wrong_password():
    """Test: Login con contraseña incorrecta (debe fallar)"""
    print_test_header("Login con Contraseña Incorrecta (debe fallar)")
    
    data = {
        "email": test_user_email,
        "password": "WrongPassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
        
        if response.status_code == 401:
            print_result(True, "Login con contraseña incorrecta rechazado")
            return True
        else:
            print_result(False, f"Debería fallar pero status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_get_me():
    """Test: Obtener información del usuario autenticado"""
    print_test_header("Obtener Usuario Actual (/me)")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        result = response.json()
        
        if response.status_code == 200:
            if result.get("success") and result.get("user"):
                print_result(True, "Información del usuario obtenida")
                print(f"   Email: {result['user']['email']}")
                print(f"   Display Name: {result['user']['display_name']}")
                return True
            else:
                print_result(False, "Respuesta incompleta")
                return False
        else:
            print_result(False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_verify_token():
    """Test: Verificar token"""
    print_test_header("Verificar Token")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/auth/verify", headers=headers)
        result = response.json()
        
        if response.status_code == 200:
            if result.get("valid") and result.get("user_id") == user_id:
                print_result(True, "Token válido")
                print(f"   User ID: {result['user_id']}")
                return True
            else:
                print_result(False, "Token inválido")
                return False
        else:
            print_result(False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_refresh_token():
    """Test: Refrescar token"""
    global access_token
    
    print_test_header("Refrescar Token")
    
    data = {
        "refresh_token": refresh_token
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/refresh", json=data)
        result = response.json()
        
        if response.status_code == 200:
            if result.get("success") and result.get("access_token"):
                old_token = access_token[:30]
                access_token = result["access_token"]
                new_token = access_token[:30]
                print_result(True, "Token refrescado correctamente")
                print(f"   Old: {old_token}...")
                print(f"   New: {new_token}...")
                return True
            else:
                print_result(False, "Respuesta incompleta")
                return False
        else:
            print_result(False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_logout():
    """Test: Logout"""
    print_test_header("Logout")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/logout", headers=headers)
        result = response.json()
        
        if response.status_code == 200:
            if result.get("success"):
                print_result(True, "Logout exitoso")
                return True
            else:
                print_result(False, "Respuesta incompleta")
                return False
        else:
            print_result(False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def test_protected_without_token():
    """Test: Acceso a endpoint protegido sin token (debe fallar)"""
    print_test_header("Acceso sin Token (debe fallar)")
    
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        if response.status_code == 403:
            print_result(True, "Acceso sin token rechazado")
            return True
        else:
            print_result(False, f"Debería fallar pero status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {e}")
        return False


def main():
    """Ejecutar todos los tests"""
    print("\n" + "="*60)
    print("🚀 TESTING DE ENDPOINTS DE AUTENTICACIÓN")
    print("="*60)
    print(f"📍 Base URL: {BASE_URL}")
    print(f"📧 Test Email: {test_user_email}")
    
    tests = [
        ("Registro", test_register),
        ("Registro Duplicado", test_register_duplicate),
        ("Login", test_login),
        ("Login Contraseña Incorrecta", test_login_wrong_password),
        ("Get Me", test_get_me),
        ("Verificar Token", test_verify_token),
        ("Refresh Token", test_refresh_token),
        ("Logout", test_logout),
        ("Acceso sin Token", test_protected_without_token),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Error ejecutando {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE TESTS")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    print("\n" + "-"*60)
    print(f"✅ Exitosos: {passed}/{total}")
    print(f"❌ Fallidos: {total - passed}/{total}")
    print(f"📈 Porcentaje: {(passed/total)*100:.1f}%")
    print("="*60 + "\n")
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
