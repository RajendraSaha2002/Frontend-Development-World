/**
 * Q-MetroNet Viewport Routing Management
 */
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const modules = document.querySelectorAll('.qm-module-view');
    const headerTitle = document.getElementById('current-view-title');

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const targetModuleId = e.currentTarget.getAttribute('data-target');

            modules.forEach(mod => {
                mod.classList.remove('active');
                mod.classList.add('hidden');
            });

            const currentActiveView = document.getElementById(targetModuleId);
            currentActiveView.classList.remove('hidden');
            currentActiveView.classList.add('active');

            headerTitle.textContent = `Workspace: ${e.currentTarget.textContent}`;

            // Trigger resize to fix SVG layout issues on unhide
            window.dispatchEvent(new Event('resize'));
        });
    });
});