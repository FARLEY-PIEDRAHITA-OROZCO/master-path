/**
 * CONFIGURACIÓN DE AUTENTICACIÓN
 * Feature flag para alternar entre Firebase y Backend propio
 */

/**
 * Feature Flags
 * 
 * USE_BACKEND_AUTH: 
 *   - true: Usa el backend propio con JWT (auth-service-v2.js)
 *   - false: Usa Firebase Authentication (auth-service.js)
 * 
 * Para cambiar entre uno y otro, simplemente modifica este valor
 */
export const AUTH_CONFIG = {
  // 🚀 CAMBIAR AQUÍ para alternar entre Firebase y Backend Propio
  USE_BACKEND_AUTH: true,  // true = Backend propio, false = Firebase
  
  // URL del backend (solo se usa si USE_BACKEND_AUTH = true)
  BACKEND_URL: window.BACKEND_URL || 
               import.meta.env?.VITE_BACKEND_URL || 
               'http://localhost:8001/api',
  
  // Configuración de tokens
  TOKEN_CONFIG: {
    ACCESS_TOKEN_EXPIRE_MINUTES: 60,
    REFRESH_TOKEN_EXPIRE_DAYS: 7,
    AUTO_REFRESH: true,  // Auto-refrescar tokens antes de expirar
    REFRESH_THRESHOLD_MINUTES: 5  // Refrescar si expira en menos de 5 min
  },
  
  // Configuración de logging
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info'  // 'error', 'warn', 'info', 'debug'
  }
};

/**
 * Obtiene el servicio de autenticación según la configuración
 * 
 * @returns {Promise<Object>} El servicio de autenticación a usar
 */
export async function getAuthService() {
  if (AUTH_CONFIG.USE_BACKEND_AUTH) {
    console.log('🔐 [CONFIG] Usando Backend Propio (JWT)');
    const { authServiceV2 } = await import('./auth-service-v2.js');
    return authServiceV2;
  } else {
    console.log('🔥 [CONFIG] Usando Firebase Authentication');
    const { authService } = await import('./auth-service.js');
    return authService;
  }
}

/**
 * Exporta el nombre del servicio activo (para debugging)
 */
export function getActiveAuthProvider() {
  return AUTH_CONFIG.USE_BACKEND_AUTH ? 'Backend JWT' : 'Firebase';
}

/**
 * Verifica si el backend está disponible
 * Útil para mostrar avisos si el backend no responde
 */
export async function checkBackendHealth() {
  if (!AUTH_CONFIG.USE_BACKEND_AUTH) {
    return { available: true, message: 'Using Firebase' };
  }

  try {
    const response = await fetch(`${AUTH_CONFIG.BACKEND_URL.replace('/api', '')}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        available: true, 
        message: 'Backend available',
        data 
      };
    }

    return { 
      available: false, 
      message: `Backend returned status ${response.status}` 
    };

  } catch (error) {
    return { 
      available: false, 
      message: `Backend not reachable: ${error.message}` 
    };
  }
}

// Log de configuración al cargar
console.log('⚙️ [AUTH-CONFIG] Configuración cargada:', {
  provider: getActiveAuthProvider(),
  backendURL: AUTH_CONFIG.BACKEND_URL,
  autoRefresh: AUTH_CONFIG.TOKEN_CONFIG.AUTO_REFRESH
});
