"""
QA Master Path - Backend API
FastAPI + MongoDB + JWT Authentication
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Importar servicios
from services.database import connect_to_mongo, close_mongo_connection, test_connection

# Cargar variables de entorno
load_dotenv()

# Crear aplicación FastAPI
app = FastAPI(
    title="QA Master Path API",
    description="Backend para la aplicación QA Master Path",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configuración CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8000")
FRONTEND_DEV_URL = os.getenv("FRONTEND_DEV_URL", "http://localhost:3000")

# Lista de orígenes permitidos para desarrollo local
# IMPORTANTE: En producción, especificar dominios exactos
allowed_origins = [
    FRONTEND_URL,
    FRONTEND_DEV_URL,
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5500",  # VSCode Live Server
    "http://192.168.56.1:8000",  # VirtualBox/VM
]

# CORS con soporte para cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # CRÍTICO para cookies
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],  # Exponer header Set-Cookie
)


# Eventos de inicio y cierre
@app.on_event("startup")
async def startup_event():
    """
    Ejecutar al iniciar la aplicación
    """
    print("\n" + "="*60)
    print("🚀 QA MASTER PATH BACKEND - INICIANDO")
    print("="*60)
    
    # Conectar a MongoDB
    await connect_to_mongo()
    
    # Test de conexión
    await test_connection()
    
    print("✅ Backend iniciado correctamente")
    print("📍 Docs: http://localhost:8001/api/docs")
    print("="*60 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Ejecutar al cerrar la aplicación
    """
    print("\n🔌 Cerrando conexión a MongoDB...")
    await close_mongo_connection()
    print("👋 Backend cerrado correctamente\n")


# Rutas básicas
@app.get("/")
async def root():
    """
    Ruta raíz
    """
    return {
        "message": "QA Master Path API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    try:
        # Verificar conexión MongoDB
        from services.database import motor_client
        if motor_client is not None:
            await motor_client.admin.command('ping')
            db_status = "connected"
        else:
            db_status = "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "ok",
        "database": db_status,
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.get("/api/status")
async def status():
    """
    Status detallado del backend
    """
    from services.database import motor_db
    
    try:
        collections = await motor_db.list_collection_names() if motor_db is not None else []
        users_count = await motor_db.users.count_documents({}) if motor_db is not None else 0
        
        return {
            "status": "operational",
            "database": {
                "connected": motor_db is not None,
                "name": os.getenv("MONGO_DB_NAME", "qa_master_path"),
                "collections": collections,
                "users_count": users_count
            },
            "api": {
                "version": "1.0.0",
                "endpoints": [
                    "/api/health",
                    "/api/status",
                    "/api/docs"
                ]
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )


# Importar y registrar rutas
from routes import user_router, progress_router
app.include_router(user_router, prefix="/api/user", tags=["Usuario"])
app.include_router(progress_router, prefix="/api/progress", tags=["Progreso"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )