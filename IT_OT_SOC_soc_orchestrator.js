/**
 * Master Controller Module
 * Handles viewport page routing and standard global event timelines.
 */
class SocOrchestrator {
    constructor() {
        this.activeModule = 'unified-dashboard';
        this.globalAnomalyCount = 0;
        this.initViewportNavigation();
        this.startGlobalClock();
    }

    initViewportNavigation() {
        const tabTriggers = document.querySelectorAll('.nav-tab-trigger');
        const modules = document.querySelectorAll('.soc-viewport-module');

        tabTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabTriggers.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const targetView = e.currentTarget.getAttribute('data-view');
                this.activeModule = targetView;

                modules.forEach(m => m.classList.remove('active'));
                document.getElementById(targetView).classList.add('active');

                // Trigger canvas resizing checks instantly upon display shift
                window.dispatchEvent(new Event('resize'));
            });
        });
    }

    startGlobalClock() {
        const itLogEpsValue = document.getElementById('it-log-eps');
        const otFrameEpsValue = document.getElementById('ot-frame-eps');

        setInterval(() => {
            const simulatedItEps = Math.floor(Math.random() * 80) + 240;
            const simulatedOtFps = Math.floor(Math.random() * 25) + 95;

            if (itLogEpsValue) itLogEpsValue.textContent = `${simulatedItEps} EPS`;
            if (otFrameEpsValue) otFrameEpsValue.textContent = `${simulatedOtFps} FPS`;
        }, 1000);
    }

    incrementAnomalyCounter(count = 1) {
        this.globalAnomalyCount += count;
        const countDisplay = document.getElementById('global-anomaly-counter');
        const shell = document.querySelector('.scada-matrix-shell');
        const badge = document.getElementById('master-system-status');

        if (countDisplay) countDisplay.textContent = this.globalAnomalyCount;

        if (this.globalAnomalyCount > 0) {
            if (shell) shell.classList.add('breached-state');
            if (badge) {
                badge.textContent = 'GRID SECURITY INCIDENT DETECTED';
                badge.className = 'infrastructure-health-indicator incident-active';
            }
        } else {
            if (shell) shell.classList.remove('breached-state');
            if (badge) {
                badge.textContent = 'GRID STATUS: NORMAL';
                badge.className = 'infrastructure-health-indicator';
            }
        }
    }
}

window.MasterSOCController = new SocOrchestrator();