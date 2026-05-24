/**
 * Core Orchestration Module for Rakshak Dashboard
 * Manages view routing and global event state.
 */
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.workspace-module');
    const viewTitle = document.getElementById('view-title');

    // Navigation Routing
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

            // Trigger window resize to force Canvas re-draws when unhidden
            window.dispatchEvent(new Event('resize'));
        });
    });

    // Global QPS Counter Simulation
    const qpsCounter = document.getElementById('qps-counter');
    setInterval(() => {
        // Simulating heavy enterprise DNS load (e.g., 40k - 60k queries per second)
        const baseQPS = 45000;
        const variance = Math.floor(Math.random() * 15000);
        qpsCounter.textContent = (baseQPS + variance).toLocaleString();
    }, 1000);
});