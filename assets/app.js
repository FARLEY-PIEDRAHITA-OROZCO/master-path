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