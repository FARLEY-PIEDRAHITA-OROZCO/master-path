"""
Rutas de Usuario (SIN AUTENTICACIÓN)
Endpoints públicos para gestión de perfil de usuario
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId
from datetime import datetime

from services.database import get_database

router = APIRouter()


class CreateUserRequest(BaseModel):
    """Request para crear usuario básico"""
    email: EmailStr
    display_name: str


class UpdateProfileRequest(BaseModel):
    """Request para actualizar perfil"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None


class UpdateSettingsRequest(BaseModel):
    """Request para actualizar configuración"""
    notifications: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None


@router.post("/create")
async def create_user(user_data: CreateUserRequest):
    """
    Crear un usuario básico (sin autenticación)
    
    Returns:
        Usuario creado con ID
    """
    db = get_database()
    
    # Verificar si el email ya existe
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear documento de usuario básico
    user_doc = {
        "email": user_data.email,
        "display_name": user_data.display_name,
        "created_at": datetime.utcnow(),
        "last_active": datetime.utcnow(),
        "progress": {
            "modules": {},
            "subtasks": {},
            "notes": {},
            "badges": [],
            "xp": 0,
            "last_sync": None
        },
        "settings": {
            "notifications": True,
            "theme": "dark",
            "language": "es"
        }
    }
    
    # Insertar usuario
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return {
        "success": True,
        "message": "Usuario creado exitosamente",
        "user": {
            "id": str(result.inserted_id),
            "email": user_data.email,
            "display_name": user_data.display_name
        }
    }


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """
    Obtener perfil de usuario por ID
    
    Returns:
        Información del usuario
    """
    db = get_database()
    
    try:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return {
        "success": True,
        "user": {
            "id": str(user_doc["_id"]),
            "email": user_doc["email"],
            "display_name": user_doc["display_name"],
            "photo_url": user_doc.get("photo_url"),
            "created_at": user_doc["created_at"].isoformat() if isinstance(user_doc["created_at"], datetime) else user_doc["created_at"],
            "last_active": user_doc["last_active"].isoformat() if isinstance(user_doc["last_active"], datetime) else user_doc["last_active"],
            "progress": user_doc.get("progress", {}),
            "settings": user_doc.get("settings", {})
        }
    }


@router.put("/{user_id}")
async def update_user_profile(user_id: str, profile_data: UpdateProfileRequest):
    """
    Actualizar perfil de usuario
    
    Returns:
        Usuario actualizado
    """
    db = get_database()
    
    # Preparar campos a actualizar
    update_fields = {}
    
    if profile_data.display_name is not None:
        if len(profile_data.display_name) < 2 or len(profile_data.display_name) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre debe tener entre 2 y 100 caracteres"
            )
        update_fields["display_name"] = profile_data.display_name
    
    if profile_data.photo_url is not None:
        update_fields["photo_url"] = profile_data.photo_url
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay campos para actualizar"
        )
    
    update_fields["last_active"] = datetime.utcnow()
    
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Obtener usuario actualizado
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    return {
        "success": True,
        "message": "Perfil actualizado exitosamente",
        "user": {
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "display_name": updated_user["display_name"],
            "photo_url": updated_user.get("photo_url")
        }
    }


@router.put("/{user_id}/settings")
async def update_user_settings(user_id: str, settings_data: UpdateSettingsRequest):
    """
    Actualizar configuración del usuario
    
    Returns:
        Configuración actualizada
    """
    db = get_database()
    
    try:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Obtener configuración actual
    current_settings = user_doc.get("settings", {})
    
    # Actualizar solo los campos proporcionados
    if settings_data.notifications is not None:
        current_settings["notifications"] = settings_data.notifications
    
    if settings_data.theme is not None:
        if settings_data.theme not in ["light", "dark", "auto"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tema inválido. Debe ser: light, dark o auto"
            )
        current_settings["theme"] = settings_data.theme
    
    if settings_data.language is not None:
        if settings_data.language not in ["es", "en"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Idioma inválido. Debe ser: es o en"
            )
        current_settings["language"] = settings_data.language
    
    # Actualizar en la base de datos
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "settings": current_settings,
                "last_active": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "message": "Configuración actualizada exitosamente",
        "settings": current_settings
    }


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """
    Eliminar usuario
    
    Returns:
        Confirmación de eliminación
    """
    db = get_database()
    
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return {
        "success": True,
        "message": "Usuario eliminado exitosamente"
    }


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """
    Obtener estadísticas del usuario
    
    Returns:
        Estadísticas de progreso, badges, XP, etc.
    """
    db = get_database()
    
    try:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido"
        )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    progress = user_doc.get("progress", {})
    
    # Calcular estadísticas
    modules_completed = sum(1 for v in progress.get("modules", {}).values() if v)
    total_modules = len(progress.get("modules", {}))
    
    subtasks_completed = sum(1 for v in progress.get("subtasks", {}).values() if v)
    total_subtasks = len(progress.get("subtasks", {}))
    
    badges_count = len(progress.get("badges", []))
    xp = progress.get("xp", 0)
    
    # Calcular porcentaje de completitud
    completion_percentage = 0
    if total_modules > 0:
        completion_percentage = (modules_completed / total_modules) * 100
    
    return {
        "success": True,
        "stats": {
            "modules": {
                "completed": modules_completed,
                "total": total_modules,
                "completion_percentage": round(completion_percentage, 2)
            },
            "subtasks": {
                "completed": subtasks_completed,
                "total": total_subtasks
            },
            "badges": badges_count,
            "xp": xp,
            "member_since": user_doc["created_at"].isoformat() if isinstance(user_doc["created_at"], datetime) else user_doc["created_at"],
            "last_active": user_doc["last_active"].isoformat() if isinstance(user_doc["last_active"], datetime) else user_doc["last_active"]
        }
    }
