"""
Tests unitarios para services/jwt_service.py
"""
import pytest
from datetime import datetime, timedelta
from services.jwt_service import (
    create_access_token,
    create_refresh_token,
    verify_token,
    decode_token,
    get_user_id_from_token,
    get_token_expiration,
    is_token_expired
)


class TestTokenCreation:
    """Tests para creación de tokens"""
    
    def test_create_access_token(self):
        """Test creación de access token"""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_refresh_token(self):
        """Test creación de refresh token"""
        data = {"sub": "user123"}
        token = create_refresh_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_tokens_are_different(self):
        """Test que access y refresh tokens son diferentes"""
        data = {"sub": "user123"}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)
        
        assert access_token != refresh_token
    
    def test_create_token_with_custom_expiration(self):
        """Test creación de token con expiración personalizada"""
        data = {"sub": "user123"}
        custom_delta = timedelta(minutes=5)
        token = create_access_token(data, expires_delta=custom_delta)
        
        assert isinstance(token, str)
        
        # Verificar que tenga la expiración correcta
        payload = decode_token(token)
        exp_time = datetime.fromtimestamp(payload["exp"])
        expected_time = datetime.utcnow() + custom_delta
        
        # Debe estar dentro de 10 segundos de diferencia
        assert abs((exp_time - expected_time).total_seconds()) < 10


class TestTokenVerification:
    """Tests para verificación de tokens"""
    
    def test_verify_valid_access_token(self):
        """Test verificación de access token válido"""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        
        payload = verify_token(token, token_type="access")
        
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
        assert payload["type"] == "access"
    
    def test_verify_valid_refresh_token(self):
        """Test verificación de refresh token válido"""
        data = {"sub": "user123"}
        token = create_refresh_token(data)
        
        payload = verify_token(token, token_type="refresh")
        
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["type"] == "refresh"
    
    def test_verify_wrong_token_type(self):
        """Test verificación con tipo de token incorrecto"""
        data = {"sub": "user123"}
        access_token = create_access_token(data)
        
        # Intentar verificar como refresh token
        payload = verify_token(access_token, token_type="refresh")
        
        assert payload is None
    
    def test_verify_invalid_token(self):
        """Test verificación de token inválido"""
        invalid_token = "invalid.token.here"
        
        payload = verify_token(invalid_token)
        
        assert payload is None
    
    def test_verify_expired_token(self):
        """Test verificación de token expirado"""
        data = {"sub": "user123"}
        # Crear token con expiración inmediata
        token = create_access_token(data, expires_delta=timedelta(seconds=-10))
        
        payload = verify_token(token)
        
        assert payload is None


class TestTokenDecoding:
    """Tests para decodificación de tokens"""
    
    def test_decode_token(self):
        """Test decodificación de token"""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
    
    def test_get_user_id_from_token(self):
        """Test extracción de user_id del token"""
        user_id = "user123"
        data = {"sub": user_id}
        token = create_access_token(data)
        
        extracted_id = get_user_id_from_token(token)
        
        assert extracted_id == user_id
    
    def test_get_user_id_from_invalid_token(self):
        """Test extracción de user_id de token inválido"""
        invalid_token = "invalid.token.here"
        
        user_id = get_user_id_from_token(invalid_token)
        
        assert user_id is None
    
    def test_get_token_expiration(self):
        """Test obtención de fecha de expiración"""
        data = {"sub": "user123"}
        token = create_access_token(data)
        
        expiration = get_token_expiration(token)
        
        assert expiration is not None
        assert isinstance(expiration, datetime)
        assert expiration > datetime.utcnow()
    
    def test_is_token_expired_valid(self):
        """Test verificación de token no expirado"""
        data = {"sub": "user123"}
        token = create_access_token(data)
        
        assert is_token_expired(token) is False
    
    def test_is_token_expired_expired(self):
        """Test verificación de token expirado"""
        data = {"sub": "user123"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-10))
        
        assert is_token_expired(token) is True
