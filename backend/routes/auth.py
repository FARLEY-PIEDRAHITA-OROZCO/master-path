"""
Rutas de Autenticación con Cookies httpOnly
Endpoints para registro, login, logout usando cookies seguras
"""
import os
from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import timedelta

from models.user import UserCreate, UserLogin, UserResponse
from services.auth_service import auth_service
from services.jwt_service import create_access_token, create_refresh_token, verify_token
from middleware.auth_middleware import get_current_user, get_current_user_optional

router = APIRouter()

# Configuración de cookies desde .env
COOKIE_NAME = "qa_session"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CRÍTICO: domain debe ser None para localhost
# En producción también funciona con None (usa el dominio actual automáticamente)
COOKIE_DOMAIN = None

# secure debe ser False en desarrollo, True en producción
COOKIE_SECURE = ENVIRONMENT == "production"

COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
COOKIE_HTTPONLY = os.getenv("COOKIE_HTTPONLY", "True").lower() == "true"
COOKIE_MAX_AGE = int(os.getenv("COOKIE_MAX_AGE", "604800"))  # 7 días

print(f"🍪 [COOKIE-CONFIG] Entorno: {ENVIRONMENT}")
print(f"🍪 [COOKIE-CONFIG] Cookie name: {COOKIE_NAME}")
print(f"🍪 [COOKIE-CONFIG] Domain: {COOKIE_DOMAIN} (None = dominio actual)")
print(f"🍪 [COOKIE-CONFIG] Secure: {COOKIE_SECURE}")
print(f"🍪 [COOKIE-CONFIG] SameSite: {COOKIE_SAMESITE}")
print(f"🍪 [COOKIE-CONFIG] HttpOnly: {COOKIE_HTTPONLY}")


class MessageResponse(BaseModel):
    """Respuesta genérica"""
    success: bool
    message: str


def set_auth_cookie(response: Response, access_token: str, refresh_token: str):
    """
    Configura las cookies de autenticación en la respuesta
    
    CRÍTICO: domain=None permite que funcione tanto en localhost como en producción
    El navegador usa automáticamente el dominio actual cuando domain=None
    
    Args:
        response: Objeto Response de FastAPI
        access_token: JWT access token
        refresh_token: JWT refresh token
    """
    # Cookie principal con access token
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        max_age=COOKIE_MAX_AGE,
        domain=COOKIE_DOMAIN,  # None = usa dominio actual automáticamente
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/"
    )
    
    # Cookie de refresh token (más duradera)
    response.set_cookie(
        key=f"{COOKIE_NAME}_refresh",
        value=refresh_token,
        max_age=COOKIE_MAX_AGE,
        domain=COOKIE_DOMAIN,  # None = usa dominio actual automáticamente
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/api/auth/refresh"
    )
    
    print(f"✅ [COOKIE-SET] Cookies configuradas: {COOKIE_NAME}")
    print(f"✅ [COOKIE-SET] Domain: {COOKIE_DOMAIN}, Secure: {COOKIE_SECURE}, SameSite: {COOKIE_SAMESITE}")


def clear_auth_cookies(response: Response):
    """
    Limpia las cookies de autenticación
    Establece Max-Age=0 para eliminar inmediatamente
    
    Args:
        response: Objeto Response de FastAPI
    """
    # Eliminar cookie principal con todos los atributos
    response.set_cookie(
        key=COOKIE_NAME,
        value="",
        max_age=0,  # Expira inmediatamente
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/"
    )
    
    # Eliminar cookie de refresh
    response.set_cookie(
        key=f"{COOKIE_NAME}_refresh",
        value="",
        max_age=0,  # Expira inmediatamente
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/api/auth/refresh"
    )
    
    print(f"🗑️ Cookies eliminadas: {COOKIE_NAME}")


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    response: Response
):
    """
    Registrar un nuevo usuario y establecer sesión con cookies
    
    - **email**: Email del usuario (debe ser único)
    - **display_name**: Nombre para mostrar (2-100 caracteres)
    - **password**: Contraseña (mínimo 8 caracteres, debe contener letra y número)
    
    Returns:
        Usuario creado (las cookies se establecen automáticamente)
    """
    try:
        result = await auth_service.register_user(user_data)
        
        # Establecer cookies con los tokens
        set_auth_cookie(response, result["access_token"], result["refresh_token"])
        
        # Retornar solo datos del usuario (NO los tokens)
        return {
            "success": True,
            "message": "Usuario registrado exitosamente",
            "user": result["user"]
        }
        
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
    login_data: UserLogin,
    response: Response
):
    """
    Autenticar usuario y establecer sesión con cookies
    
    - **email**: Email del usuario
    - **password**: Contraseña
    
    Returns:
        Usuario autenticado (las cookies se establecen automáticamente)
    """
    try:
        result = await auth_service.login_user(login_data)
        
        # Establecer cookies con los tokens
        set_auth_cookie(response, result["access_token"], result["refresh_token"])
        
        # Retornar solo datos del usuario (NO los tokens)
        return {
            "success": True,
            "message": "Login exitoso",
            "user": result["user"]
        }
        
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
    request: Request,
    response: Response
):
    """
    Refrescar access token usando refresh token de cookie
    
    Returns:
        Confirmación de refresh (nueva cookie se establece automáticamente)
    """
    # Obtener refresh token de la cookie
    refresh_token_value = request.cookies.get(f"{COOKIE_NAME}_refresh")
    
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar refresh token
    payload = verify_token(refresh_token_value, token_type="refresh")
    
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
    
    # Actualizar cookie con nuevo access token (mantener mismo refresh token)
    set_auth_cookie(response, new_access_token, refresh_token_value)
    
    return {
        "success": True,
        "message": "Token refrescado exitosamente"
    }


@router.post("/logout")
async def logout(
    response: Response,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Cerrar sesión del usuario (limpiar cookies)
    
    Returns:
        Mensaje de confirmación
    """
    # Limpiar cookies
    clear_auth_cookies(response)
    
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
    La autenticación se verifica automáticamente mediante la cookie
    
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
async def verify_session(
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Verificar si hay una sesión activa
    
    Returns:
        Estado de la sesión
    """
    if current_user:
        return {
            "success": True,
            "authenticated": True,
            "user_id": str(current_user["_id"]),
            "email": current_user["email"]
        }
    else:
        return {
            "success": True,
            "authenticated": False
        }


@router.get("/status")
async def auth_status():
    """
    Estado del sistema de autenticación
    
    Returns:
        Configuración y estado
    """
    return {
        "success": True,
        "auth_mode": "cookie_based",
        "cookie_name": COOKIE_NAME,
        "cookie_secure": COOKIE_SECURE,
        "cookie_samesite": COOKIE_SAMESITE,
        "cookie_httponly": COOKIE_HTTPONLY,
        "cookie_max_age": COOKIE_MAX_AGE
    }
