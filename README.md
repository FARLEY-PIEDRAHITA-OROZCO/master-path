# 🎯 QA Master Path

> Plataforma educativa gamificada para convertirse en QA Automation Engineer en 12 semanas

![CI Pipeline badge indicating the current status of the Continuous Integration process for the QA Master Path project. The badge displays the text "CI Pipeline" and visually represents whether the build is passing or failing. This information is crucial for assessing the project's code quality and integration health, ensuring that the application is functioning as intended.](https://github.com/FARLEY-PIEDRAHITA-OROZCO/qa-master-path/workflows/CI%20Pipeline/badge.svg)
![Coverage badge displaying the percentage of code covered by tests for the QA Master Path project on the main branch. The badge features a graph that visually represents the project's testing effectiveness, indicating how well the code is tested. The text on the badge shows the exact percentage of coverage, providing essential information for assessing code quality and reliability.](https://codecov.io/gh/FARLEY-PIEDRAHITA-OROZCO/qa-master-path/branch/main/graph/badge.svg)

## 📋 ¿Qué es esto?

Aplicación web educativa que guía a testers manuales en su transformación a QA Automation Engineers mediante:
- 12 módulos progresivos (SDLC → Playwright → CI/CD)
- Sistema de gamificación (XP, badges, progreso)
- Roadmap interactivo con tareas diarias
- Documentación técnica integrada
- Toolbox de recursos

## 🏗️ Arquitectura Actual

**Stack:** Vanilla JavaScript + Tailwind CSS + LocalStorage

**Tipo:** Single Page Application (SPA) estática - Frontend only

**Persistencia:** LocalStorage del navegador

## 📁 Estructura del Proyecto

```
/app/
├── index.html              # Dashboard principal (progreso global, badges)
├── roadmap.html            # Vista de 12 módulos con sprints
├── toolbox.html            # Recursos y herramientas externas
├── knowledge-base.html     # Documentación técnica
├── assets/
│   ├── js/
│   │   ├── storage.js      # Gestión de LocalStorage
│   │   ├── app.js          # Lógica de negocio y datos
│   │   ├── components.js   # Navbar/Footer compartidos
│   │   ├── dashboard-ui.js # Renderizado del dashboard
│   │   ├── roadmap-ui.js   # Renderizado de módulos
│   │   ├── toolbox-ui.js   # Renderizado de herramientas
│   │   └── docs-ui.js      # Renderizado de documentación
│   ├── data/
│   │   ├── modules.json    # 12 módulos + herramientas
│   │   └── docs.json       # Artículos técnicos
│   └── style.css           # Estilos globales
└── tests/                  # (Por crear - ver ROADMAP)
```

## 🔄 Flujo de Datos

```
1. Usuario carga página
2. AppEngine.init() → fetch modules.json
3. UIComponents.init() → inyecta navbar/footer
4. StorageService.get() → lee progreso local
5. Renderizado dinámico con datos
6. Usuario interactúa → StorageService.save()
```

## 🎮 Funcionalidades Principales

### Dashboard (index.html)
- Barra de progreso global
- XP acumulado y ranking dinámico
- 4 badges desbloqueables (Core, Technical, Automation, Expert)
- Links a otras secciones

### Roadmap (roadmap.html)
- 12 módulos expandibles
- Progress ring por módulo
- Tareas diarias con checkboxes
- Editor de notas por módulo
- Botón "Cerrar Sprint" para reclamar XP

### Toolbox (toolbox.html)
- Herramientas categorizadas (API, Automation, Docs)
- Links externos a recursos

### Knowledge Base (knowledge-base.html)
- Sidebar con navegación por bloques
- Renderizado de Markdown a HTML
- Artículos técnicos

## 💾 Persistencia (LocalStorage)

**Keys utilizados:**
```javascript
qa_master_progress    // {1: true, 2: false, ...} - Módulos completados
qa_subtask_progress   // {"1-0": true, ...} - Tareas individuales
qa_module_notes       // {1: "mis notas", ...} - Notas por módulo
qa_celebrated_badges  // ["core", "technical"] - Badges ya celebrados
```

## 🎯 Sistema de Gamificación

**XP por módulo:**
- Core: 500-600 XP
- Technical: 750-900 XP
- Automation: 1200-1600 XP
- Expert: 1800-3000 XP

**Rankings dinámicos:**
- 0-999 XP: Junior Talent
- 1000-4999: Technical QA Tester
- 5000-9999: QA Engineer Mid
- 10000+: Senior QA Automation

**Badges:**
- Core Master: Completar módulos 1-2
- Tech Ninja: Completar módulos 3-5
- Auto Pilot: Completar módulos 6-9
- QA Expert: Completar módulos 10-12

## 🚀 Cómo Ejecutar

### Desarrollo Local
```bash
# Opción 1: Live Server (VS Code extension)
# Click derecho en index.html > Open with Live Server

# Opción 2: Python HTTP Server
python -m http.server 8000
# Abrir: http://localhost:8000

# Opción 3: Node HTTP Server
npx http-server -p 8000
```

### Producción
Hosting estático (GitHub Pages, Netlify, Vercel):
```bash
git push origin main
# Configurar Pages en Settings > Pages > Deploy from main
```

## 📚 Módulos Disponibles

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

## 🔧 Tecnologías

- **Frontend:** Vanilla JavaScript ES6 Modules
- **Estilos:** Tailwind CSS (CDN)
- **Iconos:** Font Awesome 6
- **Animaciones:** Canvas Confetti
- **Markdown:** Marked.js
- **Persistencia:** LocalStorage API

## ⚠️ Limitaciones Actuales

- ❌ Sin autenticación (todos los datos son locales)
- ❌ Sin sincronización entre dispositivos
- ❌ Sin backend (no hay DB real)
- ❌ Sin tests automatizados
- ❌ Sin build process (código sin minificar)
- ❌ Sin PWA (no funciona offline)
- ❌ Sin analytics

## 🛣️ Roadmap de Mejoras

Ver **[README_ROADMAP.md](./README_ROADMAP.md)** para plan detallado de 12 semanas con:
- Testing automatizado
- Sistema de autenticación
- Backend + Base de datos
- PWA y performance
- Features interactivas
- Seguridad

## 📖 Documentación Adicional

- **[DOCS_ARQUITECTURA.md](./docs/DOCS_ARQUITECTURA.md)** - Arquitectura detallada
- **[README_ROADMAP.md](./docs/README_ROADMAP.md)** - Plan de mejoras
- **[ROADMAP_DETALLADO.md](./docs/ROADMAP_DETALLADO.md)** - Sprint 1 paso a paso
- **[ROADMAP_SPRINT_2.md](./docs/ROADMAP_SPRINT_2.md)** - Autenticación

## 📝 Licencia

MIT License - Libre para usar, modificar y distribuir

---

**Desarrollado con ❤️ para la comunidad QA**