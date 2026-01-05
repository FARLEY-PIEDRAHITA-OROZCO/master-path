"""
Validadores personalizados
Funciones de validación reutilizables
"""
import re
from typing import Optional
from email_validator import validate_email, EmailNotValidError


def validate_email_format(email: str) -> tuple[bool, Optional[str]]:
    """
    Validar formato de email
    
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        # Validar y normalizar
        validation = validate_email(email, check_deliverability=False)
        return True, None
    except EmailNotValidError as e:
        return False, str(e)


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validar fortaleza de la contraseña
    
    Requisitos:
    - Mínimo 8 caracteres
    - Al menos una letra
    - Al menos un número
    - Opcional: caracteres especiales
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    
    if not any(char.isalpha() for char in password):
        return False, "La contraseña debe contener al menos una letra"
    
    if not any(char.isdigit() for char in password):
        return False, "La contraseña debe contener al menos un número"
    
    return True, None


def validate_display_name(name: str) -> tuple[bool, Optional[str]]:
    """
    Validar nombre para mostrar
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not name or len(name.strip()) < 2:
        return False, "El nombre debe tener al menos 2 caracteres"
    
    if len(name) > 100:
        return False, "El nombre no puede exceder 100 caracteres"
    
    # Permitir letras, números, espacios y algunos caracteres especiales
    if not re.match(r'^[a-zA-Z0-9À-ſ\s\-\.]+$', name):
        return False, "El nombre contiene caracteres no permitidos"
    
    return True, None


def validate_url(url: str) -> tuple[bool, Optional[str]]:
    """
    Validar formato de URL
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not url:
        return True, None  # URLs opcionales
    
    # Patrón básico de URL
    url_pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    
    if not url_pattern.match(url):
        return False, "Formato de URL inválido"
    
    return True, None


def validate_module_id(module_id: str) -> tuple[bool, Optional[str]]:
    """
    Validar ID de módulo
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not module_id:
        return False, "El ID del módulo es requerido"
    
    if not module_id.isdigit():
        return False, "El ID del módulo debe ser numérico"
    
    module_num = int(module_id)
    if module_num < 1 or module_num > 100:
        return False, "El ID del módulo debe estar entre 1 y 100"
    
    return True, None


def validate_badge_name(badge: str) -> tuple[bool, Optional[str]]:
    """
    Validar nombre de badge
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not badge:
        return False, "El nombre del badge es requerido"
    
    if len(badge) < 2 or len(badge) > 50:
        return False, "El nombre del badge debe tener entre 2 y 50 caracteres"
    
    # Solo letras, números, guiones y guiones bajos
    if not re.match(r'^[a-z0-9\-_]+$', badge.lower()):
        return False, "El badge solo puede contener letras, números, guiones y guiones bajos"
    
    return True, None


def sanitize_text(text: str, max_length: int = 5000) -> str:
    """
    Limpiar y sanitizar texto de entrada
    
    Args:
        text: Texto a sanitizar
        max_length: Longitud máxima permitida
    
    Returns:
        str: Texto sanitizado
    """
    if not text:
        return ""
    
    # Eliminar espacios al inicio y final
    text = text.strip()
    
    # Limitar longitud
    if len(text) > max_length:
        text = text[:max_length]
    
    # Eliminar caracteres de control excepto \n, \r, \t
    text = ''.join(char for char in text if char.isprintable() or char in '\n\r\t')
    
    return text


def validate_xp_amount(xp: int) -> tuple[bool, Optional[str]]:
    """
    Validar cantidad de XP
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if xp < 0:
        return False, "El XP no puede ser negativo"
    
    if xp > 1000000:
        return False, "El XP excede el máximo permitido"
    
    return True, None


def validate_theme(theme: str) -> tuple[bool, Optional[str]]:
    """
    Validar tema de la aplicación
    
    Returns:
        tuple: (is_valid, error_message)
    """
    allowed_themes = ['light', 'dark', 'auto']
    
    if theme not in allowed_themes:
        return False, f"El tema debe ser uno de: {', '.join(allowed_themes)}"
    
    return True, None


def validate_language(language: str) -> tuple[bool, Optional[str]]:
    """
    Validar idioma
    
    Returns:
        tuple: (is_valid, error_message)
    """
    allowed_languages = ['es', 'en', 'pt']
    
    if language not in allowed_languages:
        return False, f"El idioma debe ser uno de: {', '.join(allowed_languages)}"
    
    return True, None
