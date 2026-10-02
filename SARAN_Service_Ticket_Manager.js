/**
 * 05-ticket-manager.js
 * Universal Service Desk Workspace, Filter & Modal Lifecycle Controller.
 */
const SaranTicketManager = (function () {
    'use strict';

    function renderTables() {
        renderMasterTable();
        renderUrgentTable();
    }

    function renderMasterTable() {
        const tbody = document.getElementById('masterTicketsBody');
        if (!tbody) return;

        const tickets = SaranStore.getTickets();
        const filterProfile = document.getElementById('filterProfile').value;
        const filterStatus = document.getElementById('filterStatus').value;
        const searchText = (document.getElementById('ticketTextFilter').value || '').toLowerCase();

        const filtered = tickets.filter(t => {
            const matchProfile = filterProfile === 'all' || t.profile === filterProfile;
            const matchStatus = filterStatus === 'all' || t.status === filterStatus;
            const matchSearch = t.id.toLowerCase().includes(searchText) ||
                t.title.toLowerCase().includes(searchText) ||
                t.requester.toLowerCase().includes(searchText);
            return matchProfile && matchStatus && matchSearch;
        });

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#94a3b8; padding: 2rem;">No service desk tickets matched criteria.</td></tr>`;
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement('tr');
            const badgeClass = SaranSLA.calculateBreachBadgeClass(t.slaRemainingSeconds);
            const timeStr = SaranSLA.formatTime(t.slaRemainingSeconds);

            tr.innerHTML = `
        <td><strong>${t.id}</strong></td>
        <td><span class="badge ${t.profile === 'incident' ? 'red' : (t.profile === 'change' ? 'amber' : 'green')}">${t.profile}</span></td>
        <td>${escapeHtml(t.title)}</td>
        <td><small class="badge blue">${t.source}</small></td>
        <td><strong>${t.priority}</strong></td>
        <td><span class="badge ${t.status === 'Resolved' ? 'green' : 'blue'}">${t.status}</span></td>
        <td>${t.assignedGroup}</td>
        <td><span class="sla-badge ${badgeClass}">${timeStr}</span></td>
        <td>
          <button class="btn btn-small btn-secondary btn-inspect" data-id="${t.id}">Inspect</button>
        </td>
      `;
            tbody.appendChild(tr);
        });

        document.getElementById('ticketCountDisplay').textContent = `Showing ${filtered.length} of ${tickets.length} items`;
    }

    function renderUrgentTable() {
        const tbody = document.querySelector('#urgentTicketsTable tbody');
        if (!tbody) return;

        const tickets = SaranStore.getTickets()
            .filter(t => t.priority === 'Critical' || t.priority === 'High')
            .slice(0, 5);

        tbody.innerHTML = '';
        tickets.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td><strong>${t.id}</strong></td>
        <td>${escapeHtml(t.title)}</td>
        <td><span class="badge ${t.profile === 'incident' ? 'red' : 'amber'}">${t.profile}</span></td>
        <td><span class="badge red">${t.priority}</span></td>
        <td><span class="sla-badge ${SaranSLA.calculateBreachBadgeClass(t.slaRemainingSeconds)}">${SaranSLA.formatTime(t.slaRemainingSeconds)}</span></td>
        <td><button class="btn btn-small btn-primary btn-inspect" data-id="${t.id}">Manage</button></td>
      `;
            tbody.appendChild(tr);
        });
    }

    function openDetailModal(ticketId) {
        const ticket = SaranStore.getTickets().find(t => t.id === ticketId);
        if (!ticket) return;

        const modal = document.getElementById('ticketDetailModal');
        document.getElementById('detailTicketId').textContent = ticket.id;
        document.getElementById('detailSummary').textContent = ticket.title;
        document.getElementById('detailDescription').textContent = ticket.description || 'No detailed log provided.';
        document.getElementById('detailPriority').textContent = ticket.priority;
        document.getElementById('detailGroup').textContent = ticket.assignedGroup;
        document.getElementById('detailRequester').textContent = ticket.requester;
        document.getElementById('detailStatusSelect').value = ticket.status;

        // Attach reference for active SLA clock
        const clockEl = document.getElementById('detailSlaClock');
        clockEl.dataset.activeTicket = ticket.id;

        // Checklists render
        const profileDef = SaranStore.getState().profiles[ticket.profile];
        const checklistContainer = document.getElementById('detailChecklistContainer');
        checklistContainer.innerHTML = '';

        if (profileDef && profileDef.checklists) {
            profileDef.checklists.forEach((item, index) => {
                const row = document.createElement('label');
                row.className = 'checklist-item';
                const isChecked = ticket.checklistState && ticket.checklistState[index];
                row.innerHTML = `
          <input type="checkbox" class="chk-task" data-index="${index}" ${isChecked ? 'checked' : ''} />
          <span>${item}</span>
        `;
                checklistContainer.appendChild(row);
            });
        }

        // Timeline
        const timelineEl = document.getElementById('detailTimeline');
        timelineEl.innerHTML = '';
        (ticket.auditTrail || []).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;
            timelineEl.appendChild(li);
        });

        modal.classList.add('show');
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    return {
        init: () => {
            renderTables();

            // Delegate Inspector triggers
            document.addEventListener('click', (e) => {
                if (e.target && e.target.classList.contains('btn-inspect')) {
                    const id = e.target.getAttribute('data-id');
                    openDetailModal(id);
                }
            });
        },
        renderTables: renderTables,
        openDetail: openDetailModal
    };
})();