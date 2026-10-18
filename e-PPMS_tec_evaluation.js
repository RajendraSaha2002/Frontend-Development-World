/**
 * Technical Evaluation Committee (TEC) Decision Station
 */
const TECEvaluation = (() => {
    const tbody = document.getElementById('tecTableBody');

    function init() {
        render();
        document.getElementById('btnScheduleTEC')?.addEventListener('click', scheduleMeeting);
    }

    function render() {
        if (!tbody) return;
        const list = AppState.get('proposals');

        tbody.innerHTML = list.map(p => `
      <tr>
        <td><strong>TEC-2024-M${p.id.slice(-2)}</strong></td>
        <td>${p.id}</td>
        <td>${p.pi}</td>
        <td>2024-09-12 10:00 AM</td>
        <td><span class="badge ${p.tecDecision.includes('Approved') || p.tecDecision.includes('Recommended') ? 'badge-success' : 'badge-warning'}">${p.tecDecision}</span></td>
        <td>₹ ${(p.budget * 0.95).toFixed(2)} Lakhs</td>
        <td>
          <button class="btn btn-primary" style="font-size:11px; padding:3px 8px;" onclick="TECEvaluation.recordVerdict('${p.id}')">Record Verdict</button>
        </td>
      </tr>
    `).join('');
    }

    function recordVerdict(propId) {
        const p = AppState.get('proposals').find(item => item.id === propId);
        if (!p) return;

        MainApp.openModal(`TEC Final Verdict: ${p.id}`, `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <p>Record apex committee verdict for <strong>${p.title}</strong>.</p>
        <label>Approved Budget Ceiling (₹ In Lakhs):</label>
        <input type="number" id="tec_budget" class="form-control" value="${(p.budget * 0.95).toFixed(2)}">
        <label>Verdict Status:</label>
        <select id="tec_status" class="form-control">
          <option value="Formally Approved">Formally Approved for Financial Sanction</option>
          <option value="Recommended with Modifications">Recommended with Budget Cut</option>
          <option value="Declined">Declined</option>
        </select>
        <button class="btn btn-primary margin-top-20" onclick="TECEvaluation.saveVerdict('${p.id}')">Authorize TEC Resolution</button>
      </div>
    `);
    }

    function saveVerdict(propId) {
        const p = AppState.get('proposals').find(item => item.id === propId);
        if (p) {
            p.tecDecision = document.getElementById('tec_status').value;
            p.stage = 5; // Admin & Financial Approval
            render();
            MainApp.closeModal();
            MainApp.triggerToast(`TEC resolution signed for ${propId}. Transmitted for Financial Sanction.`);
        }
    }

    function scheduleMeeting() {
        MainApp.openModal('Convene Specialized TEC Meeting', `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <label>Committee Board:</label>
        <select class="form-control">
          <option>Apex Electronics & Quantum Committee</option>
          <option>Renewable Energy & Marine Committee</option>
          <option>Biotechnology & Life Sciences Committee</option>
        </select>
        <label>Hearing Date & Time:</label>
        <input type="datetime-local" class="form-control">
        <button class="btn btn-primary margin-top-20" onclick="MainApp.closeModal(); MainApp.triggerToast('TEC Board hearing scheduled. Automatic calendar dispatch sent.');">Issue Committee Notice</button>
      </div>
    `);
    }

    return { init, render, recordVerdict, saveVerdict };
})();