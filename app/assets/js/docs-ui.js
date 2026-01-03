import { UIComponents } from './components.js';

const DocsEngine = {
    data: null,

    async init() {
        UIComponents.init();
        try {
            const response = await fetch('./app/assets/data/docs.json');
            this.data = await response.json();
            this.renderMenu();
            this.handleNavigation();
        } catch (e) { console.error("Error cargando Docs:", e); }
    },

    renderMenu() {
        const menu = document.getElementById('doc-menu');
        menu.innerHTML = this.data.blocks.map(block => `
            <div>
                <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">${block.title}</h4>
                <ul class="space-y-2 border-l border-white/5 ml-2">
                    ${block.topics.map(topic => `
                        <li>
                            <a href="?topic=${topic.id}" 
                               class="block py-2 px-4 text-sm hover:text-blue-400 transition-all border-l border-transparent hover:border-blue-500 -ml-[1px]"
                               data-topic-link="${topic.id}">
                               ${topic.title}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    },

    handleNavigation() {
        // 1. Obtener el tema de la URL (?topic=...)
        const params = new URLSearchParams(window.location.search);
        const topicId = params.get('topic') || this.data.blocks[0].topics[0].id;

        // 2. Buscar el contenido
        let foundTopic = null;
        this.data.blocks.forEach(b => {
            const t = b.topics.find(topic => topic.id === topicId);
            if(t) foundTopic = t;
        });

        if(foundTopic) this.renderArticle(foundTopic);
    },

    renderArticle(topic) {
        const container = document.getElementById('doc-content');
        container.classList.remove('opacity-0');
        
        container.innerHTML = `
            <div class="mb-12">
                <span class="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Documentación Técnica</span>
                <h1 class="text-4xl font-black text-white mt-2 mb-6 italic uppercase tracking-tighter">${topic.title}</h1>
                <div class="prose prose-invert prose-blue max-w-none text-slate-400 leading-relaxed">
                    ${marked.parse(topic.content)} 
                </div>
            </div>
            
            ${topic.evidence ? `
                <div class="mt-12 p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
                    <h5 class="text-white font-bold text-sm mb-2"><i class="fas fa-folder-open mr-2 text-blue-500"></i> Evidencia Requerida</h5>
                    <p class="text-xs text-slate-400 italic">${topic.evidence}</p>
                </div>
            ` : ''}
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => DocsEngine.init());