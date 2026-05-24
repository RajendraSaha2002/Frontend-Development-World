/**
 * Master Controller for TANGO Dashboard
 * Handles UI routing and tab switching.
 */
document.addEventListener('DOMContentLoaded', () => {
    const navBtns = document.querySelectorAll('.nav-btn');
    const modules = document.querySelectorAll('.module-view');
    const viewTitle = document.getElementById('current-view-title');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Manage Active Nav State
            navBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Manage View Visibility
            const target = e.currentTarget.getAttribute('data-target');
            modules.forEach(m => {
                m.classList.remove('active');
                m.classList.add('hidden');
            });

            const targetEl = document.getElementById(target);
            targetEl.classList.remove('hidden');
            targetEl.classList.add('active');

            // Update Header Title
            viewTitle.textContent = e.currentTarget.textContent;

            // Dispatch resize event to fix canvas dimensions when unhidden
            window.dispatchEvent(new Event('resize'));
        });
    });
});