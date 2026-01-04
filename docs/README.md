# Sistema de Documentación - QA Master Path

## 📚 Estructura de Archivos

```
/app/docs/
├── manifest.json          # Índice de documentos (metadata)
├── images/                # Imágenes compartidas entre todos los docs
│   ├── logo.png
│   └── banner.jpg
└── content/              # Documentos en Markdown
    ├── 01-fundamentos/
    │   ├── sdlc-stlc.md
    │   ├── defect-management.md
    │   └── agile-qa.md
    ├── 02-technical/
    │   └── sql-basics.md
    └── 03-automation/
        └── playwright-intro.md
```

## ➕ Cómo Agregar un Nuevo Documento

### Paso 1: Crear el archivo .md

Crea tu archivo en la carpeta correspondiente:

```bash
# Ejemplo: Nuevo documento sobre Postman
touch /app/docs/content/02-technical/postman-api.md
```

### Paso 2: Escribir el contenido en Markdown puro

```markdown
# Título del Documento

## Introducción

Escribe tu contenido aquí en **Markdown puro**.

- Lista 1
- Lista 2

## Sección 2

Más contenido...

### Subsección

Código de ejemplo:

```javascript
const test = 'Hello World';
console.log(test);
```

## Incluir Imágenes

![Descripción de la imagen](/app/docs/images/mi-imagen.png)
```

### Paso 3: Registrar en manifest.json

Edita `/app/docs/manifest.json` y agrega tu documento:

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

## 🖼️ Cómo Usar Imágenes

### Opción 1: Imágenes en carpeta compartida

1. Sube tu imagen a `/app/docs/images/`
2. Reférenciala en tu .md:

```markdown
![Diagrama SDLC](/app/docs/images/sdlc-diagram.png)
```

### Opción 2: Imágenes por bloque (organización)

1. Crea subcarpeta `images` en el bloque:

```bash
mkdir /app/docs/content/01-fundamentos/images
```

2. Sube tu imagen ahí
3. Reférenciala con ruta relativa:

```markdown
![Bug Lifecycle](./images/bug-lifecycle.png)
```

### Opción 3: URLs externas

```markdown
![Testing Pyramid](https://example.com/pyramid.png)
```

## 🎨 Sintaxis Markdown Soportada

### Títulos

```markdown
# H1 - Título Principal
## H2 - Sección
### H3 - Subsección
```

### Texto

```markdown
**Negrita**
*Itálica*
`código inline`
~~Tachado~~
```

### Listas

```markdown
- Item 1
- Item 2
  - Sub-item

1. Numerada
2. Ordenada
```

### Links

```markdown
[Texto del link](https://example.com)
[Link a otro doc](./otro-documento.md)
```

### Imágenes

```markdown
![Alt text](ruta/imagen.png)
![Con título](imagen.jpg "Título al hover")
```

### Bloques de Código

```markdown
```javascript
const hello = 'world';
console.log(hello);
```
```

### Citas

```markdown
> Esto es una cita
> - Autor
```

### Tablas

```markdown
| Columna 1 | Columna 2 |
|-----------|----------|
| Valor 1   | Valor 2  |
```

### Separadores

```markdown
---
***
```

### Emojis

```markdown
:rocket: :fire: :check: → 🚀 🔥 ✅
```

## 🔧 Herramientas Recomendadas

### Editores con Preview

- **VS Code** (extensión: Markdown Preview Enhanced)
- **Obsidian** (perfecto para documentación)
- **Typora** (WYSIWYG markdown)
- **Mark Text** (open source)

### Verificación

```bash
# Verificar sintaxis markdown
npx markdownlint /app/docs/content/**/*.md
```

## ⚡ Workflow Rápido

```bash
# 1. Crear nuevo documento
code /app/docs/content/02-technical/nuevo-doc.md

# 2. Escribir en markdown con preview en VS Code
# (Ctrl + Shift + V para ver preview)

# 3. Agregar al manifest
code /app/docs/manifest.json

# 4. Refrescar la página - ¡ya está disponible!
```

## 👁️ Vista Previa Local

Para ver cómo se verá tu documento:

1. Abre `http://localhost:8000/app/pages/knowledge-base.html`
2. Navega a tu documento desde el menú lateral
3. El markdown se renderiza automáticamente

## 📝 Ejemplo Completo

**Archivo**: `/app/docs/content/02-technical/ejemplo.md`

```markdown
# Mi Documento de Ejemplo

## Introducción

Este es un ejemplo de cómo escribir documentación.

## Conceptos Clave

- **Testing**: Validación de software
- **QA**: Quality Assurance
- **Automation**: Pruebas automatizadas

## Diagrama

![Proceso de Testing](/app/docs/images/testing-process.png)

## Código de Ejemplo

```python
def test_login():
    assert login('user', 'pass') == True
```

## Referencias

- [Documentación oficial](https://example.com)
- [Tutorial avanzado](./tutorial-avanzado.md)

---

### 💡 Tip

Recuerda actualizar el `manifest.json` después de crear tu documento.
```

## ❓ FAQ

**Q: ¿Puedo usar HTML en los archivos .md?**  
A: Sí, Markdown soporta HTML embebido.

**Q: ¿Cómo organizo muchos documentos?**  
A: Usa subcarpetas dentro de cada bloque.

**Q: ¿Puedo editar desde GitHub directamente?**  
A: ¡Sí! GitHub tiene un editor markdown integrado.

**Q: ¿Cómo embed videos?**  
A: Usa HTML:
```html
<video src="/app/docs/videos/demo.mp4" controls></video>
```

## 🚀 Beneficios de este Sistema

✅ **Rápido**: Escribe en .md puro, sin escapar caracteres  
✅ **Git-friendly**: Diffs claros en control de versiones  
✅ **Escalable**: Agregar docs = crear archivo  
✅ **Herramientas Pro**: Usa cualquier editor markdown  
✅ **Imágenes**: Soporte completo con rutas relativas o absolutas  
✅ **Portable**: Los .md son legibles en cualquier plataforma

---

**Última actualización**: Enero 2025  
**Mantenido por**: QA Master Path Team