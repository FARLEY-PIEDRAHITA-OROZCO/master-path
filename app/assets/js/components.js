/**
 * UI Components Module
 * Maneja la inyección de elementos comunes (Navbar/Footer)
 * Versión sin autenticación
 */

export const UIComponents = {
  templates: {
    navbar: `
        <nav class="fixed top-0 left-0 w-full glass-panel z-50 px-8 h-16 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
            <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-900/40">QA</div>
                <span class="font-extrabold tracking-tighter text-xl uppercase text-white">Master<span class="text-blue-500 italic">Path</span></span>
            </div>
            <div class="flex items-center space-x-8">
                <div id="nav-links" class="flex items-center space-x-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <a href="dashboard.html" class="nav-item hover:text-white transition-colors">Inicio</a>
                    <a href="roadmap.html" class="nav-item hover:text-white transition-colors">Semanas</a>
                    
                    <a href="knowledge-base.html" class="nav-item hover:text-blue-400 transition-colors flex items-center gap-2">
                        <span class="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                        Docs
                    </a>

                    <a href="toolbox.html" class="nav-item hover:text-white transition-colors">Toolbox</a>
                </div>
                
                <!-- User Menu (simplified without auth) -->
                <div class="relative">
                    <button id="user-menu-btn" class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all" data-testid="user-menu-button">
                        <i class="fas fa-user-circle text-blue-500 text-lg"></i>
                        <i class="fas fa-chevron-down text-slate-500 text-xs"></i>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                        <div class="p-4 border-b border-white/5">
                            <p id="user-name-display" class="text-sm font-bold text-white mb-1 truncate">Usuario Local</p>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2" id="user-rank-display">Junior Talent</p>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-star text-blue-500 text-xs"></i>
                                <p class="text-xs text-slate-400" id="user-xp-display">0 XP</p>
                            </div>
                            <p id="user-email-display" class="text-[10px] text-slate-500 mt-2 truncate">Modo local</p>
                        </div>
                        <div class="p-3">
                            <p class="text-[10px] text-slate-600 italic text-center">Datos guardados localmente</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        `,
    footer: `
        <footer class="relative z-50 mt-20 pt-8 border-t border-white/5 pb-12 px-6 bg-slate-950">
            <div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 text-center md:text-left">System Engineering</span>
                    <p class="text-[11px] text-slate-600 italic">Data persistence via LocalStorage. Portability: JSON-enabled.</p>
                </div>
            </div>
        </footer>
        `,
  },

  init() {
    this.render();
    this.highlightActiveLink();
    this.setupUserMenu();
  },

  render() {
    // Inyectar Navbar
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = this.templates.navbar;
    document.body.prepend(headerContainer);

    // Inyectar Footer
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = this.templates.footer;
    document.body.appendChild(footerContainer);
  },

  highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-item');

    links.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (
        currentPath.includes(linkPath) ||
        (currentPath.endsWith('/') && linkPath === 'index.html')
      ) {
        link.classList.remove('text-slate-400');
        link.classList.add('text-white', 'border-b-2', 'border-blue-500', 'pb-1');
      }
    });
  },

  setupUserMenu() {
    const menuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');

    if (!menuBtn || !dropdown) {
      console.log('[COMPONENTS] User menu elements not found - skipping setup');
      return;
    }

    // Toggle dropdown on click
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
      
      if (!dropdown.classList.contains('hidden')) {
        this.loadUserInfo();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Load user info initially
    this.loadUserInfo();
  },

  async loadUserInfo() {
    const nameDisplay = document.getElementById('user-name-display');
    const emailDisplay = document.getElementById('user-email-display');
    const rankDisplay = document.getElementById('user-rank-display');
    const xpDisplay = document.getElementById('user-xp-display');

    try {
      const { AppEngine } = await import('./app.js');
      
      // Asegurar que AppEngine esté inicializado
      if (!AppEngine.modules || AppEngine.modules.length === 0) {
        await AppEngine.init();
      }
      
      const stats = AppEngine.getAnalytics();
      
      // Mostrar nombre genérico
      if (nameDisplay) {
        nameDisplay.textContent = 'Usuario Local';
      }
      
      // Mostrar modo local
      if (emailDisplay) {
        emailDisplay.textContent = 'Datos guardados localmente';
      }
      
      // Mostrar XP
      if (xpDisplay) {
        xpDisplay.textContent = `${stats.xp.toLocaleString()} XP`;
      }
      
      // Calcular y mostrar rango
      if (rankDisplay) {
        const ranks = [
          { min: 10000, name: 'Senior QA Automation' },
          { min: 5000, name: 'QA Engineer Mid' },
          { min: 1000, name: 'Technical QA Tester' },
          { min: 0, name: 'Junior Talent' },
        ];
        const currentRank = ranks.find(r => stats.xp >= r.min);
        rankDisplay.textContent = currentRank ? currentRank.name : 'Junior Talent';
      }
    } catch (error) {
      console.error('❌ [COMPONENTS] Error al cargar información del usuario:', error);
      if (nameDisplay) nameDisplay.textContent = 'Usuario';
      if (emailDisplay) emailDisplay.textContent = 'Modo local';
      if (xpDisplay) xpDisplay.textContent = '0 XP';
      if (rankDisplay) rankDisplay.textContent = 'Junior Talent';
    }
  },
};
