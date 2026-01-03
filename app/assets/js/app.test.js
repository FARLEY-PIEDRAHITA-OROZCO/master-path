import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService, KEYS } from './storage.js';

// 1. MOCK DEL SERVICIO DE STORAGE
// Sustituimos el archivo real para controlar los datos de los tests
vi.mock('./storage.js', () => ({
  KEYS: {
    PROGRESS: 'qa_master_progress'
  },
  StorageService: {
    get: vi.fn() 
  }
}));

global.fetch = vi.fn();

// Datos simulados para el fetch
const mockModulesData = {
  modules: [
    { id: 1, phase: 'Core', title: 'Test Module 1', xp: 500 },
    { id: 2, phase: 'Core', title: 'Test Module 2', xp: 600 },
    { id: 3, phase: 'Technical', title: 'Test Module 3', xp: 800 }
  ],
  tools: [
    { category: 'api', name: 'Tool 1', desc: 'Description', url: '#', icon: 'fa-icon' }
  ]
};

// Implementación de AppEngine para tests
class AppEngine {
  constructor() {
    this.data = null;
    this.modules = [];
  }

  async init() {
    try {
      const response = await fetch('./app/assets/data/modules.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const jsonData = await response.json();
      this.data = jsonData;
      this.modules = jsonData.modules || [];
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getAnalytics() {
    const progress = StorageService.get(KEYS.PROGRESS) || {};
    const completedCount = Object.values(progress).filter(v => v === true).length;
    const totalXP = this.modules.reduce(
      (acc, m) => progress[m.id] ? acc + m.xp : acc,
      0
    );

    return {
      xp: totalXP,
      progressPercent: Math.round((completedCount / this.modules.length) * 100) || 0,
      completedCount
    };
  }

  getBadgeStatus() {
    const p = StorageService.get(KEYS.PROGRESS) || {};
    return {
      core: !!(p[1] && p[2]),
      technical: !!(p[3] && p[4] && p[5]),
      automation: !!(p[6] && p[7] && p[8] && p[9]),
      expert: !!(p[10] && p[11] && p[12])
    };
  }

  getModuleById(id) {
    return this.modules.find(m => m.id === id);
  }

  getModulesByPhase(phase) {
    return this.modules.filter(m => m.phase === phase);
  }

  getTotalXP() {
    return this.modules.reduce((acc, m) => acc + m.xp, 0);
  }
}

// ==================== TESTS ====================

// Englobamos todos los tests en un describe principal para compartir la variable 'engine'
describe('AppEngine System Tests', () => {
  let engine;

  beforeEach(() => {
    engine = new AppEngine();
    vi.clearAllMocks();
  });

  describe('init()', () => {
    it('debería cargar datos exitosamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });

      const result = await engine.init();
      expect(result.success).toBe(true);
      expect(engine.modules.length).toBe(3);
    });

    it('debería manejar error de red', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await engine.init();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getAnalytics() con Mocking Real', () => {
    beforeEach(async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });
      await engine.init();
    });

    it('debería calcular analytics al 100%', () => {
      StorageService.get.mockReturnValue({ 1: true, 2: true, 3: true });
      const analytics = engine.getAnalytics();
      expect(analytics.xp).toBe(1900);
      expect(analytics.progressPercent).toBe(100);
    });

    it('debería manejar progreso vacío', () => {
      StorageService.get.mockReturnValue({});
      const analytics = engine.getAnalytics();
      expect(analytics.xp).toBe(0);
      expect(analytics.progressPercent).toBe(0);
    });
  });

  describe('getBadgeStatus() con Mocking', () => {
    it('debería otorgar el badge "Core" solo cuando 1 y 2 son true', () => {
      StorageService.get.mockReturnValue({ 1: true, 2: true });
      
      // USAMOS LA INSTANCIA 'engine', NO LA CLASE
      const status = engine.getBadgeStatus(); 

      expect(status.core).toBe(true);
      expect(status.technical).toBeFalsy(); // Corregido: .toBeFalsy()
    });

    it('debería denegar "Technical" si falta el módulo 5', () => {
      StorageService.get.mockReturnValue({ 3: true, 4: true, 5: false });
      const status = engine.getBadgeStatus();
      expect(status.technical).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });
      await engine.init();
    });

    it('debería encontrar módulo por ID', () => {
      const module = engine.getModuleById(2);
      expect(module.title).toBe('Test Module 2');
    });

    it('debería calcular XP total disponible', () => {
      expect(engine.getTotalXP()).toBe(1900);
    });
  });
});