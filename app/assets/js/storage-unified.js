/**
 * STORAGE SERVICE - WRAPPER
 * Punto de entrada único que delega al servicio correcto según configuración
 * Mantiene compatibilidad con código existente
 */

import { STORAGE_CONFIG, getStorageService } from './storage-config.js';
import { Logger } from './logger.js';

/**
 * Servicio de Storage unificado
 * Delega al servicio correcto (Firebase o Backend) según configuración
 */
class UnifiedStorageService {
  constructor() {
    this.service = null;
    this.initialized = false;
  }

  /**
   * Inicializa el servicio correcto
   */
  async init() {
    if (this.initialized) {
      return true;
    }

    try {
      this.service = await getStorageService();
      
      if (this.service && typeof this.service.init === 'function') {
        this.service.init();
      }
      
      this.initialized = true;
      Logger.success('Unified Storage Service initialized', {
        provider: STORAGE_CONFIG.USE_BACKEND_STORAGE ? 'Backend' : 'Firebase'
      });
      
      return true;
    } catch (error) {
      Logger.error('Failed to initialize Unified Storage Service', { error });
      return false;
    }
  }

  /**
   * Obtiene datos del storage
   */
  get(key) {
    this._ensureInitialized();
    return this.service.get(key);
  }

  /**
   * Guarda datos en el storage
   */
  save(key, data) {
    this._ensureInitialized();
    return this.service.save(key, data);
  }

  /**
   * Alterna el progreso de un módulo
   */
  async toggleProgress(id, isChecked) {
    await this._ensureInitializedAsync();
    return this.service.toggleProgress(id, isChecked);
  }

  /**
   * Alterna el estado de una subtarea
   */
  async toggleSubtask(moduleId, taskIndex) {
    await this._ensureInitializedAsync();
    return this.service.toggleSubtask(moduleId, taskIndex);
  }

  /**
   * Guarda nota de un módulo
   */
  async saveNote(moduleId, noteText) {
    await this._ensureInitializedAsync();
    return this.service.saveNote(moduleId, noteText);
  }

  /**
   * Obtiene nota de un módulo
   */
  getNote(moduleId) {
    this._ensureInitialized();
    return this.service.getNote(moduleId);
  }

  /**
   * Agrega un badge (solo StorageServiceV2)
   */
  async addBadge(badgeName) {
    await this._ensureInitializedAsync();
    if (typeof this.service.addBadge === 'function') {
      return this.service.addBadge(badgeName);
    }
    Logger.warn('addBadge not available in current storage service');
    return false;
  }

  /**
   * Agrega XP (solo StorageServiceV2)
   */
  async addXP(amount) {
    await this._ensureInitializedAsync();
    if (typeof this.service.addXP === 'function') {
      return this.service.addXP(amount);
    }
    Logger.warn('addXP not available in current storage service');
    return false;
  }

  /**
   * Sincronización completa
   */
  async syncAll() {
    await this._ensureInitializedAsync();
    
    if (STORAGE_CONFIG.USE_BACKEND_STORAGE && typeof this.service.syncAll === 'function') {
      return this.service.syncAll();
    } else if (typeof this.service.syncWithFirestore === 'function') {
      // Firebase: sincronizar todos los datos
      const progress = this.service.get('qa_master_progress');
      const subtasks = this.service.get('qa_subtask_progress');
      const notes = this.service.get('qa_module_notes');
      
      await Promise.all([
        this.service.syncWithFirestore('qa_master_progress', progress),
        this.service.syncWithFirestore('qa_subtask_progress', subtasks),
        this.service.syncWithFirestore('qa_module_notes', notes),
      ]);
      
      return true;
    }
    
    Logger.warn('syncAll not available in current storage service');
    return false;
  }

  /**
   * Carga datos desde el backend/Firestore
   */
  async loadFromRemote() {
    await this._ensureInitializedAsync();
    
    if (STORAGE_CONFIG.USE_BACKEND_STORAGE && typeof this.service.loadFromBackend === 'function') {
      return this.service.loadFromBackend();
    } else if (typeof this.service.loadFromFirestore === 'function') {
      return this.service.loadFromFirestore();
    }
    
    Logger.warn('loadFromRemote not available in current storage service');
    return false;
  }

  /**
   * Exporta todos los datos
   */
  exportAll() {
    this._ensureInitialized();
    return this.service.exportAll();
  }

  /**
   * Importa datos exportados
   */
  importAll(exportedData) {
    this._ensureInitialized();
    return this.service.importAll(exportedData);
  }

  /**
   * Resetea todos los datos
   */
  async resetAll() {
    await this._ensureInitializedAsync();
    return this.service.resetAll();
  }

  /**
   * Obtiene timestamp de última sincronización
   */
  getLastSync() {
    this._ensureInitialized();
    if (typeof this.service.getLastSync === 'function') {
      return this.service.getLastSync();
    }
    return null;
  }

  /**
   * Asegura que el servicio esté inicializado (sync)
   */
  _ensureInitialized() {
    if (!this.initialized || !this.service) {
      throw new Error('Storage service not initialized. Call init() first.');
    }
  }

  /**
   * Asegura que el servicio esté inicializado (async)
   */
  async _ensureInitializedAsync() {
    if (!this.initialized || !this.service) {
      await this.init();
    }
  }
}

// Crear instancia única
const storageService = new UnifiedStorageService();

// Auto-inicializar
if (typeof window !== 'undefined') {
  storageService.init().catch(error => {
    Logger.error('Failed to auto-initialize storage service', { error });
  });
}

// Exportar instancia
export { storageService as StorageService };

// Exportar también las constantes necesarias
export { STORAGE_CONFIG } from './storage-config.js';
