/**
 * Direct Encrypted Communication System (Feature #5)
 */
const CommunicationHub = (() => {
    function init() {
        renderThreads();
        document.getElementById('btnNewThread')?.addEventListener('click', createThread);
    }

    function renderThreads() {
        const listEl = document.getElementById('commThreadList');
        if (!listEl) return;
        const threads = AppState.get('threads');

        listEl.innerHTML = threads.map((t, idx) => `
      <div class="thread-item ${idx === 0 ? 'active' : ''}" onclick="CommunicationHub.openThread('${t.id}')">
        <strong>${t.proposalId}</strong>
        <div style="font-size:12px; color:#0f172a; margin:2px 0;">${t.title}</div>
        <small class="text-muted">${t.date}</small>
      </div>
    `).join('');

        if (threads.length) openThread(threads[0].id);
    }

    function openThread(threadId) {
        const thread = AppState.get('threads').find(t => t.id === threadId);
        const pane = document.getElementById('commMessagePane');
        if (!thread || !pane) return;

        pane.innerHTML = `
      <div>
        <div style="border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
          <h4>${thread.title}</h4>
          <span style="font-size:12px; color:#0284c7;">Ref: ${thread.proposalId} | Encrypted Channel</span>
        </div>
        <div style="background:#f8fafc; padding:12px; border-radius:4px; font-size:13px; margin-bottom:10px;">
          <strong>Secretariat Technical Officer:</strong>
          <p style="margin-top:4px;">${thread.lastMessage}</p>
        </div>
      </div>
      <div>
        <textarea class="form-control" rows="2" placeholder="Write formal response or upload revised annexures..."></textarea>
        <button class="btn btn-primary margin-top-20" onclick="MainApp.triggerToast('Encrypted response transmitted to Secretariat.');">Send Official Communication</button>
      </div>
    `;
    }

    function createThread() {
        MainApp.openModal('Initiate Technical Dialogue', `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <label>Proposal Reference ID:</label>
        <input type="text" class="form-control" value="PROP-2024-8841">
        <label>Subject / Topic:</label>
        <input type="text" class="form-control" placeholder="e.g. Request for Head Reallocation">
        <label>Message Content:</label>
        <textarea class="form-control" rows="3"></textarea>
        <button class="btn btn-primary margin-top-20" onclick="MainApp.closeModal(); MainApp.triggerToast('New communication thread launched.');">Transmit Query</button>
      </div>
    `);
    }

    return { init, openThread };
})();