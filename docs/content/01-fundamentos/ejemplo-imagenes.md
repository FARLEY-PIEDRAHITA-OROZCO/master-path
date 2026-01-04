# Ejemplo: Cómo Incluir Imágenes

## Introducción

Este documento demuestra las diferentes formas de incluir imágenes en la documentación.

## Método 1: Ruta Absoluta

### Usando carpeta compartida `/app/docs/images/`

```markdown
![Descripción de la imagen](/app/docs/images/mi-imagen.png)
```

**Resultado**:

![Logo QA Master Path](/app/docs/images/logo-placeholder.png)

*Nota: Esta imagen se carga desde `/app/docs/images/`*

---

## Método 2: Ruta Relativa

### Usando subcarpeta del bloque

```markdown
![Descripción](./images/diagrama.png)
```

**Estructura de carpetas**:
```
01-fundamentos/
├── ejemplo-imagenes.md
└── images/
    └── diagrama.png
```

---

## Método 3: URLs Externas

### Desde internet

```markdown
![Testing Pyramid](https://via.placeholder.com/600x400?text=Testing+Pyramid)
```

**Resultado**:

![Testing Pyramid](https://via.placeholder.com/600x400?text=Testing+Pyramid)

*Nota: Requiere conexión a internet*

---

## Imágenes con Tamaño Personalizado

Puedes usar HTML para controlar el tamaño:

```html
<img src="/app/docs/images/logo.png" alt="Logo" width="300">
```

**Resultado**:

<img src="https://via.placeholder.com/600x200?text=Logo+Custom+Size" alt="Logo" width="400">

---

## Imágenes con Caption

```markdown
![SDLC Diagram](/app/docs/images/sdlc.png)
*Figura 1: Ciclo de vida del desarrollo de software*
```

**Resultado**:

![SDLC Diagram](https://via.placeholder.com/800x400?text=SDLC+Diagram)
*Figura 1: Ciclo de vida del desarrollo de software*

---

## Galería de Imágenes

Puedes colocar varias imágenes juntas:

```markdown
![Imagen 1](/app/docs/images/img1.png) ![Imagen 2](/app/docs/images/img2.png)
```

O usar HTML para mejor control:

```html
<div style="display: flex; gap: 10px;">
  <img src="imagen1.png" width="200">
  <img src="imagen2.png" width="200">
  <img src="imagen3.png" width="200">
</div>
```

---

## Screenshots con Anotaciones

Para screenshots de UI con anotaciones:

![Screenshot con Anotaciones](https://via.placeholder.com/800x600?text=Screenshot+with+Annotations)

**Herramientas recomendadas para anotar screenshots**:
- **Snagit** (Windows/Mac)
- **Skitch** (Mac)
- **ShareX** (Windows, gratuito)
- **Flameshot** (Linux)

---

## GIFs Animados

Para demostrar flujos o interacciones:

```markdown
![Demo del flujo de login](/app/docs/images/login-flow.gif)
```

**Herramientas para crear GIFs**:
- **ScreenToGif** (Windows)
- **Kap** (Mac)
- **Peek** (Linux)
- **LICEcap** (Cross-platform)

---

## Best Practices

### ✅ Hacer

- Usar nombres descriptivos: `bug-report-example.png`
- Optimizar tamaño de imágenes (< 500KB)
- Incluir texto alternativo (alt text) descriptivo
- Usar formato PNG para screenshots, JPG para fotos
- Mantener imágenes organizadas en carpetas

### ❌ Evitar

- Nombres genéricos: `image1.png`, `screenshot.png`
- Imágenes sin comprimir (> 2MB)
- Depender solo de URLs externas (pueden romperse)
- Imágenes sin contexto o explicación

---

## Estructura Recomendada

```
/app/docs/
├── images/                    # Imágenes globales/compartidas
│   ├── logo.png
│   ├── banner.jpg
│   └── icons/
│       ├── check.svg
│       └── warning.svg
└── content/
    ├── 01-fundamentos/
    │   ├── sdlc-stlc.md
    │   └── images/          # Imágenes específicas del bloque
    │       ├── sdlc-diagram.png
    │       └── stlc-flow.png
    └── 02-technical/
        ├── sql-basics.md
        └── images/
            └── sql-query.png
```

---

### 💡 Tip Pro

Usa **placeholders** mientras escribes el documento y reemplázalos con imágenes reales después:

```markdown
![TODO: Agregar diagrama de arquitectura](https://via.placeholder.com/800x400?text=Arquitectura)
```

---

**Última actualización**: Enero 2025