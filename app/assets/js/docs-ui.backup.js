/* global marked */
import { UIComponents } from './components.js';
import { requireAuth } from './auth-guard.js';

// ⚠️ CRÍTICO: Verificar autenticación PRIMERO antes de cargar nada
requireAuth();

const DocsEngine = {
  manifest: null,
  currentTopic: null,

  async init() {
    console.log('📚 [DOCS] Inicializando sistema de documentación...');
    UIComponents.init();
    try {
      // Cargar manifest.json con metadata
      console.log('📚 [DOCS] Cargando manifest.json desde /docs/manifest.json');
      const response = await fetch('/docs/manifest.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: No se pudo cargar manifest.json`);
      }
      
      this.manifest = await response.json();
      console.log('✅ [DOCS] Manifest cargado:', this.manifest.blocks.length, 'bloques');
      
      this.renderMenu();
      console.log('✅ [DOCS] Menú renderizado');
      
      await this.handleNavigation();
      console.log('✅ [DOCS] Navegación inicializada');
    } catch (e) {
      console.error('❌ [DOCS] Error cargando documentación:', e);
      this.showError('Error al cargar la documentación. Por favor, intenta de nuevo.');
    }
  },

  renderMenu() {
    console.log('📚 [DOCS] Renderizando menú...');
    const menu = document.getElementById('doc-menu');
    
    if (!menu) {
      console.error('❌ [DOCS] Elemento #doc-menu no encontrado');
      return;
    }
    
    if (!this.manifest || !this.manifest.blocks) {
      console.error('❌ [DOCS] Manifest inválido o sin bloques');
      menu.innerHTML = '<p class="text-red-400">Error: No se pudo cargar el menú</p>';
      return;
    }

    console.log('📚 [DOCS] Generando HTML del menú para', this.manifest.blocks.length, 'bloques');
    menu.innerHTML = this.manifest.blocks
      .map(block => {
        // Skip blocks without docs
        if (!block.docs || block.docs.length === 0) {
          return '';
        }

        return `
          <div>
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
              ${block.title}
            </h4>
            <ul class="space-y-2 border-l border-white/5 ml-2">
              ${block.docs
                .map(doc => `
                  <li>
                    <a href="?topic=${doc.id}" 
                       class="block py-2 px-4 text-sm hover:text-blue-400 transition-all border-l border-transparent hover:border-blue-500 -ml-[1px]"
                       data-topic-link="${doc.id}">
                       ${doc.title}
                    </a>
                  </li>
                `)
                .join('')}
            </ul>
          </div>
        `;
      })
      .join('');
  },

  async handleNavigation() {
    // 1. Obtener el tema de la URL (?topic=...)
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topic');

    // 2. Si no hay topic, usar el primero disponible
    let selectedDoc = null;
    
    if (topicId) {
      // Buscar el documento por ID
      for (const block of this.manifest.blocks) {
        if (block.docs) {
          selectedDoc = block.docs.find(doc => doc.id === topicId);
          if (selectedDoc) break;
        }
      }
    }
    
    // Si no se encontró o no hay topicId, usar el primero
    if (!selectedDoc) {
      for (const block of this.manifest.blocks) {
        if (block.docs && block.docs.length > 0) {
          selectedDoc = block.docs[0];
          break;
        }
      }
    }

    if (selectedDoc) {
      await this.loadAndRenderDocument(selectedDoc);
    } else {
      this.showError('No hay documentos disponibles');
    }
  },

  async loadAndRenderDocument(doc) {
    console.log('📚 [DOCS] Cargando documento:', doc.id, '-', doc.title);
    const container = document.getElementById('doc-content');
    
    if (!container) {
      console.error('❌ [DOCS] Elemento #doc-content no encontrado');
      return;
    }
    
    try {
      // Mostrar loading
      container.innerHTML = `
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-white/5 rounded w-3/4"></div>
          <div class="h-4 bg-white/5 rounded w-full"></div>
          <div class="h-4 bg-white/5 rounded w-5/6"></div>
        </div>
      `;

      // Cargar el archivo .md
      const mdPath = `/docs/content/${doc.file}`;
      console.log('📚 [DOCS] Fetch desde:', mdPath);
      const response = await fetch(mdPath);
      
      if (!response.ok) {
        throw new Error(`No se pudo cargar el documento: ${response.status}`);
      }
      
      const markdownContent = await response.text();
      console.log('✅ [DOCS] Documento cargado:', markdownContent.length, 'caracteres');
      
      // Renderizar el documento
      this.renderArticle(doc, markdownContent);
      console.log('✅ [DOCS] Documento renderizado exitosamente');
      
    } catch (error) {
      console.error('❌ [DOCS] Error cargando documento:', error);
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <h3 class="text-xl font-bold text-white mb-2">Error al cargar documento</h3>
          <p class="text-slate-400 text-sm">${error.message}</p>
          <p class="text-slate-600 text-xs mt-2">Archivo: ${doc.file}</p>
        </div>
      `;
    }
  },

  renderArticle(doc, markdownContent) {
    console.log('📚 [DOCS] Renderizando artículo:', doc.title);
    const container = document.getElementById('doc-content');
    
    // Configurar marked para mejor rendering
    if (typeof marked !== 'undefined' && marked.setOptions) {
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });
    }
    
    // Convertir markdown a HTML
    const htmlContent = typeof marked !== 'undefined' && marked.parse 
      ? marked.parse(markdownContent)
      : markdownContent;

    console.log('📚 [DOCS] HTML generado:', htmlContent.length, 'caracteres');
    
    // Remover la opacidad y mostrar el contenido
    container.classList.remove('opacity-0');
    container.innerHTML = `
      <div class="mb-12">
        <span class="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Documentación Técnica
        </span>
        <h1 class="text-4xl font-black text-white mt-2 mb-6 italic uppercase tracking-tighter">
          ${doc.title}
        </h1>
        <div class="prose prose-invert prose-blue max-w-none text-slate-400 leading-relaxed markdown-content">
          ${htmlContent}
        </div>
      </div>
      
      ${doc.evidence ? `
        <div class="mt-12 p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
          <h5 class="text-white font-bold text-sm mb-2">
            <i class="fas fa-folder-open mr-2 text-blue-500"></i> 
            Evidencia Requerida
          </h5>
          <p class="text-xs text-slate-400 italic">${doc.evidence}</p>
        </div>
      ` : ''}
    `;

    console.log('✅ [DOCS] Artículo renderizado y visible');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showError(message) {
    const container = document.getElementById('doc-content');
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
        <h3 class="text-xl font-bold text-white mb-2">Error</h3>
        <p class="text-slate-400">${message}</p>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => DocsEngine.init());
