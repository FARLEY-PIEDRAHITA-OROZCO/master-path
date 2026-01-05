/**
 * STORAGE SERVICE V2 - QA MASTER PATH
 * Gestión de persistencia con Backend Propio (FastAPI + MongoDB)
 * Reemplaza Firebase Firestore con backend JWT
 * @module StorageServiceV2
 */

import { Logger } from './logger.js';
import { AUTH_CONFIG } from './auth-config.js';

// ==================== CONFIGURACIÓN ====================

const KEYS = {
  PROGRESS: 'qa_master_progress',
  SUBTASKS: 'qa_subtask_progress',
  NOTES: 'qa_module_notes',
  BADGES: 'qa_celebrated_badges',
  XP: 'qa_user_xp',
  VERSION: 'qa_data_version',
  LAST_SYNC: 'qa_last_sync',
};

const CURRENT_VERSION = '2.0';

// Valores por defecto
const DEFAULT_VALUES = {
  [KEYS.PROGRESS]: {},
  [KEYS.SUBTASKS]: {},
  [KEYS.NOTES]: {},
  [KEYS.BADGES]: [],
  [KEYS.XP]: 0,
  [KEYS.VERSION]: CURRENT_VERSION,
  [KEYS.LAST_SYNC]: null,
};

// ==================== API CLIENT ====================

class StorageAPIClient {
  constructor() {
    this.baseURL = AUTH_CONFIG.BACKEND_URL;
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken() {
    return localStorage.getItem('qa_access_token');
  }

  /**
   * Realiza una petición HTTP al backend
   */
  async request(endpoint, options = {}) {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const url = `${this.baseURL}/progress${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      Logger.error('API request failed', { endpoint, error: error.message });
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// ==================== VALIDATOR ====================

class Validator {
  /**
   * Valida que una key sea válida
   */
  static isValidKey(key) {
    return Object.values(KEYS).includes(key);
  }

  /**
   * Valida estructura de datos
   */
  static validateDataStructure(key, data) {
    switch (key) {
      case KEYS.PROGRESS:
      case KEYS.SUBTASKS:
      case KEYS.NOTES:
        return typeof data === 'object' && !Array.isArray(data);

      case KEYS.BADGES:
        return Array.isArray(data);

      case KEYS.XP:
        return typeof data === 'number' && data >= 0;

      default:
        return true;
    }
  }

  /**
   * Valida un ID de módulo
   */
  static isValidModuleId(id) {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0 && parsed <= 20;
  }

  /**
   * Sanitiza texto
   */
  static sanitizeText(text, maxLength = 5000) {
    if (typeof text !== 'string') return '';
    return text.trim().slice(0, maxLength);
  }
}

// ==================== STORAGE SERVICE V2 ====================

export const StorageServiceV2 = {
  apiClient: new StorageAPIClient(),
  syncInProgress: false,

  /**
   * Inicializa el storage service
   */
  init() {
    try {
      const storedVersion = this.get(KEYS.VERSION);

      if (storedVersion !== CURRENT_VERSION) {
        Logger.info('Data version mismatch, migrating...', {
          from: storedVersion,
          to: CURRENT_VERSION,
        });
        this.migrate(storedVersion, CURRENT_VERSION);
      }

      Logger.success('StorageServiceV2 initialized', {
        version: CURRENT_VERSION,
        backend: AUTH_CONFIG.BACKEND_URL,
      });

      return true;
    } catch (error) {
      Logger.error('Failed to initialize StorageServiceV2', { error });
      return false;
    }
  },

  /**
   * Obtiene datos del localStorage
   */
  get(key) {
    try {
      if (!Validator.isValidKey(key)) {
        Logger.warn('Invalid storage key', { key });
        return DEFAULT_VALUES[key] || {};
      }

      const rawData = localStorage.getItem(key);

      if (rawData === null || rawData === undefined) {
        return DEFAULT_VALUES[key] || {};
      }

      const parsedData = JSON.parse(rawData);

      if (!Validator.validateDataStructure(key, parsedData)) {
        Logger.warn('Invalid data structure, using default', { key });
        return DEFAULT_VALUES[key] || {};
      }

      return parsedData;
    } catch (error) {
      Logger.error('Error getting data from storage', { key, error: error.message });
      return DEFAULT_VALUES[key] || {};
    }
  },

  /**
   * Guarda datos en localStorage
   */
  save(key, data) {
    try {
      if (!Validator.isValidKey(key)) {
        Logger.warn('Attempt to save with invalid key', { key });
        return false;
      }

      if (!Validator.validateDataStructure(key, data)) {
        Logger.error('Invalid data structure for key', { key });
        return false;
      }

      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);

      Logger.info('Data saved successfully', { key, size: serialized.length });

      return true;
    } catch (error) {
      Logger.error('Error saving data to storage', { key, error: error.message });
      return false;
    }
  },

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('qa_access_token');
    return !!token;
  },

  /**
   * Alterna el progreso de un módulo
   */
  async toggleProgress(id, isChecked) {
    try {
      if (!Validator.isValidModuleId(id)) {
        Logger.warn('Invalid module ID for progress', { id });
        return false;
      }

      // Actualizar localStorage
      const progress = this.get(KEYS.PROGRESS);
      progress[id] = Boolean(isChecked);
      this.save(KEYS.PROGRESS, progress);

      // Sincronizar con backend si está autenticado
      if (this.isAuthenticated()) {
        try {
          await this.apiClient.put('/module', {
            module_id: String(id),
            is_completed: Boolean(isChecked)
          });
          
          this.updateLastSync();
          Logger.success('Progress synced with backend', { moduleId: id, isChecked });
        } catch (error) {
          Logger.warn('Failed to sync progress with backend, using local only', { error: error.message });
        }
      }

      return isChecked;
    } catch (error) {
      Logger.error('Error toggling progress', { id, isChecked, error });
      return false;
    }
  },

  /**
   * Alterna el estado de una subtarea
   */
  async toggleSubtask(moduleId, taskIndex) {
    try {
      // Actualizar localStorage
      const subProgress = this.get(KEYS.SUBTASKS);
      const key = `${moduleId}-${taskIndex}`;
      subProgress[key] = !subProgress[key];
      const newState = subProgress[key];
      
      this.save(KEYS.SUBTASKS, subProgress);

      // Sincronizar con backend si está autenticado
      if (this.isAuthenticated()) {
        try {
          await this.apiClient.put('/subtask', {
            moduleId: String(moduleId),
            taskIndex: String(taskIndex),
            isCompleted: newState
          });
          
          this.updateLastSync();
          Logger.success('Subtask synced with backend', { moduleId, taskIndex, newState });
        } catch (error) {
          Logger.warn('Failed to sync subtask with backend, using local only', { error: error.message });
        }
      }

      return newState;
    } catch (error) {
      Logger.error('Error toggling subtask', { moduleId, taskIndex, error });
      return false;
    }
  },

  /**
   * Guarda nota de un módulo
   */
  async saveNote(moduleId, noteText) {
    try {
      if (!Validator.isValidModuleId(moduleId)) {
        Logger.warn('Invalid module ID for note', { moduleId });
        return false;
      }

      const sanitized = Validator.sanitizeText(noteText);
      
      // Actualizar localStorage
      const notes = this.get(KEYS.NOTES);
      notes[moduleId] = sanitized;
      this.save(KEYS.NOTES, notes);

      // Sincronizar con backend si está autenticado
      if (this.isAuthenticated()) {
        try {
          await this.apiClient.put('/note', {
            module_id: String(moduleId),
            note_text: sanitized
          });
          
          this.updateLastSync();
          Logger.success('Note synced with backend', { moduleId });
        } catch (error) {
          Logger.warn('Failed to sync note with backend, using local only', { error: error.message });
        }
      }

      return true;
    } catch (error) {
      Logger.error('Error saving note', { moduleId, error });
      return false;
    }
  },

  /**
   * Obtiene nota de un módulo
   */
  getNote(moduleId) {
    try {
      const notes = this.get(KEYS.NOTES);
      return notes[moduleId] || '';
    } catch (error) {
      Logger.error('Error getting note', { moduleId, error });
      return '';
    }
  },

  /**
   * Agrega un badge
   */
  async addBadge(badgeName) {
    try {
      const badges = this.get(KEYS.BADGES);
      
      if (badges.includes(badgeName)) {
        Logger.info('Badge already exists', { badgeName });
        return true;
      }

      badges.push(badgeName);
      this.save(KEYS.BADGES, badges);

      // Sincronizar con backend si está autenticado
      if (this.isAuthenticated()) {
        try {
          await this.apiClient.post('/badge', { badge_name: badgeName });
          this.updateLastSync();
          Logger.success('Badge synced with backend', { badgeName });
        } catch (error) {
          Logger.warn('Failed to sync badge with backend, using local only', { error: error.message });
        }
      }

      return true;
    } catch (error) {
      Logger.error('Error adding badge', { badgeName, error });
      return false;
    }
  },

  /**
   * Agrega XP
   */
  async addXP(amount) {
    try {
      if (typeof amount !== 'number' || amount < 0) {
        Logger.warn('Invalid XP amount', { amount });
        return false;
      }

      const currentXP = this.get(KEYS.XP);
      const newXP = currentXP + amount;
      this.save(KEYS.XP, newXP);

      // Sincronizar con backend si está autenticado
      if (this.isAuthenticated()) {
        try {
          await this.apiClient.post('/xp', { amount });
          this.updateLastSync();
          Logger.success('XP synced with backend', { amount, newXP });
        } catch (error) {
          Logger.warn('Failed to sync XP with backend, using local only', { error: error.message });
        }
      }

      return newXP;
    } catch (error) {
      Logger.error('Error adding XP', { amount, error });
      return false;
    }
  },

  /**
   * Sincronización completa con backend
   */
  async syncAll() {
    if (this.syncInProgress) {
      Logger.warn('Sync already in progress, skipping');
      return false;
    }

    if (!this.isAuthenticated()) {
      Logger.warn('Not authenticated, cannot sync with backend');
      return false;
    }

    this.syncInProgress = true;

    try {
      Logger.info('Starting full sync with backend...');

      // Preparar datos para sincronización
      const syncData = {
        modules: this.get(KEYS.PROGRESS),
        subtasks: this.get(KEYS.SUBTASKS),
        notes: this.get(KEYS.NOTES),
        badges: this.get(KEYS.BADGES),
        xp: this.get(KEYS.XP)
      };

      // Enviar al backend
      const response = await this.apiClient.post('/sync', syncData);

      this.updateLastSync();
      Logger.success('Full sync completed', { 
        syncedAt: response.synced_at || new Date().toISOString() 
      });

      return true;
    } catch (error) {
      Logger.error('Failed to sync all data', { error: error.message });
      return false;
    } finally {
      this.syncInProgress = false;
    }
  },

  /**
   * Carga datos desde el backend
   */
  async loadFromBackend() {
    if (!this.isAuthenticated()) {
      Logger.warn('Not authenticated, cannot load from backend');
      return false;
    }

    try {
      Logger.info('Loading data from backend...');

      // Obtener progreso completo del backend
      const data = await this.apiClient.get('');

      // Actualizar localStorage con datos del backend
      if (data.modules) {
        this.save(KEYS.PROGRESS, data.modules);
      }
      if (data.subtasks) {
        this.save(KEYS.SUBTASKS, data.subtasks);
      }
      if (data.notes) {
        this.save(KEYS.NOTES, data.notes);
      }
      if (data.badges) {
        this.save(KEYS.BADGES, data.badges);
      }
      if (typeof data.xp === 'number') {
        this.save(KEYS.XP, data.xp);
      }

      this.updateLastSync();
      Logger.success('Data loaded from backend successfully');

      return true;
    } catch (error) {
      Logger.error('Failed to load data from backend', { error: error.message });
      return false;
    }
  },

  /**
   * Actualiza timestamp de última sincronización
   */
  updateLastSync() {
    const now = new Date().toISOString();
    this.save(KEYS.LAST_SYNC, now);
  },

  /**
   * Obtiene timestamp de última sincronización
   */
  getLastSync() {
    return this.get(KEYS.LAST_SYNC);
  },

  /**
   * Exporta todos los datos
   */
  exportAll() {
    return {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      lastSync: this.getLastSync(),
      data: {
        progress: this.get(KEYS.PROGRESS),
        subtasks: this.get(KEYS.SUBTASKS),
        notes: this.get(KEYS.NOTES),
        badges: this.get(KEYS.BADGES),
        xp: this.get(KEYS.XP),
      },
    };
  },

  /**
   * Importa datos exportados
   */
  importAll(exportedData) {
    try {
      if (!exportedData || !exportedData.data) {
        throw new Error('Invalid export data');
      }

      const { data } = exportedData;

      this.save(KEYS.PROGRESS, data.progress || {});
      this.save(KEYS.SUBTASKS, data.subtasks || {});
      this.save(KEYS.NOTES, data.notes || {});
      this.save(KEYS.BADGES, data.badges || []);
      this.save(KEYS.XP, data.xp || 0);

      Logger.success('Data imported successfully');
      return true;
    } catch (error) {
      Logger.error('Failed to import data', { error });
      return false;
    }
  },

  /**
   * Resetea todos los datos
   */
  async resetAll() {
    Logger.warn('Resetting all data...');

    Object.values(KEYS).forEach(key => {
      if (key !== KEYS.VERSION) {
        this.save(key, DEFAULT_VALUES[key] || {});
      }
    });

    // Resetear en backend si está autenticado
    if (this.isAuthenticated()) {
      try {
        await this.apiClient.delete('');
        Logger.success('Backend data reset');
      } catch (error) {
        Logger.warn('Failed to reset backend data', { error: error.message });
      }
    }

    Logger.success('All data reset to defaults');
  },

  /**
   * Migra datos de una versión a otra
   */
  migrate(fromVersion, toVersion) {
    Logger.info('Starting data migration', { fromVersion, toVersion });

    // Migración de v1.0 (Firebase) a v2.0 (Backend)
    if (fromVersion === '1.0' && toVersion === '2.0') {
      // Los datos ya están en localStorage, solo cambiar versión
      Logger.info('Migrating from Firebase (v1.0) to Backend (v2.0)');
    }

    this.save(KEYS.VERSION, toVersion);
    Logger.success('Migration completed', { toVersion });
  },
};

// Exportar constantes
export { KEYS, Validator };

// Auto-inicializar
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  StorageServiceV2.init();
}
