"""
Servicio de Autenticación
Lógica de negocio para registro, login y gestión de usuarios
"""
from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId

from models.user import UserCreate, UserInDB, UserLogin, UserResponse, UserProgress, UserSettings
from services.database import get_database
from services.jwt_service import create_access_token, create_refresh_token
from utils.password import hash_password, verify_password


class AuthService:
    """
    Servicio de autenticación
    """
    
    def __init__(self):
        self.db = None
    
    async def _get_db(self):
        """Obtener instancia de la base de datos"""
        if self.db is None:
            self.db = get_database()
        return self.db
    
    async def register_user(self, user_data: UserCreate) -> Dict[str, Any]:
        """
        Registrar un nuevo usuario
        
        Args:
            user_data: Datos del usuario a registrar
        
        Returns:
            Dict: Usuario creado y tokens
        """
        db = await self._get_db()
        
        # Verificar si el email ya existe
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("El email ya está registrado")
        
        # Hash de la contraseña
        password_hash = hash_password(user_data.password)
        
        # Crear documento de usuario
        user_doc = {
            "email": user_data.email,
            "display_name": user_data.display_name,
            "password_hash": password_hash,
            "auth_provider": "email",
            "created_at": datetime.utcnow(),
            "last_active": datetime.utcnow(),
            "email_verified": False,
            "is_active": True,
            "progress": {
                "modules": {},
                "subtasks": {},
                "notes": {},
                "badges": [],
                "xp": 0,
                "last_sync": None
            },
            "settings": {
                "notifications": True,
                "theme": "dark",
                "language": "es"
            },
            "migrated_from_firebase": False,
            "migration_date": None
        }
        
        # Campos opcionales (solo agregar si tienen valor)
        if hasattr(user_data, 'photo_url') and user_data.photo_url:
            user_doc["photo_url"] = user_data.photo_url
        # NO incluir google_id, firebase_uid si son None (para respetar índice sparse)
        
        # Insertar usuario en la base de datos
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Crear tokens
        access_token = create_access_token(
            data={"sub": str(result.inserted_id), "email": user_data.email}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(result.inserted_id)}
        )
        
        # Convertir a UserResponse
        user_response = self._convert_to_user_response(user_doc)
        
        return {
            "success": True,
            "message": "Usuario registrado exitosamente",
            "user": user_response,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    async def login_user(self, login_data: UserLogin) -> Dict[str, Any]:
        """
        Autenticar usuario
        
        Args:
            login_data: Credenciales de login
        
        Returns:
            Dict: Usuario y tokens
        """
        db = await self._get_db()
        
        # Buscar usuario por email
        user_doc = await db.users.find_one({"email": login_data.email})
        if not user_doc:
            raise ValueError("Email o contraseña incorrectos")
        
        # Verificar contraseña
        if not verify_password(login_data.password, user_doc["password_hash"]):
            raise ValueError("Email o contraseña incorrectos")
        
        # Verificar que el usuario esté activo
        if not user_doc.get("is_active", True):
            raise ValueError("Usuario inactivo")
        
        # Actualizar última actividad
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_active": datetime.utcnow()}}
        )
        user_doc["last_active"] = datetime.utcnow()
        
        # Crear tokens
        access_token = create_access_token(
            data={"sub": str(user_doc["_id"]), "email": user_doc["email"]}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user_doc["_id"])}
        )
        
        # Convertir a UserResponse
        user_response = self._convert_to_user_response(user_doc)
        
        return {
            "success": True,
            "message": "Login exitoso",
            "user": user_response,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtener usuario por ID
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Optional[Dict]: Documento del usuario
        """
        db = await self._get_db()
        
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
            return user_doc
        except Exception as e:
            print(f"Error obteniendo usuario: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Obtener usuario por email
        
        Args:
            email: Email del usuario
        
        Returns:
            Optional[Dict]: Documento del usuario
        """
        db = await self._get_db()
        user_doc = await db.users.find_one({"email": email})
        return user_doc
    
    async def update_user_activity(self, user_id: str) -> bool:
        """
        Actualizar última actividad del usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            bool: True si se actualizó
        """
        db = await self._get_db()
        
        try:
            result = await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_active": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error actualizando actividad: {e}")
            return False
    
    def _convert_to_user_response(self, user_doc: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convertir documento de MongoDB a UserResponse
        
        Args:
            user_doc: Documento de MongoDB
        
        Returns:
            Dict: UserResponse serializable
        """
        return {
            "id": str(user_doc["_id"]),
            "email": user_doc["email"],
            "display_name": user_doc["display_name"],
            "photo_url": user_doc.get("photo_url"),
            "auth_provider": user_doc.get("auth_provider", "email"),
            "created_at": user_doc["created_at"].isoformat() if isinstance(user_doc["created_at"], datetime) else user_doc["created_at"],
            "last_active": user_doc["last_active"].isoformat() if isinstance(user_doc["last_active"], datetime) else user_doc["last_active"],
            "email_verified": user_doc.get("email_verified", False),
            "progress": user_doc.get("progress", {
                "modules": {},
                "subtasks": {},
                "notes": {},
                "badges": [],
                "xp": 0,
                "last_sync": None
            }),
            "settings": user_doc.get("settings", {
                "notifications": True,
                "theme": "dark",
                "language": "es"
            })
        }


# Instancia global del servicio
auth_service = AuthService()
