/**
 * Preliminary Scrutiny & Peer Review Station
 */
const ScrutinyReview = (() => {
    const tbody = document.getElementById('scrutinyTableBody');

    function init() {
        render();
    }

    function render() {
        if (!tbody) return;
        const proposals = AppState.get('proposals');

        tbody.innerHTML = proposals.map(p => `
      <tr>
        <td><strong>${p.id}</strong></td>
        <td><strong>${p.title}</strong><br><small class="text-muted">${p.institute}</small></td>
        <td>${p.pi}</td>
        <td><span class="badge badge-info">${p.domain}</span></td>
        <td>₹ ${p.budget.toFixed(2)} L</td>
        <td><span class="badge ${p.scrutiny.includes('Verified') ? 'badge-success' : 'badge-warning'}">${p.scrutiny}</span></td>
        <td><strong>${p.reviewScore ? p.reviewScore + ' / 100' : 'Awaiting Review'}</strong></td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="ScrutinyReview.openReviewModal('${p.id}')">Peer Appraisal</button>
        </td>
      </tr>
    `).join('');
    }

    function openReviewModal(propId) {
        const p = AppState.get('proposals').find(item => item.id === propId);
        if (!p) return;

        const html = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <h4>${p.title} (${p.id})</h4>
        <p style="font-size:12px; color:#475569;"><strong>PI:</strong> ${p.pi} | <strong>Institution:</strong> ${p.institute}</p>
        <p style="font-size:12px; background:#f8fafc; padding:10px; border-radius:4px;">${p.abstract}</p>
        
        <label>Technical Merit & Novelty Score (0 - 100):</label>
        <input type="number" id="m_score" class="form-control" value="${p.reviewScore || 85}" max="100" min="0">
        
        <label>Reviewer Recommendation:</label>
        <select id="m_recommend" class="form-control">
          <option value="Recommended for TEC">Strongly Recommended for TEC Presentation</option>
          <option value="Revision Required">Minor Technical Revision Required</option>
          <option value="Rejected">Non-viable / Sub-threshold</option>
        </select>

        <button class="btn btn-primary margin-top-20" onclick="ScrutinyReview.saveReview('${p.id}')">Submit Verified Appraisal</button>
      </div>
    `;
        MainApp.openModal(`Peer Review Scoring: ${p.id}`, html);
    }

    function saveReview(propId) {
        const p = AppState.get('proposals').find(item => item.id === propId);
        const score = parseInt(document.getElementById('m_score').value);
        if (p) {
            p.reviewScore = score;
            p.scrutiny = 'Verified & Endorsed';
            p.stage = 4; // Advance to TEC
            render();
            MainApp.closeModal();
            MainApp.triggerToast(`Peer score ${score}/100 recorded for ${propId}. Elevated to TEC.`);
        }
    }

    return { init, render, openReviewModal, saveReview };
})();