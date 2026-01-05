/**
 * CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * Este archivo define las variables de configuración globales
 */

// Detectar la URL del backend según el entorno
function getBackendURL() {
  // Si estamos en el navegador
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Desarrollo local (Live Server, http-server, etc.)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168')) {
      // Intentar primero con el mismo puerto del frontend reemplazado por 8001
      // O usar la URL completa de Emergent si está disponible
      return 'http://localhost:8001/api';
    }
    
    // Producción o contenedor
    return 'http://localhost:8001/api';
  }
  
  // Default
  return 'http://localhost:8001/api';
}

// Configurar la URL del backend
window.BACKEND_URL = getBackendURL();

// Log de configuración
console.log('⚙️ [CONFIG] Backend URL configurado:', window.BACKEND_URL);
console.log('⚙️ [CONFIG] Hostname:', window.location.hostname);
console.log('⚙️ [CONFIG] Puerto:', window.location.port);
