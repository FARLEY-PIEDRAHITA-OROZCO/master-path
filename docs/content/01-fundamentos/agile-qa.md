# Agile QA & Scrum

## El QA en equipos modernos

En Agile, la calidad es responsabilidad de **todos**, pero el QA actúa como el facilitador y guardián de los estándares.

## Ceremonias Scrum para QA

### Sprint Planning

**Rol del QA**:
- Identificar **riesgos técnicos** en las historias
- Validar que los **criterios de aceptación** sean testeables
- Estimar **esfuerzo de testing** para cada historia
- Proponer historias técnicas de testing (automatización, refactoring de tests)

**Preguntas clave que debe hacer el QA**:
- ¿Qué casos edge existen?
- ¿Hay dependencias externas que debemos mockear?
- ¿Qué datos de prueba necesitamos?
- ¿Afecta a otros módulos? (regresión)

### Daily Standup

**El QA comunica**:
- Progreso en ejecución de pruebas
- Bloqueos (ambiente caído, falta de datos)
- Bugs críticos encontrados
- Coordinación con devs para re-testing

**Formato efectivo**:
```
Ayer: Terminé testing de US-123, encontré 2 bugs críticos
Hoy: Voy a validar fix de BUG-456 y empezar US-124
Bloqueos: Necesito acceso al ambiente de staging
```

### Sprint Review / Demo

**El QA presenta**:
- Métricas de calidad del sprint
- Bugs encontrados vs resueltos
- Cobertura de testing alcanzada
- Riesgos de calidad para el release

### Retrospectiva

**El QA propone mejoras**:
- Procesos de testing más eficientes
- Herramientas de automatización
- Mejoras en DoD/DoR
- Cultura de calidad del equipo

**Temas comunes**:
- "Bugs encontrados muy tarde en el sprint"
- "Historias sin criterios de aceptación claros"
- "Falta de tiempo para testing"
- "Necesitamos mejor documentación técnica"

## Definiciones Cruciales

### Definition of Ready (DoR)

**Requisitos mínimos** para que una Historia de Usuario pueda empezar a desarrollarse:

✅ Criterios de aceptación definidos  
✅ Mockups/diseños disponibles (si aplica)  
✅ Dependencias técnicas identificadas  
✅ Estimación de esfuerzo completada  
✅ Datos de prueba disponibles  
✅ API contracts definidos (para features con backend)

### Definition of Done (DoD)

**Criterios finales** para considerar una tarea terminada:

✅ Código escrito y revisado (Code Review)  
✅ Tests unitarios pasando (coverage > 80%)  
✅ Tests de integración implementados  
✅ Testing manual completado (happy path + edge cases)  
✅ Bugs críticos resueltos  
✅ Documentación actualizada  
✅ Merged a rama principal  
✅ Desplegado a ambiente de staging

### Checklist de DoD (Ejemplo)

```markdown
## DoD Checklist para US-123

- [ ] Code review aprobado por 2 devs
- [ ] Coverage de tests: 85% ✅
- [ ] Tests E2E en Playwright: 3 escenarios ✅
- [ ] Testing manual:
  - [ ] Happy path ✅
  - [ ] Casos edge ✅
  - [ ] Validaciones de formulario ✅
  - [ ] Responsive en mobile ✅
- [ ] 0 bugs críticos abiertos ✅
- [ ] Documentación en Confluence actualizada
- [ ] Merged a `main` ✅
- [ ] Desplegado a staging ✅
```

## Testing en Sprints: Timeline

```
Día 1-2  → Planning + Análisis de requisitos
Día 3-7  → Desarrollo + Testing continuo en DEV
Día 8-9  → Testing formal en Staging
Día 10   → Bug fixing + Re-testing
Día 11   → Review + Retro
```

## Agile Testing Quadrants

Framework de Brian Marick para tipos de testing:

### Q1: Technology-Facing + Supporting Development
- Unit tests
- Component tests
- Tests de integración

### Q2: Business-Facing + Supporting Development
- Functional tests
- Story tests
- Prototypes
- Ejemplos

### Q3: Business-Facing + Critiquing Product
- Exploratory testing
- Usability testing
- UAT (User Acceptance Testing)

### Q4: Technology-Facing + Critiquing Product
- Performance testing
- Security testing
- Load testing
- Scalability testing

## Test Pyramid en Agile

```
       /\      E2E Tests (Pocos, lentos, caros)
      /  \
     /----\    Integration Tests (Moderados)
    /      \
   /--------\  Unit Tests (Muchos, rápidos, baratos)
```

**Distribución ideal**:
- 70% Unit tests
- 20% Integration tests
- 10% E2E tests

## Cultura de Calidad

En equipos ágiles maduros:

✅ **Devs escriben tests** (no solo el QA)  
✅ **Shift-left testing** (testing desde el inicio)  
✅ **Automatización** como prioridad  
✅ **CI/CD** con gates de calidad  
✅ **Todos** pueden rechazar una historia mal hecha

---

### 💡 Tip Pro

El mejor QA en Agile no es quien encuentra más bugs, sino quien **previene** que los bugs lleguen a producción educando al equipo.

### 🎯 Ejercicio

Crea un **DoD Checklist** para un proyecto real en el que estés trabajando o uno ficticio que conozcas.