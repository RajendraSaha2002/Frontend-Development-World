/* ================================================================
   dashboard.js  –  Main Controller for CTMS Dashboard
   Depends on:  data.js   charts.js
   ================================================================ */

// ── State ─────────────────────────────────────────────────────────
let threatMap    = null;
let threatMapFull= null;
let mapPaused    = false;
let currentPage  = 'dashboard';
let alertFilter  = 'all';
let feedItems    = [];
let tickerAlerts = [...ALERTS_DATA];

// ════════════════════════════════════════════════════════════════
//  CLOCK
// ════════════════════════════════════════════════════════════════
function startClock() {
    function tick() {
        const now  = new Date();
        const hms  = now.toTimeString().split(' ')[0];
        const date = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
        document.getElementById('topbarClock').textContent = hms;
        document.getElementById('topbarDate').textContent  = date;
    }
    tick();
    setInterval(tick, 1000);
}

// ════════════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ════════════════════════════════════════════════════════════════
function showToast(msg, type = 'red', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all .3s';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ════════════════════════════════════════════════════════════════
//  MODAL
// ════════════════════════════════════════════════════════════════
function openModal(title, bodyHTML) {
    document.getElementById('modalHeader').textContent  = title;
    document.getElementById('modalBody').innerHTML      = bodyHTML;
    document.getElementById('modalOverlay').classList.remove('hidden');
}
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.add('hidden');
});

// ════════════════════════════════════════════════════════════════
//  SIDEBAR TOGGLE
// ════════════════════════════════════════════════════════════════
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.querySelector('.main-wrapper').classList.toggle('expanded');
});

// ════════════════════════════════════════════════════════════════
//  PAGE NAVIGATION
// ════════════════════════════════════════════════════════════════
const PAGE_MAP = {
    dashboard:  'pageDashboard',
    threatmap:  'pageThreatmap',
    honeypot:   'pageHoneypot',
    stats:      'pageStats',
    cnc:        'pageCnc',
    nodes:      'pageNodes',
    alerts:     'pageAlerts',
    reports:    'pageReports',
    search:     'pageSearch',
    users:      'pageUsers'
};

const PAGE_LABELS = {
    dashboard:'Dashboard', threatmap:'Threat Map', honeypot:'Active Honeypot',
    stats:'Data Statistics', cnc:'C&C Detection', nodes:'Node Management',
    alerts:'High Severity Alerts', reports:'Report Download',
    search:'Search', users:'User Management'
};

function navigateTo(page) {
    if (page === 'logout') {
        if (confirm('Logout from CTMS?')) showToast('Session ended. Goodbye!','orange');
        return;
    }
    currentPage = page;

    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));

    // Show target
    const target = document.getElementById(PAGE_MAP[page]);
    if (target) target.classList.remove('hidden');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.page === page);
    });

    // Breadcrumb
    document.getElementById('breadcrumbCurrent').textContent = PAGE_LABELS[page] || page;

    // Render on first visit
    renderPage(page);
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// ════════════════════════════════════════════════════════════════
//  PAGE RENDERERS
// ════════════════════════════════════════════════════════════════
const rendered = {};

function renderPage(page) {
    if (rendered[page]) return; // only render once per page
    rendered[page] = true;

    switch(page) {
        case 'threatmap': renderThreatMapPage();  break;
        case 'honeypot':  renderHoneypotPage();   break;
        case 'stats':     renderStatsPage();      break;
        case 'cnc':       renderCncPage();        break;
        case 'nodes':     renderNodesPage();      break;
        case 'alerts':    renderAlertsPage();     break;
        case 'reports':   renderReportsPage();    break;
        case 'users':     renderUsersPage();      break;
    }
}

// ── Stat Cards ────────────────────────────────────────────────────
function renderStatCards() {
    const container = document.getElementById('statCards');
    container.innerHTML = STAT_CARDS.map(c => `
    <div class="stat-card ${c.color}">
      <span class="sc-delta ${c.dir}">${c.dir==='up'?'▲':'▼'} ${c.delta}</span>
      <span class="sc-icon">${c.icon}</span>
      <span class="sc-value" id="scv-${c.key}">${c.value}</span>
      <span class="sc-label">${c.label}</span>
    </div>
  `).join('');
}

// ── Alerts Table (dashboard) ──────────────────────────────────────
function renderAlertsTable() {
    const tbody = document.getElementById('alertsTableBody');
    tbody.innerHTML = ALERTS_DATA.slice(0, 8).map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.time}</td>
      <td style="color:#ff8c00">${a.srcIp}</td>
      <td>${a.target}</td>
      <td>${a.type}</td>
      <td><span class="badge ${a.severity}">${a.severity.toUpperCase()}</span></td>
      <td><span class="badge ${a.status}">${a.status.toUpperCase()}</span></td>
      <td>
        <button class="act-btn block" onclick="blockIp('${a.srcIp}')">Block</button>
        <button class="act-btn" onclick="viewAlert(${a.id})">View</button>
      </td>
    </tr>
  `).join('');
}

// ── Honeypot Table (dashboard) ────────────────────────────────────
function renderHoneypotTable() {
    const tbody = document.getElementById('honeypotTableBody');
    tbody.innerHTML = HONEYPOT_DATA.slice(0,6).map(h => `
    <tr>
      <td>${h.name}</td>
      <td>${h.type}</td>
      <td>${h.loc}</td>
      <td style="color:#ff8c00;font-weight:700">${h.attacks.toLocaleString()}</td>
      <td><span class="badge ${h.status}">${h.status.toUpperCase()}</span></td>
    </tr>
  `).join('');
}

// ── CnC Table (dashboard) ─────────────────────────────────────────
function renderCncTable() {
    const tbody = document.getElementById('cncTableBody');
    tbody.innerHTML = CNC_DATA.slice(0,5).map(c => `
    <tr>
      <td style="color:#ff3b3b">${c.ip}</td>
      <td>${c.country}</td>
      <td style="color:#ffd700">${c.bots.toLocaleString()}</td>
      <td>${c.proto}</td>
      <td><span class="badge ${c.risk>=90?'critical':c.risk>=80?'high':'medium'}">${c.risk}</span></td>
    </tr>
  `).join('');
}

// ── Live Attack Feed ───────────────────────────────────────────────
function addFeedItem() {
    const src  = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const sev  = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const tgt  = TARGET_NAMES[Math.floor(Math.random() * TARGET_NAMES.length)];
    const ip   = `${Math.floor(Math.random()*220)+10}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const now  = new Date().toTimeString().slice(0,8);

    const feed = document.getElementById('attackFeed');
    if (!feed) return;

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
    <span class="feed-time">${now}</span>
    <span class="feed-flag">${src.flag}</span>
    <div class="feed-content">
      <span class="feed-src">${ip}</span>
      <span class="feed-type ${sev}">${type}</span>
      <div style="color:#5a7a9a;font-size:10px;margin-top:2px">→ ${tgt} &nbsp;|&nbsp; ${src.name}</div>
    </div>`;

    feed.insertBefore(item, feed.firstChild);

    // Keep max 30
    while (feed.children.length > 30) feed.removeChild(feed.lastChild);

    // Random high-severity toast
    if (sev === 'critical' && Math.random() < 0.3) {
        showToast(`🚨 CRITICAL: ${type} from ${ip} (${src.flag} ${src.name}) → ${tgt}`, 'red');
        updateAlertBadge(1);
    }
}

function updateAlertBadge(n) {
    const badge = document.getElementById('alertBadge');
    const notif = document.getElementById('notifCount');
    const cur   = parseInt(badge.textContent) || 0;
    badge.textContent = cur + n;
    notif.textContent = cur + n;
}

// ── Threat Map Full Page ───────────────────────────────────────────
function renderThreatMapPage() {
    if (!threatMapFull) {
        threatMapFull = new ThreatMap('threatMapFullCanvas', 1100, 520);
        threatMapFull.start();
    }

    const mapStats = document.getElementById('mapStats');
    mapStats.innerHTML = [
        { label:'Active Attacks',   val:'24'   },
        { label:'Source Countries', val:'19'   },
        { label:'Top Source',       val:'China'},
        { label:'Top Target',       val:'Govt' },
        { label:'Attack/min',       val:'4.2'  },
        { label:'Blocked',          val:'1,402'}
    ].map(s => `
    <div class="ms-item">
      <span class="ms-label">${s.label}:</span>
      <span class="ms-val">${s.val}</span>
    </div>`).join('');
}

// ── Honeypot Full Page ────────────────────────────────────────────
function renderHoneypotPage() {
    const grid = document.getElementById('honeypotGrid');
    grid.innerHTML = HONEYPOT_DATA.map(h => {
        const color = h.status === 'alert' ? '#ff3b3b' : h.status === 'offline' ? '#5a7a9a' : '#00ff88';
        return `
    <div class="hp-card ${h.status}">
      <div class="hp-icon">${h.status==='alert'?'🔴':h.status==='offline'?'⚫':'🟢'} 🍯</div>
      <div class="hp-name">${h.name}</div>
      <div class="hp-type">${h.type} &nbsp;|&nbsp; ${h.loc}</div>
      <div class="hp-stats">
        <div class="hp-stat">
          <span class="hp-stat-v" style="color:#ff8c00">${h.attacks.toLocaleString()}</span>
          <span class="hp-stat-l">Attacks</span>
        </div>
        <div class="hp-stat">
          <span class="hp-stat-v" style="color:${color}">${h.status.toUpperCase()}</span>
          <span class="hp-stat-l">Status</span>
        </div>
        <div class="hp-stat">
          <span class="hp-stat-v" style="color:${color}">${h.load}%</span>
          <span class="hp-stat-l">Load</span>
        </div>
      </div>
      <div class="hp-bar-bg">
        <div class="hp-bar-fill" style="width:${h.load}%;background:${color}"></div>
      </div>
    </div>`;
    }).join('');
}

// ── Stats Page ────────────────────────────────────────────────────
function renderStatsPage() {
    setTimeout(() => {
        drawDonut('statsDonutCanvas', MALWARE_TYPES, null);

        // Draw legend manually for stats donut
        const c = document.getElementById('statsDonutCanvas');
        if (c) {
            // Draw legend below
            const ctx = c.getContext('2d');
            const cw  = c.width, ch = c.height;
            MALWARE_TYPES.forEach((d, i) => {
                const x = 10 + (i % 3) * 110;
                const y = ch - 30 + Math.floor(i / 3) * 16;
                ctx.fillStyle = d.color;
                ctx.fillRect(x, y, 8, 8);
                ctx.fillStyle = '#5a7a9a';
                ctx.font      = '10px Segoe UI';
                ctx.textAlign = 'left';
                ctx.fillText(`${d.name} ${d.pct}%`, x + 11, y + 8);
            });
        }

        drawBar('monthlyBarCanvas', MONTHLY_ATTACKS, 'month', 'attacks',
            (d) => `hsl(${200 + d.attacks / 300},80%,55%)`);
        drawLine('riskLineCanvas', RISK_SCORES, 'Risk Score', '#ff3b3b');
    }, 100);
}

// ── CnC Full Page ─────────────────────────────────────────────────
function renderCncPage() {
    const tbody = document.getElementById('cncFullTableBody');
    tbody.innerHTML = CNC_DATA.map(c => {
        const riskClass = c.risk >= 90 ? 'critical' : c.risk >= 80 ? 'high' : 'medium';
        return `
    <tr>
      <td style="color:#ff3b3b">${c.ip}</td>
      <td style="color:#00d4ff">${c.domain}</td>
      <td>${c.country}</td>
      <td style="color:#ffd700;font-weight:700">${c.bots.toLocaleString()}</td>
      <td>${c.proto}</td>
      <td style="color:#5a7a9a">${c.first}</td>
      <td>${c.last}</td>
      <td><span class="badge ${riskClass}">${c.risk}/100</span></td>
      <td>
        <button class="act-btn block" onclick="blockIp('${c.ip}')">Block</button>
        <button class="act-btn" onclick="viewCnc('${c.ip}')">Details</button>
      </td>
    </tr>`;
    }).join('');
}

// ── Nodes Page ────────────────────────────────────────────────────
function renderNodesPage() {
    const grid = document.getElementById('nodeGrid');
    grid.innerHTML = NODES_DATA.map(n => `
    <div class="node-card">
      <div class="nc-header">
        <div class="nc-status-dot ${n.status}"></div>
        <div>
          <div class="nc-name">${n.name}</div>
          <div class="nc-ip">${n.ip}</div>
        </div>
      </div>
      <div class="nc-metrics">
        <div class="nc-metric"><span class="nc-metric-l">CPU</span><span class="nc-metric-v">${n.cpu}</span></div>
        <div class="nc-metric"><span class="nc-metric-l">Memory</span><span class="nc-metric-v">${n.mem}</span></div>
        <div class="nc-metric"><span class="nc-metric-l">Disk</span><span class="nc-metric-v">${n.disk}</span></div>
        <div class="nc-metric"><span class="nc-metric-l">Events</span><span class="nc-metric-v">${n.events.toLocaleString()}</span></div>
        <div class="nc-metric"><span class="nc-metric-l">Uptime</span><span class="nc-metric-v">${n.uptime}</span></div>
        <div class="nc-metric"><span class="nc-metric-l">Status</span><span class="nc-metric-v" style="color:${n.status==='online'?'var(--green)':'var(--red)'}">${n.status.toUpperCase()}</span></div>
      </div>
    </div>`).join('');
}

// ── Alerts Full Page ──────────────────────────────────────────────
function renderAlertsPage() {
    renderAlertsFullTable();
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            alertFilter = btn.dataset.filter;
            rendered['alerts'] = false;
            renderAlertsFullTable();
        });
    });
}

function renderAlertsFullTable() {
    const tbody = document.getElementById('alertsFullBody');
    const data  = alertFilter === 'all'
        ? ALERTS_DATA
        : ALERTS_DATA.filter(a => a.severity === alertFilter);
    tbody.innerHTML = data.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.time}</td>
      <td style="color:#ff8c00">${a.srcIp}</td>
      <td>${a.target}</td>
      <td>${a.type}</td>
      <td style="color:#00d4ff">${a.malware}</td>
      <td><span class="badge ${a.severity}">${a.severity.toUpperCase()}</span></td>
      <td><span class="badge ${a.status}">${a.status.toUpperCase()}</span></td>
    </tr>`).join('');
}

// ── Reports Page ──────────────────────────────────────────────────
function renderReportsPage() {
    const grid = document.getElementById('reportGrid');
    grid.innerHTML = REPORTS_DATA.map(r => `
    <div class="report-card">
      <div class="rc-icon">${r.icon}</div>
      <div class="rc-title">${r.title}</div>
      <div class="rc-desc">${r.desc}</div>
      <div class="rc-meta">
        <span>📅 ${r.date}</span>
        <span>📦 ${r.size}</span>
        <span>${r.type}</span>
      </div>
      <button class="run-btn" style="width:100%;font-size:12px;padding:7px"
        onclick="downloadReport('${r.title}')">⬇ Download</button>
    </div>`).join('');
}

// ── Users Page ────────────────────────────────────────────────────
function renderUsersPage() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = USERS_DATA.map(u => `
    <tr>
      <td>${u.id}</td>
      <td style="color:#00d4ff">${u.username}</td>
      <td>${u.role}</td>
      <td style="color:#5a7a9a">${u.lastLogin}</td>
      <td><span class="badge ${u.status}">${u.status.toUpperCase()}</span></td>
      <td>
        <button class="act-btn" onclick="editUser('${u.username}')">Edit</button>
        ${u.username !== 'admin' ? `<button class="act-btn block" onclick="disableUser('${u.username}')">Disable</button>` : ''}
      </td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  INTERACTIVE ACTIONS
// ════════════════════════════════════════════════════════════════
function blockIp(ip) {
    openModal(`🚫 Block IP: ${ip}`,
        `<b>IP:</b> ${ip}<br><b>Action:</b> This IP will be added to the blocklist and all active connections will be terminated.<br><br>
     <b>Recommended Rules:</b><br>
     • Firewall DROP rule applied<br>
     • SIEM alert generated<br>
     • Threat Intel record updated<br><br>
     <span style="color:var(--green)">✔ Successfully blocked ${ip}</span>`
    );
    showToast(`✅ IP ${ip} has been blocked`, 'green');
}

function viewAlert(id) {
    const a = ALERTS_DATA.find(x => x.id === id);
    if (!a) return;
    openModal(`⚠️ Alert #${id} – ${a.type}`,
        `<b>Time:</b> ${a.time}<br>
     <b>Source IP:</b> ${a.srcIp}<br>
     <b>Target:</b> ${a.target}<br>
     <b>Attack Type:</b> ${a.type}<br>
     <b>Malware:</b> ${a.malware}<br>
     <b>Severity:</b> ${a.severity.toUpperCase()}<br>
     <b>Status:</b> ${a.status.toUpperCase()}<br><br>
     <b>Recommended Action:</b><br>
     • Block source IP immediately<br>
     • Check for lateral movement<br>
     • Review system logs for related events<br>
     • Update IDS/IPS signatures`
    );
}

function viewCnc(ip) {
    const c = CNC_DATA.find(x => x.ip === ip);
    if (!c) return;
    openModal(`🕵️ C&C Server: ${ip}`,
        `<b>IP:</b> ${c.ip}<br>
     <b>Domain:</b> ${c.domain}<br>
     <b>Country:</b> ${c.country}<br>
     <b>Bots Connected:</b> ${c.bots.toLocaleString()}<br>
     <b>Protocol:</b> ${c.proto}<br>
     <b>First Seen:</b> ${c.first}<br>
     <b>Last Active:</b> ${c.last}<br>
     <b>Risk Score:</b> ${c.risk}/100<br><br>
     <b>Mitigation:</b><br>
     • Null-route IP at border router<br>
     • Sinkhole domain via DNS<br>
     • Disinfect bot endpoints<br>
     • Report to CERT-In`
    );
}

function editUser(username) {
    showToast(`✏️ Edit user: ${username}`, 'orange');
}

function disableUser(username) {
    showToast(`🚫 User ${username} has been disabled`, 'red');
}

function downloadReport(title) {
    showToast(`⬇ Downloading: ${title}...`, 'green');
}

function exportAlerts() {
    const csv = ['#,Time,Source IP,Target,Attack Type,Severity,Status',
        ...ALERTS_DATA.map(a =>
            `${a.id},${a.time},${a.srcIp},${a.target},${a.type},${a.severity},${a.status}`)
    ].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = 'ctms_alerts.csv';
    link.click();
    showToast('📊 Alerts exported to CSV', 'green');
}

// ── Search ────────────────────────────────────────────────────────
document.getElementById('searchBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value.trim();
    if (!q) return;
    const res = document.getElementById('searchResults');

    // Mock search results
    const results = [
        { type:'IP Address',  value: q.includes('.')?q:'192.168.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255),
            country:'India 🇮🇳', seen:'2 hrs ago', attacks:'14', risk:'High' },
        { type:'Domain',      value: q.includes('.')?q+'.evil':'malware-'+q+'.ru',
            country:'Russia 🇷🇺', seen:'5 min ago', attacks:'204', risk:'Critical' },
        { type:'Hash (MD5)',  value: Array.from({length:32},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),
            country:'N/A', seen:'1 day ago', attacks:'N/A', risk:'Medium' }
    ];

    res.innerHTML = results.map(r => `
    <div class="search-result-card">
      <div class="src-type">${r.type}</div>
      <div class="src-value">${r.value}</div>
      <div class="src-meta">
        <span>🌍 <b>${r.country}</b></span>
        <span>🕐 Last seen: <b>${r.seen}</b></span>
        <span>⚡ Attacks: <b>${r.attacks}</b></span>
        <span>Risk: <b style="color:${r.risk==='Critical'?'var(--red)':r.risk==='High'?'var(--orange)':'var(--yellow)'}">${r.risk}</b></span>
      </div>
    </div>`).join('');
});

document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

// ── Map Pause ─────────────────────────────────────────────────────
document.getElementById('mapPauseBtn').addEventListener('click', () => {
    mapPaused = !mapPaused;
    if (threatMap) threatMap.pause();
    document.getElementById('mapPauseBtn').textContent = mapPaused ? '▶ Resume' : '⏸ Pause';
});

document.getElementById('btn-refresh').addEventListener('click', () => {
    if (threatMapFull) { threatMapFull.stop(); threatMapFull = null; }
    rendered['threatmap'] = false;
    renderPage('threatmap');
});

// ── Export Alerts ─────────────────────────────────────────────────
document.getElementById('exportAlertsBtn').addEventListener('click', exportAlerts);

// ════════════════════════════════════════════════════════════════
//  LIVE UPDATES  (simulate real-time data)
// ════════════════════════════════════════════════════════════════
function liveUpdates() {
    // Update stat card values randomly
    STAT_CARDS.forEach(card => {
        const el = document.getElementById('scv-' + card.key);
        if (!el) return;
        // Small random increment
        const raw = parseInt(el.textContent.replace(/,/g,'')) || 0;
        const bump = Math.floor(Math.random() * 5);
        if (bump > 0 && card.dir === 'up') {
            el.textContent = (raw + bump).toLocaleString();
        }
    });

    // Update threat level randomly
    const levels = [
        { text:'CRITICAL', color:'var(--red)',    dot:'var(--red)'    },
        { text:'HIGH',     color:'var(--red)',    dot:'var(--red)'    },
        { text:'MEDIUM',   color:'var(--orange)', dot:'var(--orange)' },
        { text:'LOW',      color:'var(--green)',  dot:'var(--green)'  }
    ];
    const lvl = levels[Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.5 ? 2 : 3];
    const tlEl = document.getElementById('threatLevelText');
    const indicator = document.getElementById('threatLevelIndicator');
    if (tlEl) {
        tlEl.textContent  = lvl.text;
        tlEl.style.color  = lvl.color;
    }
    if (indicator) {
        const dot = indicator.querySelector('.tl-dot');
        if (dot) dot.style.background = dot.style.boxShadow = lvl.dot;
    }
}

// ════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════
function init() {
    startClock();
    renderStatCards();
    renderAlertsTable();
    renderHoneypotTable();
    renderCncTable();

    // Init threat map (small)
    threatMap = new ThreatMap('threatMapCanvas', 780, 340);
    threatMap.start();

    // Charts
    setTimeout(() => {
        drawDonut('sectorDonutCanvas', SECTORS, 'donutLegend');
        drawBar('malwareBarCanvas', MALWARE_FAMILIES, 'name', 'count', d => d.color);
        drawLine('trendLineCanvas', TREND_24H, '24h Trend', '#00d4ff');
    }, 200);

    // Live feed
    setInterval(addFeedItem, 1800);
    addFeedItem(); addFeedItem(); addFeedItem();

    // Live stat updates
    setInterval(liveUpdates, 5000);

    // Alert badge initial
    const criticalCount = ALERTS_DATA.filter(a => a.severity === 'critical' && a.status === 'new').length;
    document.getElementById('alertBadge').textContent = criticalCount;
    document.getElementById('notifCount').textContent  = criticalCount;

    // Welcome toast
    setTimeout(() => showToast('🛡️ CTMS Dashboard loaded. Monitoring active.', 'green', 3000), 800);
    setTimeout(() => showToast('⚠️ 3 CRITICAL alerts require immediate attention!', 'red', 4000), 2000);
}

init();