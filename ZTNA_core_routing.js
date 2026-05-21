// Handles view switching between the sidebar menu and the main content area
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('current-page-title');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active states
            navButtons.forEach(b => b.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active', 'hidden'));

            // Add active states
            const targetId = e.currentTarget.getAttribute('data-target');
            e.currentTarget.classList.add('active');

            viewSections.forEach(v => {
                if(v.id === targetId) {
                    v.classList.add('active');
                } else {
                    v.classList.add('hidden');
                }
            });

            // Update Header
            pageTitle.textContent = e.currentTarget.textContent.trim();

            // Trigger resize for Canvas to redraw properly
            window.dispatchEvent(new Event('resize'));
        });
    });
});