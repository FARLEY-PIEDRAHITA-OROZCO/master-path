# QA Master Path - Visión General del Sistema

**Versión**: 1.0.0  
**Última actualización**: 2025-01-17  
**Estado**: Prototipo funcional (MVP)

---

## 📖 Tabla de Contenidos

1. [Contexto de Negocio](#contexto-de-negocio)
2. [Problema que Resuelve](#problema-que-resuelve)
3. [Propuesta de Valor](#propuesta-de-valor)
4. [Alcance del Sistema](#alcance-del-sistema)
5. [Usuarios y Roles](#usuarios-y-roles)
6. [Stack Tecnológico](#stack-tecnológico)
7. [Métricas de Éxito](#métricas-de-éxito)
8. [Estado Actual](#estado-actual)

---

## 1. Contexto de Negocio

### ¿Qué es QA Master Path?

**QA Master Path** es una plataforma educativa gamificada diseñada para formar **Ingenieros de QA** desde nivel básico hasta avanzado. Simula un programa de aprendizaje tipo "bootcamp" con una ruta estructurada de 12 módulos que cubren:

- Fundamentos de testing
- Metodologías ágiles
- Testing técnico (SQL, APIs)
- Automatización con Playwright
- CI/CD y testing avanzado

### Filosofía del Producto

El sistema adopta un enfoque de **aprendizaje activo** donde:

1. **Estructura clara**: 12 módulos organizados en 4 fases progresivas
2. **Gamificación**: Sistema de XP, badges y niveles para mantener motivación
3. **Autonomía**: El estudiante marca su propio progreso sin evaluaciones automáticas
4. **Tracking persistente**: El progreso se guarda para continuar donde se dejó

### Origen del Proyecto

**Autor**: Farley Piedrahita Orozco  
**Propósito**: Plataforma educativa personal/académica  
**Licencia**: MIT

---

## 2. Problema que Resuelve

### Problema Principal

**Los aspirantes a QA Engineer carecen de una ruta de aprendizaje estructurada que combine teoría, práctica y gamificación en una sola plataforma.**

### Dolores Específicos

1. **Fragmentación de recursos**: El contenido QA está disperso en múltiples sitios
2. **Falta de progresión clara**: No hay un camino definido de básico a avanzado
3. **Baja motivación**: Cursos tradicionales son poco enganchantes
4. **Sin seguimiento**: Los estudiantes no saben qué han completado o qué falta

### Solución Propuesta

✅ **Ruta única**: 12 módulos con dependencias claras  
✅**Gamificación**: XP, badges, niveles (como un videojuego)  
✅ **Progreso persistente**: Guarda automáticamente el avance  
✅ **Autogestión**: El estudiante controla su ritmo  

---

## 3. Propuesta de Valor

### Para Estudiantes

- **Claridad**: Sabes exactamente qué aprender y en qué orden
- **Motivación**: Desbloqueables y recompensas al completar módulos
- **Flexibilidad**: Aprende a tu ritmo, sin fechas límite
- **Seguimiento**: Dashboard visual de tu progreso

### Para Educadores/Bootcamps

- **Plataforma lista**: Sistema de tracking sin necesidad de LMS complejo
- **Contenido estructurado**: Currículum predefinido de 12 semanas
- **Datos de progreso**: API para extraer estadísticas de estudiantes

---

## 4. Alcance del Sistema

### ✅ Dentro del Alcance (Implementado)

#### Funcionalidades Core

1. **Gestión de Usuarios**
   - Crear perfil básico (email + nombre)
   - Actualizar información de perfil
   - Configuración de tema/idioma
   - Eliminar cuenta

2. **Tracking de Progreso**
   - Marcar módulos como completados
   - Marcar subtareas individuales
   - Agregar notas por módulo (hasta 10,000 caracteres)
   - Ganar badges al completar fases
   - Acumular XP por actividades
   - Sincronización entre localStorage y base de datos

3. **Visualización**
   - Dashboard con progreso global
   - Roadmap con 12 módulos expandibles
   - Badges desbloqueables con animaciones
   - Estadísticas detalladas (módulos, tiempo, racha)

4. **Contenido Educativo**
   - 12 módulos con objetivos y schedule
   - 4 fases: Core, Technical, Automation, Expert
   - Referencias a recursos externos (videos, docs)
   - Base de conocimiento con artículos (formato Markdown)

5. **APIs REST**
   - CRUD completo de usuarios
   - Actualización granular de progreso
   - Sincronización masiva
   - Health checks y status

### ❌ Fuera del Alcance (NO Implementado)

#### Seguridad y Autenticación

🔴 **CRÍTICO - NO IMPLEMENTADO**:
- Sistema de login/logout
- Autenticación JWT (mencionado en comentarios pero ausente)
- Verificación de propiedad de datos
- Rate limiting
- Protección CSRF

#### Funcionalidades Sociales

- Rankings/leaderboards entre usuarios
- Comparación de progreso
- Foros o comunidad
- Mensajería entre estudiantes
- Sistema de mentores

#### Evaluaciones y Certificación

- Exámenes o quizzes automáticos
- Validación de conocimiento
- Certificados de completitud
- Validación de entregables

#### Contenido Multimedia

- Videos embebidos (solo links externos)
- Laboratorios interactivos (solo referencias)
- Editores de código en línea
- Sandboxes de práctica

#### Administrativas

- Panel de administración
- Gestión de contenido desde UI
- Analytics y reportes
- Backup automatizado
- Monitoreo de errores (logging básico)

---

## 5. Usuarios y Roles

### Roles del Sistema

#### 🎓 Estudiante (Único Rol Implementado)

**Descripción**: Persona que usa la plataforma para aprender QA

**Permisos**:
- ✅ Crear su propio perfil
- ✅ Ver y actualizar su progreso
- ✅ Agregar/editar notas personales
- ✅ Ver contenido educativo
- ⚠️ **VULNERABILIDAD**: Puede modificar progreso de otros (si conoce el user_id)

**Limitaciones**:
- No puede ver progreso de otros usuarios
- No puede modificar contenido (módulos.json)
- No puede administrar la plataforma

#### 🚧 Roles NO Implementados (Futuros)

**Instructor/Mentor**:
- Ver progreso de estudiantes asignados
- Dejar feedback en entregables
- Aprobar/rechazar completitud de módulos

**Administrador**:
- Gestionar usuarios
- Modificar contenido educativo
- Ver analytics globales
- Configurar sistema

---

## 6. Stack Tecnológico

### Backend

```
Lenguaje: Python 3.10+
Framework: FastAPI 0.115.12
Servidor: Uvicorn 0.27.0 (ASGI)
Validación: Pydantic 2.10.4
```

**Librerías Clave**:
- `motor 3.3.2` - Driver asíncrono de MongoDB
- `pymongo 4.6.1` - Driver síncrono (scripts)
- `email-validator 2.1.0` - Validación de emails
- `python-dotenv 1.0.0` - Variables de entorno

### Base de Datos

```
Motor: MongoDB
Driver: Motor (async) + PyMongo (sync)
Base de Datos: qa_master_path
Colecciones: users
```

### Frontend

```
Arquitectura: SPA (Single Page Application) sin framework
Lenguajes: HTML5, CSS3, JavaScript ES6+
Estilos: Tailwind CSS (vía CDN)
Iconos: Font Awesome 6.4.0
Efectos: Canvas Confetti 1.6.0
Servidor: http-server 14.1.1
```

**Sin transpilación**: No hay Webpack, Babel, ni build process

### Infraestructura

```
Entorno: Kubernetes container (Linux)
Procesos: Supervisord
Reverso proxy: Nginx (inferido por configuración /api)
Puertos:
  - Frontend: 3000 (interno) → 8000 (externo)
  - Backend: 8001 (interno) → /api (ruteo por ingress)
```

### Herramientas de Desarrollo

- **Linting**: ESLint 9.39.2, Prettier 3.7.4
- **Testing**: Vitest 4.0.16, pytest 7.4.4
- **Documentación API**: FastAPI Swagger UI automático

---

## 7. Métricas de Éxito

### ❓ Métricas No Definidas Explícitamente

El sistema **NO implementa tracking de métricas de negocio** en el código actual.

### Métricas Técnicas Disponibles

A través de la API, se pueden obtener:

1. **Por Usuario**:
   - Módulos completados / Total (12)
   - Subtareas completadas / Total
   - XP acumulado
   - Badges obtenidos (0-4)
   - Días desde registro
   - Última actividad

2. **Agregables** (requieren queries custom):
   - Total de usuarios registrados
   - Tasa de completitud promedio
   - Distribución de progreso

### 🚧 Métricas Sugeridas (No Implementadas)

- **Engagement**: Usuarios activos diarios/semanales
- **Retención**: % que regresan después de 7 días
- **Completitud**: % que terminan los 12 módulos
- **Tiempo promedio**: Por módulo y total
- **Abandono**: En qué módulo se detienen

---

## 8. Estado Actual

### Madurez del Sistema: **🟡 MVP Funcional (No Producción)**

#### ✅ Fortalezas

1. **Core completo**: Todas las funcionalidades de progreso funcionan
2. **API robusta**: Endpoints bien estructurados con validación
3. **UX pulida**: Interfaz moderna con animaciones y feedback visual
4. **Código limpio**: Estructura modular y mantenible
5. **Documentación de código**: Docstrings en español

#### 🔴 Bloqueadores para Producción

1. **Sin autenticación**: Cualquiera puede modificar datos de otros
2. **Sin rate limiting**: Vulnerable a abuso
3. **ObjectId expuesto**: IDs predecibles
4. **CORS permisivo**: Riesgo de CSRF
5. **Sin monitoreo**: No hay alertas ni logs centralizados

#### 🟠 Deuda Técnica Alta

1. **4 archivos de storage**: Código duplicado/desactualizado
2. **Sin tests E2E**: Solo unit tests básicos
3. **Recursos placeholder**: Links a `#` en lugar de contenido real
4. **Sin backups**: Riesgo de pérdida de datos

### Recomendación de Uso

✅ **Aceptable para**:
- Entorno académico local
- Prototipo de demostración
- Uso personal (un solo usuario)

❌ **NO apto para**:
- Producción pública
- Múltiples usuarios no confiables
- Datos sensibles

---

## Siguiente Documento

👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura detallada del sistema
