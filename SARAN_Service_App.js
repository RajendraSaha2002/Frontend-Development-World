/**
 * 07-app.js
 * Application Controller, Navigation Router & Event Dispatcher.
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Navigation Controller
    const navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
    const views = document.querySelectorAll('.content-view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewKey = btn.getAttribute('data-view');
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            views.forEach(v => {
                v.classList.remove('active');
                if (v.id === `view-${viewKey}`) {
                    v.classList.add('active');
                }
            });

            // Lazy re-renders on view visibility
            if (viewKey === 'dashboard') {
                SaranCharts.refresh();
            } else if (viewKey === 'workflow-designer') {
                SaranWorkflow.init();
            }
        });
    });

    // Tenant Switcher
    const tenantSelect = document.getElementById('tenantSelect');
    tenantSelect.addEventListener('change', (e) => {
        SaranStore.setTenant(e.target.value);
        showToast(`Switched active Cloud Tenant to: ${e.target.options[e.target.selectedIndex].text}`);
        SaranTicketManager.renderTables();
        SaranCharts.refresh();
    });

    // Modal Handlers
    const ticketModal = document.getElementById('ticketModal');
    const btnCreateModal = document.getElementById('btnCreateTicketModal');
    const btnNewFromWorkspace = document.getElementById('btnNewTicketFromWorkspace');
    const btnCloseModal = document.getElementById('btnCloseTicketModal');
    const btnCancelModal = document.getElementById('btnCancelTicketModal');

    function openCreateModal() {
        document.getElementById('newTicketForm').reset();
        ticketModal.classList.add('show');
    }
    function closeCreateModal() {
        ticketModal.classList.remove('show');
    }

    if (btnCreateModal) btnCreateModal.addEventListener('click', openCreateModal);
    if (btnNewFromWorkspace) btnNewFromWorkspace.addEventListener('click', openCreateModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeCreateModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeCreateModal);

    // Detail Modal Handlers
    const detailModal = document.getElementById('ticketDetailModal');
    document.getElementById('btnCloseDetailModal').addEventListener('click', () => {
        detailModal.classList.remove('show');
    });

    document.getElementById('btnSaveTicketDetail').addEventListener('click', () => {
        const ticketId = document.getElementById('detailTicketId').textContent;
        const newStatus = document.getElementById('detailStatusSelect').value;

        SaranStore.updateTicket(ticketId, { status: newStatus });
        SaranStore.addAuditLog({
            category: 'Ticket Lifecycle',
            user: 'Sarah Jenkins',
            ip: '192.168.1.104',
            severity: 'INFO',
            message: `Ticket ${ticketId} transitioned to status: ${newStatus}`
        });

        detailModal.classList.remove('show');
        SaranTicketManager.renderTables();
        SaranSecurity.refresh();
        showToast(`Updated ticket [${ticketId}] to ${newStatus}`);
    });

    // Submit New Ticket
    document.getElementById('btnSubmitTicket').addEventListener('click', (e) => {
        e.preventDefault();
        const summary = document.getElementById('ticketSummary').value;
        const requester = document.getElementById('ticketRequester').value;
        const profile = document.getElementById('ticketProfile').value;
        const priority = document.getElementById('ticketPriority').value;
        const group = document.getElementById('ticketGroup').value;
        const desc = document.getElementById('ticketDescription').value;

        if (!summary || !requester) {
            alert('Please fill out all required fields.');
            return;
        }

        const newTkt = SaranStore.addTicket({
            profile: profile,
            title: summary,
            requester: requester,
            priority: priority,
            status: 'Open',
            assignedGroup: group,
            slaRemainingSeconds: priority === 'Critical' ? 3600 : 14400,
            slaTotalSeconds: priority === 'Critical' ? 3600 : 14400,
            source: 'Service Desk Portal',
            description: desc,
            checklistState: [false, false, false, false]
        });

        SaranStore.addAuditLog({
            category: 'Service Creation',
            user: requester,
            ip: '192.168.1.55',
            severity: 'INFO',
            message: `Created ${profile} request [${newTkt.id}]`
        });

        closeCreateModal();
        SaranTicketManager.renderTables();
        SaranCharts.refresh();
        SaranSecurity.refresh();
        showToast(`Ticket [${newTkt.id}] successfully created and assigned.`);
    });

    // Interactive Toast Notifications
    function showToast(message, type = 'info') {
        const deck = document.getElementById('toastDeck');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeft = type === 'danger' ? '4px solid #ef4444' : '4px solid #0284c7';
        toast.innerHTML = `<span>${message}</span>`;
        deck.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // Hook Simulation Buttons
    document.getElementById('btnSimulateFailedLogin').addEventListener('click', () => {
        SaranSecurity.simulateFailedLogin((msg, level) => showToast(msg, level));
    });

    document.getElementById('btnTestWorkflow').addEventListener('click', () => {
        showToast('Workflow Simulation Passed: Triggers, Conditions & SLA Rules Validated.');
    });

    document.getElementById('btnExportReport').addEventListener('click', () => {
        showToast('Generating Compliance & SLA Performance Audit Pack...');
    });

    // Search & Filtering listeners
    document.getElementById('ticketTextFilter').addEventListener('input', SaranTicketManager.renderTables);
    document.getElementById('filterProfile').addEventListener('change', SaranTicketManager.renderTables);
    document.getElementById('filterStatus').addEventListener('change', SaranTicketManager.renderTables);

    // Initialize Engines
    SaranCharts.init();
    SaranSLA.start();
    SaranWorkflow.init();
    SaranTicketManager.init();
    SaranSecurity.init();
});