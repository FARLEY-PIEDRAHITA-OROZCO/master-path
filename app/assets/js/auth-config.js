/**
 * CONFIGURACIÓN DE AUTENTICACIÓN
 * Sistema basado en cookies httpOnly del backend
 */

/**
 * Configuración de autenticación
 */
export const AUTH_CONFIG = {
  // Modo de autenticación: SOLO cookies del backend
  AUTH_MODE: 'cookies',  // 'cookies' = Backend con httpOnly cookies
  
  // URL del backend
  BACKEND_URL: window.BACKEND_URL || 
               import.meta.env?.VITE_BACKEND_URL || 
               'http://localhost:8001/api',
  
  // Configuración de logging
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info'  // 'error', 'warn', 'info', 'debug'
  }
};

/**
 * Obtiene el servicio de autenticación
 * Ahora siempre retorna el servicio basado en cookies
 * 
 * @returns {Promise<Object>} El servicio de autenticación
 */
export async function getAuthService() {
  console.log('🔐 [CONFIG] Usando Backend con Cookies httpOnly');
  const { authServiceCookies } = await import('./auth-service-cookies.js');
  return authServiceCookies;
}

/**
 * Exporta el nombre del servicio activo (para debugging)
 */
export function getActiveAuthProvider() {
  return 'Backend Cookies (httpOnly)';
}

/**
 * Verifica si el backend está disponible
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${AUTH_CONFIG.BACKEND_URL.replace('/api', '')}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'  // Incluir cookies
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
  mode: AUTH_CONFIG.AUTH_MODE,
  provider: getActiveAuthProvider(),
  backendURL: AUTH_CONFIG.BACKEND_URL
});
