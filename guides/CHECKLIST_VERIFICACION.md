# ✅ CHECKLIST DE VERIFICACIÓN - AUTENTICACIÓN FIREBASE

## 📋 Pre-requisitos
- [ ] Tienes acceso a Firebase Console: https://console.firebase.google.com/project/qa-master-path
- [ ] El proyecto Firebase "qa-master-path" existe y está activo
- [ ] Authentication está habilitado en Firebase Console
- [ ] Firestore Database está creado

---

## 🔧 Verificación 1: Archivos Actualizados Correctamente

```bash
# Verificar que logger.js existe
ls -la /app/app/assets/js/logger.js

# Verificar Import Maps en HTML
grep "importmap" /app/index.html
grep "importmap" /app/app/auth.html

# Verificar rutas corregidas en auth.html
grep "assets/style.css" /app/app/auth.html
# Debería mostrar: /app/assets/style.css (con /app/ al inicio)
```

**Resultado esperado:**
- ✅ logger.js existe
- ✅ Import Maps presente en todos los HTML
- ✅ Rutas absolutas en auth.html

---

## 🌐 Verificación 2: Servidor de Desarrollo

```bash
# Iniciar servidor
cd /app
npm run dev
# O alternativamente:
./start-dev-server.sh
```

**Abrir en navegador:** http://localhost:8000

**Verificar en consola del navegador (F12 > Console):**
- [ ] No hay errores rojos
- [ ] Ves mensaje: `🔥 Firebase initialized: [DEFAULT]`
- [ ] No hay errores de "Failed to resolve module specifier"

---

## 🔐 Verificación 3: Firebase Console - Authentication

1. Ve a: https://console.firebase.google.com/project/qa-master-path/authentication/providers
2. Verifica:
   - [ ] **Email/Password** está HABILITADO
   - [ ] **Google** está HABILITADO (opcional pero recomendado)

**Si no está habilitado:**
1. Click en "Email/Password"
2. Toggle "Enable"
3. Save

---

## 🗄️ Verificación 4: Firebase Console - Firestore Rules

1. Ve a: https://console.firebase.google.com/project/qa-master-path/firestore/rules
2. Las reglas deberían ser similares a:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Si las reglas están muy restrictivas:**
- [ ] Publica las reglas correctas
- [ ] Wait 1-2 minutos para que se propaguen

---

## 📝 Verificación 5: Registro de Usuario

1. Abre: http://localhost:8000/app/auth.html
2. Click en tab "Registrarse"
3. Completa:
   - Nombre: Test User
   - Email: test@example.com
   - Contraseña: test123456
   - Confirmar: test123456
4. Click "Crear Cuenta"

**Verificar:**
- [ ] Mensaje verde: "¡Cuenta creada!"
- [ ] Redirige a: http://localhost:8000/index.html
- [ ] En consola (F12): `[SUCCESS] User registered successfully`
- [ ] No hay errores rojos en consola

**Si falla:**
- Revisa consola del navegador para error específico
- Revisa Network tab para ver qué request falló
- Verifica que Firebase API key sea correcta en firebase-config.js

---

## 🔑 Verificación 6: Login

1. Cierra sesión o abre ventana incógnito
2. Ve a: http://localhost:8000/app/auth.html
3. Ingresa:
   - Email: test@example.com
   - Contraseña: test123456
4. Click "Iniciar Sesión"

**Verificar:**
- [ ] Mensaje verde: "¡Bienvenido de vuelta!"
- [ ] Redirige al dashboard
- [ ] En consola: `[SUCCESS] Login successful`

---

## 🔐 Verificación 7: Login con Google

1. En http://localhost:8000/app/auth.html
2. Click botón "Google"
3. Selecciona cuenta de Google

**Verificar:**
- [ ] Popup de Google se abre
- [ ] Después de seleccionar cuenta, redirige al dashboard
- [ ] En consola: `[SUCCESS] Google login successful`

**Si el popup no abre:**
- Verifica que tu navegador permite popups para localhost
- Verifica que Google provider esté habilitado en Firebase Console

---

## 🛡️ Verificación 8: Protección de Rutas

**Prueba sin autenticar:**
1. Abre ventana incógnito
2. Intenta ir directo a: http://localhost:8000/index.html

**Verificar:**
- [ ] Redirige automáticamente a /app/auth.html
- [ ] No puedes ver el contenido del dashboard sin autenticarte

**Prueba autenticado:**
1. Autentícate normalmente
2. Ve a: http://localhost:8000/roadmap.html

**Verificar:**
- [ ] Puedes ver el contenido
- [ ] No te redirige al login

---

## 💾 Verificación 9: Sincronización con Firestore

1. Autenticado, ve a: http://localhost:8000/roadmap.html
2. Marca un módulo como completado (checkbox)
3. Refresca la página (F5)

**Verificar:**
- [ ] El módulo sigue marcado después del refresh
- [ ] En Firebase Console > Firestore > users > [tu_uid] > ves el campo "progress"

**En consola del navegador:**
- [ ] Ves mensaje: `[SUCCESS] Data synced with Firestore`

---

## 🗄️ Verificación 10: Datos en Firestore

1. Ve a: https://console.firebase.google.com/project/qa-master-path/firestore/data
2. Collection: `users`
3. Encuentra tu documento (el uid del usuario)

**Verificar estructura:**
```javascript
{
  email: "test@example.com",
  displayName: "Test User",
  createdAt: Timestamp,
  progress: {},
  subtasks: {},
  notes: {},
  badges: [],
  xp: 0,
  lastActive: Timestamp
}
```

- [ ] Documento existe
- [ ] Tiene todos los campos
- [ ] lastActive se actualiza cuando haces login

---

## 🔍 Verificación 11: Network Requests

1. Con DevTools abierto (F12)
2. Ve a tab Network
3. Refresca la página de login (http://localhost:8000/app/auth.html)

**Verificar que cargan exitosamente (Status 200):**
- [ ] `firebase-app.js`
- [ ] `firebase-auth.js`
- [ ] `firebase-firestore.js`
- [ ] Todos los archivos JS del proyecto

**Si alguno falla (404 o error):**
- Verifica la URL en Import Maps
- Verifica conectividad a internet (Firebase CDN)

---

## 🐛 Debugging: Errores Comunes

### Error: "Failed to resolve module specifier"
**Solución:**
```bash
# Verifica que Import Maps esté en CADA HTML
grep -r "importmap" /app/*.html
grep -r "importmap" /app/app/*.html
```

### Error: "auth/configuration-not-found"
**Solución:**
```bash
# Verifica firebase-config.js
cat /app/app/assets/js/firebase-config.js | grep apiKey
# Debe coincidir con tu proyecto en Firebase Console
```

### Error: "Missing or insufficient permissions"
**Solución:**
1. Ve a Firestore Rules en Firebase Console
2. Asegúrate que permites read/write para usuarios autenticados
3. Publica las reglas

### Error: Loop infinito de redirecciones
**Solución:**
```bash
# Verifica que requireAuth() y redirectIfAuthenticated() estén bien:
grep -n "requireAuth\|redirectIfAuthenticated" /app/app/assets/js/*.js

# dashboard-ui.js debe tener: requireAuth()
# auth-ui.js debe tener: redirectIfAuthenticated()
```

---

## ✅ RESUMEN: Todo Funciona Si...

- ✅ Puedes registrarte sin errores
- ✅ Puedes hacer login con email/password
- ✅ Puedes hacer login con Google (si está configurado)
- ✅ No puedes acceder a páginas protegidas sin autenticarte
- ✅ Los datos persisten después de refresh
- ✅ Ves el usuario en Firestore
- ✅ No hay errores rojos en consola del navegador

---

## 🎉 SIGUIENTE PASO

Si todo está ✅, tu autenticación Firebase está completamente funcional!

**Mejoras opcionales:**
1. Agregar recuperación de contraseña
2. Agregar verificación de email obligatoria
3. Agregar perfil de usuario editable
4. Agregar foto de perfil
5. Agregar logout button visible en navbar
6. Agregar loader mientras se verifica autenticación
7. Implementar refresh token automático

---

**¿Encontraste algún problema?**
Revisa el archivo: `/app/FIREBASE_AUTH_SETUP.md` para más detalles de debugging.
