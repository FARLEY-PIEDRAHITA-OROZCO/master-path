import { AppEngine } from './app.js';
import { StorageService, KEYS } from './storage.js';
import { UIComponents } from './components.js';
import { requireAuth } from './auth-guard.js';

// ⚠️ CRÍTICO: Verificar autenticación PRIMERO antes de cargar nada
requireAuth();

document.addEventListener('DOMContentLoaded', async () => {
  UIComponents.init();
  await AppEngine.init(); // Esperamos a que el JSON cargue

  // Verificación de seguridad
  if (AppEngine.modules && AppEngine.modules.length > 0) {
    renderRoadmap();
    updateGlobalProgress(); // Nueva función
  } else {
    console.error('No se pudieron cargar los módulos para el Roadmap');
    document.getElementById('roadmap-container').innerHTML =
      `<p class="text-center text-slate-500">Error al cargar el contenido...</p>`;
  }
});

/**
 * Actualiza la barra de progreso global en el header
 */
function updateGlobalProgress() {
  const stats = AppEngine.getAnalytics();
  const progressBar = document.getElementById('global-progress-bar-roadmap');
  const progressText = document.getElementById('global-progress-text-roadmap');
  const completedText = document.getElementById('completed-modules-text');
  
  if (progressBar) {
    progressBar.style.width = `${stats.progressPercent}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${stats.progressPercent}%`;
  }
  
  if (completedText) {
    completedText.textContent = `${stats.completedCount} de ${AppEngine.modules.length} Sprints`;
  }
}

/**
 * Determina el estado de un módulo
 * @param {Object} module - Módulo a evaluar
 * @param {number} index - Índice del módulo en el array
 * @returns {string} Estado: 'locked', 'pending', 'active', 'completed'
 */
function getModuleState(module, index) {
  const progress = StorageService.get(KEYS.PROGRESS);
  const subProgress = StorageService.get(KEYS.SUBTASKS);
  
  // Si está completado
  if (progress[module.id]) {
    return 'completed';
  }
  
  // Si es el primer módulo o el anterior está completado, está disponible
  const previousModuleCompleted = index === 0 || progress[AppEngine.modules[index - 1].id];
  console.log(`  🔍 Módulo ${module.id}: index=${index}, previousCompleted=${previousModuleCompleted}`);
  
  if (previousModuleCompleted) {
    // Verificar si tiene tareas en progreso
    const totalTasks = module.schedule.length;
    const completedTasks = module.schedule.filter((_, i) => subProgress[`${module.id}-${i}`]).length;
    
    if (completedTasks > 0) {
      return 'active';
    }
    return 'pending';
  }
  
  // De lo contrario, está bloqueado
  return 'locked';
}

/**
 * Obtiene las clases CSS según el estado del módulo
 */
function getStateClasses(state) {
  const baseClasses = 'glass-panel rounded-[3rem] overflow-hidden transition-all duration-500';
  
  switch(state) {
    case 'locked':
      return `${baseClasses} opacity-50 border border-white/5 cursor-not-allowed`;
    case 'pending':
      return `${baseClasses} border border-white/10 hover:border-blue-500/20`;
    case 'active':
      return `${baseClasses} border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 hover:border-blue-500/70`;
    case 'completed':
      return `${baseClasses} border-2 border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60`;
    default:
      return baseClasses;
  }
}

/**
 * Obtiene el badge del estado
 */
function getStateBadge(state) {
  switch(state) {
    case 'locked':
      return '<span class="px-3 py-1 bg-slate-800/50 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-slate-700/50 flex items-center gap-1"><i class="fas fa-lock text-[6px]"></i> Bloqueado</span>';
    case 'pending':
      return '<span class="px-3 py-1 bg-slate-700/30 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-slate-600/30">Pendiente</span>';
    case 'active':
      return '<span class="px-3 py-1 bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/40 flex items-center gap-1 animate-pulse"><i class="fas fa-circle text-[6px]"></i> En Progreso</span>';
    case 'completed':
      return '<span class="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-500/40 flex items-center gap-1"><i class="fas fa-check text-[6px]"></i> Completado</span>';
    default:
      return '';
  }
}

function renderRoadmap() {
  const container = document.getElementById('roadmap-container');
  const progress = StorageService.get(KEYS.PROGRESS);
  const subProgress = StorageService.get(KEYS.SUBTASKS);
  const notes = StorageService.get(KEYS.NOTES);
  
  console.log('🔄 Renderizando roadmap con progreso:', progress);

  container.innerHTML = AppEngine.modules
    .map((m, index) => {
      // Determinar estado del módulo
      const state = getModuleState(m, index);
      const isLocked = state === 'locked';
      
      console.log(`📦 Módulo ${m.id} (${m.title}): estado = ${state}, index = ${index}`);
      
      // Cálculo de progreso interno del módulo
      const totalTasks = m.schedule.length;
      const completedTasks = m.schedule.filter((_, i) => subProgress[`${m.id}-${i}`]).length;
      const percentage = Math.round((completedTasks / totalTasks) * 100) || 0;
      const strokeDash = 251.2 - (251.2 * percentage) / 100;
      
      // Color del anillo según estado
      let ringColor = 'text-blue-500';
      if (state === 'completed') ringColor = 'text-emerald-500';
      if (state === 'locked') ringColor = 'text-slate-700';

      return `
        <div class="${getStateClasses(state)}" data-module="${m.id}" data-state="${state}">
            <div class="p-8 flex flex-col md:flex-row md:items-center justify-between bg-white/[0.01] gap-6">
                <div class="flex items-center gap-8">
                    ${isLocked ? '<div class="w-20 h-20 flex items-center justify-center text-slate-700"><i class="fas fa-lock text-3xl"></i></div>' : `
                    <div class="relative w-20 h-20 flex items-center justify-center">
                        <svg class="w-full h-full">
                            <circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="5" fill="transparent" class="text-slate-900" />
                            <circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="5" fill="transparent" 
                                    class="${ringColor} progress-ring-circle"
                                    id="progress-ring-${m.id}"
                                    stroke-dasharray="251.2"
                                    stroke-dashoffset="${strokeDash}"
                                    stroke-linecap="round" />
                        </svg>
                        <span class="absolute text-[11px] font-black ${state === 'completed' ? 'text-emerald-400' : 'text-white'} italic" id="progress-text-${m.id}">${percentage}%</span>
                    </div>
                    `}
                    <div>
                        <div class="flex items-center gap-3 mb-2 flex-wrap">
                            ${getStateBadge(state)}
                            <span class="px-3 py-1 bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">${m.phase} Phase</span>
                            <span class="text-[9px] font-bold text-slate-500 uppercase italic"><i class="far fa-clock mr-1"></i>${m.duration}</span>
                        </div>
                        <h3 class="text-2xl font-black ${isLocked ? 'text-slate-600' : 'text-white'} italic tracking-tight uppercase leading-none mb-2">${m.title}</h3>
                        
                        ${!isLocked ? `
                        <a href="knowledge-base.html?topic=${m.doc_ref}" class="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors group">
                            <i class="fas fa-book-open group-hover:scale-110 transition-transform"></i>
                            Ver Documentación Técnica
                        </a>
                        ` : '<p class="text-[10px] text-slate-600 italic">Completa el sprint anterior para desbloquear</p>'}
                    </div>
                </div>
                
                <div class="flex items-center gap-6">
                    <div class="text-right">
                        <p class="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">XP Reward</p>
                        <p class="text-lg font-black ${isLocked ? 'text-slate-700' : state === 'completed' ? 'text-emerald-400' : 'text-amber-400'} italic leading-none">+${m.xp}</p>
                    </div>
                    <button data-expand="${m.id}" 
                            ${isLocked ? 'disabled' : ''}
                            class="w-14 h-14 rounded-2xl ${isLocked ? 'bg-slate-900/50 cursor-not-allowed' : 'bg-slate-900 hover:text-blue-500'} border border-white/5 flex items-center justify-center text-slate-500 transition-all">
                        <i class="fas fa-chevron-down transition-transform duration-300" id="icon-${m.id}"></i>
                    </button>
                </div>
            </div>

            <div id="content-${m.id}" class="hidden border-t border-white/5 bg-black/40">
                <div class="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div class="space-y-8">
                        <div>
                            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Masterclass Video</h4>
                            <div class="aspect-video bg-slate-950 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer">
                                <i class="fas fa-play text-3xl text-blue-500 z-10 group-hover:scale-125 transition-transform"></i>
                                <p class="text-[9px] font-black text-white mt-4 z-10 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Launch Module Player</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Editor de Notas</h4>
                            <textarea data-module-note="${m.id}" 
                                      placeholder="Escribe tus hallazgos clave..."
                                      class="w-full h-40 bg-white/[0.02] border border-white/5 rounded-3xl p-5 text-xs text-slate-300 focus:border-blue-500/50 outline-none transition resize-none leading-relaxed">${notes[m.id] || ''}</textarea>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estatus de Lecciones</h4>
                        <div class="space-y-4">
                            ${m.schedule
                              .map(
                                (s, i) => `
                                <label class="flex items-start gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-blue-500/30 transition cursor-pointer group">
                                    <input type="checkbox" 
                                           ${subProgress[`${m.id}-${i}`] ? 'checked' : ''} 
                                           data-task="${m.id}-${i}"
                                           data-testid="task-checkbox-${m.id}-${i}"
                                           class="mt-1 w-5 h-5 rounded-lg border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 transition-all">
                                    <div>
                                        <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 group-hover:translate-x-1 transition-transform">${s.day} • ${s.topic}</p>
                                        <p class="text-xs text-slate-400 italic leading-snug">${s.task}</p>
                                    </div>
                                </label>
                            `
                              )
                              .join('')}
                        </div>
                    </div>

                    <div class="space-y-8">
                        <div class="p-8 bg-gradient-to-b from-blue-600/10 to-transparent rounded-[2.5rem] border border-blue-500/10">
                            <h4 class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 italic">Training Resources</h4>
                            <div class="space-y-4">
                                ${m.resources
                                  .map(
                                    res => `
                                    <a href="${res.url}" target="_blank" class="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition border border-transparent hover:border-white/5 group">
                                        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                            <i class="fas fa-link text-blue-400"></i>
                                        </div>
                                        <span class="text-[11px] font-bold text-slate-300 group-hover:text-white transition">${res.name}</span>
                                    </a>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                                <h4 class="text-[9px] font-black text-slate-500 uppercase mb-4 text-center">Sprint Checklist</h4>
                                <ul class="space-y-2">
                                    ${m.deliverables.map(d => `<li class="text-[10px] text-slate-500 italic flex items-center gap-2"><i class="fas fa-check-circle text-blue-500/30"></i> ${d}</li>`).join('')}
                                </ul>
                            </div>
                            <button data-finalize="${m.id}" 
                                    data-testid="finalize-sprint-${m.id}"
                                    class="w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] ${progress[m.id] ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 cursor-default' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40'}">
                                ${progress[m.id] ? '<i class="fas fa-check-circle mr-2"></i> Sprint Completado' : '<i class="fas fa-trophy mr-2"></i> Cerrar Sprint & Reclamar XP'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
    .join('');

  attachEventListeners();
}

function attachEventListeners() {
  // Delegación de eventos para optimizar memoria
  document.querySelectorAll('[data-expand]').forEach(btn => {
    if (!btn.disabled) {
      btn.onclick = () => toggleExpand(btn.dataset.expand);
    }
  });

  document.querySelectorAll('[data-task]').forEach(input => {
    input.onchange = async () => {
      const [mId, tIdx] = input.dataset.task.split('-');
      console.log('🔄 Checkbox cambiado:', { moduleId: mId, taskIndex: tIdx, checked: input.checked });
      
      // Mostrar celebración si se marca como completado
      if (input.checked) {
        showTaskCompletionCelebration();
      }
      
      // Esperar a que se guarde el estado antes de actualizar la UI
      await StorageService.toggleSubtask(mId, tIdx);
      
      console.log('💾 Estado guardado, actualizando UI...');
      
      // Ahora actualizar el progreso del módulo
      updateModuleProgress(mId);
      
      // Actualizar progreso global
      updateGlobalProgress();
    };
  });

  document.querySelectorAll('[data-finalize]').forEach(btn => {
    btn.onclick = async () => {
      const mId = btn.dataset.finalize;
      const currentStatus = StorageService.get(KEYS.PROGRESS)[mId];
      
      if (!currentStatus) {
        // Solo celebrar si se está completando (no si se desmarca)
        showSprintCompletionCelebration();
      }
      
      // Esperar a que se guarde antes de re-renderizar
      await StorageService.toggleProgress(mId, !currentStatus);
      
      // Re-renderizar con datos actualizados
      renderRoadmap();
      updateGlobalProgress();
    };
  });

  document.querySelectorAll('[data-module-note]').forEach(txt => {
    txt.onchange = () => {
      const notes = StorageService.get(KEYS.NOTES);
      notes[txt.dataset.moduleNote] = txt.value;
      StorageService.save(KEYS.NOTES, notes);
    };
  });
}

function toggleExpand(id) {
  const content = document.getElementById(`content-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  content.classList.toggle('hidden');
  icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

/**
 * Actualiza solo el progreso de un módulo específico sin re-renderizar todo
 * @param {string} moduleId - ID del módulo a actualizar
 */
function updateModuleProgress(moduleId) {
  const subProgress = StorageService.get(KEYS.SUBTASKS);
  const module = AppEngine.modules.find(m => m.id == moduleId);
  
  if (!module) {
    console.error('Módulo no encontrado:', moduleId);
    return;
  }

  // Calcular el progreso actualizado
  const totalTasks = module.schedule.length;
  const completedTasks = module.schedule.filter((_, i) => {
    const key = `${moduleId}-${i}`;
    return subProgress[key];
  }).length;
  const percentage = Math.round((completedTasks / totalTasks) * 100) || 0;
  const strokeDash = 251.2 - (251.2 * percentage) / 100;

  // Actualizar el anillo de progreso (SVG)
  const progressRing = document.getElementById(`progress-ring-${moduleId}`);
  if (progressRing) {
    progressRing.style.strokeDashoffset = strokeDash;
  }

  // Actualizar el texto del porcentaje
  const percentageText = document.getElementById(`progress-text-${moduleId}`);
  if (percentageText) {
    percentageText.textContent = `${percentage}%`;
  }
}

/**
 * Muestra celebración al completar una tarea individual
 */
function showTaskCompletionCelebration() {
  // Confetti sutil
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#60a5fa', '#93c5fd']
    });
  }
  
  // Toast notification
  showToast('¡Tarea completada! 🎯', 'success');
}

/**
 * Muestra celebración al completar un sprint completo
 */
function showSprintCompletionCelebration() {
  // Confetti épico
  if (typeof confetti !== 'undefined') {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
  
  // Toast notification
  showToast('🎉 ¡Sprint Completado! XP Reclamado', 'success', 4000);
}

/**
 * Muestra un toast notification
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'info', 'warning', 'error'
 * @param {number} duration - Duración en ms
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `fixed top-24 right-6 z-[100] px-6 py-4 rounded-2xl border backdrop-blur-xl transform transition-all duration-500 translate-x-0 opacity-100 shadow-2xl`;
  toast.setAttribute('data-testid', 'toast-notification');
  
  // Estilos según tipo
  const styles = {
    success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    warning: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    error: 'bg-red-500/20 border-red-500/50 text-red-300'
  };
  
  toast.classList.add(...styles[type].split(' '));
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'} text-xl"></i>
      <p class="font-bold text-sm">${message}</p>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animación de entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Remover después de la duración
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, duration);
}
