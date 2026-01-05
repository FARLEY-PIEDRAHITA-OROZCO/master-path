/* global marked */
import { UIComponents } from './components.js';
import { requireAuth } from './auth-guard-v2.js';

// ⚠️ CRÍTICO: Verificar autenticación PRIMERO antes de cargar nada
requireAuth();

const DocsEngine = {
  manifest: null,
  currentTopic: null,
  currentDocIndex: 0,
  allDocs: [],
  cache: new Map(),
  readingProgress: {},
  bookmarks: [],
  searchIndex: [],
  
  async init() {
    console.log('📚 [DOCS] Inicializando sistema mejorado de documentación...');
    UIComponents.init();
    
    try {
      // Cargar datos persistidos
      this.loadPersistedData();
      
      // Cargar manifest.json con metadata
      console.log('📚 [DOCS] Cargando manifest.json desde /docs/manifest.json');
      const response = await fetch('/docs/manifest.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: No se pudo cargar manifest.json`);
      }
      
      this.manifest = await response.json();
      console.log('✅ [DOCS] Manifest cargado:', this.manifest.blocks.length, 'bloques');
      
      // Construir lista plana de todos los documentos
      this.buildDocsList();
      
      // Renderizar UI
      this.renderMenu();
      this.renderToolbar();
      this.renderTableOfContents();
      
      console.log('✅ [DOCS] Menú renderizado');
      
      await this.handleNavigation();
      console.log('✅ [DOCS] Navegación inicializada');
      
      // Inicializar features adicionales
      this.initKeyboardNavigation();
      this.initReadingProgress();
      this.initSearch();
      this.initFocusMode();
      
    } catch (e) {
      console.error('❌ [DOCS] Error cargando documentación:', e);
      this.showError('Error al cargar la documentación. Por favor, intenta de nuevo.');
    }
  },

  buildDocsList() {
    this.allDocs = [];
    this.manifest.blocks.forEach(block => {
      if (block.docs && block.docs.length > 0) {
        block.docs.forEach(doc => {
          this.allDocs.push({
            ...doc,
            blockId: block.id,
            blockTitle: block.title
          });
        });
      }
    });
    console.log('📚 [DOCS] Lista de documentos construida:', this.allDocs.length, 'documentos');
  },

  renderMenu() {
    console.log('📚 [DOCS] Renderizando menú mejorado...');
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
    
    // Contador de documentos totales
    const totalDocs = this.allDocs.length;
    
    menu.innerHTML = `
      <!-- Header del sidebar -->
      <div class="mb-8 pb-6 border-b border-white/5">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-white font-bold text-sm">Documentación</h3>
          <span class="text-xs text-slate-500">${totalDocs} docs</span>
        </div>
        
        <!-- Búsqueda rápida -->
        <div class="mt-4">
          <div class="relative">
            <input 
              type="text" 
              id="doc-search" 
              placeholder="Buscar... (Ctrl+K)"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <i class="fas fa-search absolute right-3 top-3 text-slate-500 text-xs"></i>
          </div>
        </div>
        
        <!-- Marcadores -->
        <div id="bookmarks-section" class="mt-4 hidden">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-bookmark text-blue-500 text-xs"></i>
            <span class="text-xs text-slate-400">Marcadores</span>
          </div>
          <div id="bookmarks-list" class="space-y-1"></div>
        </div>
      </div>
      
      <!-- Bloques de documentos -->
      ${this.manifest.blocks
        .map(block => {
          // Skip blocks without docs
          if (!block.docs || block.docs.length === 0) {
            return '';
          }

          return `
            <div class="mb-8">
              <div class="flex items-baseline gap-2 mb-4">
                <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  ${block.title}
                </h4>
                <span class="block-badge" title="${block.badge} - Categoría del bloque">
                  ${block.badge}
                </span>
              </div>
              <ul class="space-y-1 border-l border-white/5 ml-2">
                ${block.docs
                  .map(doc => {
                    const isBookmarked = this.bookmarks.includes(doc.id);
                    return `
                      <li>
                        <a href="?topic=${doc.id}" 
                           class="doc-link group flex items-center justify-between py-2 px-4 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-lg border-l-2 border-transparent hover:border-blue-500 -ml-[10px]"
                           data-topic-link="${doc.id}"
                           data-doc-id="${doc.id}">
                           <span class="flex items-center gap-2">
                             ${doc.title}
                           </span>
                           <i class="fas fa-bookmark text-xs ${isBookmarked ? 'text-blue-500' : 'text-transparent group-hover:text-slate-600'} bookmark-icon" data-bookmark="${doc.id}"></i>
                        </a>
                      </li>
                    `;
                  })
                  .join('')}
              </ul>
            </div>
          `;
        })
        .join('')}
    `;
    
    // Event listeners para marcadores
    this.attachBookmarkListeners();
    this.renderBookmarks();
  },

  renderToolbar() {
    const main = document.querySelector('main.ml-72');
    if (!main) return;
    
    // Insertar toolbar antes del contenido - Optimizado para mejor posicionamiento
    const toolbar = document.createElement('div');
    toolbar.id = 'doc-toolbar';
    toolbar.className = 'sticky top-16 z-40 mb-6 flex items-center justify-between gap-4 bg-slate-950/90 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-3 shadow-lg';
    toolbar.innerHTML = `
      <!-- Breadcrumbs -->
      <div id="breadcrumbs" class="flex items-center gap-2 text-xs">
        <a href="/app/pages/dashboard.html" class="text-slate-500 hover:text-white transition-colors">
          <i class="fas fa-home"></i>
        </a>
        <i class="fas fa-chevron-right text-slate-700 text-[8px]"></i>
        <span class="text-slate-400">Documentación</span>
        <i class="fas fa-chevron-right text-slate-700 text-[8px]"></i>
        <span id="breadcrumb-current" class="text-white font-bold">...</span>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Progreso de lectura -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs">
          <i class="fas fa-clock text-blue-500"></i>
          <span id="reading-time" class="text-slate-400">...</span>
        </div>
        
        <!-- Modo focus -->
        <button id="focus-mode-btn" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs text-slate-400 hover:text-white" title="Modo Lectura (F)">
          <i class="fas fa-expand"></i>
        </button>
        
        <!-- Navegación -->
        <div class="flex items-center gap-1">
          <button id="prev-doc-btn" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-blue-500 transition-all text-xs text-slate-400 hover:text-white" title="Anterior (←)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button id="next-doc-btn" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-blue-500 transition-all text-xs text-slate-400 hover:text-white" title="Siguiente (→)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
    
    main.insertBefore(toolbar, main.firstChild);
    
    // Event listeners
    document.getElementById('prev-doc-btn')?.addEventListener('click', () => this.navigatePrevious());
    document.getElementById('next-doc-btn')?.addEventListener('click', () => this.navigateNext());
    document.getElementById('focus-mode-btn')?.addEventListener('click', () => this.toggleFocusMode());
  },

  renderTableOfContents() {
    const main = document.querySelector('main.ml-72');
    if (!main) return;
    
    // Insertar TOC flotante - Ajustado para no chocar con toolbar y footer
    const toc = document.createElement('div');
    toc.id = 'table-of-contents';
    toc.className = 'fixed right-8 top-48 w-64 hidden xl:block';
    toc.innerHTML = `
      <div class="glass-panel rounded-2xl p-6 border border-white/5 max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar pb-8">
        <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">En esta página</h4>
        <nav id="toc-links" class="space-y-2"></nav>
      </div>
    `;
    
    document.body.appendChild(toc);
  },

  async handleNavigation() {
    // Obtener el tema de la URL (?topic=...)
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topic');

    let selectedDoc = null;
    
    if (topicId) {
      // Buscar el documento por ID
      selectedDoc = this.allDocs.find(doc => doc.id === topicId);
    }
    
    // Si no se encontró o no hay topicId, usar el primero
    if (!selectedDoc && this.allDocs.length > 0) {
      selectedDoc = this.allDocs[0];
    }

    if (selectedDoc) {
      this.currentDocIndex = this.allDocs.findIndex(doc => doc.id === selectedDoc.id);
      await this.loadAndRenderDocument(selectedDoc);
      this.updateActiveLink(selectedDoc.id);
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
    
    this.currentTopic = doc;
    
    try {
      // Mostrar loading
      container.innerHTML = `
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-white/5 rounded w-3/4"></div>
          <div class="h-4 bg-white/5 rounded w-full"></div>
          <div class="h-4 bg-white/5 rounded w-5/6"></div>
        </div>
      `;

      let markdownContent;
      
      // Verificar cache primero
      if (this.cache.has(doc.id)) {
        console.log('✅ [DOCS] Cargando desde cache');
        markdownContent = this.cache.get(doc.id);
      } else {
        // Cargar el archivo .md
        const mdPath = `/docs/content/${doc.file}`;
        console.log('📚 [DOCS] Fetch desde:', mdPath);
        const response = await fetch(mdPath);
        
        if (!response.ok) {
          throw new Error(`No se pudo cargar el documento: ${response.status}`);
        }
        
        markdownContent = await response.text();
        
        // Guardar en cache
        this.cache.set(doc.id, markdownContent);
        console.log('💾 [DOCS] Guardado en cache');
      }
      
      console.log('✅ [DOCS] Documento cargado:', markdownContent.length, 'caracteres');
      
      // Renderizar el documento
      this.renderArticle(doc, markdownContent);
      console.log('✅ [DOCS] Documento renderizado exitosamente');
      
      // Actualizar UI
      this.updateBreadcrumbs(doc);
      this.updateNavigationButtons();
      this.generateTableOfContents();
      this.calculateReadingTime(markdownContent);
      
      // Pre-cargar siguiente documento
      this.preloadNextDocument();
      
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
    
    // Remover la opacidad y mostrar el contenido con animación
    container.style.opacity = '0';
    container.innerHTML = `
      <article class="doc-article">
        <header class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <span class="block-badge" title="${doc.blockTitle}">
              ${doc.blockTitle}
            </span>
            ${this.bookmarks.includes(doc.id) ? 
              '<i class="fas fa-bookmark text-blue-500 text-sm"></i>' : 
              ''}
          </div>
          <h1 class="text-5xl font-black text-white mb-6 leading-tight">
            ${doc.title}
          </h1>
        </header>
        
        <div class="prose prose-invert prose-blue max-w-none text-slate-400 leading-relaxed markdown-content">
          ${htmlContent}
        </div>
        
        ${doc.evidence ? `
          <div class="mt-16 p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-folder-open text-blue-400 text-xl"></i>
              </div>
              <div>
                <h5 class="text-white font-bold text-sm mb-2">
                  📁 Evidencia Requerida
                </h5>
                <p class="text-sm text-slate-400">${doc.evidence}</p>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Navegación al final del documento -->
        <div class="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
          ${this.currentDocIndex > 0 ? `
            <button class="nav-doc-btn group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all" onclick="DocsEngine.navigatePrevious()">
              <i class="fas fa-arrow-left text-blue-500"></i>
              <div class="text-left">
                <p class="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Anterior</p>
                <p class="text-sm text-white font-bold group-hover:text-blue-400 transition-colors">${this.allDocs[this.currentDocIndex - 1].title}</p>
              </div>
            </button>
          ` : '<div></div>'}
          
          ${this.currentDocIndex < this.allDocs.length - 1 ? `
            <button class="nav-doc-btn group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all ml-auto" onclick="DocsEngine.navigateNext()">
              <div class="text-right">
                <p class="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Siguiente</p>
                <p class="text-sm text-white font-bold group-hover:text-blue-400 transition-colors">${this.allDocs[this.currentDocIndex + 1].title}</p>
              </div>
              <i class="fas fa-arrow-right text-blue-500"></i>
            </button>
          ` : '<div></div>'}
        </div>
      </article>
    `;

    // Fade in animation
    setTimeout(() => {
      container.style.transition = 'opacity 0.3s ease';
      container.style.opacity = '1';
    }, 50);

    console.log('✅ [DOCS] Artículo renderizado y visible');
    
    // Scroll to top suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // === NAVEGACIÓN ===
  
  initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Ignorar si está en un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.navigatePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateNext();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFocusMode();
          break;
      }
      
      // Ctrl+K para búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('doc-search')?.focus();
      }
    });
    
    console.log('⌨️ [DOCS] Navegación por teclado activada (←/→, F, Ctrl+K)');
  },

  navigatePrevious() {
    if (this.currentDocIndex > 0) {
      const prevDoc = this.allDocs[this.currentDocIndex - 1];
      window.location.href = `?topic=${prevDoc.id}`;
    }
  },

  navigateNext() {
    if (this.currentDocIndex < this.allDocs.length - 1) {
      const nextDoc = this.allDocs[this.currentDocIndex + 1];
      window.location.href = `?topic=${nextDoc.id}`;
    }
  },

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-doc-btn');
    const nextBtn = document.getElementById('next-doc-btn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentDocIndex === 0;
      prevBtn.style.opacity = this.currentDocIndex === 0 ? '0.5' : '1';
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentDocIndex >= this.allDocs.length - 1;
      nextBtn.style.opacity = this.currentDocIndex >= this.allDocs.length - 1 ? '0.5' : '1';
    }
  },

  updateActiveLink(docId) {
    // Remover active de todos los links
    document.querySelectorAll('.doc-link').forEach(link => {
      link.classList.remove('bg-blue-500/10', 'text-white', 'border-blue-500');
    });
    
    // Agregar active al link actual
    const activeLink = document.querySelector(`[data-topic-link="${docId}"]`);
    if (activeLink) {
      activeLink.classList.add('bg-blue-500/10', 'text-white', 'border-blue-500');
    }
  },

  updateBreadcrumbs(doc) {
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = doc.title;
    }
  },

  // === TABLA DE CONTENIDOS ===
  
  generateTableOfContents() {
    const tocLinks = document.getElementById('toc-links');
    if (!tocLinks) return;
    
    const content = document.getElementById('doc-content');
    const headings = content.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
      tocLinks.innerHTML = '<p class="text-xs text-slate-500 italic">Sin encabezados</p>';
      return;
    }
    
    tocLinks.innerHTML = Array.from(headings).map(heading => {
      const level = heading.tagName === 'H2' ? 0 : 1;
      const text = heading.textContent;
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      heading.id = id;
      
      return `
        <a href="#${id}" 
           class="toc-link block text-xs text-slate-400 hover:text-blue-400 transition-colors ${level === 1 ? 'pl-4' : ''}"
           data-heading-id="${id}">
          ${text}
        </a>
      `;
    }).join('');
    
    // Smooth scroll en TOC links con offset correcto
    tocLinks.querySelectorAll('.toc-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-heading-id');
        const target = document.getElementById(targetId);
        if (target) {
          // Calcular offset: navbar (64px) + toolbar (60px) + padding (20px)
          const offset = 144;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  },

  // === PROGRESO DE LECTURA ===
  
  initReadingProgress() {
    // Crear barra de progreso
    const progressBar = document.createElement('div');
    progressBar.id = 'reading-progress-bar';
    progressBar.className = 'fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 transition-all duration-100';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
    
    // Actualizar en scroll
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  },

  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    
    const readingTimeEl = document.getElementById('reading-time');
    if (readingTimeEl) {
      readingTimeEl.textContent = `${minutes} min lectura`;
    }
  },

  // === BÚSQUEDA ===
  
  initSearch() {
    const searchInput = document.getElementById('doc-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      
      if (query.length < 2) {
        this.clearSearchHighlight();
        return;
      }
      
      this.performSearch(query);
    });
  },

  performSearch(query) {
    const links = document.querySelectorAll('.doc-link');
    
    links.forEach(link => {
      const text = link.textContent.toLowerCase();
      const matches = text.includes(query);
      
      if (matches) {
        link.style.display = 'flex';
        link.classList.add('bg-blue-500/5');
      } else {
        link.style.display = 'none';
        link.classList.remove('bg-blue-500/5');
      }
    });
  },

  clearSearchHighlight() {
    document.querySelectorAll('.doc-link').forEach(link => {
      link.style.display = 'flex';
      link.classList.remove('bg-blue-500/5');
    });
  },

  // === MODO FOCUS ===
  
  toggleFocusMode() {
    const sidebar = document.querySelector('aside');
    const toc = document.getElementById('table-of-contents');
    const main = document.querySelector('main.ml-72');
    const btn = document.getElementById('focus-mode-btn');
    
    const isFocused = document.body.classList.toggle('focus-mode');
    
    if (isFocused) {
      sidebar?.classList.add('hidden');
      toc?.classList.add('hidden');
      main?.classList.remove('ml-72');
      main?.classList.add('max-w-4xl', 'mx-auto');
      btn?.querySelector('i').classList.replace('fa-expand', 'fa-compress');
    } else {
      sidebar?.classList.remove('hidden');
      toc?.classList.remove('hidden');
      main?.classList.add('ml-72');
      main?.classList.remove('max-w-4xl', 'mx-auto');
      btn?.querySelector('i').classList.replace('fa-compress', 'fa-expand');
    }
  },

  initFocusMode() {
    // Escape para salir del modo focus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
        this.toggleFocusMode();
      }
    });
  },

  // === MARCADORES ===
  
  attachBookmarkListeners() {
    document.querySelectorAll('.bookmark-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const docId = icon.getAttribute('data-bookmark');
        this.toggleBookmark(docId);
      });
    });
  },

  toggleBookmark(docId) {
    const index = this.bookmarks.indexOf(docId);
    
    if (index > -1) {
      this.bookmarks.splice(index, 1);
    } else {
      this.bookmarks.push(docId);
    }
    
    this.savePersistedData();
    this.renderBookmarks();
    
    // Actualizar icono en el menú
    const icon = document.querySelector(`.bookmark-icon[data-bookmark="${docId}"]`);
    if (icon) {
      if (this.bookmarks.includes(docId)) {
        icon.classList.remove('text-transparent', 'group-hover:text-slate-600');
        icon.classList.add('text-blue-500');
      } else {
        icon.classList.add('text-transparent', 'group-hover:text-slate-600');
        icon.classList.remove('text-blue-500');
      }
    }
  },

  renderBookmarks() {
    const section = document.getElementById('bookmarks-section');
    const list = document.getElementById('bookmarks-list');
    
    if (!section || !list) return;
    
    if (this.bookmarks.length === 0) {
      section.classList.add('hidden');
      return;
    }
    
    section.classList.remove('hidden');
    
    list.innerHTML = this.bookmarks.map(docId => {
      const doc = this.allDocs.find(d => d.id === docId);
      if (!doc) return '';
      
      return `
        <a href="?topic=${doc.id}" class="block text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded hover:bg-white/5 transition-all">
          <i class="fas fa-bookmark text-[8px] mr-2"></i>
          ${doc.title}
        </a>
      `;
    }).join('');
  },

  // === PRE-CARGA ===
  
  preloadNextDocument() {
    if (this.currentDocIndex < this.allDocs.length - 1) {
      const nextDoc = this.allDocs[this.currentDocIndex + 1];
      
      if (!this.cache.has(nextDoc.id)) {
        fetch(`/docs/content/${nextDoc.file}`)
          .then(res => res.text())
          .then(content => {
            this.cache.set(nextDoc.id, content);
            console.log('💾 [DOCS] Documento siguiente pre-cargado:', nextDoc.title);
          })
          .catch(err => console.warn('Failed to preload next doc:', err));
      }
    }
  },

  // === PERSISTENCIA ===
  
  loadPersistedData() {
    try {
      const saved = localStorage.getItem('docs_bookmarks');
      if (saved) {
        this.bookmarks = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load bookmarks:', e);
    }
  },

  savePersistedData() {
    try {
      localStorage.setItem('docs_bookmarks', JSON.stringify(this.bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks:', e);
    }
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

// Exponer globalmente para botones inline
window.DocsEngine = DocsEngine;

document.addEventListener('DOMContentLoaded', () => DocsEngine.init());
