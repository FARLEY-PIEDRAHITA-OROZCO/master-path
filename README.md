# 🎯 QA Master Path

> Plataforma educativa gamificada para convertirse en QA Automation Engineer en 12 semanas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active-success)](https://github.com)

---

## 📋 Descripción

**QA Master Path** es una aplicación web educativa que guía a testers manuales en su transformación a QA Automation Engineers mediante un sistema progresivo de 12 módulos, gamificación con XP y badges, y un roadmap interactivo con tareas diarias.

### ✨ Características Principales

- 📚 **12 Módulos Progresivos**: Desde SDLC hasta CI/CD y Performance Testing
- 🎮 **Sistema de Gamificación**: XP, rankings dinámicos y 4 badges desbloqueables
- 🗺️ **Roadmap Interactivo**: Visualización de progreso con tareas diarias y sprints
- 📝 **Editor de Notas**: Sistema completo con auto-guardado y sincronización
- 🔒 **Autenticación Firebase**: Login con email/password y Google OAuth
- ☁️ **Sincronización en la Nube**: Progreso guardado en Firestore
- 🎨 **Diseño Moderno**: Interfaz oscura con Tailwind CSS y efectos glassmorphism
- 📖 **Base de Conocimientos**: Documentación técnica integrada con Markdown

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
Frontend:  Vanilla JavaScript (ES6 Modules) + Tailwind CSS
Auth:      Firebase Authentication
Database:  Cloud Firestore + LocalStorage (backup)
Hosting:   Static hosting compatible (GitHub Pages, Netlify, Vercel)
Testing:   Vitest + jsdom
Linting:   ESLint + Prettier
```

### Patrón de Diseño

```
┌─────────────────────────────────────────┐
│           SPA Architecture              │
├─────────────────────────────────────────┤
│  UI Layer                               │
│  ├─ pages/*.html (5 páginas)            │
│  └─ Tailwind CSS + Custom Styles       │
├─────────────────────────────────────────┤
│  Presentation Layer                     │
│  ├─ dashboard-ui.js                     │
│  ├─ roadmap-ui-enhanced.js              │
│  ├─ docs-enhanced.js                    │
│  └─ auth-ui.js                          │
├─────────────────────────────────────────┤
│  Business Logic                         │
│  ├─ app.js (AppEngine)                  │
│  ├─ auth-service.js                     │
│  └─ components.js                       │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  ├─ storage.js (StorageService)         │
│  ├─ LocalStorage API                    │
│  └─ Firestore sync                      │
├─────────────────────────────────────────┤
│  External Services                      │
│  ├─ Firebase Auth                       │
│  ├─ Cloud Firestore                     │
│  └─ JSON Data Files                     │
└─────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
/app/
├── index.html                    # Punto de entrada (redirige a dashboard)
├── README.md                     # Este archivo
├── package.json                  # Dependencias y scripts
├── eslint.config.js              # Configuración ESLint
├── .prettierrc.json              # Configuración Prettier
│
├── app/                          # Aplicación principal
│   ├── pages/                    # Páginas HTML
│   │   ├── auth.html             # Login/Registro
│   │   ├── dashboard.html        # Dashboard principal
│   │   ├── roadmap.html          # Vista de módulos
│   │   ├── toolbox.html          # Herramientas y recursos
│   │   └── knowledge-base.html   # Documentación técnica
│   │
│   └── assets/                   # Recursos estáticos
│       ├── js/                   # Módulos JavaScript
│       │   ├── app.js            # Motor de la aplicación
│       │   ├── storage.js        # Persistencia de datos
│       │   ├── components.js     # Componentes compartidos
│       │   ├── firebase-config.js# Configuración Firebase
│       │   ├── auth-service.js   # Servicio de autenticación
│       │   ├── auth-guard.js     # Protección de rutas
│       │   ├── auth-ui.js        # UI de autenticación
│       │   ├── dashboard-ui.js   # Controlador del dashboard
│       │   ├── roadmap-ui-enhanced.js  # Controlador del roadmap
│       │   ├── docs-enhanced.js  # Controlador de documentación
│       │   ├── toolbox-ui.js     # Controlador de herramientas
│       │   └── logger.js         # Sistema de logs
│       │
│       ├── data/                 # Archivos de datos
│       │   ├── modules.json      # 12 módulos del curso
│       │   └── docs.json         # Artículos técnicos
│       │
│       └── style.css             # Estilos globales
│
├── docs/                         # Documentación del proyecto
│   ├── manifest.json             # Índice de documentos
│   ├── images/                   # Imágenes compartidas
│   └── content/                  # Contenido en Markdown
│
├── guides/                       # Guías técnicas
│   ├── README.md                 # Guía del sistema de docs
│   ├── ESTRUCTURA_PROYECTO.md    # Detalles de estructura
│   ├── DOCS_ARQUITECTURA.md      # Arquitectura técnica
│   └── FIREBASE_AUTH_SETUP.md    # Guía de configuración Firebase
│
└── tests/                        # Tests automatizados
    └── unit/                     # Tests unitarios
        ├── app.test.js
        └── storage.test.js
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Firebase (gratis)
- Navegador moderno con soporte ES6

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/qa-master-path.git
cd qa-master-path

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase
# - Crea un proyecto en https://console.firebase.google.com
# - Habilita Authentication (Email/Password y Google)
# - Habilita Firestore Database
# - Copia las credenciales a app/assets/js/firebase-config.js

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:8000
```

### Scripts Disponibles

```bash
npm run dev            # Inicia servidor de desarrollo (puerto 8000)
npm start              # Alias de npm run dev
npm test               # Ejecuta tests con Vitest
npm run test:ui        # Ejecuta tests con interfaz visual
npm run test:coverage  # Genera reporte de cobertura
npm run lint           # Ejecuta ESLint
npm run lint:fix       # Corrige problemas de linting automáticamente
npm run format         # Formatea código con Prettier
npm run format:check   # Verifica formato sin modificar
```

---

## 🎮 Funcionalidades

### 📊 Dashboard

- **Barra de progreso global**: Visualización del avance general
- **XP acumulado**: Sistema de puntos con rankings dinámicos
- **4 Badges desbloqueables**:
  - 🏆 Core Master (Módulos 1-2)
  - 🥷 Tech Ninja (Módulos 3-5)
  - ✈️ Auto Pilot (Módulos 6-9)
  - 👑 QA Expert (Módulos 10-12)
- **Celebraciones con confetti**: Al completar sprints y desbloquear badges

### 🗺️ Roadmap

- **12 Módulos expandibles**: Cada uno con objetivo, cronograma y recursos
- **Progress ring por módulo**: Indicador visual del avance
- **Tareas diarias con checkboxes**: Tracking granular del progreso
- **Editor de notas completo**:
  - Auto-guardado inteligente (1.5s debounce)
  - Contador de caracteres y palabras
  - Atajos de teclado (Ctrl+S para guardar)
  - Copiar y limpiar notas
  - Sincronización con Firestore
- **Estados visuales diferenciados**:
  - 🔒 Locked (bloqueado hasta completar anterior)
  - ⚪ Pending (disponible, sin iniciar)
  - 🔵 Active (en progreso)
  - ✅ Completed (completado)
- **Botón "Cerrar Sprint"**: Reclama XP al completar un módulo

### 🔧 Toolbox

- **Herramientas categorizadas**:
  - API Testing (Postman, JSON Placeholder)
  - Automation (SelectorsHub, Playwright Codegen)
  - Documentation (ISTQB, Git Cheat Sheet)
- **Links a recursos externos**

### 📖 Knowledge Base

- **Sistema de documentación navegable**:
  - Sidebar con navegación por bloques
  - Renderizado de Markdown a HTML
  - Artículos técnicos sobre SDLC, SQL, Playwright, etc.

### 🔐 Autenticación

- **Login con Email/Password**
- **Login con Google OAuth**
- **Recuperación de contraseña**
- **Protección de rutas**: Páginas requieren autenticación
- **Sincronización automática**: Progreso guardado en la nube

---

## 💾 Sistema de Persistencia

### LocalStorage (Backup Local)

```javascript
// Keys utilizados
qa_master_progress      // {1: true, 2: false, ...} - Módulos completados
qa_subtask_progress     // {"1-0": true, ...} - Tareas individuales
qa_module_notes         // {1: "mis notas", ...} - Notas por módulo
qa_celebrated_badges    // ["core", "technical"] - Badges ya celebrados
```

### Cloud Firestore (Sincronización)

```javascript
// Colección: users/{uid}
{
  email: string,
  displayName: string,
  createdAt: timestamp,
  lastActive: timestamp,
  progress: object,
  subtasks: object,
  notes: object,
  badges: array,
  xp: number
}
```

**Estrategia**: LocalStorage como cache + Firestore como fuente de verdad

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

### Ejecutar Tests

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

### Estructura de Tests

```
/app/tests/
└── unit/
    ├── app.test.js         # Tests del AppEngine
    └── storage.test.js     # Tests del StorageService
```

---

## 🔧 Configuración de Firebase

Ver guía completa en: [`guides/FIREBASE_AUTH_SETUP.md`](./guides/FIREBASE_AUTH_SETUP.md)

### Pasos Rápidos

1. **Crear proyecto en Firebase Console**
2. **Habilitar Authentication** (Email/Password + Google)
3. **Crear Firestore Database** (modo test inicialmente)
4. **Copiar credenciales** a `app/assets/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. **Configurar reglas de Firestore**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Despliegue

### GitHub Pages

```bash
# 1. Commit y push
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Configurar en GitHub
# Settings > Pages > Source: main branch / root

# Tu app estará en:
# https://tu-usuario.github.io/qa-master-path/
```

### Netlify

```bash
# 1. Conectar repositorio en Netlify
# 2. Build command: (vacío - es estático)
# 3. Publish directory: .

# Despliegue automático en cada push
```

### Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desplegar
vercel

# Seguir instrucciones interactivas
```

---

## 🛠️ Desarrollo

### Agregar Nueva Página

1. Crear HTML en `/app/pages/nueva-pagina.html`
2. Crear controlador en `/app/assets/js/nueva-pagina-ui.js`
3. Si requiere auth, agregar:
   ```javascript
   import { requireAuth } from './auth-guard.js';
   requireAuth();
   ```
4. Agregar link en navbar (components.js)

### Agregar Nuevo Módulo

1. Editar `/app/assets/data/modules.json`
2. Agregar objeto con estructura:
   ```json
   {
     "id": 13,
     "phase": "Advanced",
     "title": "Nuevo Módulo",
     "duration": "10h",
     "xp": 2000,
     "objective": "...",
     "schedule": [...],
     "deliverables": [...],
     "resources": [...]
   }
   ```

### Agregar Artículo a Knowledge Base

1. Crear archivo Markdown en `/app/docs/content/`
2. Registrar en `/app/docs/manifest.json`:
   ```json
   {
     "id": "nuevo-articulo",
     "title": "Mi Artículo",
     "file": "ruta/al/archivo.md",
     "evidence": "Descripción"
   }
   ```

---

## 📖 Documentación Adicional

- [**Estructura del Proyecto**](./guides/ESTRUCTURA_PROYECTO.md) - Organización de archivos y directorios
- [**Arquitectura Técnica**](./guides/DOCS_ARQUITECTURA.md) - Detalles técnicos y patrones de diseño
- [**Configuración Firebase**](./guides/FIREBASE_AUTH_SETUP.md) - Guía completa de setup de autenticación
- [**Sistema de Documentación**](./guides/README.md) - Cómo agregar contenido a la Knowledge Base

---

## ⚠️ Limitaciones Conocidas

- ❌ **Sin backend propio**: Depende completamente de Firebase
- ❌ **Sin sincronización offline**: Requiere conexión para sync
- ❌ **Sin PWA**: No funciona offline (feature futuro)
- ❌ **Sin build process**: Código sin minificar en producción
- ❌ **Sin analytics**: No hay tracking de uso

---

## 🗺️ Roadmap Futuro

### Mejoras Planificadas

- [ ] **PWA**: Funcionalidad offline con Service Workers
- [ ] **Build Process**: Vite para bundling y optimización
- [ ] **Tests E2E**: Playwright para tests de integración
- [ ] **Performance**: Lazy loading y code splitting
- [ ] **Accesibilidad**: Atributos ARIA y navegación por teclado
- [ ] **Analytics**: Firebase Analytics integrado
- [ ] **Notificaciones**: Recordatorios de tareas pendientes
- [ ] **Sistema de Quizzes**: Evaluaciones interactivas por módulo

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Estilo

- **JavaScript**: Seguir configuración de ESLint
- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Código**: Ejecutar `npm run format` antes de commit

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

- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Font Awesome](https://fontawesome.com/) - Iconos
- [Marked.js](https://marked.js.org/) - Parser de Markdown
- [Canvas Confetti](https://www.kirilv.com/canvas-confetti/) - Efectos de celebración
- [Vitest](https://vitest.dev/) - Framework de testing

---

## 📊 Stats del Proyecto

- **Líneas de código**: ~5,000
- **Módulos JavaScript**: 12
- **Páginas HTML**: 5
- **Módulos educativos**: 12
- **XP total disponible**: 14,000
- **Badges desbloqueables**: 4

---

**Desarrollado con ❤️ para la comunidad QA**

*Última actualización: Enero 2025*
