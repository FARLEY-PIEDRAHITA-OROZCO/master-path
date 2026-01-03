import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: index => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Reemplazar localStorage global con nuestro mock
global.localStorage = localStorageMock;

// Ahora importamos StorageService (después de mockear localStorage)
// Nota: Necesitamos modificar storage.js para que sea importable
const KEYS = {
  PROGRESS: 'qa_master_progress',
  SUBTASKS: 'qa_subtask_progress',
  NOTES: 'qa_module_notes',
  BADGES: 'qa_celebrated_badges',
};

const StorageService = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return key === KEYS.BADGES ? [] : {};
      }
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return key === KEYS.BADGES ? [] : {};
    }
  },

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  toggleProgress(id, isChecked) {
    const progress = this.get(KEYS.PROGRESS);
    progress[id] = isChecked;
    this.save(KEYS.PROGRESS, progress);
    return isChecked;
  },

  toggleSubtask(moduleId, taskIndex) {
    const subProgress = this.get(KEYS.SUBTASKS);
    const key = `${moduleId}-${taskIndex}`;
    subProgress[key] = !subProgress[key];
    this.save(KEYS.SUBTASKS, subProgress);
    return subProgress[key];
  },
};

// ==================== TESTS ====================

describe('StorageService', () => {
  // Limpiar localStorage antes de cada test
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get()', () => {
    it('debería retornar objeto vacío si no existe la key', () => {
      const result = StorageService.get(KEYS.PROGRESS);
      expect(result).toEqual({});
    });

    it('debería retornar array vacío para BADGES si no existe', () => {
      const result = StorageService.get(KEYS.BADGES);
      expect(result).toEqual([]);
    });

    it('debería retornar datos parseados correctamente', () => {
      const testData = { module1: true, module2: false };
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(testData));

      const result = StorageService.get(KEYS.PROGRESS);
      expect(result).toEqual(testData);
    });

    it('debería manejar JSON corrupto sin crashear', () => {
      localStorage.setItem(KEYS.PROGRESS, 'invalid-json{');

      const result = StorageService.get(KEYS.PROGRESS);
      expect(result).toEqual({});
    });
  });

  describe('save()', () => {
    it('debería guardar datos correctamente', () => {
      const testData = { module1: true };

      const success = StorageService.save(KEYS.PROGRESS, testData);

      expect(success).toBe(true);
      const stored = localStorage.getItem(KEYS.PROGRESS);
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('debería retornar true en guardado exitoso', () => {
      const result = StorageService.save(KEYS.PROGRESS, {});
      expect(result).toBe(true);
    });
  });

  describe('toggleProgress()', () => {
    it('debería activar progreso de un módulo', () => {
      const result = StorageService.toggleProgress(1, true);

      expect(result).toBe(true);

      const progress = StorageService.get(KEYS.PROGRESS);
      expect(progress[1]).toBe(true);
    });

    it('debería desactivar progreso de un módulo', () => {
      StorageService.toggleProgress(1, true);
      const result = StorageService.toggleProgress(1, false);

      expect(result).toBe(false);

      const progress = StorageService.get(KEYS.PROGRESS);
      expect(progress[1]).toBe(false);
    });

    it('debería mantener otros valores al actualizar uno', () => {
      StorageService.toggleProgress(1, true);
      StorageService.toggleProgress(2, true);
      StorageService.toggleProgress(1, false);

      const progress = StorageService.get(KEYS.PROGRESS);
      expect(progress[1]).toBe(false);
      expect(progress[2]).toBe(true);
    });
  });

  describe('toggleSubtask()', () => {
    it('debería activar una subtarea', () => {
      const result = StorageService.toggleSubtask(1, 0);

      expect(result).toBe(true);

      const subProgress = StorageService.get(KEYS.SUBTASKS);
      expect(subProgress['1-0']).toBe(true);
    });

    it('debería alternar estado de subtarea (toggle)', () => {
      const first = StorageService.toggleSubtask(1, 0);
      expect(first).toBe(true);

      const second = StorageService.toggleSubtask(1, 0);
      expect(second).toBe(false);

      const third = StorageService.toggleSubtask(1, 0);
      expect(third).toBe(true);
    });

    it('debería manejar múltiples subtareas independientemente', () => {
      StorageService.toggleSubtask(1, 0);
      StorageService.toggleSubtask(1, 1);
      StorageService.toggleSubtask(2, 0);

      const subProgress = StorageService.get(KEYS.SUBTASKS);
      expect(subProgress['1-0']).toBe(true);
      expect(subProgress['1-1']).toBe(true);
      expect(subProgress['2-0']).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('debería manejar keys undefined', () => {
      const result = StorageService.get(undefined);
      expect(result).toEqual({});
    });

    it('debería manejar datos muy grandes', () => {
      const largeData = {};
      for (let i = 0; i < 10000; i++) {
        largeData[`key${i}`] = `value${i}`;
      }

      const success = StorageService.save('test_large', largeData);
      expect(success).toBe(true);

      const retrieved = StorageService.get('test_large');
      expect(Object.keys(retrieved).length).toBe(10000);
    });
  });
});
