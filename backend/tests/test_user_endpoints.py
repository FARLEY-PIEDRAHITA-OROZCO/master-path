"""
Tests de integración para endpoints de usuario
"""
import pytest
from datetime import datetime


@pytest.mark.asyncio
class TestUserEndpoints:
    """Tests de integración para /api/user/*"""
    
    async def test_get_user_profile(self, test_client):
        """Test obtener perfil de usuario"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"profile_{datetime.now().timestamp()}@example.com",
                "display_name": "Profile User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Obtener perfil
        response = await test_client.get(
            "/api/user/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["display_name"] == "Profile User"
    
    async def test_update_user_profile(self, test_client):
        """Test actualizar perfil de usuario"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"update_{datetime.now().timestamp()}@example.com",
                "display_name": "Original Name",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Actualizar perfil
        response = await test_client.put(
            "/api/user/me",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "display_name": "Updated Name",
                "photo_url": "https://example.com/photo.jpg"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["display_name"] == "Updated Name"
        assert data["user"]["photo_url"] == "https://example.com/photo.jpg"
    
    async def test_update_user_settings(self, test_client):
        """Test actualizar configuración de usuario"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"settings_{datetime.now().timestamp()}@example.com",
                "display_name": "Settings User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Actualizar configuración
        response = await test_client.put(
            "/api/user/me/settings",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "notifications": False,
                "theme": "light",
                "language": "en"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["settings"]["notifications"] is False
        assert data["user"]["settings"]["theme"] == "light"
        assert data["user"]["settings"]["language"] == "en"
    
    async def test_get_user_stats(self, test_client):
        """Test obtener estadísticas de usuario"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"stats_{datetime.now().timestamp()}@example.com",
                "display_name": "Stats User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Obtener estadísticas
        response = await test_client.get(
            "/api/user/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stats" in data
        assert "total_modules" in data["stats"]
        assert "completed_modules" in data["stats"]
        assert "total_xp" in data["stats"]
    
    async def test_deactivate_user_account(self, test_client):
        """Test desactivar cuenta de usuario"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"deactivate_{datetime.now().timestamp()}@example.com",
                "display_name": "Deactivate User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Desactivar cuenta
        response = await test_client.delete(
            "/api/user/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "desactivada" in data["message"].lower()
    
    async def test_unauthorized_access(self, test_client):
        """Test acceso sin autorización"""
        response = await test_client.get("/api/user/me")
        
        assert response.status_code == 403
