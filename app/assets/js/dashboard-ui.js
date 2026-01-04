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

  updateBadgesUI();
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