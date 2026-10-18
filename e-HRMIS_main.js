/**
 * Master Application Bootstrap & Router Controller
 */
const MainApp = (() => {
    // Routing Navigation Bus
    function initRouter() {
        const navItems = document.querySelectorAll('.nav-menu .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabTarget = item.getAttribute('data-tab');
                navigate(tabTarget);
            });
        });
    }

    function navigate(viewName) {
        // Nav state
        document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-menu .nav-item[data-tab="${viewName}"]`);
        if (activeNav) activeNav.classList.add('active');

        // View state
        document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) targetView.classList.add('active');
    }

    // Generic Modal Handlers
    function openModal(title, htmlContent) {
        const backdrop = document.getElementById('modalBackdrop');
        const mTitle = document.getElementById('modalTitle');
        const mBody = document.getElementById('modalBody');
        if (!backdrop) return;

        mTitle.textContent = title;
        mBody.innerHTML = htmlContent;
        backdrop.classList.add('open');
    }

    function closeModal() {
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) backdrop.classList.remove('open');
    }

    // Digital Signature Notification Simulation
    function triggerDigitalSignatureToast(msg) {
        const toast = document.getElementById('sigToast');
        const signer = document.getElementById('sigSigner');
        if (!toast) return;

        if (msg) signer.textContent = msg;
        toast.classList.add('visible');
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 4000);
    }

    // Persona / Role Switcher simulation
    function initRoleSwitcher() {
        const select = document.getElementById('userRoleSelector');
        select?.addEventListener('change', (e) => {
            const role = e.target.value;
            const roleName = e.target.options[e.target.selectedIndex].text;
            document.getElementById('headerUserRole').textContent = roleName;
            NotificationsModule.dispatchToast(`Switched active context to: ${roleName}`);
        });
    }

    // Bootstrap Charts according to specifications in the original document
    function renderAnalyticsCharts() {
        // 1. Male vs Female Ratio Chart (Matching specification: 411 Male (40.5%) vs 604 Female (59.5%))
        ChartEngine.renderDonut('genderRatioChartContainer', [
            { label: 'Male', value: 411, color: '#3b82f6' },
            { label: 'Female', value: 604, color: '#ec4899' }
        ], 1015);

        // 2. Contractual vs Permanent Ratio Chart
        ChartEngine.renderDonut('contractDonutChartContainer', [
            { label: 'Permanent', value: 680, color: '#10b981' },
            { label: 'Contractual', value: 240, color: '#f59e0b' },
            { label: 'Deputation', value: 95, color: '#6366f1' }
        ], 1015);

        const contractLegend = document.getElementById('contractLegend');
        if (contractLegend) {
            contractLegend.innerHTML = `
        <span><span style="color:#10b981">■</span> Permanent (680)</span>
        <span><span style="color:#f59e0b">■</span> Contractual (240)</span>
        <span><span style="color:#6366f1">■</span> Deputation (95)</span>
      `;
        }

        // 3. Multi-Year Man-power Cost Bar Chart (Matching specification trend layout)
        ChartEngine.renderBarChart('manpowerCostChartContainer', [
            { year: '2020', cost: 18.4 },
            { year: '2021', cost: 21.2 },
            { year: '2022', cost: 27.6 },
            { year: '2023', cost: 29.8 },
            { year: '2024', cost: 34.5 }
        ]);
    }

    // Global App Initialization
    function bootstrap() {
        initRouter();
        initRoleSwitcher();

        // Initialize modules
        AttendanceModule.init();
        EmployeeModule.init();
        RecruitmentModule.init();
        TransferModule.init();
        PayrollModule.init();
        ReportsModule.init();
        NotificationsModule.init();

        // Render Data Visualizations
        renderAnalyticsCharts();

        // Bind Modal Close Buttons
        document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
        document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
            if (e.target.id === 'modalBackdrop') closeModal();
        });
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    return {
        navigate,
        openModal,
        closeModal,
        triggerDigitalSignatureToast
    };
})();

// Global router exposure for inline HTML event handlers
window.appRouter = MainApp;