"""
Modelos de datos de la aplicación
"""
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDB,
    UserResponse,
    UserLogin,
    UserProgress,
    UserSettings,
    GoogleAuthRequest,
    PasswordResetRequest,
    PasswordResetConfirm
)

from .progress import (
    ModuleProgressUpdate,
    SubtaskProgressUpdate,
    NoteUpdate,
    ProgressSync,
    ProgressResponse,
    BadgeAdd,
    XPAdd,
    ProgressStats
)

__all__ = [
    # User models
    'UserBase',
    'UserCreate',
    'UserUpdate',
    'UserInDB',
    'UserResponse',
    'UserLogin',
    'UserProgress',
    'UserSettings',
    'GoogleAuthRequest',
    'PasswordResetRequest',
    'PasswordResetConfirm',
    
    # Progress models
    'ModuleProgressUpdate',
    'SubtaskProgressUpdate',
    'NoteUpdate',
    'ProgressSync',
    'ProgressResponse',
    'BadgeAdd',
    'XPAdd',
    'ProgressStats'
]
