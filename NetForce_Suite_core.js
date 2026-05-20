class DashboardCore {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.views = document.querySelectorAll('.view-module');
        this.initRouting();
    }

    initRouting() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetView = e.currentTarget.getAttribute('data-view');

                // Update Nav State
                this.navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Update View State
                this.views.forEach(view => {
                    view.classList.remove('active');
                    setTimeout(() => {
                        if(view.id !== targetView) view.style.display = 'none';
                    }, 300); // Wait for fade out
                });

                const activeView = document.getElementById(targetView);
                activeView.style.display = 'flex';
                // Trigger reflow for animation
                void activeView.offsetWidth;
                activeView.classList.add('active');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new DashboardCore());