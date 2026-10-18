/**
 * Transfer, Posting & Digital Relieving Workflow
 */
const TransferModule = (() => {
    const tbody = document.getElementById('transferOrdersTbody');

    function init() {
        render();
        bindEvents();
    }

    function render() {
        if (!tbody) return;
        const transfers = AppState.get('transfers');

        tbody.innerHTML = transfers.map(t => `
      <tr>
        <td><strong>${t.orderId}</strong></td>
        <td>${t.empName} (${t.empPin})</td>
        <td>${t.currentStation}</td>
        <td><strong>${t.targetStation}</strong></td>
        <td>${t.effective}</td>
        <td>
          <span class="badge ${t.approved ? 'badge-success' : 'badge-warning'}">
            ${t.approved ? 'Approved by Board' : 'Awaiting Vigilance'}
          </span>
        </td>
        <td>
          ${t.signed ?
            `<button class="btn btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="TransferModule.verifySignature('${t.orderId}')">View Digital Sign</button>` :
            `<button class="btn btn-primary" style="font-size:11px; padding:3px 8px;" onclick="TransferModule.signOrder('${t.orderId}')">Sign Order</button>`
        }
        </td>
      </tr>
    `).join('');
    }

    function signOrder(orderId) {
        const list = AppState.get('transfers');
        const order = list.find(o => o.orderId === orderId);
        if (order) {
            order.approved = true;
            order.signed = true;
            render();
            MainApp.triggerDigitalSignatureToast(`Order #${order.orderId} Signed & Ratified.`);
            NotificationsModule.dispatchAlert('EMAIL', `Transfer Order ${order.orderId} officially ratified and served to employee.`);
        }
    }

    function verifySignature(orderId) {
        MainApp.triggerDigitalSignatureToast(`Verified Authenticity: Order ${orderId}`);
    }

    function bindEvents() {
        document.getElementById('btnInitiateTransfer')?.addEventListener('click', () => {
            MainApp.openModal('Draft Inter-Departmental Transfer Order', `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <label>Employee PIN</label>
          <input type="text" class="form-control" placeholder="EMP-100X">
          <label>Target Station / Directorate</label>
          <input type="text" class="form-control" placeholder="e.g. Silchar Development Campus">
          <label>Effective Transfer Date</label>
          <input type="date" class="form-control">
          <button class="btn btn-primary margin-top-20" onclick="MainApp.closeModal(); NotificationsModule.dispatchAlert('SYSTEM', 'Transfer recommendation placed on Board Agenda.');">Draft Relieving Order</button>
        </div>
      `);
        });
    }

    return { init, signOrder, verifySignature };
})();