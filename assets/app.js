    /**
     * QA MASTER PATH - PROFESSIONAL ENGINE v2.0
     * Gestión de Academia, Progreso Granular, XP, Logros y Persistencia.
    */

    // ==========================================
    // 1. CONFIGURACIÓN Y KEYS DE ALMACENAMIENTO
    // ==========================================
    const STORAGE_KEY = 'qa_master_progress';
    const SUBTASK_PROGRESS_KEY = 'qa_subtask_progress';
    const MODULE_NOTES_KEY = 'qa_module_notes';
    const CELEBRATED_BADGES_KEY = 'qa_celebrated_badges';

    // ==========================================
    // 2. DATA MAESTRA (12 SEMANAS / SPRINTS)
    // ==========================================
    const modules = [
        { 
            id: 1, 
            phase: 'Core', 
            title: 'Fundamentos de QA Sólidos', 
            duration: '8h',
            xp: 500,
            objective: 'Dominar la base teórica y aprender a pensar como un QA profesional.',
            schedule: [
                { day: 'Lunes', topic: 'Ciclos y Tipos de Prueba', task: 'Análisis de App Real: Elige una app y define fases del SDLC.' },
                { day: 'Martes', topic: 'HU y Criterios de Aceptación', task: 'Análisis de Requerimientos: Redacta 5 preguntas críticas para el PO.' },
                { day: 'Miércoles', topic: 'Técnicas de Diseño', task: 'Lógica de Pruebas: Aplica Clases de Equivalencia y Valores Límite.' },
                { day: 'Jueves', topic: 'Documentación de Casos', task: 'Estandarización: Crea casos con Precondiciones y Pasos profesionales.' },
                { day: 'Viernes', topic: 'Gestión de Defectos', task: 'Reporte de Bugs: Redacta 2 reportes técnicos con Severidad y Prioridad.' }
            ],
            deliverables: ['Documento SDLC/STLC', 'HU Analizada', 'Suite de 10 Casos', '2 Bug Reports'],
            resources: [
                { type: 'video', name: 'Masterclass: Intro a QA', url: '#' },
                { type: 'doc', name: 'ISTQB Foundation Guide', url: '#' }
            ]
        },
        { 
            id: 2, 
            phase: 'Core', 
            title: 'Agile QA & Exploratory', 
            duration: '6h',
            xp: 600,
            objective: 'Integrar el testing en marcos ágiles y dominar las pruebas no estructuradas.',
            schedule: [
                { day: 'Lunes', topic: 'Scrum para Testers', task: 'Define el rol del QA en Daily, Planning y Retrospective.' },
                { day: 'Martes', topic: 'Pruebas Exploratorias', task: 'Sesión de 30 min explorando una web (Charter Testing).' },
                { day: 'Miércoles', topic: 'Heurísticas de Testing', task: 'Aplica la heurística SFDPO para auditar una funcionalidad.' },
                { day: 'Jueves', topic: 'Mind Maps en QA', task: 'Crea un mapa mental de los flujos de una App.' },
                { day: 'Viernes', topic: 'Estimación', task: 'Usa Planning Poker para estimar el esfuerzo de una suite.' }
            ],
            deliverables: ['Exploratory Session Log', 'Mind Map de Producto'],
            resources: [{ type: 'video', name: 'Agile QA Workflow', url: '#' }]
        },
        { 
            id: 3, 
            phase: 'Technical', 
            title: 'SQL para Data Validation', 
            duration: '10h',
            xp: 800,
            objective: 'Validar la integridad de los datos directamente en la base de datos.',
            schedule: [
                { day: 'Lunes', topic: 'Fundamentos de DB', task: 'Modelado Entidad-Relación: Crea el esquema de una tienda.' },
                { day: 'Martes', topic: 'Queries Esenciales', task: 'Práctica SELECT, WHERE, LIKE y ORDER BY.' },
                { day: 'Miércoles', topic: 'Joins y Relaciones', task: 'Une tablas de Clientes y Órdenes para buscar inconsistencias.' },
                { day: 'Jueves', topic: 'Funciones Agregación', task: 'Valida totales de ventas y promedios mediante SQL.' },
                { day: 'Viernes', topic: 'Data Integrity', task: 'Detecta registros duplicados y valores nulos.' }
            ],
            deliverables: ['Script SQL de Pruebas', 'Reporte de Integridad'],
            resources: [{ type: 'code', name: 'SQL Sandbox Practice', url: '#' }]
        },
        { 
            id: 4, 
            phase: 'Technical', 
            title: 'Postman & API Testing', 
            duration: '12h',
            xp: 900,
            objective: 'Validar servicios REST sin depender de la interfaz gráfica.',
            schedule: [
                { day: 'Lunes', topic: 'Protocolo HTTP', task: 'Analiza Requests/Responses (Headers, Body, Status Codes).' },
                { day: 'Martes', topic: 'Collections', task: 'Crea una colección para probar una API pública.' },
                { day: 'Miércoles', topic: 'Environments', task: 'Configura entornos de Dev, QA y Prod.' },
                { day: 'Jueves', topic: 'Scripts JS', task: 'Escribe tests en JS para validar esquemas JSON.' },
                { day: 'Viernes', topic: 'Documentation', task: 'Genera documentación técnica desde Postman.' }
            ],
            deliverables: ['Colección Postman JSON', 'Suite de Tests de API'],
            resources: [{ type: 'flask', name: 'API Hands-on Lab', url: '#' }]
        },
        { 
            id: 5, 
            phase: 'Technical', 
            title: 'Terminal, Git & GitHub', 
            duration: '8h',
            xp: 750,
            objective: 'Dominar el flujo de trabajo de un ingeniero de software.',
            schedule: [
                { day: 'Lunes', topic: 'Bash Básico', task: 'Navega y manipula archivos mediante Terminal.' },
                { day: 'Martes', topic: 'Git Fundamentals', task: 'Inicia un repo, haz commits y entiende el Staging.' },
                { day: 'Miércoles', topic: 'Branching', task: 'Crea ramas (feature/fix) y realiza Merges.' },
                { day: 'Jueves', topic: 'Pull Requests', task: 'Sube código y simula un Code Review.' },
                { day: 'Viernes', topic: 'Conflictos', task: 'Provoca y soluciona un conflicto de merge.' }
            ],
            deliverables: ['Repo GitHub configurado'],
            resources: [{ type: 'code', name: 'Git Game Challenge', url: '#' }]
        },
        { 
            id: 6, 
            phase: 'Automation', 
            title: 'Playwright: First Scripts', 
            duration: '15h',
            xp: 1200,
            objective: 'Iniciar la automatización moderna de pruebas web.',
            schedule: [
                { day: 'Lunes', topic: 'Setup Node.js', task: 'Instala Playwright y configura proyecto en VS Code.' },
                { day: 'Martes', topic: 'Locators', task: 'Identifica elementos usando CSS y Playwright Locators.' },
                { day: 'Miércoles', topic: 'Interacciones', task: 'Automatiza clics, inputs y navegación.' },
                { day: 'Jueves', topic: 'Assertions', task: 'Valida estados de elementos (Visibility, Text).' },
                { day: 'Viernes', topic: 'Debugging', task: 'Usa el Inspector para debugear un script fallido.' }
            ],
            deliverables: ['Primer Script Automatizado'],
            resources: [{ type: 'video', name: 'Playwright Crash Course', url: '#' }]
        },
        { 
            id: 7, 
            phase: 'Automation', 
            title: 'Page Object Model (POM)', 
            duration: '14h',
            xp: 1500,
            objective: 'Arquitectar frameworks de automatización escalables.',
            schedule: [
                { day: 'Lunes', topic: 'Concepto POM', task: 'Refactoriza un script lineal separando locators.' },
                { day: 'Martes', topic: 'Clases y Métodos', task: 'Crea clases para Login y Dashboard.' },
                { day: 'Miércoles', topic: 'Data Driven', task: 'Usa archivos JSON para alimentar tus tests.' },
                { day: 'Jueves', topic: 'Hooks', task: 'Implementa BeforeEach y AfterEach.' },
                { day: 'Viernes', topic: 'Waits', task: 'Domina Auto-waits vs Explicit Waits.' }
            ],
            deliverables: ['Framework Base POM'],
            resources: [{ type: 'doc', name: 'POM Design Patterns', url: '#' }]
        },
        { 
            id: 8, 
            phase: 'Automation', 
            title: 'Advanced API Auto', 
            duration: '12h',
            xp: 1400,
            objective: 'Automatizar el backend con Playwright API Request.',
            schedule: [
                { day: 'Lunes', topic: 'APIRequestContext', task: 'Configura el cliente de API en Playwright.' },
                { day: 'Martes', topic: 'POST Requests', task: 'Automatiza creación de recursos y valida esquemas.' },
                { day: 'Miércoles', topic: 'Auth Tokens', task: 'Maneja Bearer Tokens para rutas protegidas.' },
                { day: 'Jueves', topic: 'E2E Hybrid', task: 'Crea dato por API y búscalo en la UI.' },
                { day: 'Viernes', topic: 'Reporting', task: 'Integra Allure Reports para resultados de API.' }
            ],
            deliverables: ['API Automation Suite'],
            resources: [{ type: 'flask', name: 'Hybrid Testing Lab', url: '#' }]
        },
        { 
            id: 9, 
            phase: 'Automation', 
            title: 'CI/CD GitHub Actions', 
            duration: '10h',
            xp: 1600,
            objective: 'Ejecutar pruebas en la nube de forma automática.',
            schedule: [
                { day: 'Lunes', topic: 'CI/CD Intro', task: 'Entiende el pipeline: Build -> Test -> Deploy.' },
                { day: 'Martes', topic: 'Workflows', task: 'Crea archivo .yml para disparar tests.' },
                { day: 'Miércoles', topic: 'Cloud Execution', task: 'Configura tests en Chromium y Firefox.' },
                { day: 'Jueves', topic: 'Artifacts', task: 'Configura descarga de reportes y capturas.' },
                { day: 'Viernes', topic: 'Cron Jobs', task: 'Programa ejecuciones nocturnas automáticas.' }
            ],
            deliverables: ['Pipeline CI/CD Funcional'],
            resources: [{ type: 'doc', name: 'GitHub Actions Docs', url: '#' }]
        },
        { 
            id: 10, 
            phase: 'Expert', 
            title: 'Mobile Testing', 
            duration: '12h',
            xp: 1800,
            objective: 'Aprender a testear aplicaciones en dispositivos móviles.',
            schedule: [
                { day: 'Lunes', topic: 'Mobile Web vs Native', task: 'Identifica diferencias críticas en el testing móvil.' },
                { day: 'Martes', topic: 'Emuladores', task: 'Configura Android Studio para pruebas locales.' },
                { day: 'Miércoles', topic: 'DevTools Mobile', task: 'Inspecciona elementos en vista de dispositivo.' },
                { day: 'Jueves', topic: 'Gestos', task: 'Define casos para Swipe, Pinch y Rotate.' },
                { day: 'Viernes', topic: 'Cloud Mobile', task: 'Prueba app en BrowserStack (Free Tier).' }
            ],
            deliverables: ['Estrategia Mobile Testing'],
            resources: [{ type: 'video', name: 'Appium for Beginners', url: '#' }]
        },
        { 
            id: 11, 
            phase: 'Expert', 
            title: 'Performance Testing', 
            duration: '10h',
            xp: 1900,
            objective: 'Medir velocidad y estabilidad bajo carga.',
            schedule: [
                { day: 'Lunes', topic: 'Web Vitals', task: 'Mide LCP y CLS usando Lighthouse.' },
                { day: 'Martes', topic: 'Network Throttling', task: 'Simula conexiones 3G y analiza red.' },
                { day: 'Miércoles', topic: 'Intro K6', task: 'Escribe script básico de carga para una URL.' },
                { day: 'Jueves', topic: 'Stress Testing', task: 'Define límites de la App mediante stress.' },
                { day: 'Viernes', topic: 'Latency Analysis', task: 'Identifica cuellos de botella en peticiones.' }
            ],
            deliverables: ['Reporte Lighthouse', 'Script K6'],
            resources: [{ type: 'code', name: 'K6 Load Test Script', url: '#' }]
        },
        { 
            id: 12, 
            phase: 'Expert', 
            title: 'Final Project', 
            duration: '20h',
            xp: 3000,
            objective: 'Consolidar todo el aprendizaje en un portafolio de élite.',
            schedule: [
                { day: 'Lunes', topic: 'Plan Maestro', task: 'Define el Plan de Pruebas Maestro del proyecto.' },
                { day: 'Martes', topic: 'E2E Execution', task: 'Combina API + UI en una suite completa.' },
                { day: 'Miércoles', topic: 'GitHub README', task: 'Organiza el repo con documentación técnica.' },
                { day: 'Jueves', topic: 'Simulacro Interview', task: 'Prepara respuestas técnicas y de comportamiento.' },
                { day: 'Viernes', topic: 'Graduación', task: 'Presenta el dashboard con todos los badges.' }
            ],
            deliverables: ['Portafolio Final QA Engineer'],
            resources: [{ type: 'flask', name: 'Final Lab Challenge', url: '#' }]
        }
    ];

    // ==========================================
    // 3. CORE LOGIC: PROGRESO Y PERSISTENCIA
    // ==========================================
    function getProgress() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    }

    function getSubtaskProgress() {
        return JSON.parse(localStorage.getItem(SUBTASK_PROGRESS_KEY) || '{}');
    }

    function toggleModule(id, isChecked) {
        const progress = getProgress();
        progress[id] = isChecked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        
        const msg = isChecked ? `Sprint ${id} completado +XP!` : `Sprint ${id} reiniciado`;
        showToast(msg, isChecked ? 'success' : 'info');
    }

    function toggleSubtask(moduleId, taskIndex) {
        const subProgress = getSubtaskProgress();
        const key = `${moduleId}-${taskIndex}`;
        subProgress[key] = !subProgress[key];
        localStorage.setItem(SUBTASK_PROGRESS_KEY, JSON.stringify(subProgress));
    }

    // ==========================================
    // 4. SISTEMA DE NOTAS Y LOGROS
    // ==========================================
    function saveModuleNote(moduleId, note) {
        const notes = JSON.parse(localStorage.getItem(MODULE_NOTES_KEY) || '{}');
        notes[moduleId] = note;
        localStorage.setItem(MODULE_NOTES_KEY, JSON.stringify(notes));
    }

    function getModuleNote(moduleId) {
        const notes = JSON.parse(localStorage.getItem(MODULE_NOTES_KEY) || '{}');
        return notes[moduleId] || "";
    }

    function getCelebratedBadges() {
        return JSON.parse(localStorage.getItem(CELEBRATED_BADGES_KEY) || '[]');
    }

    function markBadgeAsCelebrated(badgeId) {
        const celebrated = getCelebratedBadges();
        if (!celebrated.includes(badgeId)) {
            celebrated.push(badgeId);
            localStorage.setItem(CELEBRATED_BADGES_KEY, JSON.stringify(celebrated));
        }
    }

    function getBadgeStatus() {
        const progress = getProgress();
        return {
            core: progress[1] === true && progress[2] === true,
            technical: progress[3] === true && progress[4] === true && progress[5] === true,
            automation: progress[6] === true && progress[7] === true && progress[8] === true && progress[9] === true,
            expert: progress[10] === true && progress[11] === true && progress[12] === true
        };
    }

    // ==========================================
    // 5. ANALYTICS (DASHBOARD)
    // ==========================================
    function getAnalytics() {
        const progress = getProgress();
        const completed = Object.values(progress).filter(v => v === true).length;
        
        // Sumar XP de módulos completados
        const totalXP = modules.reduce((acc, m) => progress[m.id] ? acc + m.xp : acc, 0);

        return {
            completedModules: completed,
            totalProgress: Math.round((completed / modules.length) * 100) || 0,
            xp: totalXP
        };
    }

    // ==========================================
    // 6. UI FEEDBACK (TOASTS)
    // ==========================================
    function showToast(message, type = 'success') {
        const old = document.querySelector('.qa-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        const colors = { 
            success: 'border-emerald-500 text-emerald-400', 
            info: 'border-blue-500 text-blue-400', 
            error: 'border-red-500 text-red-400' 
        };
        
        toast.className = `qa-toast fixed bottom-10 right-8 px-6 py-4 rounded-2xl bg-slate-900 border-b-4 ${colors[type]} z-[200] shadow-2xl transition-all duration-500 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3`;
        toast.innerHTML = `<i class="fas fa-info-circle"></i><span>${message}</span>`;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }