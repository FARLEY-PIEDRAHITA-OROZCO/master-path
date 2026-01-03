/**
 * STORAGE SERVICE - QA MASTER PATH
 * Responsabilidad: Gestión exclusiva de persistencia.
 */

const KEYS = {
    PROGRESS: 'qa_master_progress',
    SUBTASKS: 'qa_subtask_progress',
    NOTES: 'qa_module_notes',
    BADGES: 'qa_celebrated_badges'
};

export const StorageService = {
    get(key) {
        return JSON.parse(localStorage.getItem(key) || (key === KEYS.BADGES ? '[]' : '{}'));
    },

    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    toggleProgress(id, isChecked) {
        const progress = this.get(KEYS.PROGRESS);
        progress[id] = isChecked;
        this.save(KEYS.PROGRESS, progress);
        return isChecked;
    },

    toggleSubtask(moduleId, taskIndex) {
        const subProgress = this.get(KEYS.SUBTASKS);
        const key = `${moduleId}-${taskIndex}`;
        subProgress[key] = !subProgress[key];
        this.save(KEYS.SUBTASKS, subProgress);
        return subProgress[key];
    }
};

export { KEYS };