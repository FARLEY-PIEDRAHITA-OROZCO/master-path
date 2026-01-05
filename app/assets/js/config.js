/**
 * CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * Este archivo define las variables de configuración globales
 */

// Detectar la URL del backend según el entorno
function getBackendURL() {
  // Si estamos en el navegador
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Preview de Emergent (*.preview.emergentagent.com)
    if (hostname.includes('preview.emergentagent.com') || hostname.includes('emergentagent.com')) {
      // En preview, el backend está en el mismo dominio en /api
      return `${protocol}//${hostname}/api`;
    }
    
    // Desarrollo local (Live Server, http-server, etc.)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168')) {
      return 'http://localhost:8001/api';
    }
    
    // Default: mismo dominio
    return '/api';
  }
  
  // Default
  return '/api';
}

// Configurar la URL del backend
window.BACKEND_URL = getBackendURL();

// Log de configuración
console.log('⚙️ [CONFIG] Backend URL configurado:', window.BACKEND_URL);
console.log('⚙️ [CONFIG] Hostname:', window.location.hostname);
console.log('⚙️ [CONFIG] Puerto:', window.location.port);
