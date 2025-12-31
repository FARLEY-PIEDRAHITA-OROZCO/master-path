import { AppEngine } from './app.js';
import { UIComponents } from './components.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializamos el motor para cargar el JSON
    UIComponents.init();
    await AppEngine.init();
    renderToolbox();
});

function renderToolbox() {
    // Obtenemos las herramientas desde el motor
    const tools = AppEngine.data.tools || [];
    
    const containers = {
        api: document.getElementById('api-tools'),
        automation: document.getElementById('automation-tools'),
        docs: document.getElementById('docs-tools')
    };

    // Limpiamos contenedores por si acaso
    Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });

    tools.forEach(tool => {
        const targetContainer = containers[tool.category];
        if (!targetContainer) return;

        const card = `
            <a href="${tool.url}" target="_blank" class="block glass-panel p-6 rounded-3xl border border-white/5 hover:border-blue-500/40 transition group relative overflow-hidden">
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
        targetContainer.innerHTML += card;
    });
}