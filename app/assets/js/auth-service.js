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
import { Logger } from './logger.js';

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
    console.log('🔥 [AUTH-SERVICE] Iniciando servicio de autenticación...');
    
    return new Promise((resolve, reject) => {
      try {
        // Timeout de 4 segundos para la inicialización
        const timeoutId = setTimeout(() => {
          if (!this.isInitialized) {
            console.error('❌ [AUTH-SERVICE] Timeout en inicialización de Firebase');
            reject(new Error('Firebase initialization timeout'));
          }
        }, 4000);
        
        onAuthStateChanged(auth, async (user) => {
          try {
            clearTimeout(timeoutId);
            
            if (user) {
              // Usuario logueado
              console.log('👤 [AUTH-SERVICE] Usuario detectado:', user.email);
              this.currentUser = await this.getUserData(user.uid);
              Logger.success('User authenticated', { 
                uid: user.uid, 
                email: user.email 
              });
            } else {
              // Usuario no logueado
              console.log('👤 [AUTH-SERVICE] No hay usuario autenticado');
              this.currentUser = null;
              Logger.info('User not authenticated');
            }

            // Notificar a callbacks
            this.onAuthChangeCallbacks.forEach(callback => callback(this.currentUser));

            if (!this.isInitialized) {
              this.isInitialized = true;
              resolve(this.currentUser);
            }
          } catch (error) {
            console.error('❌ [AUTH-SERVICE] Error en onAuthStateChanged:', error);
            if (!this.isInitialized) {
              this.isInitialized = true;
              reject(error);
            }
          }
        }, (error) => {
          // Callback de error de onAuthStateChanged
          console.error('❌ [AUTH-SERVICE] Error en Firebase Auth:', error);
          clearTimeout(timeoutId);
          if (!this.isInitialized) {
            this.isInitialized = true;
            reject(error);
          }
        });
      } catch (error) {
        console.error('❌ [AUTH-SERVICE] Error crítico en init():', error);
        reject(error);
      }
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