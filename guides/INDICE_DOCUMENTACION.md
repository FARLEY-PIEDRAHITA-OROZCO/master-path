# 📚 Índice Completo de Documentación - QA Master Path

> Documentación técnica completa del proyecto QA Master Path

---

## 📖 Guías de Usuario

### 1. [README.md](../README.md) - **COMIENZA AQUÍ**
**Descripción**: Documentación principal del proyecto

**Contenido**:
- Descripción general del proyecto
- Stack tecnológico
- Arquitectura de alto nivel
- Inicio rápido
- API Endpoints completos
- Sistema de gamificación
- Scripts disponibles
- Troubleshooting básico

**Para quién**: Todos los usuarios, desarrolladores nuevos, overview del proyecto

---

### 2. [LOCAL_SETUP.md](../LOCAL_SETUP.md)
**Descripción**: Guía completa de configuración local

**Contenido**:
- Prerrequisitos (Python, Node.js, MongoDB)
- Instalación paso a paso del backend
- Instalación paso a paso del frontend
- Configuración de variables de entorno (.env)
- Ejecución de servicios
- Verificación de instalación
- Troubleshooting detallado

**Para quién**: Desarrolladores configurando el proyecto por primera vez

---

### 3. [SOLUCION_COOKIES_HTTPONLY.md](../SOLUCION_COOKIES_HTTPONLY.md) ⭐ **NUEVO**
**Descripción**: Documentación técnica completa sobre autenticación con cookies httpOnly

**Contenido**:
- Análisis de causa raíz del problema original
- Solución implementada (domain=None)
- Diferencias entre entorno local vs producción
- Validación y testing
- Seguridad implementada
- Cómo verificar en local y producción
- Referencias técnicas (RFC 6265, OWASP, etc.)

**Para quién**: 
- Desarrolladores trabajando con autenticación
- Ingenieros de seguridad
- Debugging de cookies en localhost
- Implementación de cookies httpOnly

**Puntos clave**:
- ✅ Solución universal que funciona en local y producción
- ✅ `domain=None` para compatibilidad
- ✅ `secure` condicional según entorno
- ✅ Incluye script de validación automático

---

## 🏗️ Guías Técnicas

### 4. [guides/ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)
**Descripción**: Organización detallada de archivos y directorios

**Contenido**:
- Estructura completa de carpetas
- Backend: modelos, rutas, servicios, middleware
- Frontend: páginas, assets, módulos JavaScript
- Rutas y URLs de la aplicación
- Flujo de autenticación detallado
- Flujo de sincronización de progreso
- MongoDB Schema completo con índices
- Responsabilidades de cada módulo
- Cómo agregar nuevos endpoints
- Cómo agregar nuevas páginas
- Variables de entorno explicadas
- Testing (backend y frontend)
- Dependencias principales

**Para quién**: 
- Desarrolladores nuevos en el proyecto
- Arquitectos de software
- Code reviewers
- Mantenimiento y debugging

---

### 5. [guides/DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md)
**Descripción**: Arquitectura técnica profunda de la aplicación

**Contenido**:
- Patrón de diseño fullstack
- Diagramas de arquitectura (3 capas)
- Flujos de datos detallados:
  - Flujo de autenticación (login)
  - Flujo de petición protegida
  - Flujo de sincronización de progreso
- Módulos Backend explicados (FastAPI):
  - server.py
  - services/database.py (Motor async)
  - services/auth_service.py
  - services/jwt_service.py
  - middleware/auth_middleware.py
  - utils/password.py (bcrypt)
- Módulos Frontend explicados (JavaScript):
  - auth-service-v2.js
  - storage-service-v2.js
  - auth-guard-v2.js
- Modelo de datos MongoDB con índices
- Seguridad implementada:
  - Autenticación
  - Cookies seguras (httpOnly, SameSite, Secure)
  - CORS
  - Input validation
- Puntos débiles y mejoras
- Recomendaciones para producción

**Para quién**:
- Arquitectos de software
- Desarrolladores avanzados
- Implementación de nuevas features
- Optimización y escalabilidad

---

### 6. [guides/README.md](./README.md)
**Descripción**: Índice de guías técnicas y sistema de documentación

**Contenido**:
- Índice de todos los documentos técnicos
- Orden recomendado de lectura
- Sistema de Knowledge Base (docs/)
- Cómo agregar nuevos documentos Markdown
- Uso de imágenes en documentación
- Sintaxis Markdown soportada
- Scripts útiles
- Troubleshooting para desarrollo

**Para quién**:
- Desarrolladores nuevos buscando orientación
- Contribuidores agregando documentación
- Gestión del sistema de docs interno

---

## 🧪 Scripts y Herramientas

### 7. [backend/test_cookies_solution.sh](../backend/test_cookies_solution.sh) ⭐ **NUEVO**
**Descripción**: Script automatizado de verificación de cookies httpOnly

**Funcionalidad**:
- ✅ Health check del backend
- ✅ Verificación de configuración de cookies
- ✅ Registro de usuario de prueba
- ✅ Login y captura de headers Set-Cookie
- ✅ Validación de parámetros de cookie (HttpOnly, SameSite, Domain, Secure)
- ✅ Prueba de /auth/me con cookie
- ✅ Prueba de /auth/me sin cookie (debe fallar)
- ✅ Resumen visual con colores

**Cómo usar**:
```bash
bash /app/backend/test_cookies_solution.sh
```

**Para quién**:
- Testing de autenticación
- Debugging de cookies
- Validación después de cambios
- CI/CD pipelines

---

## 📊 Orden Recomendado de Lectura

### Para Desarrolladores Nuevos:

1. **[README.md](../README.md)** - Entender qué es el proyecto
2. **[LOCAL_SETUP.md](../LOCAL_SETUP.md)** - Configurar entorno local
3. **[guides/ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)** - Familiarizarse con la estructura
4. **[guides/DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md)** - Profundizar en arquitectura
5. **[guides/README.md](./README.md)** - Aprender sobre el sistema de docs

### Para Debugging de Autenticación:

1. **[SOLUCION_COOKIES_HTTPONLY.md](../SOLUCION_COOKIES_HTTPONLY.md)** - Entender la solución de cookies
2. **[backend/test_cookies_solution.sh](../backend/test_cookies_solution.sh)** - Ejecutar validación
3. **[guides/DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md)** - Ver flujos de autenticación

### Para Contribuir:

1. **[README.md](../README.md)** - Guías de estilo y proceso de contribución
2. **[guides/ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)** - Dónde poner nuevos archivos
3. **[guides/README.md](./README.md)** - Cómo agregar documentación

---

## 🎯 Mapa de Soluciones Rápidas

| Problema | Documento | Sección |
|----------|-----------|---------|
| Cookies no se establecen en localhost | [SOLUCION_COOKIES_HTTPONLY.md](../SOLUCION_COOKIES_HTTPONLY.md) | "Validación de la Solución" |
| Configurar proyecto desde cero | [LOCAL_SETUP.md](../LOCAL_SETUP.md) | Todo el documento |
| Agregar nuevo endpoint API | [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | "Agregar Nuevo Endpoint Backend" |
| Agregar nueva página frontend | [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | "Agregar Nueva Página Frontend" |
| Entender flujo de autenticación | [DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md) | "Flujo de Autenticación" |
| MongoDB no conecta | [LOCAL_SETUP.md](../LOCAL_SETUP.md) | "Solución de Problemas" |
| Error CORS en navegador | [README.md](../README.md) | "Troubleshooting" |
| Agregar artículo a Knowledge Base | [guides/README.md](./README.md) | "Sistema de Documentación" |

---

## 📁 Estructura de Documentación

```
/app/
├── README.md                          # Documentación principal ⭐
├── LOCAL_SETUP.md                     # Setup local completo
├── SOLUCION_COOKIES_HTTPONLY.md       # Docs técnicas de cookies ⭐ NUEVO
│
├── guides/                            # Guías técnicas avanzadas
│   ├── README.md                      # Índice de guías + sistema de docs
│   ├── ESTRUCTURA_PROYECTO.md         # Organización de archivos
│   └── DOCS_ARQUITECTURA.md           # Arquitectura técnica
│
├── backend/
│   ├── test_cookies_solution.sh       # Script de validación ⭐ NUEVO
│   ├── test_auth_cookies.sh           # Tests de cookies (legacy)
│   └── requirements.txt
│
└── docs/                              # Knowledge Base (contenido público)
    ├── manifest.json
    ├── images/
    └── content/
        ├── 01-fundamentos/
        ├── 02-technical/
        └── 03-automation/
```

---

## 🔍 Búsqueda Rápida por Tema

### Autenticación & Seguridad
- [SOLUCION_COOKIES_HTTPONLY.md](../SOLUCION_COOKIES_HTTPONLY.md)
- [DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md) → "Seguridad Implementada"
- [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) → "Flujo de Autenticación"

### Configuración & Setup
- [LOCAL_SETUP.md](../LOCAL_SETUP.md)
- [README.md](../README.md) → "Variables de Entorno"

### Arquitectura & Diseño
- [DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md)
- [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)

### Testing & Debugging
- [backend/test_cookies_solution.sh](../backend/test_cookies_solution.sh)
- [README.md](../README.md) → "Testing"
- [LOCAL_SETUP.md](../LOCAL_SETUP.md) → "Solución de Problemas"

### MongoDB & Base de Datos
- [DOCS_ARQUITECTURA.md](./DOCS_ARQUITECTURA.md) → "Modelo de Datos Completo"
- [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) → "MongoDB Schema"

### API & Endpoints
- [README.md](../README.md) → "API Endpoints"
- [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) → "Rutas y URLs"

---

## 🆘 ¿No encuentras lo que buscas?

1. **Revisa el mapa de soluciones rápidas** arriba
2. **Usa búsqueda de archivos**: `Ctrl+F` en tu editor
3. **Ejecuta el script de validación**: Si es problema de auth/cookies
4. **Revisa los logs**:
   ```bash
   sudo supervisorctl tail -f backend
   sudo supervisorctl tail -f frontend
   ```
5. **Contacta al autor**: frlpiedrahita@gmail.com

---

## 🤝 Contribuir a la Documentación

¿Encontraste algo unclear o desactualizado?

1. Identifica el documento correcto usando este índice
2. Edita el archivo Markdown
3. Asegúrate de que los ejemplos funcionen
4. Mantén el mismo formato y tono
5. Actualiza este índice si agregaste nuevo documento
6. Crea un Pull Request con descripción clara

---

**Última actualización**: Enero 2026  
**Versión**: 4.0 (Incluye solución de cookies httpOnly)  
**Documentos**: 7 archivos principales + scripts de validación
