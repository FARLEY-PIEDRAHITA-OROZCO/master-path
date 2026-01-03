# 🚀 ROADMAP DE MEJORAS DETALLADO - QA MASTER PATH

> **Manual Completo de Implementación - De Básico a Avanzado**
> 
> Este documento te guiará paso a paso en la transformación de tu proyecto desde una aplicación frontend básica hasta una plataforma profesional, escalable y lista para producción.

---

## 📚 TABLA DE CONTENIDOS

- [Introducción](#introducción)
- [Preparación del Entorno](#preparación-del-entorno)
- [Sprint 1: Fundación Técnica](#sprint-1-fundación-técnica-semanas-1-2)
- [Sprint 2: Sistema de Autenticación](#sprint-2-sistema-de-autenticación-semanas-3-4)
- [Sprint 3: Optimización y Performance](#sprint-3-optimización-y-performance-semanas-5-6)
- [Sprint 4: Features Interactivas](#sprint-4-features-interactivas-semanas-7-8)
- [Sprint 5: Sistema de Documentación](#sprint-5-sistema-de-documentación-semanas-9-10)
- [Sprint 6: Seguridad y Compliance](#sprint-6-seguridad-y-compliance-semanas-11-12)
- [Bonus: Características Avanzadas](#bonus-características-avanzadas)

---

## 🎯 INTRODUCCIÓN

### ¿Qué aprenderás en este roadmap?

Este roadmap te enseñará a:
- ✅ Implementar **testing automatizado** (Unit, Integration, E2E)
- ✅ Crear un **sistema de autenticación** completo
- ✅ Optimizar **performance** (PWA, lazy loading, caching)
- ✅ Construir **features interactivas** (quizzes, comentarios, gamificación avanzada)
- ✅ Mejorar la **documentación** técnica y de usuario
- ✅ Implementar **seguridad** y compliance (GDPR, CSP, validación)

### ¿Para quién es este roadmap?

- 🟢 **Principiantes** que quieren aprender desarrollo profesional
- 🟡 **Intermedios** que buscan consolidar conocimientos
- 🔵 **Avanzados** que quieren implementar best practices

### Estructura de cada tarea

Cada tarea seguirá este formato:

```
📌 TAREA X.Y: Nombre de la Tarea
├── 🎓 CONCEPTO: ¿Qué es y por qué es importante?
├── 🔧 PREREQUISITOS: Lo que necesitas saber/tener
├── 📝 PASO A PASO: Instrucciones detalladas
├── 💻 CÓDIGO COMPLETO: Implementación lista para copiar
├── ✅ VALIDACIÓN: Cómo verificar que funciona
├── 🐛 TROUBLESHOOTING: Solución a problemas comunes
└── 📚 RECURSOS: Para profundizar
```

---

## 🛠️ PREPARACIÓN DEL ENTORNO

### PASO 0.1: Configurar Git (Si no lo tienes)

#### 🎓 ¿Qué es Git?

Git es un sistema de control de versiones que te permite:
- Guardar "snapshots" de tu código en el tiempo
- Trabajar en diferentes features sin romper el código principal
- Colaborar con otros desarrolladores
- Deshacer cambios si algo sale mal

#### 📝 Instalación

**En macOS:**
```bash
# Verificar si ya tienes Git
git --version

# Si no lo tienes, instalar con Homebrew
brew install git
```

**En Windows:**
```bash
# Descargar desde: https://git-scm.com/download/win
# O usar chocolatey:
choco install git
```

**En Linux:**
```bash
sudo apt-get update
sudo apt-get install git
```

#### 📝 Configuración inicial

```bash
# Configurar tu identidad
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Verificar configuración
git config --list
```

#### 📝 Inicializar repositorio en tu proyecto

```bash
# Navegar a tu proyecto
cd /app

# Inicializar Git
git init

# Ver estado actual
git status

# Crear archivo .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local

# Build outputs
dist/
build/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Temporary files
*.tmp
*.temp
EOF

# Hacer el primer commit
git add .
git commit -m "Initial commit: QA Master Path base project"
```

#### ✅ Validación

```bash
# Ver el log de commits
git log

# Deberías ver tu primer commit
```

---

### PASO 0.2: Configurar Estructura de Branches

#### 🎓 ¿Qué es una branch?

Una branch (rama) es una línea independiente de desarrollo. Te permite:
- Trabajar en features sin afectar el código principal
- Experimentar sin miedo a romper cosas
- Organizar tu trabajo de manera profesional

#### 📝 Estrategia de branches

```
main (producción)
 └── develop (desarrollo)
      ├── feature/testing-setup
      ├── feature/authentication
      ├── feature/pwa
      └── hotfix/bug-critical
```

#### 💻 Implementación

```bash
# Crear branch develop
git checkout -b develop

# Subir branch a remoto (si tienes GitHub configurado)
git push -u origin develop

# Configurar develop como branch por defecto para trabajo
git branch --set-upstream-to=origin/develop develop

# Crear tu primera feature branch
git checkout -b feature/testing-setup

# Ver todas las branches
git branch -a
```

#### 📝 Workflow de trabajo

```bash
# 1. Asegúrate de estar en develop
git checkout develop

# 2. Actualizar con últimos cambios
git pull origin develop

# 3. Crear feature branch
git checkout -b feature/nombre-de-feature

# 4. Trabajar en tu código...
# ... hacer cambios ...

# 5. Hacer commit de cambios
git add .
git commit -m "feat: descripción de lo que hiciste"

# 6. Subir branch
git push origin feature/nombre-de-feature

# 7. Crear Pull Request en GitHub (opcional)
# O mergear localmente:
git checkout develop
git merge feature/nombre-de-feature

# 8. Eliminar feature branch
git branch -d feature/nombre-de-feature
```

---

### PASO 0.3: Configurar GitHub (Opcional pero Recomendado)

#### 🎓 ¿Por qué GitHub?

GitHub te permite:
- Tener backup de tu código en la nube
- Compartir tu proyecto con otros
- Usar GitHub Pages para hosting gratuito
- CI/CD automatizado

#### 📝 Paso a paso

1. **Crear cuenta en GitHub**: https://github.com/signup

2. **Crear nuevo repositorio**:
   - Click en "New repository"
   - Nombre: `qa-master-path`
   - Descripción: `Plataforma educativa para QA Engineers`
   - Público o Privado (tu elección)
   - NO inicializar con README (ya tienes código)

3. **Conectar repositorio local con GitHub**:

```bash
# Agregar remote
git remote add origin https://github.com/tu-usuario/qa-master-path.git

# Verificar
git remote -v

# Subir código
git push -u origin main
git push origin develop
```

4. **Configurar GitHub Pages** (hosting gratuito):
   - Ve a Settings > Pages
   - Source: Deploy from branch
   - Branch: `main` / folder: `/ (root)`
   - Save

Tu sitio estará en: `https://tu-usuario.github.io/qa-master-path/`

---

### PASO 0.4: Instalar Node.js y npm

#### 🎓 ¿Qué es Node.js?

Node.js es un runtime de JavaScript que te permite:
- Ejecutar JavaScript fuera del navegador
- Instalar paquetes y herramientas
- Crear scripts de automatización
- Construir aplicaciones backend

#### 📝 Instalación

**Método recomendado: nvm (Node Version Manager)**

```bash
# En macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Cerrar y abrir terminal, luego:
nvm install 20  # Instala Node.js v20 (LTS)
nvm use 20
nvm alias default 20

# Verificar instalación
node --version  # Debería mostrar v20.x.x
npm --version   # Debería mostrar 10.x.x
```

**En Windows:**
- Descargar desde: https://nodejs.org/
- Elegir versión LTS (Long Term Support)
- Seguir el instalador

---

### PASO 0.5: Inicializar package.json

#### 🎓 ¿Qué es package.json?

Es el archivo de configuración de tu proyecto que contiene:
- Metadatos del proyecto (nombre, versión, autor)
- Dependencias (librerías que usas)
- Scripts (comandos personalizados)

#### 💻 Crear package.json

```bash
# Navegar a tu proyecto
cd /app

# Crear package.json interactivo
npm init

# O crear uno básico automáticamente
npm init -y
```

#### 📝 Editar package.json manualmente

Abre `/app/package.json` y modifícalo:

```json
{
  "name": "qa-master-path",
  "version": "1.0.0",
  "description": "Plataforma educativa gamificada para QA Engineers",
  "main": "index.html",
  "scripts": {
    "dev": "echo 'Servidor de desarrollo configurado más adelante'",
    "build": "echo 'Build configurado más adelante'",
    "test": "echo 'Tests configurados más adelante'",
    "lint": "echo 'Linter configurado más adelante'"
  },
  "keywords": ["qa", "testing", "education", "gamification"],
  "author": "Tu Nombre <tu@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/tu-usuario/qa-master-path.git"
  },
  "bugs": {
    "url": "https://github.com/tu-usuario/qa-master-path/issues"
  },
  "homepage": "https://github.com/tu-usuario/qa-master-path#readme"
}
```

#### ✅ Validación

```bash
# Verificar que el archivo es válido
npm run dev  # Debería mostrar el echo
```

---

## 🧪 SPRINT 1: FUNDACIÓN TÉCNICA (Semanas 1-2)

### OBJETIVOS DEL SPRINT 1

- ✅ Configurar framework de testing (Vitest)
- ✅ Escribir tests unitarios para módulos críticos
- ✅ Implementar manejo robusto de errores
- ✅ Agregar validación de datos
- ✅ Configurar ESLint y Prettier
- ✅ Configurar CI básico con GitHub Actions

---

### 📌 TAREA 1.1: Configurar Vitest (Framework de Testing)

#### 🎓 CONCEPTO: ¿Qué es testing y por qué importa?

**Testing** es escribir código que verifica que tu código funciona correctamente.

**Tipos de tests:**
- **Unit tests**: Prueban funciones individuales
- **Integration tests**: Prueban cómo trabajan juntas varias partes
- **E2E tests**: Prueban flujos completos desde la perspectiva del usuario

**Beneficios:**
- 🛡️ Detectar bugs antes de que lleguen a producción
- 📝 Documentación viva de cómo funciona el código
- 🔄 Refactorizar con confianza
- ⚡ Desarrollo más rápido a largo plazo

#### 🔧 PREREQUISITOS

- Node.js instalado (Paso 0.4 completado)
- package.json creado (Paso 0.5 completado)

#### 📝 PASO A PASO

**Paso 1: Instalar Vitest**

```bash
# Navegar a tu proyecto
cd /app

# Instalar Vitest y dependencias
npm install -D vitest jsdom @vitest/ui happy-dom
```

**¿Qué instalamos?**
- `vitest`: Framework de testing (alternativa moderna a Jest)
- `jsdom`: Simula un navegador para tests
- `@vitest/ui`: Interfaz visual para ver resultados
- `happy-dom`: DOM más rápido que jsdom

**Paso 2: Configurar Vitest**

Crear archivo `/app/vitest.config.js`:

```bash
cat > vitest.config.js << 'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Usar happy-dom como entorno (simula navegador)
    environment: 'happy-dom',
    
    // Archivos de test a buscar
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Archivos a excluir
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // Mostrar cuánto código está cubierto por tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['assets/js/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js']
    },
    
    // Configuración de UI
    ui: true,
    
    // Configuración global
    globals: true,
    
    // Timeout para tests
    testTimeout: 10000
  }
});
EOF
```

**Paso 3: Actualizar package.json**

Abre `/app/package.json` y actualiza la sección de scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Paso 4: Crear directorio para tests**

```bash
# Crear carpeta para tests
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
```

#### ✅ VALIDACIÓN

```bash
# Ejecutar Vitest (debería decir "No test files found")
npm run test:run

# Si sale este mensaje, está funcionando correctamente
```

#### 📚 RECURSOS

- [Vitest Docs](https://vitest.dev/)
- [Testing JavaScript Tutorial](https://testingjavascript.com/)

---

### 📌 TAREA 1.2: Escribir Tests para StorageService

#### 🎓 CONCEPTO: Unit Testing

Los **unit tests** prueban funciones individuales en aislamiento.

**Anatomía de un test:**

```javascript
describe('Grupo de tests relacionados', () => {
  it('debería hacer algo específico', () => {
    // Arrange (Preparar)
    const input = 5;
    
    // Act (Ejecutar)
    const result = suma(input, 3);
    
    // Assert (Verificar)
    expect(result).toBe(8);
  });
});
```

#### 📝 PASO A PASO

**Paso 1: Adaptar StorageService para testing**

Primero, necesitamos hacer que `StorageService` sea testeable. El problema actual es que depende de `localStorage` del navegador.

Crear `/app/assets/js/storage.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Reemplazar localStorage global con nuestro mock
global.localStorage = localStorageMock;

// Ahora importamos StorageService (después de mockear localStorage)
// Nota: Necesitamos modificar storage.js para que sea importable
const KEYS = {
  PROGRESS: 'qa_master_progress',
  SUBTASKS: 'qa_subtask_progress',
  NOTES: 'qa_module_notes',
  BADGES: 'qa_celebrated_badges'
};

const StorageService = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return key === KEYS.BADGES ? [] : {};
      }
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return key === KEYS.BADGES ? [] : {};
    }
  },

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  toggleProgress(id, isChecked) {
    const progress = this.get(KEYS.PROGRESS);
    progress[id] = isChecked;
    this.save(KEYS.PROGRESS, progress);
    return isChecked;
  },

  toggleSubtask(moduleId, taskIndex) {
    const subProgress = this.get(KEYS.SUBTASKS);
    const key = `${moduleId}-${taskIndex}`;
    subProgress[key] = !subProgress[key];
    this.save(KEYS.SUBTASKS, subProgress);
    return subProgress[key];
  }
};

// ==================== TESTS ====================

describe('StorageService', () => {
  // Limpiar localStorage antes de cada test
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get()', () => {
    it('debería retornar objeto vacío si no existe la key', () => {
      const result = StorageService.get(KEYS.PROGRESS);
      expect(result).toEqual({});
    });

    it('debería retornar array vacío para BADGES si no existe', () => {
      const result = StorageService.get(KEYS.BADGES);
      expect(result).toEqual([]);
    });

    it('debería retornar datos parseados correctamente', () => {
      const testData = { module1: true, module2: false };
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(testData));

      const result = StorageService.get(KEYS.PROGRESS);
      expect(result).toEqual(testData);
    });

    it('debería manejar JSON corrupto sin crashear', () => {
      localStorage.setItem(KEYS.PROGRESS, 'invalid-json{');
      
      const result = StorageService.get(KEYS.PROGRESS);
      expect(result).toEqual({});
    });
  });

  describe('save()', () => {
    it('debería guardar datos correctamente', () => {
      const testData = { module1: true };
      
      const success = StorageService.save(KEYS.PROGRESS, testData);
      
      expect(success).toBe(true);
      const stored = localStorage.getItem(KEYS.PROGRESS);
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('debería retornar true en guardado exitoso', () => {
      const result = StorageService.save(KEYS.PROGRESS, {});
      expect(result).toBe(true);
    });
  });

  describe('toggleProgress()', () => {
    it('debería activar progreso de un módulo', () => {
      const result = StorageService.toggleProgress(1, true);
      
      expect(result).toBe(true);
      
      const progress = StorageService.get(KEYS.PROGRESS);
      expect(progress[1]).toBe(true);
    });

    it('debería desactivar progreso de un módulo', () => {
      StorageService.toggleProgress(1, true);
      const result = StorageService.toggleProgress(1, false);
      
      expect(result).toBe(false);
      
      const progress = StorageService.get(KEYS.PROGRESS);
      expect(progress[1]).toBe(false);
    });

    it('debería mantener otros valores al actualizar uno', () => {
      StorageService.toggleProgress(1, true);
      StorageService.toggleProgress(2, true);
      StorageService.toggleProgress(1, false);
      
      const progress = StorageService.get(KEYS.PROGRESS);
      expect(progress[1]).toBe(false);
      expect(progress[2]).toBe(true);
    });
  });

  describe('toggleSubtask()', () => {
    it('debería activar una subtarea', () => {
      const result = StorageService.toggleSubtask(1, 0);
      
      expect(result).toBe(true);
      
      const subProgress = StorageService.get(KEYS.SUBTASKS);
      expect(subProgress['1-0']).toBe(true);
    });

    it('debería alternar estado de subtarea (toggle)', () => {
      const first = StorageService.toggleSubtask(1, 0);
      expect(first).toBe(true);
      
      const second = StorageService.toggleSubtask(1, 0);
      expect(second).toBe(false);
      
      const third = StorageService.toggleSubtask(1, 0);
      expect(third).toBe(true);
    });

    it('debería manejar múltiples subtareas independientemente', () => {
      StorageService.toggleSubtask(1, 0);
      StorageService.toggleSubtask(1, 1);
      StorageService.toggleSubtask(2, 0);
      
      const subProgress = StorageService.get(KEYS.SUBTASKS);
      expect(subProgress['1-0']).toBe(true);
      expect(subProgress['1-1']).toBe(true);
      expect(subProgress['2-0']).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('debería manejar keys undefined', () => {
      const result = StorageService.get(undefined);
      expect(result).toEqual({});
    });

    it('debería manejar datos muy grandes', () => {
      const largeData = {};
      for (let i = 0; i < 10000; i++) {
        largeData[`key${i}`] = `value${i}`;
      }
      
      const success = StorageService.save('test_large', largeData);
      expect(success).toBe(true);
      
      const retrieved = StorageService.get('test_large');
      expect(Object.keys(retrieved).length).toBe(10000);
    });
  });
});
```

**Paso 2: Ejecutar tests**

```bash
# Ejecutar tests
npm run test

# O con interfaz visual
npm run test:ui
```

#### ✅ VALIDACIÓN

Deberías ver algo como:

```
✓ StorageService > get() > debería retornar objeto vacío... (3ms)
✓ StorageService > get() > debería retornar array vacío... (1ms)
✓ StorageService > save() > debería guardar datos... (2ms)
...

Test Files  1 passed (1)
     Tests  15 passed (15)
  Start at  10:30:00
  Duration  125ms
```

#### 🐛 TROUBLESHOOTING

**Error: "Cannot use import statement outside a module"**

Solución: Agrega esto a `package.json`:

```json
{
  "type": "module"
}
```

**Error: "localStorage is not defined"**

Solución: Asegúrate de que el mock de localStorage esté antes de importar StorageService.

---

### 📌 TAREA 1.3: Refactorizar StorageService con Manejo de Errores

#### 🎓 CONCEPTO: Defensive Programming

**Defensive programming** significa escribir código que:
- Valida inputs antes de usarlos
- Maneja errores gracefully (sin crashear)
- Proporciona fallbacks
- Loggea problemas para debugging

#### 📝 PASO A PASO

**Paso 1: Crear versión mejorada de StorageService**

Abre `/app/assets/js/storage.js` y reemplaza todo el contenido:

```javascript
/**
 * STORAGE SERVICE - QA MASTER PATH
 * Gestión segura y robusta de persistencia con LocalStorage
 * @module StorageService
 */

// ==================== CONFIGURACIÓN ====================

const KEYS = {
  PROGRESS: 'qa_master_progress',
  SUBTASKS: 'qa_subtask_progress',
  NOTES: 'qa_module_notes',
  BADGES: 'qa_celebrated_badges',
  VERSION: 'qa_data_version'
};

const CURRENT_VERSION = '1.0';

// Valores por defecto para cada tipo de key
const DEFAULT_VALUES = {
  [KEYS.PROGRESS]: {},
  [KEYS.SUBTASKS]: {},
  [KEYS.NOTES]: {},
  [KEYS.BADGES]: [],
  [KEYS.VERSION]: CURRENT_VERSION
};

// ==================== LOGGER ====================

class Logger {
  static log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    // En desarrollo, mostrar en consola con colores
    const colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      success: '\x1b[32m'  // Green
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    console.log(`${color}[${level.toUpperCase()}]${reset}`, message, data);

    // En producción, podrías enviar a servicio de logging
    // this.sendToServer(logEntry);
  }

  static info(message, data) {
    this.log('info', message, data);
  }

  static warn(message, data) {
    this.log('warn', message, data);
  }

  static error(message, data) {
    this.log('error', message, data);
  }

  static success(message, data) {
    this.log('success', message, data);
  }
}

// ==================== VALIDATOR ====================

class Validator {
  /**
   * Valida que una key sea válida
   */
  static isValidKey(key) {
    return Object.values(KEYS).includes(key);
  }

  /**
   * Valida que los datos tengan la estructura esperada
   */
  static validateDataStructure(key, data) {
    switch(key) {
      case KEYS.PROGRESS:
      case KEYS.SUBTASKS:
      case KEYS.NOTES:
        return typeof data === 'object' && !Array.isArray(data);
      
      case KEYS.BADGES:
        return Array.isArray(data);
      
      default:
        return true;
    }
  }

  /**
   * Valida un ID de módulo
   */
  static isValidModuleId(id) {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0 && parsed <= 20;
  }

  /**
   * Sanitiza input de texto
   */
  static sanitizeText(text, maxLength = 5000) {
    if (typeof text !== 'string') return '';
    return text.trim().slice(0, maxLength);
  }
}

// ==================== STORAGE SERVICE ====================

export const StorageService = {
  
  /**
   * Inicializa el storage service
   * Verifica versión de datos y migra si es necesario
   */
  init() {
    try {
      const storedVersion = this.get(KEYS.VERSION);
      
      if (storedVersion !== CURRENT_VERSION) {
        Logger.info('Data version mismatch, migrating...', {
          from: storedVersion,
          to: CURRENT_VERSION
        });
        this.migrate(storedVersion, CURRENT_VERSION);
      }

      Logger.success('StorageService initialized', {
        version: CURRENT_VERSION
      });

      return true;
    } catch (error) {
      Logger.error('Failed to initialize StorageService', { error });
      return false;
    }
  },

  /**
   * Obtiene datos del localStorage con validación y manejo de errores
   * @param {string} key - Clave del localStorage
   * @returns {Object|Array} Datos parseados o valor por defecto
   */
  get(key) {
    try {
      // Validar key
      if (!Validator.isValidKey(key)) {
        Logger.warn('Invalid storage key', { key });
        return DEFAULT_VALUES[key] || {};
      }

      // Intentar obtener datos
      const rawData = localStorage.getItem(key);
      
      // Si no existe, retornar valor por defecto
      if (rawData === null || rawData === undefined) {
        return DEFAULT_VALUES[key] || {};
      }

      // Parsear JSON
      const parsedData = JSON.parse(rawData);

      // Validar estructura
      if (!Validator.validateDataStructure(key, parsedData)) {
        Logger.warn('Invalid data structure, using default', { 
          key, 
          receivedType: typeof parsedData 
        });
        return DEFAULT_VALUES[key] || {};
      }

      return parsedData;

    } catch (error) {
      Logger.error('Error getting data from storage', {
        key,
        error: error.message,
        stack: error.stack
      });

      // Intentar recuperar el dato corrupto
      this.handleCorruptedData(key);

      return DEFAULT_VALUES[key] || {};
    }
  },

  /**
   * Guarda datos en localStorage con validación
   * @param {string} key - Clave del localStorage
   * @param {Object|Array} data - Datos a guardar
   * @returns {boolean} true si se guardó exitosamente
   */
  save(key, data) {
    try {
      // Validar key
      if (!Validator.isValidKey(key)) {
        Logger.warn('Attempt to save with invalid key', { key });
        return false;
      }

      // Validar estructura de datos
      if (!Validator.validateDataStructure(key, data)) {
        Logger.error('Invalid data structure for key', { 
          key, 
          dataType: typeof data 
        });
        return false;
      }

      // Crear backup antes de guardar (solo para datos importantes)
      if (key === KEYS.PROGRESS || key === KEYS.SUBTASKS) {
        this.createBackup(key);
      }

      // Serializar y guardar
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);

      Logger.info('Data saved successfully', {
        key,
        size: serialized.length
      });

      return true;

    } catch (error) {
      // Manejar quota exceeded error
      if (error.name === 'QuotaExceededError') {
        Logger.error('LocalStorage quota exceeded', {
          key,
          dataSize: JSON.stringify(data).length
        });
        
        // Intentar limpiar datos viejos
        this.cleanup();
        
        // Reintentar
        try {
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (retryError) {
          Logger.error('Failed to save even after cleanup', { retryError });
          return false;
        }
      }

      Logger.error('Error saving data to storage', {
        key,
        error: error.message
      });

      return false;
    }
  },

  /**
   * Alterna el progreso de un módulo
   * @param {number|string} id - ID del módulo
   * @param {boolean} isChecked - Estado del checkbox
   * @returns {boolean} Nuevo estado
   */
  toggleProgress(id, isChecked) {
    try {
      // Validar ID
      if (!Validator.isValidModuleId(id)) {
        Logger.warn('Invalid module ID for progress', { id });
        return false;
      }

      const progress = this.get(KEYS.PROGRESS);
      progress[id] = Boolean(isChecked);
      
      const saved = this.save(KEYS.PROGRESS, progress);
      
      if (saved) {
        Logger.info('Progress toggled', { moduleId: id, isChecked });
      }

      return isChecked;

    } catch (error) {
      Logger.error('Error toggling progress', { id, isChecked, error });
      return false;
    }
  },

  /**
   * Alterna el estado de una subtarea
   * @param {number|string} moduleId - ID del módulo
   * @param {number|string} taskIndex - Índice de la tarea
   * @returns {boolean} Nuevo estado
   */
  toggleSubtask(moduleId, taskIndex) {
    try {
      const subProgress = this.get(KEYS.SUBTASKS);
      const key = `${moduleId}-${taskIndex}`;
      
      subProgress[key] = !subProgress[key];
      
      const saved = this.save(KEYS.SUBTASKS, subProgress);
      
      if (saved) {
        Logger.info('Subtask toggled', { moduleId, taskIndex, newState: subProgress[key] });
      }

      return subProgress[key];

    } catch (error) {
      Logger.error('Error toggling subtask', { moduleId, taskIndex, error });
      return false;
    }
  },

  /**
   * Guarda nota de un módulo con sanitización
   * @param {number|string} moduleId - ID del módulo
   * @param {string} noteText - Texto de la nota
   * @returns {boolean} true si se guardó exitosamente
   */
  saveNote(moduleId, noteText) {
    try {
      if (!Validator.isValidModuleId(moduleId)) {
        Logger.warn('Invalid module ID for note', { moduleId });
        return false;
      }

      const sanitized = Validator.sanitizeText(noteText);
      const notes = this.get(KEYS.NOTES);
      notes[moduleId] = sanitized;

      return this.save(KEYS.NOTES, notes);

    } catch (error) {
      Logger.error('Error saving note', { moduleId, error });
      return false;
    }
  },

  /**
   * Obtiene nota de un módulo
   * @param {number|string} moduleId - ID del módulo
   * @returns {string} Texto de la nota o string vacío
   */
  getNote(moduleId) {
    try {
      const notes = this.get(KEYS.NOTES);
      return notes[moduleId] || '';
    } catch (error) {
      Logger.error('Error getting note', { moduleId, error });
      return '';
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Crea backup de una key específica
   */
  createBackup(key) {
    try {
      const data = this.get(key);
      const backupKey = `${key}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(data));
      
      // Mantener solo los últimos 3 backups
      this.cleanOldBackups(key);

    } catch (error) {
      Logger.warn('Failed to create backup', { key, error });
    }
  },

  /**
   * Limpia backups antiguos
   */
  cleanOldBackups(key) {
    const backupPattern = `${key}_backup_`;
    const allBackups = [];

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey.startsWith(backupPattern)) {
        allBackups.push({
          key: storageKey,
          timestamp: parseInt(storageKey.split('_').pop(), 10)
        });
      }
    }

    // Ordenar por timestamp descendente y mantener solo 3
    allBackups.sort((a, b) => b.timestamp - a.timestamp);
    allBackups.slice(3).forEach(backup => {
      localStorage.removeItem(backup.key);
    });
  },

  /**
   * Maneja datos corruptos intentando recuperación
   */
  handleCorruptedData(key) {
    Logger.warn('Attempting to recover corrupted data', { key });

    // Buscar backup más reciente
    const backupPattern = `${key}_backup_`;
    let latestBackup = null;
    let latestTimestamp = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey.startsWith(backupPattern)) {
        const timestamp = parseInt(storageKey.split('_').pop(), 10);
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestBackup = storageKey;
        }
      }
    }

    // Si encontramos backup, restaurarlo
    if (latestBackup) {
      try {
        const backupData = localStorage.getItem(latestBackup);
        localStorage.setItem(key, backupData);
        Logger.success('Data recovered from backup', { 
          key, 
          backupKey: latestBackup 
        });
      } catch (error) {
        Logger.error('Failed to recover from backup', { error });
      }
    }
  },

  /**
   * Limpia localStorage de datos temporales
   */
  cleanup() {
    Logger.info('Starting storage cleanup...');

    // Eliminar backups muy antiguos (más de 7 días)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      
      if (key && key.includes('_backup_')) {
        const timestamp = parseInt(key.split('_').pop(), 10);
        
        if (timestamp < sevenDaysAgo) {
          localStorage.removeItem(key);
          Logger.info('Removed old backup', { key });
        }
      }
    }
  },

  /**
   * Migra datos de una versión a otra
   */
  migrate(fromVersion, toVersion) {
    Logger.info('Starting data migration', { fromVersion, toVersion });

    // Por ahora no hay migraciones necesarias
    // En el futuro, aquí irían las transformaciones de datos

    this.save(KEYS.VERSION, toVersion);
    Logger.success('Migration completed', { toVersion });
  },

  /**
   * Exporta todos los datos del usuario
   * @returns {Object} Todos los datos
   */
  exportAll() {
    return {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        progress: this.get(KEYS.PROGRESS),
        subtasks: this.get(KEYS.SUBTASKS),
        notes: this.get(KEYS.NOTES),
        badges: this.get(KEYS.BADGES)
      }
    };
  },

  /**
   * Importa datos exportados
   * @param {Object} exportedData - Datos a importar
   * @returns {boolean} true si se importó exitosamente
   */
  importAll(exportedData) {
    try {
      if (!exportedData || !exportedData.data) {
        throw new Error('Invalid export data');
      }

      // Crear backup antes de importar
      Object.values(KEYS).forEach(key => {
        if (key !== KEYS.VERSION) {
          this.createBackup(key);
        }
      });

      // Importar cada tipo de dato
      const { data } = exportedData;
      
      this.save(KEYS.PROGRESS, data.progress || {});
      this.save(KEYS.SUBTASKS, data.subtasks || {});
      this.save(KEYS.NOTES, data.notes || {});
      this.save(KEYS.BADGES, data.badges || []);

      Logger.success('Data imported successfully');
      return true;

    } catch (error) {
      Logger.error('Failed to import data', { error });
      return false;
    }
  },

  /**
   * Resetea todos los datos (con confirmación)
   */
  resetAll() {
    Logger.warn('Resetting all data...');

    Object.values(KEYS).forEach(key => {
      if (key !== KEYS.VERSION) {
        this.save(key, DEFAULT_VALUES[key] || {});
      }
    });

    Logger.success('All data reset to defaults');
  }
};

// Exportar también las constantes para uso en otros módulos
export { KEYS, Logger, Validator };

// Auto-inicializar cuando se carga el módulo
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  StorageService.init();
}
```

**Paso 2: Actualizar tests**

Los tests anteriores deberían seguir funcionando. Ejecuta:

```bash
npm run test
```

#### ✅ VALIDACIÓN

1. Todos los tests deberían pasar
2. En la consola del navegador, deberías ver logs coloridos
3. Prueba manualmente:
   - Corromper un dato en DevTools
   - Ver que se recupera automáticamente

---

### 📌 TAREA 1.4: Tests para AppEngine

#### 📝 PASO A PASO

Crear `/app/assets/js/app.test.js`:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch global
global.fetch = vi.fn();

// Mock de modules.json
const mockModulesData = {
  modules: [
    { id: 1, phase: 'Core', title: 'Test Module 1', xp: 500 },
    { id: 2, phase: 'Core', title: 'Test Module 2', xp: 600 },
    { id: 3, phase: 'Technical', title: 'Test Module 3', xp: 800 }
  ],
  tools: [
    { category: 'api', name: 'Tool 1', desc: 'Description', url: '#', icon: 'fa-icon' }
  ]
};

// Implementación de AppEngine para tests
class AppEngine {
  constructor() {
    this.data = null;
    this.modules = [];
  }

  async init() {
    try {
      const response = await fetch('./assets/data/modules.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      this.data = jsonData;
      this.modules = jsonData.modules || [];

      return { success: true };
    } catch (error) {
      console.error('Error loading data:', error);
      return { success: false, error: error.message };
    }
  }

  getAnalytics() {
    // Simulamos obtener datos del storage
    // En tests reales, mockearíamos StorageService
    const progress = { 1: true, 2: true, 3: false };
    const completedCount = Object.values(progress).filter(v => v === true).length;
    const totalXP = this.modules.reduce(
      (acc, m) => progress[m.id] ? acc + m.xp : acc, 
      0
    );

    return {
      xp: totalXP,
      progressPercent: Math.round((completedCount / this.modules.length) * 100) || 0,
      completedCount
    };
  }

  getBadgeStatus() {
    const p = { 1: true, 2: true, 3: false };
    return {
      core: p[1] && p[2],
      technical: p[3] && p[4] && p[5],
      automation: p[6] && p[7] && p[8] && p[9],
      expert: p[10] && p[11] && p[12]
    };
  }

  getModuleById(id) {
    return this.modules.find(m => m.id === id);
  }

  getModulesByPhase(phase) {
    return this.modules.filter(m => m.phase === phase);
  }

  getTotalXP() {
    return this.modules.reduce((acc, m) => acc + m.xp, 0);
  }
}

// ==================== TESTS ====================

describe('AppEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AppEngine();
    
    // Resetear mock de fetch
    vi.clearAllMocks();
  });

  describe('init()', () => {
    it('debería cargar datos exitosamente', async () => {
      // Configurar mock de fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });

      const result = await engine.init();

      expect(result.success).toBe(true);
      expect(engine.data).toEqual(mockModulesData);
      expect(engine.modules.length).toBe(3);
    });

    it('debería manejar error de red', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await engine.init();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(engine.modules).toEqual([]);
    });

    it('debería manejar respuesta HTTP no exitosa', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await engine.init();

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('debería manejar JSON inválido', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const result = await engine.init();

      expect(result.success).toBe(false);
    });
  });

  describe('getAnalytics()', () => {
    beforeEach(async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });
      await engine.init();
    });

    it('debería calcular XP correctamente', () => {
      const analytics = engine.getAnalytics();

      // Módulos 1 y 2 completados: 500 + 600 = 1100
      expect(analytics.xp).toBe(1100);
    });

    it('debería calcular porcentaje de progreso', () => {
      const analytics = engine.getAnalytics();

      // 2 de 3 módulos = 67%
      expect(analytics.progressPercent).toBe(67);
    });

    it('debería contar módulos completados', () => {
      const analytics = engine.getAnalytics();

      expect(analytics.completedCount).toBe(2);
    });

    it('debería retornar 0% si no hay módulos', () => {
      engine.modules = [];
      const analytics = engine.getAnalytics();

      expect(analytics.progressPercent).toBe(0);
    });
  });

  describe('getBadgeStatus()', () => {
    it('debería retornar estado de badges correctamente', () => {
      const status = engine.getBadgeStatus();

      expect(status.core).toBe(true);  // 1 && 2 = true
      expect(status.technical).toBe(false);
      expect(status.automation).toBe(false);
      expect(status.expert).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });
      await engine.init();
    });

    it('debería encontrar módulo por ID', () => {
      const module = engine.getModuleById(2);

      expect(module).toBeDefined();
      expect(module.title).toBe('Test Module 2');
    });

    it('debería retornar undefined para ID inexistente', () => {
      const module = engine.getModuleById(999);

      expect(module).toBeUndefined();
    });

    it('debería filtrar módulos por fase', () => {
      const coreModules = engine.getModulesByPhase('Core');

      expect(coreModules.length).toBe(2);
      expect(coreModules.every(m => m.phase === 'Core')).toBe(true);
    });

    it('debería calcular XP total disponible', () => {
      const totalXP = engine.getTotalXP();

      expect(totalXP).toBe(1900); // 500 + 600 + 800
    });
  });
});
```

**Ejecutar tests:**

```bash
npm run test
npm run test:coverage  # Para ver cobertura
```

#### ✅ VALIDACIÓN

Deberías ver:

```
✓ AppEngine > init() > debería cargar datos exitosamente
✓ AppEngine > getAnalytics() > debería calcular XP correctamente
...

Test Files  2 passed (2)
     Tests  25 passed (25)

Coverage:
  assets/js/storage.js    95.2%
  assets/js/app.js        87.3%
```

---

### 📌 TAREA 1.5: Configurar ESLint y Prettier

#### 🎓 CONCEPTO: Linters y Formatters

**ESLint**: Analiza tu código buscando errores y malas prácticas
**Prettier**: Formatea tu código automáticamente con estilo consistente

#### 📝 PASO A PASO

**Paso 1: Instalar dependencias**

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
npm install -D @eslint/js globals
```

**Paso 2: Configurar ESLint**

Crear `/app/eslint.config.js`:

```javascript
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      }
    },
    rules: {
      // Posibles errores
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // Mejores prácticas
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-param-reassign': 'warn',

      // Estilo
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'only-multiline'],
      'indent': ['error', 2],
      'max-len': ['warn', { code: 100, ignoreComments: true }]
    },
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**'
    ]
  }
];
```

**Paso 3: Configurar Prettier**

Crear `/app/.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Paso 4: Configurar scripts**

Actualizar `package.json`:

```json
{
  "scripts": {
    "lint": "eslint 'assets/js/**/*.js'",
    "lint:fix": "eslint 'assets/js/**/*.js' --fix",
    "format": "prettier --write 'assets/**/*.{js,css,html,json}'",
    "format:check": "prettier --check 'assets/**/*.{js,css,html,json}'"
  }
}
```

**Paso 5: Ejecutar linter**

```bash
# Ver problemas
npm run lint

# Corregir automáticamente lo que se pueda
npm run lint:fix

# Formatear todo el código
npm run format
```

#### ✅ VALIDACIÓN

```bash
npm run lint
# Debería mostrar pocos o ningún error

npm run format:check
# Debería decir "All matched files use Prettier code style!"
```

---

### 📌 TAREA 1.6: Configurar CI con GitHub Actions

#### 🎓 CONCEPTO: Continuous Integration (CI)

**CI** ejecuta automáticamente tests y validaciones cada vez que haces push a GitHub.

**Beneficios:**
- Detectar bugs antes de mergear
- Mantener calidad de código
- Validar que todo funciona en entorno limpio

#### 📝 PASO A PASO

**Paso 1: Crear workflow de GitHub Actions**

Crear directorio y archivo:

```bash
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI Pipeline

# Ejecutar en push a main/develop y en PRs
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # Job 1: Linting y formateo
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

  # Job 2: Tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

  # Job 3: Build (cuando configuremos bundler)
  build:
    name: Build Project
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: echo "Build step - to be configured with bundler"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
          if-no-files-found: ignore
EOF
```

**Paso 2: Crear badge de status**

Agregar al `README.md`:

```markdown
# QA Master Path

![CI Status](https://github.com/tu-usuario/qa-master-path/workflows/CI%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/tu-usuario/qa-master-path/branch/main/graph/badge.svg)

...
```

**Paso 3: Commit y push**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push origin develop
```

#### ✅ VALIDACIÓN

1. Ve a tu repositorio en GitHub
2. Click en la pestaña "Actions"
3. Deberías ver el workflow ejecutándose
4. Todos los jobs deberían pasar ✅

---

## 🎉 FIN DEL SPRINT 1

### Checklist de Completitud

- [ ] Git configurado y repositorio inicializado
- [ ] Branches (main, develop, feature) configuradas
- [ ] Vitest instalado y configurado
- [ ] Tests para StorageService escritos y pasando
- [ ] StorageService refactorizado con manejo de errores
- [ ] Tests para AppEngine escritos y pasando
- [ ] ESLint y Prettier configurados
- [ ] GitHub Actions CI funcionando
- [ ] Cobertura de tests >80%

### Qué Aprendiste

✅ Testing automatizado (unit tests)
✅ Manejo robusto de errores
✅ Defensive programming
✅ Logging estructurado
✅ Validación de datos
✅ Code linting y formatting
✅ Continuous Integration

### Próximos Pasos

En el **Sprint 2** implementarás:
- Sistema de autenticación (Firebase o custom)
- Backend con FastAPI
- Base de datos MongoDB
- Sincronización de datos

---

## 🔐 SPRINT 2: SISTEMA DE AUTENTICACIÓN (Semanas 3-4)

[Continúa en la siguiente sección...]

---

Este roadmap continúa con los siguientes sprints. ¿Quieres que continúe con el Sprint 2 y los siguientes?
