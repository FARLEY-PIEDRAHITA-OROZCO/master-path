# Gestión de Defectos

## Gestión Profesional de Hallazgos

Un reporte de bug es el **producto principal** de un QA. Si es de alta calidad, acelera la corrección y mejora la comunicación con desarrollo.

## Severidad vs Prioridad

Estos dos conceptos son frecuentemente confundidos, pero representan dimensiones diferentes:

### Severidad (Impacto Técnico)

**¿Qué tanto rompe el sistema?**

- **Bloqueante**: El sistema no puede funcionar en absoluto
- **Crítica**: Funcionalidad principal rota, sin workaround
- **Mayor**: Funcionalidad importante afectada, hay workaround
- **Menor**: Problema cosmético o de UX

### Prioridad (Impacto de Negocio)

**¿Qué tan rápido debe arreglarse?**

- **Alta**: Bloquea release o afecta objetivos críticos
- **Media**: Importante pero no urgente
- **Baja**: Puede esperar a siguiente release

### Ejemplo Práctico

**Severidad Alta + Prioridad Baja**:  
Bug crítico en feature que se lanza en 3 meses

**Severidad Baja + Prioridad Alta**:  
Error de typo en página principal antes de demo con cliente

## Anatomía de un Reporte Épico

Un bug report profesional debe incluir:

### 1. Título Conciso

Formato: `[Módulo] Acción que falla - Condición específica`

**❌ Malo**: "No funciona el login"  
**✅ Bueno**: "[Login] Error 500 al autenticar con email que contiene '+'"

### 2. Pasos para Reproducir

Numerados y específicos:

```
1. Navegar a /login
2. Ingresar email: test+qa@example.com
3. Ingresar contraseña válida
4. Click en botón "Iniciar Sesión"
```

### 3. Resultado Obtenido vs Esperado

**Obtenido**:  
- Pantalla en blanco
- Console muestra: "Error 500: Invalid email format"

**Esperado**:  
- Usuario autenticado correctamente
- Redirección a dashboard

### 4. Evidencia

Imprescindible incluir:
- **Screenshots**: Captura del error visible
- **Videos**: Para bugs de UI/UX o flujos complejos
- **Console logs**: Errores de JavaScript
- **Network tab**: Requests/responses fallidos
- **HAR files**: Para debugging avanzado de APIs

### 5. Entorno

Especifica:
- **Navegador**: Chrome 120.0.6099.129
- **OS**: Windows 11 Pro
- **Ambiente**: Staging
- **Versión**: v2.3.1
- **Usuario de prueba**: (si aplica)

## Template de Reporte

```markdown
## [MÓDULO] Título descriptivo

**Severidad**: Critical  
**Prioridad**: High  
**Ambiente**: Staging  
**Versión**: v2.3.1

### Pasos para Reproducir
1. ...
2. ...
3. ...

### Resultado Obtenido
- ...

### Resultado Esperado
- ...

### Evidencia
[Adjuntar screenshot/video]

### Entorno
- Browser: Chrome 120
- OS: macOS 14.1
- User: test@qa.com

### Información Adicional
- Console errors: ...
- Network response: ...
```

## Ciclo de Vida de un Defecto

```
New → Open → In Progress → Fixed → Testing → Verified → Closed
                    ↓
                Rejected (Won't Fix / Duplicate / Cannot Reproduce)
```

## Herramientas Profesionales

- **Jira**: Gestión de tickets
- **Linear**: Alternativa moderna a Jira
- **GitHub Issues**: Para proyectos open source
- **Notion**: Para bugs internos
- **Loom**: Para grabar videos de reproducción

---

### 💡 Tip Pro

Un bug bien reportado se corrige 3x más rápido. Invierte 5 minutos extra en documentarlo correctamente y ahorrarás horas de ida y vuelta con desarrollo.

### 🎯 Ejercicio

Escribe 2 reportes de bug reales que hayas encontrado en cualquier app, siguiendo el template profesional.