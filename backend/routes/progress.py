"""
Rutas de Progreso
Endpoints para gestión de progreso del usuario en el curso
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

from services.database import get_database
from middleware.auth_middleware import get_current_user
from utils.validators import validate_module_id, validate_badge_name, validate_xp_amount

router = APIRouter()


# Request Models
class ModuleProgressUpdate(BaseModel):
    """Actualización de progreso de módulo"""
    module_id: str = Field(..., description="ID del módulo (ej: '1', '2', '3')")
    is_completed: bool = Field(..., description="Estado de completitud")


class SubtaskProgressUpdate(BaseModel):
    """Actualización de progreso de subtarea"""
    module_id: str = Field(..., description="ID del módulo")
    task_index: int = Field(..., ge=0, description="Índice de la tarea")
    is_completed: bool = Field(..., description="Estado de completitud")


class NoteUpdate(BaseModel):
    """Actualización de nota de módulo"""
    module_id: str = Field(..., description="ID del módulo")
    note_text: str = Field(..., max_length=10000, description="Texto de la nota")


class BadgeAdd(BaseModel):
    """Agregar badge"""
    badge_name: str = Field(..., description="Nombre del badge")


class XPAdd(BaseModel):
    """Agregar XP"""
    amount: int = Field(..., ge=1, le=1000, description="Cantidad de XP a agregar")
    reason: Optional[str] = Field(None, description="Razón del XP")


class ProgressSync(BaseModel):
    """Sincronización completa de progreso"""
    modules: Optional[Dict[str, bool]] = None
    subtasks: Optional[Dict[str, bool]] = None
    notes: Optional[Dict[str, str]] = None
    badges: Optional[List[str]] = None
    xp: Optional[int] = Field(None, ge=0)


# Endpoints
@router.get("")
async def get_progress(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener progreso completo del usuario
    
    Returns:
        Todo el progreso: módulos, subtareas, notas, badges, XP
    """
    progress = current_user.get("progress", {
        "modules": {},
        "subtasks": {},
        "notes": {},
        "badges": [],
        "xp": 0,
        "last_sync": None
    })
    
    return {
        "success": True,
        "progress": progress
    }


@router.put("/module")
async def update_module_progress(
    data: ModuleProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar progreso de un módulo
    
    - **module_id**: ID del módulo (ej: '1', '2', '3')
    - **is_completed**: true si está completado, false si no
    
    Returns:
        Progreso actualizado de módulos
    """
    # Validar module_id
    is_valid, error_msg = validate_module_id(data.module_id)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    db = get_database()
    
    # Actualizar progreso del módulo
    field_name = f"progress.modules.{data.module_id}"
    
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                field_name: data.is_completed,
                "progress.last_sync": datetime.utcnow(),
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar el progreso"
        )
    
    # Obtener progreso actualizado
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    modules = updated_user.get("progress", {}).get("modules", {})
    
    return {
        "success": True,
        "message": f"Módulo {data.module_id} actualizado",
        "modules": modules
    }


@router.put("/subtask")
async def update_subtask_progress(
    data: SubtaskProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar progreso de una subtarea
    
    - **module_id**: ID del módulo
    - **task_index**: Índice de la tarea (0, 1, 2, ...)
    - **is_completed**: true si está completada, false si no
    
    Returns:
        Progreso actualizado de subtareas
    """
    # Validar module_id
    is_valid, error_msg = validate_module_id(data.module_id)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    db = get_database()
    
    # Construir clave de subtarea: "module_id-task_index"
    subtask_key = f"{data.module_id}-{data.task_index}"
    field_name = f"progress.subtasks.{subtask_key}"
    
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                field_name: data.is_completed,
                "progress.last_sync": datetime.utcnow(),
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar la subtarea"
        )
    
    # Obtener progreso actualizado
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    subtasks = updated_user.get("progress", {}).get("subtasks", {})
    
    return {
        "success": True,
        "message": f"Subtarea {subtask_key} actualizada",
        "subtasks": subtasks
    }


@router.put("/note")
async def update_note(
    data: NoteUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar nota de un módulo
    
    - **module_id**: ID del módulo
    - **note_text**: Texto de la nota (máximo 10,000 caracteres)
    
    Returns:
        Notas actualizadas
    """
    # Validar module_id
    is_valid, error_msg = validate_module_id(data.module_id)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    db = get_database()
    
    # Actualizar nota
    field_name = f"progress.notes.{data.module_id}"
    
    # Si el texto está vacío, eliminar la nota
    if not data.note_text.strip():
        result = await db.users.update_one(
            {"_id": current_user["_id"]},
            {
                "$unset": {field_name: ""},
                "$set": {
                    "progress.last_sync": datetime.utcnow(),
                    "last_active": datetime.utcnow()
                }
            }
        )
    else:
        result = await db.users.update_one(
            {"_id": current_user["_id"]},
            {
                "$set": {
                    field_name: data.note_text,
                    "progress.last_sync": datetime.utcnow(),
                    "last_active": datetime.utcnow()
                }
            }
        )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar la nota"
        )
    
    # Obtener notas actualizadas
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    notes = updated_user.get("progress", {}).get("notes", {})
    
    return {
        "success": True,
        "message": f"Nota del módulo {data.module_id} actualizada",
        "notes": notes
    }


@router.post("/badge")
async def add_badge(
    data: BadgeAdd,
    current_user: dict = Depends(get_current_user)
):
    """
    Agregar un badge al usuario
    
    - **badge_name**: Nombre del badge a agregar
    
    Returns:
        Lista actualizada de badges
    """
    # Validar badge_name
    is_valid, error_msg = validate_badge_name(data.badge_name)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    db = get_database()
    
    # Verificar si el badge ya existe
    current_badges = current_user.get("progress", {}).get("badges", [])
    if data.badge_name in current_badges:
        return {
            "success": True,
            "message": "El badge ya existe",
            "badges": current_badges
        }
    
    # Agregar badge
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$addToSet": {"progress.badges": data.badge_name},
            "$set": {
                "progress.last_sync": datetime.utcnow(),
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo agregar el badge"
        )
    
    # Obtener badges actualizados
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    badges = updated_user.get("progress", {}).get("badges", [])
    
    return {
        "success": True,
        "message": f"Badge '{data.badge_name}' agregado",
        "badges": badges
    }


@router.post("/xp")
async def add_xp(
    data: XPAdd,
    current_user: dict = Depends(get_current_user)
):
    """
    Agregar XP al usuario
    
    - **amount**: Cantidad de XP a agregar (1-1000)
    - **reason**: Razón del XP (opcional)
    
    Returns:
        XP total actualizado
    """
    # Validar amount
    is_valid, error_msg = validate_xp_amount(data.amount)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    db = get_database()
    
    # Incrementar XP
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$inc": {"progress.xp": data.amount},
            "$set": {
                "progress.last_sync": datetime.utcnow(),
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo agregar XP"
        )
    
    # Obtener XP actualizado
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    xp = updated_user.get("progress", {}).get("xp", 0)
    
    message = f"{data.amount} XP agregado"
    if data.reason:
        message += f" ({data.reason})"
    
    return {
        "success": True,
        "message": message,
        "xp": xp
    }


@router.post("/sync")
async def sync_progress(
    data: ProgressSync,
    current_user: dict = Depends(get_current_user)
):
    """
    Sincronizar progreso completo del usuario
    
    Permite actualizar múltiples campos de progreso de una sola vez.
    Solo se actualizan los campos proporcionados.
    
    Returns:
        Progreso completo sincronizado
    """
    db = get_database()
    
    # Preparar campos a actualizar
    update_fields = {"progress.last_sync": datetime.utcnow(), "last_active": datetime.utcnow()}
    
    if data.modules is not None:
        update_fields["progress.modules"] = data.modules
    
    if data.subtasks is not None:
        update_fields["progress.subtasks"] = data.subtasks
    
    if data.notes is not None:
        update_fields["progress.notes"] = data.notes
    
    if data.badges is not None:
        update_fields["progress.badges"] = data.badges
    
    if data.xp is not None:
        update_fields["progress.xp"] = data.xp
    
    # Actualizar en la base de datos
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo sincronizar el progreso"
        )
    
    # Obtener progreso actualizado
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    progress = updated_user.get("progress", {})
    
    return {
        "success": True,
        "message": "Progreso sincronizado exitosamente",
        "progress": progress,
        "synced_at": datetime.utcnow().isoformat()
    }


@router.get("/stats")
async def get_progress_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener estadísticas detalladas de progreso
    
    Returns:
        Estadísticas completas: completitud, racha, tiempos, etc.
    """
    progress = current_user.get("progress", {})
    
    # Módulos
    modules = progress.get("modules", {})
    modules_completed = sum(1 for v in modules.values() if v)
    total_modules = len(modules)
    
    # Subtareas
    subtasks = progress.get("subtasks", {})
    subtasks_completed = sum(1 for v in subtasks.values() if v)
    total_subtasks = len(subtasks)
    
    # Badges y XP
    badges = progress.get("badges", [])
    xp = progress.get("xp", 0)
    
    # Cálculos
    completion_percentage = 0
    if total_modules > 0:
        completion_percentage = (modules_completed / total_modules) * 100
    
    # Nivel basado en XP (cada 100 XP = 1 nivel)
    level = xp // 100
    xp_for_next_level = 100 - (xp % 100)
    
    return {
        "success": True,
        "stats": {
            "modules": {
                "completed": modules_completed,
                "total": total_modules,
                "percentage": round(completion_percentage, 2)
            },
            "subtasks": {
                "completed": subtasks_completed,
                "total": total_subtasks
            },
            "badges": {
                "total": len(badges),
                "list": badges
            },
            "xp": {
                "total": xp,
                "level": level,
                "for_next_level": xp_for_next_level
            },
            "last_sync": progress.get("last_sync"),
            "member_since": current_user["created_at"].isoformat() if isinstance(current_user["created_at"], datetime) else current_user["created_at"]
        }
    }


@router.delete("")
async def reset_progress(
    current_user: dict = Depends(get_current_user)
):
    """
    Resetear todo el progreso del usuario
    
    CUIDADO: Esta acción es irreversible.
    
    Returns:
        Confirmación de reset
    """
    db = get_database()
    
    # Resetear progreso
    result = await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "progress": {
                    "modules": {},
                    "subtasks": {},
                    "notes": {},
                    "badges": [],
                    "xp": 0,
                    "last_sync": datetime.utcnow()
                },
                "last_active": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo resetear el progreso"
        )
    
    return {
        "success": True,
        "message": "Progreso reseteado exitosamente"
    }
