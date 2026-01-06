# 📋 Registro de Cambios - QA Master Path

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [4.0.0] - 2026-01-06

### ✨ Agregado - Sistema de Autenticación Optimizado

#### Solución Universal de Cookies httpOnly
- **Nueva implementación de cookies** que funciona tanto en localhost como en producción sin cambios de código
- `domain=None` configura automáticamente el dominio actual (localhost o producción)
- `secure` condicional según entorno: `False` en development, `True` en production
- Eliminada configuración problemática de `domain="localhost"` que causaba rechazo de cookies por navegadores

#### Documentación Nueva
- **[SOLUCION_COOKIES_HTTPONLY.md](./SOLUCION_COOKIES_HTTPONLY.md)**: Documentación técnica completa
  - Análisis de causa raíz del problema
  - Solución implementada con ejemplos de código
  - Validación y testing
  - Diferencias por entorno
  - Referencias técnicas (RFC 6265, OWASP, etc.)

- **[guides/INDICE_DOCUMENTACION.md](./guides/INDICE_DOCUMENTACION.md)**: Índice maestro de toda la documentación
  - Mapa completo de documentos
  - Orden recomendado de lectura
  - Mapa de soluciones rápidas
  - Búsqueda por tema

#### Scripts de Validación
- **[backend/test_cookies_solution.sh](./backend/test_cookies_solution.sh)**: Script automatizado de testing
  - Validación completa de configuración de cookies
  - Tests de registro y login
  - Verificación de headers HTTP
  - Validación de parámetros de seguridad
  - Resumen visual con colores

### 🔧 Modificado

#### Backend (FastAPI)
- **routes/auth.py**:
  - `COOKIE_DOMAIN = None` (antes: `os.getenv("COOKIE_DOMAIN", "localhost")`)
  - `COOKIE_SECURE = ENVIRONMENT == "production"` (condicional automático)
  - Agregados logs de debug para configuración de cookies
  - Actualizada función `set_auth_cookie()` con `domain=None` explícito
  - Actualizada función `clear_auth_cookies()` con `domain=None`

- **.env** (configuración):
  - Eliminada variable `COOKIE_DOMAIN`
  - Eliminada variable `COOKIE_SECURE` (ahora automática)
  - Agregados comentarios explicativos sobre la configuración

#### Documentación Actualizada
- **README.md**:
  - Sección "Variables de Entorno" actualizada sin COOKIE_DOMAIN
  - Sección "Seguridad" expandida con detalles de cookies
  - Nuevo troubleshooting para problemas de cookies
  - Agregado enlace a SOLUCION_COOKIES_HTTPONLY.md

- **LOCAL_SETUP.md**:
  - Configuración de .env actualizada sin COOKIE_DOMAIN
  - Instrucciones claras sobre configuración de cookies
  - Agregada referencia a documentación técnica

- **guides/ESTRUCTURA_PROYECTO.md**:
  - Variables de entorno actualizadas
  - Comentarios sobre la configuración correcta

- **guides/DOCS_ARQUITECTURA.md**:
  - Sección "Cookies Seguras" completamente reescrita
  - Tabla de autenticación actualizada con Cookie Domain y Secure
  - Agregadas ventajas de la nueva configuración

- **guides/README.md**:
  - Agregado enlace a INDICE_DOCUMENTACION.md
  - Nueva sección sobre SOLUCION_COOKIES_HTTPONLY.md
  - Actualizado orden de lectura para debugging

### 🐛 Corregido

#### Problema de Cookies en Localhost
- **Síntoma**: Las cookies no se establecían en localhost, causando que `/auth/me` retornara 401
- **Causa**: `domain="localhost"` era rechazado por navegadores modernos según RFC 6265
- **Solución**: `domain=None` permite que el navegador use el dominio actual automáticamente
- **Impacto**: Autenticación ahora funciona correctamente en todos los entornos

#### Dependencias
- Actualizado `pydantic` de 2.10.4 a 2.12.5
- Actualizado `pydantic-settings` de 2.7.1 a 2.12.0
- Corregido `starlette` a versión compatible (0.46.2)

### 🔒 Seguridad

#### Mejoras Implementadas
- **HttpOnly=true**: Cookies no accesibles desde JavaScript (protección XSS)
- **SameSite=lax**: Protección contra ataques CSRF
- **Secure condicional**: HTTPS obligatorio en producción
- **Domain=None**: Limita cookies al dominio actual (principio de menor privilegio)
- **Path específicos**: Cookie principal en `/`, refresh token en `/api/auth/refresh`

#### Configuración por Entorno
```python
# Development (localhost)
domain=None, secure=False, httponly=True, samesite=lax

# Production (Emergent)
domain=None, secure=True, httponly=True, samesite=lax
```

### 📚 Documentación

#### Nuevos Documentos
1. `SOLUCION_COOKIES_HTTPONLY.md` - 500+ líneas de documentación técnica
2. `guides/INDICE_DOCUMENTACION.md` - Índice maestro completo
3. `backend/test_cookies_solution.sh` - Script de validación (200+ líneas)
4. `CHANGELOG.md` - Este archivo

#### Documentos Actualizados
1. `README.md` - Secciones de seguridad y troubleshooting
2. `LOCAL_SETUP.md` - Configuración de .env
3. `guides/ESTRUCTURA_PROYECTO.md` - Variables de entorno
4. `guides/DOCS_ARQUITECTURA.md` - Seguridad y cookies
5. `guides/README.md` - Índice y orden de lectura

### ✅ Testing

#### Validación Automática
- Script `test_cookies_solution.sh` ejecutado exitosamente
- 6 tests pasados:
  1. Health check del backend
  2. Verificación de configuración de cookies
  3. Registro de usuario
  4. Login con validación de headers
  5. Endpoint /auth/me con cookie
  6. Endpoint /auth/me sin cookie (401)

#### Validación Manual
- Login en navegador (localhost:8000)
- Cookie `qa_session` visible en DevTools
- Endpoint /auth/me retorna 200 OK
- Sin redirecciones infinitas al login

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
- Tests unitarios (Vitest + pytest)

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
