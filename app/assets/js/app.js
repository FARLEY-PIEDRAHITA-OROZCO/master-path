/**
 * MAIN ENGINE - QA MASTER PATH
 * Responsabilidad: Coordinar datos, lógica de negocio y UI.
 */
import { StorageService, KEYS } from './storage.js';

export const AppEngine = {
  data: null,
  modules: [],

  async init() {
    try {
      const response = await fetch('./app/assets/data/modules.json');
      const jsonData = await response.json();
      this.data = jsonData;
      this.modules = jsonData.modules || [];

      console.log(
        '🚀 Engine Ready. Modules:',
        this.modules.length,
        'Tools:',
        this.data.tools?.length
      );
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  },

  getAnalytics() {
    const progress = StorageService.get(KEYS.PROGRESS);
    const completedCount = Object.values(progress).filter(v => v === true).length;
    const totalXP = this.modules.reduce((acc, m) => (progress[m.id] ? acc + m.xp : acc), 0);

    return {
      xp: totalXP,
      progressPercent: Math.round((completedCount / this.modules.length) * 100) || 0,
      completedCount,
    };
  },

  getBadgeStatus() {
    const p = StorageService.get(KEYS.PROGRESS);
    return {
      core: p[1] && p[2],
      technical: p[3] && p[4] && p[5],
      automation: p[6] && p[7] && p[8] && p[9],
      expert: p[10] && p[11] && p[12],
    };
  },
};
