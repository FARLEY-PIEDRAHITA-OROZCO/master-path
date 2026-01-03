# 🏗️ Arquitectura Técnica - QA Master Path

## 📐 Patrón de Diseño

### Arquitectura: Modular Frontend-Only

```
┌─────────────────────────────────────────┐
│           BROWSER (Cliente)             │
├─────────────────────────────────────────┤
│  UI Layer (HTML)                        │
│  ├─ index.html (Dashboard)              │
│  ├─ roadmap.html (Sprints)              │
│  ├─ toolbox.html (Recursos)             │
│  └─ knowledge-base.html (Docs)          │
├─────────────────────────────────────────┤
│  Presentation Layer (UI Controllers)    │
│  ├─ dashboard-ui.js                     │
│  ├─ roadmap-ui.js                       │
│  ├─ toolbox-ui.js                       │
│  └─ docs-ui.js                          │
├─────────────────────────────────────────┤
│  Business Logic Layer                   │
│  ├─ app.js (AppEngine)                  │
│  └─ components.js (UIComponents)        │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  ├─ storage.js (StorageService)         │
│  └─ LocalStorage API                    │
├─────────────────────────────────────────┤
│  Data Source                            │
│  ├─ modules.json (12 módulos)           │
│  └─ docs.json (artículos)               │
└─────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida de la Aplicación

### 1. Inicialización

```javascript
// Cada página ejecuta:
DOMContentLoaded → 
  UIComponents.init() → Inyecta navbar/footer
  AppEngine.init() → Fetch JSON data
  renderPage() → Dibuja contenido específico
```

### 2. Flujo de Datos

```
User Action (click checkbox)
    ↓
Event Handler (roadmap-ui.js)
    ↓
StorageService.toggleSubtask()
    ↓
LocalStorage.setItem()
    ↓
Re-render UI
```

## 📦 Módulos JavaScript

### storage.js - Data Persistence

**Responsabilidad:** Único punto de acceso a LocalStorage

**API Pública:**
```javascript
StorageService.get(key)                    // Lee datos
StorageService.save(key, data)             // Guarda datos
StorageService.toggleProgress(id, bool)    // Toggle módulo
StorageService.toggleSubtask(id, index)    // Toggle tarea
```

**Keys:**
- `PROGRESS`: Progreso de módulos
- `SUBTASKS`: Progreso de tareas individuales
- `NOTES`: Notas por módulo
- `BADGES`: Badges ya celebrados (evita duplicados)

---

### app.js - Business Logic

**Responsabilidad:** Cargar y procesar datos del curso

**Clase: AppEngine**
```javascript
init()              // Fetch modules.json
getAnalytics()      // Calcula XP, progreso, módulos completados
getBadgeStatus()    // Determina badges desbloqueados
```

**Datos cargados:**
- `modules`: Array de 12 módulos
- `tools`: Array de herramientas (Postman, Playwright, etc.)

---

### components.js - Shared UI

**Responsabilidad:** Elementos comunes en todas las páginas

**Clase: UIComponents**
```javascript
init()                  // Inyecta navbar + footer
render()                // Crea elementos DOM
highlightActiveLink()   // Marca link actual
```

**Templates:**
- Navbar con logo y navegación
- Footer con info técnica

---

### dashboard-ui.js - Dashboard Controller

**Responsabilidad:** Renderizar página principal

**Funciones:**
```javascript
refreshDashboard()      // Actualiza progreso y XP
updateBadgesUI()        // Renderiza badges desbloqueados
launchCelebration()     // Confetti cuando se desbloquea badge
```

**Lógica de Rankings:**
```javascript
const ranks = [
  { min: 10000, name: "Senior QA Automation" },
  { min: 5000, name: "QA Engineer Mid" },
  { min: 1000, name: "Technical QA Tester" },
  { min: 0, name: "Junior Talent" }
];
```

---

### roadmap-ui.js - Roadmap Controller

**Responsabilidad:** Renderizar módulos y manejar interacciones

**Funciones:**
```javascript
renderRoadmap()         // Genera HTML de 12 módulos
attachEventListeners()  // Delegación de eventos
toggleExpand(id)        // Expandir/colapsar módulo
```

**Features:**
- Progress ring SVG animado
- Checkboxes de tareas persistentes
- Textarea de notas con autosave
- Botón "Cerrar Sprint" que actualiza progreso

---

### toolbox-ui.js - Toolbox Controller

**Responsabilidad:** Renderizar herramientas por categoría

**Categorías:**
- `api`: JSON Placeholder, Schema Validator
- `automation`: SelectorsHub, Playwright Codegen
- `docs`: ISTQB Glossary, Git Cheat Sheet

---

### docs-ui.js - Documentation Controller

**Responsabilidad:** Sistema de documentación navegable

**Features:**
- Sidebar con navegación por bloques
- Parsing de Markdown con marked.js
- URL params para navegación (?topic=sdlc-stlc)

---

## 📊 Modelo de Datos

### modules.json

```json
{
  "modules": [
    {
      "id": 1,
      "phase": "Core",
      "title": "Fundamentos de QA Sólidos",
      "doc_ref": "sdlc-stlc",
      "duration": "8h",
      "xp": 500,
      "objective": "...",
      "schedule": [
        {
          "day": "Lunes",
          "topic": "Ciclos y Tipos de Prueba",
          "task": "Análisis de App Real"
        }
      ],
      "deliverables": ["Documento SDLC"],
      "resources": [
        {
          "type": "video",
          "name": "Masterclass",
          "url": "#"
        }
      ]
    }
  ],
  "tools": [...]
}
```

### docs.json

```json
{
  "blocks": [
    {
      "id": "base-foundations",
      "title": "Bloque 1: Fundamentos",
      "badge": "La Base",
      "topics": [
        {
          "id": "sdlc-stlc",
          "title": "Ciclos de Vida: SDLC & STLC",
          "content": "### Markdown content...",
          "evidence": "Diagrama requerido"
        }
      ]
    }
  ]
}
```

### LocalStorage Schema

```javascript
// qa_master_progress
{
  "1": true,   // Módulo 1 completado
  "2": false,  // Módulo 2 no completado
  "3": true
}

// qa_subtask_progress
{
  "1-0": true,   // Módulo 1, tarea 0
  "1-1": false,
  "2-0": true
}

// qa_module_notes
{
  "1": "Aprendí sobre SDLC...",
  "2": "SQL es importante para..."
}

// qa_celebrated_badges
["core", "technical"]
```

## 🎨 Sistema de Estilos

### Tailwind Classes Principales

```css
bg-slate-950        /* Background oscuro */
text-slate-300      /* Texto claro */
glass-panel         /* Efecto glassmorphism */
rounded-[2.5rem]    /* Bordes redondeados extremos */
border-white/5      /* Bordes sutiles */
```

### Custom CSS (style.css)

```css
.glass-panel {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
}

.badge-slot.unlocked {
  animation: unlock-reveal 0.8s;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.6s;
}
```

## 🔌 Dependencias Externas (CDN)

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Confetti (celebraciones) -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

<!-- Marked (Markdown parser) -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

## 🐛 Puntos Débiles Conocidos

### Limitaciones Técnicas

1. **Sin validación de datos**
   - LocalStorage puede ser manipulado desde DevTools
   - No hay checksums o hashing

2. **Sin manejo de errores robusto**
   - Fetch sin retry logic
   - JSON parse puede crashear si corrupto

3. **Performance**
   - Re-renderiza TODO el roadmap en cada cambio
   - Sin virtual scrolling
   - Sin lazy loading de módulos

4. **Accesibilidad**
   - Sin atributos ARIA
   - Sin navegación por teclado
   - Sin support para screen readers

5. **SEO**
   - Sin meta tags apropiados
   - Sin sitemap
   - Content dinámico no indexable

### ✅ Soluciones Propuestas

Ver [ROADMAP_DETALLADO.md](./ROADMAP_DETALLADO.md) para implementaciones paso a paso.

---

## 🔄 Evolución Futura

### Fase 1: Fundación (Sprint 1-2)
- Tests automatizados
- Linting y CI/CD
- Autenticación
- Backend + DB

### Fase 2: Optimización (Sprint 3-4)
- PWA
- Build process (Vite)
- Performance tuning
- Features interactivas

### Fase 3: Escalabilidad (Sprint 5-6)
- Documentación robusta
- Seguridad hardening
- Analytics
- Monetización

---

**Documentación actualizada:** Diciembre 2024