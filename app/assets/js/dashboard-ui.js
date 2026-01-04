/* global confetti */
import { AppEngine } from './app.js';
import { StorageService, KEYS } from './storage.js';
import { UIComponents } from './components.js';
import { requireAuth } from './auth-guard.js';

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
    rankText.innerText = currentRank.name;
    rankText.className = `${currentRank.color} font-bold uppercase tracking-widest`;
  }

  // FASE 2: Nuevas funcionalidades
  updateContinueSection();
  updateExpandedStats();
  updatePhaseProgress();
  updateBadgesUI();
}

/**
 * FASE 2: Actualiza la sección "Continuar donde lo dejaste"
 */
function updateContinueSection() {
  const continueSection = document.getElementById('continue-section');
  const currentModule = getCurrentModule();
  
  if (!currentModule) {
    // No hay módulo en progreso, ocultar sección
    if (continueSection) {
      continueSection.classList.add('hidden');
    }
    return;
  }
  
  // Mostrar sección
  if (continueSection) {
    continueSection.classList.remove('hidden');
    
    // Actualizar información del módulo
    const titleEl = document.getElementById('continue-module-title');
    const progressEl = document.getElementById('continue-module-progress');
    const buttonEl = document.getElementById('continue-button');
    
    if (titleEl) {
      titleEl.textContent = currentModule.title;
    }
    
    if (progressEl) {
      const subProgress = StorageService.get(KEYS.SUBTASKS);
      const totalTasks = currentModule.schedule.length;
      const completedTasks = currentModule.schedule.filter((_, i) => 
        subProgress[`${currentModule.id}-${i}`]
      ).length;
      progressEl.textContent = `${completedTasks} de ${totalTasks} tareas completadas`;
    }
    
    // Scroll al módulo al hacer click
    if (buttonEl) {
      buttonEl.onclick = (e) => {
        e.preventDefault();
        window.location.href = `roadmap.html?scroll=${currentModule.id}`;
      };
    }
  }
}

/**
 * Obtiene el módulo activo actual (en progreso)
 */
function getCurrentModule() {
  const progress = StorageService.get(KEYS.PROGRESS);
  const subProgress = StorageService.get(KEYS.SUBTASKS);
  
  // Buscar el primer módulo no completado con tareas en progreso
  for (let i = 0; i < AppEngine.modules.length; i++) {
    const module = AppEngine.modules[i];
    
    // Si está completado, saltar
    if (progress[module.id]) continue;
    
    // Verificar si tiene tareas en progreso
    const totalTasks = module.schedule.length;
    const completedTasks = module.schedule.filter((_, idx) => 
      subProgress[`${module.id}-${idx}`]
    ).length;
    
    // Si tiene al menos una tarea completada, es el módulo activo
    if (completedTasks > 0) {
      return module;
    }
    
    // Si es el primer módulo no completado sin tareas, también es candidato
    if (i === 0 || progress[AppEngine.modules[i - 1].id]) {
      return module;
    }
  }
  
  return null;
}

/**
 * FASE 2: Actualiza las estadísticas expandidas
 */
function updateExpandedStats() {
  const progress = StorageService.get(KEYS.PROGRESS);
  const completedModules = Object.values(progress).filter(v => v === true).length;
  const totalModules = AppEngine.modules.length;
  
  // Sprints completados
  const completedCountEl = document.getElementById('completed-count');
  const completedPercentageEl = document.getElementById('completed-percentage');
  if (completedCountEl) {
    animateNumber(completedCountEl, completedModules, '');
  }
  if (completedPercentageEl) {
    const percentage = Math.round((completedModules / totalModules) * 100);
    completedPercentageEl.textContent = `${percentage}% del total`;
  }
  
  // Tiempo estimado
  const timeRemainingEl = document.getElementById('time-remaining');
  const timeCompletedEl = document.getElementById('time-completed');
  if (timeRemainingEl && timeCompletedEl) {
    let totalHours = 0;
    let completedHours = 0;
    
    AppEngine.modules.forEach(m => {
      const hours = parseInt(m.duration.replace('h', ''));
      totalHours += hours;
      if (progress[m.id]) {
        completedHours += hours;
      }
    });
    
    const remainingHours = totalHours - completedHours;
    timeRemainingEl.textContent = `${remainingHours}h`;
    timeCompletedEl.textContent = `${completedHours}h completadas`;
  }
  
  // Racha (simulada por ahora)
  const streakCountEl = document.getElementById('streak-count');
  if (streakCountEl) {
    // Por ahora, calculamos racha basada en actividad
    const streak = completedModules > 0 ? Math.min(completedModules * 2, 30) : 0;
    animateNumber(streakCountEl, streak, '');
  }
}

/**
 * FASE 2: Actualiza el progreso por fase
 */
function updatePhaseProgress() {
  const container = document.getElementById('phase-progress-container');
  if (!container) return;
  
  const progress = StorageService.get(KEYS.PROGRESS);
  
  // Agrupar módulos por fase
  const phases = {
    'Core': { modules: [], color: 'amber', icon: 'fa-shield-halved' },
    'Technical': { modules: [], color: 'blue', icon: 'fa-code-branch' },
    'Automation': { modules: [], color: 'emerald', icon: 'fa-robot' },
    'Expert': { modules: [], color: 'purple', icon: 'fa-crown' }
  };
  
  AppEngine.modules.forEach(m => {
    if (phases[m.phase]) {
      phases[m.phase].modules.push(m);
    }
  });
  
  // Renderizar cada fase
  container.innerHTML = Object.entries(phases).map(([phaseName, phaseData]) => {
    const totalModules = phaseData.modules.length;
    const completedModules = phaseData.modules.filter(m => progress[m.id]).length;
    const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    return `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-${phaseData.color}-500/20 flex items-center justify-center">
              <i class="fas ${phaseData.icon} text-${phaseData.color}-500"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-white">${phaseName}</p>
              <p class="text-[10px] text-slate-500">${completedModules} de ${totalModules} sprints</p>
            </div>
          </div>
          <span class="text-xl font-black text-white italic">${percentage}%</span>
        </div>
        <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-${phaseData.color}-600 to-${phaseData.color}-400 rounded-full transition-all duration-1000" 
               style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Anima un número de forma incremental
 */
function animateNumber(element, targetValue, suffix = '') {
  const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
  
  if (currentValue === targetValue) return;
  
  const duration = 1000;
  const startTime = Date.now();
  const difference = targetValue - currentValue;
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(currentValue + (difference * easeOut));
    
    element.textContent = value.toLocaleString() + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function updateBadgesUI() {
  const status = AppEngine.getBadgeStatus();
  const celebrated = StorageService.get(KEYS.BADGES);

  const badges = [
    { id: 'core', key: 'core', name: 'Core Master', color: '#fbbf24' },
    { id: 'technical', key: 'technical', name: 'Tech Ninja', color: '#3b82f6' },
    { id: 'automation', key: 'automation', name: 'Auto Pilot', color: '#10b981' },
    { id: 'expert', key: 'expert', name: 'QA Expert', color: '#a855f7' },
  ];

  badges.forEach(b => {
    const el = document.getElementById(`badge-${b.id}`);
    if (el && status[b.key]) {
      el.classList.add('unlocked');

      if (!celebrated.includes(b.id)) {
        launchCelebration(b.color, b.name);
        celebrated.push(b.id);
        StorageService.save(KEYS.BADGES, celebrated);
      }
    }
  });
}

function launchCelebration(color, badgeName) {
  const duration = 4 * 1000;
  const end = Date.now() + duration;

  // Confetti más impresionante
  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: [color, '#ffffff'],
      ticks: 200,
      gravity: 1.2,
      scalar: 1.2
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: [color, '#ffffff'],
      ticks: 200,
      gravity: 1.2,
      scalar: 1.2
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  
  // Toast notification mejorado
  showBadgeUnlockToast(badgeName, color);
}

/**
 * Muestra un toast especial para badges desbloqueados
 */
function showBadgeUnlockToast(badgeName, color) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-24 right-6 z-[100] backdrop-blur-xl transform transition-all duration-700 shadow-2xl';
  toast.style.backgroundColor = `${color}20`;
  toast.style.borderColor = `${color}80`;
  toast.classList.add('border-2', 'rounded-3xl', 'px-8', 'py-6');
  
  toast.innerHTML = `
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style="background: ${color}40;">
        🏆
      </div>
      <div>
        <p class="text-xs font-black uppercase tracking-widest mb-1" style="color: ${color};">Badge Desbloqueado</p>
        <p class="text-lg font-black text-white">${badgeName}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animación de entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0) scale(1)';
    toast.style.opacity = '1';
  }, 10);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(400px) scale(0.8)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 700);
  }, 5000);
}