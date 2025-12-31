// assets/components.js

const components = {
    // 1. TEMPLATE DE LA CABECERA (NAVBAR)
    navbar: `
    <nav class="fixed top-0 left-0 w-full glass-panel z-50 px-8 h-16 flex justify-between items-center border-b border-white/5">
        <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-900/40">QA</div>
            <span class="font-extrabold tracking-tighter text-xl uppercase text-white">Master<span class="text-blue-500 italic">Path</span></span>
        </div>
        <div id="nav-links" class="space-x-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <a href="index.html" data-page="index.html" class="hover:text-white transition">Inicio</a>
            <a href="roadmap.html" data-page="roadmap.html" class="hover:text-white transition">Semanas</a>
            <a href="toolbox.html" data-page="toolbox.html" class="hover:text-white transition">Toolbox</a>
        </div>
    </nav>
    `,

    // 2. TEMPLATE DEL PIE DE PÁGINA (FOOTER)
    footer: `
    <footer class="mt-20 pt-8 border-t border-white/5 pb-12 px-6">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex flex-col">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 text-center md:text-left">System Engineering</span>
                <p class="text-[11px] text-slate-600 italic">Data persistence via LocalStorage. Portability: JSON-enabled.</p>
            </div>
        </div>
    </footer>
    `
};

// Función para inyectar los componentes
function initComponents() {
    // Inyectar Navbar al inicio del body
    const header = document.createElement('header');
    header.innerHTML = components.navbar;
    document.body.prepend(header);

    // Inyectar Footer al final del body
    const footer = document.createElement('div');
    footer.innerHTML = components.footer;
    document.body.appendChild(footer);

    // Resaltar link activo
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll('#nav-links a');
    links.forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.remove('text-slate-400');
            link.classList.add('text-white', 'border-b-2', 'border-blue-500', 'pb-1');
        }
    });
}

document.addEventListener('DOMContentLoaded', initComponents);