"""
Modelos de Usuario
Define las estructuras de datos para usuarios en la aplicación
"""
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, EmailStr, Field, validator
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
    Modelo de progreso del usuario (embebido en User)
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

    @validator('theme')
    def validate_theme(cls, v):
        allowed_themes = ['light', 'dark', 'auto']
        if v not in allowed_themes:
            raise ValueError(f'Theme must be one of {allowed_themes}')
        return v

    @validator('language')
    def validate_language(cls, v):
        allowed_languages = ['es', 'en', 'pt']
        if v not in allowed_languages:
            raise ValueError(f'Language must be one of {allowed_languages}')
        return v

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
    Campos básicos comunes de usuario
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
    Modelo para crear un nuevo usuario (registro)
    """
    password: str = Field(..., min_length=8, max_length=100, description="Contraseña")

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "nuevo@example.com",
                "display_name": "Nuevo Usuario",
                "password": "Password123"
            }
        }


class UserUpdate(BaseModel):
    """
    Modelo para actualizar un usuario existente
    Todos los campos son opcionales
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
    Modelo de usuario en la base de datos (documento completo)
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    password_hash: str = Field(..., description="Hash de la contraseña")
    photo_url: Optional[str] = Field(None, description="URL de la foto de perfil")
    auth_provider: str = Field(default="email", description="Proveedor de autenticación")
    google_id: Optional[str] = Field(None, description="Google ID para OAuth")
    firebase_uid: Optional[str] = Field(None, description="Firebase UID (para migración)")
    
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")
    last_active: datetime = Field(default_factory=datetime.utcnow, description="Última actividad")
    email_verified: bool = Field(default=False, description="Email verificado")
    is_active: bool = Field(default=True, description="Usuario activo")
    
    progress: UserProgress = Field(default_factory=UserProgress, description="Progreso del usuario")
    settings: UserSettings = Field(default_factory=UserSettings, description="Configuración del usuario")
    
    # Metadata de migración
    migrated_from_firebase: bool = Field(default=False, description="Migrado desde Firebase")
    migration_date: Optional[datetime] = Field(None, description="Fecha de migración")

    @validator('auth_provider')
    def validate_auth_provider(cls, v):
        allowed_providers = ['email', 'google', 'firebase']
        if v not in allowed_providers:
            raise ValueError(f'Auth provider must be one of {allowed_providers}')
        return v

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "display_name": "Juan Pérez",
                "password_hash": "$2b$12$...",
                "photo_url": "https://example.com/photo.jpg",
                "auth_provider": "email",
                "created_at": "2025-01-15T10:00:00",
                "last_active": "2025-01-15T15:30:00",
                "email_verified": True,
                "is_active": True,
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
    Modelo de respuesta de usuario (sin datos sensibles)
    """
    id: str = Field(..., description="ID del usuario")
    photo_url: Optional[str] = None
    auth_provider: str
    created_at: datetime
    last_active: datetime
    email_verified: bool
    progress: UserProgress
    settings: UserSettings

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "display_name": "Juan Pérez",
                "photo_url": "https://example.com/photo.jpg",
                "auth_provider": "email",
                "created_at": "2025-01-15T10:00:00",
                "last_active": "2025-01-15T15:30:00",
                "email_verified": True,
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


class UserLogin(BaseModel):
    """
    Modelo para login de usuario
    """
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "password": "Password123"
            }
        }


class GoogleAuthRequest(BaseModel):
    """
    Modelo para autenticación con Google
    """
    id_token: str = Field(..., description="Google ID Token")

    class Config:
        json_schema_extra = {
            "example": {
                "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYT..."
            }
        }


class PasswordResetRequest(BaseModel):
    """
    Modelo para solicitud de reset de contraseña
    """
    email: EmailStr = Field(..., description="Email del usuario")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com"
            }
        }


class PasswordResetConfirm(BaseModel):
    """
    Modelo para confirmar reset de contraseña
    """
    token: str = Field(..., description="Token de reset")
    new_password: str = Field(..., min_length=8, description="Nueva contraseña")

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123def456",
                "new_password": "NewPassword123"
            }
        }
