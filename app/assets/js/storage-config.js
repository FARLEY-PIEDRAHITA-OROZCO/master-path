/**
 * CONFIGURACIÓN DE STORAGE
 * Feature flag para alternar entre Firebase Firestore y Backend Propio
 */

/**
 * Feature Flags
 * 
 * USE_BACKEND_STORAGE: 
 *   - true: Usa el backend propio (storage-service-v2.js)
 *   - false: Usa Firebase Firestore (storage.js)
 * 
 * Para cambiar entre uno y otro, simplemente modifica este valor
 */
export const STORAGE_CONFIG = {
  // 🚀 CAMBIAR AQUÍ para alternar entre Firebase y Backend Propio
  USE_BACKEND_STORAGE: true,  // true = Backend propio, false = Firebase
  
  // Sincronización automática
  AUTO_SYNC: true,  // Sincronizar automáticamente después de cada cambio
  
  // Intervalo de sincronización automática (en milisegundos)
  SYNC_INTERVAL: 60000,  // 60 segundos
  
  // Configuración de logging
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info'  // 'error', 'warn', 'info', 'debug'
  }
};

/**
 * Obtiene el servicio de storage según la configuración
 * 
 * @returns {Promise<Object>} El servicio de storage a usar
 */
export async function getStorageService() {
  if (STORAGE_CONFIG.USE_BACKEND_STORAGE) {
    console.log('💾 [STORAGE-CONFIG] Usando Backend Propio (FastAPI + MongoDB)');
    const { StorageServiceV2 } = await import('./storage-service-v2.js');
    return StorageServiceV2;
  } else {
    console.log('🔥 [STORAGE-CONFIG] Usando Firebase Firestore');
    const { StorageService } = await import('./storage.js');
    return StorageService;
  }
}

/**
 * Exporta el nombre del servicio activo (para debugging)
 */
export function getActiveStorageProvider() {
  return STORAGE_CONFIG.USE_BACKEND_STORAGE ? 'Backend MongoDB' : 'Firebase Firestore';
}

/**
 * Verifica si el backend storage está disponible
 */
export async function checkStorageHealth() {
  if (!STORAGE_CONFIG.USE_BACKEND_STORAGE) {
    return { available: true, message: 'Using Firebase Firestore' };
  }

  try {
    const token = localStorage.getItem('qa_access_token');
    
    if (!token) {
      return { 
        available: false, 
        message: 'Not authenticated - cannot access backend storage' 
      };
    }

    // Verificar que el backend responde
    const backendURL = window.BACKEND_URL || 'http://localhost:8001/api';
    const response = await fetch(`${backendURL}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { 
        available: true, 
        message: 'Backend storage available' 
      };
    }

    return { 
      available: false, 
      message: `Backend storage returned status ${response.status}` 
    };

  } catch (error) {
    return { 
      available: false, 
      message: `Backend storage not reachable: ${error.message}` 
    };
  }
}

// Log de configuración al cargar
console.log('⚙️ [STORAGE-CONFIG] Configuración cargada:', {
  provider: getActiveStorageProvider(),
  autoSync: STORAGE_CONFIG.AUTO_SYNC,
  syncInterval: `${STORAGE_CONFIG.SYNC_INTERVAL / 1000}s`
});
