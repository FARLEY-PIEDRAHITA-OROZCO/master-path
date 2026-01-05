/**
 * CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * Este archivo define las variables de configuración globales
 */

// Configurar la URL del backend
window.BACKEND_URL = 'http://localhost:8001/api';

// Log de configuración
console.log('⚙️ [CONFIG] Backend URL configurado:', window.BACKEND_URL);

// Exportar configuración para módulos ES6
export const CONFIG = {
  BACKEND_URL: window.BACKEND_URL,
  ENVIRONMENT: 'development'
};
