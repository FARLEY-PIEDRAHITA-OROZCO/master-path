/**
 * STORAGE SERVICE V2 - QA MASTER PATH
 * Gestión de persistencia con LocalStorage (sin autenticación)
 * @module StorageServiceV2
 */

import { Logger } from './logger.js';

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

// ==================== VALIDATOR ====================

class Validator {
  static isValidKey(key) {
    return Object.values(KEYS).includes(key);
  }

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

  static isValidModuleId(id) {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0 && parsed <= 20;
  }

  static sanitizeText(text, maxLength = 5000) {
    if (typeof text !== 'string') return '';
    return text.trim().slice(0, maxLength);
  }
}

// ==================== STORAGE SERVICE V2 ====================

export const StorageServiceV2 = {
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
        mode: 'localStorage'
      });

      return true;
    } catch (error) {
      Logger.error('Failed to initialize StorageServiceV2', { error });
      return false;
    }
  },

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

  async toggleProgress(id, isChecked) {
    try {
      if (!Validator.isValidModuleId(id)) {
        Logger.warn('Invalid module ID for progress', { id });
        return false;
      }

      const progress = this.get(KEYS.PROGRESS);
      progress[id] = Boolean(isChecked);
      this.save(KEYS.PROGRESS, progress);

      this.updateLastSync();
      Logger.success('Progress saved', { moduleId: id, isChecked });

      return isChecked;
    } catch (error) {
      Logger.error('Error toggling progress', { id, isChecked, error });
      return false;
    }
  },

  async toggleSubtask(moduleId, taskIndex) {
    try {
      const subProgress = this.get(KEYS.SUBTASKS);
      const key = `${moduleId}-${taskIndex}`;
      subProgress[key] = !subProgress[key];
      const newState = subProgress[key];
      
      this.save(KEYS.SUBTASKS, subProgress);
      this.updateLastSync();
      Logger.success('Subtask saved', { moduleId, taskIndex, newState });

      return newState;
    } catch (error) {
      Logger.error('Error toggling subtask', { moduleId, taskIndex, error });
      return false;
    }
  },

  async saveNote(moduleId, noteText) {
    try {
      if (!Validator.isValidModuleId(moduleId)) {
        Logger.warn('Invalid module ID for note', { moduleId });
        return false;
      }

      const sanitized = Validator.sanitizeText(noteText);
      const notes = this.get(KEYS.NOTES);
      notes[moduleId] = sanitized;
      this.save(KEYS.NOTES, notes);
      this.updateLastSync();
      Logger.success('Note saved', { moduleId });

      return true;
    } catch (error) {
      Logger.error('Error saving note', { moduleId, error });
      return false;
    }
  },

  getNote(moduleId) {
    try {
      const notes = this.get(KEYS.NOTES);
      return notes[moduleId] || '';
    } catch (error) {
      Logger.error('Error getting note', { moduleId, error });
      return '';
    }
  },

  async addBadge(badgeName) {
    try {
      const badges = this.get(KEYS.BADGES);
      
      if (badges.includes(badgeName)) {
        Logger.info('Badge already exists', { badgeName });
        return true;
      }

      badges.push(badgeName);
      this.save(KEYS.BADGES, badges);
      this.updateLastSync();
      Logger.success('Badge added', { badgeName });

      return true;
    } catch (error) {
      Logger.error('Error adding badge', { badgeName, error });
      return false;
    }
  },

  async addXP(amount) {
    try {
      if (typeof amount !== 'number' || amount < 0) {
        Logger.warn('Invalid XP amount', { amount });
        return false;
      }

      const currentXP = this.get(KEYS.XP);
      const newXP = currentXP + amount;
      this.save(KEYS.XP, newXP);
      this.updateLastSync();
      Logger.success('XP added', { amount, newXP });

      return newXP;
    } catch (error) {
      Logger.error('Error adding XP', { amount, error });
      return false;
    }
  },

  updateLastSync() {
    const now = new Date().toISOString();
    this.save(KEYS.LAST_SYNC, now);
  },

  getLastSync() {
    return this.get(KEYS.LAST_SYNC);
  },

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

  async resetAll() {
    Logger.warn('Resetting all data...');

    Object.values(KEYS).forEach(key => {
      if (key !== KEYS.VERSION) {
        this.save(key, DEFAULT_VALUES[key] || {});
      }
    });

    Logger.success('All data reset to defaults');
  },

  migrate(fromVersion, toVersion) {
    Logger.info('Starting data migration', { fromVersion, toVersion });
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
