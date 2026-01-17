# Arquitectura del Sistema - QA Master Path

**Versión**: 1.0.0  
**Última actualización**: 2025-01-17

---

## 📖 Tabla de Contenidos

1. [Visión de Alto Nivel](#visión-de-alto-nivel)
2. [Arquitectura de Capas](#arquitectura-de-capas)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Módulos y Componentes](#módulos-y-componentes)
5. [Flujo de Datos](#flujo-de-datos)
6. [Dependencias](#dependencias)
7. [Configuración de Servicios](#configuración-de-servicios)
8. [Patrones de Diseño](#patrones-de-diseño)

---

## 1. Visión de Alto Nivel

### Diagrama Conceptual

```
╭─────────────────────────────────────────────────────────╮
│                        NAVEGADOR                             │
│  ┌───────────────────────────────────────────────┐  │
│  │  HTML/CSS/JS (SPA)                             │  │
│  │  • dashboard.html, roadmap.html, toolbox.html │  │
│  │  • Tailwind CSS (CDN)                         │  │
│  │  • Vanilla JavaScript ES6+                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  LocalStorage (Cache)                          │  │
│  │  • user_id, progress, settings                │  │
│  └───────────────────────────────────────────────┘  │
╰─────────────────────────────────────────────────────────╯
                            │
                    HTTP/REST (JSON)
                    GET/POST/PUT/DELETE
                            │
╭─────────────────────────────────────────────────────────╮
│                    KUBERNETES POD                            │
│                                                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  Nginx (Ingress)                               │  │
│  │  • Ruteo: /api → backend:8001                │  │
│  │  • Ruteo: /* → frontend:3000                  │  │
│  └───────────────────────────────────────────────┘  │
│         │                           │                    │
│  ┌───────┴─────────┐       ┌───────┴───────────────────┐  │
│  │  http-server     │       │  FastAPI Backend       │  │
│  │  :3000           │       │  :8001                 │  │
│  │  (Archivos       │       │  • Uvicorn           │  │
│  │   estáticos)      │       │  • 4 workers         │  │
│  └─────────────────┘       │  • Auto-reload       │  │
│                          └───────────────────────┘  │
│                                    │                    │
│                          ┌────────┴──────────────────┐  │
│                          │  Supervisord          │  │
│                          │  • Gestiona procesos  │  │
│                          └────────────────────────┘  │
╰─────────────────────────────────────────────────────────╯
                            │
                    Motor (Async Driver)
                    mongodb://...
                            │
╭─────────────────────────────────────────────────────────╮
│                     MONGODB                                │
│  Database: qa_master_path                                  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Collection: users                             │  │
│  │  • _id (ObjectId)                            │  │
│  │  • email (unique index)                      │  │
│  │  • progress (embedded document)              │  │
│  │  • settings (embedded)                       │  │
│  └───────────────────────────────────────────────┘  │
╰─────────────────────────────────────────────────────────╯
```

### Características Arquitecturales

| Aspecto | Decisión |
|---------|----------|
| **Tipo** | Monolito modular (frontend + backend separados) |
| **Comunicación** | REST API (JSON sobre HTTP) |
| **Estado** | Stateless backend + Stateful frontend (localStorage) |
| **Concurrencia** | Asíncrona (async/await en backend) |
| **Escalabilidad** | Vertical (⚠️ sin load balancing configurado) |
| **Disponibilidad** | Single instance (⚠️ sin alta disponibilidad) |

---

## 2. Arquitectura de Capas

### Vista de Capas Lógicas

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃           CAPA DE PRESENTACIÓN (Frontend)                ┃
┃  ─────────────────────────────────────────────────  ┃
┃  Responsabilidad: Interfaz de usuario y lógica de vista   ┃
┃  ─────────────────────────────────────────────────  ┃
┃  • Renderizado de páginas HTML                          ┃
┃  • Manejo de eventos de usuario                          ┃
┃  • Validación de formularios (client-side)               ┃
┃  • Animaciones y efectos visuales                        ┃
┃  • Gestión de estado UI                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                   fetch() / XMLHttpRequest
                        │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃             CAPA DE CACHE (LocalStorage)                 ┃
┃  ─────────────────────────────────────────────────  ┃
┃  Responsabilidad: Persistencia local y sincronización    ┃
┃  ─────────────────────────────────────────────────  ┃
┃  • Almacenamiento offline                                ┃
┃  • Merge de datos local vs remoto                        ┃
┃  • Estrategia de sincronización                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                    HTTP REST API
                        │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          CAPA DE APLICACIÓN (Backend API)                 ┃
┃  ─────────────────────────────────────────────────  ┃
┃  Responsabilidad: Lógica de negocio y orquestación       ┃
┃  ─────────────────────────────────────────────────  ┃
┃  Subcapa: Routers                                         ┃
┃    • Definición de endpoints                             ┃
┃    • Validación de request (Pydantic)                     ┃
┃    • Serialización de response                           ┃
┃    • Manejo de excepciones HTTP                          ┃
┃                                                           ┃
┃  Subcapa: Middleware                                      ┃
┃    • CORS (Cross-Origin Resource Sharing)                ┃
┃    ⚠️  Rate limiting (NO implementado)                  ┃
┃    ⚠️  Autenticación (NO implementada)                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
               Funciones helper / utils
                        │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃             CAPA DE SERVICIOS (Backend)                  ┃
┃  ─────────────────────────────────────────────────  ┃
┃  Responsabilidad: Integraciones y acceso a datos          ┃
┃  ─────────────────────────────────────────────────  ┃
┃  • Gestión de conexión a MongoDB                        ┃
┃  • Creación de índices                                  ┃
┃  • Pooling de conexiones                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                   Motor (Async Driver)
                        │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃           CAPA DE PERSISTENCIA (MongoDB)                 ┃
┃  ─────────────────────────────────────────────────  ┃
┃  Responsabilidad: Almacenamiento permanente de datos      ┃
┃  ─────────────────────────────────────────────────  ┃
┃  • Operaciones CRUD                                      ┃
┃  • Transacciones (implícitas por documento)            ┃
┃  • Índices para búsquedas eficientes                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 3. Estructura de Directorios

### Jerarquía Completa

```
/app/
├── index.html                    # Punto de entrada (redirige a dashboard)
├── package.json                  # Dependencias de desarrollo (vitest, eslint)
├── eslint.config.js             # Configuración de linter
├── model.patch                   # 🚧 DESCONOCIDO (posible parche de modelo)
│
├── app/                         # Frontend (SPA)
│   ├── pages/                   # Páginas HTML
│   │   ├── dashboard.html       # Dashboard principal
│   │   ├── roadmap.html         # Lista de módulos
│   │   ├── toolbox.html         # Herramientas y recursos
│   │   └── knowledge-base.html  # Base de conocimiento
│   │
│   ├── assets/                  # Recursos estáticos
│   │   ├── js/                  # JavaScript modules
│   │   │   ├── config.js        # ✅ Configuración global (BACKEND_URL)
│   │   │   ├── app.js           # ❓ Módulo principal (?)
│   │   │   ├── components.js    # Componentes reutilizables
│   │   │   ├── dashboard-ui.js  # ✅ Lógica de dashboard
│   │   │   ├── roadmap-ui-enhanced.js  # ✅ Lógica de roadmap
│   │   │   ├── toolbox-ui.js    # Lógica de toolbox
│   │   │   ├── docs-enhanced.js # Lógica de knowledge base
│   │   │   ├── logger.js        # Utilidad de logging
│   │   │   │
│   │   │   ├── storage.js       # 🟠 DEUDA TÉCNICA: 4 versiones
│   │   │   ├── storage-service-v2.js
│   │   │   ├── storage-unified.js
│   │   │   └── storage-config.js
│   │   │
│   │   ├── data/               # Datos estáticos
│   │   │   └── modules.json    # ✅ Definición de 12 módulos
│   │   │
│   │   └── style.css           # Estilos globales
│   │
│   └── vitest.config.js        # Configuración de testing
│
├── backend/                     # Backend API (FastAPI)
│   ├── server.py                # ✅ Punto de entrada FastAPI
│   ├── requirements.txt         # ✅ Dependencias Python (activo)
│   ├── requirements_new.txt     # 🚧 DESCONOCIDO (candidato?)
│   │
│   ├── routes/                  # Routers de FastAPI
│   │   ├── __init__.py          # Exporta user_router, progress_router
│   │   ├── user.py              # ✅ CRUD de usuarios
│   │   └── progress.py          # ✅ Gestión de progreso
│   │
│   ├── models/                  # Schemas Pydantic
│   │   ├── __init__.py
│   │   ├── user.py              # UserBase, UserInDB, UserResponse
│   │   └── progress.py          # ModuleProgressUpdate, etc.
│   │
│   ├── services/                # Servicios de infraestructura
│   │   ├── __init__.py
│   │   └── database.py          # ✅ Conexión a MongoDB
│   │
│   ├── middleware/              # Middleware (vacío actualmente)
│   │   └── __init__.py
│   │
│   ├── utils/                   # Utilidades
│   │   ├── __init__.py
│   │   └── validators.py        # ✅ Validadores reutilizables
│   │
│   ├── tests/                   # Tests unitarios
│   │   └── test_models.py       # Tests básicos de modelos
│   │
│   ├── manual_api_test.sh       # Script de pruebas manuales
│   ├── run_all_tests.sh         # Ejecutor de tests
│   ├── run-backend-local.sh     # Script de inicio local
│   └── DIA5_REPORTE_TESTING.md  # Reporte de testing
│
├── frontend/                    # Configuración de frontend estático
│   └── package.json             # npm start -> http-server
│
├── docs/                        # Documentación educativa
│   ├── manifest.json            # Manifiesto de contenido
│   ├── content/
│   │   └── 01-fundamentos/      # Artículos Markdown
│   │       ├── sdlc-stlc.md
│   │       ├── agile-qa.md
│   │       ├── defect-management.md
│   │       └── ejemplo-imagenes.md
│   │
│   └── images/
│       └── logo-placeholder.png.txt
│
└── tests/                       # Tests globales
    └── unit/                    # (vacío)
```

### Responsabilidades por Directorio

| Directorio | Propósito | Tecnología |
|------------|-----------|-------------|
| `/app/pages/` | Páginas HTML estáticas | HTML5 |
| `/app/assets/js/` | Lógica de frontend | JavaScript ES6+ |
| `/app/assets/data/` | Datos estáticos (módulos) | JSON |
| `/backend/routes/` | Definición de endpoints API | FastAPI |
| `/backend/models/` | Schemas y validación | Pydantic |
| `/backend/services/` | Conexiones a infraestructura | Motor/PyMongo |
| `/backend/utils/` | Funciones helpers | Python |
| `/docs/content/` | Contenido educativo | Markdown |

---

## 4. Módulos y Componentes

### 4.1 Backend - Módulos Principales

#### **server.py** (Aplicación Principal)

```python
Responsabilidades:
  1. Inicializar FastAPI app
  2. Configurar CORS middleware
  3. Registrar routers (/api/user, /api/progress)
  4. Definir lifecycle events (startup, shutdown)
  5. Endpoints básicos (/, /api/health, /api/status)

Dependencias:
  → services.database (conexión MongoDB)
  → routes.user (user_router)
  → routes.progress (progress_router)

Puerto: 8001
Host: 0.0.0.0 (escucha todas las interfaces)
Workers: 1 (modo desarrollo con reload)
```

#### **routes/user.py** (Router de Usuarios)

```python
Endpoints:
  POST   /api/user/create           # Crear usuario
  GET    /api/user/{user_id}        # Obtener perfil
  PUT    /api/user/{user_id}        # Actualizar perfil
  DELETE /api/user/{user_id}        # Eliminar usuario
  PUT    /api/user/{user_id}/settings  # Actualizar configuración
  GET    /api/user/{user_id}/stats  # Estadísticas

Dependencias:
  → services.database.get_database()
  → Pydantic models (validación automática)

Reglas de Negocio:
  • Email debe ser único
  • display_name: 2-100 caracteres
  • Actualiza last_active en cada operación
```

#### **routes/progress.py** (Router de Progreso)

```python
Endpoints:
  GET    /api/progress/{user_id}         # Obtener progreso completo
  PUT    /api/progress/module            # Actualizar módulo
  PUT    /api/progress/subtask           # Actualizar subtarea
  PUT    /api/progress/note              # Actualizar nota
  POST   /api/progress/badge             # Agregar badge
  POST   /api/progress/xp                # Agregar XP
  POST   /api/progress/sync              # Sincronización masiva
  GET    /api/progress/{user_id}/stats   # Estadísticas detalladas
  DELETE /api/progress/{user_id}         # Resetear progreso

Dependencias:
  → services.database.get_database()
  → utils.validators (validate_module_id, validate_badge_name)

Reglas de Negocio:
  • module_id: 1-100 (string numérico)
  • Badges no se duplican ($addToSet)
  • XP solo se incrementa ($inc)
  • Notas vacías se eliminan ($unset)
```

#### **services/database.py** (Servicio de MongoDB)

```python
Responsabilidades:
  1. Establecer conexión a MongoDB (async)
  2. Crear índices en startup
  3. Proporcionar instancia de DB (motor_db)
  4. Cerrar conexión en shutdown
  5. Health checks

Variables Globales:
  motor_client: AsyncIOMotorClient  # Conexión async
  motor_db: Database                # Base de datos activa
  sync_client: MongoClient          # Conexión sync (scripts)

Funciones Clave:
  - connect_to_mongo() → Conecta y crea índices
  - close_mongo_connection() → Cierra conexión
  - create_indexes() → Índices en users
  - test_connection() → Ping y stats
  - get_database() → Dependency injection

Timeout: 5 segundos (serverSelectionTimeoutMS)
```

### 4.2 Frontend - Módulos Principales

#### **config.js** (Configuración Global)

```javascript
Responsabilidades:
  1. Detectar entorno (localhost vs preview)
  2. Configurar BACKEND_URL dinámicamente
  3. Exponer window.BACKEND_URL

Lógica de Detección:
  - Si hostname contiene 'emergentagent.com' → ${protocol}//${hostname}/api
  - Si hostname es localhost/127.0.0.1 → http://localhost:8001/api
  - Default → /api

Carga: Sincrónica (script tag sin defer/async)
```

#### **dashboard-ui.js** (Lógica de Dashboard)

```javascript
Responsabilidades:
  1. Cargar progreso desde API/localStorage
  2. Renderizar dashboard (XP, badges, progreso global)
  3. Calcular estadísticas (módulos completados, tiempo restante)
  4. Animar desbloqueables (confetti en badges)
  5. Sección "Continuar donde lo dejaste"

Dependencias:
  → config.js (BACKEND_URL)
  → storage-*.js (gestión de persistencia)
  → modules.json (estructura de módulos)

APIs Consumidas:
  GET /api/progress/{user_id}
  GET /api/user/{user_id}/stats
```

#### **roadmap-ui-enhanced.js** (Lógica de Roadmap)

```javascript
Responsabilidades:
  1. Cargar y renderizar 12 módulos
  2. Acordeones expandibles por módulo
  3. Checkboxes interactivos para subtareas
  4. Actualizar progreso en tiempo real
  5. Sincronizar con backend

Dependencias:
  → config.js
  → storage-*.js
  → modules.json

APIs Consumidas:
  PUT /api/progress/subtask
  PUT /api/progress/module
  PUT /api/progress/note
  POST /api/progress/sync
```

#### **storage-*.js** (🟠 Módulos de Persistencia)

⚠️ **DEUDA TÉCNICA**: Existen 4 archivos:

```
storage.js             # ❓ Versión original?
storage-service-v2.js  # ❓ Refactor parcial?
storage-unified.js     # ❓ Versión consolidada?
storage-config.js      # ❓ Configuración?
```

**Responsabilidades Esperadas** (basado en nomenclatura):

```javascript
1. Guardar en localStorage
2. Cargar desde localStorage
3. Sincronizar con API
4. Merge de datos (local vs remoto)
5. Estrategia de conflictos

Estrategia de Sincronización (inferida):
  - Last-write-wins basado en timestamps
  - Merge de badges (unión de ambas listas)
  - XP: toma el valor mayor
```

🚧 **PENDIENTE**: Validar cuál archivo es el activo y eliminar obsoletos.

---

## 5. Flujo de Datos

### 5.1 Flujo de Lectura (GET)

```
[Navegador]
    │
    │ 1. Usuario accede a dashboard.html
    ↓
[dashboard-ui.js]
    │
    │ 2. Intenta cargar desde localStorage
    │    user_id = localStorage.getItem('user_id')
    │
    ├─────────── Si existe ───────────┐
    │                                    │
    ↓                                    ↓
❌ NO existe                        ✅ Existe
    │                                    │
    │ 3a. Muestra formulario             │ 3b. fetch(GET /api/progress/{user_id})
    │     de creación                      │
    │                                    ↓
    │                          [Backend - progress.py]
    │                                    │
    │                                    │ 4. Valida user_id
    │                                    │    ObjectId.is_valid()
    │                                    │
    │                                    │ 5. Consulta MongoDB
    │                                    │    motor_db.users.find_one({"_id": ObjectId(user_id)})
    │                                    │
    │                                    ↓
    │                          [MongoDB - Collection: users]
    │                                    │
    │                                    │ 6. Retorna documento
    │                                    │    {"_id": ..., "progress": {...}}
    │                                    │
    │                                    ↓
    │                          [Backend - progress.py]
    │                                    │
    │                                    │ 7. Serializa a JSON
    │                                    │    {"success": true, "progress": {...}}
    │                                    │
    │                                    ↓
    │                                  HTTP 200
    │                                    │
    │                                    ↓
    └──────────────────> [dashboard-ui.js]
                                         │
                                         │ 8. Actualiza localStorage
                                         │    localStorage.setItem('progress', JSON.stringify(...))
                                         │
                                         │ 9. Renderiza UI
                                         │    - Progreso global
                                         │    - XP actual
                                         │    - Badges desbloqueados
                                         │
                                         ↓
                                   [Navegador - DOM actualizado]
```

### 5.2 Flujo de Escritura (PUT/POST)

```
[Navegador]
    │
    │ 1. Usuario marca checkbox "Subtarea completada"
    ↓
[roadmap-ui.js]
    │
    │ 2. Event listener detecta cambio
    │    checkbox.addEventListener('change', handleSubtaskToggle)
    │
    │ 3. Actualiza localStorage inmediatamente (UX instantánea)
    │    progress.subtasks['1-0'] = true
    │    localStorage.setItem('progress', JSON.stringify(progress))
    │
    │ 4. Envía request a backend (asíncrono)
    │    fetch(PUT /api/progress/subtask, {
    │      body: JSON.stringify({
    │        user_id: "...",
    │        module_id: "1",
    │        task_index: 0,
    │        is_completed: true
    │      })
    │    })
    │
    ↓
[Backend - progress.py]
    │
    │ 5. Pydantic valida request
    │    SubtaskProgressUpdate.model_validate(data)
    │
    │ 6. Validación custom
    │    validate_module_id(data.module_id) → (True, None)
    │
    │ 7. Construye clave
    │    subtask_key = f"{module_id}-{task_index}"  # "1-0"
    │    field_name = f"progress.subtasks.{subtask_key}"
    │
    │ 8. Actualiza MongoDB
    │    motor_db.users.update_one(
    │      {"_id": ObjectId(user_id)},
    │      {"$set": {
    │        field_name: true,
    │        "progress.last_sync": datetime.utcnow(),
    │        "last_active": datetime.utcnow()
    │      }}
    │    )
    │
    ↓
[MongoDB]
    │
    │ 9. Operación atómica
    │    Document actualizado in-place
    │
    │ 10. Retorna acknowledged: true, modified_count: 1
    │
    ↓
[Backend - progress.py]
    │
    │ 11. Verifica resultado
    │     if result.matched_count == 0:
    │       raise HTTPException(404, "Usuario no encontrado")
    │
    │ 12. Obtiene documento actualizado
    │     updated_user = motor_db.users.find_one({"_id": ObjectId(user_id)})
    │
    │ 13. Retorna response
    │     {
    │       "success": true,
    │       "message": "Subtarea 1-0 actualizada",
    │       "subtasks": { "1-0": true, ... }
    │     }
    │
    ↓
[roadmap-ui.js]
    │
    │ 14. Actualiza localStorage con respuesta del servidor (confirmación)
    │     progress.subtasks = response.subtasks
    │     localStorage.setItem('progress', JSON.stringify(progress))
    │
    │ 15. Feedback visual
    │     - Checkmark animado
    │     - Actualiza contador "2 de 5 completadas"
    │     - Si módulo completo: confetti + badge unlock
    │
    ↓
[Navegador - UI actualizada]
```

### 5.3 Flujo de Sincronización (Offline → Online)

❓ **SUPUESTO**: Basado en nombres de archivos (`storage-unified.js`), se asume esta lógica.

```
Escenario: Usuario trabaja offline, luego recupera conexión

[Navegador - Modo Offline]
    │
    │ 1. Usuario completa 3 subtareas
    │    - Todas se guardan en localStorage
    │    - Requests a backend fallan (network error)
    │
    │ 2. localStorage.lastSync = null (nunca sincronizado)
    │
[Recupera Conexión]
    │
    │ 3. storage-unified.js detecta online
    │    window.addEventListener('online', handleOnline)
    │
    │ 4. Obtiene datos del servidor
    │    fetch(GET /api/progress/{user_id})
    │
    │ 5. Compara timestamps
    │    localData.lastSync < serverData.last_sync?
    │
    ├───── Server más reciente ───────────────────────────┐
    │                                                   │
    │ 6a. CONFLICTO                                     │ 6b. Local más reciente
    │                                                   │
    │ 7. Estrategia de merge:                           │     Sobrescribe server
    │    - Módulos: OR lógico (si completo en alguno)     │
    │    - Subtasks: OR lógico                           │
    │    - Badges: UNION (sin duplicados)               │
    │    - XP: MAX(local, server)                       │
    │    - Notas: Prioriza más reciente                │
    │                                                   │
    └───────────────────────────────────────────────────────╮
                                                              │
    8. Envía progreso consolidado                               │
       POST /api/progress/sync                                    │
       body: { user_id, modules, subtasks, badges, xp, notes }    │
                                                              │
                                                              ↓
                                                      [Backend actualiza]
                                                              │
                                                              ↓
                                                      [localStorage sincronizado]
```

---

## 6. Dependencias

### 6.1 Dependencias de Backend

#### Producción (requirements.txt)

```ini
# Core
fastapi==0.115.12          # Framework web async
uvicorn[standard]==0.27.0  # Servidor ASGI
pydantic==2.10.4           # Validación de datos
pydantic-settings==2.7.1   # Gestión de settings

# Base de datos
pymongo==4.6.1             # Driver MongoDB (sync)
motor==3.3.2               # Driver MongoDB (async)

# Utilidades
python-dotenv==1.0.0       # Variables de entorno
email-validator==2.1.0.post1  # Validación de emails

# Testing (dev)
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0

# Development
black==24.1.1              # Formatter
```

**Relaciones de Dependencia**:

```
fastapi
  ├── pydantic (validación automática)
  ├── starlette (base de FastAPI)
  └── uvicorn (servidor ASGI)

motor
  └── pymongo (base de motor)

pydantic
  └── email-validator (usado en EmailStr)
```

### 6.2 Dependencias de Frontend

#### Producción
```json
{
  "dependencies": {
    "http-server": "^14.1.1"  # Servidor de archivos estáticos
  }
}
```

#### Desarrollo (package.json root)

```json
{
  "devDependencies": {
    "@eslint/js": "^9.39.2",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "prettier": "^3.7.4",
    
    "vitest": "^4.0.16",
    "@vitest/ui": "^4.0.16",
    "@vitest/coverage-v8": "^4.0.16",
    "happy-dom": "^20.0.11",
    "jsdom": "^27.4.0",
    
    "globals": "^17.0.0"
  }
}
```

#### CDN (Cargados en HTML)

```html
<!-- En cada página -->
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
```

### 6.3 Dependencias de Infraestructura

```yaml
Servicios Externos:
  - MongoDB: ^4.4 (inferido de motor 3.3.2)
  - Kubernetes: Versión desconocida
  - Nginx: Usado como ingress (inferido)
  - Supervisord: Gestión de procesos

Variables de Entorno Requeridas:
  Backend:
    - MONGO_URL: mongodb://localhost:27017/
    - MONGO_DB_NAME: qa_master_path
    - FRONTEND_URL: http://localhost:8000
    - FRONTEND_DEV_URL: http://localhost:3000
    - ENVIRONMENT: development|production
```

---

## 7. Configuración de Servicios

### 7.1 Supervisor (Gestión de Procesos)

❓ **SUPUESTO**: Basado en mensajes de error comunes con supervisor.

**Ubicación esperada**: `/etc/supervisor/conf.d/*.conf`

```ini
[program:backend]
command=/usr/bin/python3 /app/backend/server.py
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/backend.out.log
stderr_logfile=/var/log/supervisor/backend.err.log
environment=PYTHONUNBUFFERED=1

[program:frontend]
command=/usr/bin/npx http-server /app -p 3000 -c-1 --cors
directory=/app
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/frontend.out.log
stderr_logfile=/var/log/supervisor/frontend.err.log
```

**Comandos de Control**:

```bash
sudo supervisorctl status         # Ver estado de servicios
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all
sudo supervisorctl tail backend stderr  # Ver logs de error
```

### 7.2 Kubernetes Ingress (Ruteo)

❓ **INFERIDO**: Basado en config.js y estructura de URLs.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: qa-master-path-ingress
spec:
  rules:
  - host: "*.preview.emergentagent.com"
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
```

### 7.3 MongoDB

**Configuración de Conexión**:

```python
MONGO_URL = "mongodb://localhost:27017/"
MONGO_DB_NAME = "qa_master_path"

Conexion Async:
  motor_client = AsyncIOMotorClient(
      MONGO_URL,
      serverSelectionTimeoutMS=5000,
      connectTimeoutMS=5000
  )
```

**Índices Creados**:

```javascript
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });
db.users.createIndex({ "last_active": 1 });
```

---

## 8. Patrones de Diseño

### 8.1 Backend

#### **Repository Pattern (Implícito)**

```python
# Aunque no hay clases explícitas de repositorio,
# el patrón se sigue a través de services/database.py

services/database.py → Capa de acceso a datos
routes/*.py → Consumen get_database()

Beneficio: 
  - Desacopla lógica de negocio de MongoDB
  - Fácil cambiar implementación de DB
```

#### **Dependency Injection**

```python
# FastAPI proporciona DI automática

def get_database():
    return motor_db

@router.get("/")
async def endpoint(db = Depends(get_database)):
    # db es inyectado automáticamente
    pass
```

#### **DTO Pattern (Pydantic Models)**

```python
# Modelos Pydantic actúan como DTOs

class CreateUserRequest(BaseModel):
    email: EmailStr
    display_name: str

# Validación automática + serialización
```

#### **Embedded Document Pattern (MongoDB)**

```python
# Progreso embebido en usuario
user = {
    "_id": ObjectId(),
    "email": "...",
    "progress": {  # <-- Documento embebido
        "modules": {},
        "subtasks": {}
    }
}

Beneficio: Atomicidad, menos joins
Costo: Documento puede crecer, difícil indexar subdocumentos
```

### 8.2 Frontend

#### **Module Pattern (JavaScript)**

```javascript
// Cada archivo .js es un módulo independiente
// Evita polución de namespace global

// dashboard-ui.js
(function() {
    // Variables privadas
    const state = {};
    
    // Funciones públicas
    function init() { ... }
    
    // Auto-ejecución
    init();
})();
```

#### **Cache-Aside Pattern (LocalStorage)**

```javascript
// 1. Lee de cache (localStorage)
let data = localStorage.getItem('progress');

// 2. Si no existe, consulta API
if (!data) {
    data = await fetch('/api/progress/' + userId);
    localStorage.setItem('progress', JSON.stringify(data));
}

// 3. Retorna datos
return JSON.parse(data);
```

#### **Observer Pattern (Event Listeners)**

```javascript
// Listeners observan cambios en UI
checkbox.addEventListener('change', (e) => {
    handleSubtaskToggle(e.target.checked);
});

window.addEventListener('online', () => {
    syncWithBackend();
});
```

---

## Siguientes Documentos

👉 **[DATA-MODEL.md](./DATA-MODEL.md)** - Modelo de datos y schemas  
👉 **[API-REFERENCE.md](./API-REFERENCE.md)** - Referencia completa de APIs

---

**Última revisión**: 2025-01-17
