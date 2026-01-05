# 📚 Documentación de Schemas - QA Master Path Backend

**Fecha:** Enero 2025  
**Versión:** 1.0.0

---

## 📋 Índice

1. [Modelos de Usuario](#modelos-de-usuario)
2. [Modelos de Progreso](#modelos-de-progreso)
3. [Validadores](#validadores)
4. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 👤 Modelos de Usuario

### UserCreate
**Propósito:** Crear un nuevo usuario (registro)

```python
{
  "email": "usuario@example.com",
  "display_name": "Juan Pérez",
  "password": "Password123"
}
```

**Validaciones:**
- Email: Formato válido (EmailStr)
- Display Name: 2-100 caracteres
- Password: 
  - Mínimo 8 caracteres
  - Al menos una letra
  - Al menos un número

---

### UserLogin
**Propósito:** Autenticar usuario

```python
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

---

### UserUpdate
**Propósito:** Actualizar datos de usuario (todos los campos opcionales)

```python
{
  "display_name": "Juan Carlos Pérez",
  "photo_url": "https://example.com/photo.jpg",
  "settings": {
    "notifications": false,
    "theme": "light",
    "language": "en"
  }
}
```

---

### UserInDB
**Propósito:** Representación completa del usuario en MongoDB

```python
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "usuario@example.com",
  "display_name": "Juan Pérez",
  "password_hash": "$2b$12$...",
  "photo_url": "https://example.com/photo.jpg",
  "auth_provider": "email",  // "email" | "google" | "firebase"
  "google_id": null,
  "firebase_uid": null,
  
  "created_at": "2025-01-15T10:00:00Z",
  "last_active": "2025-01-15T15:30:00Z",
  "email_verified": true,
  "is_active": true,
  
  "progress": {
    "modules": {"1": true, "2": false},
    "subtasks": {"1-0": true, "1-1": false},
    "notes": {"1": "Mis apuntes"},
    "badges": ["core", "technical"],
    "xp": 150,
    "last_sync": "2025-01-15T15:30:00Z"
  },
  
  "settings": {
    "notifications": true,
    "theme": "dark",
    "language": "es"
  },
  
  "migrated_from_firebase": false,
  "migration_date": null
}
```

**Índices en MongoDB:**
- `email` (unique)
- `google_id` (unique, sparse)
- `created_at`
- `last_active`
- `auth_provider`

---

### UserResponse
**Propósito:** Respuesta de API (sin datos sensibles)

```python
{
  "id": "507f1f77bcf86cd799439011",
  "email": "usuario@example.com",
  "display_name": "Juan Pérez",
  "photo_url": "https://example.com/photo.jpg",
  "auth_provider": "email",
  "created_at": "2025-01-15T10:00:00Z",
  "last_active": "2025-01-15T15:30:00Z",
  "email_verified": true,
  "progress": { ... },
  "settings": { ... }
}
```

**Nota:** NO incluye `password_hash`

---

### UserSettings
**Propósito:** Configuración del usuario

```python
{
  "notifications": true,
  "theme": "dark",  // "light" | "dark" | "auto"
  "language": "es"  // "es" | "en" | "pt"
}
```

---

### UserProgress
**Propósito:** Progreso del usuario (embebido en User)

```python
{
  "modules": {
    "1": true,
    "2": false,
    "3": false
  },
  "subtasks": {
    "1-0": true,
    "1-1": true,
    "2-0": false
  },
  "notes": {
    "1": "Apuntes del módulo 1",
    "2": "Apuntes del módulo 2"
  },
  "badges": ["core", "technical", "advanced"],
  "xp": 350,
  "last_sync": "2025-01-15T15:30:00Z"
}
```

---

### GoogleAuthRequest
**Propósito:** Autenticación con Google OAuth

```python
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYT..."
}
```

---

### PasswordResetRequest
**Propósito:** Solicitar reset de contraseña

```python
{
  "email": "usuario@example.com"
}
```

---

### PasswordResetConfirm
**Propósito:** Confirmar reset de contraseña

```python
{
  "token": "abc123def456",
  "new_password": "NewPassword123"
}
```

---

## 📊 Modelos de Progreso

### ModuleProgressUpdate
**Propósito:** Actualizar progreso de un módulo

```python
{
  "module_id": "1",
  "is_completed": true
}
```

**Validaciones:**
- `module_id` debe ser numérico

---

### SubtaskProgressUpdate
**Propósito:** Actualizar progreso de una subtarea

```python
{
  "module_id": "1",
  "task_index": 0,
  "is_completed": true
}
```

**Propiedad calculada:**
- `subtask_key` → `"1-0"`

---

### NoteUpdate
**Propósito:** Actualizar nota de un módulo

```python
{
  "module_id": "1",
  "note_text": "Estos son mis apuntes del módulo 1..."
}
```

**Validaciones:**
- `note_text`: Máximo 5000 caracteres
- No puede estar vacío (después de strip)

---

### ProgressSync
**Propósito:** Sincronización completa del progreso

```python
{
  "modules": {
    "1": true,
    "2": false,
    "3": false
  },
  "subtasks": {
    "1-0": true,
    "1-1": true,
    "2-0": false
  },
  "notes": {
    "1": "Apuntes del módulo 1",
    "2": "Apuntes del módulo 2"
  },
  "badges": ["core", "technical", "advanced"],
  "xp": 350
}
```

**Validaciones:**
- Badges: Se eliminan duplicados automáticamente
- XP: 0 ≤ xp ≤ 1,000,000

---

### ProgressResponse
**Propósito:** Respuesta de progreso con estadísticas

```python
{
  "modules": { ... },
  "subtasks": { ... },
  "notes": { ... },
  "badges": [ ... ],
  "xp": 250,
  "last_sync": "2025-01-15T15:30:00Z",
  
  // Estadísticas calculadas
  "total_modules": 3,
  "completed_modules": 1,
  "completion_percentage": 33.33
}
```

---

### BadgeAdd
**Propósito:** Agregar un badge al usuario

```python
{
  "badge_name": "advanced-qa"
}
```

**Validaciones:**
- 1-50 caracteres
- Solo letras, números, guiones y guiones bajos
- Se convierte a minúsculas automáticamente

---

### XPAdd
**Propósito:** Agregar XP al usuario

```python
{
  "amount": 50,
  "reason": "Completó el módulo 1"
}
```

**Validaciones:**
- Amount: 1 ≤ amount ≤ 1000
- Reason: Opcional, máximo 200 caracteres

---

### ProgressStats
**Propósito:** Estadísticas completas del progreso

```python
{
  "total_modules": 10,
  "completed_modules": 3,
  "completion_percentage": 30.0,
  "total_subtasks": 50,
  "completed_subtasks": 15,
  "total_notes": 5,
  "total_badges": 3,
  "total_xp": 450,
  "last_activity": "2025-01-15T15:30:00Z"
}
```

---

## ✅ Validadores

### validate_email_format(email: str)
Valida formato de email usando `email-validator`

**Retorna:** `(bool, Optional[str])`

---

### validate_password_strength(password: str)
Valida fortaleza de contraseña:
- Mínimo 8 caracteres
- Al menos una letra
- Al menos un número

**Retorna:** `(bool, Optional[str])`

---

### validate_display_name(name: str)
Valida nombre para mostrar:
- 2-100 caracteres
- Letras, números, espacios, guiones, puntos
- Caracteres Unicode permitidos (ñ, á, etc.)

**Retorna:** `(bool, Optional[str])`

---

### validate_url(url: str)
Valida formato de URL:
- Debe comenzar con http:// o https://
- Formato básico válido

**Retorna:** `(bool, Optional[str])`

---

### validate_module_id(module_id: str)
Valida ID de módulo:
- Debe ser numérico
- Entre 1 y 100

**Retorna:** `(bool, Optional[str])`

---

### validate_badge_name(badge: str)
Valida nombre de badge:
- 2-50 caracteres
- Solo letras, números, guiones y guiones bajos

**Retorna:** `(bool, Optional[str])`

---

### validate_xp_amount(xp: int)
Valida cantidad de XP:
- No negativo
- Máximo 1,000,000

**Retorna:** `(bool, Optional[str])`

---

### sanitize_text(text: str, max_length: int = 5000)
Limpia y sanitiza texto:
- Elimina espacios al inicio y final
- Limita longitud
- Elimina caracteres de control (excepto \n, \r, \t)

**Retorna:** `str`

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Usuario

```python
from models.user import UserCreate

# Validación automática
user_data = UserCreate(
    email="nuevo@example.com",
    display_name="Nuevo Usuario",
    password="Password123"
)

# Si la validación falla, lanza ValidationError
```

---

### Ejemplo 2: Actualizar Progreso

```python
from models.progress import ModuleProgressUpdate

update = ModuleProgressUpdate(
    module_id="1",
    is_completed=True
)

# Usar en endpoint
await update_module_progress(user_id, update)
```

---

### Ejemplo 3: Validar Datos Manualmente

```python
from utils.validators import validate_password_strength

is_valid, error = validate_password_strength("weak")
if not is_valid:
    print(f"Error: {error}")
    # Error: La contraseña debe tener al menos 8 caracteres
```

---

## 🔒 Seguridad

### Datos Sensibles
**NUNCA exponer en APIs:**
- `password_hash`
- `google_id` (solo internamente)
- `firebase_uid` (solo internamente)

**Siempre usar `UserResponse` para respuestas de API**

---

### Validación en Capas

1. **Pydantic Models:** Validación automática de tipos y formatos
2. **Validators:** Validación adicional de lógica de negocio
3. **Database Constraints:** Índices únicos en MongoDB

---

## 📊 Testing

**Tests ejecutados:** 26  
**Tests exitosos:** 26 ✅  
**Tests fallidos:** 0 ❌

Para ejecutar tests:
```bash
cd /app/backend
python test_models.py
```

---

## 🔄 Versionado

- **v1.0.0** (Actual)
  - Modelos iniciales de usuario y progreso
  - Validadores completos
  - Testing implementado

---

**Última actualización:** Día 2 - Enero 2025
