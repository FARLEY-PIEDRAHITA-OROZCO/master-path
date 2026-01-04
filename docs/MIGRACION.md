# 🔄 Migración Completada: JSON → Markdown

## ✅ Sistema Anterior vs Nuevo

### ❌ Sistema Antiguo (JSON)

```json
{
  "blocks": [{
    "topics": [{
      "id": "ejemplo",
      "title": "Mi Documento",
      "content": "### Título\n\nTexto con **negrita**\n\n```javascript\ncode\n```"
    }]
  }]
}
```

**Problemas**:
- Escapar caracteres especiales
- Sin syntax highlighting
- Difícil de mantener
- Git diffs ilegibles

### ✅ Sistema Nuevo (Markdown)

**manifest.json** (solo metadata):
```json
{
  "blocks": [{
    "docs": [{
      "id": "ejemplo",
      "title": "Mi Documento",
      "file": "01-fundamentos/ejemplo.md"
    }]
  }]
}
```

**ejemplo.md** (contenido puro):
```markdown
# Mi Documento

Texto con **negrita**

```javascript
const code = 'limpio';
```
```

**Ventajas**:
✅ Escritura rápida y natural
✅ Syntax highlighting completo
✅ Git-friendly
✅ Editores profesionales

---

## 📋 Archivos Migrados

Los siguientes documentos YA están migrados:

1. ✅ **SDLC & STLC** → `/app/docs/content/01-fundamentos/sdlc-stlc.md`
2. ✅ **Gestión de Defectos** → `/app/docs/content/01-fundamentos/defect-management.md`
3. ✅ **Agile QA & Scrum** → `/app/docs/content/01-fundamentos/agile-qa.md`
4. ✅ **Ejemplo con Imágenes** → `/app/docs/content/01-fundamentos/ejemplo-imagenes.md`

---

## 🚀 Cómo Agregar Nuevos Documentos

### Opción 1: Desde la Terminal

```bash
# 1. Crear el archivo
nano /app/docs/content/02-technical/postman.md

# 2. Escribir tu contenido en markdown puro
# (Usa Ctrl+X para salir y guardar)

# 3. Registrar en manifest
nano /app/docs/manifest.json
```

### Opción 2: Desde VS Code (Recomendado)

```bash
# 1. Abrir VS Code en el proyecto
code /app

# 2. Crear nuevo archivo
# Navega a /app/docs/content/02-technical/
# Click derecho → New File → postman.md

# 3. Escribir con preview en tiempo real
# Ctrl+Shift+V para ver preview

# 4. Actualizar manifest.json
```

### Opción 3: Desde GitHub (Si tienes repo conectado)

1. Ve a tu repositorio en GitHub
2. Navega a `/app/docs/content/02-technical/`
3. Click en "Add file" → "Create new file"
4. Escribe en el editor markdown de GitHub
5. Commit directamente

---

## 📝 Template para Nuevos Documentos

```markdown
# Título Principal del Documento

## Introducción

Breve descripción de qué trata este documento.

## Conceptos Clave

### Concepto 1

Explicación con **énfasis** y *cursiva*.

- Lista item 1
- Lista item 2
  - Sub-item

### Concepto 2

```javascript
// Ejemplo de código
const ejemplo = 'código limpio';
console.log(ejemplo);
```

## Ejemplo Práctico

![Diagrama explicativo](/app/docs/images/mi-diagrama.png)

## Ejercicio

> Pon en práctica lo aprendido

### ✅ Checklist

- [ ] Tarea 1
- [ ] Tarea 2
- [ ] Tarea 3

## Referencias

- [Documentación oficial](https://example.com)
- [Tutorial avanzado](./otro-documento.md)

---

### 💡 Tip Pro

Consejo útil para recordar.

### 🎯 Key Takeaway

Punto clave que el lector debe recordar.
```

---

## 🖼️ Guía Rápida de Imágenes

### Paso 1: Agregar imagen a la carpeta

```bash
# Opción A: Carpeta compartida
cp mi-imagen.png /app/docs/images/

# Opción B: Carpeta del bloque
cp mi-imagen.png /app/docs/content/01-fundamentos/images/
```

### Paso 2: Referenciar en tu .md

```markdown
<!-- Opción A: Ruta absoluta -->
![Descripción](/app/docs/images/mi-imagen.png)

<!-- Opción B: Ruta relativa -->
![Descripción](./images/mi-imagen.png)

<!-- Opción C: URL externa -->
![Descripción](https://example.com/imagen.png)
```

### Tamaños personalizados (HTML)

```html
<img src="/app/docs/images/logo.png" alt="Logo" width="300">
```

---

## 🔧 Troubleshooting

### Problema: La imagen no se muestra

**Solución 1**: Verifica la ruta
```bash
ls /app/docs/images/mi-imagen.png
# Debe existir el archivo
```

**Solución 2**: Usa ruta absoluta
```markdown
![Imagen](/app/docs/images/mi-imagen.png)
```

**Solución 3**: Verifica el formato
- Formatos soportados: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`

### Problema: El documento no aparece en el menú

**Solución**: Verifica que esté registrado en `manifest.json`

```json
{
  "blocks": [{
    "docs": [
      {
        "id": "mi-doc",           // ← ID único
        "title": "Mi Documento",  // ← Título en el menú
        "file": "02-technical/mi-doc.md"  // ← Ruta correcta
      }
    ]
  }]
}
```

### Problema: El markdown no se renderiza correctamente

**Solución**: Verifica que `marked.js` esté cargado
- Abre la consola del navegador (F12)
- Escribe `typeof marked`
- Debe devolver `"object"` o `"function"`

---

## 📚 Recursos Adicionales

### Editores Markdown Recomendados

1. **VS Code** + extensiones:
   - Markdown All in One
   - Markdown Preview Enhanced
   - Markdownlint

2. **Obsidian** (perfecto para documentación)
   - Preview en tiempo real
   - Graph view de documentos conectados
   - Templates automáticos

3. **Typora** (WYSIWYG)
   - Edición visual de markdown
   - Export a PDF/HTML

### Cheat Sheets

- [Markdown Guide](https://www.markdownguide.org/cheat-sheet/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Markdown Emojis](https://github.com/ikatyang/emoji-cheat-sheet)

### Herramientas de Imagen

- **Screenshots**: ShareX (Win), Flameshot (Linux), Skitch (Mac)
- **Diagramas**: Excalidraw, Draw.io, Mermaid
- **GIFs**: ScreenToGif, Kap, Peek
- **Compresión**: TinyPNG, Squoosh

---

## ✅ Checklist de Migración

Si estás migrando más documentos del JSON antiguo:

- [ ] Copiar contenido del JSON
- [ ] Crear archivo .md en carpeta correcta
- [ ] Pegar contenido (sin escapar caracteres)
- [ ] Formatear con markdown puro
- [ ] Agregar imágenes si es necesario
- [ ] Registrar en manifest.json
- [ ] Probar en el navegador
- [ ] Verificar que los links funcionen

---

## 🎉 ¡Listo!

Tu sistema de documentación ahora es:
✅ **Profesional** - Archivos .md estándar
✅ **Ágil** - Escribir es rápido y natural
✅ **Escalable** - Fácil agregar más docs
✅ **Git-friendly** - Diffs claros
✅ **Con imágenes** - Soporte completo

**Siguiente paso**: Empieza a escribir tu próximo documento en markdown puro 🚀

---

**Documentación del sistema**: `/app/docs/README.md`  
**Última actualización**: Enero 2025
