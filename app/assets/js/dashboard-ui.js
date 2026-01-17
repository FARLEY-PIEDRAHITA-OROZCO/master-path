/* global confetti */
import { AppEngine } from './app.js';
import { StorageService } from './storage-unified.js';
import { KEYS } from './storage-service-v2.js';
import { UIComponents } from './components.js';

// Cargar el dashboard sin autenticación
document.addEventListener('DOMContentLoaded', async () => {
  // Ocultar loading overlay
  const authLoading = document.getElementById('auth-loading');
  if (authLoading) {
    authLoading.style.display = 'none';
  }
  
  // Mostrar contenido principal
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.style.display = 'block';
  }

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
  
  if (rankText && currentRank) {
    rankText.textContent = currentRank.name;
    rankText.className = `${currentRank.color} font-bold uppercase tracking-widest`;
  }

  // Badges - Renderizar todos (obtenidos dinámicamente del Storage)
  updateBadges(stats.badges);

  // Timeline - Últimas actividades (usar módulos completados como proxy)
  updateTimeline(stats.lastActions);

  // Module cards
  renderMiniModules();
}

function animateNumber(element, finalValue, suffix = '') {
  const currentValue = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
  const diff = finalValue - currentValue;
  const steps = 20;
  const increment = diff / steps;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const newValue = currentValue + increment * step;
    element.textContent = Math.round(newValue) + suffix;
    if (step >= steps) {
      element.textContent = Math.round(finalValue) + suffix;
      clearInterval(interval);
    }
  }, 30);
}

function updateBadges(badges) {
  const badgeGrid = document.getElementById('badge-grid');
  if (!badgeGrid) return;

  const badgeDefinitions = [
    { id: 'core', icon: 'fa-user-check', label: 'Core QA', color: 'blue' },
    { id: 'technical', icon: 'fa-laptop-code', label: 'Technical', color: 'purple' },
    { id: 'automation', icon: 'fa-robot', label: 'Automation', color: 'cyan' },
    { id: 'performance', icon: 'fa-tachometer-alt', label: 'Performance', color: 'green' },
    { id: 'agile', icon: 'fa-project-diagram', label: 'Agile', color: 'yellow' },
    { id: 'master', icon: 'fa-crown', label: 'QA Master', color: 'orange' },
  ];

  badgeGrid.innerHTML = badgeDefinitions
    .map((badge) => {
      const unlocked = badges.includes(badge.id);
      return `
        <div class="badge-slot ${unlocked ? 'unlocked' : ''} border-4 border-slate-800/50 bg-slate-900/70 backdrop-blur-sm p-6 rounded-3xl flex flex-col items-center justify-center gap-3 aspect-square relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-${badge.color}-500/10 to-transparent opacity-0 ${unlocked ? 'opacity-100' : ''}"></div>
          <i class="fas ${badge.icon} text-${badge.color}-400 text-3xl relative z-10"></i>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 ${unlocked ? 'text-white' : ''} relative z-10">${badge.label}</span>
        </div>
      `;
    })
    .join('');
}

function updateTimeline(lastActions) {
  const container = document.getElementById('activity-timeline');
  if (!container || !lastActions || lastActions.length === 0) return;

  container.innerHTML = lastActions
    .map((action) => {
      return `
        <div class="flex items-start gap-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-800/30 hover:border-blue-500/30 transition-colors">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas ${action.icon || 'fa-check'} text-white text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-semibold">${action.title}</p>
            <p class="text-slate-500 text-xs">${action.timestamp || 'Reciente'}</p>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderMiniModules() {
  const container = document.getElementById('module-mini-cards');
  if (!container) return;

  const modules = AppEngine.getAllModules();
  const progress = StorageService.getProgress();

  container.innerHTML = modules
    .slice(0, 3)
    .map((mod) => {
      const completed = progress.modules[mod.id] || false;
      const icon = completed ? 'fa-check-circle text-green-500' : 'fa-circle text-slate-700';

      return `
        <a href="roadmap.html?module=${mod.id}" class="group glass-panel p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
          <div class="flex items-start gap-4">
            <i class="fas ${icon} text-2xl"></i>
            <div class="flex-1 min-w-0">
              <h4 class="text-white font-bold text-sm uppercase tracking-wide group-hover:text-blue-400 transition-colors">${mod.title}</h4>
              <p class="text-slate-500 text-xs mt-1 line-clamp-2">${mod.description}</p>
            </div>
          </div>
        </a>
      `;
    })
    .join('');
}
