"""
Modelos de Progreso
Define las estructuras para el progreso del usuario en módulos y tareas
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, validator


class ModuleProgressUpdate(BaseModel):
    """
    Modelo para actualizar el progreso de un módulo
    """
    module_id: str = Field(..., description="ID del módulo")
    is_completed: bool = Field(..., description="Estado de completado")

    @validator('module_id')
    def validate_module_id(cls, v):
        # Validar que sea un número o string numérico
        if not v.isdigit():
            raise ValueError('Module ID must be a numeric string')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "module_id": "1",
                "is_completed": True
            }
        }


class SubtaskProgressUpdate(BaseModel):
    """
    Modelo para actualizar el progreso de una subtarea
    """
    module_id: str = Field(..., description="ID del módulo")
    task_index: int = Field(..., ge=0, description="Índice de la tarea")
    is_completed: bool = Field(..., description="Estado de completado")

    @validator('module_id')
    def validate_module_id(cls, v):
        if not v.isdigit():
            raise ValueError('Module ID must be a numeric string')
        return v

    @property
    def subtask_key(self) -> str:
        """Generar la clave para el subtask (ej: '1-0')"""
        return f"{self.module_id}-{self.task_index}"

    class Config:
        json_schema_extra = {
            "example": {
                "module_id": "1",
                "task_index": 0,
                "is_completed": True
            }
        }


class NoteUpdate(BaseModel):
    """
    Modelo para actualizar una nota de módulo
    """
    module_id: str = Field(..., description="ID del módulo")
    note_text: str = Field(..., max_length=5000, description="Texto de la nota")

    @validator('module_id')
    def validate_module_id(cls, v):
        if not v.isdigit():
            raise ValueError('Module ID must be a numeric string')
        return v

    @validator('note_text')
    def validate_note_text(cls, v):
        # Eliminar espacios al inicio y final
        v = v.strip()
        if len(v) == 0:
            raise ValueError('Note text cannot be empty')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "module_id": "1",
                "note_text": "Estos son mis apuntes del módulo 1..."
            }
        }


class ProgressSync(BaseModel):
    """
    Modelo para sincronización completa del progreso
    """
    modules: Dict[str, bool] = Field(default_factory=dict, description="Módulos completados")
    subtasks: Dict[str, bool] = Field(default_factory=dict, description="Subtareas completadas")
    notes: Dict[str, str] = Field(default_factory=dict, description="Notas por módulo")
    badges: List[str] = Field(default_factory=list, description="Badges obtenidos")
    xp: int = Field(default=0, ge=0, description="Puntos de experiencia")

    @validator('badges')
    def validate_badges(cls, v):
        # Eliminar duplicados
        return list(set(v))

    @validator('xp')
    def validate_xp(cls, v):
        if v < 0:
            raise ValueError('XP cannot be negative')
        if v > 1000000:  # Límite razonable
            raise ValueError('XP exceeds maximum allowed value')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "modules": {
                    "1": True,
                    "2": False,
                    "3": False
                },
                "subtasks": {
                    "1-0": True,
                    "1-1": True,
                    "2-0": False
                },
                "notes": {
                    "1": "Apuntes del módulo 1",
                    "2": "Apuntes del módulo 2"
                },
                "badges": ["core", "technical", "advanced"],
                "xp": 350
            }
        }


class ProgressResponse(BaseModel):
    """
    Modelo de respuesta del progreso del usuario
    """
    modules: Dict[str, bool] = Field(default_factory=dict)
    subtasks: Dict[str, bool] = Field(default_factory=dict)
    notes: Dict[str, str] = Field(default_factory=dict)
    badges: List[str] = Field(default_factory=list)
    xp: int = Field(default=0)
    last_sync: Optional[datetime] = None

    # Estadísticas calculadas
    total_modules: int = Field(default=0, description="Total de módulos")
    completed_modules: int = Field(default=0, description="Módulos completados")
    completion_percentage: float = Field(default=0.0, ge=0, le=100, description="Porcentaje de completado")

    class Config:
        json_schema_extra = {
            "example": {
                "modules": {
                    "1": True,
                    "2": False,
                    "3": False
                },
                "subtasks": {
                    "1-0": True,
                    "1-1": True
                },
                "notes": {
                    "1": "Mis apuntes"
                },
                "badges": ["core", "technical"],
                "xp": 250,
                "last_sync": "2025-01-15T15:30:00",
                "total_modules": 3,
                "completed_modules": 1,
                "completion_percentage": 33.33
            }
        }


class BadgeAdd(BaseModel):
    """
    Modelo para agregar un badge
    """
    badge_name: str = Field(..., min_length=1, max_length=50, description="Nombre del badge")

    @validator('badge_name')
    def validate_badge_name(cls, v):
        # Solo letras, números y guiones
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Badge name must contain only letters, numbers, hyphens and underscores')
        return v.lower()

    class Config:
        json_schema_extra = {
            "example": {
                "badge_name": "advanced-qa"
            }
        }


class XPAdd(BaseModel):
    """
    Modelo para agregar XP
    """
    amount: int = Field(..., gt=0, le=1000, description="Cantidad de XP a agregar")
    reason: Optional[str] = Field(None, max_length=200, description="Razón del XP")

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 50,
                "reason": "Completó el módulo 1"
            }
        }


class ProgressStats(BaseModel):
    """
    Estadísticas del progreso del usuario
    """
    total_modules: int = 0
    completed_modules: int = 0
    completion_percentage: float = 0.0
    total_subtasks: int = 0
    completed_subtasks: int = 0
    total_notes: int = 0
    total_badges: int = 0
    total_xp: int = 0
    last_activity: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "total_modules": 10,
                "completed_modules": 3,
                "completion_percentage": 30.0,
                "total_subtasks": 50,
                "completed_subtasks": 15,
                "total_notes": 5,
                "total_badges": 3,
                "total_xp": 450,
                "last_activity": "2025-01-15T15:30:00"
            }
        }
