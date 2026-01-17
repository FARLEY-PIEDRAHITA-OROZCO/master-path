# 📋 Registro de Cambios - QA Master Path

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [5.0.0] - 2025-01-17

### 🔥 CAMBIO MAYOR - Eliminación Completa del Sistema de Autenticación

#### ❌ Eliminado

**Sistema de Autenticación Completo**
- Eliminados todos los imports de Firebase de archivos HTML
- Eliminados Import Maps de Firebase en todas las páginas
- Eliminados overlays de loading de autenticación
- Eliminadas funciones de sincronización con Firestore
- Eliminada dependencia de `auth-guard-v2.js`
- Eliminadas cookies httpOnly de JWT
- Eliminados endpoints de autenticación (`/api/auth/*`)

**Archivos Frontend Limpiados**
- ✅ `/app/app/pages/dashboard.html` - Sin Firebase, sin overlay de auth
- ✅ `/app/app/pages/roadmap.html` - Sin Firebase, sin overlay de auth
- ✅ `/app/app/pages/toolbox.html` - Sin Firebase, sin overlay de auth
- ✅ `/app/app/pages/knowledge-base.html` - Sin Firebase, sin overlay de auth
- ✅ `/app/app/assets/js/storage.js` - 100% LocalStorage, sin Firebase
- ✅ `/app/app/assets/js/dashboard-ui.js` - Sin código de auth
- ✅ `/app/app/assets/js/toolbox-ui.js` - Sin requireAuth()

**Referencias Eliminadas**
- `firebase/app`
- `firebase/auth`
- `firebase/firestore`
- `auth-service-v2.js`
- `auth-guard-v2.js`
- `firebase-config.js`
- Métodos `syncWithFirestore()`
- Métodos `loadFromFirestore()`

#### ✨ Agregado

**Sistema de Storage Simplificado**
- `storage.js` completamente reescrito sin dependencias de Firebase
- Sistema 100% basado en LocalStorage del navegador
- Validación robusta de datos
- Sistema de backups automáticos (últimos 3)
- Recuperación de datos corruptos
- Exportación e importación de datos

**Backend API Público**
- Todos los endpoints ahora son públicos (sin autenticación)
- Endpoints de usuario sin protección JWT
- Endpoints de progreso sin protección JWT
- Sistema simplificado de gestión de usuarios

#### 🔧 Modificado

**Backend (FastAPI)**
- `routes/user.py` - Comentarios actualizados: "SIN AUTENTICACIÓN"
- `routes/progress.py` - Comentarios actualizados: "SIN AUTENTICACIÓN"
- `models/user.py` - Modelo simplificado sin campos de auth
- `server.py` - Mantenido limpio sin middleware de auth

**Frontend (JavaScript)**
- `storage.js` - Reescrito completamente sin Firebase
- `dashboard-ui.js` - Eliminado código de auth loading
- `toolbox-ui.js` - Eliminado import y llamada a requireAuth()
- `roadmap-ui-enhanced.js` - Funcionando sin autenticación
- `docs-enhanced.js` - Funcionando sin autenticación

**Documentación**
- `README.md` - Actualizado para reflejar sistema sin autenticación
- `CHANGELOG.md` - Este archivo con cambios v5.0.0

#### 💾 Sistema de Persistencia

**LocalStorage Principal**
```javascript
// Keys de almacenamiento
qa_master_progress     // Progreso de módulos
qa_subtask_progress    // Progreso de subtareas  
qa_module_notes        // Notas por módulo
qa_celebrated_badges   // Badges obtenidos
qa_data_version        // Versión de datos
```

**Características del Storage**
- ✅ Auto-guardado con debounce (1.5s)
- ✅ Validación de estructura de datos
- ✅ Backups automáticos (últimos 3)
- ✅ Recuperación de datos corruptos
- ✅ Exportación/importación de datos
- ✅ Migración de versiones

#### 🎯 Impacto del Cambio

**Ventajas**
- ✅ Aplicación más simple y directa
- ✅ Sin necesidad de registro/login
- ✅ Datos guardados localmente en el navegador
- ✅ Sin dependencias externas (Firebase)
- ✅ Carga más rápida (menos requests)
- ✅ Funciona completamente offline

**Consideraciones**
- ⚠️ Datos almacenados por navegador/dispositivo
- ⚠️ Limpiar cookies/cache borra el progreso
- ⚠️ No hay sincronización entre dispositivos
- ℹ️ Backend API disponible para sincronización opcional

#### 🚀 Estado del Sistema

**✅ Servicios Operativos**
```
backend     RUNNING   (puerto 8001)
frontend    RUNNING   (puerto 3000)
mongodb     RUNNING   (puerto 27017)
```

**✅ API Health Check**
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "development"
}
```

**✅ Verificaciones Completadas**
- ❌ No hay imports de Firebase
- ❌ No hay overlays de autenticación
- ❌ No hay import maps de Firebase
- ❌ No hay llamadas a requireAuth()
- ✅ LocalStorage funcionando correctamente
- ✅ Todas las páginas cargan sin errores

#### 📚 Archivos Modificados

**HTML (4 archivos)**
1. `/app/app/pages/dashboard.html`
2. `/app/app/pages/roadmap.html`
3. `/app/app/pages/toolbox.html`
4. `/app/app/pages/knowledge-base.html`

**JavaScript (3 archivos)**
1. `/app/app/assets/js/storage.js` (reescrito completo)
2. `/app/app/assets/js/dashboard-ui.js`
3. `/app/app/assets/js/toolbox-ui.js`

**Documentación (2 archivos)**
1. `/app/README.md` (actualizado completo)
2. `/app/CHANGELOG.md` (este archivo)

---

## [4.0.0] - 2026-01-06

### ✨ Agregado - Sistema de Autenticación Optimizado

#### Solución Universal de Cookies httpOnly
- **Nueva implementación de cookies** que funciona tanto en localhost como en producción sin cambios de código
- `domain=None` configura automáticamente el dominio actual (localhost o producción)
- `secure` condicional según entorno: `False` en development, `True` en production
- Eliminada configuración problemática de `domain="localhost"` que causaba rechazo de cookies por navegadores

---

## [3.0.0] - 2025-01 (versión anterior)

### Agregado
- Arquitectura fullstack con FastAPI + MongoDB
- Sistema de autenticación con JWT y cookies httpOnly
- 20 endpoints API REST
- Frontend con Vanilla JavaScript
- Sistema de progreso con sincronización
- Gamificación completa (XP, badges, rankings)

### Características Principales
- 12 módulos educativos
- Editor de notas con auto-guardado
- Dashboard interactivo
- Knowledge Base con Markdown
- Tests unitarios (pytest)

---

## Tipos de Cambios

- `Agregado` - Nuevas características
- `Modificado` - Cambios en funcionalidad existente
- `Obsoleto` - Características que serán removidas
- `Eliminado` - Características removidas
- `Corregido` - Corrección de bugs
- `Seguridad` - Cambios relacionados con seguridad

---

**Nota**: Este changelog se mantiene manualmente. Los cambios se documentan en cada release significativo.
