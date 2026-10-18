/**
 * Recruitment Requisition & Scoring Pipeline
 */
const RecruitmentModule = (() => {
    function init() {
        renderPipeline();
        bindEvents();
    }

    function renderPipeline() {
        const candidates = AppState.get('recruitmentCandidates');
        const cols = {
            screening: document.getElementById('pipeScreening'),
            technical: document.getElementById('pipeTechnical'),
            interview: document.getElementById('pipeInterview'),
            offered: document.getElementById('pipeOffered')
        };

        Object.values(cols).forEach(col => { if(col) col.innerHTML = ''; });

        candidates.forEach(c => {
            const card = `
        <div class="applicant-card">
          <div style="display:flex; justify-content:space-between;">
            <strong>${c.name}</strong>
            <span class="applicant-score">Score: ${c.score}%</span>
          </div>
          <div style="font-size:11px; color:#64748b;">${c.position}</div>
          <div style="font-size:10px; margin-top:6px; color:#475569;">Experience: ${c.exp}</div>
        </div>
      `;
            if (cols[c.stage]) {
                cols[c.stage].innerHTML += card;
            }
        });
    }

    function bindEvents() {
        document.getElementById('openNewJobModalBtn')?.addEventListener('click', () => {
            MainApp.openModal('Create Cadre Recruitment Requisition', `
        <div>
          <label>Notification Reference No.</label>
          <input type="text" class="form-control" value="REQ-2024-Q3-019">
          <label class="margin-top-20">Post / Cadre Title</label>
          <input type="text" class="form-control" placeholder="e.g. Principal Research Scientist">
          <button class="btn btn-primary margin-top-20" onclick="MainApp.closeModal(); NotificationsModule.dispatchAlert('SYSTEM', 'Recruitment requisition published to national portal.');">Publish Notification</button>
        </div>
      `);
        });
    }

    return { init };
})();