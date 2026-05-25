/**
 * Core Orchestration Module
 * Handles UI routing and view state management.
 */
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.workspace-module');
    const viewTitle = document.getElementById('view-title');

    navItems.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Reset active states
            navItems.forEach(nav => nav.classList.remove('active'));
            modules.forEach(mod => {
                mod.classList.remove('active');
                mod.classList.add('hidden');
            });

            // Set new active state
            const targetId = e.target.getAttribute('data-target');
            e.target.classList.add('active');

            const targetModule = document.getElementById(targetId);
            targetModule.classList.remove('hidden');
            targetModule.classList.add('active');

            // Update Header Title
            viewTitle.textContent = e.target.textContent;

            // Dispatch resize to trigger native canvas redraws
            window.dispatchEvent(new Event('resize'));
        });
    });
});