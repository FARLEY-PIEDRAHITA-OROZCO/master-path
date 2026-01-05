"""
Tests unitarios para utils/password.py
"""
import pytest
from utils.password import (
    hash_password,
    verify_password,
    check_password_strength,
    generate_temp_password
)


class TestPasswordHashing:
    """Tests para hashing de contraseñas"""
    
    def test_hash_password_returns_string(self):
        """Test que hash_password retorna un string"""
        password = "TestPassword123"
        hashed = hash_password(password)
        
        assert isinstance(hashed, str)
        assert len(hashed) > 0
        assert hashed != password  # No debe ser igual a la original
    
    def test_hash_password_different_results(self):
        """Test que dos hashes de la misma contraseña son diferentes (salt)"""
        password = "TestPassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # Deben ser diferentes por el salt aleatorio
        assert hash1 != hash2
    
    def test_verify_password_correct(self):
        """Test verificación de contraseña correcta"""
        password = "TestPassword123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test verificación de contraseña incorrecta"""
        password = "TestPassword123"
        wrong_password = "WrongPassword456"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_empty(self):
        """Test verificación con contraseña vacía"""
        password = "TestPassword123"
        hashed = hash_password(password)
        
        assert verify_password("", hashed) is False


class TestPasswordStrength:
    """Tests para validación de fortaleza de contraseñas"""
    
    def test_strong_password(self):
        """Test contraseña fuerte válida"""
        password = "TestPassword123"
        is_valid, message = check_password_strength(password)
        
        assert is_valid is True
        assert "válida" in message.lower()
    
    def test_password_too_short(self):
        """Test contraseña muy corta"""
        password = "Test12"
        is_valid, message = check_password_strength(password)
        
        assert is_valid is False
        assert "8 caracteres" in message
    
    def test_password_no_digit(self):
        """Test contraseña sin números"""
        password = "TestPassword"
        is_valid, message = check_password_strength(password)
        
        assert is_valid is False
        assert "número" in message
    
    def test_password_no_letter(self):
        """Test contraseña sin letras"""
        password = "12345678"
        is_valid, message = check_password_strength(password)
        
        assert is_valid is False
        assert "letra" in message
    
    def test_password_empty(self):
        """Test contraseña vacía"""
        password = ""
        is_valid, message = check_password_strength(password)
        
        assert is_valid is False


class TestGenerateTempPassword:
    """Tests para generación de contraseñas temporales"""
    
    def test_generate_temp_password_default_length(self):
        """Test generación de contraseña con longitud por defecto"""
        password = generate_temp_password()
        
        assert isinstance(password, str)
        assert len(password) == 12
    
    def test_generate_temp_password_custom_length(self):
        """Test generación de contraseña con longitud personalizada"""
        length = 16
        password = generate_temp_password(length)
        
        assert len(password) == length
    
    def test_generate_temp_password_has_digit(self):
        """Test que contraseña generada contiene número"""
        password = generate_temp_password()
        
        assert any(c.isdigit() for c in password)
    
    def test_generate_temp_password_has_letter(self):
        """Test que contraseña generada contiene letra"""
        password = generate_temp_password()
        
        assert any(c.isalpha() for c in password)
    
    def test_generate_temp_password_unique(self):
        """Test que contraseñas generadas son únicas"""
        password1 = generate_temp_password()
        password2 = generate_temp_password()
        
        assert password1 != password2
