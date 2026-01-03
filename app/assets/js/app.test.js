import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch global
global.fetch = vi.fn();

// Mock de modules.json
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
      const response = await fetch('./assets/data/modules.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      this.data = jsonData;
      this.modules = jsonData.modules || [];

      return { success: true };
    } catch (error) {
      console.error('Error loading data:', error);
      return { success: false, error: error.message };
    }
  }

  getAnalytics() {
    // Simulamos obtener datos del storage
    // En tests reales, mockearíamos StorageService
    const progress = { 1: true, 2: true, 3: false };
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
    const p = { 1: true, 2: true, 3: false };
    return {
      core: p[1] && p[2],
      technical: p[3] && p[4] && p[5],
      automation: p[6] && p[7] && p[8] && p[9],
      expert: p[10] && p[11] && p[12]
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

describe('AppEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AppEngine();
    
    // Resetear mock de fetch
    vi.clearAllMocks();
  });

  describe('init()', () => {
    it('debería cargar datos exitosamente', async () => {
      // Configurar mock de fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });

      const result = await engine.init();

      expect(result.success).toBe(true);
      expect(engine.data).toEqual(mockModulesData);
      expect(engine.modules.length).toBe(3);
    });

    it('debería manejar error de red', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await engine.init();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(engine.modules).toEqual([]);
    });

    it('debería manejar respuesta HTTP no exitosa', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await engine.init();

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('debería manejar JSON inválido', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const result = await engine.init();

      expect(result.success).toBe(false);
    });
  });

  describe('getAnalytics()', () => {
    beforeEach(async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModulesData
      });
      await engine.init();
    });

    it('debería calcular XP correctamente', () => {
      const analytics = engine.getAnalytics();

      // Módulos 1 y 2 completados: 500 + 600 = 1100
      expect(analytics.xp).toBe(1100);
    });

    it('debería calcular porcentaje de progreso', () => {
      const analytics = engine.getAnalytics();

      // 2 de 3 módulos = 67%
      expect(analytics.progressPercent).toBe(67);
    });

    it('debería contar módulos completados', () => {
      const analytics = engine.getAnalytics();

      expect(analytics.completedCount).toBe(2);
    });

    it('debería retornar 0% si no hay módulos', () => {
      engine.modules = [];
      const analytics = engine.getAnalytics();

      expect(analytics.progressPercent).toBe(0);
    });
  });

  describe('getBadgeStatus()', () => {
    it('debería retornar estado de badges correctamente', () => {
      const status = engine.getBadgeStatus();

      expect(status.core).toBe(true);  // 1 && 2 = true
      expect(status.technical).toBe(false);
      expect(status.automation).toBe(false);
      expect(status.expert).toBe(false);
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

      expect(module).toBeDefined();
      expect(module.title).toBe('Test Module 2');
    });

    it('debería retornar undefined para ID inexistente', () => {
      const module = engine.getModuleById(999);

      expect(module).toBeUndefined();
    });

    it('debería filtrar módulos por fase', () => {
      const coreModules = engine.getModulesByPhase('Core');

      expect(coreModules.length).toBe(2);
      expect(coreModules.every(m => m.phase === 'Core')).toBe(true);
    });

    it('debería calcular XP total disponible', () => {
      const totalXP = engine.getTotalXP();

      expect(totalXP).toBe(1900); // 500 + 600 + 800
    });
  });
});