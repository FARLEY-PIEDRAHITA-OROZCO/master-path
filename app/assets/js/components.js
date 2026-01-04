/**
 * UI Components Module
 * Maneja la inyección de elementos comunes (Navbar/Footer)
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
                
                <!-- User Menu -->
                <div class="relative">
                    <button id="user-menu-btn" class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all" data-testid="user-menu-button">
                        <i class="fas fa-user-circle text-blue-500 text-lg"></i>
                        <i class="fas fa-chevron-down text-slate-500 text-xs"></i>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                        <div class="p-4 border-b border-white/5">
                            <p id="user-name-display" class="text-sm font-bold text-white mb-1 truncate">Cargando...</p>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2" id="user-rank-display">Cargando rango...</p>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-star text-blue-500 text-xs"></i>
                                <p class="text-xs text-slate-400" id="user-xp-display">0 XP</p>
                            </div>
                            <p id="user-email-display" class="text-[10px] text-slate-500 mt-2 truncate">Cargando email...</p>
                        </div>
                        <button id="logout-btn" class="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2" data-testid="logout-button">
                            <i class="fas fa-sign-out-alt"></i>
                            Cerrar Sesión
                        </button>
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
      // Verificamos si el path actual termina con el href del link
      // Agregamos lógica para manejar parámetros (como ?topic=...)
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
    // Toggle dropdown menu
    const menuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailDisplay = document.getElementById('user-email-display');

    if (!menuBtn || !dropdown || !logoutBtn) {
      console.log('[COMPONENTS] User menu elements not found - skipping setup');
      return;
    }

    // Toggle dropdown on click
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', async () => {
      try {
        // Importar authService dinámicamente
        const { authService } = await import('./auth-service.js');
        
        console.log('🚪 [COMPONENTS] Cerrando sesión...');
        
        // Mostrar loading
        logoutBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> Cerrando sesión...';
        logoutBtn.disabled = true;
        
        // Cerrar sesión
        const result = await authService.logout();
        
        if (result.success) {
          console.log('✅ [COMPONENTS] Sesión cerrada exitosamente');
          // Redirigir a login
          window.location.href = '/app/pages/auth.html';
        } else {
          console.error('❌ [COMPONENTS] Error al cerrar sesión:', result.error);
          alert('Error al cerrar sesión. Por favor intenta de nuevo.');
          logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
          logoutBtn.disabled = false;
        }
      } catch (error) {
        console.error('❌ [COMPONENTS] Error crítico en logout:', error);
        alert('Error al cerrar sesión. Por favor intenta de nuevo.');
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
        logoutBtn.disabled = false;
      }
    });

    // Display user email
    this.loadUserEmail(userEmailDisplay);
  },

  async loadUserEmail(displayElement) {
    try {
      // Importar authService dinámicamente
      const { authService } = await import('./auth-service.js');
      
      // Esperar a que authService esté inicializado
      if (!authService.isInitialized) {
        await authService.init();
      }
      
      const user = authService.getCurrentUser();
      
      if (user && user.email && displayElement) {
        displayElement.textContent = user.email;
      } else if (displayElement) {
        displayElement.textContent = 'Usuario';
      }
    } catch (error) {
      console.error('❌ [COMPONENTS] Error al cargar email del usuario:', error);
      if (displayElement) {
        displayElement.textContent = 'Usuario';
      }
    }
  },
};
