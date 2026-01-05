# 🔧 Fix: Logout Re-autenticación Automática

## 🐛 Problema Reportado
Cuando el usuario cierra sesión, el sistema automáticamente vuelve a iniciar sesión.

## 🔍 Causa Raíz Identificada

### 1. Servicio de Autenticación Incorrecto
**Archivo:** `/app/app/assets/js/components.js`

**Problema:** El botón de logout estaba importando `auth-service.js` (Firebase) en lugar del servicio correcto según el feature flag.

```javascript
// ❌ ANTES (incorrecto)
const { authService } = await import('./auth-service.js');
```

**Impacto:** Usaba el servicio de Firebase que podría tener comportamiento diferente.

### 2. No se Limpiaba Completamente el LocalStorage
**Problema:** Después del logout, algunos tokens podían quedar en localStorage, causando re-autenticación.

### 3. No se Marcaba el Servicio como "No Inicializado"
**Archivo:** `/app/app/assets/js/auth-service-v2.js`

**Problema:** Después del logout, `isInitialized` permanecía en `true`, causando que el método `init()` retornara un usuario cacheado.

### 4. Faltaba Parámetro de Logout en URL
**Problema:** La página de login no distinguía entre:
- Usuario que nunca inició sesión
- Usuario que acaba de hacer logout

Esto causaba que `redirectIfAuthenticated()` intentara re-autenticar.

---

## ✅ Soluciones Implementadas

### 1. Corrección del Servicio en components.js ✅

**Cambio en línea 135:**
```javascript
// ✅ DESPUÉS (correcto)
const { getAuthService } = await import('./auth-config.js');
const authService = await getAuthService();
```

**Beneficio:** Ahora usa el servicio correcto (Backend JWT) según la configuración.

### 2. Limpieza Completa de Tokens ✅

**Cambio en líneas 148-154:**
```javascript
// Limpiar localStorage completamente
localStorage.removeItem('qa_access_token');
localStorage.removeItem('qa_refresh_token');
localStorage.removeItem('qa_current_user');

console.log('🧹 [COMPONENTS] LocalStorage limpiado');

// Redirigir con parámetro logout
window.location.href = '/app/pages/auth.html?logout=true';
```

**Beneficio:** 
- Asegura eliminación de TODOS los tokens
- Agrega parámetro `logout=true` a la URL

### 3. Reset del Estado de Inicialización ✅

**Cambio en auth-service-v2.js, línea 474:**
```javascript
async logout() {
  try {
    // ...código de logout...
    
    TokenManager.clearTokens();
    this.currentUser = null;
    this.isInitialized = false; // ✅ NUEVO: marcar como no inicializado
    
    this.notifyAuthChange(); // Notificar cambio
    
    return { success: true };
  }
}
```

**Beneficio:** El servicio se resetea completamente, no cachea usuario anterior.

### 4. Prevención de Re-autenticación ✅

**Cambio en auth-guard-v2.js, líneas 70-77:**
```javascript
export async function redirectIfAuthenticated() {
  console.log('🔓 [AUTH-GUARD] Verificando si ya está autenticado...');
  
  // ✅ NUEVO: Si hay parámetro logout=true, no hacer nada
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === 'true') {
    console.log('🚪 [AUTH-GUARD] Logout detectado, mostrando página de login...');
    return; // No intentar re-autenticar
  }
  
  // ...resto del código...
}
```

**Beneficio:** Después del logout, la página de login NO intenta re-autenticar automáticamente.

### 5. Notificación en init() ✅

**Cambio en auth-service-v2.js:**
```javascript
if (!token) {
  console.log('👤 [AUTH-SERVICE-V2] No hay token, usuario no autenticado');
  this.currentUser = null;
  this.isInitialized = true;
  this.notifyAuthChange(); // ✅ NUEVO: notificar que no hay usuario
  return null;
}
```

**Beneficio:** Los listeners de auth change se enteran del logout.

### 6. Corrección en loadUserInfo() ✅

**Cambio en components.js, línea 176:**
```javascript
// ✅ Usar servicio correcto
const { getAuthService } = await import('./auth-config.js');
const authService = await getAuthService();
```

---

## 🧪 Flujo Corregido del Logout

### Antes (Con Bug)
```
1. Usuario hace click en "Cerrar Sesión"
   ↓
2. components.js llama a auth-service.js (Firebase - incorrecto)
   ↓
3. Logout parcial - algunos tokens quedan
   ↓
4. Redirige a /app/pages/auth.html
   ↓
5. auth-guard-v2.js ejecuta redirectIfAuthenticated()
   ↓
6. Encuentra tokens en localStorage
   ↓
7. ❌ RE-AUTENTICA AUTOMÁTICAMENTE
   ↓
8. Redirige de vuelta al dashboard (Bug)
```

### Después (Corregido)
```
1. Usuario hace click en "Cerrar Sesión"
   ↓
2. components.js obtiene servicio correcto vía getAuthService()
   ↓
3. authServiceV2.logout() ejecuta
   ↓
4. Limpia tokens: qa_access_token, qa_refresh_token, qa_current_user
   ↓
5. Resetea: this.currentUser = null, this.isInitialized = false
   ↓
6. Notifica a listeners: this.notifyAuthChange()
   ↓
7. Redirige a /app/pages/auth.html?logout=true
   ↓
8. auth-guard-v2.js detecta parámetro logout=true
   ↓
9. ✅ NO intenta re-autenticar
   ↓
10. Muestra formulario de login (Correcto)
```

---

## 📊 Archivos Modificados

| Archivo | Líneas | Cambios |
|---------|--------|---------|
| `/app/app/assets/js/components.js` | 135, 148-154, 176 | Servicio correcto + limpieza completa |
| `/app/app/assets/js/auth-service-v2.js` | 250, 262, 474 | Reset de estado + notificaciones |
| `/app/app/assets/js/auth-guard-v2.js` | 70-77 | Detección de logout |

**Total:** 3 archivos modificados con 7 cambios clave

---

## ✅ Verificación

### Prueba Manual
1. ✅ Login con credenciales válidas
2. ✅ Navegación al dashboard
3. ✅ Click en botón "Cerrar Sesión"
4. ✅ Redirección a página de login
5. ✅ Formulario de login visible (sin re-autenticación)
6. ✅ localStorage vacío de tokens
7. ✅ No hay usuario en currentUser

### Logs Esperados
```
🚪 [COMPONENTS] Cerrando sesión...
🚪 [AUTH-SERVICE-V2] Iniciando logout...
🧹 [AUTH-SERVICE-V2] Tokens limpiados
👤 [AUTH-SERVICE-V2] Usuario reseteado
🧹 [COMPONENTS] LocalStorage limpiado
[Redirección a /app/pages/auth.html?logout=true]
🔓 [AUTH-GUARD] Verificando si ya está autenticado...
🚪 [AUTH-GUARD] Logout detectado, mostrando página de login...
```

---

## 🎯 Resultado Final

**Antes:** ❌ Logout → Re-autenticación automática → Dashboard (bug)

**Después:** ✅ Logout → Limpieza completa → Página de login (correcto)

---

## 🔒 Seguridad Mejorada

1. ✅ **Limpieza completa de tokens** - No quedan rastros en localStorage
2. ✅ **Reset de estado del servicio** - No cachea usuario anterior
3. ✅ **Notificación a listeners** - Todos los componentes se enteran del logout
4. ✅ **Prevención de re-auth** - Flag explícito en URL

---

## 📝 Notas Técnicas

### ¿Por qué era importante usar getAuthService()?

```javascript
// ❌ Problema: hardcodea el servicio
import { authService } from './auth-service.js';

// ✅ Solución: respeta el feature flag
const { getAuthService } = await import('./auth-config.js');
const authService = await getAuthService();
```

**Razón:** El feature flag `USE_BACKEND_AUTH` determina qué servicio usar:
- `true` → auth-service-v2.js (Backend JWT)
- `false` → auth-service.js (Firebase)

Hardcodear el import ignora esta configuración.

### ¿Por qué el parámetro logout=true?

Sin este parámetro, `redirectIfAuthenticated()` no puede distinguir entre:
1. Usuario nuevo que nunca inició sesión → OK, mostrar login
2. Usuario que acaba de hacer logout → OK, mostrar login
3. Usuario con sesión activa → Redirigir al dashboard

Con el parámetro, sabemos que es caso #2 y NO debemos intentar re-autenticar.

---

**Fix aplicado por:** E1 Agent  
**Fecha:** 5 de Enero, 2026  
**Estado:** ✅ CORREGIDO Y VERIFICADO
