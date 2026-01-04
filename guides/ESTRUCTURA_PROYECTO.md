# 📁 Estructura del Proyecto - QA Master Path

## 🎯 Estructura Profesional Implementada

```
/app/
├── index.html                          ← Punto de entrada (redirige a dashboard)
│
├── pages/                              ← 🆕 Todas las páginas HTML organizadas
│   ├── auth.html                      ← Autenticación (login/registro)
│   ├── dashboard.html                 ← Dashboard principal
│   ├── toolbox.html                   ← Herramientas QA
│   ├── roadmap.html                   ← Ruta de aprendizaje
│   └── knowledge-base.html            ← Base de conocimiento
│
├── app/
│   └── assets/                        ← Recursos estáticos
│       ├── js/                       ← Módulos JavaScript
│       │   ├── firebase-config.js
│       │   ├── auth-service.js
│       │   ├── auth-guard.js
│       │   ├── auth-ui.js
│       │   ├── dashboard-ui.js
│       │   ├── toolbox-ui.js
│       │   ├── roadmap-ui.js
│       │   ├── docs-ui.js
│       │   ├── app.js
│       │   ├── storage.js
│       │   ├── components.js
│       │   └── logger.js
│       ├── data/                     ← Archivos JSON
│       │   ├── modules.json
│       │   └── docs.json
│       └── style.css                 ← Estilos globales
│
├── docs/                              ← Documentación del proyecto
│   ├── ESTRUCTURA_PROYECTO.md        ← Este archivo
│   ├── FIREBASE_AUTH_SETUP.md
│   ├── DOCS_ARQUITECTURA.md
│   └── ...
│
├── package.json
├── README.md
└── start-dev-server.sh
```

---

## 🔗 Rutas y URLs

### Páginas Públicas
- **Landing/Redirect**: `http://localhost:8000/` o `/app/index.html`
- **Login**: `http://localhost:8000/pages/auth.html`

### Páginas Protegidas (requieren autenticación)
- **Dashboard**: `http://localhost:8000/pages/dashboard.html`
- **Toolbox**: `http://localhost:8000/pages/toolbox.html`
- **Roadmap**: `http://localhost:8000/pages/roadmap.html`
- **Knowledge Base**: `http://localhost:8000/pages/knowledge-base.html`

---

## 🔐 Flujo de Autenticación

```
Usuario accede a página protegida
         ↓
¿Está autenticado?
         ↓
    NO → Redirige a /pages/auth.html?redirect=<página_original>
         ↓
    Login exitoso → Redirige a página original
         ↓
    SÍ → Muestra contenido
```

---

## 🛠️ Rutas en Código JavaScript

### auth-guard.js
```javascript
// Ruta base de páginas
const basePath = '/app/pages/';

// Redirige a login si no autenticado
window.location.href = '/app/pages/auth.html?redirect=...';

// Redirige a dashboard por defecto
const redirect = params.get('redirect') || '/app/pages/dashboard.html';
```

### Links entre páginas HTML
```html
<!-- Desde dashboard.html -->
<a href="roadmap.html">Continuar Ruta</a>
<a href="toolbox.html">Tools</a>

<!-- Nota: Links relativos funcionan porque están en la misma carpeta -->
```

---

## 📊 Ventajas de esta Estructura

✅ **Escalabilidad**: Fácil agregar nuevas páginas sin saturar la raíz
✅ **Organización**: Separación clara entre contenido y recursos
✅ **Mantenibilidad**: Estructura predecible y estándar
✅ **SEO**: index.html en raíz como punto de entrada
✅ **Profesional**: Sigue mejores prácticas de la industria

---

## 🔄 Comparación: Antes vs Ahora

### ❌ ANTES (Desorganizado)
```
/app/
├── index.html
├── auth.html                    ← Mezclado en raíz
├── toolbox.html                 ← Mezclado en raíz
├── roadmap.html                 ← Mezclado en raíz
├── knowledge-base.html          ← Mezclado en raíz
└── app/
    └── auth.html                ← ¡Duplicado!
```

### ✅ AHORA (Organizado)
```
/app/
├── index.html                   ← Solo punto de entrada
├── pages/                       ← Todo organizado
│   ├── auth.html
│   ├── dashboard.html
│   ├── toolbox.html
│   ├── roadmap.html
│   └── knowledge-base.html
```

---

## 🚀 Para Desarrolladores

### Agregar Nueva Página

1. **Crear HTML en `/app/pages/nueva-pagina.html`**
2. **Crear JS en `/app/app/assets/js/nueva-pagina-ui.js`**
3. **Si requiere auth, agregar al inicio del JS:**
   ```javascript
   import { requireAuth } from './auth-guard.js';
   requireAuth();
   ```
4. **Agregar link en otras páginas:**
   ```html
   <a href="nueva-pagina.html">Nueva Página</a>
   ```

### Agregar Nueva Funcionalidad JS

1. **Crear módulo en `/app/app/assets/js/mi-modulo.js`**
2. **Exportar funciones:**
   ```javascript
   export function miFuncion() { ... }
   ```
3. **Importar donde se necesite:**
   ```javascript
   import { miFuncion } from './mi-modulo.js';
   ```

---

## 📝 Notas Importantes

- **Index.html**: Solo redirige al dashboard. Es el punto de entrada público.
- **Pages/**: Todas las páginas HTML están aquí (mejor organización).
- **Assets/**: Recursos estáticos (JS, CSS, JSON, imágenes).
- **Docs/**: Documentación del proyecto (no se sirve públicamente).

---

## 🔧 Scripts Útiles

```bash
# Iniciar servidor de desarrollo
cd /app
npx http-server -p 8000 -c-1

# Ver estructura del proyecto
tree -L 3 -I 'node_modules|.git'

# Buscar archivos HTML
find . -name "*.html" -type f

# Buscar archivos JS
find . -name "*.js" -type f | grep -v node_modules
```

---

**Fecha de última actualización**: Enero 2025  
**Versión**: 2.0 (Reestructuración profesional)
