/**
 * Master Application Bootstrap & Global Event Router
 */
const MainApp = (() => {

    function initRouter() {
        document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                navigate(tab);
            });
        });
    }

    function navigate(viewName) {
        document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
        const targetNav = document.querySelector(`.nav-menu .nav-item[data-tab="${viewName}"]`);
        if (targetNav) targetNav.classList.add('active');

        document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) targetView.classList.add('active');
    }

    function openModal(title, content) {
        const backdrop = document.getElementById('modalBackdrop');
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        backdrop.classList.add('open');
    }

    function closeModal() {
        document.getElementById('modalBackdrop').classList.remove('open');
    }

    function triggerToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: #0c4a6e;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 13px;
      z-index: 150;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border-left: 4px solid #38bdf8;
    `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    function triggerCryptographicToast(msg) {
        const toast = document.getElementById('sigToast');
        if (msg) document.getElementById('sigSigner').textContent = msg;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 4000);
    }

    // Feature #7: Free Text Search on Proposal (Dropdown scanning)
    function initFreeTextSearch() {
        const input = document.getElementById('globalProposalSearch');
        const dropdown = document.getElementById('searchResultsDropdown');

        input?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (!q) {
                dropdown.style.display = 'none';
                return;
            }

            const results = AppState.get('proposals').filter(p =>
                p.id.toLowerCase().includes(q) ||
                p.title.toLowerCase().includes(q) ||
                p.pi.toLowerCase().includes(q) ||
                p.abstract.toLowerCase().includes(q)
            );

            if (!results.length) {
                dropdown.innerHTML = `<div class="search-item text-muted">No matching proposals found for "${q}"</div>`;
            } else {
                dropdown.innerHTML = results.map(r => `
          <div class="search-item" onclick="MainApp.inspectProposal('${r.id}')">
            <strong>${r.id}</strong>: ${r.title}
            <div style="font-size:11px; color:#64748b;">PI: ${r.pi} | Stage ${r.stage}</div>
          </div>
        `).join('');
            }
            dropdown.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search-wrap')) {
                dropdown.style.display = 'none';
            }
        });
    }

    function inspectProposal(propId) {
        const p = AppState.get('proposals').find(item => item.id === propId);
        if (!p) return;
        openModal(`Proposal Dossier: ${p.id}`, `
      <div style="font-size:13px; line-height:1.6;">
        <h4>${p.title}</h4>
        <p style="color:#0284c7; margin-bottom:10px;">${p.domain} | Host: ${p.institute}</p>
        <p><strong>Principal Investigator:</strong> ${p.pi}</p>
        <p><strong>Proposed Budget:</strong> ₹ ${p.budget.toFixed(2)} Lakhs</p>
        <p><strong>Lifecycle Stage:</strong> Stage ${p.stage} of 8</p>
        <div style="margin-top:12px; background:#f8fafc; padding:10px; border-radius:4px;">
          <strong>Abstract:</strong><br>${p.abstract}
        </div>
      </div>
    `);
    }

    // Feature #3: Newsletter Modal
    function openNewsletterModal() {
        openModal('R&D Information Bulletin & Calls for Proposals', `
      <div style="font-size:13px; line-height:1.6;">
        <h4>Quarterly National Grants Circular</h4>
        <p style="color:#64748b; font-size:11px;">Issue 2024-Q3 | Directorate of Research Grants</p>
        <hr style="margin:10px 0; border:none; border-top:1px solid #e2e8f0;">
        <ul style="padding-left:18px;">
          <li><strong>Thrust Area 1:</strong> Special bilateral calls for Green Hydrogen and Offshore Wind Energy.</li>
          <li><strong>Thrust Area 2:</strong> Fellowship grant awards for Early-Career Researchers (Budget ceiling ₹ 60 Lakhs).</li>
          <li><strong>Compliance Update:</strong> Mandatory filing of Statement of Expenditure (SE) by the 15th of next month.</li>
        </ul>
      </div>
    `);
    }

    function openNotificationCenter() {
        const drawer = document.getElementById('notificationDrawer');
        const feed = document.getElementById('notificationFeed');
        const notifs = AppState.get('notifications');

        feed.innerHTML = notifs.map(n => `
      <div class="notif-item">
        <strong>[${n.type}]</strong> ${n.text}
        <div style="font-size:10px; color:#64748b; margin-top:2px;">${n.time}</div>
      </div>
    `).join('');

        drawer.classList.add('open');
    }

    function renderVisualizations() {
        // 1. R&D Thrust Area Donut Chart
        ChartEngine.renderDonut('domainDonutChartContainer', [
            { label: 'Ocean Engineering', value: 340, color: '#0284c7' },
            { label: 'Quantum Systems', value: 290, color: '#6366f1' },
            { label: 'Biotechnology', value: 480, color: '#0d9488' },
            { label: 'Clean Energy', value: 372, color: '#f59e0b' }
        ], 1482);

        const legendEl = document.getElementById('domainLegend');
        if (legendEl) {
            legendEl.innerHTML = `
        <span><span style="color:#0284c7">■</span> Ocean Engg (340)</span>
        <span><span style="color:#6366f1">■</span> Quantum (290)</span>
        <span><span style="color:#0d9488">■</span> Biotech (480)</span>
        <span><span style="color:#f59e0b">■</span> Clean Energy (372)</span>
      `;
        }

        // 2. Annual Funding Disbursals Bar Chart
        ChartEngine.renderBarChart('fundingBarChartContainer', [
            { year: '2020', val: 78.4 },
            { year: '2021', val: 94.2 },
            { year: '2022', val: 112.0 },
            { year: '2023', val: 128.5 },
            { year: '2024', val: 142.8 }
        ]);

        // 3. Deployment Timeline (Page 1)
        const timelineEl = document.getElementById('deploymentTimelineContainer');
        if (timelineEl) {
            timelineEl.innerHTML = AppState.get('deployments').map(d => `
        <div class="timeline-node">
          <div class="node-agency">${d.agency}</div>
          <div class="node-year">${d.year}</div>
        </div>
      `).join('');
        }
    }

    function bootstrap() {
        initRouter();
        initFreeTextSearch();

        // Initialize all modular components
        ProposalSubmission.init();
        ScrutinyReview.init();
        TECEvaluation.init();
        FinancialSanction.init();
        DuplicateDetector.init();
        CommunicationHub.init();
        ReportsAnalytics.init();

        // Render SVG Charts & Timelines
        renderVisualizations();

        // Set initial lifecycle step details
        LifecycleTracker.selectStep(3);

        // Modal and Drawer event bindings
        document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
        document.getElementById('notifTrayBtn')?.addEventListener('click', openNotificationCenter);
        document.getElementById('closeNotifDrawer')?.addEventListener('click', () => {
            document.getElementById('notificationDrawer').classList.remove('open');
        });

        document.getElementById('modalBackdrop')?.addEventListener('click', (e) => {
            if (e.target.id === 'modalBackdrop') closeModal();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    return {
        navigate,
        openModal,
        closeModal,
        triggerToast,
        triggerCryptographicToast,
        inspectProposal,
        openNewsletterModal,
        openNotificationCenter
    };
})();

window.MainApp = MainApp;