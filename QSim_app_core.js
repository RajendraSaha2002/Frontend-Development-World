/**
 * Core Application Controller
 * Handles Navigation, Global State, and Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    const navBtns = document.querySelectorAll('.nav-btn');
    const viewPanels = document.querySelectorAll('.view-panel');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Manage Tab Activation
            navBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Manage View Panel Display
            const targetId = e.currentTarget.getAttribute('data-target');
            viewPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.classList.add('hidden');
            });

            const activePanel = document.getElementById(targetId);
            activePanel.classList.remove('hidden');
            activePanel.classList.add('active');

            // Dispatch resize to trigger native canvas redraws in the chart
            window.dispatchEvent(new Event('resize'));
        });
    });
});