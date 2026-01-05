"""
Rutas de Usuario
Endpoints para gestión de perfil de usuario
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional

from models.user import UserUpdate, UserSettings
from services.database import get_database
from middleware.auth_middleware import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    """Request para actualizar perfil"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None


class UpdateSettingsRequest(BaseModel):
    """Request para actualizar configuración"""
    notifications: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None


@router.get("/me")
async def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener perfil del usuario autenticado
    
    Returns:
        Información completa del usuario
    """
    from services.auth_service import auth_service
    
    # Convertir a formato de respuesta
    user_response = auth_service._convert_to_user_response(current_user)
    
    return {
        "success": True,
        "user": user_response
    }


@router.put("/me")
async def update_my_profile(
    profile_data: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar perfil del usuario autenticado
    
    - **display_name**: Nuevo nombre para mostrar (opcional)
    - **photo_url**: Nueva URL de foto (opcional)
    
    Returns:
        Usuario actualizado
    """
    db = get_database()
    
    # Preparar campos a actualizar
    update_fields = {}
    
    if profile_data.display_name is not None:
        # Validar display_name
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
    
    # Actualizar en la base de datos
    update_fields["last_active"] = datetime.utcnow()
    
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar el perfil"
        )
    
    # Obtener usuario actualizado
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    
    from services.auth_service import auth_service
    user_response = auth_service._convert_to_user_response(updated_user)
    
    return {
        "success": True,
        "message": "Perfil actualizado exitosamente",
        "user": user_response
    }


@router.put("/me/settings")
async def update_my_settings(
    settings_data: UpdateSettingsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar configuración del usuario
    
    - **notifications**: Activar/desactivar notificaciones (opcional)
    - **theme**: Tema de la interfaz (opcional)
    - **language**: Idioma (opcional)
    
    Returns:
        Configuración actualizada
    """
    db = get_database()
    
    # Obtener configuración actual
    current_settings = current_user.get("settings", {})
    
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
        {"_id": current_user["_id"]},
        {
            "$set": {
                "settings": current_settings,
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar la configuración"
        )
    
    return {
        "success": True,
        "message": "Configuración actualizada exitosamente",
        "settings": current_settings
    }


@router.delete("/me")
async def delete_my_account(
    current_user: dict = Depends(get_current_user)
):
    """
    Desactivar cuenta del usuario autenticado
    
    Nota: En lugar de eliminar completamente, marcamos el usuario como inactivo
    para mantener integridad referencial.
    
    Returns:
        Confirmación de desactivación
    """
    db = get_database()
    
    # Marcar usuario como inactivo
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "is_active": False,
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo desactivar la cuenta"
        )
    
    return {
        "success": True,
        "message": "Cuenta desactivada exitosamente"
    }


@router.get("/stats")
async def get_my_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener estadísticas del usuario
    
    Returns:
        Estadísticas de progreso, badges, XP, etc.
    """
    progress = current_user.get("progress", {})
    
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
            "member_since": current_user["created_at"].isoformat() if isinstance(current_user["created_at"], datetime) else current_user["created_at"],
            "last_active": current_user["last_active"].isoformat() if isinstance(current_user["last_active"], datetime) else current_user["last_active"]
        }
    }
