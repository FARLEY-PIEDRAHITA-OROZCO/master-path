# 🔐 SPRINT 2: SISTEMA DE AUTENTICACIÓN (Semanas 3-4)

[← Volver al Roadmap Principal](./ROADMAP_DETALLADO.md)

---

## 📋 OBJETIVOS DEL SPRINT 2

- ✅ Implementar sistema de autenticación
- ✅ Crear backend con FastAPI
- ✅ Configurar MongoDB
- ✅ Sincronizar progreso entre dispositivos
- ✅ Implementar perfiles de usuario

---

## 🎯 DECISIÓN ESTRATÉGICA: ¿Firebase o Backend Custom?

Antes de empezar, debes decidir qué opción usar:

### Opción A: Firebase (⭐ Recomendado para comenzar)

**✅ Pros:**
- Setup en 10 minutos
- No necesitas escribir backend
- Escalabilidad automática
- Authentication + Database incluido
- Gratis hasta cierto límite

**❌ Contras:**
- Menos control
- Vendor lock-in (dependes de Google)
- Costos pueden subir con escala

**📊 Ideal para:** Prototipos, MVPs, equipos pequeños

---

### Opción B: Backend Custom (FastAPI + MongoDB)

**✅ Pros:**
- Control total
- Sin costos de terceros
- Customizable al 100%
- Aprenderás backend completo

**❌ Contras:**
- Más código que escribir
- Necesitas manejar servidor
- Más complejo de mantener

**📊 Ideal para:** Productos a largo plazo, necesidades específicas

---

## 📌 RUTA A: IMPLEMENTACIÓN CON FIREBASE

### TAREA 2A.1: Configurar Firebase Project

#### 🎓 CONCEPTO: ¿Qué es Firebase?

Firebase es una plataforma de Google que provee:
- **Authentication**: Login con email, Google, Facebook, etc.
- **Firestore**: Base de datos NoSQL en tiempo real
- **Hosting**: Hosting gratuito para tu app
- **Analytics**: Métricas de uso

#### 📝 PASO A PASO

**Paso 1: Crear proyecto en Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project"
3. Nombre: `qa-master-path`
4. Habilitar Google Analytics: No (por ahora)
5. Crear proyecto

**Paso 2: Registrar app web**

1. En la página del proyecto, click en el ícono Web `</>`
2. App nickname: `QA Master Path Web`
3. NO marcar "Firebase Hosting" aún
4. Click en "Register app"
5. **IMPORTANTE**: Copiar el config object que aparece

Deberías ver algo como:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
  authDomain: "qa-master-path.firebaseapp.com",
  projectId: "qa-master-path",
  storageBucket: "qa-master-path.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Paso 3: Habilitar métodos de autenticación**

1. En el menú lateral: Build > Authentication
2. Click en "Get Started"
3. Pestaña "Sign-in method"
4. Habilitar:
   - ✅ Email/Password
   - ✅ Google (más popular)
5. Para Google:
   - Click en Google
   - Enable
   - Project support email: tu email
   - Save

**Paso 4: Configurar Firestore Database**

1. En el menú lateral: Build > Firestore Database
2. Click en "Create database"
3. Modo: **Start in test mode** (cambiaremos las reglas luego)
4. Location: Elegir más cercano (ej: us-east1)
5. Enable

---

### TAREA 2A.2: Instalar y Configurar Firebase SDK

#### 📝 PASO A PASO

**Paso 1: Instalar Firebase**

```bash
cd /app
npm install firebase
```

**Paso 2: Crear archivo de configuración**

Crear `/app/assets/js/firebase-config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ IMPORTANTE: Estas credenciales NO son secretas para apps web
// Son públicas por naturaleza. La seguridad se maneja con reglas de Firestore
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Verificar inicialización
console.log('🔥 Firebase initialized:', app.name);
```

**⚠️ Reemplaza los valores con los de tu proyecto Firebase**

**Paso 3: Crear servicio de autenticación**

Crear `/app/assets/js/auth-service.js`:

```javascript
import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Logger } from './storage.js';

/**
 * Servicio de Autenticación
 * Maneja todo lo relacionado con usuarios
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.onAuthChangeCallbacks = [];
  }

  /**
   * Inicializa el servicio y escucha cambios de autenticación
   */
  init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Usuario logueado
          this.currentUser = await this.getUserData(user.uid);
          Logger.success('User authenticated', { 
            uid: user.uid, 
            email: user.email 
          });
        } else {
          // Usuario no logueado
          this.currentUser = null;
          Logger.info('User not authenticated');
        }

        // Notificar a callbacks
        this.onAuthChangeCallbacks.forEach(callback => callback(this.currentUser));

        if (!this.isInitialized) {
          this.isInitialized = true;
          resolve(this.currentUser);
        }
      });
    });
  }

  /**
   * Registrar nuevo usuario con email/password
   */
  async register(email, password, displayName) {
    try {
      Logger.info('Registering new user', { email });

      // Validaciones
      if (!email || !password || !displayName) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      const user = userCredential.user;

      // Actualizar perfil con nombre
      await updateProfile(user, {
        displayName: displayName
      });

      // Crear documento de usuario en Firestore
      await this.createUserDocument(user.uid, {
        email,
        displayName,
        createdAt: serverTimestamp(),
        progress: {},
        subtasks: {},
        notes: {},
        badges: [],
        xp: 0,
        settings: {
          notifications: true,
          theme: 'dark'
        }
      });

      // Enviar email de verificación
      await sendEmailVerification(user);

      Logger.success('User registered successfully', { uid: user.uid });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName
        }
      };

    } catch (error) {
      Logger.error('Registration failed', { error: error.message });

      // Mensajes de error en español
      const errorMessages = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'Contraseña muy débil',
        'auth/operation-not-allowed': 'Operación no permitida'
      };

      return {
        success: false,
        error: errorMessages[error.code] || error.message
      };
    }
  }

  /**
   * Login con email/password
   */
  async login(email, password) {
    try {
      Logger.info('Logging in user', { email });

      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      // Actualizar última vez activo
      await this.updateLastActive(userCredential.user.uid);

      Logger.success('Login successful', { uid: userCredential.user.uid });

      return {
        success: true,
        user: userCredential.user
      };

    } catch (error) {
      Logger.error('Login failed', { error: error.message });

      const errorMessages = {
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
      };

      return {
        success: false,
        error: errorMessages[error.code] || 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Login con Google
   */
  async loginWithGoogle() {
    try {
      Logger.info('Logging in with Google');

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar si es primera vez del usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Primera vez - crear documento
        await this.createUserDocument(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          provider: 'google',
          progress: {},
          subtasks: {},
          notes: {},
          badges: [],
          xp: 0
        });
      } else {
        // Usuario existente - actualizar última vez activo
        await this.updateLastActive(user.uid);
      }

      Logger.success('Google login successful', { uid: user.uid });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };

    } catch (error) {
      Logger.error('Google login failed', { error: error.message });

      return {
        success: false,
        error: error.code === 'auth/popup-closed-by-user' 
          ? 'Login cancelado' 
          : 'Error al iniciar sesión con Google'
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      Logger.success('Logout successful');

      return { success: true };

    } catch (error) {
      Logger.error('Logout failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      
      Logger.success('Password reset email sent', { email });

      return {
        success: true,
        message: 'Email de recuperación enviado'
      };

    } catch (error) {
      Logger.error('Password reset failed', { error: error.message });

      return {
        success: false,
        error: 'Error al enviar email de recuperación'
      };
    }
  }

  /**
   * Obtener datos completos del usuario
   */
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        Logger.warn('User document not found', { uid });
        return null;
      }

      const userData = userDoc.data();
      
      return {
        uid,
        ...userData,
        // Convertir timestamps de Firestore a Date
        createdAt: userData.createdAt?.toDate(),
        lastActive: userData.lastActive?.toDate()
      };

    } catch (error) {
      Logger.error('Error fetching user data', { uid, error: error.message });
      return null;
    }
  }

  /**
   * Crear documento de usuario en Firestore
   */
  async createUserDocument(uid, userData) {
    try {
      await setDoc(doc(db, 'users', uid), userData);
      Logger.success('User document created', { uid });
    } catch (error) {
      Logger.error('Error creating user document', { uid, error: error.message });
      throw error;
    }
  }

  /**
   * Actualizar última vez activo
   */
  async updateLastActive(uid) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastActive: serverTimestamp()
      });
    } catch (error) {
      Logger.warn('Failed to update lastActive', { uid });
    }
  }

  /**
   * Registrar callback para cambios de autenticación
   */
  onAuthChange(callback) {
    this.onAuthChangeCallbacks.push(callback);
    
    // Si ya hay un usuario, llamar inmediatamente
    if (this.currentUser) {
      callback(this.currentUser);
    }

    // Retornar función para desuscribir
    return () => {
      const index = this.onAuthChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onAuthChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Verificar si hay usuario logueado
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }
}

// Exportar instancia única (singleton)
export const authService = new AuthService();

// Auto-inicializar
authService.init();
```

#### ✅ VALIDACIÓN

Crear archivo de prueba `/app/test-firebase.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Test Firebase</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-md mx-auto">
        <h1 class="text-2xl font-bold mb-4">Test Firebase Auth</h1>
        
        <div id="status" class="p-4 rounded mb-4 bg-gray-800">
            Status: Cargando...
        </div>

        <button onclick="testLogin()" class="bg-blue-600 px-4 py-2 rounded">
            Test Login con Google
        </button>
    </div>

    <script type="module">
        import { authService } from './assets/js/auth-service.js';

        window.testLogin = async () => {
            const result = await authService.loginWithGoogle();
            document.getElementById('status').innerHTML = 
                `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        };

        authService.onAuthChange((user) => {
            document.getElementById('status').innerHTML = user 
                ? `Logueado como: ${user.email}`
                : 'No autenticado';
        });
    </script>
</body>
</html>
```

Abrir en navegador: `file:///app/test-firebase.html`

---

### TAREA 2A.3: Crear UI de Login/Registro

#### 📝 PASO A PASO

**Paso 1: Crear página de auth**

Crear `/app/auth.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión | QA Master Path</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/style.css">
</head>
<body class="bg-slate-950 text-slate-300 min-h-screen flex items-center justify-center p-6">

    <!-- Contenedor principal -->
    <div class="w-full max-w-md">
        
        <!-- Logo y título -->
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/40">
                <span class="text-2xl font-black text-white italic">QA</span>
            </div>
            <h1 class="text-3xl font-black text-white italic uppercase tracking-tight">
                QA Master <span class="text-blue-600">Path</span>
            </h1>
            <p class="text-slate-500 text-sm mt-2">
                Inicia sesión para guardar tu progreso
            </p>
        </div>

        <!-- Card de autenticación -->
        <div class="glass-panel rounded-[2.5rem] border border-white/5 p-8">
            
            <!-- Tabs: Login / Register -->
            <div class="flex gap-2 mb-6 bg-white/[0.02] rounded-2xl p-1">
                <button 
                    id="tab-login" 
                    class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all tab-active"
                    onclick="switchTab('login')">
                    Iniciar Sesión
                </button>
                <button 
                    id="tab-register" 
                    class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                    onclick="switchTab('register')">
                    Registrarse
                </button>
            </div>

            <!-- Mensajes de error/éxito -->
            <div id="message" class="hidden mb-4 p-4 rounded-2xl text-sm"></div>

            <!-- Formulario de Login -->
            <form id="form-login" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input 
                        type="email" 
                        id="login-email"
                        class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition"
                        placeholder="tu@email.com"
                        required>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Contraseña
                    </label>
                    <input 
                        type="password" 
                        id="login-password"
                        class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition"
                        placeholder="••••••••"
                        required>
                </div>

                <div class="flex justify-between items-center text-xs">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="rounded">
                        <span class="text-slate-500">Recordarme</span>
                    </label>
                    <a href="#" onclick="showResetPassword()" class="text-blue-500 hover:text-blue-400">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                <button 
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl uppercase tracking-wider transition-all shadow-lg shadow-blue-900/30">
                    Iniciar Sesión
                </button>
            </form>

            <!-- Formulario de Registro -->
            <form id="form-register" class="space-y-4 hidden">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Nombre Completo
                    </label>
                    <input 
                        type="text" 
                        id="register-name"
                        class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition"
                        placeholder="Juan Pérez"
                        required>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input 
                        type="email" 
                        id="register-email"
                        class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition"
                        placeholder="tu@email.com"
                        required>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Contraseña
                    </label>
                    <input 
                        type="password" 
                        id="register-password"
                        class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition"
                        placeholder="Mínimo 6 caracteres"
                        required>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Confirmar Contraseña
                    </label>
                    <input 
                        type="password" 
                        id="register-password-confirm"
                        class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition"
                        placeholder="Repite tu contraseña"
                        required>
                </div>

                <button 
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl uppercase tracking-wider transition-all shadow-lg shadow-blue-900/30">
                    Crear Cuenta
                </button>
            </form>

            <!-- Divider -->
            <div class="flex items-center gap-4 my-6">
                <div class="flex-1 h-px bg-white/5"></div>
                <span class="text-xs text-slate-600 uppercase tracking-widest">O continúa con</span>
                <div class="flex-1 h-px bg-white/5"></div>
            </div>

            <!-- Login con Google -->
            <button 
                id="btn-google"
                class="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-white font-bold py-4 rounded-2xl uppercase tracking-wider transition-all flex items-center justify-center gap-3">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
            </button>

        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-600 mt-6">
            Al continuar, aceptas nuestros 
            <a href="#" class="text-blue-500">Términos de Servicio</a> y 
            <a href="#" class="text-blue-500">Política de Privacidad</a>
        </p>

    </div>

    <!-- Script -->
    <script type="module" src="assets/js/auth-ui.js"></script>

</body>
</html>
```

**Paso 2: Crear lógica de UI**

Crear `/app/assets/js/auth-ui.js`:

```javascript
import { authService } from './auth-service.js';

// ==================== ELEMENTOS DOM ====================

const elements = {
  // Tabs
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),

  // Forms
  formLogin: document.getElementById('form-login'),
  formRegister: document.getElementById('form-register'),

  // Inputs Login
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),

  // Inputs Register
  registerName: document.getElementById('register-name'),
  registerEmail: document.getElementById('register-email'),
  registerPassword: document.getElementById('register-password'),
  registerPasswordConfirm: document.getElementById('register-password-confirm'),

  // Buttons
  btnGoogle: document.getElementById('btn-google'),

  // Message
  message: document.getElementById('message')
};

// ==================== TAB SWITCHING ====================

window.switchTab = (tab) => {
  if (tab === 'login') {
    elements.tabLogin.classList.add('tab-active');
    elements.tabRegister.classList.remove('tab-active');
    elements.formLogin.classList.remove('hidden');
    elements.formRegister.classList.add('hidden');
  } else {
    elements.tabRegister.classList.add('tab-active');
    elements.tabLogin.classList.remove('tab-active');
    elements.formRegister.classList.remove('hidden');
    elements.formLogin.classList.add('hidden');
  }
  hideMessage();
};

// ==================== MESSAGES ====================

function showMessage(message, type = 'info') {
  elements.message.classList.remove('hidden');
  elements.message.className = `mb-4 p-4 rounded-2xl text-sm ${
    type === 'error' 
      ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
      : type === 'success'
      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
      : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
  }`;
  elements.message.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} mr-2"></i>
    ${message}
  `;
}

function hideMessage() {
  elements.message.classList.add('hidden');
}

// ==================== FORM HANDLERS ====================

elements.formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  // Validación básica
  if (!email || !password) {
    showMessage('Por favor completa todos los campos', 'error');
    return;
  }

  // Mostrar loading
  showMessage('Iniciando sesión...', 'info');

  // Intentar login
  const result = await authService.login(email, password);

  if (result.success) {
    showMessage('¡Bienvenido de vuelta!', 'success');
    
    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } else {
    showMessage(result.error, 'error');
  }
});

elements.formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = elements.registerName.value.trim();
  const email = elements.registerEmail.value.trim();
  const password = elements.registerPassword.value;
  const passwordConfirm = elements.registerPasswordConfirm.value;

  // Validaciones
  if (!name || !email || !password || !passwordConfirm) {
    showMessage('Por favor completa todos los campos', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    showMessage('Las contraseñas no coinciden', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  // Mostrar loading
  showMessage('Creando cuenta...', 'info');

  // Intentar registro
  const result = await authService.register(email, password, name);

  if (result.success) {
    showMessage('¡Cuenta creada! Revisa tu email para verificar tu cuenta.', 'success');
    
    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 2000);
  } else {
    showMessage(result.error, 'error');
  }
});

// Login con Google
elements.btnGoogle.addEventListener('click', async () => {
  showMessage('Abriendo ventana de Google...', 'info');

  const result = await authService.loginWithGoogle();

  if (result.success) {
    showMessage('¡Bienvenido!', 'success');
    
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } else {
    showMessage(result.error, 'error');
  }
});

// Reset password
window.showResetPassword = () => {
  const email = prompt('Ingresa tu email para recuperar tu contraseña:');
  
  if (email) {
    authService.resetPassword(email).then(result => {
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.error, 'error');
      }
    });
  }
};

// Estilos para tab activo
const style = document.createElement('style');
style.textContent = `
  .tab-active {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
`;
document.head.appendChild(style);
```

#### ✅ VALIDACIÓN

1. Abrir `auth.html` en navegador
2. Intentar registrar una cuenta
3. Verificar que se crea en Firebase Console
4. Probar login
5. Probar login con Google

---

### TAREA 2A.4: Proteger Rutas y Sincronizar Datos

#### 📝 PASO A PASO

**Paso 1: Crear guard de autenticación**

Crear `/app/assets/js/auth-guard.js`:

```javascript
import { authService } from './auth-service.js';

/**
 * Protege una página requiriendo autenticación
 */
export function requireAuth() {
  // Esperar a que el auth service se inicialice
  authService.init().then((user) => {
    if (!user) {
      // No autenticado - redirigir a login
      const currentPath = window.location.pathname;
      window.location.href = `/auth.html?redirect=${encodeURIComponent(currentPath)}`;
    }
  });
}

/**
 * Redirige al dashboard si ya está autenticado
 */
export function redirectIfAuthenticated() {
  authService.init().then((user) => {
    if (user) {
      // Ya autenticado - redirigir a dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/index.html';
      window.location.href = redirect;
    }
  });
}
```

**Paso 2: Proteger páginas principales**

Agregar al final de `/app/assets/js/dashboard-ui.js`:

```javascript
import { requireAuth } from './auth-guard.js';

// Requerir autenticación para esta página
requireAuth();
```

Lo mismo en:
- `/app/assets/js/roadmap-ui.js`
- `/app/assets/js/toolbox-ui.js`
- `/app/assets/js/docs-ui.js`

**Paso 3: Sincronizar StorageService con Firestore**

Actualizar `/app/assets/js/storage.js`, agregar al final:

```javascript
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase-config.js';
import { authService } from './auth-service.js';

// Método para sincronizar con Firestore
StorageService.syncWithFirestore = async function(key, data) {
  try {
    const user = authService.getCurrentUser();
    
    if (!user) {
      // No autenticado - solo guardar local
      return this.save(key, data);
    }

    // Guardar localmente
    const saved = this.save(key, data);

    // Sincronizar con Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const fieldName = key.replace('qa_', '').replace('_', '');

    await updateDoc(userDocRef, {
      [fieldName]: data,
      lastSync: new Date().toISOString()
    });

    Logger.success('Data synced with Firestore', { key });

    return saved;

  } catch (error) {
    Logger.error('Failed to sync with Firestore', { key, error });
    // No fallar, al menos tenemos copia local
    return true;
  }
};

// Método para cargar desde Firestore
StorageService.loadFromFirestore = async function() {
  try {
    const user = authService.getCurrentUser();
    
    if (!user) {
      Logger.info('No user logged in, using local data');
      return false;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      Logger.warn('User document not found in Firestore');
      return false;
    }

    const data = userDoc.data();

    // Cargar cada tipo de dato
    if (data.progress) {
      this.save(KEYS.PROGRESS, data.progress);
    }
    if (data.subtasks) {
      this.save(KEYS.SUBTASKS, data.subtasks);
    }
    if (data.notes) {
      this.save(KEYS.NOTES, data.notes);
    }
    if (data.badges) {
      this.save(KEYS.BADGES, data.badges);
    }

    Logger.success('Data loaded from Firestore');
    return true;

  } catch (error) {
    Logger.error('Failed to load from Firestore', { error });
    return false;
  }
};

// Auto-cargar datos cuando el usuario inicia sesión
authService.onAuthChange(async (user) => {
  if (user) {
    await StorageService.loadFromFirestore();
  }
});
```

**Paso 4: Actualizar métodos para usar sync**

En `/app/assets/js/storage.js`, actualizar los métodos:

```javascript
toggleProgress(id, isChecked) {
  try {
    if (!Validator.isValidModuleId(id)) {
      Logger.warn('Invalid module ID for progress', { id });
      return false;
    }

    const progress = this.get(KEYS.PROGRESS);
    progress[id] = Boolean(isChecked);
    
    // Usar syncWithFirestore en vez de save
    const saved = this.syncWithFirestore(KEYS.PROGRESS, progress);
    
    if (saved) {
      Logger.info('Progress toggled', { moduleId: id, isChecked });
    }

    return isChecked;

  } catch (error) {
    Logger.error('Error toggling progress', { id, isChecked, error });
    return false;
  }
}

// Similar para toggleSubtask y saveNote...
```

#### ✅ VALIDACIÓN

1. Login en la app
2. Completar un módulo
3. Cerrar sesión
4. Abrir en otro navegador/dispositivo
5. Login con la misma cuenta
6. Verificar que el progreso se sincronizó ✅

---

## 🎉 FIN DE LA RUTA A (Firebase)

Continúa con [Sprint 3](./ROADMAP_SPRINT_3.md) →

---

## 📌 RUTA B: BACKEND CUSTOM (FastAPI + MongoDB)

[Esta ruta se desarrollará en un documento separado para mantener la claridad]

---

