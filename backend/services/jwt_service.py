"""
Servicio de JWT (JSON Web Tokens)
Manejo de creación y validación de tokens de autenticación
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# Configuración JWT desde .env
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

if not JWT_SECRET:
    raise ValueError("JWT_SECRET no está configurado en .env")


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crear un access token JWT
    
    Args:
        data: Datos a incluir en el token (user_id, email, etc.)
        expires_delta: Tiempo de expiración personalizado
    
    Returns:
        str: Token JWT
    """
    to_encode = data.copy()
    
    # Calcular expiración
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agregar campos estándar
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    # Crear token
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crear un refresh token JWT
    
    Args:
        data: Datos a incluir en el token (user_id principalmente)
    
    Returns:
        str: Refresh token JWT
    """
    to_encode = data.copy()
    
    # Calcular expiración (más larga que access token)
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Agregar campos estándar
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    # Crear token
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Verificar y decodificar un token JWT
    
    Args:
        token: Token JWT a verificar
        token_type: Tipo de token esperado ("access" o "refresh")
    
    Returns:
        Optional[Dict]: Payload del token si es válido, None si no
    """
    try:
        # Decodificar token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Verificar tipo de token
        if payload.get("type") != token_type:
            print(f"Tipo de token incorrecto. Esperado: {token_type}, Recibido: {payload.get('type')}")
            return None
        
        # Verificar expiración (jwt.decode ya lo hace, pero por claridad)
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            print("Token expirado")
            return None
        
        return payload
        
    except JWTError as e:
        print(f"Error decodificando token: {e}")
        return None
    except Exception as e:
        print(f"Error inesperado verificando token: {e}")
        return None


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodificar un token sin verificar (para debugging)
    
    Args:
        token: Token JWT
    
    Returns:
        Optional[Dict]: Payload del token
    """
    try:
        # Decodificar sin verificar firma
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception as e:
        print(f"Error decodificando token: {e}")
        return None


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extraer el user_id de un token
    
    Args:
        token: Token JWT
    
    Returns:
        Optional[str]: User ID si el token es válido
    """
    payload = verify_token(token)
    if payload:
        return payload.get("sub")  # "sub" es el estándar JWT para subject (user_id)
    return None


def get_token_expiration(token: str) -> Optional[datetime]:
    """
    Obtener la fecha de expiración de un token
    
    Args:
        token: Token JWT
    
    Returns:
        Optional[datetime]: Fecha de expiración
    """
    payload = decode_token(token)
    if payload and "exp" in payload:
        return datetime.fromtimestamp(payload["exp"])
    return None


def is_token_expired(token: str) -> bool:
    """
    Verificar si un token está expirado
    
    Args:
        token: Token JWT
    
    Returns:
        bool: True si está expirado, False si no
    """
    expiration = get_token_expiration(token)
    if expiration:
        return expiration < datetime.utcnow()
    return True  # Si no se puede determinar, asumir expirado
