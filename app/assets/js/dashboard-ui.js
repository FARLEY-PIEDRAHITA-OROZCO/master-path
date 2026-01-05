/* global confetti */
import { AppEngine } from './app.js';
import { StorageService } from './storage-unified.js';
import { KEYS } from './storage-service-v2.js';
import { UIComponents } from './components.js';
import { requireAuth } from './auth-guard-v2.js';

// ⚠️ CRÍTICO: Verificar autenticación PRIMERO antes de cargar nada
requireAuth();

// Solo cargar el dashboard después de que se verifique la autenticación
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar el motor (Cargar JSON)
  UIComponents.init();
  await AppEngine.init();

  // Renderizar Dashboard
  refreshDashboard();
  
  // Actualizar cada 5 segundos para mantener sincronizado
  setInterval(refreshDashboard, 5000);
});

function refreshDashboard() {
  const stats = AppEngine.getAnalytics();

  // Actualizar Progreso con animación
  const bar = document.getElementById('global-progress-bar');
  const txt = document.getElementById('global-progress-text');
  const xpText = document.getElementById('user-xp');
  const rankText = document.getElementById('rank-name');

  if (bar) {
    bar.style.width = `${stats.progressPercent}%`;
  }
  if (txt) {
    animateNumber(txt, stats.progressPercent, '%');
  }
  if (xpText) {
    animateNumber(xpText, stats.xp, '');
  }

  // Rango dinámico con color
  const ranks = [
    { min: 10000, name: 'Senior QA Automation', color: 'text-purple-500' },
    { min: 5000, name: 'QA Engineer Mid', color: 'text-blue-500' },
    { min: 1000, name: 'Technical QA Tester', color: 'text-cyan-500' },
    { min: 0, name: 'Junior Talent', color: 'text-slate-400' },
  ];
  const currentRank = ranks.find(r => stats.xp >= r.min);
  if (rankText) {
    rankText.textContent = currentRank.name;
    rankText.className = `${currentRank.color} font-bold uppercase tracking-widest`;
  }

  // "Continuar donde lo dejaste" - si hay módulos incompletos
  const firstIncomplete = AppEngine.getAllModules().find(m => !m.isComplete);
  const continueSection = document.getElementById('continue-section');
  
  if (firstIncomplete && continueSection) {
    continueSection.classList.remove('hidden');
    const titleEl = document.getElementById('continue-module-title');
    const progressEl = document.getElementById('continue-module-progress');
    
    if (titleEl) {
      titleEl.textContent = firstIncomplete.title;
    }
    if (progressEl) {
      const total = firstIncomplete.tasks.length;
      const completed = firstIncomplete.tasks.filter(t => t.isComplete).length;
      progressEl.textContent = `${completed} de ${total} tareas completadas`;
    }
  } else if (continueSection) {
    continueSection.classList.add('hidden');
  }

  // Estadísticas
  updateStatistics(stats);

  // Progreso por fase
  updatePhaseProgress();

  // Badges
  updateBadges(stats.badges);
}

function updateStatistics(stats) {
  const completedCount = document.getElementById('completed-count');
  const completedPercentage = document.getElementById('completed-percentage');
  const timeRemaining = document.getElementById('time-remaining');
  const timeCompleted = document.getElementById('time-completed');
  const streakCount = document.getElementById('streak-count');

  if (completedCount) {
    animateNumber(completedCount, stats.completedModules, '');
  }
  if (completedPercentage) {
    completedPercentage.textContent = `${stats.progressPercent}% del total`;
  }

  // Tiempo
  const totalHours = stats.totalEstimatedMinutes / 60;
  const completedHours = stats.completedEstimatedMinutes / 60;
  const remainingHours = totalHours - completedHours;

  if (timeRemaining) {
    timeRemaining.textContent = `${Math.round(remainingHours)}h`;
  }
  if (timeCompleted) {
    timeCompleted.textContent = `${Math.round(completedHours)}h completadas`;
  }

  // Racha (placeholder - calcular con fechas reales)
  if (streakCount) {
    streakCount.textContent = Math.min(stats.completedModules, 30);
  }
}

function updatePhaseProgress() {
  const container = document.getElementById('phase-progress-container');
  if (!container) return;

  const phases = AppEngine.getPhaseProgress();
  
  container.innerHTML = phases.map(phase => `
    <div>
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-bold text-white uppercase tracking-wider">${phase.name}</span>
        <span class="text-xs text-slate-500">${phase.completed} / ${phase.total}</span>
      </div>
      <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r ${phase.color} rounded-full transition-all duration-500" 
             style="width: ${phase.percentage}%"></div>
      </div>
    </div>
  `).join('');
}

function updateBadges(unlockedBadges) {
  const badgeIds = ['badge-core', 'badge-technical', 'badge-automation', 'badge-expert'];
  const badgeNames = ['core', 'technical', 'automation', 'expert'];

  badgeIds.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el && unlockedBadges.includes(badgeNames[index])) {
      if (!el.classList.contains('unlocked')) {
        el.classList.add('unlocked');
        // Confetti cuando se desbloquea
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            },
          });
        }, 300);
      }
    }
  });
}

function animateNumber(element, target, suffix = '') {
  const current = parseInt(element.textContent) || 0;
  if (current === target) return;

  const duration = 800;
  const steps = 30;
  const increment = (target - current) / steps;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const newValue = Math.round(current + increment * step);
    element.textContent = newValue + suffix;

    if (step >= steps) {
      element.textContent = target + suffix;
      clearInterval(interval);
    }
  }, duration / steps);
}