# 📁 Estructura del Proyecto - QA Master Path

## 🎯 Arquitectura Fullstack

QA Master Path es una aplicación fullstack con:
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.11
- **Database**: MongoDB 7.0

---

## 🏗️ Estructura Completa

```
/app/
├── backend/                           # Backend FastAPI
│   ├── server.py                      # Punto de entrada FastAPI
│   ├── requirements.txt               # Dependencias Python
│   │
│   ├── models/                        # Modelos Pydantic
│   │   ├── __init__.py
│   │   ├── user.py                    # Modelos de usuario
│   │   └── progress.py                # Modelos de progreso
│   │
│   ├── routes/                        # Endpoints API
│   │   ├── __init__.py
│   │   ├── auth.py                    # /api/auth/* (6 endpoints)
│   │   ├── user.py                    # /api/user/* (5 endpoints)
│   │   └── progress.py                # /api/progress/* (9 endpoints)
│   │
│   ├── services/                      # Lógica de negocio
│   │   ├── __init__.py
│   │   ├── database.py                # Conexión MongoDB (Motor)
│   │   ├── auth_service.py            # Lógica de autenticación
│   │   └── jwt_service.py             # Manejo de JWT
│   │
│   ├── middleware/                    # Middleware personalizado
│   │   ├── __init__.py
│   │   └── auth_middleware.py         # Verificación de JWT
│   │
│   ├── utils/                         # Utilidades
│   │   ├── __init__.py
│   │   ├── password.py                # Hashing bcrypt
│   │   └── validators.py              # Validaciones
│   │
│   └── tests/                         # Tests backend
│       ├── __init__.py
│       ├── conftest.py
│       └── test_*.py
│
├── app/                               # Frontend
│   ├── pages/                         # Páginas HTML
│   │   ├── auth.html                  # Login/Registro
│   │   ├── dashboard.html             # Dashboard principal
│   │   ├── roadmap.html               # Vista de módulos
│   │   ├── toolbox.html               # Herramientas QA
│   │   └── knowledge-base.html        # Documentación
│   │
│   └── assets/                        # Recursos estáticos
│       ├── js/                        # Módulos JavaScript
│       │   ├── config.js              # Configuración global
│       │   ├── logger.js              # Sistema de logs
│       │   │
│       │   ├── auth-service-v2.js     # Servicio autenticación JWT
│       │   ├── auth-guard-v2.js       # Protección de rutas
│       │   ├── auth-ui-v2.js          # UI autenticación
│       │   ├── auth-config.js         # Configuración auth
│       │   │
│       │   ├── storage-service-v2.js  # Persistencia + API sync
│       │   ├── storage-config.js      # Configuración storage
│       │   ├── storage-unified.js     # Wrapper unificado
│       │   │
│       │   ├── dashboard-ui.js        # Controlador dashboard
│       │   ├── roadmap-ui-enhanced.js # Controlador roadmap
│       │   ├── docs-enhanced.js       # Controlador docs
│       │   ├── toolbox-ui.js          # Controlador toolbox
│       │   │
│       │   ├── app.js                 # Motor de aplicación
│       │   └── components.js          # Componentes compartidos
│       │
│       ├── data/                      # Archivos de datos
│       │   └── modules.json           # 12 módulos del curso
│       │
│       └── style.css                  # Estilos globales
│
├── docs/                              # Knowledge Base
│   ├── manifest.json                  # Índice de documentos
│   ├── images/                        # Imágenes compartidas
│   └── content/                       # Contenido en Markdown
│       ├── 01-fundamentos/
│       ├── 02-technical/
│       └── 03-automation/
│
├── guides/                            # Guías técnicas
│   ├── README.md                      # Índice de guías
│   ├── ESTRUCTURA_PROYECTO.md         # Este archivo
│   └── DOCS_ARQUITECTURA.md           # Arquitectura técnica
│
├── tests/                             # Tests frontend
│   └── unit/
│       ├── app.test.js
│       └── storage.test.js
│
├── index.html                         # Punto de entrada
├── package.json                       # Dependencias frontend
├── vitest.config.js                   # Configuración tests
├── eslint.config.js                   # Configuración ESLint
├── README.md                          # Documentación principal
└── LOCAL_SETUP.md                     # Guía de setup local
```

---

## 🔗 Arquitectura de Comunicación

### Frontend ↔ Backend

```
┌─────────────────────────────────────────┐
│         FRONTEND (localhost:8000)       │
├─────────────────────────────────────────┤
│  auth-service-v2.js                     │
│  └─ APIClient                           │
│      └─ fetch(BACKEND_URL + endpoint)   │
│         └─ Authorization: Bearer token  │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP/JSON
                  │
┌─────────────────▼───────────────────────┐
│         BACKEND (localhost:8001)        │
├─────────────────────────────────────────┤
│  FastAPI Routes                         │
│  ├─ /api/auth/*                         │
│  ├─ /api/user/*                         │
│  └─ /api/progress/*                     │
│                                          │
│  Auth Middleware                        │
│  └─ Verificar JWT cookie                │
│                                          │
│  Services                               │
│  ├─ auth_service.py                     │
│  └─ database.py (Motor)                 │
└─────────────────┬───────────────────────┘
                  │
                  │ MongoDB Protocol
                  │
┌─────────────────▼───────────────────────┐
│        MongoDB (localhost:27017)        │
├─────────────────────────────────────────┤
│  Database: qa_master_path               │
│  └─ Collection: users                   │
│      ├─ _id, email, password_hash       │
│      ├─ progress { modules, subtasks }  │
│      └─ settings { theme, language }    │
└─────────────────────────────────────────┘
```

---

## 📂 Rutas y URLs

### Frontend (Páginas HTML)

| Archivo | URL | Requiere Auth | Descripción |
|---------|-----|---------------|-------------|
| `index.html` | `/` | No | Redirige a auth o dashboard |
| `pages/auth.html` | `/app/pages/auth.html` | No | Login/Registro |
| `pages/dashboard.html` | `/app/pages/dashboard.html` | Sí | Dashboard principal |
| `pages/roadmap.html` | `/app/pages/roadmap.html` | Sí | Ruta de aprendizaje |
| `pages/toolbox.html` | `/app/pages/toolbox.html` | Sí | Herramientas QA |
| `pages/knowledge-base.html` | `/app/pages/knowledge-base.html` | Sí | Documentación |

### Backend (API Endpoints)

#### Autenticación (`/api/auth/`)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual
- `GET /api/auth/verify` - Verificar sesión

#### Usuario (`/api/user/`)
- `GET /api/user/me` - Obtener perfil
- `PUT /api/user/me` - Actualizar perfil
- `PUT /api/user/me/settings` - Actualizar configuración
- `DELETE /api/user/me` - Desactivar cuenta
- `GET /api/user/stats` - Estadísticas

#### Progreso (`/api/progress/`)
- `GET /api/progress` - Obtener progreso
- `PUT /api/progress/module` - Actualizar módulo
- `PUT /api/progress/subtask` - Actualizar subtarea
- `PUT /api/progress/note` - Actualizar nota
- `POST /api/progress/badge` - Agregar badge
- `POST /api/progress/xp` - Agregar XP
- `POST /api/progress/sync` - Sincronización completa
- `GET /api/progress/stats` - Estadísticas de progreso
- `DELETE /api/progress` - Resetear progreso

**Total**: 20 endpoints

---

## 🔐 Flujo de Autenticación

```
1. Usuario abre página protegida (ej: dashboard.html)
   ↓
2. auth-guard-v2.js: requireAuth()
   ↓
3. Verificar cookie qa_session
   ├─ NO existe → Redirigir a /pages/auth.html
   └─ SÍ existe → Continuar
       ↓
4. auth-service-v2.js: init()
   ↓
5. Verificar expiración del token
   ├─ Expirado → refreshAccessToken()
   └─ Válido → Continuar
       ↓
6. GET /api/auth/me (con cookie automática)
   ↓
7. Backend: auth_middleware.py
   ├─ Extraer cookie qa_session
   ├─ Verificar JWT
   ├─ Obtener user_id del payload
   └─ Cargar usuario desde MongoDB
       ↓
8. Response: { success: true, user: {...} }
   ↓
9. Frontend: guardar usuario en memoria
   ↓
10. ✅ Usuario autenticado → Mostrar contenido
```

---

## 💾 Estructura de Datos

### MongoDB Schema

```javascript
// Colección: users
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  
  // Información básica
  email: "usuario@example.com",           // único, indexed
  password_hash: "$2b$12$...",            // bcrypt
  display_name: "Juan Pérez",
  photo_url: "https://...",
  
  // Autenticación
  auth_provider: "email",                 // "email" | "google"
  google_id: null,                        // para OAuth
  
  // Timestamps
  created_at: ISODate("2025-01-15T10:00:00Z"),
  last_active: ISODate("2025-01-15T15:30:00Z"),
  
  // Estado
  email_verified: false,
  is_active: true,
  
  // Progreso del curso (embebido)
  progress: {
    modules: {
      "1": true,
      "2": false,
      "3": true
    },
    subtasks: {
      "1-0": true,
      "1-1": false,
      "2-0": true
    },
    notes: {
      "1": "Aprendí sobre SDLC y STLC...",
      "2": "SQL es fundamental para..."
    },
    badges: ["core", "technical"],
    xp: 1350,
    last_sync: ISODate("2025-01-15T15:30:00Z")
  },
  
  // Configuración del usuario
  settings: {
    notifications: true,
    theme: "dark",
    language: "es"
  }
}
```

### Índices MongoDB

```javascript
// Índices creados automáticamente
{
  email: 1           // unique
}
{
  google_id: 1       // unique, sparse
}
{
  created_at: -1
}
{
  last_active: -1
}
{
  auth_provider: 1
}
```

---

## 🔄 Flujo de Sincronización de Progreso

```
Usuario marca módulo como completado
    ↓
roadmap-ui-enhanced.js: handleModuleToggle()
    ↓
storage-service-v2.js: toggleProgress(id, true)
    ↓
1. Actualizar localStorage inmediatamente (UX rápida)
    ↓
2. ¿Usuario autenticado? (verificar token)
    ├─ NO → Solo guardar local
    └─ SÍ → Sincronizar con backend
         ↓
         PUT /api/progress/module
         {
           "module_id": "1",
           "is_completed": true
         }
         ↓
         Backend: progress_router.py
         ├─ Verificar autenticación (middleware)
         ├─ Actualizar en MongoDB
         └─ Response: { success: true }
              ↓
              storage-service-v2.js: updateLastSync()
              ↓
              ✅ Sincronizado
```

---

## 📊 Responsabilidades de Cada Módulo

### Backend

| Módulo | Responsabilidad |
|--------|-----------------|
| `server.py` | Inicialización FastAPI, CORS, startup/shutdown |
| `models/` | Validación de datos con Pydantic |
| `routes/` | Definición de endpoints y handlers |
| `services/` | Lógica de negocio, conexión DB |
| `middleware/` | Verificación JWT, logging |
| `utils/` | Funciones auxiliares, validadores |

### Frontend

| Módulo | Responsabilidad |
|--------|-----------------|
| `config.js` | Configuración global (BACKEND_URL) |
| `auth-service-v2.js` | Gestión de autenticación JWT |
| `auth-guard-v2.js` | Protección de rutas |
| `storage-service-v2.js` | Persistencia + sincronización API |
| `dashboard-ui.js` | Lógica del dashboard |
| `roadmap-ui-enhanced.js` | Lógica del roadmap |
| `app.js` | Motor de aplicación, carga de datos |
| `components.js` | Navbar, footer, elementos compartidos |

---

## 🛠️ Para Desarrolladores

### Agregar Nuevo Endpoint Backend

**1. Crear modelo en `models/` (si necesario):**
```python
# models/ejemplo.py
from pydantic import BaseModel

class EjemploRequest(BaseModel):
    campo: str
```

**2. Crear ruta en `routes/`:**
```python
# routes/ejemplo.py
from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.post("/ejemplo")
async def crear_ejemplo(
    data: EjemploRequest,
    current_user: dict = Depends(get_current_user)
):
    # Tu lógica aquí
    return {"success": True}
```

**3. Registrar en `server.py`:**
```python
from routes import ejemplo_router
app.include_router(ejemplo_router, prefix="/api/ejemplo", tags=["Ejemplo"])
```

### Agregar Nueva Página Frontend

**1. Crear HTML en `app/pages/nueva-pagina.html`:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <title>Nueva Página</title>
    <script type="module" src="../assets/js/nueva-pagina-ui.js"></script>
</head>
<body>
    <!-- Tu contenido -->
</body>
</html>
```

**2. Crear JS en `app/assets/js/nueva-pagina-ui.js`:**
```javascript
import { requireAuth } from './auth-guard-v2.js';

// Proteger ruta si es necesario
requireAuth();

// Tu lógica
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada');
});
```

**3. Agregar link en navbar (`components.js`):**
```javascript
<a href="nueva-pagina.html">Nueva Página</a>
```

---

## 📝 Variables de Entorno

### Backend `.env`

```env
# JWT
JWT_SECRET=secret_generado_con_secrets_module
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# Cookies
COOKIE_SAMESITE=lax
COOKIE_HTTPONLY=True

# IMPORTANTE: NO configurar COOKIE_DOMAIN ni COOKIE_SECURE
# domain=None se usa automáticamente (funciona en local y producción)
# secure se configura automáticamente según ENVIRONMENT

# CORS
FRONTEND_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
DEBUG=True
```

### Frontend

No requiere `.env` propio. La configuración se detecta automáticamente en `config.js`:
- Localhost: usa `http://localhost:8001/api`
- Preview Emergent: usa `/api` (mismo dominio)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest                    # Todos los tests
pytest -v                 # Verbose
pytest --cov              # Con cobertura
pytest tests/test_auth.py # Test específico
```

### Frontend Tests

```bash
npm test                  # Modo watch
npm run test:run          # Una sola vez
npm run test:ui           # Interfaz visual
npm run test:coverage     # Con cobertura
```

---

## 📦 Dependencias Principales

### Backend (`requirements.txt`)

```
fastapi==0.115.12          # Framework web
uvicorn==0.27.0            # ASGI server
pydantic==2.10.4           # Validación de datos
motor==3.3.2               # MongoDB async driver
python-jose==3.3.0         # JWT
passlib==1.7.4             # Password hashing
bcrypt==4.1.2              # Bcrypt
pytest==7.4.4              # Testing
```

### Frontend (`package.json`)

```json
{
  "devDependencies": {
    "@vitest/ui": "^4.0.16",
    "eslint": "^9.39.2",
    "prettier": "^3.7.4",
    "vitest": "^4.0.16"
  }
}
```

---

## 🔧 Scripts Útiles

```bash
# Ver estructura del proyecto
tree -L 3 -I 'node_modules|.git|__pycache__|venv'

# Buscar archivos
find . -name "*.py" -type f | grep -v __pycache__
find . -name "*.js" -type f | grep -v node_modules

# Contar líneas de código
# Backend
find backend -name "*.py" | xargs wc -l
# Frontend
find app/assets/js -name "*.js" | xargs wc -l

# Ver puertos ocupados
# Linux/Mac
lsof -i :8001
lsof -i :8000
# Windows
netstat -ano | findstr :8001
```

---

## 📚 Recursos Adicionales

- [README.md](../README.md) - Documentación principal
- [LOCAL_SETUP.md](../LOCAL_SETUP.md) - Setup local detallado
- [DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md) - Arquitectura técnica
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [MongoDB Docs](https://www.mongodb.com/docs/)

---

**Última actualización**: Enero 2025  
**Versión**: 3.0 (Arquitectura Fullstack)
