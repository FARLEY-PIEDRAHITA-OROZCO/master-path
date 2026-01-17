# 🎯 QA Master Path

> Plataforma educativa gamificada fullstack para convertirse en QA Automation Engineer en 12 semanas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-success.svg)](https://www.mongodb.com/)

---

## 📋 Descripción

**QA Master Path** es una aplicación web fullstack que guía a testers manuales en su transformación a QA Automation Engineers mediante:

- 📚 **12 Módulos Progresivos**: Desde SDLC hasta CI/CD y Performance Testing
- 🎮 **Sistema de Gamificación**: XP, rankings dinámicos y 4 badges desbloqueables
- 🗺️ **Roadmap Interactivo**: Visualización de progreso con tareas diarias
- 📝 **Editor de Notas**: Sistema completo con auto-guardado y persistencia local
- 💾 **LocalStorage**: Almacenamiento de progreso en el navegador
- ☁️ **Backend REST API**: API REST con FastAPI + MongoDB para gestión de usuarios y progreso
- 🎨 **Diseño Moderno**: Interfaz oscura con Tailwind CSS y efectos glassmorphism
- 📖 **Base de Conocimientos**: Documentación técnica integrada con Markdown

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
Frontend:  Vanilla JavaScript (ES6 Modules) + Tailwind CSS
Backend:   FastAPI (Python 3.11) + MongoDB
Storage:   LocalStorage (Frontend) + MongoDB (Backend opcional)
Database:  MongoDB 7.0 (Motor async driver)
Hosting:   Static frontend + FastAPI backend
Testing:   pytest (backend)
Linting:   ESLint
```

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FULLSTACK APPLICATION                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vanilla JS)                                       │
│  ├─ pages/*.html (4 páginas)                                │
│  ├─ storage-unified.js (LocalStorage + validación)          │
│  ├─ dashboard-ui.js, roadmap-ui.js, etc.                    │
│  └─ Tailwind CSS + Custom Styles                            │
├─────────────────────────────────────────────────────────────┤
│  Backend API (FastAPI) - OPCIONAL                            │
│  ├─ /api/user/* (CRUD de usuarios públicos)                │
│  ├─ /api/progress/* (sincronización de progreso)           │
│  └─ MongoDB async operations (Motor)                        │
├─────────────────────────────────────────────────────────────┤
│  Database (MongoDB)                                          │
│  ├─ users collection (perfil + progreso)                   │
│  ├─ Embedded progress data (modules, subtasks, notes)      │
│  └─ Indexed fields (email, created_at)                     │
└─────────────────────────────────────────────────────────────┘
```

### Sistema de Almacenamiento

```
1. Usuario interactúa con la aplicación
   ↓
2. Frontend guarda progreso en LocalStorage
   ↓
3. Datos persisten en el navegador del usuario
   ↓
4. (Opcional) Sincronización con backend API
   ↓
5. ✅ Progreso guardado localmente y/o en la nube
```

---

## 📁 Estructura del Proyecto

```
/app/
├── backend/                      # Backend FastAPI (Opcional)
│   ├── server.py                 # Punto de entrada FastAPI
│   ├── requirements.txt          # Dependencias Python
│   ├── models/                   # Modelos Pydantic
│   │   ├── user.py               # Modelos de usuario
│   │   └── progress.py           # Modelos de progreso
│   ├── routes/                   # Endpoints API
│   │   ├── user.py               # Usuario (CRUD público)
│   │   └── progress.py           # Progreso (sincronización)
│   ├── services/                 # Lógica de negocio
│   │   └── database.py           # Conexión MongoDB
│   └── utils/                    # Utilidades
│       └── validators.py         # Validaciones
│
├── app/                          # Frontend
│   ├── pages/                    # Páginas HTML
│   │   ├── dashboard.html        # Dashboard principal
│   │   ├── roadmap.html          # Vista de módulos
│   │   ├── toolbox.html          # Herramientas
│   │   └── knowledge-base.html   # Documentación
│   └── assets/                   # Recursos estáticos
│       ├── js/                   # Módulos JavaScript
│       │   ├── config.js         # Configuración global
│       │   ├── storage.js        # Persistencia LocalStorage
│       │   ├── storage-unified.js     # Sistema de storage unificado
│       │   ├── dashboard-ui.js        # Controlador dashboard
│       │   ├── roadmap-ui-enhanced.js # Controlador roadmap
│       │   ├── docs-enhanced.js       # Controlador docs
│       │   └── app.js                 # Motor de aplicación
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
├── README.md                     # Este archivo
└── CHANGELOG.md                  # Registro de cambios
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Python 3.11+** y pip (para backend opcional)
- **Node.js 18+** y npm (para servidor de desarrollo)
- **MongoDB 7.0+** instalado y corriendo (para backend opcional)
- Navegador moderno con soporte ES6

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/FARLEY-PIEDRAHITA-OROZCO/qa-master-path.git
cd qa-master-path

# 2. (Opcional) Instalar dependencias del backend
cd backend
pip install -r requirements.txt

# 3. (Opcional) Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Instalar dependencias del frontend
cd ..
npm install

# 5. (Opcional) Verificar que MongoDB esté corriendo
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Variables de Entorno (Backend Opcional)

Crear archivo `/app/backend/.env`:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# CORS Configuration
FRONTEND_URL=http://localhost:8000
FRONTEND_DEV_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=True
```

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

**Terminal 1 - Backend (Opcional):**
```bash
cd /app/backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd /app
npm run dev
# o directamente: npx http-server -p 3000 -c-1
```

**Terminal 3 - MongoDB (si usas backend):**
```bash
mongod --dbpath /path/to/data
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **API Backend (opcional)**: http://localhost:8001
- **API Docs (Swagger)**: http://localhost:8001/api/docs
- **API Redoc**: http://localhost:8001/api/redoc

---

## 📊 API Endpoints (Backend Opcional)

### Usuario (`/api/user/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/user/create` | Crear usuario básico | No |
| GET | `/api/user/{user_id}` | Obtener perfil | No |
| PUT | `/api/user/{user_id}` | Actualizar perfil | No |
| PUT | `/api/user/{user_id}/settings` | Actualizar configuración | No |
| DELETE | `/api/user/{user_id}` | Eliminar usuario | No |
| GET | `/api/user/{user_id}/stats` | Estadísticas del usuario | No |

### Progreso (`/api/progress/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/progress/{user_id}` | Obtener progreso completo | No |
| PUT | `/api/progress/module` | Actualizar módulo | No |
| PUT | `/api/progress/subtask` | Actualizar subtarea | No |
| PUT | `/api/progress/note` | Actualizar nota | No |
| POST | `/api/progress/badge` | Agregar badge | No |
| POST | `/api/progress/xp` | Agregar XP | No |
| POST | `/api/progress/sync` | Sincronización completa | No |
| GET | `/api/progress/{user_id}/stats` | Estadísticas de progreso | No |
| DELETE | `/api/progress/{user_id}` | Resetear progreso | No |

**Total: 15 endpoints públicos** ✅

---

## 💾 Sistema de Persistencia

### LocalStorage (Principal)

La aplicación utiliza **LocalStorage** del navegador para almacenar:

```javascript
// Keys de almacenamiento
qa_master_progress     // Progreso de módulos
qa_subtask_progress    // Progreso de subtareas
qa_module_notes        // Notas por módulo
qa_celebrated_badges   // Badges obtenidos
qa_data_version        // Versión de datos
```

### MongoDB Schema (Backend Opcional)

```javascript
// Colección: users
{
  _id: ObjectId,
  email: string (único, indexed),
  display_name: string,
  photo_url: string | null,
  created_at: ISODate,
  last_active: ISODate,
  
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
  - Almacenamiento en LocalStorage
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
- Búsqueda y marcadores
- Modo de lectura enfocado

---

## 🎯 Sistema de Gamificación

### XP por Módulo

| Fase | XP Range | Módulos |
|------|----------|----------|
| Core | 500-600 | Módulos 1-2 |
| Technical | 750-900 | Módulos 3-5 |
| Automation | 1200-1600 | Módulos 6-9 |
| Expert | 1800-3000 | Módulos 10-12 |

**Total XP disponible**: ~14,000 XP

### Rankings Dinámicos

| XP Range | Ranking |
|----------|----------|
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

### Backend Tests

```bash
cd backend

# Ejecutar todos los tests
pytest

# Tests con cobertura
pytest --cov=. --cov-report=html

# Tests específicos
pytest tests/test_user_endpoints.py -v
```

### Scripts Disponibles

```bash
# Frontend
npm run dev            # Inicia servidor de desarrollo (puerto 3000)
npm start              # Alias de npm run dev

# Backend
cd backend
uvicorn server:app --reload    # Servidor de desarrollo
pytest                         # Ejecutar tests
black .                        # Formatear código
```

---

## 🔒 Características de Almacenamiento

### LocalStorage

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| Persistencia | ✅ ACTIVO | Datos guardados en el navegador |
| Validación | ✅ ACTIVO | Validación de estructura de datos |
| Backup | ✅ ACTIVO | Backups automáticos (últimos 3) |
| Recuperación | ✅ ACTIVO | Recuperación de datos corruptos |
| Exportación | ✅ ACTIVO | Exportar/importar datos |
| Límite | ⚠️ 5-10MB | Límite del navegador |

### Backend API (Opcional)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| CRUD Usuarios | ✅ PÚBLICO | Endpoints sin autenticación |
| Sincronización | ✅ PÚBLICO | Guardar progreso en MongoDB |
| Input Validation | ✅ ACTIVO | Pydantic models |
| Error Handling | ✅ ROBUSTO | Try-catch en todos los endpoints |
| CORS | ✅ CONFIGURADO | Orígenes permitidos definidos |

---

## 🐛 Troubleshooting

### Frontend no carga

```bash
# Verificar que el servidor esté corriendo
ps aux | grep http-server

# Reiniciar servidor
npm run dev

# Verificar puerto 3000 esté disponible
lsof -i :3000
```

### Datos no se guardan

```bash
# Limpiar LocalStorage del navegador
# DevTools (F12) > Application > Storage > Local Storage > Eliminar

# Verificar límite de LocalStorage
# DevTools (F12) > Console:
console.log(JSON.stringify(localStorage).length);
```

### Backend no inicia (si usas backend)

```bash
# Verificar dependencias
pip install -r requirements.txt

# Verificar que MongoDB esté corriendo
mongosh --eval "db.version()"

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

---

## 📖 Documentación Adicional

- [**Estructura del Proyecto**](./guides/ESTRUCTURA_PROYECTO.md) - Organización de archivos y directorios
- [**Arquitectura Técnica**](./guides/DOCS_ARQUITECTURA.md) - Detalles técnicos y patrones de diseño
- [**Sistema de Documentación**](./guides/README.md) - Cómo agregar contenido a la Knowledge Base
- [**Registro de Cambios**](./CHANGELOG.md) - Historial de versiones y cambios

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
- **JavaScript**: Código limpio y modular
- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)

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

---

## 📊 Stats del Proyecto

- **Líneas de código**: ~7,000+
- **Módulos JavaScript**: 12+
- **Endpoints API**: 15 (públicos)
- **Páginas HTML**: 4
- **Módulos educativos**: 12
- **XP total disponible**: 14,000
- **Badges desbloqueables**: 4

---

**Desarrollado con ❤️ para la comunidad QA**

*Última actualización: Enero 2025*
