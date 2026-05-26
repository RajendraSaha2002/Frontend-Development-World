/**
 * Master Controller for QNetSim Pro
 * Handles Navigation Routing and Global State
 */
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.workspace-module');
    const viewTitle = document.getElementById('view-title');

    navItems.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Manage Active Nav State
            navItems.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Manage View Visibility
            const target = e.currentTarget.getAttribute('data-target');
            modules.forEach(m => {
                m.classList.remove('active');
                m.classList.add('hidden');
            });
            document.getElementById(target).classList.remove('hidden');
            document.getElementById(target).classList.add('active');

            // Update Header Title
            viewTitle.textContent = e.currentTarget.textContent;

            // Trigger window resize to refit canvas elements
            window.dispatchEvent(new Event('resize'));
        });
    });

    // Global Fidelity Fluctuation Simulation
    const fidelityMetric = document.getElementById('fidelity-metric');
    setInterval(() => {
        if(window.isSimulating) {
            const base = 0.980;
            const variance = (Math.random() * 0.015) - 0.005;
            fidelityMetric.textContent = (base + variance).toFixed(3);
        }
    }, 1500);
});