"""
Middleware de Autenticación
Verificación de JWT en requests protegidos
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.jwt_service import verify_token
from services.auth_service import auth_service

# Esquema de seguridad Bearer
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency para obtener el usuario actual desde el token JWT
    
    Args:
        credentials: Credenciales HTTP Bearer
    
    Returns:
        dict: Documento del usuario actual
    
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    token = credentials.credentials
    
    # Verificar token
    payload = verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extraer user_id del token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: falta user_id",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Obtener usuario de la base de datos
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté activo
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )
    
    # Actualizar última actividad (en background, no bloquear)
    # await auth_service.update_user_activity(user_id)
    
    return user


async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """
    Dependency para obtener el usuario actual (opcional)
    No lanza excepción si no hay token, retorna None
    
    Args:
        credentials: Credenciales HTTP Bearer (opcional)
    
    Returns:
        Optional[dict]: Documento del usuario o None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def verify_user_is_active(user: dict) -> bool:
    """
    Verificar que un usuario esté activo
    
    Args:
        user: Documento del usuario
    
    Returns:
        bool: True si está activo
    """
    return user.get("is_active", True)


def verify_email_verified(user: dict) -> bool:
    """
    Verificar que el email del usuario esté verificado
    
    Args:
        user: Documento del usuario
    
    Returns:
        bool: True si está verificado
    """
    return user.get("email_verified", False)
