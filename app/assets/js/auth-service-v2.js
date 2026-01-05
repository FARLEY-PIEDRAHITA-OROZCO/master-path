/**
 * AUTH SERVICE V2 - Backend Propio con JWT
 * Reemplazo de Firebase Authentication
 * Maneja autenticación con JWT tokens y backend FastAPI
 */

import { Logger } from './logger.js';

// Obtener URL del backend desde variables de entorno
const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL || 
                     window.BACKEND_URL || 
                     'http://localhost:8001/api';

/**
 * Token Manager
 * Maneja el almacenamiento y recuperación de tokens JWT
 */
class TokenManager {
  static TOKEN_KEY = 'qa_access_token';
  static REFRESH_TOKEN_KEY = 'qa_refresh_token';
  static USER_KEY = 'qa_current_user';

  /**
   * Guarda los tokens en localStorage
   */
  static saveTokens(accessToken, refreshToken) {
    try {
      console.log('💾 [TOKEN-MANAGER] Intentando guardar tokens...', {
        tokenKey: this.TOKEN_KEY,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken ? accessToken.length : 0
      });
      
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      console.log('✅ [TOKEN-MANAGER] Access token guardado');
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        console.log('✅ [TOKEN-MANAGER] Refresh token guardado');
      }
      
      // Verificar inmediatamente
      const saved = localStorage.getItem(this.TOKEN_KEY);
      console.log('🔍 [TOKEN-MANAGER] Verificación:', {
        tokenGuardado: !!saved,
        coincide: saved === accessToken
      });
      
      Logger.info('Tokens saved successfully');
      return true;
    } catch (error) {
      console.error('❌ [TOKEN-MANAGER] Error al guardar tokens:', error);
      Logger.error('Failed to save tokens', { error: error.message });
      return false;
    }
  }

  /**
   * Obtiene el access token
   */
  static getAccessToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el refresh token
   */
  static getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Elimina todos los tokens
   */
  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    Logger.info('Tokens cleared');
  }

  /**
   * Guarda datos del usuario
   */
  static saveUser(userData) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      Logger.error('Failed to save user data', { error: error.message });
      return false;
    }
  }

  /**
   * Obtiene datos del usuario guardados
   */
  static getUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      Logger.error('Failed to get user data', { error: error.message });
      return null;
    }
  }

  /**
   * Verifica si el token está expirado
   */
  static isTokenExpired(token) {
    if (!token) return true;

    try {
      // Decodificar el JWT (segunda parte es el payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a millisegundos
      const now = Date.now();

      // Considerar expirado si falta menos de 1 minuto
      return expirationTime - now < 60000;
    } catch (error) {
      Logger.error('Failed to check token expiration', { error: error.message });
      return true;
    }
  }
}

/**
 * API Client
 * Maneja las llamadas HTTP al backend
 */
class APIClient {
  /**
   * Realiza una petición HTTP al backend
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getAccessToken();

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token si existe
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Agregar body si existe
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      Logger.info('API Request', { method: config.method, url });

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP ${response.status}`);
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

  /**
   * POST request
   */
  static post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  /**
   * GET request
   */
  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * PUT request
   */
  static put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

/**
 * Servicio de Autenticación V2
 * Maneja todo lo relacionado con usuarios usando backend propio
 */
class AuthServiceV2 {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.onAuthChangeCallbacks = [];
  }

  /**
   * Inicializa el servicio de autenticación
   * Verifica si hay un token válido y carga el usuario
   */
  async init() {
    console.log('🔐 [AUTH-SERVICE-V2] Iniciando servicio de autenticación...');

    // Si ya está inicializado Y hay un currentUser, retornar
    // Pero siempre verificar que el token siga siendo válido
    if (this.isInitialized && this.currentUser) {
      const token = TokenManager.getAccessToken();
      if (token && !TokenManager.isTokenExpired(token)) {
        console.log('⚡ [AUTH-SERVICE-V2] Ya inicializado con usuario válido');
        return this.currentUser;
      }
      // Si el token expiró o no existe, reinicializar
      console.log('🔄 [AUTH-SERVICE-V2] Token cambió, reinicializando...');
      this.isInitialized = false;
    }

    try {
      const token = TokenManager.getAccessToken();

      if (!token) {
        console.log('👤 [AUTH-SERVICE-V2] No hay token, usuario no autenticado');
        this.currentUser = null;
        this.isInitialized = true;
        return null;
      }

      // Verificar si el token está expirado
      if (TokenManager.isTokenExpired(token)) {
        console.log('⏰ [AUTH-SERVICE-V2] Token expirado, intentando refresh...');
        const refreshed = await this.refreshAccessToken();
        
        if (!refreshed) {
          console.log('❌ [AUTH-SERVICE-V2] No se pudo refrescar el token');
          TokenManager.clearTokens();
          this.currentUser = null;
          this.isInitialized = true;
          return null;
        }
      }

      // Cargar datos del usuario actual
      const result = await APIClient.get('/auth/me');

      if (result.success && result.data.user) {
        this.currentUser = result.data.user;
        TokenManager.saveUser(this.currentUser);
        
        console.log('✅ [AUTH-SERVICE-V2] Usuario autenticado:', this.currentUser.email);
        Logger.success('User authenticated', { 
          id: this.currentUser.id, 
          email: this.currentUser.email 
        });
      } else {
        console.log('❌ [AUTH-SERVICE-V2] Token inválido');
        TokenManager.clearTokens();
        this.currentUser = null;
      }

      this.isInitialized = true;
      this.notifyAuthChange();
      return this.currentUser;

    } catch (error) {
      console.error('❌ [AUTH-SERVICE-V2] Error en inicialización:', error);
      this.currentUser = null;
      this.isInitialized = true;
      return null;
    }
  }

  /**
   * Registrar nuevo usuario
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

      // Guardar tokens y usuario
      const { access_token, refresh_token, user } = result.data;
      TokenManager.saveTokens(access_token, refresh_token);
      TokenManager.saveUser(user);
      
      this.currentUser = user;
      this.notifyAuthChange();

      Logger.success('User registered successfully', { id: user.id });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name
        }
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

      if (!result.success) {
        return {
          success: false,
          error: this.translateError(result.error)
        };
      }

      // Guardar tokens y usuario
      const { access_token, refresh_token, user } = result.data;
      
      console.log('🔐 [AUTH-SERVICE-V2] Guardando tokens...', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        hasUser: !!user
      });
      
      TokenManager.saveTokens(access_token, refresh_token);
      TokenManager.saveUser(user);
      
      // Verificar que se guardaron correctamente
      const savedToken = TokenManager.getAccessToken();
      console.log('✅ [AUTH-SERVICE-V2] Token guardado:', savedToken ? 'SÍ' : 'NO');
      
      this.currentUser = user;
      this.notifyAuthChange();

      Logger.success('Login successful', { id: user.id, email: user.email });

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
   * Refrescar el access token usando el refresh token
   */
  async refreshAccessToken() {
    try {
      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        console.log('❌ [AUTH-SERVICE-V2] No hay refresh token');
        return false;
      }

      const result = await APIClient.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      if (result.success && result.data.access_token) {
        TokenManager.saveTokens(result.data.access_token, refreshToken);
        Logger.success('Access token refreshed');
        return true;
      }

      return false;

    } catch (error) {
      Logger.error('Failed to refresh token', { error: error.message });
      return false;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      // Intentar notificar al backend (no crítico si falla)
      await APIClient.post('/auth/logout').catch(() => {});

      // Limpiar tokens y usuario
      TokenManager.clearTokens();
      this.currentUser = null;
      this.notifyAuthChange();

      Logger.success('Logout successful');

      return { success: true };

    } catch (error) {
      Logger.error('Logout failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Recuperar contraseña (placeholder - implementar cuando backend lo soporte)
   */
  async resetPassword(email) {
    try {
      // TODO: Implementar cuando el backend tenga este endpoint
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
   * Obtener datos del usuario actual
   */
  async getUserData() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const result = await APIClient.get('/user/me');
    
    if (result.success && result.data.user) {
      this.currentUser = result.data.user;
      TokenManager.saveUser(this.currentUser);
      return this.currentUser;
    }

    return null;
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(updates) {
    try {
      const result = await APIClient.put('/user/me', updates);

      if (result.success && result.data.user) {
        this.currentUser = result.data.user;
        TokenManager.saveUser(this.currentUser);
        this.notifyAuthChange();
        
        Logger.success('Profile updated');
        return { success: true, user: this.currentUser };
      }

      return { success: false, error: result.error };

    } catch (error) {
      Logger.error('Failed to update profile', { error: error.message });
      return { success: false, error: error.message };
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
    return this.currentUser !== null && TokenManager.getAccessToken() !== null;
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
      'invalid email': 'Email inválido',
      'invalid credentials': 'Email o contraseña incorrectos',
      'user not found': 'Usuario no encontrado',
      'incorrect password': 'Contraseña incorrecta',
      'password too weak': 'Contraseña muy débil',
      'user inactive': 'Usuario desactivado',
      'invalid token': 'Sesión expirada',
      'token expired': 'Sesión expirada'
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
export const authServiceV2 = new AuthServiceV2();

// Exportar también la clase para testing
export { AuthServiceV2, TokenManager, APIClient };
