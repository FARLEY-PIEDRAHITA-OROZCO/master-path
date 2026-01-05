"""
Fixtures compartidos para tests
"""
import pytest
import asyncio
from httpx import AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Configurar event loop para pytest-asyncio
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db():
    """
    Fixture para base de datos de prueba
    Crea una DB temporal y la limpia después de cada test
    """
    # Usar una DB diferente para tests
    test_db_name = "qa_master_path_test"
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[test_db_name]
    
    # Limpiar DB antes del test
    await db.users.delete_many({})
    
    # Crear índices
    await db.users.create_index([("email", 1)], unique=True)
    await db.users.create_index([("google_id", 1)], unique=True, sparse=True)
    
    yield db
    
    # Limpiar DB después del test
    await db.users.delete_many({})
    client.close()


@pytest.fixture(scope="function")
async def test_client():
    """
    Fixture para cliente HTTP de prueba
    """
    from server import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def sample_user_data():
    """Datos de usuario de ejemplo para tests"""
    return {
        "email": "test@example.com",
        "display_name": "Test User",
        "password": "TestPassword123"
    }


@pytest.fixture
def sample_user_credentials():
    """Credenciales de usuario para login"""
    return {
        "email": "test@example.com",
        "password": "TestPassword123"
    }
