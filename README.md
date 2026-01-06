# 🎯 QA Master Path

> Plataforma educativa gamificada fullstack para convertirse en QA Automation Engineer en 12 semanas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-success.svg)](https://www.mongodb.com/)

---

## 📋 Descripción

**QA Master Path** es una aplicación web fullstack que guía a testers manuales en su transformación a QA Automation Engineers mediante:

- 📚 **12 Módulos Progresivos**: Desde SDLC hasta CI/CD y Performance Testing
- 🎮 **Sistema de Gamificación**: XP, rankings dinámicos y 4 badges desbloqueables
- 🗺️ **Roadmap Interactivo**: Visualización de progreso con tareas diarias
- 📝 **Editor de Notas**: Sistema completo con auto-guardado y sincronización
- 🔒 **Autenticación JWT**: Sistema de autenticación seguro con cookies httpOnly
- ☁️ **Backend Propio**: API REST completa con FastAPI + MongoDB
- 🎨 **Diseño Moderno**: Interfaz oscura con Tailwind CSS y efectos glassmorphism
- 📖 **Base de Conocimientos**: Documentación técnica integrada con Markdown

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
Frontend:  Vanilla JavaScript (ES6 Modules) + Tailwind CSS
Backend:   FastAPI (Python 3.11) + MongoDB
Auth:      JWT (httpOnly cookies) + bcrypt
Database:  MongoDB 7.0 (Motor async driver)
Hosting:   Static frontend + FastAPI backend
Testing:   Vitest (frontend) + pytest (backend)
Linting:   ESLint + Prettier
```

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FULLSTACK APPLICATION                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vanilla JS)                                       │
│  ├─ pages/*.html (5 páginas)                                │
│  ├─ auth-service-v2.js (JWT authentication)                 │
│  ├─ storage-service-v2.js (API sync)                        │
│  ├─ dashboard-ui.js, roadmap-ui.js, etc.                    │
│  └─ Tailwind CSS + Custom Styles                            │
├─────────────────────────────────────────────────────────────┤
│  Backend API (FastAPI)                                       │
│  ├─ /api/auth/* (register, login, logout, refresh)         │
│  ├─ /api/user/* (profile, settings, stats)                 │
│  ├─ /api/progress/* (modules, subtasks, notes, sync)       │
│  ├─ JWT middleware (auth protection)                        │
│  └─ MongoDB async operations (Motor)                        │
├─────────────────────────────────────────────────────────────┤
│  Database (MongoDB)                                          │
│  ├─ users collection (auth + profile + progress)           │
│  ├─ Embedded progress data (modules, subtasks, notes)      │
│  └─ Indexed fields (email, google_id, created_at)          │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
1. Usuario completa formulario de login/registro
   ↓
2. Frontend (auth-service-v2.js) valida inputs
   ↓
3. POST /api/auth/login con credenciales
   ↓
4. Backend verifica con MongoDB + bcrypt
   ↓
5. Backend genera JWT tokens (access + refresh)
   ↓
6. Backend establece cookies httpOnly seguras
   ↓
7. Frontend redirige a dashboard
   ↓
8. auth-guard-v2.js protege rutas privadas
   ↓
9. ✅ Usuario autenticado con acceso completo
```

---

## 📁 Estructura del Proyecto

```
/app/
├── backend/                      # Backend FastAPI
│   ├── server.py                 # Punto de entrada FastAPI
│   ├── requirements.txt          # Dependencias Python
│   ├── models/                   # Modelos Pydantic
│   │   ├── user.py               # Modelos de usuario
│   │   └── progress.py           # Modelos de progreso
│   ├── routes/                   # Endpoints API
│   │   ├── auth.py               # Autenticación (6 endpoints)
│   │   ├── user.py               # Usuario (5 endpoints)
│   │   └── progress.py           # Progreso (9 endpoints)
│   ├── services/                 # Lógica de negocio
│   │   ├── database.py           # Conexión MongoDB
│   │   ├── auth_service.py       # Lógica de autenticación
│   │   └── jwt_service.py        # Manejo de JWT
│   ├── middleware/               # Middleware personalizado
│   │   └── auth_middleware.py    # Verificación de JWT
│   └── utils/                    # Utilidades
│       ├── password.py           # Hashing bcrypt
│       └── validators.py         # Validaciones
│
├── app/                          # Frontend
│   ├── pages/                    # Páginas HTML
│   │   ├── auth.html             # Login/Registro
│   │   ├── dashboard.html        # Dashboard principal
│   │   ├── roadmap.html          # Vista de módulos
│   │   ├── toolbox.html          # Herramientas
│   │   └── knowledge-base.html   # Documentación
│   └── assets/                   # Recursos estáticos
│       ├── js/                   # Módulos JavaScript
│       │   ├── config.js         # Configuración global
│       │   ├── auth-service-v2.js      # Servicio autenticación
│       │   ├── auth-guard-v2.js        # Protección de rutas
│       │   ├── auth-ui-v2.js           # UI autenticación
│       │   ├── storage-service-v2.js   # Persistencia + API sync
│       │   ├── dashboard-ui.js         # Controlador dashboard
│       │   ├── roadmap-ui-enhanced.js  # Controlador roadmap
│       │   ├── docs-enhanced.js        # Controlador docs
│       │   └── app.js                  # Motor de aplicación
│       ├── data/                 # Archivos de datos
│       │   └── modules.json      # 12 módulos del curso
│       └── style.css             # Estilos globales
│
├── docs/                         # Documentación del proyecto
│   ├── manifest.json             # Índice de documentos
│   ├── images/                   # Imágenes compartidas
│   └── content/                  # Contenido en Markdown
│       └── 01-fundamentos/
│
├── guides/                       # Guías técnicas
│   ├── README.md                 # Índice de guías
│   ├── ESTRUCTURA_PROYECTO.md    # Detalles de estructura
│   └── DOCS_ARQUITECTURA.md      # Arquitectura técnica
│
├── tests/                        # Tests automatizados
│   └── unit/                     # Tests unitarios
│
├── package.json                  # Dependencias frontend
├── index.html                    # Punto de entrada
└── README.md                     # Este archivo
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Python 3.11+** y pip
- **Node.js 18+** y npm
- **MongoDB 7.0+** instalado y corriendo
- Navegador moderno con soporte ES6

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/FARLEY-PIEDRAHITA-OROZCO/qa-master-path.git
cd qa-master-path

# 2. Instalar dependencias del backend
cd backend
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones (ver sección Variables de Entorno)

# 4. Instalar dependencias del frontend
cd ..
npm install

# 5. Verificar que MongoDB esté corriendo
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Variables de Entorno

Crear archivo `/app/backend/.env`:

```env
# JWT Configuration
JWT_SECRET=tu_secret_key_super_seguro_de_256_bits
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# Cookie Configuration
# IMPORTANTE: NO configurar COOKIE_DOMAIN (se usa None automáticamente)
# domain=None funciona tanto en localhost como en producción
COOKIE_SAMESITE=lax
COOKIE_HTTPONLY=True
COOKIE_MAX_AGE=604800

# CORS Configuration
FRONTEND_URL=http://localhost:8000
FRONTEND_DEV_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=True
```

**⚠️ IMPORTANTE**: 
1. Genera un JWT_SECRET seguro con:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
2. **NO configurar COOKIE_DOMAIN**: El sistema usa automáticamente `domain=None`, lo que permite que funcione correctamente tanto en localhost como en producción. Ver [documentación completa](./SOLUCION_COOKIES_HTTPONLY.md).

### Ejecutar la Aplicación

#### Opción 1: Con Supervisor (Recomendado en producción)

```bash
# Iniciar todos los servicios
sudo supervisorctl restart all

# Verificar estado
sudo supervisorctl status

# Ver logs
sudo supervisorctl tail -f backend
sudo supervisorctl tail -f frontend
```

#### Opción 2: Manualmente (Desarrollo local)

**Terminal 1 - Backend:**
```bash
cd /app/backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd /app
npm run dev
# o directamente: npx http-server -p 8000 -c-1
```

**Terminal 3 - MongoDB** (si no está como servicio):
```bash
mongod --dbpath /path/to/data
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:8000
- **API Backend**: http://localhost:8001
- **API Docs (Swagger)**: http://localhost:8001/api/docs
- **API Redoc**: http://localhost:8001/api/redoc

---

## 📊 API Endpoints

### Autenticación (`/api/auth/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/refresh` | Refrescar access token | Cookie |
| POST | `/api/auth/logout` | Cerrar sesión | Cookie |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| GET | `/api/auth/verify` | Verificar sesión | Cookie |

### Usuario (`/api/user/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/me` | Obtener perfil | Sí |
| PUT | `/api/user/me` | Actualizar perfil | Sí |
| PUT | `/api/user/me/settings` | Actualizar configuración | Sí |
| DELETE | `/api/user/me` | Desactivar cuenta | Sí |
| GET | `/api/user/stats` | Estadísticas del usuario | Sí |

### Progreso (`/api/progress/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/progress` | Obtener progreso completo | Sí |
| PUT | `/api/progress/module` | Actualizar módulo | Sí |
| PUT | `/api/progress/subtask` | Actualizar subtarea | Sí |
| PUT | `/api/progress/note` | Actualizar nota | Sí |
| POST | `/api/progress/badge` | Agregar badge | Sí |
| POST | `/api/progress/xp` | Agregar XP | Sí |
| POST | `/api/progress/sync` | Sincronización completa | Sí |
| GET | `/api/progress/stats` | Estadísticas de progreso | Sí |
| DELETE | `/api/progress` | Resetear progreso | Sí |

**Total: 20 endpoints funcionando** ✅

---

## 💾 Sistema de Persistencia

### MongoDB Schema

```javascript
// Colección: users
{
  _id: ObjectId,
  email: string (único, indexed),
  password_hash: string,
  display_name: string,
  photo_url: string | null,
  auth_provider: "email" | "google",
  created_at: ISODate,
  last_active: ISODate,
  email_verified: boolean,
  is_active: boolean,
  
  // Progreso embebido
  progress: {
    modules: {
      "1": true,
      "2": false
    },
    subtasks: {
      "1-0": true,
      "1-1": false
    },
    notes: {
      "1": "Mis notas del módulo 1"
    },
    badges: ["core", "technical"],
    xp: 150,
    last_sync: ISODate
  },
  
  settings: {
    notifications: boolean,
    theme: string,
    language: string
  }
}
```

### Índices MongoDB

```javascript
// Índices creados automáticamente al iniciar
email (unique)
google_id (unique, sparse)
created_at
last_active
auth_provider
```

---

## 🎮 Funcionalidades

### 📊 Dashboard

- Barra de progreso global
- XP acumulado con rankings dinámicos
- 4 Badges desbloqueables:
  - 🏆 Core Master (Módulos 1-2)
  - 🥷 Tech Ninja (Módulos 3-5)
  - ✈️ Auto Pilot (Módulos 6-9)
  - 👑 QA Expert (Módulos 10-12)
- Celebraciones con confetti

### 🗺️ Roadmap

- 12 Módulos expandibles
- Progress ring por módulo
- Tareas diarias con checkboxes
- Editor de notas completo:
  - Auto-guardado (1.5s debounce)
  - Sincronización con backend
  - Contador de caracteres
  - Atajos de teclado (Ctrl+S)
- Estados: Locked, Pending, Active, Completed
- Botón "Cerrar Sprint" para reclamar XP

### 🔧 Toolbox

- Herramientas categorizadas:
  - API Testing (Postman, JSON Placeholder)
  - Automation (SelectorsHub, Playwright Codegen)
  - Documentation (ISTQB, Git Cheat Sheet)

### 📖 Knowledge Base

- Sistema de documentación navegable
- Renderizado de Markdown a HTML
- Artículos técnicos sobre SDLC, SQL, Playwright, etc.

### 🔐 Autenticación

- Login con Email/Password
- Registro de usuarios
- Cookies httpOnly seguras
- Refresh tokens automático
- Protección de rutas
- Sincronización automática de progreso

---

## 🎯 Sistema de Gamificación

### XP por Módulo

| Fase | XP Range | Módulos |
|------|----------|---------|
| Core | 500-600 | Módulos 1-2 |
| Technical | 750-900 | Módulos 3-5 |
| Automation | 1200-1600 | Módulos 6-9 |
| Expert | 1800-3000 | Módulos 10-12 |

**Total XP disponible**: ~14,000 XP

### Rankings Dinámicos

| XP Range | Ranking |
|----------|---------|
| 0-999 | Junior Talent 🌱 |
| 1,000-4,999 | Technical QA Tester 🔧 |
| 5,000-9,999 | QA Engineer Mid ⚙️ |
| 10,000+ | Senior QA Automation 🏆 |

---

## 📚 Módulos del Curso

1. **Fundamentos de QA Sólidos** (500 XP) - SDLC, STLC, casos de prueba
2. **Agile QA & Exploratory** (600 XP) - Scrum, testing exploratorio
3. **SQL para Data Validation** (800 XP) - Queries, joins, integridad
4. **Postman & API Testing** (900 XP) - HTTP, collections, scripts
5. **Terminal, Git & GitHub** (750 XP) - Bash, versionado, branching
6. **Playwright: First Scripts** (1200 XP) - Setup, locators, assertions
7. **Page Object Model (POM)** (1500 XP) - Arquitectura, refactoring
8. **Advanced API Auto** (1400 XP) - APIRequestContext, hybrid tests
9. **CI/CD GitHub Actions** (1600 XP) - Workflows, pipelines
10. **Mobile Testing** (1800 XP) - Emuladores, gestos, cloud testing
11. **Performance Testing** (1900 XP) - Web Vitals, K6, load testing
12. **Final Project** (3000 XP) - Proyecto integrador

---

## 🧪 Testing

### Frontend Tests

```bash
# Tests en modo watch
npm test

# Tests una sola vez
npm run test:run

# Tests con interfaz visual
npm run test:ui

# Cobertura de código
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Ejecutar todos los tests
pytest

# Tests con cobertura
pytest --cov=. --cov-report=html

# Tests específicos
pytest tests/test_auth.py -v
```

### Scripts Disponibles

```bash
# Frontend
npm run dev            # Inicia servidor de desarrollo (puerto 8000)
npm start              # Alias de npm run dev
npm test               # Ejecuta tests con Vitest
npm run lint           # Ejecuta ESLint
npm run lint:fix       # Corrige problemas de linting
npm run format         # Formatea código con Prettier

# Backend
cd backend
uvicorn server:app --reload    # Servidor de desarrollo
pytest                         # Ejecutar tests
black .                        # Formatear código
```

---

## 🔒 Seguridad

### Implementado ✅

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| Password Hashing | ✅ SEGURO | Bcrypt con 12 rounds |
| JWT Signing | ✅ SEGURO | HS256 con secret fuerte |
| Token Expiration | ✅ CONFIGURADO | 60 min access, 7 días refresh |
| httpOnly Cookies | ✅ ACTIVO | Cookies no accesibles por JavaScript |
| Cookie Domain | ✅ OPTIMIZADO | domain=None (funciona en local y producción) |
| Cookie Secure | ✅ CONDICIONAL | False en development, True en production |
| CORS Configuration | ✅ CONFIGURADO | Orígenes permitidos definidos |
| Input Validation | ✅ ACTIVO | Pydantic models + frontend validation |
| Error Handling | ✅ ROBUSTO | Try-catch en todos los endpoints |

### Solución de Cookies httpOnly ✨

El sistema implementa una **solución universal de cookies** que funciona tanto en localhost como en producción sin cambios de código:

- **domain=None**: El navegador usa automáticamente el dominio actual
- **secure condicional**: `False` en development (HTTP), `True` en production (HTTPS)
- **SameSite=lax**: Protección contra CSRF
- **HttpOnly=true**: Protección contra XSS

📚 **Documentación completa**: [SOLUCION_COOKIES_HTTPONLY.md](./SOLUCION_COOKIES_HTTPONLY.md)

### Recomendaciones para Producción ⚠️

1. **Generar nuevo JWT_SECRET**: Usar secret único y fuerte
2. **Configurar ENVIRONMENT=production**: Activa secure=true automáticamente
3. **Implementar HTTPS**: SSL/TLS obligatorio en producción
4. **Rate Limiting**: Limitar intentos de login
5. **Logs a archivo**: No solo consola
6. **Backup MongoDB**: Estrategia de respaldo regular
7. **Monitoring**: Uptime y alertas

---

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Verificar dependencias
pip install -r requirements.txt

# Verificar que MongoDB esté corriendo
# Windows: net start MongoDB
# Mac: brew services status mongodb-community
# Linux: sudo systemctl status mongod

# Ver logs de backend
sudo supervisorctl tail backend
```

### Error de conexión MongoDB

```bash
# Verificar que MongoDB esté corriendo
mongosh --eval "db.version()"

# Verificar MONGO_URL en .env
cat backend/.env | grep MONGO_URL
```

### Frontend no se conecta al backend

1. Verificar que backend esté corriendo en puerto 8001
2. Verificar CORS en `backend/server.py`
3. Revisar consola del navegador (F12)
4. Verificar `BACKEND_URL` en `app/assets/js/config.js`

### Error de autenticación

```bash
# Verificar que JWT_SECRET esté configurado
cat backend/.env | grep JWT_SECRET

# Verificar que las cookies se estén configurando correctamente
# Ejecutar script de prueba:
bash backend/test_cookies_solution.sh

# Limpiar cookies del navegador
# DevTools (F12) > Application > Cookies > Eliminar todo

# Verificar logs del backend
sudo supervisorctl tail backend
```

### Cookies no se establecen en localhost

Si las cookies no aparecen en DevTools después del login:

```bash
# 1. Verificar configuración de cookies
curl http://localhost:8001/api/auth/status | python3 -m json.tool

# Debe mostrar: cookie_secure: false, cookie_domain no debe estar presente

# 2. Ejecutar script de prueba completo
bash backend/test_cookies_solution.sh

# 3. Verificar que ENVIRONMENT=development en .env
cat backend/.env | grep ENVIRONMENT
```

📚 **Ver documentación completa**: [SOLUCION_COOKIES_HTTPONLY.md](./SOLUCION_COOKIES_HTTPONLY.md)

---

## 📖 Documentación Adicional

- [**Estructura del Proyecto**](./guides/ESTRUCTURA_PROYECTO.md) - Organización de archivos y directorios
- [**Arquitectura Técnica**](./guides/DOCS_ARQUITECTURA.md) - Detalles técnicos y patrones de diseño
- [**Sistema de Documentación**](./guides/README.md) - Cómo agregar contenido a la Knowledge Base

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Estilo

- **Python**: Seguir PEP 8 (usar `black` para formateo)
- **JavaScript**: Seguir configuración de ESLint
- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Código**: Ejecutar linters antes de commit

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 👤 Autor

**Farley Piedrahita Orozco**

- Email: frlpiedrahita@gmail.com
- GitHub: [@FARLEY-PIEDRAHITA-OROZCO](https://github.com/FARLEY-PIEDRAHITA-OROZCO)

---

## 🙏 Agradecimientos

- [FastAPI](https://fastapi.tiangolo.com/) - Framework backend moderno
- [MongoDB](https://www.mongodb.com/) - Base de datos NoSQL
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Font Awesome](https://fontawesome.com/) - Iconos
- [Marked.js](https://marked.js.org/) - Parser de Markdown
- [Canvas Confetti](https://www.kirilv.com/canvas-confetti/) - Efectos de celebración
- [Vitest](https://vitest.dev/) - Framework de testing

---

## 📊 Stats del Proyecto

- **Líneas de código**: ~8,000+
- **Módulos JavaScript**: 15+
- **Endpoints API**: 20
- **Páginas HTML**: 5
- **Módulos educativos**: 12
- **XP total disponible**: 14,000
- **Badges desbloqueables**: 4

---

**Desarrollado con ❤️ para la comunidad QA**

*Última actualización: Enero 2025*
