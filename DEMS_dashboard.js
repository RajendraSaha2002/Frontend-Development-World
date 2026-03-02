/* ================================================================
   dashboard.js  –  Main Controller for DEMS
   Depends on:  data.js   charts.js
   ================================================================ */

// ── State ──────────────────────────────────────────────────────────
let currentPage    = 'dashboard';
let dynamicFieldCount = 0;
let casePageNum    = 1;
const CASES_PER_PAGE = 8;
const rendered     = {};

// ════════════════════════════════════════════════════════════════
//  CLOCK
// ════════════════════════════════════════════════════════════════
function startClock() {
    function tick() {
        const n = new Date();
        document.getElementById('clockTime').textContent = n.toTimeString().slice(0,8);
        document.getElementById('clockDate').textContent =
            n.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    }
    tick(); setInterval(tick, 1000);
}

// ════════════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════════════
function toast(msg, type='info', dur=3500) {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type==='success'?'success':type==='error'?'error':type==='warning'?'warning':''}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, dur);
}

// ════════════════════════════════════════════════════════════════
//  MODAL
// ════════════════════════════════════════════════════════════════
function openModal(title, html) {
    document.getElementById('modalHeader').textContent = title;
    document.getElementById('modalBody').innerHTML     = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
}
document.getElementById('modalClose').addEventListener('click', () =>
    document.getElementById('modalOverlay').classList.add('hidden'));

// ════════════════════════════════════════════════════════════════
//  SIDEBAR TOGGLE
// ════════════════════════════════════════════════════════════════
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainWrapper').classList.toggle('expanded');
});

// ════════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════════
const PAGE_MAP = {
    dashboard:'pageDashboard', cases:'pageCases', newcase:'pageNewcase',
    lifecycle:'pageLifecycle', evidence:'pageEvidence', upload:'pageUpload',
    custody:'pageCustody',     reports:'pageReports',   search:'pageSearch',
    sla:'pageSla',             notifications:'pageNotifications',
    users:'pageUsers',         audit:'pageAudit'
};
const PAGE_LABELS = {
    dashboard:'Dashboard', cases:'Cases', newcase:'New Case',
    lifecycle:'Life Cycle', evidence:'Evidence', upload:'Upload Evidence',
    custody:'Chain of Custody', reports:'Analysis Reports', search:'Search & Filter',
    sla:'SLA Management', notifications:'Notifications', users:'User Management',
    audit:'Audit Log'
};

function navigate(page) {
    if (page === 'logout') {
        if (confirm('Logout from DEMS?')) toast('Session closed. Goodbye.','warning');
        return;
    }
    currentPage = page;
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const pg = document.getElementById(PAGE_MAP[page]);
    if (pg) pg.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n =>
        n.classList.toggle('active', n.dataset.page === page));
    document.getElementById('bcCurrent').textContent = PAGE_LABELS[page] || page;
    if (!rendered[page]) { rendered[page] = true; renderPage(page); }
}

document.querySelectorAll('.nav-item').forEach(item =>
    item.addEventListener('click', () => navigate(item.dataset.page)));

function renderPage(page) {
    switch(page) {
        case 'cases':         renderCasesPage();         break;
        case 'lifecycle':     renderLifecyclePage();      break;
        case 'evidence':      renderEvidencePage();       break;
        case 'upload':        renderUploadPage();         break;
        case 'custody':       renderCustodyPage();        break;
        case 'reports':       renderReportsPage();        break;
        case 'search':        renderSearchPage();         break;
        case 'sla':           renderSLAPage();            break;
        case 'notifications': renderNotificationsPage(); break;
        case 'users':         renderUsersPage();          break;
        case 'audit':         renderAuditPage();          break;
    }
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════
function renderDashboard() {
    renderStatCards();
    renderRecentCases();
    renderRecentEvidence();
    renderSLAAlerts();
    setTimeout(() => {
        drawCaseStatusBar('caseStatusBar');
        drawEvidenceDonut('evidenceDonut','evidenceDonutLegend');
        drawSLAGauge('slaGaugeCanvas');
        drawMonthlyLine('monthlyLineCanvas');
    }, 120);
    document.getElementById('casesBadge').textContent =
        CASES_DATA.filter(c => c.status !== 'closed' && c.status !== 'archived').length;
    const unread = NOTIFICATIONS_DATA.filter(n => n.unread).length;
    document.getElementById('notifBadge').textContent = unread;
    document.getElementById('notifDot').textContent   = unread;
}

function renderStatCards() {
    const g = document.getElementById('statGrid');
    g.innerHTML = STAT_CARDS.map(c => `
    <div class="stat-card ${c.color}">
      <span class="sc-trend ${c.dir}">${c.dir==='up'?'▲':'▼'} ${c.trend}</span>
      <span class="sc-icon">${c.icon}</span>
      <span class="sc-val">${c.val}</span>
      <span class="sc-lbl">${c.lbl}</span>
    </div>`).join('');
}

function renderRecentCases() {
    const tb = document.getElementById('recentCasesBody');
    tb.innerHTML = CASES_DATA.slice(0, 7).map(c => `
    <tr>
      <td style="color:#388bfd;font-family:var(--mono)">${c.id}</td>
      <td>${c.title}</td>
      <td>${c.type}</td>
      <td>${c.inv}</td>
      <td><span class="badge ${c.priority}">${c.priority.toUpperCase()}</span></td>
      <td><span class="badge ${cssClass(c.status)}">${c.status}</span></td>
      <td><span class="${slaColor(c.sla)}">${slaLabel(c.sla)}</span></td>
      <td>
        <button class="act-btn" onclick="viewCase('${c.id}')">View</button>
        <button class="act-btn" onclick="navigate('evidence')">Evidence</button>
      </td>
    </tr>`).join('');
}

function renderRecentEvidence() {
    const tb = document.getElementById('recentEvidenceBody');
    tb.innerHTML = EVIDENCE_DATA.slice(0,8).map(e => `
    <tr>
      <td style="color:#388bfd;font-family:var(--mono)">${e.id}</td>
      <td style="color:#79c0ff;font-family:var(--mono)">${e.caseId}</td>
      <td>${typeIcon(e.type)} ${e.type}</td>
      <td>${e.desc}</td>
      <td>${e.size}</td>
      <td style="font-family:var(--mono);font-size:10px;color:#7d8590">${e.hash.slice(0,16)}…</td>
      <td>${e.analyst}</td>
      <td><span class="badge ${cssClass(e.status)}">${e.status}</span></td>
    </tr>`).join('');
}

function renderSLAAlerts() {
    const el = document.getElementById('slaAlerts');
    el.innerHTML = SLA_ALERTS.map(a => `
    <div class="sla-alert-item">
      <span class="sla-icon">${a.sev==='breached'?'🔴':a.sev==='warning'?'⚠️':'✅'}</span>
      <div class="sla-content">
        <div class="sla-case">${a.caseId}</div>
        <div style="font-size:11px;color:var(--text);margin-top:1px">${a.title}</div>
        <div class="sla-meta">${a.inv} &nbsp;|&nbsp;
          ${a.dueIn < 0
        ? `<span style="color:var(--red)">Breached by ${Math.abs(a.dueIn)} day(s)</span>`
        : `<span style="color:${a.sev==='warning'?'var(--yellow)':'var(--green)'}">Due in ${a.dueIn} day(s)</span>`}
        </div>
      </div>
      <span class="badge ${a.sev}">${a.sev}</span>
    </div>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  CASES PAGE
// ════════════════════════════════════════════════════════════════
function renderCasesPage() {
    buildCasesTable(CASES_DATA);

    document.getElementById('applyFilterBtn').addEventListener('click', () => {
        const q   = document.getElementById('caseSearch').value.toLowerCase();
        const st  = document.getElementById('caseStatusFilter').value;
        const pr  = document.getElementById('casePriorityFilter').value;
        const filtered = CASES_DATA.filter(c =>
            (c.id+c.title+c.inv).toLowerCase().includes(q) &&
            (st === 'all' || c.status === st) &&
            (pr === 'all' || c.priority === pr)
        );
        buildCasesTable(filtered);
    });

    document.getElementById('exportCasesBtn').addEventListener('click', () => {
        const csv = ['Case ID,Title,Type,Investigator,Priority,Status,Created,SLA',
            ...CASES_DATA.map(c => `${c.id},"${c.title}",${c.type},${c.inv},${c.priority},${c.status},${c.created},${c.sla}`)
        ].join('\n');
        dlFile(csv, 'dems_cases.csv', 'text/csv');
        toast('📊 Cases exported','success');
    });
}

function buildCasesTable(data) {
    const tb = document.getElementById('casesFullBody');
    tb.innerHTML = data.map(c => `
    <tr>
      <td style="color:#388bfd;font-family:var(--mono)">${c.id}</td>
      <td>${c.title}</td>
      <td>${c.type}</td>
      <td style="font-family:var(--mono)">${c.fir}</td>
      <td>${c.inv}</td>
      <td>${c.court}</td>
      <td><span class="badge ${c.priority}">${c.priority.toUpperCase()}</span></td>
      <td><span class="badge ${cssClass(c.status)}">${c.status}</span></td>
      <td>${c.created}</td>
      <td><span class="${slaColor(c.sla)}">${c.sla}</span></td>
      <td>
        <button class="act-btn" onclick="viewCase('${c.id}')">View</button>
        <button class="act-btn" onclick="editCase('${c.id}')">Edit</button>
        <button class="act-btn" onclick="navigate('upload')">+ Ev.</button>
      </td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  NEW CASE PAGE
// ════════════════════════════════════════════════════════════════
function setupNewCasePage() {
    // Dynamic fields
    document.getElementById('addFieldBtn').addEventListener('click', () => {
        dynamicFieldCount++;
        const row = document.createElement('div');
        row.className = 'dynamic-field-row';
        row.id = 'dynRow'+dynamicFieldCount;
        row.innerHTML = `
      <input type="text" class="form-input" style="max-width:160px" placeholder="Field Name"/>
      <select class="form-input" style="max-width:120px">
        <option>Text</option><option>Number</option><option>Date</option><option>Yes/No</option>
      </select>
      <input type="text" class="form-input" placeholder="Value"/>
      <button class="df-remove" onclick="document.getElementById('dynRow${dynamicFieldCount}').remove()">✕</button>`;
        document.getElementById('dynamicFieldsContainer').appendChild(row);
    });

    document.getElementById('saveCaseBtn').addEventListener('click', () => {
        const title = document.getElementById('fCaseTitle').value.trim();
        if (!title) { toast('Case title is required','error'); return; }
        toast(`✅ Case "${title}" saved successfully`,'success');
        setTimeout(() => navigate('cases'), 1000);
    });

    document.getElementById('saveSendBtn').addEventListener('click', () => {
        const title = document.getElementById('fCaseTitle').value.trim();
        if (!title) { toast('Case title is required','error'); return; }
        toast(`✅ Case saved! Redirecting to upload evidence…`,'success');
        setTimeout(() => navigate('upload'), 1000);
    });
}

// ════════════════════════════════════════════════════════════════
//  LIFECYCLE PAGE
// ════════════════════════════════════════════════════════════════
function renderLifecyclePage() {
    const el = document.getElementById('lifecycleDiagram');
    el.innerHTML = LIFECYCLE_STEPS.map((s, i) => `
    <div class="lc-step">
      <div class="lc-circle cs-dot ${s.cls}" style="background:${s.color+'33'};border-color:${s.border}">
        ${s.icon}
      </div>
      <div class="lc-label">${s.label.replace('\n','<br>')}</div>
    </div>
    ${i < LIFECYCLE_STEPS.length-1 ? '<div class="lc-arrow">→</div>' : ''}`
    ).join('');
    setTimeout(() => drawLifecycleBar('lifecycleBarCanvas'), 100);
}

// ════════════════════════════════════════════════════════════════
//  EVIDENCE PAGE
// ════════════════════════════════════════════════════════════════
function renderEvidencePage() {
    buildEvidenceTable(EVIDENCE_DATA);

    document.getElementById('applyEvFilterBtn').addEventListener('click', () => {
        const q  = document.getElementById('evSearch').value.toLowerCase();
        const tp = document.getElementById('evTypeFilter').value;
        const st = document.getElementById('evStatusFilter').value;
        const f  = EVIDENCE_DATA.filter(e =>
            (e.id+e.caseId+e.desc).toLowerCase().includes(q) &&
            (tp === 'all' || e.type === tp) &&
            (st === 'all' || e.status === st)
        );
        buildEvidenceTable(f);
    });

    document.getElementById('exportEvidenceBtn').addEventListener('click', () => {
        const csv = ['Ev. ID,Case ID,Type,Description,Size,Received,Analyst,Status',
            ...EVIDENCE_DATA.map(e => `${e.id},${e.caseId},${e.type},"${e.desc}",${e.size},${e.received},${e.analyst},${e.status}`)
        ].join('\n');
        dlFile(csv, 'dems_evidence.csv', 'text/csv');
        toast('📊 Evidence exported','success');
    });
}

function buildEvidenceTable(data) {
    const tb = document.getElementById('evidenceFullBody');
    tb.innerHTML = data.map(e => `
    <tr>
      <td style="color:#388bfd;font-family:var(--mono)">${e.id}</td>
      <td style="color:#79c0ff;font-family:var(--mono)">${e.caseId}</td>
      <td>${typeIcon(e.type)} ${e.type}</td>
      <td>${e.desc}</td>
      <td>${e.size}</td>
      <td style="font-family:var(--mono);font-size:10px;color:#7d8590">${e.hash.slice(0,16)}…</td>
      <td>${e.received}</td>
      <td>${e.analyst}</td>
      <td><span class="badge ${cssClass(e.status)}">${e.status}</span></td>
      <td>
        <button class="act-btn" onclick="viewEvidence('${e.id}')">View</button>
        <button class="act-btn" onclick="viewCustody('${e.id}')">Custody</button>
        <button class="act-btn" onclick="verifyHash('${e.id}')">Verify</button>
      </td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  UPLOAD PAGE
// ════════════════════════════════════════════════════════════════
function renderUploadPage() {
    // Populate case dropdown
    const sel = document.getElementById('upCaseId');
    sel.innerHTML = CASES_DATA.filter(c => c.status !== 'archived').map(c =>
        `<option value="${c.id}">${c.id} – ${c.title.slice(0,35)}</option>`).join('');

    // Drag & drop
    const dz = document.getElementById('dropZone');
    const fi = document.getElementById('fileInput');

    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fi.addEventListener('change', () => handleFiles(fi.files));

    document.getElementById('submitEvidenceBtn').addEventListener('click', simulateUpload);
}

function handleFiles(files) {
    const list = document.getElementById('uploadFileList');
    Array.from(files).forEach(f => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
      <span class="fi-icon">${fileIcon(f.name)}</span>
      <span class="fi-name">${f.name}</span>
      <span class="fi-size">${formatSize(f.size)}</span>
      <button class="fi-remove" onclick="this.parentElement.remove()">✕</button>`;
        list.appendChild(item);
    });
    // Fake hash
    const hash = Array.from({length:32},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
    const sha   = Array.from({length:64},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
    document.getElementById('hashDisplay').textContent = `MD5: ${hash} | SHA256: ${sha}`;
    document.getElementById('integrityCheck').innerHTML = '<span style="color:var(--green)">✔ Hash computed. Integrity baseline established.</span>';
}

function simulateUpload() {
    const fileItems = document.getElementById('uploadFileList').querySelectorAll('.file-item');
    if (!fileItems.length) { toast('No files selected','error'); return; }

    const section = document.getElementById('uploadProgressSection');
    const pList   = document.getElementById('progressList');
    section.classList.remove('hidden');
    pList.innerHTML = '';

    Array.from(fileItems).forEach((f, i) => {
        const name = f.querySelector('.fi-name').textContent;
        const id   = 'prog-' + i;
        pList.innerHTML += `
      <div class="prog-item">
        <div class="prog-name">${name}</div>
        <div class="prog-bar-bg"><div class="prog-bar-fill" id="${id}" style="width:0%"></div></div>
        <div class="prog-pct" id="${id}-pct">0%</div>
      </div>`;
        animateProgress(id, i * 600);
    });
}

function animateProgress(id, delay) {
    setTimeout(() => {
        let w = 0;
        const iv = setInterval(() => {
            w = Math.min(100, w + Math.random() * 12 + 3);
            const el = document.getElementById(id);
            const pt = document.getElementById(id+'-pct');
            if (el) el.style.width = w + '%';
            if (pt) pt.textContent = Math.round(w) + '%';
            if (w >= 100) {
                clearInterval(iv);
                if (pt) pt.style.color = 'var(--green)';
                toast(`✅ File uploaded successfully`,'success');
            }
        }, 120);
    }, delay);
}

// ════════════════════════════════════════════════════════════════
//  CHAIN OF CUSTODY PAGE
// ════════════════════════════════════════════════════════════════
function renderCustodyPage() {
    buildCustodyTable(CUSTODY_DATA);

    document.getElementById('custodySearchBtn').addEventListener('click', () => {
        const q = document.getElementById('custodySearch').value.trim().toUpperCase();
        const ev = CUSTODY_DATA.filter(c => c.evId.includes(q) || c.caseId.includes(q));
        if (!ev.length) { toast('No records found','error'); return; }
        buildCustodyTimeline(ev[0].evId);
        buildCustodyTable(CUSTODY_DATA.filter(c => c.evId === ev[0].evId));
    });
}

function buildCustodyTimeline(evId) {
    const records = CUSTODY_DATA.filter(c => c.evId === evId);
    const tl = document.getElementById('custodyTimeline');
    document.querySelector('#custodyCard .card-title').textContent = `Evidence ID: ${evId}`;

    const iconMap = { 'Received':'📥','Transferred':'🔄','Under Analysis':'🔬','Report Filed':'📊','Submitted':'✅','Returned':'📦' };
    const clsMap  = { 'Received':'received','Transferred':'transfer','Under Analysis':'analysis','Submitted':'submitted','Report Filed':'submitted','Returned':'returned' };

    tl.innerHTML = records.map(r => `
    <div class="custody-step">
      <div class="cs-dot ${clsMap[r.action]||'received'}">${iconMap[r.action]||'📌'}</div>
      <div class="cs-content">
        <div class="cs-title">${r.action}</div>
        <div class="cs-meta">📅 ${r.datetime}</div>
        <div class="cs-detail">
          <b>From:</b> ${r.from} &nbsp;→&nbsp; <b>To:</b> ${r.to}<br>
          <b>Reason:</b> ${r.reason} &nbsp;|&nbsp; <b>Seal Intact:</b> ${r.seal==='Yes'?'✅ Yes':'❌ No'}
        </div>
      </div>
    </div>`).join('');
}

function buildCustodyTable(data) {
    document.getElementById('custodyTableBody').innerHTML = data.map(c => `
    <tr>
      <td style="color:#388bfd;font-family:var(--mono)">${c.evId}</td>
      <td style="color:#79c0ff;font-family:var(--mono)">${c.caseId}</td>
      <td>${c.action}</td>
      <td>${c.from}</td>
      <td>${c.to}</td>
      <td style="font-family:var(--mono)">${c.datetime}</td>
      <td>${c.reason}</td>
      <td>${c.seal==='Yes'?'<span class="badge compliant">✅ Yes</span>':'<span class="badge critical">❌ No</span>'}</td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  REPORTS PAGE
// ════════════════════════════════════════════════════════════════
function renderReportsPage() {
    buildReportsTable();

    // Populate case dropdown
    const sel = document.getElementById('rptCaseId');
    if (sel) sel.innerHTML = CASES_DATA.map(c =>
        `<option>${c.id}</option>`).join('');

    document.getElementById('newReportBtn').addEventListener('click', () => {
        document.getElementById('reportUploadForm').classList.toggle('hidden');
    });
    document.getElementById('cancelReportBtn').addEventListener('click', () => {
        document.getElementById('reportUploadForm').classList.add('hidden');
    });
    document.getElementById('submitReportBtn').addEventListener('click', () => {
        toast('📋 Analysis report submitted successfully','success');
        document.getElementById('reportUploadForm').classList.add('hidden');
    });
}

function buildReportsTable() {
    document.getElementById('reportsTableBody').innerHTML = REPORTS_DATA.map(r => `
    <tr>
      <td style="color:#388bfd;font-family:var(--mono)">${r.id}</td>
      <td style="color:#79c0ff;font-family:var(--mono)">${r.caseId}</td>
      <td>${r.title}</td>
      <td>${r.analyst}</td>
      <td>${r.type}</td>
      <td>${r.date}</td>
      <td>${r.size}</td>
      <td><span class="badge ${cssClass(r.status)}">${r.status}</span></td>
      <td>
        <button class="act-btn" onclick="viewReport('${r.id}')">View</button>
        <button class="act-btn" onclick="downloadReport('${r.id}')">⬇ Download</button>
      </td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  SEARCH PAGE
// ════════════════════════════════════════════════════════════════
function renderSearchPage() {
    document.querySelectorAll('.stab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('mainSearchInput').placeholder =
                btn.dataset.stab === 'hash'    ? 'Enter MD5 / SHA256 hash…' :
                    btn.dataset.stab === 'suspect' ? 'Enter suspect name or ID…' :
                        btn.dataset.stab === 'evidence'? 'Enter evidence ID or type…' :
                            'Enter case ID, title, FIR number…';
        });
    });

    document.getElementById('mainSearchBtn').addEventListener('click', doSearch);
    document.getElementById('mainSearchInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') doSearch();
    });
}

function doSearch() {
    const q   = document.getElementById('mainSearchInput').value.trim().toLowerCase();
    const tab = document.querySelector('.stab.active').dataset.stab;
    const res = document.getElementById('searchResultsContainer');
    if (!q) return;

    let results = [];

    if (tab === 'cases' || tab === 'suspect') {
        results = CASES_DATA.filter(c =>
            (c.id+c.title+c.type+c.fir+c.inv+c.court).toLowerCase().includes(q)
        ).map(c => ({
            type:'Case', id:c.id,
            meta:[
                `Type: <b>${c.type}</b>`,
                `FIR: <b>${c.fir}</b>`,
                `Investigator: <b>${c.inv}</b>`,
                `Priority: <b>${c.priority}</b>`,
                `Status: <b>${c.status}</b>`,
                `SLA: <b>${c.sla}</b>`
            ]
        }));
    }

    if (tab === 'evidence' || tab === 'hash') {
        const evRes = EVIDENCE_DATA.filter(e =>
            (e.id+e.caseId+e.type+e.desc+e.hash).toLowerCase().includes(q)
        ).map(e => ({
            type:'Evidence', id:e.id,
            meta:[
                `Case: <b>${e.caseId}</b>`,
                `Type: <b>${e.type}</b>`,
                `Analyst: <b>${e.analyst}</b>`,
                `Status: <b>${e.status}</b>`,
                `Hash: <b style="font-family:var(--mono)">${e.hash.slice(0,20)}…</b>`
            ]
        }));
        results = [...results, ...evRes];
    }

    if (!results.length) {
        res.innerHTML = `<div class="empty-state">No results found for "<b>${q}</b>"</div>`;
        return;
    }

    res.innerHTML = results.map(r => `
    <div class="search-result-card">
      <div class="src-header">
        <span class="src-type">${r.type}</span>
        <span class="src-id">${r.id}</span>
      </div>
      <div class="src-meta">${r.meta.map(m => `<span>${m}</span>`).join('')}</div>
    </div>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  SLA PAGE
// ════════════════════════════════════════════════════════════════
function renderSLAPage() {
    document.getElementById('slaRulesBody').innerHTML = SLA_RULES.map(r => `
    <tr>
      <td style="color:#388bfd">${r.id}</td>
      <td>${r.type}</td>
      <td><span class="badge ${r.priority.toLowerCase()}">${r.priority}</span></td>
      <td>${r.days} days</td>
      <td>${r.warn}%</td>
      <td>${r.action}</td>
      <td><span class="badge active">${r.status.toUpperCase()}</span></td>
    </tr>`).join('');

    const bl = document.getElementById('slaBreachList');
    bl.innerHTML = SLA_ALERTS.filter(a => a.sev !== 'compliant').map(a => `
    <div class="sla-alert-item">
      <span class="sla-icon">${a.sev==='breached'?'🔴':'⚠️'}</span>
      <div class="sla-content">
        <div class="sla-case">${a.caseId}</div>
        <div class="sla-meta">${a.title}</div>
        <div class="sla-meta" style="color:${a.dueIn<0?'var(--red)':'var(--yellow)'}">
          ${a.dueIn<0?`Breached by ${Math.abs(a.dueIn)}d`:`Due in ${a.dueIn}d`}
        </div>
      </div>
    </div>`).join('');

    setTimeout(() => drawSLABar('slaBarCanvas'), 100);
}

// ════════════════════════════════════════════════════════════════
//  NOTIFICATIONS PAGE
// ════════════════════════════════════════════════════════════════
function renderNotificationsPage() {
    let activeType = 'all';

    function buildNotifList() {
        const data = activeType === 'all'
            ? NOTIFICATIONS_DATA
            : NOTIFICATIONS_DATA.filter(n => n.type === activeType);

        document.getElementById('notifList').innerHTML = data.map(n => `
      <div class="notif-item ${n.unread?'unread':''}">
        <span class="ni-icon">${n.icon}</span>
        <div class="ni-content">
          <div class="ni-title">${n.title}</div>
          <div class="ni-body">${n.body}</div>
          <div class="ni-time">🕐 ${n.time}</div>
          <div class="ni-actions">
            ${n.unread ? `<button class="act-btn" onclick="markRead(${n.id})">✔ Mark Read</button>` : ''}
            <button class="act-btn" onclick="dismissNotif(${n.id})">Dismiss</button>
          </div>
        </div>
        ${n.unread ? '<span class="badge open" style="align-self:flex-start">NEW</span>' : ''}
      </div>`).join('');
    }

    buildNotifList();

    document.querySelectorAll('.notif-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeType = tab.dataset.ntype;
            buildNotifList();
        });
    });

    document.getElementById('markAllReadBtn').addEventListener('click', () => {
        NOTIFICATIONS_DATA.forEach(n => n.unread = false);
        document.getElementById('notifBadge').textContent = '0';
        document.getElementById('notifDot').textContent   = '0';
        buildNotifList();
        toast('All notifications marked as read','success');
    });
}

// ════════════════════════════════════════════════════════════════
//  USERS PAGE
// ════════════════════════════════════════════════════════════════
function renderUsersPage() {
    const al = document.getElementById('authLevels');
    al.innerHTML = AUTH_LEVELS.map(l => `
    <div class="auth-card">
      <span class="auth-level-badge" style="background:${l.color}22;color:${l.color};border:1px solid ${l.color}44">${l.label}</span>
      <div class="auth-title">${l.title}</div>
      <div class="auth-perms">${l.perms}</div>
    </div>`).join('');

    document.getElementById('usersTableBody').innerHTML = USERS_DATA.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td style="color:#79c0ff;font-family:var(--mono)">${u.uname}</td>
      <td>${u.role}</td>
      <td>
        <span class="badge ${u.authLevel<=2?'critical':u.authLevel===3?'medium':u.authLevel===4?'low':'archived'}">
          Level ${u.authLevel}
        </span>
      </td>
      <td>${u.dept}</td>
      <td style="color:var(--text-dim)">${u.lastLogin}</td>
      <td><span class="badge ${u.status}">${u.status.toUpperCase()}</span></td>
      <td>
        <button class="act-btn" onclick="editUser('${u.uname}')">Edit</button>
        <button class="act-btn" onclick="resetPwd('${u.uname}')">Reset PWD</button>
        ${u.uname!=='admin'?`<button class="act-btn danger" onclick="toggleUser('${u.uname}')">Disable</button>`:''}
      </td>
    </tr>`).join('');

    document.getElementById('addUserBtn').addEventListener('click', () =>
        openModal('➕ Add New User',`
      <div class="form-body" style="padding:0">
        <div class="form-group" style="margin-bottom:10px"><label>Full Name</label><input class="form-input" placeholder="Full name"/></div>
        <div class="form-group" style="margin-bottom:10px"><label>Username</label><input class="form-input" placeholder="username"/></div>
        <div class="form-group" style="margin-bottom:10px"><label>Role</label>
          <select class="form-input">
            <option>Investigator</option><option>Forensic Analyst</option>
            <option>Supervisor</option><option>Court User</option><option>External Agency</option>
          </select>
        </div>
        <div class="form-group"><label>Auth Level</label>
          <select class="form-input">
            <option>Level 2</option><option>Level 3</option><option>Level 4</option><option>Level 5</option>
          </select>
        </div>
        <button class="hdr-btn primary" style="margin-top:14px;width:100%" onclick="toast('User created successfully','success');document.getElementById('modalOverlay').classList.add('hidden')">Create User</button>
      </div>`)
    );
}

// ════════════════════════════════════════════════════════════════
//  AUDIT LOG PAGE
// ════════════════════════════════════════════════════════════════
function renderAuditPage() {
    document.getElementById('auditTableBody').innerHTML = AUDIT_DATA.map(a => `
    <tr>
      <td>${a.id}</td>
      <td style="font-family:var(--mono)">${a.ts}</td>
      <td style="color:#79c0ff">${a.user}</td>
      <td>${a.action}</td>
      <td>${a.module}</td>
      <td style="color:#388bfd;font-family:var(--mono)">${a.record}</td>
      <td style="font-family:var(--mono)">${a.ip}</td>
      <td><span class="badge ${a.result==='Success'?'compliant':'critical'}">${a.result}</span></td>
    </tr>`).join('');

    document.getElementById('exportAuditBtn').addEventListener('click', () => {
        const csv = ['#,Timestamp,User,Action,Module,Record,IP,Result',
            ...AUDIT_DATA.map(a => `${a.id},${a.ts},${a.user},${a.action},${a.module},${a.record},${a.ip},${a.result}`)
        ].join('\n');
        dlFile(csv, 'dems_audit_log.csv', 'text/csv');
        toast('📊 Audit log exported','success');
    });
}

// ════════════════════════════════════════════════════════════════
//  ACTION HANDLERS
// ════════════════════════════════════════════════════════════════
function viewCase(id) {
    const c = CASES_DATA.find(x => x.id === id);
    if (!c) return;
    openModal(`📁 Case Details – ${id}`, `
    <b>Title:</b> ${c.title}<br>
    <b>Type:</b> ${c.type}<br>
    <b>FIR No.:</b> ${c.fir}<br>
    <b>Investigator:</b> ${c.inv}<br>
    <b>Court:</b> ${c.court}<br>
    <b>Priority:</b> ${c.priority.toUpperCase()}<br>
    <b>Status:</b> ${c.status}<br>
    <b>Created:</b> ${c.created}<br>
    <b>SLA Due:</b> ${c.sla}<br>
    <b>Evidence Items:</b> ${c.evCount}<br><br>
    <b>SLA Status:</b> <span style="color:${slaColor(c.sla)==='sla-ok'?'var(--green)':'var(--red)'}">${slaLabel(c.sla)}</span>`);
}

function editCase(id) { toast(`✏️ Editing case ${id}…`,'info'); navigate('newcase'); }

function viewEvidence(id) {
    const e = EVIDENCE_DATA.find(x => x.id === id);
    if (!e) return;
    openModal(`🗂️ Evidence – ${id}`, `
    <b>Case ID:</b> ${e.caseId}<br>
    <b>Type:</b> ${e.type}<br>
    <b>Description:</b> ${e.desc}<br>
    <b>Size:</b> ${e.size}<br>
    <b>Received:</b> ${e.received}<br>
    <b>Analyst:</b> ${e.analyst}<br>
    <b>Status:</b> ${e.status}<br>
    <b>MD5 Hash:</b> <span style="font-family:var(--mono);font-size:11px">${e.hash}</span><br><br>
    <b>Integrity:</b> <span style="color:var(--green)">✔ Verified – Hash matches baseline</span>`);
}

function viewCustody(evId) {
    navigate('custody');
    setTimeout(() => {
        document.getElementById('custodySearch').value = evId;
        buildCustodyTimeline(evId);
        buildCustodyTable(CUSTODY_DATA.filter(c => c.evId === evId));
    }, 200);
}

function verifyHash(id) {
    toast(`🔐 Hash verified for ${id} — Integrity confirmed ✔`,'success');
}

function viewReport(id) {
    const r = REPORTS_DATA.find(x => x.id === id);
    if (!r) return;
    openModal(`📋 Report – ${id}`, `
    <b>Case ID:</b> ${r.caseId}<br>
    <b>Title:</b> ${r.title}<br>
    <b>Type:</b> ${r.type}<br>
    <b>Analyst:</b> ${r.analyst}<br>
    <b>Date:</b> ${r.date}<br>
    <b>Size:</b> ${r.size}<br>
    <b>Status:</b> ${r.status}`);
}

function downloadReport(id) { toast(`⬇ Downloading report ${id}…`,'success'); }
function editUser(u)  { toast(`✏️ Edit user: ${u}`,'info'); }
function resetPwd(u)  { toast(`🔑 Password reset email sent to ${u}`,'success'); }
function toggleUser(u){ toast(`🚫 User ${u} disabled`,'warning'); }
function markRead(id) {
    const n = NOTIFICATIONS_DATA.find(x => x.id === id);
    if (n) { n.unread = false; rendered['notifications'] = false; renderPage('notifications'); }
}
function dismissNotif(id) {
    const i = NOTIFICATIONS_DATA.findIndex(x => x.id === id);
    if (i > -1) { NOTIFICATIONS_DATA.splice(i,1); rendered['notifications'] = false; renderPage('notifications'); }
}

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════
function cssClass(status) {
    return status.toLowerCase().replace(/\s+/g,'-');
}

function slaColor(slaDate) {
    const days = (new Date(slaDate) - new Date()) / 86400000;
    if (days < 0)  return 'style="color:var(--red);font-weight:700"';
    if (days < 10) return 'style="color:var(--yellow);font-weight:700"';
    return 'style="color:var(--green)"';
}

function slaLabel(slaDate) {
    const days = Math.ceil((new Date(slaDate) - new Date()) / 86400000);
    if (days < 0)  return `⛔ Breached ${Math.abs(days)}d ago`;
    if (days < 10) return `⚠️ ${days}d left`;
    return `✅ ${days}d left`;
}

function typeIcon(type) {
    const m = {
        'Hard Disk':'💾','Mobile Phone':'📱','Image File':'🖼️',
        'Video File':'🎥','Audio File':'🎵','CDR':'📞',
        'Document':'📄','Email Archive':'📧','Network Log':'🌐'
    };
    return m[type] || '📎';
}

function fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (['mp4','avi','mkv','mov'].includes(ext)) return '🎥';
    if (['mp3','wav','aac'].includes(ext))       return '🎵';
    if (['jpg','jpeg','png','bmp'].includes(ext))return '🖼️';
    if (['pdf','doc','docx'].includes(ext))      return '📄';
    if (['csv','xlsx','xls'].includes(ext))      return '📊';
    if (['img','dd','e01'].includes(ext))        return '💾';
    return '📎';
}

function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes/1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes/1048576).toFixed(1) + ' MB';
    return (bytes/1073741824).toFixed(2) + ' GB';
}

function dlFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// ════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════
function init() {
    startClock();
    renderDashboard();
    setupNewCasePage();

    // Refresh button
    document.getElementById('refreshDash').addEventListener('click', () => {
        rendered['dashboard'] = false;
        renderDashboard();
        toast('Dashboard refreshed','success');
    });

    document.getElementById('printDash').addEventListener('click', () => window.print());

    // Welcome toast
    setTimeout(() => toast('🛡️ DEMS loaded. Welcome, Supt. Prasad.','success',3000), 800);
    setTimeout(() => toast('⚠️ 2 SLA breaches require immediate attention!','warning',4000), 2000);
}

init();