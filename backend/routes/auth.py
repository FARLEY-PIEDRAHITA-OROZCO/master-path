"""
Rutas de Autenticación
Endpoints para registro, login, logout, etc.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel

from models.user import UserCreate, UserLogin, UserResponse
from services.auth_service import auth_service
from services.jwt_service import verify_token, create_access_token
from middleware.auth_middleware import get_current_user

router = APIRouter()


class TokenResponse(BaseModel):
    """Respuesta de tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Request para refresh token"""
    refresh_token: str


class MessageResponse(BaseModel):
    """Respuesta genérica"""
    success: bool
    message: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate
):
    """
    Registrar un nuevo usuario
    
    - **email**: Email del usuario (debe ser único)
    - **display_name**: Nombre para mostrar (2-100 caracteres)
    - **password**: Contraseña (mínimo 8 caracteres, debe contener letra y número)
    
    Returns:
        Usuario creado y tokens de autenticación
    """
    try:
        result = await auth_service.register_user(user_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error en registro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/login")
async def login(
    login_data: UserLogin
):
    """
    Autenticar usuario
    
    - **email**: Email del usuario
    - **password**: Contraseña
    
    Returns:
        Usuario y tokens de autenticación
    """
    try:
        result = await auth_service.login_user(login_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Error en login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/refresh")
async def refresh_token(
    request: RefreshTokenRequest
):
    """
    Refrescar access token usando refresh token
    
    - **refresh_token**: Refresh token válido
    
    Returns:
        Nuevo access token
    """
    # Verificar refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extraer user_id
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario existe y está activo
    user = await auth_service.get_user_by_id(user_id)
    if not user or not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear nuevo access token
    new_access_token = create_access_token(
        data={"sub": user_id, "email": user["email"]}
    )
    
    return {
        "success": True,
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user)
):
    """
    Cerrar sesión del usuario
    
    Nota: En una implementación con JWT stateless, el logout es principalmente
    del lado del cliente (eliminar tokens). Aquí podríamos implementar
    una blacklist de tokens si fuera necesario.
    
    Returns:
        Mensaje de confirmación
    """
    # En el futuro podríamos agregar el token a una blacklist en Redis
    # Por ahora, solo confirmamos el logout
    
    return {
        "success": True,
        "message": "Sesión cerrada exitosamente"
    }


@router.get("/me")
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener información del usuario autenticado
    
    Returns:
        Información del usuario actual
    """
    # Convertir a formato de respuesta
    user_response = auth_service._convert_to_user_response(current_user)
    
    return {
        "success": True,
        "user": user_response
    }


@router.get("/verify")
async def verify_token_endpoint(
    current_user: dict = Depends(get_current_user)
):
    """
    Verificar si el token actual es válido
    
    Returns:
        Estado del token
    """
    return {
        "success": True,
        "valid": True,
        "user_id": str(current_user["_id"]),
        "email": current_user["email"]
    }
