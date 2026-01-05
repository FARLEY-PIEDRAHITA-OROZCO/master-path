"""
Tests de integración para endpoints de progreso
"""
import pytest
from datetime import datetime


@pytest.mark.asyncio
class TestProgressEndpoints:
    """Tests de integración para /api/progress/*"""
    
    async def test_get_progress(self, test_client):
        """Test obtener progreso"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"progress_{datetime.now().timestamp()}@example.com",
                "display_name": "Progress User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Obtener progreso
        response = await test_client.get(
            "/api/progress",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "progress" in data
        assert "modules" in data["progress"]
        assert "subtasks" in data["progress"]
    
    async def test_update_module_progress(self, test_client):
        """Test actualizar progreso de módulo"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"module_{datetime.now().timestamp()}@example.com",
                "display_name": "Module User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Actualizar módulo
        response = await test_client.put(
            "/api/progress/module",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "module_id": "1",
                "is_completed": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["modules"]["1"] is True
    
    async def test_update_subtask_progress(self, test_client):
        """Test actualizar progreso de subtarea"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"subtask_{datetime.now().timestamp()}@example.com",
                "display_name": "Subtask User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Actualizar subtarea
        response = await test_client.put(
            "/api/progress/subtask",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "module_id": "1",
                "task_index": 0,
                "is_completed": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "1-0" in data["subtasks"]
        assert data["subtasks"]["1-0"] is True
    
    async def test_update_note(self, test_client):
        """Test actualizar nota"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"note_{datetime.now().timestamp()}@example.com",
                "display_name": "Note User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Actualizar nota
        response = await test_client.put(
            "/api/progress/note",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "module_id": "1",
                "note_text": "Esta es mi nota para el módulo 1"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "1" in data["notes"]
        assert data["notes"]["1"] == "Esta es mi nota para el módulo 1"
    
    async def test_add_badge(self, test_client):
        """Test agregar badge"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"badge_{datetime.now().timestamp()}@example.com",
                "display_name": "Badge User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Agregar badge
        response = await test_client.post(
            "/api/progress/badge",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "badge_name": "first-steps"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "first-steps" in data["badges"]
    
    async def test_add_xp(self, test_client):
        """Test agregar XP"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"xp_{datetime.now().timestamp()}@example.com",
                "display_name": "XP User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Agregar XP
        response = await test_client.post(
            "/api/progress/xp",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "amount": 100
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["xp"] == 100
    
    async def test_sync_progress(self, test_client):
        """Test sincronizar progreso completo"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"sync_{datetime.now().timestamp()}@example.com",
                "display_name": "Sync User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Sincronizar progreso
        response = await test_client.post(
            "/api/progress/sync",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "modules": {"1": True, "2": True},
                "subtasks": {"1-0": True, "1-1": True},
                "notes": {"1": "Nota del módulo 1"},
                "badges": ["core", "technical"],
                "xp": 250
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "synced_at" in data
    
    async def test_get_progress_stats(self, test_client):
        """Test obtener estadísticas de progreso"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"stats_prog_{datetime.now().timestamp()}@example.com",
                "display_name": "Stats Progress User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Agregar progreso primero
        await test_client.put(
            "/api/progress/module",
            headers={"Authorization": f"Bearer {token}"},
            json={"module_id": "1", "is_completed": True}
        )
        
        await test_client.post(
            "/api/progress/xp",
            headers={"Authorization": f"Bearer {token}"},
            json={"amount": 50}
        )
        
        # Obtener estadísticas
        response = await test_client.get(
            "/api/progress/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stats" in data
        assert data["stats"]["total_modules"] >= 1
        assert data["stats"]["total_xp"] == 50
    
    async def test_reset_progress(self, test_client):
        """Test resetear progreso"""
        # Registrar usuario
        register_response = await test_client.post(
            "/api/auth/register",
            json={
                "email": f"reset_{datetime.now().timestamp()}@example.com",
                "display_name": "Reset User",
                "password": "TestPassword123"
            }
        )
        
        token = register_response.json()["access_token"]
        
        # Agregar progreso
        await test_client.put(
            "/api/progress/module",
            headers={"Authorization": f"Bearer {token}"},
            json={"module_id": "1", "is_completed": True}
        )
        
        # Resetear progreso
        response = await test_client.delete(
            "/api/progress",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
