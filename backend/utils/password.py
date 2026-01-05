"""
Utilidades de contraseñas
Manejo de hashing y verificación de contraseñas con bcrypt
"""
import bcrypt
from typing import Tuple


def hash_password(password: str) -> str:
    """
    Hash de una contraseña usando bcrypt
    
    Args:
        password: Contraseña en texto plano
    
    Returns:
        str: Hash de la contraseña
    """
    # Generar salt con 12 rounds (balance entre seguridad y performance)
    salt = bcrypt.gensalt(rounds=12)
    
    # Generar hash
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Retornar como string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar si una contraseña coincide con su hash
    
    Args:
        plain_password: Contraseña en texto plano
        hashed_password: Hash de la contraseña
    
    Returns:
        bool: True si coinciden, False si no
    """
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Error verificando contraseña: {e}")
        return False


def check_password_strength(password: str) -> Tuple[bool, str]:
    """
    Verificar la fortaleza de una contraseña
    
    Args:
        password: Contraseña a verificar
    
    Returns:
        Tuple[bool, str]: (es_válida, mensaje_error)
    """
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    
    if not any(char.isdigit() for char in password):
        return False, "La contraseña debe contener al menos un número"
    
    if not any(char.isalpha() for char in password):
        return False, "La contraseña debe contener al menos una letra"
    
    # Opcional: verificar caracteres especiales
    # if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?' for char in password):
    #     return False, "La contraseña debe contener al menos un carácter especial"
    
    return True, "Contraseña válida"


def generate_temp_password(length: int = 12) -> str:
    """
    Generar una contraseña temporal aleatoria
    
    Args:
        length: Longitud de la contraseña (default: 12)
    
    Returns:
        str: Contraseña temporal
    """
    import secrets
    import string
    
    # Caracteres permitidos
    alphabet = string.ascii_letters + string.digits
    
    # Generar contraseña aleatoria
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    # Asegurar que tenga al menos una letra y un número
    if not any(c.isdigit() for c in password):
        password = password[:-1] + secrets.choice(string.digits)
    
    if not any(c.isalpha() for c in password):
        password = password[:-1] + secrets.choice(string.ascii_letters)
    
    return password
