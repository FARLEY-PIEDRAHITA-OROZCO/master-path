# 📚 Guías Técnicas - QA Master Path

Esta carpeta contiene documentación técnica detallada para desarrolladores y colaboradores del proyecto.

> **✨ ACTUALIZACIÓN**: Documentación completamente actualizada con solución de cookies httpOnly y mejores prácticas de autenticación (Enero 2026)

---

## 📑 Índice de Documentos

### 🌟 **[INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md)** - **NUEVO**
**Índice completo y actualizado de toda la documentación del proyecto**

Incluye:
- Guías de usuario (README, LOCAL_SETUP, SOLUCION_COOKIES)
- Guías técnicas (ESTRUCTURA, ARQUITECTURA)
- Scripts y herramientas de validación
- Orden recomendado de lectura
- Mapa de soluciones rápidas
- Búsqueda por tema

---

### 1. [**ESTRUCTURA_PROYECTO.md**](./ESTRUCTURA_PROYECTO.md)
**Descripción**: Organización detallada de archivos y directorios del proyecto.

**Contenido**:
- Estructura de carpetas `/app/backend/` y `/app/app/`
- Rutas y URLs de la aplicación (frontend y API)
- Flujo de autenticación detallado
- Flujo de sincronización de progreso
- Organización de archivos JavaScript
- MongoDB Schema con índices
- Responsabilidades de cada módulo
- Cómo agregar nuevos endpoints y páginas
- Variables de entorno actualizadas (sin COOKIE_DOMAIN)
- Mejores prácticas de estructura

**Para quién**: Desarrolladores nuevos, arquitectos, code reviewers

**Actualización**: Variables de entorno actualizadas con configuración correcta de cookies

---

### 2. [**DOCS_ARQUITECTURA.md**](./DOCS_ARQUITECTURA.md)
**Descripción**: Arquitectura técnica completa de la aplicación.

**Contenido**:
- Patrón de diseño fullstack (3 capas)
- Diagramas de flujo de datos
- Descripción detallada de módulos Backend (FastAPI)
- Descripción detallada de módulos Frontend (JavaScript)
- Modelo de datos MongoDB
- Sistema de estilos (Tailwind + CSS custom)
- Seguridad implementada (cookies httpOnly optimizadas)
- Dependencias externas
- Limitaciones conocidas y soluciones propuestas
- Recomendaciones para producción

**Para quién**: Arquitectos de software, desarrolladores avanzados

**Actualización**: Sección de seguridad actualizada con solución de cookies (domain=None, secure condicional)

---

### 3. [**../LOCAL_SETUP.md**](../LOCAL_SETUP.md)
**Descripción**: Guía completa para configurar el proyecto en entorno local.

**Contenido**:
- Instalación de prerrequisitos (Python, Node.js, MongoDB)
- Configuración de backend FastAPI
- Configuración de variables de entorno (.env) actualizada
- Ejecución de servicios (backend + frontend)
- Testing y troubleshooting
- Scripts útiles para desarrollo

**Para quién**: Desarrolladores nuevos, configuración inicial, debugging local

**Actualización**: Configuración de .env correcta sin COOKIE_DOMAIN

---

### 4. [**../SOLUCION_COOKIES_HTTPONLY.md**](../SOLUCION_COOKIES_HTTPONLY.md) - **⭐ NUEVO**
**Descripción**: Documentación técnica completa sobre la solución de autenticación con cookies httpOnly

**Contenido**:
- Análisis de causa raíz del problema (domain="localhost" rechazado por navegadores)
- Solución implementada (domain=None universal)
- Diferencias entre entorno local vs Emergent/producción
- Código antes vs después
- Validación con tests automáticos
- Configuración de seguridad (HttpOnly, SameSite, Secure condicional)
- Cómo verificar en local
- Referencias técnicas (RFC 6265, MDN, OWASP, FastAPI)

**Para quién**: 
- Desarrolladores trabajando con autenticación
- Debugging de problemas de cookies en localhost
- Implementación de cookies httpOnly en otros proyectos
- Ingenieros de seguridad

**Puntos clave**:
- ✅ Solución universal para localhost y producción
- ✅ Sin cambios de código entre entornos
- ✅ Incluye script de validación automatizado
- ✅ Documentación completa de seguridad

---

### 5. [**../backend/test_cookies_solution.sh**](../backend/test_cookies_solution.sh) - **⭐ NUEVO**
**Descripción**: Script automatizado de validación de cookies httpOnly

**Funcionalidad**:
- Health check del backend
- Verificación de configuración de cookies
- Tests de registro y login
- Validación de headers Set-Cookie
- Verificación de parámetros (HttpOnly, SameSite, Domain, Secure)
- Tests de endpoint /auth/me con y sin cookie
- Resumen visual con colores

**Cómo ejecutar**:
```bash
bash /app/backend/test_cookies_solution.sh
```

---

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos

**Lectura recomendada en orden**:

1. Leer [`../README.md`](../README.md) (visión general del proyecto)
2. Leer [`../LOCAL_SETUP.md`](../LOCAL_SETUP.md) (configuración local paso a paso)
3. Leer [`ESTRUCTURA_PROYECTO.md`](./ESTRUCTURA_PROYECTO.md) (entender organización)
4. Leer [`DOCS_ARQUITECTURA.md`](./DOCS_ARQUITECTURA.md) (entender arquitectura fullstack)

### Para Configurar el Proyecto

```bash
# 1. Clonar repositorio
git clone https://github.com/FARLEY-PIEDRAHITA-OROZCO/qa-master-path.git
cd qa-master-path

# 2. Configurar backend
cd backend
pip install -r requirements.txt

# 3. Crear archivo .env (ver LOCAL_SETUP.md para detalles)
cp .env.example .env
# Editar .env con tu JWT_SECRET y configuración MongoDB

# 4. Instalar dependencias frontend
cd ..
npm install

# 5. Verificar MongoDB corriendo
mongosh --eval "db.version()"

# 6. Iniciar backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 7. Iniciar frontend (en otra terminal)
cd ..
npm run dev

# 8. Abrir http://localhost:8000
```

---

## 🔧 Scripts Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Testing
npm test                 # Tests en modo watch
npm run test:coverage    # Reporte de cobertura

# Linting
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente

# Formateo
npm run format           # Formatear todo el código
```

---

## 📝 Sistema de Documentación (Knowledge Base)

### ¿Qué es?

El sistema de documentación es la **Knowledge Base** interna de la aplicación, donde se publican artículos técnicos en formato Markdown.

### Estructura

```
/app/docs/
├── manifest.json          # Índice de todos los documentos
├── images/                # Imágenes compartidas
│   ├── logo.png
│   └── diagrams/
└── content/              # Archivos Markdown organizados por bloque
    ├── 01-fundamentos/
    │   ├── sdlc-stlc.md
    │   └── defect-management.md
    ├── 02-technical/
    │   └── sql-basics.md
    └── 03-automation/
        └── playwright-intro.md
```

### Agregar Nuevo Documento

#### Paso 1: Crear archivo Markdown

```bash
# Ejemplo: Nuevo artículo sobre Postman
touch /app/docs/content/02-technical/postman-api.md
```

#### Paso 2: Escribir contenido en Markdown

```markdown
# Postman & API Testing

## Introducción

Postman es una herramienta para...

## Conceptos Clave

- **Collections**: Grupos de requests
- **Environments**: Variables de entorno
- **Tests**: Scripts de validación

## Ejemplos

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```
```

#### Paso 3: Registrar en manifest.json

```json
{
  "blocks": [
    {
      "id": "technical",
      "title": "Bloque 2: Habilidades Técnicas",
      "docs": [
        {
          "id": "postman-api",
          "title": "Postman & API Testing",
          "file": "02-technical/postman-api.md",
          "evidence": "Collection de Postman con 10 requests"
        }
      ]
    }
  ]
}
```

#### Paso 4: Verificar en la app

1. Ir a http://localhost:8000/app/pages/knowledge-base.html
2. Buscar tu artículo en el sidebar
3. Verificar que se renderiza correctamente

---

## 🖼️ Uso de Imágenes

### Opción 1: Carpeta compartida

```markdown
![Diagrama SDLC](/app/docs/images/sdlc-diagram.png)
```

### Opción 2: Carpeta por bloque

```bash
mkdir /app/docs/content/01-fundamentos/images
```

```markdown
![Bug Lifecycle](./images/bug-lifecycle.png)
```

### Opción 3: URLs externas

```markdown
![Testing Pyramid](https://example.com/pyramid.png)
```

---

## 🎨 Sintaxis Markdown Soportada

La aplicación usa **Marked.js** que soporta:

### Básicos

```markdown
# H1
## H2
### H3

**Negrita**
*Itálica*
`código inline`
~~Tachado~~

- Lista desordenada
1. Lista ordenada

[Link](https://example.com)
![Imagen](ruta/imagen.png)
```

### Avanzados

```markdown
> Cita en bloque

| Columna 1 | Columna 2 |
|-----------|-----------|
| Valor 1   | Valor 2   |

```javascript
const code = "bloques de código";
```

---

## 🐛 Troubleshooting

### El servidor no inicia

```bash
# Verificar puerto ocupado
lsof -i :8000

# Usar puerto diferente
npx http-server -p 3000
```

### Firebase no conecta

1. Verificar credenciales en `firebase-config.js`
2. Verificar Import Maps en HTML
3. Ver consola del navegador para errores específicos
4. Consultar [`FIREBASE_AUTH_SETUP.md`](./FIREBASE_AUTH_SETUP.md)

### Tests fallan

```bash
# Limpiar cache
rm -rf node_modules
npm install

# Verificar versiones
node --version  # Debe ser 18+
npm --version   # Debe ser 9+
```

---

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. **Revisa la documentación relevante** en esta carpeta
2. **Busca en issues del repositorio** (si es público)
3. **Contacta al autor** vía email: frlpiedrahita@gmail.com

---

## 🤝 Contribuir a la Documentación

¿Encontraste algo unclear o desactualizado?

1. Edita el documento correspondiente
2. Asegúrate de que los ejemplos funcionen
3. Sigue el mismo formato y tono
4. Crea un Pull Request con descripción clara

---

**Última actualización**: Enero 2025
