import { AppEngine } from './app.js';
import { UIComponents } from './components.js';

document.addEventListener('DOMContentLoaded', async () => {
  UIComponents.init();

  try {
    await AppEngine.init();
    console.log('Datos cargados:', AppEngine.data); // DEBUG
    renderToolbox();
  } catch (error) {
    console.error('Error cargando Toolbox:', error);
  }
});

function renderToolbox() {
  // Verificamos que existan las herramientas en el JSON
  const tools = AppEngine.data?.tools || [];
  console.log('Herramientas encontradas:', tools); // DEBUG

  const containers = {
    api: document.getElementById('api-tools'),
    automation: document.getElementById('automation-tools'),
    docs: document.getElementById('docs-tools'),
  };

  // Validar que los contenedores existen en el DOM
  if (!containers.api || !containers.automation || !containers.docs) {
    console.error('No se encontraron los contenedores en el HTML');
    return;
  }

  // Limpiar antes de renderizar
  containers.api.innerHTML = '';
  containers.automation.innerHTML = '';
  containers.docs.innerHTML = '';

  tools.forEach(tool => {
    const card = `
            <a href="${tool.url}" target="_blank" class="block glass-panel p-6 rounded-3xl border border-white/5 hover:border-blue-500/40 transition group relative overflow-hidden bg-white/[0.02]">
                <div class="flex items-start justify-between relative z-10">
                    <div class="bg-slate-900/80 p-3 rounded-xl border border-white/5 mb-4">
                        <i class="fas ${tool.icon} text-blue-500 group-hover:scale-110 transition"></i>
                    </div>
                    <i class="fas fa-external-link-alt text-[10px] text-slate-700 group-hover:text-blue-500 transition"></i>
                </div>
                <h4 class="text-white font-bold text-sm mb-1 italic">${tool.name}</h4>
                <p class="text-slate-500 text-[10px] leading-relaxed">${tool.desc}</p>
            </a>
        `;

    if (containers[tool.category]) {
      containers[tool.category].insertAdjacentHTML('beforeend', card);
    }
  });
}
