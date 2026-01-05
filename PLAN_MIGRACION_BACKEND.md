# 🔄 Plan de Migración: Firebase → Backend Propio

**Proyecto:** QA Master Path  
**Fecha:** Enero 2025  
**Estado:** Propuesta para validación

---

## 📊 1. ANÁLISIS DE LA ARQUITECTURA ACTUAL

### 1.1 Servicios Firebase en Uso

| Servicio | Uso Actual | Archivos Afectados |
|----------|------------|-------------------|
| **Firebase Authentication** | Login Email/Password + Google OAuth | `auth-service.js`, `auth-ui.js`, `auth-guard.js` |
| **Cloud Firestore** | Sincronización de progreso del usuario | `storage.js`, `auth-service.js` |
| **Firebase SDK** | Inicialización y configuración | `firebase-config.js` |

### 1.2 Estructura de Datos en Firestore

```javascript
// Colección: users/{uid}
{
  email: string,
  displayName: string,
  photoURL: string (opcional),
  createdAt: timestamp,
  lastActive: timestamp,
  provider: string ("email" | "google"),
  progress: {
    "1": true,
    "2": false,
    // ... módulos completados
  },
  subtasks: {
    "1-0": true,
    "1-1": false,
    // ... tareas individuales
  },
  notes: {
    "1": "Mis notas del módulo 1",
    // ... notas por módulo
  },
  badges: ["core", "technical"],
  xp: number,
  settings: {
    notifications: boolean,
    theme: string
  }
}
```

### 1.3 Flujo de Autenticación Actual

```
1. Usuario abre página protegida
   ↓
2. auth-guard.js verifica authService.isAuthenticated()
   ↓
3. Si no auth → redirige a /pages/auth.html
   ↓
4. Usuario hace login
   ↓
5. Firebase Auth retorna token + uid
   ↓
6. authService carga datos de Firestore
   ↓
7. Datos se guardan en LocalStorage (cache)
   ↓
8. Usuario redirigido a página original
```

### 1.4 Infraestructura Existente

- ✅ **MongoDB**: Ya instalado y corriendo (puerto 27017)
- ✅ **FastAPI**: Backend dummy existente (puerto 8001)
- ✅ **Supervisor**: Gestión de procesos configurada
- ✅ **Nginx**: Proxy configurado

---

## 🎯 2. ARQUITECTURA DEL NUEVO BACKEND

### 2.1 Stack Tecnológico

```
Backend:    FastAPI (Python 3.11)
Database:   MongoDB (NoSQL)
Auth:       JWT (JSON Web Tokens)
Password:   bcrypt (hashing seguro)
Sessions:   Redis (opcional, para refresh tokens)
CORS:       Configurado para frontend en localhost:3000
```

### 2.2 Estructura de Directorios

```
/app/backend/
├── server.py                   # Punto de entrada FastAPI
├── requirements.txt            # Dependencias Python
├── .env                        # Variables de entorno (JWT_SECRET, MONGO_URL)
│
├── models/                     # Modelos de datos
│   ├── __init__.py
│   ├── user.py                 # Modelo de Usuario
│   └── progress.py             # Modelo de Progreso
│
├── routes/                     # Endpoints API
│   ├── __init__.py
│   ├── auth.py                 # /api/auth/* (login, register, logout)
│   ├── user.py                 # /api/user/* (perfil, datos)
│   └── progress.py             # /api/progress/* (sync, update)
│
├── services/                   # Lógica de negocio
│   ├── __init__.py
│   ├── auth_service.py         # Lógica de autenticación
│   ├── jwt_service.py          # Manejo de JWT
│   └── database.py             # Conexión MongoDB
│
├── middleware/                 # Middleware personalizado
│   ├── __init__.py
│   └── auth_middleware.py      # Verificación de JWT
│
└── utils/                      # Utilidades
    ├── __init__.py
    ├── password.py             # Hashing de contraseñas
    └── validators.py           # Validaciones
```

### 2.3 Esquema MongoDB

```javascript
// Colección: users
{
  _id: ObjectId,
  email: string (único, indexed),
  password_hash: string,
  display_name: string,
  photo_url: string | null,
  auth_provider: "email" | "google",
  google_id: string | null (único si existe),
  created_at: ISODate,
  last_active: ISODate,
  email_verified: boolean,
  is_active: boolean,
  
  // Datos de progreso embebidos
  progress: {
    modules: {
      "1": true,
      "2": false
    },
    subtasks: {
      "1-0": true
    },
    notes: {
      "1": "Texto"
    },
    badges: ["core"],
    xp: number,
    last_sync: ISODate
  },
  
  settings: {
    notifications: boolean,
    theme: string
  }
}

// Índices
email (unique)
google_id (unique, sparse)
created_at
last_active
```

### 2.4 API Endpoints

#### Autenticación (`/api/auth/`)

```
POST   /api/auth/register
  Body: { email, password, displayName }
  Response: { success, user, token }

POST   /api/auth/login
  Body: { email, password }
  Response: { success, user, token }

POST   /api/auth/google
  Body: { idToken } (Google ID Token)
  Response: { success, user, token }

POST   /api/auth/refresh
  Body: { refreshToken }
  Response: { accessToken }

POST   /api/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { success }

POST   /api/auth/reset-password
  Body: { email }
  Response: { success, message }
```

#### Usuario (`/api/user/`)

```
GET    /api/user/me
  Headers: Authorization: Bearer <token>
  Response: { user }

PUT    /api/user/me
  Headers: Authorization: Bearer <token>
  Body: { displayName, photoUrl, settings }
  Response: { user }

DELETE /api/user/me
  Headers: Authorization: Bearer <token>
  Response: { success }
```

#### Progreso (`/api/progress/`)

```
GET    /api/progress
  Headers: Authorization: Bearer <token>
  Response: { progress, subtasks, notes, badges, xp }

PUT    /api/progress/module
  Headers: Authorization: Bearer <token>
  Body: { moduleId, isCompleted }
  Response: { progress }

PUT    /api/progress/subtask
  Headers: Authorization: Bearer <token>
  Body: { moduleId, taskIndex, isCompleted }
  Response: { subtasks }

PUT    /api/progress/note
  Headers: Authorization: Bearer <token>
  Body: { moduleId, noteText }
  Response: { notes }

POST   /api/progress/sync
  Headers: Authorization: Bearer <token>
  Body: { progress, subtasks, notes, badges, xp }
  Response: { success, synced_at }
```

---

## 📋 3. ESTRATEGIA DE MIGRACIÓN

### 3.1 Principios de la Migración

1. **Coexistencia Temporal**: Firebase y backend propio funcionarán simultáneamente
2. **Migración Gradual**: Por módulos, no todo de golpe
3. **Reversibilidad**: Poder volver a Firebase si hay problemas
4. **Sin Downtime**: La app sigue funcionando durante la migración
5. **Dual Write**: Escribir en ambos sistemas temporalmente

### 3.2 Fases de Migración

```
FASE 1: Preparación (2-3 días)
  ├─ Configurar backend FastAPI completo
  ├─ Implementar modelos MongoDB
  ├─ Crear endpoints de autenticación
  ├─ Testing exhaustivo del backend
  └─ Documentar API

FASE 2: Autenticación (3-4 días)
  ├─ Crear nuevo auth-service-v2.js (backend propio)
  ├─ Implementar manejo de JWT en frontend
  ├─ Feature flag para cambiar entre Firebase/Backend
  ├─ Testing de login/register
  └─ Migración de usuarios existentes (script)

FASE 3: Sincronización de Datos (2-3 días)
  ├─ Actualizar storage.js para usar backend
  ├─ Dual write (Firebase + Backend) temporalmente
  ├─ Script de migración masiva de datos
  ├─ Testing de sincronización
  └─ Validación de integridad de datos

FASE 4: Deprecación de Firebase (1-2 días)
  ├─ Eliminar dependencia de firebase package
  ├─ Remover firebase-config.js
  ├─ Limpiar código legacy
  ├─ Actualizar documentación
  └─ Testing final completo

FASE 5: Optimización (1-2 días)
  ├─ Implementar refresh tokens
  ├─ Configurar rate limiting
  ├─ Optimizar queries MongoDB
  ├─ Implementar caching
  └─ Monitoring y logs
```

### 3.3 Migración de Usuarios Existentes

**Script de Migración**:

```python
# /app/backend/scripts/migrate_firebase_users.py

"""
Script para migrar usuarios de Firebase a MongoDB

Uso:
  python migrate_firebase_users.py --firebase-creds firebase-admin.json
"""

import firebase_admin
from firebase_admin import credentials, auth, firestore
from pymongo import MongoClient
import bcrypt
from datetime import datetime

# 1. Conectar a Firebase Admin
cred = credentials.Certificate('firebase-admin.json')
firebase_admin.initialize_app(cred)
db_firestore = firestore.client()

# 2. Conectar a MongoDB
mongo_client = MongoClient('mongodb://localhost:27017/')
db_mongo = mongo_client['qa_master_path']
users_collection = db_mongo['users']

# 3. Obtener usuarios de Firebase
users = auth.list_users().iterate_all()
migrated_count = 0

for user in users:
    try:
        # Obtener datos adicionales de Firestore
        user_doc = db_firestore.collection('users').document(user.uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Crear documento en MongoDB
        mongo_user = {
            'firebase_uid': user.uid,  # Guardar para referencia
            'email': user.email,
            'display_name': user_data.get('displayName', user.display_name),
            'photo_url': user_data.get('photoURL', user.photo_url),
            'auth_provider': user_data.get('provider', 'email'),
            'google_id': None,  # Se actualizará si es Google
            'created_at': user_data.get('createdAt'),
            'last_active': user_data.get('lastActive'),
            'email_verified': user.email_verified,
            'is_active': True,
            
            # Migrar progreso
            'progress': {
                'modules': user_data.get('progress', {}),
                'subtasks': user_data.get('subtasks', {}),
                'notes': user_data.get('notes', {}),
                'badges': user_data.get('badges', []),
                'xp': user_data.get('xp', 0),
                'last_sync': datetime.utcnow()
            },
            
            'settings': user_data.get('settings', {
                'notifications': True,
                'theme': 'dark'
            }),
            
            # Migración metadata
            'migrated_from_firebase': True,
            'migration_date': datetime.utcnow()
        }
        
        # Insertar en MongoDB
        users_collection.insert_one(mongo_user)
        migrated_count += 1
        print(f"✅ Migrado: {user.email}")
        
    except Exception as e:
        print(f"❌ Error migrando {user.email}: {e}")

print(f"\n🎉 Migración completada: {migrated_count} usuarios")
```

**Estrategia**:
1. Los usuarios existentes pueden hacer "reset password" para generar nueva contraseña
2. O implementar login temporal con Firebase UID como contraseña inicial
3. Enviar email masivo explicando el cambio

---

## 📅 4. CRONOGRAMA DETALLADO

### Semana 1: Preparación y Backend (5 días)

**Día 1: Setup Inicial**
- [ ] Crear estructura de directorios del backend
- [ ] Actualizar requirements.txt
- [ ] Configurar .env con JWT_SECRET
- [ ] Configurar conexión MongoDB
- [ ] Testing de conexión

**Día 2: Modelos y Database**
- [ ] Implementar models/user.py
- [ ] Implementar models/progress.py
- [ ] Crear índices en MongoDB
- [ ] Testing de modelos
- [ ] Documentar schemas

**Día 3: Autenticación Backend**
- [ ] Implementar services/auth_service.py
- [ ] Implementar services/jwt_service.py
- [ ] Implementar utils/password.py (bcrypt)
- [ ] Implementar routes/auth.py
- [ ] Testing de endpoints

**Día 4: Endpoints de Usuario y Progreso**
- [ ] Implementar routes/user.py
- [ ] Implementar routes/progress.py
- [ ] Implementar middleware/auth_middleware.py
- [ ] Testing de todos los endpoints
- [ ] Documentar API (Swagger/OpenAPI)

**Día 5: Testing Backend Completo**
- [ ] Tests unitarios de servicios
- [ ] Tests de integración de API
- [ ] Testing manual con Postman
- [ ] Fix de bugs encontrados
- [ ] Performance testing

### Semana 2: Integración Frontend (5 días)

**Día 6: Nuevo AuthService**
- [ ] Crear auth-service-v2.js
- [ ] Implementar login con JWT
- [ ] Implementar register
- [ ] Implementar manejo de tokens (localStorage)
- [ ] Implementar refresh token logic

**Día 7: Feature Flag y Dual Mode**
- [ ] Crear config.js con flag USE_FIREBASE
- [ ] Adaptar auth-guard.js para dual mode
- [ ] Adaptar auth-ui.js para dual mode
- [ ] Testing de ambos modos
- [ ] Documentar cambios

**Día 8: Actualizar Storage Service**
- [ ] Modificar storage.js para usar backend API
- [ ] Implementar dual write (Firebase + Backend)
- [ ] Implementar fallback a localStorage
- [ ] Testing de sincronización
- [ ] Validar integridad de datos

**Día 9: Testing E2E**
- [ ] Testing de flujo completo (registro → login → uso → logout)
- [ ] Testing de sincronización cross-device
- [ ] Testing de edge cases
- [ ] Fix de bugs encontrados
- [ ] Performance testing

**Día 10: Migración de Usuarios**
- [ ] Ejecutar script de migración
- [ ] Validar datos migrados
- [ ] Testing con usuarios migrados
- [ ] Preparar comunicación a usuarios
- [ ] Documentar proceso

### Semana 3: Deprecación y Optimización (3 días)

**Día 11: Deprecar Firebase**
- [ ] Cambiar feature flag a backend por defecto
- [ ] Eliminar dependencia firebase de package.json
- [ ] Remover firebase-config.js
- [ ] Limpiar código de auth-service.js (viejo)
- [ ] Actualizar documentación

**Día 12: Optimización**
- [ ] Implementar rate limiting en backend
- [ ] Implementar caching con Redis (opcional)
- [ ] Optimizar queries MongoDB (explain plans)
- [ ] Implementar logging estructurado
- [ ] Configurar monitoring

**Día 13: Testing Final y Deploy**
- [ ] Testing completo de regresión
- [ ] Testing de performance
- [ ] Preparar plan de rollback
- [ ] Deploy gradual (10% → 50% → 100%)
- [ ] Monitoring post-deploy

**Total**: 13 días (~3 semanas)

---

## 🔐 5. SEGURIDAD

### 5.1 Autenticación

```python
# Hashing de contraseñas con bcrypt
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
```

### 5.2 JWT Tokens

```python
# Configuración JWT
JWT_SECRET = os.getenv('JWT_SECRET')  # 256-bit random key
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Estructura del token
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890,
  "type": "access"
}
```

### 5.3 Protección de Endpoints

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Uso
@app.get("/api/user/me")
async def get_user_profile(current_user = Depends(get_current_user)):
    return current_user
```

### 5.4 CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev
        "http://localhost:8000",  # Frontend local
        "https://tu-dominio.com"  # Producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ⚠️ 6. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Pérdida de datos durante migración** | Media | Alto | - Backups antes de migrar<br>- Dual write temporal<br>- Validación de integridad<br>- Plan de rollback |
| **Downtime durante cambio** | Baja | Alto | - Migración gradual<br>- Feature flags<br>- Coexistencia Firebase/Backend |
| **Bugs en nuevo backend** | Alta | Medio | - Testing exhaustivo<br>- Code review<br>- Testing de usuarios beta |
| **Performance inferior a Firebase** | Media | Medio | - Optimización de queries<br>- Caching<br>- Indexación correcta |
| **Problemas con OAuth Google** | Media | Medio | - Mantener Firebase solo para Google OAuth temporalmente<br>- Implementar OAuth propio después |

---

## 🔄 7. PLAN DE ROLLBACK

### Si algo sale mal:

1. **Cambiar feature flag**:
   ```javascript
   // /app/app/assets/js/config.js
   export const USE_FIREBASE = true;  // Volver a Firebase
   ```

2. **Restaurar dependencias**:
   ```bash
   npm install firebase@12.7.0
   ```

3. **Reactivar archivos**:
   - Restaurar `firebase-config.js`
   - Restaurar `auth-service.js` (versión Firebase)

4. **Comunicar a usuarios**:
   - Enviar email explicando situación
   - Disculpas por inconvenientes

**Tiempo estimado de rollback**: 15 minutos

---

## 📊 8. MÉTRICAS DE ÉXITO

### KPIs a Monitorear

1. **Funcionalidad**:
   - ✅ 100% de usuarios pueden hacer login
   - ✅ 100% de datos sincronizados correctamente
   - ✅ 0 pérdida de datos

2. **Performance**:
   - ⚡ Login en < 2 segundos
   - ⚡ Sincronización en < 1 segundo
   - ⚡ API response time < 500ms

3. **Disponibilidad**:
   - 🟢 Uptime > 99.9%
   - 🟢 0 downtime durante migración

4. **Costos**:
   - 💰 Reducción de costos (Firebase → Self-hosted)
   - 💰 Sin cargos por Firebase Auth/Firestore

---

## 💰 9. ANÁLISIS DE COSTOS

### Firebase (Actual)

```
Firebase Auth:           Gratis hasta 50K MAU
Firebase Firestore:      Gratis hasta:
  - 50K lecturas/día
  - 20K escrituras/día
  - 1GB storage

Límites probables:
- Con 1000 usuarios activos
- ~5 sync por usuario/día
- = 5000 escrituras/día ✅ OK

Costo estimado: $0-10/mes (bajo uso)
```

### Backend Propio (Propuesto)

```
Servidor:                $0 (ya existe en Emergent)
MongoDB:                 $0 (ya instalado)
Mantenimiento:           Tiempo de desarrollo

Ventajas:
+ Control total
+ Sin límites de Firebase
+ Sin vendor lock-in
+ Aprende backend completo

Desventajas:
- Más código que mantener
- Responsabilidad de seguridad
- Necesita monitoring
```

**Conclusión**: Backend propio es mejor para aprendizaje y control, sin costos adicionales.

---

## 📝 10. CHECKLIST DE VALIDACIÓN

### Antes de Empezar

- [ ] Backup completo de datos de Firebase
- [ ] Backup de código actual (Git tag)
- [ ] MongoDB funcionando correctamente
- [ ] Documentación actualizada
- [ ] Equipo informado del plan

### Durante la Migración

- [ ] Testing exhaustivo de cada fase
- [ ] Validación de datos en cada paso
- [ ] Monitoring de errores
- [ ] Comunicación con usuarios si es necesario
- [ ] Documentar problemas y soluciones

### Después de Completar

- [ ] Testing de regresión completo
- [ ] Validación de integridad de datos
- [ ] Performance testing
- [ ] Documentación actualizada
- [ ] Código limpio (sin Firebase legacy)
- [ ] Monitoreo activo por 1 semana

---

## 🎯 11. PRÓXIMOS PASOS

### Para Validar Este Plan:

1. **Revisar el plan completo**
2. **Preguntas/sugerencias**:
   - ¿Algún aspecto poco claro?
   - ¿Algún riesgo no considerado?
   - ¿Ajustes en el cronograma?

3. **Aprobar e iniciar**:
   - Una vez validado → Comenzar Fase 1
   - Avance gradual fase por fase
   - Validación al final de cada fase

---

## 📞 Contacto

Para dudas o sugerencias sobre este plan:
- **Autor**: E1 (Emergent AI)
- **Fecha**: Enero 2025

---

**¿Estás listo para proceder con la implementación? 🚀**
