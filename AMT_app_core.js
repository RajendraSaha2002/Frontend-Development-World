/**
 * Master Controller for OmniGuard AMT
 * Handles UI routing and global dashboard state.
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
            document.getElementById(target).classList.remove('hidden');
            document.getElementById(target).classList.add('active');

            // Update Header
            viewTitle.textContent = e.currentTarget.textContent;

            // Trigger window resize to refit canvas elements
            window.dispatchEvent(new Event('resize'));
        });
    });
});