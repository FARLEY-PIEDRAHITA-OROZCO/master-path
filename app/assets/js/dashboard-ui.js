import { AppEngine } from './app.js';
import { StorageService, KEYS } from './storage.js';
import { UIComponents } from './components.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar el motor (Cargar JSON)
  UIComponents.init();
  await AppEngine.init();

  // Renderizar Dashboard
  refreshDashboard();
});

function refreshDashboard() {
  const stats = AppEngine.getAnalytics();

  // Actualizar Progreso
  const bar = document.getElementById('global-progress-bar');
  const txt = document.getElementById('global-progress-text');
  const xpText = document.getElementById('user-xp');
  const rankText = document.getElementById('rank-name');

  if (bar) bar.style.width = `${stats.progressPercent}%`;
  if (txt) txt.innerText = `${stats.progressPercent}%`;
  if (xpText) xpText.innerText = stats.xp.toLocaleString();

  // Rango dinámico
  const ranks = [
    { min: 10000, name: 'Senior QA Automation' },
    { min: 5000, name: 'QA Engineer Mid' },
    { min: 1000, name: 'Technical QA Tester' },
    { min: 0, name: 'Junior Talent' },
  ];
  rankText.innerText = ranks.find(r => stats.xp >= r.min).name;

  updateBadgesUI();
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
        launchCelebration(b.color);
        // Aquí podrías llamar a una función de Toast si la tienes modularizada
        celebrated.push(b.id);
        StorageService.save(KEYS.BADGES, celebrated);
      }
    }
  });
}

function launchCelebration(color) {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: [color, '#ffffff'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: [color, '#ffffff'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
