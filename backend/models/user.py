"""
Modelos de Usuario (SIMPLIFICADO - SIN AUTENTICACIÓN)
Define las estructuras de datos para usuarios sin sistema de login
"""
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    """
    Clase personalizada para manejar ObjectId de MongoDB en Pydantic
    """
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserProgress(BaseModel):
    """
    Modelo de progreso del usuario
    """
    modules: Dict[str, bool] = Field(default_factory=dict, description="Módulos completados")
    subtasks: Dict[str, bool] = Field(default_factory=dict, description="Subtareas completadas")
    notes: Dict[str, str] = Field(default_factory=dict, description="Notas por módulo")
    badges: List[str] = Field(default_factory=list, description="Badges obtenidos")
    xp: int = Field(default=0, ge=0, description="Puntos de experiencia")
    last_sync: Optional[datetime] = Field(default=None, description="Última sincronización")

    class Config:
        json_schema_extra = {
            "example": {
                "modules": {"1": True, "2": False},
                "subtasks": {"1-0": True, "1-1": False},
                "notes": {"1": "Mis notas del módulo 1"},
                "badges": ["core", "technical"],
                "xp": 150,
                "last_sync": "2025-01-15T10:30:00"
            }
        }


class UserSettings(BaseModel):
    """
    Configuración del usuario
    """
    notifications: bool = Field(default=True, description="Notificaciones habilitadas")
    theme: str = Field(default="dark", description="Tema de la aplicación")
    language: str = Field(default="es", description="Idioma preferido")

    class Config:
        json_schema_extra = {
            "example": {
                "notifications": True,
                "theme": "dark",
                "language": "es"
            }
        }


class UserBase(BaseModel):
    """
    Campos básicos de usuario
    """
    email: EmailStr = Field(..., description="Email del usuario")
    display_name: str = Field(..., min_length=2, max_length=100, description="Nombre para mostrar")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "display_name": "Juan Pérez"
            }
        }


class UserCreate(UserBase):
    """
    Modelo para crear un nuevo usuario
    """
    pass


class UserUpdate(BaseModel):
    """
    Modelo para actualizar un usuario existente
    """
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    photo_url: Optional[str] = None
    settings: Optional[UserSettings] = None

    class Config:
        json_schema_extra = {
            "example": {
                "display_name": "Juan Carlos Pérez",
                "photo_url": "https://example.com/photo.jpg",
                "settings": {
                    "notifications": False,
                    "theme": "light"
                }
            }
        }


class UserInDB(UserBase):
    """
    Modelo de usuario en la base de datos
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    photo_url: Optional[str] = Field(None, description="URL de la foto de perfil")
    
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")
    last_active: datetime = Field(default_factory=datetime.utcnow, description="Última actividad")
    
    progress: UserProgress = Field(default_factory=UserProgress, description="Progreso del usuario")
    settings: UserSettings = Field(default_factory=UserSettings, description="Configuración del usuario")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "display_name": "Juan Pérez",
                "photo_url": "https://example.com/photo.jpg",
                "created_at": "2025-01-15T10:00:00",
                "last_active": "2025-01-15T15:30:00",
                "progress": {
                    "modules": {"1": True},
                    "subtasks": {"1-0": True},
                    "notes": {"1": "Nota"},
                    "badges": ["core"],
                    "xp": 100
                },
                "settings": {
                    "notifications": True,
                    "theme": "dark",
                    "language": "es"
                }
            }
        }


class UserResponse(UserBase):
    """
    Modelo de respuesta de usuario
    """
    id: str = Field(..., description="ID del usuario")
    photo_url: Optional[str] = None
    created_at: datetime
    last_active: datetime
    progress: UserProgress
    settings: UserSettings

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "display_name": "Juan Pérez",
                "photo_url": "https://example.com/photo.jpg",
                "created_at": "2025-01-15T10:00:00",
                "last_active": "2025-01-15T15:30:00",
                "progress": {
                    "modules": {"1": True},
                    "subtasks": {"1-0": True},
                    "notes": {},
                    "badges": ["core"],
                    "xp": 100,
                    "last_sync": "2025-01-15T15:30:00"
                },
                "settings": {
                    "notifications": True,
                    "theme": "dark",
                    "language": "es"
                }
            }
        }
