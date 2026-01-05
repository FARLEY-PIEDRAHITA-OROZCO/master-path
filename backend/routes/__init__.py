"""
Rutas del backend
"""
from .auth import router as auth_router
from .user import router as user_router
from .progress import router as progress_router

__all__ = ['auth_router', 'user_router', 'progress_router']
