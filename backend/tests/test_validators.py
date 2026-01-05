"""
Tests unitarios para utils/validators.py
"""
import pytest
from utils.validators import (
    validate_email_format,
    validate_password_strength,
    validate_display_name,
    validate_url,
    validate_module_id,
    validate_badge_name,
    validate_xp_amount,
    validate_theme,
    validate_language,
    sanitize_text
)


class TestEmailValidation:
    """Tests para validación de emails"""
    
    def test_valid_email(self):
        """Test email válido"""
        is_valid, _ = validate_email_format("test@example.com")
        assert is_valid is True
    
    def test_invalid_email_no_at(self):
        """Test email sin @"""
        is_valid, message = validate_email_format("testexample.com")
        assert is_valid is False
        assert "@" in message or "inválido" in message.lower()
    
    def test_invalid_email_no_domain(self):
        """Test email sin dominio"""
        is_valid, message = validate_email_format("test@")
        assert is_valid is False
    
    def test_empty_email(self):
        """Test email vacío"""
        is_valid, message = validate_email_format("")
        assert is_valid is False


class TestPasswordValidation:
    """Tests para validación de contraseñas"""
    
    def test_valid_password(self):
        """Test contraseña válida"""
        is_valid, _ = validate_password_strength("TestPassword123")
        assert is_valid is True
    
    def test_password_too_short(self):
        """Test contraseña muy corta"""
        is_valid, message = validate_password_strength("Test1")
        assert is_valid is False
        assert "8" in message
    
    def test_password_no_number(self):
        """Test contraseña sin número"""
        is_valid, message = validate_password_strength("TestPassword")
        assert is_valid is False
        assert "número" in message.lower()
    
    def test_password_no_letter(self):
        """Test contraseña sin letra"""
        is_valid, message = validate_password_strength("12345678")
        assert is_valid is False
        assert "letra" in message.lower()


class TestDisplayNameValidation:
    """Tests para validación de nombres"""
    
    def test_valid_display_name(self):
        """Test nombre válido"""
        is_valid, _ = validate_display_name("John Doe")
        assert is_valid is True
    
    def test_display_name_too_short(self):
        """Test nombre muy corto"""
        is_valid, message = validate_display_name("J")
        assert is_valid is False
    
    def test_display_name_too_long(self):
        """Test nombre muy largo"""
        long_name = "A" * 101
        is_valid, message = validate_display_name(long_name)
        assert is_valid is False
    
    def test_display_name_empty(self):
        """Test nombre vacío"""
        is_valid, message = validate_display_name("")
        assert is_valid is False


class TestURLValidation:
    """Tests para validación de URLs"""
    
    def test_valid_http_url(self):
        """Test URL HTTP válida"""
        is_valid, _ = validate_url("http://example.com")
        assert is_valid is True
    
    def test_valid_https_url(self):
        """Test URL HTTPS válida"""
        is_valid, _ = validate_url("https://example.com/path/to/page")
        assert is_valid is True
    
    def test_invalid_url_no_protocol(self):
        """Test URL sin protocolo"""
        is_valid, message = validate_url("example.com")
        assert is_valid is False
    
    def test_empty_url(self):
        """Test URL vacía"""
        is_valid, message = validate_url("")
        assert is_valid is False


class TestModuleIDValidation:
    """Tests para validación de IDs de módulo"""
    
    def test_valid_module_id(self):
        """Test ID de módulo válido"""
        is_valid, _ = validate_module_id("1")
        assert is_valid is True
        
        is_valid, _ = validate_module_id("123")
        assert is_valid is True
    
    def test_empty_module_id(self):
        """Test ID vacío"""
        is_valid, message = validate_module_id("")
        assert is_valid is False


class TestBadgeValidation:
    """Tests para validación de badges"""
    
    def test_valid_badge_name(self):
        """Test nombre de badge válido"""
        is_valid, _ = validate_badge_name("first-steps")
        assert is_valid is True
    
    def test_badge_name_too_long(self):
        """Test nombre de badge muy largo"""
        long_name = "a" * 51
        is_valid, message = validate_badge_name(long_name)
        assert is_valid is False
    
    def test_empty_badge_name(self):
        """Test nombre vacío"""
        is_valid, message = validate_badge_name("")
        assert is_valid is False


class TestXPValidation:
    """Tests para validación de XP"""
    
    def test_valid_xp_amount(self):
        """Test cantidad de XP válida"""
        is_valid, _ = validate_xp_amount(50)
        assert is_valid is True
    
    def test_xp_amount_negative(self):
        """Test XP negativo"""
        is_valid, message = validate_xp_amount(-10)
        assert is_valid is False
    
    def test_xp_amount_too_large(self):
        """Test XP muy grande"""
        is_valid, message = validate_xp_amount(10000)
        assert is_valid is False
    
    def test_xp_amount_zero(self):
        """Test XP en cero (inválido)"""
        is_valid, message = validate_xp_amount(0)
        assert is_valid is False


class TestThemeValidation:
    """Tests para validación de tema"""
    
    def test_valid_theme_dark(self):
        """Test tema dark"""
        is_valid, _ = validate_theme("dark")
        assert is_valid is True
    
    def test_valid_theme_light(self):
        """Test tema light"""
        is_valid, _ = validate_theme("light")
        assert is_valid is True
    
    def test_valid_theme_auto(self):
        """Test tema auto"""
        is_valid, _ = validate_theme("auto")
        assert is_valid is True
    
    def test_invalid_theme(self):
        """Test tema inválido"""
        is_valid, message = validate_theme("custom")
        assert is_valid is False


class TestLanguageValidation:
    """Tests para validación de idioma"""
    
    def test_valid_language_es(self):
        """Test idioma español"""
        is_valid, _ = validate_language("es")
        assert is_valid is True
    
    def test_valid_language_en(self):
        """Test idioma inglés"""
        is_valid, _ = validate_language("en")
        assert is_valid is True
    
    def test_invalid_language(self):
        """Test idioma inválido"""
        is_valid, message = validate_language("fr")
        assert is_valid is False


class TestTextSanitization:
    """Tests para sanitización de texto"""
    
    def test_sanitize_normal_text(self):
        """Test sanitización de texto normal"""
        text = "Normal text"
        sanitized = sanitize_text(text)
        assert sanitized == text
    
    def test_sanitize_text_with_whitespace(self):
        """Test sanitización de texto con espacios extra"""
        text = "  Text with   spaces  "
        sanitized = sanitize_text(text)
        assert sanitized == "Text with spaces"
    
    def test_sanitize_empty_text(self):
        """Test sanitización de texto vacío"""
        text = ""
        sanitized = sanitize_text(text)
        assert sanitized == ""
