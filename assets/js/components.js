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
            <div id="nav-links" class="flex items-center space-x-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <a href="index.html" class="nav-item hover:text-white transition-colors">Inicio</a>
                <a href="roadmap.html" class="nav-item hover:text-white transition-colors">Semanas</a>
                
                <a href="knowledge-base.html" class="nav-item hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span class="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                    Docs
                </a>

                <a href="toolbox.html" class="nav-item hover:text-white transition-colors">Toolbox</a>
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
        `
    },

    init() {
        this.render();
        this.highlightActiveLink();
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
            if (currentPath.includes(linkPath) || (currentPath.endsWith('/') && linkPath === 'index.html')) {
                link.classList.remove('text-slate-400');
                link.classList.add('text-white', 'border-b-2', 'border-blue-500', 'pb-1');
            }
        });
    }
};