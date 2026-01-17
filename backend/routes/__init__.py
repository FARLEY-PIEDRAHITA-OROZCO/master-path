"""
Rutas del backend
"""
from .user import router as user_router
from .progress import router as progress_router

__all__ = ['user_router', 'progress_router']
