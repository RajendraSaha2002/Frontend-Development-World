// Central Orchestrator binding UI and Engine
const AppController = {
    init() {
        UI.init();
        this.bindEvents();
    },

    bindEvents() {
        // Search Filter logic
        document.getElementById('course-search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = GLAMS_DB.courses.filter(c => c.name.toLowerCase().includes(term));
            UI.renderCourses(filtered);
        });

        // Restart button logic
        document.getElementById('btn-restart').addEventListener('click', () => {
            UI.switchView('view-dashboard');
            document.querySelector('.p1-fill').style.width = '100%';
        });
    },

    startWar(course) {
        window.AppEngine.initMatch(course);
    }
};

// Global Exposure and Initialization
window.App = AppController;
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});