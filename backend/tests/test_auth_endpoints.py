"""
Tests de integración para endpoints de autenticación
"""
import pytest
from httpx import AsyncClient
from datetime import datetime


@pytest.mark.asyncio
class TestAuthEndpoints:
    """Tests de integración para /api/auth/*"""
    
    async def test_register_success(self, test_client):
        """Test registro exitoso"""
        response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"test_{datetime.now().timestamp()}@example.com",
                "display_name": "Test User",
                "password": "TestPassword123"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "user" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] is not None
    
    async def test_register_duplicate_email(self, test_client):
        """Test registro con email duplicado"""
        email = f"duplicate_{datetime.now().timestamp()}@example.com"
        
        # Primer registro
        await test_client.post(
            "/api/auth/register",
            json={
                "email": email,
                "display_name": "Test User 1",
                "password": "TestPassword123"
            }
        )
        
        # Segundo registro (debe fallar)
        response = await test_client.post(
            "/api/auth/register",
            json={
                "email": email,
                "display_name": "Test User 2",
                "password": "TestPassword456"
            }
        )
        
        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower()
    
    async def test_register_invalid_password(self, test_client):
        """Test registro con contraseña inválida"""
        response = await test_client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "display_name": "Test User",
                "password": "weak"  # Muy corta
            }
        )
        
        assert response.status_code in [400, 422]
    
    async def test_login_success(self, test_client):
        """Test login exitoso"""
        email = f"login_{datetime.now().timestamp()}@example.com"
        password = "TestPassword123"
        
        # Registrar usuario primero
        await test_client.post(
            "/api/auth/register",
            json={
                "email": email,
                "display_name": "Test User",
                "password": password
            }
        )
        
        # Login
        response = await test_client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": password
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data
        assert "refresh_token" in data
    
    async def test_login_wrong_password(self, test_client):
        """Test login con contraseña incorrecta"""
        email = f"wrong_{datetime.now().timestamp()}@example.com"
        
        # Registrar usuario
        await test_client.post(
            "/api/auth/register",
            json={
                "email": email,
                "display_name": "Test User",
                "password": "TestPassword123"
            }
        )
        
        # Login con contraseña incorrecta
        response = await test_client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": "WrongPassword"
            }
        )
        
        assert response.status_code == 401
    
    async def test_login_nonexistent_user(self, test_client):
        """Test login con usuario inexistente"""
        response = await test_client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "TestPassword123"
            }
        )
        
        assert response.status_code == 401
    
    async def test_refresh_token_success(self, test_client):
        """Test refresh token exitoso"""
        # Registrar y obtener tokens
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"refresh_{datetime.now().timestamp()}@example.com",
                "display_name": "Test User",
                "password": "TestPassword123"
            }
        )
        
        refresh_token = register_response.json()["refresh_token"]
        
        # Usar refresh token
        response = await test_client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data
    
    async def test_refresh_token_invalid(self, test_client):
        """Test refresh token inválido"""
        response = await test_client.post(
            "/api/auth/refresh",
            json={"refresh_token": "invalid.token.here"}
        )
        
        assert response.status_code == 401
    
    async def test_get_current_user(self, test_client):
        """Test obtener usuario actual"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"current_{datetime.now().timestamp()}@example.com",
                "display_name": "Current User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Obtener usuario actual
        response = await test_client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["display_name"] == "Current User"
    
    async def test_get_current_user_no_token(self, test_client):
        """Test obtener usuario sin token"""
        response = await test_client.get("/api/auth/me")
        
        assert response.status_code == 403
    
    async def test_verify_token(self, test_client):
        """Test verificar token"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"verify_{datetime.now().timestamp()}@example.com",
                "display_name": "Verify User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Verificar token
        response = await test_client.get(
            "/api/auth/verify",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["valid"] is True
    
    async def test_logout(self, test_client):
        """Test logout"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"logout_{datetime.now().timestamp()}@example.com",
                "display_name": "Logout User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Logout
        response = await test_client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
