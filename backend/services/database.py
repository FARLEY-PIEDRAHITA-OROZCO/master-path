"""
Servicio de conexión a MongoDB
Maneja la conexión a la base de datos y proporciona acceso a las colecciones
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "qa_master_path")

# Cliente MongoDB asíncrono (para FastAPI)
motor_client: AsyncIOMotorClient = None
motor_db = None

# Cliente MongoDB síncrono (para scripts)
sync_client: MongoClient = None
sync_db = None


async def connect_to_mongo():
    """
    Conectar a MongoDB (modo asíncrono)
    """
    global motor_client, motor_db
    
    try:
        print(f"🔌 Conectando a MongoDB: {MONGO_URL}")
        motor_client = AsyncIOMotorClient(
            MONGO_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        
        # Verificar conexión
        await motor_client.admin.command('ping')
        motor_db = motor_client[MONGO_DB_NAME]
        
        # Crear índices
        await create_indexes()
        
        print(f"✅ MongoDB conectado exitosamente: {MONGO_DB_NAME}")
        return motor_db
        
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")
        raise


async def close_mongo_connection():
    """
    Cerrar conexión a MongoDB
    """
    global motor_client
    if motor_client:
        motor_client.close()
        print("🔌 Conexión MongoDB cerrada")


async def create_indexes():
    """
    Crear índices en las colecciones
    """
    if not motor_db:
        return
    
    try:
        # Índices en colección users
        users_collection = motor_db["users"]
        
        # Email único
        await users_collection.create_index("email", unique=True)
        
        # Google ID único (sparse porque no todos los usuarios lo tienen)
        await users_collection.create_index(
            "google_id",
            unique=True,
            sparse=True
        )
        
        # Índices para búsquedas
        await users_collection.create_index("created_at")
        await users_collection.create_index("last_active")
        await users_collection.create_index("auth_provider")
        
        print("✅ Índices MongoDB creados correctamente")
        
    except Exception as e:
        print(f"⚠️ Error creando índices: {e}")


def get_database():
    """
    Obtener instancia de la base de datos
    Para usar en dependencias de FastAPI
    """
    return motor_db


def get_sync_database():
    """
    Obtener cliente síncrono de MongoDB (para scripts)
    """
    global sync_client, sync_db
    
    if not sync_client:
        sync_client = MongoClient(MONGO_URL)
        sync_db = sync_client[MONGO_DB_NAME]
    
    return sync_db


async def test_connection():
    """
    Probar conexión a MongoDB
    """
    try:
        if not motor_db:
            await connect_to_mongo()
        
        # Ping
        await motor_client.admin.command('ping')
        
        # Obtener información del servidor
        server_info = await motor_client.server_info()
        
        print("\n" + "="*50)
        print("✅ TEST DE CONEXIÓN MONGODB")
        print("="*50)
        print(f"📍 URL: {MONGO_URL}")
        print(f"📊 Base de datos: {MONGO_DB_NAME}")
        print(f"🏷️ Versión MongoDB: {server_info.get('version')}")
        print(f"📋 Colecciones: {await motor_db.list_collection_names()}")
        print("="*50 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR EN TEST DE CONEXIÓN: {e}\n")
        return False