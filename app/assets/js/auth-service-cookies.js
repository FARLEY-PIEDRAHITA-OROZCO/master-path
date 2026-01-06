/**
 * AUTH SERVICE - Backend con Cookies httpOnly
 * Sistema de autenticación basado puramente en cookies
 * NO usa localStorage - Las cookies se manejan automáticamente por el navegador
 */

import { Logger } from './logger.js';

// Obtener URL del backend
const API_BASE_URL = window.BACKEND_URL || 'http://localhost:8001/api';

/**
 * API Client para requests con cookies
 */
class APIClient {
  /**
   * Realiza una petición HTTP al backend
   * Las cookies se envían automáticamente con credentials: 'include'
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',  // CRÍTICO: Envía cookies automáticamente
      ...options,
    };

    // Agregar body si existe
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      Logger.info('API Request', { method: config.method, url });

      const response = await fetch(url, config);
      
      // Intentar parsear JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = data?.detail || data?.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      Logger.success('API Response', { status: response.status });
      return { success: true, data };

    } catch (error) {
      Logger.error('API Request failed', { 
        url, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  static post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

/**
 * Servicio de Autenticación basado en Cookies
 * Simple y seguro - el backend maneja todo
 */
class AuthServiceCookies {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.onAuthChangeCallbacks = [];
  }

  /**
   * Inicializa el servicio de autenticación
   * Verifica si hay una sesión activa consultando /auth/me
   */
  async init() {
    console.log('🔐 [AUTH-SERVICE-COOKIES] Inicializando...');

    // Si ya está inicializado y tenemos usuario, retornar
    if (this.isInitialized && this.currentUser) {
      console.log('⚡ [AUTH-SERVICE-COOKIES] Ya inicializado');
      return this.currentUser;
    }

    try {
      // Verificar sesión con el backend
      const result = await APIClient.get('/auth/me');

      if (result.success && result.data.user) {
        this.currentUser = result.data.user;
        console.log('✅ [AUTH-SERVICE-COOKIES] Usuario autenticado:', this.currentUser.email);
        
        Logger.success('User authenticated', { 
          id: this.currentUser.id, 
          email: this.currentUser.email 
        });
      } else {
        console.log('👤 [AUTH-SERVICE-COOKIES] No hay sesión activa');
        this.currentUser = null;
      }

      this.isInitialized = true;
      this.notifyAuthChange();
      return this.currentUser;

    } catch (error) {
      console.error('❌ [AUTH-SERVICE-COOKIES] Error en inicialización:', error);
      this.currentUser = null;
      this.isInitialized = true;
      return null;
    }
  }

  /**
   * Registrar nuevo usuario
   * El backend establece la cookie automáticamente
   */
  async register(email, password, displayName) {
    try {
      Logger.info('Registering new user', { email });

      // Validaciones básicas
      if (!email || !password || !displayName) {
        return {
          success: false,
          error: 'Todos los campos son requeridos'
        };
      }

      if (password.length < 8) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres'
        };
      }

      // Llamar al endpoint de registro
      const result = await APIClient.post('/auth/register', {
        email,
        password,
        display_name: displayName
      });

      if (!result.success) {
        return {
          success: false,
          error: this.translateError(result.error)
        };
      }

      // El backend ya estableció la cookie
      // Solo guardamos el usuario en memoria
      this.currentUser = result.data.user;
      this.notifyAuthChange();

      Logger.success('User registered successfully', { id: this.currentUser.id });

      return {
        success: true,
        user: this.currentUser
      };

    } catch (error) {
      Logger.error('Registration failed', { error: error.message });
      return {
        success: false,
        error: 'Error al registrar usuario'
      };
    }
  }

  /**
   * Login con email/password
   * El backend establece la cookie automáticamente
   */
  async login(email, password) {
    try {
      Logger.info('Logging in user', { email });

      // Validaciones
      if (!email || !password) {
        return {
          success: false,
          error: 'Email y contraseña son requeridos'
        };
      }

      // Llamar al endpoint de login
      const result = await APIClient.post('/auth/login', {
        email,
        password
      });

      console.log('🌐 [AUTH-SERVICE-COOKIES] Respuesta del backend:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      });

      if (!result.success) {
        return {
          success: false,
          error: this.translateError(result.error)
        };
      }

      // El backend ya estableció la cookie httpOnly
      // Solo guardamos el usuario en memoria
      this.currentUser = result.data.user;
      this.notifyAuthChange();

      Logger.success('Login successful', { id: this.currentUser.id, email: this.currentUser.email });

      return {
        success: true,
        user: this.currentUser
      };

    } catch (error) {
      Logger.error('Login failed', { error: error.message });
      return {
        success: false,
        error: 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Cerrar sesión
   * El backend limpia la cookie automáticamente
   */
  async logout() {
    try {
      console.log('🚪 [AUTH-SERVICE-COOKIES] Iniciando logout...');
      
      // Llamar al endpoint de logout (limpia cookies en el backend)
      await APIClient.post('/auth/logout');

      // Limpiar usuario en memoria
      this.currentUser = null;
      this.isInitialized = false;
      
      console.log('✅ [AUTH-SERVICE-COOKIES] Sesión cerrada');
      
      // Notificar a los listeners
      this.notifyAuthChange();

      Logger.success('Logout successful');

      return { success: true };

    } catch (error) {
      Logger.error('Logout failed', { error: error.message });
      // Aunque falle, limpiar localmente
      this.currentUser = null;
      this.isInitialized = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar estado de sesión
   */
  async checkSession() {
    try {
      const result = await APIClient.get('/auth/verify');
      
      if (result.success && result.data.authenticated) {
        // Actualizar usuario si cambió
        if (!this.currentUser || this.currentUser.id !== result.data.user_id) {
          await this.init();
        }
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email) {
    try {
      Logger.info('Password reset requested', { email });

      return {
        success: true,
        message: 'Funcionalidad en desarrollo'
      };

    } catch (error) {
      Logger.error('Password reset failed', { error: error.message });
      return {
        success: false,
        error: 'Error al recuperar contraseña'
      };
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
   * Notificar a todos los callbacks de cambios de autenticación
   */
  notifyAuthChange() {
    this.onAuthChangeCallbacks.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        Logger.error('Error in auth change callback', { error: error.message });
      }
    });
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

  /**
   * Traducir errores del backend a español
   */
  translateError(error) {
    const errorMap = {
      'email already registered': 'Este email ya está registrado',
      'el email ya está registrado': 'Este email ya está registrado',
      'invalid email': 'Email inválido',
      'invalid credentials': 'Email o contraseña incorrectos',
      'email o contraseña incorrectos': 'Email o contraseña incorrectos',
      'user not found': 'Usuario no encontrado',
      'incorrect password': 'Contraseña incorrecta',
      'password too weak': 'Contraseña muy débil',
      'user inactive': 'Usuario desactivado',
      'usuario inactivo': 'Usuario desactivado',
      'invalid token': 'Sesión expirada',
      'token expired': 'Sesión expirada',
      'no se encontró token': 'Sesión expirada'
    };

    const lowerError = error.toLowerCase();
    
    for (const [key, value] of Object.entries(errorMap)) {
      if (lowerError.includes(key)) {
        return value;
      }
    }

    return error || 'Error desconocido';
  }
}

// Exportar instancia única (singleton)
export const authServiceCookies = new AuthServiceCookies();

// Exportar también la clase para testing
export { AuthServiceCookies, APIClient };
