/**
 * STORAGE SERVICE - QA MASTER PATH
 * Gestión segura y robusta de persistencia con LocalStorage
 * @module StorageService
 */

// ==================== CONFIGURACIÓN ====================

const KEYS = {
  PROGRESS: 'qa_master_progress',
  SUBTASKS: 'qa_subtask_progress',
  NOTES: 'qa_module_notes',
  BADGES: 'qa_celebrated_badges',
  VERSION: 'qa_data_version',
};

const CURRENT_VERSION = '1.0';

// Valores por defecto para cada tipo de key
const DEFAULT_VALUES = {
  [KEYS.PROGRESS]: {},
  [KEYS.SUBTASKS]: {},
  [KEYS.NOTES]: {},
  [KEYS.BADGES]: [],
  [KEYS.VERSION]: CURRENT_VERSION,
};

// ==================== LOGGER ====================

class Logger {
  static log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data,
    };

    // En desarrollo, mostrar en consola con colores
    const colors = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      success: '\x1b[32m', // Green
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    console.log(`${color}[${level.toUpperCase()}]${reset}`, message, data);

    // En producción, podrías enviar a servicio de logging
    // this.sendToServer(logEntry);
  }

  static info(message, data) {
    this.log('info', message, data);
  }

  static warn(message, data) {
    this.log('warn', message, data);
  }

  static error(message, data) {
    this.log('error', message, data);
  }

  static success(message, data) {
    this.log('success', message, data);
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
   * Valida que los datos tengan la estructura esperada
   */
  static validateDataStructure(key, data) {
    switch (key) {
      case KEYS.PROGRESS:
      case KEYS.SUBTASKS:
      case KEYS.NOTES:
        return typeof data === 'object' && !Array.isArray(data);

      case KEYS.BADGES:
        return Array.isArray(data);

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
   * Sanitiza input de texto
   */
  static sanitizeText(text, maxLength = 5000) {
    if (typeof text !== 'string') return '';
    return text.trim().slice(0, maxLength);
  }
}

// ==================== STORAGE SERVICE ====================

export const StorageService = {
  /**
   * Inicializa el storage service
   * Verifica versión de datos y migra si es necesario
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

      Logger.success('StorageService initialized', {
        version: CURRENT_VERSION,
      });

      return true;
    } catch (error) {
      Logger.error('Failed to initialize StorageService', { error });
      return false;
    }
  },

  /**
   * Obtiene datos del localStorage con validación y manejo de errores
   * @param {string} key - Clave del localStorage
   * @returns {Object|Array} Datos parseados o valor por defecto
   */
  get(key) {
    try {
      // Validar key
      if (!Validator.isValidKey(key)) {
        Logger.warn('Invalid storage key', { key });
        return DEFAULT_VALUES[key] || {};
      }

      // Intentar obtener datos
      const rawData = localStorage.getItem(key);

      // Si no existe, retornar valor por defecto
      if (rawData === null || rawData === undefined) {
        return DEFAULT_VALUES[key] || {};
      }

      // Parsear JSON
      const parsedData = JSON.parse(rawData);

      // Validar estructura
      if (!Validator.validateDataStructure(key, parsedData)) {
        Logger.warn('Invalid data structure, using default', {
          key,
          receivedType: typeof parsedData,
        });
        return DEFAULT_VALUES[key] || {};
      }

      return parsedData;
    } catch (error) {
      Logger.error('Error getting data from storage', {
        key,
        error: error.message,
        stack: error.stack,
      });

      // Intentar recuperar el dato corrupto
      this.handleCorruptedData(key);

      return DEFAULT_VALUES[key] || {};
    }
  },

  /**
   * Guarda datos en localStorage con validación
   * @param {string} key - Clave del localStorage
   * @param {Object|Array} data - Datos a guardar
   * @returns {boolean} true si se guardó exitosamente
   */
  save(key, data) {
    try {
      // Validar key
      if (!Validator.isValidKey(key)) {
        Logger.warn('Attempt to save with invalid key', { key });
        return false;
      }

      // Validar estructura de datos
      if (!Validator.validateDataStructure(key, data)) {
        Logger.error('Invalid data structure for key', {
          key,
          dataType: typeof data,
        });
        return false;
      }

      // Crear backup antes de guardar (solo para datos importantes)
      if (key === KEYS.PROGRESS || key === KEYS.SUBTASKS) {
        this.createBackup(key);
      }

      // Serializar y guardar
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);

      Logger.info('Data saved successfully', {
        key,
        size: serialized.length,
      });

      return true;
    } catch (error) {
      // Manejar quota exceeded error
      if (error.name === 'QuotaExceededError') {
        Logger.error('LocalStorage quota exceeded', {
          key,
          dataSize: JSON.stringify(data).length,
        });

        // Intentar limpiar datos viejos
        this.cleanup();

        // Reintentar
        try {
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (retryError) {
          Logger.error('Failed to save even after cleanup', { retryError });
          return false;
        }
      }

      Logger.error('Error saving data to storage', {
        key,
        error: error.message,
      });

      return false;
    }
  },

  /**
   * Alterna el progreso de un módulo
   * @param {number|string} id - ID del módulo
   * @param {boolean} isChecked - Estado del checkbox
   * @returns {boolean} Nuevo estado
   */
  toggleProgress(id, isChecked) {
    try {
      // Validar ID
      if (!Validator.isValidModuleId(id)) {
        Logger.warn('Invalid module ID for progress', { id });
        return false;
      }

      const progress = this.get(KEYS.PROGRESS);
      progress[id] = Boolean(isChecked);

      const saved = this.save(KEYS.PROGRESS, progress);

      if (saved) {
        Logger.info('Progress toggled', { moduleId: id, isChecked });
      }

      return isChecked;
    } catch (error) {
      Logger.error('Error toggling progress', { id, isChecked, error });
      return false;
    }
  },

  /**
   * Alterna el estado de una subtarea
   * @param {number|string} moduleId - ID del módulo
   * @param {number|string} taskIndex - Índice de la tarea
   * @returns {boolean} Nuevo estado
   */
  toggleSubtask(moduleId, taskIndex) {
    try {
      const subProgress = this.get(KEYS.SUBTASKS);
      const key = `${moduleId}-${taskIndex}`;

      subProgress[key] = !subProgress[key];

      const saved = this.save(KEYS.SUBTASKS, subProgress);

      if (saved) {
        Logger.info('Subtask toggled', { moduleId, taskIndex, newState: subProgress[key] });
      }

      return subProgress[key];
    } catch (error) {
      Logger.error('Error toggling subtask', { moduleId, taskIndex, error });
      return false;
    }
  },

  /**
   * Guarda nota de un módulo con sanitización
   * @param {number|string} moduleId - ID del módulo
   * @param {string} noteText - Texto de la nota
   * @returns {boolean} true si se guardó exitosamente
   */
  saveNote(moduleId, noteText) {
    try {
      if (!Validator.isValidModuleId(moduleId)) {
        Logger.warn('Invalid module ID for note', { moduleId });
        return false;
      }

      const sanitized = Validator.sanitizeText(noteText);
      const notes = this.get(KEYS.NOTES);
      notes[moduleId] = sanitized;

      return this.save(KEYS.NOTES, notes);
    } catch (error) {
      Logger.error('Error saving note', { moduleId, error });
      return false;
    }
  },

  /**
   * Obtiene nota de un módulo
   * @param {number|string} moduleId - ID del módulo
   * @returns {string} Texto de la nota o string vacío
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

  // ==================== UTILIDADES ====================

  /**
   * Crea backup de una key específica
   */
  createBackup(key) {
    try {
      const data = this.get(key);
      const backupKey = `${key}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(data));

      // Mantener solo los últimos 3 backups
      this.cleanOldBackups(key);
    } catch (error) {
      Logger.warn('Failed to create backup', { key, error });
    }
  },

  /**
   * Limpia backups antiguos
   */
  cleanOldBackups(key) {
    const backupPattern = `${key}_backup_`;
    const allBackups = [];

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey.startsWith(backupPattern)) {
        allBackups.push({
          key: storageKey,
          timestamp: parseInt(storageKey.split('_').pop(), 10),
        });
      }
    }

    // Ordenar por timestamp descendente y mantener solo 3
    allBackups.sort((a, b) => b.timestamp - a.timestamp);
    allBackups.slice(3).forEach(backup => {
      localStorage.removeItem(backup.key);
    });
  },

  /**
   * Maneja datos corruptos intentando recuperación
   */
  handleCorruptedData(key) {
    Logger.warn('Attempting to recover corrupted data', { key });

    // Buscar backup más reciente
    const backupPattern = `${key}_backup_`;
    let latestBackup = null;
    let latestTimestamp = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey.startsWith(backupPattern)) {
        const timestamp = parseInt(storageKey.split('_').pop(), 10);
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestBackup = storageKey;
        }
      }
    }

    // Si encontramos backup, restaurarlo
    if (latestBackup) {
      try {
        const backupData = localStorage.getItem(latestBackup);
        localStorage.setItem(key, backupData);
        Logger.success('Data recovered from backup', {
          key,
          backupKey: latestBackup,
        });
      } catch (error) {
        Logger.error('Failed to recover from backup', { error });
      }
    }
  },

  /**
   * Limpia localStorage de datos temporales
   */
  cleanup() {
    Logger.info('Starting storage cleanup...');

    // Eliminar backups muy antiguos (más de 7 días)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (key && key.includes('_backup_')) {
        const timestamp = parseInt(key.split('_').pop(), 10);

        if (timestamp < sevenDaysAgo) {
          localStorage.removeItem(key);
          Logger.info('Removed old backup', { key });
        }
      }
    }
  },

  /**
   * Migra datos de una versión a otra
   */
  migrate(fromVersion, toVersion) {
    Logger.info('Starting data migration', { fromVersion, toVersion });

    // Por ahora no hay migraciones necesarias
    // En el futuro, aquí irían las transformaciones de datos

    this.save(KEYS.VERSION, toVersion);
    Logger.success('Migration completed', { toVersion });
  },

  /**
   * Exporta todos los datos del usuario
   * @returns {Object} Todos los datos
   */
  exportAll() {
    return {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        progress: this.get(KEYS.PROGRESS),
        subtasks: this.get(KEYS.SUBTASKS),
        notes: this.get(KEYS.NOTES),
        badges: this.get(KEYS.BADGES),
      },
    };
  },

  /**
   * Importa datos exportados
   * @param {Object} exportedData - Datos a importar
   * @returns {boolean} true si se importó exitosamente
   */
  importAll(exportedData) {
    try {
      if (!exportedData || !exportedData.data) {
        throw new Error('Invalid export data');
      }

      // Crear backup antes de importar
      Object.values(KEYS).forEach(key => {
        if (key !== KEYS.VERSION) {
          this.createBackup(key);
        }
      });

      // Importar cada tipo de dato
      const { data } = exportedData;

      this.save(KEYS.PROGRESS, data.progress || {});
      this.save(KEYS.SUBTASKS, data.subtasks || {});
      this.save(KEYS.NOTES, data.notes || {});
      this.save(KEYS.BADGES, data.badges || []);

      Logger.success('Data imported successfully');
      return true;
    } catch (error) {
      Logger.error('Failed to import data', { error });
      return false;
    }
  },

  /**
   * Resetea todos los datos (con confirmación)
   */
  resetAll() {
    Logger.warn('Resetting all data...');

    Object.values(KEYS).forEach(key => {
      if (key !== KEYS.VERSION) {
        this.save(key, DEFAULT_VALUES[key] || {});
      }
    });

    Logger.success('All data reset to defaults');
  },
};

// Exportar también las constantes para uso en otros módulos
export { KEYS, Logger, Validator };

// Auto-inicializar cuando se carga el módulo
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  StorageService.init();
}
