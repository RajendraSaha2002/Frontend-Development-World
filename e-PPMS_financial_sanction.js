/**
 * Financial Sanction & Fund Release Engine
 */
const FinancialSanction = (() => {
    const tbody = document.getElementById('sanctionTableBody');

    function init() {
        render();
        document.getElementById('btnBatchSanction')?.addEventListener('click', generateBatch);
    }

    function render() {
        if (!tbody) return;
        const list = AppState.get('proposals');

        tbody.innerHTML = list.map(p => {
            const cap = (p.budget * 0.4).toFixed(2);
            const gen = (p.budget * 0.6).toFixed(2);
            const sanctNum = p.sanctionOrder || `SANCT-2024-Q3-${p.id.slice(-3)}`;

            return `
        <tr>
          <td><strong>${sanctNum}</strong></td>
          <td>${p.id}</td>
          <td>${p.institute}</td>
          <td>₹ ${cap} L</td>
          <td>₹ ${gen} L</td>
          <td><strong>₹ ${p.budget.toFixed(2)} L</strong></td>
          <td><span class="badge ${p.sanctioned ? 'badge-success' : 'badge-warning'}">${p.sanctioned ? 'Released (Tranche 1)' : 'Pending Authority Sign'}</span></td>
          <td>
            <button class="btn btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="FinancialSanction.viewSanctionOrder('${p.id}', '${sanctNum}')">View Sanction Order</button>
          </td>
        </tr>
      `;
        }).join('');
    }

    function viewSanctionOrder(propId, sanctNum) {
        const p = AppState.get('proposals').find(item => item.id === propId);
        if (!p) return;

        const html = `
      <div style="border:2px solid #0c4a6e; padding:20px; font-family:monospace; background:#ffffff;">
        <div style="text-align:center; border-bottom:1px solid #0c4a6e; padding-bottom:8px;">
          <h3>NATIONAL R&D GRANTS EXECUTIVE SANCTION</h3>
          <p>ORDER REFERENCE: ${sanctNum}</p>
        </div>
        <div style="margin-top:14px; font-size:12px; line-height:1.6;">
          <p><strong>Sanctioned To:</strong> ${p.institute}</p>
          <p><strong>Principal Investigator:</strong> ${p.pi}</p>
          <p><strong>Sanctioned Amount:</strong> ₹ ${p.budget.toFixed(2)} Lakhs</p>
          <p><strong>Year 1 Capital Release:</strong> ₹ ${(p.budget * 0.4).toFixed(2)} Lakhs (Equipment & Non-recurring)</p>
          <p><strong>Year 1 General Release:</strong> ₹ ${(p.budget * 0.6).toFixed(2)} Lakhs (Consumables, Manpower & Overhead)</p>
        </div>
        <div style="margin-top:20px; padding:10px; background:#f8fafc; border:1px solid #cbd5e1; font-size:10px;">
          <strong>Cryptographic Authority Seal:</strong> SHA-256: 8f4b23a9d09c31e982a7f5b120cda411<br>
          Direct treasury RTGS release token authorized for electronic disbursement.
        </div>
      </div>
      <button class="btn btn-primary margin-top-20" onclick="window.print()">Print Formal Voucher</button>
    `;
        MainApp.openModal(`Sanction Order: ${sanctNum}`, html);
    }

    function generateBatch() {
        AppState.get('proposals').forEach(p => { p.sanctioned = true; });
        render();
        MainApp.triggerCryptographicToast('All pending sanctions signed & authorized.');
    }

    return { init, render, viewSanctionOrder };
})();