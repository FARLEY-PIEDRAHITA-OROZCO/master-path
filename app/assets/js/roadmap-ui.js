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
  } else {
    console.error('No se pudieron cargar los módulos para el Roadmap');
    document.getElementById('roadmap-container').innerHTML =
      `<p class="text-center text-slate-500">Error al cargar el contenido...</p>`;
  }
});

function renderRoadmap() {
  const container = document.getElementById('roadmap-container');
  const progress = StorageService.get(KEYS.PROGRESS);
  const subProgress = StorageService.get(KEYS.SUBTASKS);
  const notes = StorageService.get(KEYS.NOTES);

  container.innerHTML = AppEngine.modules
    .map(m => {
      // Cálculo de progreso interno del módulo
      const totalTasks = m.schedule.length;
      const completedTasks = m.schedule.filter((_, i) => subProgress[`${m.id}-${i}`]).length;
      const percentage = Math.round((completedTasks / totalTasks) * 100) || 0;
      const strokeDash = 251.2 - (251.2 * percentage) / 100;

      return `
        <div class="glass-panel rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-blue-500/20" data-module="${m.id}">
            <div class="p-8 flex flex-col md:flex-row md:items-center justify-between bg-white/[0.01] gap-6">
                <div class="flex items-center gap-8">
                    <div class="relative w-20 h-20 flex items-center justify-center">
                        <svg class="w-full h-full">
                            <circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="5" fill="transparent" class="text-slate-900" />
                            <circle cx="40" cy="40" r="32" stroke="currentColor" stroke-width="5" fill="transparent" 
                                    class="text-blue-500 progress-ring-circle"
                                    id="progress-ring-${m.id}"
                                    stroke-dasharray="251.2"
                                    stroke-dashoffset="${strokeDash}"
                                    stroke-linecap="round" />
                        </svg>
                        <span class="absolute text-[11px] font-black text-white italic" id="progress-text-${m.id}">${percentage}%</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <span class="px-3 py-1 bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">${m.phase} Phase</span>
                            <span class="text-[9px] font-bold text-slate-500 uppercase italic"><i class="far fa-clock mr-1"></i>${m.duration}</span>
                        </div>
                        <h3 class="text-2xl font-black text-white italic tracking-tight uppercase leading-none mb-2">${m.title}</h3>
                        
                        <a href="knowledge-base.html?topic=${m.doc_ref}" class="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors group">
                            <i class="fas fa-book-open group-hover:scale-110 transition-transform"></i>
                            Ver Documentación Técnica
                        </a>
                    </div>
                </div>
                
                <div class="flex items-center gap-6">
                    <div class="text-right">
                        <p class="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">XP Reward</p>
                        <p class="text-lg font-black text-amber-400 italic leading-none">+${m.xp}</p>
                    </div>
                    <button data-expand="${m.id}" class="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all">
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
                                    class="w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] ${progress[m.id] ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'}">
                                ${progress[m.id] ? 'Sprint Completado ✓' : 'Cerrar Sprint & Reclamar XP'}
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
    btn.onclick = () => toggleExpand(btn.dataset.expand);
  });

  document.querySelectorAll('[data-task]').forEach(input => {
    input.onchange = () => {
      const [mId, tIdx] = input.dataset.task.split('-');
      StorageService.toggleSubtask(mId, tIdx);
      // En lugar de re-renderizar todo, solo actualizar el progreso del módulo
      updateModuleProgress(mId);
    };
  });

  document.querySelectorAll('[data-finalize]').forEach(btn => {
    btn.onclick = () => {
      const mId = btn.dataset.finalize;
      const currentStatus = StorageService.get(KEYS.PROGRESS)[mId];
      StorageService.toggleProgress(mId, !currentStatus);
      renderRoadmap();
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
  const completedTasks = module.schedule.filter((_, i) => subProgress[`${moduleId}-${i}`]).length;
  const percentage = Math.round((completedTasks / totalTasks) * 100) || 0;
  const strokeDash = 251.2 - (251.2 * percentage) / 100;

  // Actualizar el anillo de progreso (SVG)
  const progressRing = document.querySelector(`#content-${moduleId}`).closest('.glass-panel').querySelector('.progress-ring-circle');
  if (progressRing) {
    progressRing.style.strokeDashoffset = strokeDash;
  }

  // Actualizar el texto del porcentaje
  const percentageText = document.querySelector(`#content-${moduleId}`).closest('.glass-panel').querySelector('.text-\\[11px\\].font-black.text-white.italic');
  if (percentageText) {
    percentageText.textContent = `${percentage}%`;
  }
}