# 🏗️ Arquitectura Técnica - QA Master Path

## 📐 Patrón de Diseño

### Arquitectura: Fullstack con Separación Backend/Frontend

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
├──────────────────────────────────────────────────────────────┤
│  Frontend Layer (Vanilla JavaScript)                         │
│  ├─ Pages (HTML)                                            │
│  │   ├─ auth.html                                           │
│  │   ├─ dashboard.html                                      │
│  │   ├─ roadmap.html                                        │
│  │   ├─ toolbox.html                                        │
│  │   └─ knowledge-base.html                                 │
│  │                                                           │
│  ├─ UI Controllers                                          │
│  │   ├─ auth-ui-v2.js                                       │
│  │   ├─ dashboard-ui.js                                     │
│  │   ├─ roadmap-ui-enhanced.js                             │
│  │   ├─ toolbox-ui.js                                       │
│  │   └─ docs-enhanced.js                                    │
│  │                                                           │
│  ├─ Services                                                │
│  │   ├─ auth-service-v2.js (JWT + cookies)                 │
│  │   ├─ storage-service-v2.js (API sync)                   │
│  │   └─ app.js (AppEngine)                                  │
│  │                                                           │
│  └─ Guards & Config                                         │
│      ├─ auth-guard-v2.js                                    │
│      └─ config.js                                            │
├──────────────────────────────────────────────────────────────┤
│                  HTTP/REST API (JSON)                        │
├──────────────────────────────────────────────────────────────┤
│  Backend Layer (FastAPI)                                     │
│  ├─ server.py (FastAPI app)                                 │
│  │                                                           │
│  ├─ Routes (Endpoints)                                      │
│  │   ├─ auth.py (/api/auth/*)                              │
│  │   ├─ user.py (/api/user/*)                              │
│  │   └─ progress.py (/api/progress/*)                      │
│  │                                                           │
│  ├─ Middleware                                              │
│  │   └─ auth_middleware.py (JWT verification)              │
│  │                                                           │
│  ├─ Services                                                │
│  │   ├─ auth_service.py                                     │
│  │   ├─ jwt_service.py                                      │
│  │   └─ database.py (MongoDB connection)                   │
│  │                                                           │
│  ├─ Models (Pydantic)                                       │
│  │   ├─ user.py                                             │
│  │   └─ progress.py                                          │
│  │                                                           │
│  └─ Utils                                                    │
│      ├─ password.py (bcrypt)                                │
│      └─ validators.py                                        │
├──────────────────────────────────────────────────────────────┤
│                  MongoDB Protocol                            │
├──────────────────────────────────────────────────────────────┤
│  Database Layer (MongoDB)                                    │
│  ├─ Database: qa_master_path                                │
│  └─ Collection: users                                        │
│      ├─ Authentication data                                 │
│      ├─ Progress data (embedded)                            │
│      └─ Settings                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujos de Datos

### 1. Flujo de Autenticación (Login)

```
┌─────────────────┐
│ Usuario ingresa │
│ credenciales    │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────┐
│ auth-ui-v2.js                  │
│ - Validación frontend          │
│ - Recolectar email + password  │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ auth-service-v2.js             │
│ APIClient.post('/auth/login')  │
│ Body: { email, password }      │
└────────┬───────────────────────┘
         │
         │ HTTP POST
         │
         ▼
┌────────────────────────────────┐
│ Backend: routes/auth.py        │
│ @router.post("/login")         │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ auth_service.py                │
│ - Buscar usuario en MongoDB    │
│ - Verificar password (bcrypt)  │
│ - Generar JWT tokens           │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ jwt_service.py                 │
│ - create_access_token()        │
│ - create_refresh_token()       │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Response con cookies httpOnly  │
│ Set-Cookie: qa_session=...     │
│ Body: { user: {...} }          │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Frontend guarda usuario        │
│ Redirige a dashboard           │
└────────────────────────────────┘
```

### 2. Flujo de Petición Protegida

```
┌─────────────────┐
│ Usuario accede  │
│ a página        │
│ protegida       │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────┐
│ auth-guard-v2.js               │
│ requireAuth()                  │
│ - Verificar cookie existe      │
│ - Verificar no expirada        │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ auth-service-v2.js             │
│ init()                         │
│ GET /api/auth/me               │
│ (cookie enviada automática)    │
└────────┬───────────────────────┘
         │
         │ HTTP GET + Cookie
         │
         ▼
┌────────────────────────────────┐
│ Backend: middleware            │
│ auth_middleware.py             │
│ - Extraer cookie qa_session    │
│ - Decodificar JWT              │
│ - Obtener user_id              │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ MongoDB                        │
│ users.find_one({"_id": ...})   │
│ Retornar datos del usuario     │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Response                       │
│ { user: {...} }                │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Frontend                       │
│ - Guardar usuario en memoria   │
│ - Mostrar contenido            │
└────────────────────────────────┘
```

### 3. Flujo de Sincronización de Progreso

```
┌─────────────────┐
│ Usuario marca   │
│ módulo completo │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────┐
│ roadmap-ui-enhanced.js         │
│ handleModuleToggle()           │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ storage-service-v2.js          │
│ toggleProgress(id, true)       │
│ 1. Update localStorage (UX)    │
│ 2. Sync con backend            │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ PUT /api/progress/module       │
│ Body: {                        │
│   module_id: "1",              │
│   is_completed: true           │
│ }                              │
└────────┬───────────────────────┘
         │
         │ HTTP PUT + Cookie
         │
         ▼
┌────────────────────────────────┐
│ Backend: progress_router.py    │
│ @router.put("/module")         │
│ - Middleware verifica auth     │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ MongoDB                        │
│ users.update_one(              │
│   {"_id": user_id},            │
│   {"$set": {                   │
│     "progress.modules.1": true │
│   }}                           │
│ )                              │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Response                       │
│ { success: true }              │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Frontend                       │
│ - Actualizar UI                │
│ - updateLastSync()             │
└────────────────────────────────┘
```

---

## 📦 Módulos Backend (FastAPI)

### server.py - FastAPI Application

**Responsabilidad:** Punto de entrada de la aplicación, configuración global

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="QA Master Path API",
    version="1.0.0",
    docs_url="/api/docs"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
from routes import auth_router, user_router, progress_router
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(user_router, prefix="/api/user", tags=["Usuario"])
app.include_router(progress_router, prefix="/api/progress", tags=["Progreso"])

# Startup/Shutdown events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
```

---

### services/database.py - MongoDB Connection

**Responsabilidad:** Gestionar conexión asíncrona a MongoDB

```python
from motor.motor_asyncio import AsyncIOMotorClient

motor_client = None
motor_db = None

async def connect_to_mongo():
    global motor_client, motor_db
    
    mongo_url = os.getenv("MONGO_URL")
    motor_client = AsyncIOMotorClient(mongo_url)
    motor_db = motor_client[os.getenv("MONGO_DB_NAME")]
    
    # Crear índices
    await motor_db.users.create_index("email", unique=True)
    await motor_db.users.create_index("google_id", unique=True, sparse=True)

async def close_mongo_connection():
    if motor_client:
        motor_client.close()
```

**Motor (Async Driver):**
- Operaciones no bloqueantes
- Compatible con FastAPI async/await
- Alto rendimiento

---

### services/auth_service.py - Authentication Logic

**Responsabilidad:** Lógica de registro, login, gestión de usuarios

```python
from utils.password import hash_password, verify_password
from models.user import UserCreate, UserLogin

class AuthService:
    async def register_user(self, user_data: UserCreate):
        # Verificar email único
        existing = await motor_db.users.find_one({"email": user_data.email})
        if existing:
            raise ValueError("Email already registered")
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Crear documento
        user_doc = {
            "email": user_data.email,
            "display_name": user_data.display_name,
            "password_hash": password_hash,
            "created_at": datetime.utcnow(),
            "progress": {...},
            "settings": {...}
        }
        
        result = await motor_db.users.insert_one(user_doc)
        return result.inserted_id
    
    async def login_user(self, login_data: UserLogin):
        # Buscar usuario
        user = await motor_db.users.find_one({"email": login_data.email})
        if not user:
            raise ValueError("Invalid credentials")
        
        # Verificar password
        if not verify_password(login_data.password, user["password_hash"]):
            raise ValueError("Invalid credentials")
        
        return user
```

---

### services/jwt_service.py - JWT Token Management

**Responsabilidad:** Crear y verificar tokens JWT

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire, "type": "access"})
    
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str, token_type: str = "access"):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        if payload.get("type") != token_type:
            return None
        
        return payload
    except JWTError:
        return None
```

---

### middleware/auth_middleware.py - JWT Verification

**Responsabilidad:** Proteger endpoints que requieren autenticación

```python
from fastapi import Depends, HTTPException, Request
from services.jwt_service import verify_token
from services.auth_service import get_user_by_id

async def get_current_user(request: Request):
    # Obtener cookie
    token = request.cookies.get("qa_session")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verificar token
    payload = verify_token(token, token_type="access")
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Obtener usuario
    user_id = payload.get("sub")
    user = await get_user_by_id(user_id)
    
    if not user or not user.get("is_active"):
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Uso en endpoints
@router.get("/me")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
```

---

### utils/password.py - Password Hashing

**Responsabilidad:** Hash seguro de contraseñas con bcrypt

```python
import bcrypt

def hash_password(password: str) -> str:
    """Hash password con bcrypt (12 rounds)"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verificar password contra hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())
```

**Seguridad:**
- bcrypt con 12 rounds (recomendado)
- Lento intencionalmente (previene brute force)
- Salt único por password

---

## 📦 Módulos Frontend (JavaScript)

### auth-service-v2.js - Authentication Service

**Responsabilidad:** Gestionar autenticación con backend JWT

```javascript
class AuthServiceV2 {
  async login(email, password) {
    const result = await APIClient.post('/auth/login', {
      email,
      password
    });
    
    if (result.success) {
      // Cookies configuradas automáticamente por backend
      this.currentUser = result.data.user;
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, error: result.error };
  }
  
  async init() {
    // Verificar si hay sesión activa
    const result = await APIClient.get('/auth/me');
    
    if (result.success) {
      this.currentUser = result.data.user;
      return this.currentUser;
    }
    
    return null;
  }
}
```

---

### storage-service-v2.js - Data Persistence + API Sync

**Responsabilidad:** Sincronizar datos con backend

```javascript
class StorageServiceV2 {
  async toggleProgress(moduleId, isCompleted) {
    // 1. Actualizar localStorage (UX rápida)
    const progress = this.getProgress();
    progress[moduleId] = isCompleted;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    
    // 2. Sincronizar con backend
    if (authServiceV2.isAuthenticated()) {
      await APIClient.put('/progress/module', {
        module_id: moduleId,
        is_completed: isCompleted
      });
    }
  }
  
  async syncAll() {
    // Sincronización completa
    const data = {
      modules: this.getProgress(),
      subtasks: this.getSubtasks(),
      notes: this.getAllNotes(),
      badges: this.getBadges(),
      xp: this.getTotalXP()
    };
    
    await APIClient.post('/progress/sync', data);
  }
}
```

---

### auth-guard-v2.js - Route Protection

**Responsabilidad:** Proteger páginas que requieren autenticación

```javascript
export async function requireAuth() {
  // Verificar si hay cookie
  const hasCookie = document.cookie.includes('qa_session');
  
  if (!hasCookie) {
    redirectToLogin();
    return;
  }
  
  // Inicializar servicio de auth
  const user = await authServiceV2.init();
  
  if (!user) {
    redirectToLogin();
    return;
  }
  
  // Usuario autenticado
  return user;
}

function redirectToLogin() {
  const currentPath = window.location.pathname;
  window.location.href = `/app/pages/auth.html?redirect=${currentPath}`;
}
```

---

## 📊 Modelo de Datos Completo

### MongoDB Schema con Índices

```javascript
// users collection
{
  _id: ObjectId,               // Primary key
  
  // Authentication
  email: String,               // ← INDEX (unique)
  password_hash: String,
  google_id: String | null,    // ← INDEX (unique, sparse)
  auth_provider: String,       // ← INDEX
  
  // Profile
  display_name: String,
  photo_url: String | null,
  
  // Timestamps
  created_at: Date,            // ← INDEX
  last_active: Date,           // ← INDEX
  
  // Status
  email_verified: Boolean,
  is_active: Boolean,
  
  // Progress (embedded)
  progress: {
    modules: Object,           // {"1": true, "2": false}
    subtasks: Object,          // {"1-0": true}
    notes: Object,             // {"1": "Texto"}
    badges: Array,             // ["core", "technical"]
    xp: Number,
    last_sync: Date
  },
  
  // Settings (embedded)
  settings: {
    notifications: Boolean,
    theme: String,
    language: String
  }
}
```

**Por qué embebido?**
- Progreso pertenece a 1 usuario (relación 1:1)
- Acceso atómico (1 query para todo)
- Mejor performance que JOIN
- Menor complejidad

---

## 🔒 Seguridad Implementada

### 1. Autenticación

| Aspecto | Implementación |
|---------|----------------|
| Password Storage | bcrypt (12 rounds) |
| Token Format | JWT (HS256) |
| Token Delivery | httpOnly cookies |
| Token Expiration | 60 min (access), 7 días (refresh) |
| Refresh Mechanism | Automático antes de expirar |

### 2. Cookies Seguras

```python
# Configuración optimizada (desde .env)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
COOKIE_DOMAIN = None  # Usa dominio actual automáticamente
COOKIE_SECURE = ENVIRONMENT == "production"  # Condicional por entorno

response.set_cookie(
    key="qa_session",
    value=access_token,
    max_age=604800,        # 7 días
    domain=None,           # None = dominio actual (localhost o producción)
    httponly=True,         # No accesible por JavaScript
    secure=COOKIE_SECURE,  # False en dev (HTTP), True en prod (HTTPS)
    samesite="lax",        # Protección CSRF
    path="/"
)
```

**Ventajas de esta configuración:**
- ✅ Funciona tanto en localhost como en producción sin cambios
- ✅ `domain=None` permite que el navegador use el dominio actual automáticamente
- ✅ `secure` condicional según entorno (HTTP local, HTTPS producción)
- ✅ Sin problemas de cookies rechazadas en localhost

📚 **Ver documentación completa**: [SOLUCION_COOKIES_HTTPONLY.md](../SOLUCION_COOKIES_HTTPONLY.md)

### 3. CORS Configuration

```python
allow_origins=[
    "http://localhost:8000",
    "http://localhost:3000"
],
allow_credentials=True,    # Permite cookies
allow_methods=["*"],
allow_headers=["*"]
```

### 4. Input Validation

```python
# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr                    # Valida formato email
    password: str = Field(min_length=8)  # Mínimo 8 caracteres
    display_name: str = Field(min_length=2, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v
```

---

## 🐛 Puntos Débiles y Mejoras

### Limitaciones Actuales

1. **Rate Limiting**: No implementado
2. **Refresh Token Rotation**: No implementado
3. **2FA**: No disponible
4. **Email Verification**: No implementado
5. **Password Reset**: Endpoint existe pero sin email

### Recomendaciones para Producción

1. **Rate Limiting** con `slowapi`:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

2. **Refresh Token Rotation**:
- Invalidar token anterior al refrescar
- Guardar tokens en DB para revocación

3. **Logging Estructurado**:
```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

4. **Monitoring**:
- Sentry para errores
- Prometheus + Grafana para métricas

---

## 📚 Recursos y Referencias

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Motor (MongoDB Async)](https://motor.readthedocs.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)

---

**Documentación actualizada:** Enero 2025  
**Versión:** 3.0 (Fullstack Architecture)
