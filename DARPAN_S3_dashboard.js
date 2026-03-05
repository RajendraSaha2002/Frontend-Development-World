/**
 * dashboard.js — DARPAN S3 Dashboard Controller
 * Manages multi-page navigation, module rendering, real-time simulation,
 * notifications, and all DARPAN S3 feature modules.
 * Depends on: data.js, charts.js
 */

'use strict';

const DarpanDashboard = (() => {

    /* ════════════════════════════════════════════════════
       1. STATE
    ════════════════════════════════════════════════════ */
    const state = {
        activePage   : 'overview',
        sidebarOpen  : true,
        theme        : 'dark',
        alerts       : [],
        notifications: [],
        intervalIds  : [],
        resizeObs    : [],
        currentUser  : { name: 'Admin', role: 'Super Admin', avatar: 'AD' },
    };

    /* ════════════════════════════════════════════════════
       2. PAGE REGISTRY
       Each entry defines id, label, icon, and a render fn.
    ════════════════════════════════════════════════════ */
    const PAGES = [
        { id:'overview',      label:'Overview',         icon:'⬡',  render: renderOverview      },
        { id:'topology',      label:'Topology',          icon:'⬡',  render: renderTopology      },
        { id:'performance',   label:'Performance',       icon:'⬡',  render: renderPerformance   },
        { id:'fault',         label:'Fault Management',  icon:'⬡',  render: renderFault         },
        { id:'config',        label:'Configuration',     icon:'⬡',  render: renderConfig        },
        { id:'sla',           label:'SLA Management',    icon:'⬡',  render: renderSLA           },
        { id:'security',      label:'Security',          icon:'⬡',  render: renderSecurity      },
        { id:'cloud',         label:'Cloud Management',  icon:'⬡',  render: renderCloud         },
        { id:'mpls',          label:'MPLS Management',   icon:'⬡',  render: renderMPLS          },
        { id:'traffic',       label:'Traffic Flow',      icon:'⬡',  render: renderTrafficFlow   },
        { id:'logs',          label:'Log Management',    icon:'⬡',  render: renderLogs          },
        { id:'reports',       label:'Reports',           icon:'⬡',  render: renderReports       },
        { id:'helpdesk',      label:'Help Desk',         icon:'⬡',  render: renderHelpDesk      },
        { id:'inventory',     label:'Inventory',         icon:'⬡',  render: renderInventory     },
    ];

    /* Icons map (SVG-free text symbols for zero-dep) */
    const ICONS = {
        overview   : '◈', topology  : '◉', performance: '◎', fault    : '◈',
        config     : '⚙', sla       : '◑', security   : '⛨', cloud    : '☁',
        mpls       : '⊕', traffic   : '⇌', logs        : '≡', reports  : '⊞',
        helpdesk   : '☎', inventory : '☰',
    };

    /* ════════════════════════════════════════════════════
       3. BOOTSTRAP
    ════════════════════════════════════════════════════ */
    function init() {
        _buildShell();
        _buildSidebar();
        _buildTopBar();
        _buildMainArea();
        _bindGlobalEvents();
        navigateTo('overview');
        _startNotificationPoller();
        _startAlertSimulator();
        console.info('[DARPAN S3] Dashboard initialised.');
    }

    /* ─── Shell ────────────────────────────────────────── */
    function _buildShell() {
        document.body.innerHTML = '';
        document.body.setAttribute('data-theme', state.theme);

        const shell = _el('div', 'darpan-shell');
        const sidebar = _el('aside', 'darpan-sidebar');
        sidebar.id = 'sidebar';
        const main = _el('div', 'darpan-main');
        main.id = 'main-area';

        shell.appendChild(sidebar);
        shell.appendChild(main);
        document.body.appendChild(shell);
    }

    /* ─── Sidebar ──────────────────────────────────────── */
    function _buildSidebar() {
        const sb = document.getElementById('sidebar');

        // Brand
        const brand = _el('div', 'sidebar-brand');
        brand.innerHTML = `
      <div class="brand-logo">D</div>
      <div class="brand-text">
        <span class="brand-name">DARPAN S3</span>
        <span class="brand-sub">Autonomic NMS</span>
      </div>`;
        sb.appendChild(brand);

        // Nav
        const nav = _el('nav', 'sidebar-nav');
        PAGES.forEach(p => {
            const item = _el('div', 'nav-item');
            item.id    = `nav-${p.id}`;
            item.setAttribute('data-page', p.id);
            item.innerHTML = `
        <span class="nav-icon">${ICONS[p.id] || '◈'}</span>
        <span class="nav-label">${p.label}</span>
        <span class="nav-badge" id="badge-${p.id}" style="display:none">0</span>`;
            item.addEventListener('click', () => navigateTo(p.id));
            nav.appendChild(item);
        });
        sb.appendChild(nav);

        // Footer
        const foot = _el('div', 'sidebar-footer');
        foot.innerHTML = `
      <div class="user-card">
        <div class="user-avatar">${state.currentUser.avatar}</div>
        <div class="user-info">
          <span class="user-name">${state.currentUser.name}</span>
          <span class="user-role">${state.currentUser.role}</span>
        </div>
      </div>`;
        sb.appendChild(foot);
    }

    /* ─── Top Bar ──────────────────────────────────────── */
    function _buildTopBar() {
        const main = document.getElementById('main-area');
        const bar  = _el('header', 'topbar');
        bar.innerHTML = `
      <div class="topbar-left">
        <button class="btn-icon" id="btn-toggle-sidebar" title="Toggle Sidebar">☰</button>
        <div class="breadcrumb" id="breadcrumb">Overview</div>
      </div>
      <div class="topbar-right">
        <div class="topbar-status">
          <span class="status-dot online"></span>
          <span id="live-time"></span>
        </div>
        <button class="btn-icon notif-btn" id="btn-notif" title="Notifications">
          🔔 <span class="notif-count" id="notif-count">0</span>
        </button>
        <button class="btn-icon" id="btn-theme" title="Toggle Theme">◑</button>
        <button class="btn-icon" id="btn-refresh" title="Refresh">⟳</button>
      </div>`;
        main.appendChild(bar);

        // Notification panel
        const panel = _el('div', 'notif-panel hidden');
        panel.id = 'notif-panel';
        panel.innerHTML = `
      <div class="notif-header">
        <span>Notifications</span>
        <button class="btn-small" id="btn-clear-notif">Clear All</button>
      </div>
      <div class="notif-list" id="notif-list"></div>`;
        main.appendChild(panel);

        _startClock();
    }

    /* ─── Main Area ────────────────────────────────────── */
    function _buildMainArea() {
        const main    = document.getElementById('main-area');
        const content = _el('div', 'page-content');
        content.id    = 'page-content';
        main.appendChild(content);
    }

    /* ─── Global Events ─────────────────────────────────── */
    function _bindGlobalEvents() {
        document.getElementById('btn-toggle-sidebar').addEventListener('click', _toggleSidebar);
        document.getElementById('btn-theme').addEventListener('click', _toggleTheme);
        document.getElementById('btn-refresh').addEventListener('click', () => navigateTo(state.activePage));
        document.getElementById('btn-notif').addEventListener('click', _toggleNotifPanel);
        document.getElementById('btn-clear-notif').addEventListener('click', _clearNotifications);

        document.addEventListener('click', e => {
            const panel = document.getElementById('notif-panel');
            const btn   = document.getElementById('btn-notif');
            if (panel && !panel.contains(e.target) && e.target !== btn) {
                panel.classList.add('hidden');
            }
        });

        window.addEventListener('resize', () => {
            // Re-render active page charts on resize
            setTimeout(() => navigateTo(state.activePage), 150);
        });
    }

    /* ════════════════════════════════════════════════════
       4. NAVIGATION
    ════════════════════════════════════════════════════ */
    function navigateTo(pageId) {
        // Clear timers from previous page
        state.intervalIds.forEach(id => clearInterval(id));
        state.intervalIds = [];

        state.activePage = pageId;

        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-page') === pageId);
        });

        // Breadcrumb
        const pg = PAGES.find(p => p.id === pageId);
        const bc = document.getElementById('breadcrumb');
        if (bc && pg) bc.textContent = pg.label;

        // Render
        const content = document.getElementById('page-content');
        if (!content) return;
        content.innerHTML = '';
        content.scrollTop = 0;

        const page = PAGES.find(p => p.id === pageId);
        if (page) page.render(content);
        else      content.innerHTML = `<p class="text-muted">Page not found.</p>`;
    }

    /* ════════════════════════════════════════════════════
       5. PAGE RENDERERS
    ════════════════════════════════════════════════════ */

    /* ── 5.1 OVERVIEW ─────────────────────────────────── */
    function renderOverview(container) {
        const d = window.DarpanData;

        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Network Overview</h2>
        <span class="page-subtitle">Policy Based Autonomic Network &amp; Cloud Management</span>
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid" id="kpi-grid"></div>

      <!-- Charts Row -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span>Network Performance</span><span class="badge badge-live">LIVE</span></div>
          <div class="chart-wrap"><canvas id="ch-perf" style="width:100%;height:220px"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><span>Fault Distribution</span></div>
          <div class="chart-wrap"><canvas id="ch-fault-donut" style="width:100%;height:220px"></canvas></div>
        </div>
      </div>

      <!-- Alerts + SLA -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span>Active Alarms</span>
            <span class="badge badge-danger" id="alarm-count">0</span></div>
          <div id="alarm-list" class="event-list"></div>
        </div>
        <div class="card">
          <div class="card-header"><span>SLA Compliance</span></div>
          <div class="chart-wrap"><canvas id="ch-sla-bar" style="width:100%;height:220px"></canvas></div>
        </div>
      </div>

      <!-- selfCHOP status -->
      <div class="card">
        <div class="card-header"><span>selfCHOP Status</span>
          <span class="badge badge-success">Active</span></div>
        <div class="chop-grid" id="chop-grid"></div>
      </div>`;

        _renderKPIs(d);
        _renderOverviewCharts(d);
        _renderAlarmList(d);
        _renderCHOP();

        // Live update every 5 s
        const id = setInterval(() => {
            _refreshPerfChart(d);
        }, 5000);
        state.intervalIds.push(id);
    }

    function _renderKPIs(d) {
        const kpis = d ? d.kpis : DarpanData_FALLBACK.kpis;
        const grid = document.getElementById('kpi-grid');
        if (!grid) return;
        grid.innerHTML = kpis.map(k => `
      <div class="kpi-card">
        <div class="kpi-icon" style="color:${k.color}">${k.icon}</div>
        <div class="kpi-body">
          <div class="kpi-value" id="kpi-${k.id}">0</div>
          <div class="kpi-label">${k.label}</div>
        </div>
        <canvas id="spark-${k.id}" class="sparkline" style="width:80px;height:32px"></canvas>
      </div>`).join('');

        kpis.forEach(k => {
            DarpanCharts.animateCounter(`kpi-${k.id}`, 0, k.value, 1400, k.suffix || '');
            if (k.spark) DarpanCharts.renderSparkline(`spark-${k.id}`, k.spark, k.color);
        });
    }

    function _renderOverviewCharts(d) {
        const C = DarpanCharts;
        const src = d || window.DarpanData;

        // Performance line
        C.renderLineChart('ch-perf',
            src.perfSeries,
            { title:'CPU / Memory / Bandwidth Utilisation (%)', labels: src.timeLabels, yMin:0, yMax:100, area:true }
        );

        // Fault donut
        C.renderDonutChart('ch-fault-donut',
            src.faultSegments,
            { title:'Fault Severity Distribution', centerText: src.totalFaults + '\nFaults', donut:true }
        );

        // SLA bar
        C.renderBarChart('ch-sla-bar',
            src.slaCompliance,
            { title:'SLA Compliance (%)', yMax:100 }
        );
    }

    function _refreshPerfChart(d) {
        if (!d) return;
        // Shift data left and append new random point
        d.perfSeries.forEach(s => {
            s.data.shift();
            s.data.push(Math.round(20 + Math.random() * 65));
        });
        d.timeLabels.shift();
        const now = new Date();
        d.timeLabels.push(`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
        DarpanCharts.renderLineChart('ch-perf', d.perfSeries,
            { title:'CPU / Memory / Bandwidth Utilisation (%)', labels: d.timeLabels, yMin:0, yMax:100, area:true });
    }

    function _renderAlarmList(d) {
        const el = document.getElementById('alarm-list');
        const cnt = document.getElementById('alarm-count');
        if (!el) return;
        const alarms = d ? d.activeAlarms : [];
        if (cnt) cnt.textContent = alarms.length;
        el.innerHTML = alarms.map(a => `
      <div class="event-row sev-${a.severity.toLowerCase()}">
        <span class="ev-dot"></span>
        <div class="ev-body">
          <span class="ev-title">${a.message}</span>
          <span class="ev-meta">${a.device} · ${a.time}</span>
        </div>
        <span class="ev-badge sev-${a.severity.toLowerCase()}">${a.severity}</span>
      </div>`).join('') || '<p class="text-muted" style="padding:12px">No active alarms</p>';
    }

    function _renderCHOP() {
        const grid = document.getElementById('chop-grid');
        if (!grid) return;
        const items = [
            { id:'cfg',  label:'Self-Configuration', desc:'Auto-config new devices on discovery', active:true,  color:'#28c76f' },
            { id:'heal', label:'Self-Healing',        desc:'Auto-remediation of detected faults',  active:true,  color:'#1e90ff' },
            { id:'opt',  label:'Self-Optimisation',   desc:'Dynamic policy tuning for performance',active:false, color:'#ff9f43' },
            { id:'prot', label:'Self-Protection',     desc:'Threat detection & automated response', active:true,  color:'#ea5455' },
        ];
        grid.innerHTML = items.map(it => `
      <div class="chop-card">
        <div class="chop-indicator" style="background:${it.active ? it.color : '#555'}"></div>
        <div class="chop-body">
          <div class="chop-title">${it.label}</div>
          <div class="chop-desc">${it.desc}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${it.active ? 'checked' : ''} onchange="DarpanDashboard.toggleCHOP('${it.id}',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>`).join('');
    }

    /* ── 5.2 TOPOLOGY ────────────────────────────────── */
    function renderTopology(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Topology Discovery &amp; Mapping</h2>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="DarpanDashboard.rediscoverTopology()">⟳ Rediscover</button>
          <select class="select-sm" id="topo-filter">
            <option>All Domains</option>
            ${(d ? d.domains : []).map(dm => `<option>${dm}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid-3 mb-16">
        ${_topoStat('Total Devices', d ? d.topology.nodes.length : 0, '#1e90ff')}
        ${_topoStat('Active Links', d ? d.topology.links.length : 0, '#28c76f')}
        ${_topoStat('Down Nodes',   d ? d.topology.nodes.filter(n=>n.status==='down').length : 0, '#ea5455')}
      </div>
      <div class="card topo-card">
        <div class="card-header"><span>Network Topology</span>
          <span class="badge badge-info">Auto-discovered</span></div>
        <canvas id="ch-topology" style="width:100%;height:440px"></canvas>
      </div>
      <div class="card mt-16">
        <div class="card-header"><span>Device Inventory Summary</span></div>
        <div id="topo-table"></div>
      </div>`;

        _renderTopologyCanvas(d);
        _renderTopoTable(d);
    }

    function _topoStat(label, value, color) {
        return `<div class="card stat-mini" style="border-left:3px solid ${color}">
      <div class="stat-val" style="color:${color}">${value}</div>
      <div class="stat-lbl">${label}</div></div>`;
    }

    function _renderTopologyCanvas(d) {
        const canvas = document.getElementById('ch-topology');
        if (!canvas || !d) return;
        const dpr  = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width  = rect.width  * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const w = rect.width, h = rect.height;

        ctx.fillStyle = DarpanCharts.COLORS.darkBg;
        ctx.fillRect(0, 0, w, h);

        const nodes = d.topology.nodes;
        const links = d.topology.links;

        // Position nodes in a force-like grid
        const cols   = Math.ceil(Math.sqrt(nodes.length));
        const spaceX = w / (cols + 1);
        const spaceY = h / (Math.ceil(nodes.length / cols) + 1);

        nodes.forEach((n, i) => {
            n._x = spaceX * ((i % cols) + 1) + (Math.random() * spaceX * 0.4 - spaceX * 0.2);
            n._y = spaceY * (Math.floor(i / cols) + 1) + (Math.random() * spaceY * 0.4 - spaceY * 0.2);
        });

        // Draw links
        links.forEach(lk => {
            const src = nodes.find(n => n.id === lk.src);
            const dst = nodes.find(n => n.id === lk.dst);
            if (!src || !dst) return;
            ctx.beginPath();
            ctx.moveTo(src._x, src._y);
            ctx.lineTo(dst._x, dst._y);
            ctx.strokeStyle = lk.status === 'up'
                ? DarpanCharts.hexToRgba('#28c76f', 0.5)
                : DarpanCharts.hexToRgba('#ea5455', 0.5);
            ctx.lineWidth = 1.5;
            ctx.setLineDash(lk.status === 'up' ? [] : [4,4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Link label (speed)
            if (lk.speed) {
                const mx = (src._x + dst._x) / 2;
                const my = (src._y + dst._y) / 2;
                ctx.fillStyle = DarpanCharts.COLORS.text;
                ctx.font = '8px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(lk.speed, mx, my - 3);
            }
        });

        // Draw nodes
        const typeColors = { router:'#1e90ff', switch:'#28c76f', server:'#ff9f43', firewall:'#ea5455', ap:'#9c27b0' };
        nodes.forEach(n => {
            const col = typeColors[n.type] || '#aaa';
            const r   = n.type === 'router' ? 18 : 14;

            // Glow for down nodes
            if (n.status === 'down') {
                ctx.beginPath(); ctx.arc(n._x, n._y, r + 6, 0, Math.PI*2);
                ctx.fillStyle = DarpanCharts.hexToRgba('#ea5455', 0.2); ctx.fill();
            }

            ctx.beginPath(); ctx.arc(n._x, n._y, r, 0, Math.PI*2);
            const g = ctx.createRadialGradient(n._x-3, n._y-3, 1, n._x, n._y, r);
            g.addColorStop(0, DarpanCharts.hexToRgba(col, 0.9));
            g.addColorStop(1, DarpanCharts.hexToRgba(col, 0.5));
            ctx.fillStyle = g; ctx.fill();
            ctx.strokeStyle = n.status === 'up' ? col : '#ea5455';
            ctx.lineWidth = 2; ctx.stroke();

            // Status ring
            ctx.beginPath(); ctx.arc(n._x + r*0.65, n._y - r*0.65, 4, 0, Math.PI*2);
            ctx.fillStyle = n.status === 'up' ? '#28c76f' : '#ea5455'; ctx.fill();

            // Label
            ctx.fillStyle = '#e0e9ff'; ctx.font = 'bold 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(n.name, n._x, n._y + r + 12);
            ctx.fillStyle = DarpanCharts.COLORS.text; ctx.font = '8px Inter, sans-serif';
            ctx.fillText(n.ip, n._x, n._y + r + 22);
        });

        // Legend
        const types = Object.entries(typeColors);
        types.forEach(([type, col], i) => {
            const lx = 20 + i * 90;
            ctx.beginPath(); ctx.arc(lx, h - 14, 5, 0, Math.PI*2);
            ctx.fillStyle = col; ctx.fill();
            ctx.fillStyle = DarpanCharts.COLORS.text; ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(type.charAt(0).toUpperCase()+type.slice(1), lx+9, h-10);
        });
    }

    function _renderTopoTable(d) {
        const el = document.getElementById('topo-table');
        if (!el || !d) return;
        el.innerHTML = `
      <table class="data-table">
        <thead><tr>
          <th>Device Name</th><th>IP Address</th><th>Type</th>
          <th>Domain</th><th>Status</th><th>Uptime</th>
        </tr></thead>
        <tbody>
          ${d.topology.nodes.map(n => `
            <tr>
              <td><strong>${n.name}</strong></td>
              <td class="mono">${n.ip}</td>
              <td><span class="tag">${n.type}</span></td>
              <td>${n.domain}</td>
              <td><span class="status-pill ${n.status}">${n.status.toUpperCase()}</span></td>
              <td>${n.uptime || 'N/A'}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    }

    /* ── 5.3 PERFORMANCE ─────────────────────────────── */
    function renderPerformance(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Performance Monitoring</h2>
        <div class="page-actions">
          <select class="select-sm" id="perf-interval">
            <option>Last 1 Hour</option><option>Last 6 Hours</option>
            <option>Last 24 Hours</option><option>Last 7 Days</option>
          </select>
        </div>
      </div>
      <div class="gauge-row">
        <div class="card"><canvas id="g-cpu"  style="width:100%;height:180px"></canvas></div>
        <div class="card"><canvas id="g-mem"  style="width:100%;height:180px"></canvas></div>
        <div class="card"><canvas id="g-disk" style="width:100%;height:180px"></canvas></div>
        <div class="card"><canvas id="g-bw"   style="width:100%;height:180px"></canvas></div>
      </div>
      <div class="grid-2 mt-16">
        <div class="card">
          <div class="card-header"><span>Interface Utilisation</span></div>
          <canvas id="ch-iface" style="width:100%;height:240px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>Response Time (ms)</span></div>
          <canvas id="ch-rtt" style="width:100%;height:240px"></canvas>
        </div>
      </div>
      <div class="card mt-16">
        <div class="card-header"><span>Top Devices by CPU Utilisation</span></div>
        <div id="perf-device-list" class="device-list"></div>
      </div>`;

        const C = DarpanCharts;
        const p = d ? d.performance : {};

        C.renderGaugeChart('g-cpu',  p.cpu  || 67, { title:'CPU',      unit:'%', max:100 });
        C.renderGaugeChart('g-mem',  p.mem  || 74, { title:'Memory',   unit:'%', max:100 });
        C.renderGaugeChart('g-disk', p.disk || 52, { title:'Disk I/O', unit:'%', max:100 });
        C.renderGaugeChart('g-bw',   p.bw   || 38, { title:'Bandwidth',unit:'%', max:100 });

        C.renderStackedBar('ch-iface',
            d ? d.timeLabels.slice(-8) : [],
            d ? d.ifaceSeries : [],
            { title:'Interface Utilisation (Mbps)' }
        );

        C.renderLineChart('ch-rtt',
            d ? d.rttSeries : [],
            { title:'Round-Trip Time', labels: d ? d.timeLabels : [], yMin:0, area:false }
        );

        // Device list
        const list = document.getElementById('perf-device-list');
        if (list && d && d.topDevices) {
            list.innerHTML = d.topDevices.map(dev => `
        <div class="device-row">
          <span class="dev-name">${dev.name}</span>
          <span class="dev-ip mono">${dev.ip}</span>
          <div class="prog-bar-wrap">
            <div class="prog-bar" style="width:${dev.cpu}%;background:${dev.cpu>80?'#ea5455':dev.cpu>60?'#ff9f43':'#28c76f'}"></div>
          </div>
          <span class="dev-pct ${dev.cpu>80?'text-danger':dev.cpu>60?'text-warning':'text-success'}">${dev.cpu}%</span>
        </div>`).join('');
        }
    }

    /* ── 5.4 FAULT MANAGEMENT ────────────────────────── */
    function renderFault(container) {
        const d  = window.DarpanData;
        const fa = d ? d.faults : [];

        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Fault Management</h2>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="DarpanDashboard.acknowledgeAll()">✓ Ack All</button>
          <button class="btn btn-outline btn-sm" onclick="DarpanDashboard.clearFaults()">✕ Clear</button>
        </div>
      </div>
      <div class="grid-3 mb-16">
        ${_faultStat('Critical', fa.filter(f=>f.sev==='Critical').length, '#ea5455')}
        ${_faultStat('Major',    fa.filter(f=>f.sev==='Major').length,    '#ff9f43')}
        ${_faultStat('Minor',    fa.filter(f=>f.sev==='Minor').length,    '#1e90ff')}
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Fault Trend (Last 7 Days)</span></div>
          <canvas id="ch-fault-trend" style="width:100%;height:220px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>Root Cause Analysis</span></div>
          <canvas id="ch-rca" style="width:100%;height:220px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>Active Faults</span>
          <input type="text" class="search-input" id="fault-search" placeholder="Search faults…" oninput="DarpanDashboard.filterFaults(this.value)">
        </div>
        <div id="fault-table-wrap">
          ${_faultTable(fa)}
        </div>
      </div>`;

        const C = DarpanCharts;
        if (d) {
            C.renderLineChart('ch-fault-trend', d.faultTrend,
                { title:'Fault Events Over Time', labels: d.faultDays, area:true });
            C.renderDonutChart('ch-rca', d.rcaSegments,
                { title:'Root Cause Distribution', donut:true, centerText:'RCA' });
        }
    }

    function _faultStat(label, val, color) {
        return `<div class="card fault-stat" style="border-top:3px solid ${color}">
      <div class="fs-val" style="color:${color}">${val}</div>
      <div class="fs-lbl">${label}</div></div>`;
    }

    function _faultTable(faults) {
        if (!faults || !faults.length) return '<p class="text-muted p12">No active faults.</p>';
        return `<table class="data-table" id="fault-table">
      <thead><tr>
        <th>ID</th><th>Device</th><th>Message</th><th>Severity</th>
        <th>Time</th><th>Status</th><th>Action</th>
      </tr></thead>
      <tbody>
        ${faults.map(f => `
          <tr id="frow-${f.id}">
            <td class="mono">${f.id}</td>
            <td>${f.device}</td>
            <td>${f.message}</td>
            <td><span class="sev-tag sev-${f.sev.toLowerCase()}">${f.sev}</span></td>
            <td>${f.time}</td>
            <td><span class="status-pill ${f.acked ? 'acked' : 'open'}">${f.acked ? 'Acked' : 'Open'}</span></td>
            <td>
              <button class="btn-tiny" onclick="DarpanDashboard.ackFault('${f.id}')">Ack</button>
              <button class="btn-tiny danger" onclick="DarpanDashboard.closeFault('${f.id}')">Close</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
    }

    /* ── 5.5 CONFIGURATION ───────────────────────────── */
    function renderConfig(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Configuration Management</h2>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="DarpanDashboard.backupAll()">⬇ Backup All</button>
          <button class="btn btn-outline btn-sm" onclick="DarpanDashboard.compareConfig()">⇌ Compare</button>
        </div>
      </div>
      <div class="grid-3 mb-16">
        ${_topoStat('Backed Up',    d ? d.configStats.backed   : 0, '#28c76f')}
        ${_topoStat('Pending',      d ? d.configStats.pending  : 0, '#ff9f43')}
        ${_topoStat('Changes Today',d ? d.configStats.changes  : 0, '#1e90ff')}
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Configuration Change Log</span></div>
          <div id="cfg-log" class="event-list"></div>
        </div>
        <div class="card">
          <div class="card-header"><span>Version Control</span></div>
          <canvas id="ch-cfg-bar" style="width:100%;height:240px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Device Configuration Status</span></div>
        <div id="cfg-device-table"></div>
      </div>`;

        if (d) {
            const el = document.getElementById('cfg-log');
            if (el) el.innerHTML = d.configLog.map(c => `
        <div class="event-row">
          <span class="ev-dot" style="background:#1e90ff"></span>
          <div class="ev-body">
            <span class="ev-title">${c.change}</span>
            <span class="ev-meta">${c.device} · ${c.user} · ${c.time}</span>
          </div>
          <button class="btn-tiny">Diff</button>
        </div>`).join('');

            DarpanCharts.renderBarChart('ch-cfg-bar', d.cfgVersionData,
                { title:'Configuration Versions per Device' });

            const tbl = document.getElementById('cfg-device-table');
            if (tbl) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr><th>Device</th><th>Last Backup</th><th>Versions</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${d.configDevices.map(cd => `
              <tr>
                <td>${cd.name}</td>
                <td>${cd.lastBackup}</td>
                <td><span class="badge">${cd.versions}</span></td>
                <td><span class="status-pill ${cd.status === 'Synced' ? 'up':'warn'}">${cd.status}</span></td>
                <td>
                  <button class="btn-tiny">Restore</button>
                  <button class="btn-tiny">View</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ── 5.6 SLA MANAGEMENT ──────────────────────────── */
    function renderSLA(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">SLA Management</h2>
      </div>
      <div class="kpi-grid mb-16" id="sla-kpis"></div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>SLA Compliance Trend</span></div>
          <canvas id="ch-sla-trend" style="width:100%;height:240px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>SLA Violations by Service</span></div>
          <canvas id="ch-sla-viol" style="width:100%;height:240px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>SLA Agreements</span></div>
        <div id="sla-table"></div>
      </div>`;

        if (d) {
            const kpis = document.getElementById('sla-kpis');
            if (kpis && d.slaKPIs) {
                kpis.innerHTML = d.slaKPIs.map(k => `
          <div class="kpi-card">
            <div class="kpi-icon" style="color:${k.color}">${k.icon}</div>
            <div class="kpi-body">
              <div class="kpi-value">${k.value}</div>
              <div class="kpi-label">${k.label}</div>
            </div>
          </div>`).join('');
            }

            DarpanCharts.renderLineChart('ch-sla-trend', d.slaTrendSeries,
                { title:'Compliance % Over Time', labels: d.slaMonths, yMin:80, yMax:100, area:true });

            DarpanCharts.renderBarChart('ch-sla-viol', d.slaViolations,
                { title:'SLA Violations Count' });

            const tbl = document.getElementById('sla-table');
            if (tbl && d.slaAgreements) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Service</th><th>Target</th><th>Actual</th>
            <th>Compliance</th><th>Violations</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${d.slaAgreements.map(s => `
              <tr>
                <td>${s.service}</td>
                <td>${s.target}%</td>
                <td>${s.actual}%</td>
                <td>
                  <div class="prog-bar-wrap" style="width:100px">
                    <div class="prog-bar" style="width:${s.actual}%;background:${s.actual>=s.target?'#28c76f':'#ea5455'}"></div>
                  </div>
                </td>
                <td>${s.violations}</td>
                <td><span class="status-pill ${s.actual>=s.target?'up':'down'}">${s.actual>=s.target?'Met':'Breached'}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ── 5.7 SECURITY ────────────────────────────────── */
    function renderSecurity(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Security Management</h2>
        <div class="page-actions">
          <span class="badge badge-success">Self-Protection: Active</span>
        </div>
      </div>
      <div class="grid-3 mb-16">
        ${_topoStat('Threats Blocked',  d ? d.security.blocked   : 0, '#ea5455')}
        ${_topoStat('Active Users',     d ? d.security.users     : 0, '#28c76f')}
        ${_topoStat('Audit Events',     d ? d.security.audit     : 0, '#1e90ff')}
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Threat Detection (7d)</span></div>
          <canvas id="ch-threats" style="width:100%;height:220px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>Security Event Heatmap</span></div>
          <canvas id="ch-sec-heat" style="width:100%;height:220px"></canvas>
        </div>
      </div>
      <div class="card mb-16">
        <div class="card-header"><span>User Access &amp; Audit Log</span></div>
        <div id="audit-log"></div>
      </div>
      <div class="card">
        <div class="card-header"><span>Security Profiles</span></div>
        <div id="sec-profiles"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderStackedBar('ch-threats', d.threatDays, d.threatSeries,
                { title:'Threat Events by Category' });
            DarpanCharts.renderHeatmap('ch-sec-heat', d.secHeatmap,
                { title:'Event Density (Hour × Day)', rowLabels: d.secHeatRows, colLabels: d.secHeatCols });

            const log = document.getElementById('audit-log');
            if (log && d.auditLog) log.innerHTML = d.auditLog.map(a => `
        <div class="event-row">
          <span class="ev-dot" style="background:${a.ok?'#28c76f':'#ea5455'}"></span>
          <div class="ev-body">
            <span class="ev-title">${a.action}</span>
            <span class="ev-meta">${a.user} · ${a.ip} · ${a.time}</span>
          </div>
          <span class="badge ${a.ok?'badge-success':'badge-danger'}">${a.ok?'OK':'FAIL'}</span>
        </div>`).join('');

            const prof = document.getElementById('sec-profiles');
            if (prof && d.secProfiles) prof.innerHTML = `
        <table class="data-table">
          <thead><tr><th>Role</th><th>Users</th><th>Permissions</th><th>View Scope</th><th>Status</th></tr></thead>
          <tbody>${d.secProfiles.map(p => `
            <tr>
              <td>${p.role}</td><td>${p.users}</td>
              <td>${p.perms}</td><td>${p.scope}</td>
              <td><span class="status-pill ${p.active?'up':'down'}">${p.active?'Active':'Inactive'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ── 5.8 CLOUD MANAGEMENT ────────────────────────── */
    function renderCloud(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Cloud Management</h2>
        <span class="page-subtitle">VMware vCloud &amp; OpenStack</span>
      </div>
      <div class="grid-2 mb-16">
        ${_cloudPlatformCard('VMware vCloud', d ? d.cloud.vmware : {}, '#1e90ff')}
        ${_cloudPlatformCard('OpenStack',     d ? d.cloud.openstack : {}, '#ea5455')}
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Resource Utilisation</span></div>
          <canvas id="ch-cloud-util" style="width:100%;height:220px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>VM Status Distribution</span></div>
          <canvas id="ch-vm-donut" style="width:100%;height:220px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Virtual Machines</span></div>
        <div id="vm-table"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderBarChart('ch-cloud-util', d.cloud.utilBar,
                { title:'vCPU / vRAM / Storage Utilisation (%)' });
            DarpanCharts.renderDonutChart('ch-vm-donut', d.cloud.vmSegments,
                { title:'VM Status', donut:true, centerText:`${d.cloud.totalVMs}\nVMs` });

            const tbl = document.getElementById('vm-table');
            if (tbl && d.cloud.vms) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>VM Name</th><th>Platform</th><th>vCPU</th>
            <th>vRAM</th><th>IP</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${d.cloud.vms.map(v => `
              <tr>
                <td>${v.name}</td>
                <td><span class="tag">${v.platform}</span></td>
                <td>${v.vcpu}</td><td>${v.vram} GB</td>
                <td class="mono">${v.ip}</td>
                <td><span class="status-pill ${v.status==='running'?'up':'down'}">${v.status}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    function _cloudPlatformCard(name, stats, color) {
        return `<div class="card cloud-platform-card" style="border-left:3px solid ${color}">
      <div class="cp-header" style="color:${color}">${name}</div>
      <div class="cp-stats">
        <div class="cp-stat"><span>${stats.vms||0}</span><label>VMs</label></div>
        <div class="cp-stat"><span>${stats.hosts||0}</span><label>Hosts</label></div>
        <div class="cp-stat"><span>${stats.networks||0}</span><label>Networks</label></div>
        <div class="cp-stat"><span class="status-pill ${stats.status==='Connected'?'up':'down'}">${stats.status||'N/A'}</span><label>Status</label></div>
      </div>
    </div>`;
    }

    /* ── 5.9 MPLS ─────────────────────────────────────── */
    function renderMPLS(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">MPLS Management</h2>
        <span class="page-subtitle">Provider / PE / CE Routers · L2VPN · L3VPN</span>
      </div>
      <div class="grid-3 mb-16">
        ${_topoStat('Provider Routers',  d ? d.mpls.p  : 0, '#1e90ff')}
        ${_topoStat('PE Routers',        d ? d.mpls.pe : 0, '#28c76f')}
        ${_topoStat('CE Routers',        d ? d.mpls.ce : 0, '#ff9f43')}
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>VPN Tunnel Status</span></div>
          <canvas id="ch-mpls-vpn" style="width:100%;height:220px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>MPLS Traffic Distribution</span></div>
          <canvas id="ch-mpls-traffic" style="width:100%;height:220px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>VPN Tunnel Table</span></div>
        <div id="mpls-table"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderDonutChart('ch-mpls-vpn', d.mpls.vpnSegments,
                { title:'VPN Type Distribution', donut:true });
            DarpanCharts.renderLineChart('ch-mpls-traffic', d.mpls.trafficSeries,
                { title:'MPLS LSP Traffic (Mbps)', labels: d.timeLabels, area:true });

            const tbl = document.getElementById('mpls-table');
            if (tbl && d.mpls.tunnels) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Tunnel ID</th><th>Type</th><th>Ingress PE</th>
            <th>Egress PE</th><th>Bandwidth</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${d.mpls.tunnels.map(t => `
              <tr>
                <td class="mono">${t.id}</td>
                <td><span class="tag">${t.type}</span></td>
                <td>${t.ingress}</td><td>${t.egress}</td>
                <td>${t.bw}</td>
                <td><span class="status-pill ${t.status==='up'?'up':'down'}">${t.status.toUpperCase()}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ── 5.10 TRAFFIC FLOW ─────────────────────────────── */
    function renderTrafficFlow(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Traffic Flow Analyser</h2>
        <span class="page-subtitle">NetFlow · JFlow · IPFIX</span>
        <div class="page-actions">
          <select class="select-sm">
            <option>NetFlow</option><option>JFlow</option><option>IPFIX</option>
          </select>
        </div>
      </div>
      <div class="grid-3 mb-16">
        ${_topoStat('Total Flow Records', d ? d.traffic.records : 0, '#1e90ff')}
        ${_topoStat('Top Talker BW',      d ? d.traffic.topBw  : '0 Mbps', '#ff9f43')}
        ${_topoStat('Anomalies Detected', d ? d.traffic.anomalies : 0, '#ea5455')}
      </div>
      <div class="card mb-16">
        <div class="card-header"><span>Real-time Bandwidth Utilisation</span>
          <span class="badge badge-live">LIVE</span></div>
        <canvas id="ch-bw-live" style="width:100%;height:220px"></canvas>
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Top Applications</span></div>
          <canvas id="ch-app-bar" style="width:100%;height:220px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>Protocol Distribution</span></div>
          <canvas id="ch-proto" style="width:100%;height:220px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Top Talkers</span></div>
        <div id="talker-table"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderLineChart('ch-bw-live', d.traffic.bwSeries,
                { title:'Inbound / Outbound Traffic (Mbps)', labels: d.timeLabels, area:true });
            DarpanCharts.renderBarChart('ch-app-bar', d.traffic.appBar,
                { title:'Top Applications by Traffic (Mbps)' });
            DarpanCharts.renderDonutChart('ch-proto', d.traffic.protoSegments,
                { title:'Protocol Share', donut:true });

            const tbl = document.getElementById('talker-table');
            if (tbl && d.traffic.topTalkers) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Source IP</th><th>Destination IP</th><th>Protocol</th>
            <th>In (Mbps)</th><th>Out (Mbps)</th><th>Sessions</th>
          </tr></thead>
          <tbody>
            ${d.traffic.topTalkers.map(t => `
              <tr>
                <td class="mono">${t.src}</td>
                <td class="mono">${t.dst}</td>
                <td><span class="tag">${t.proto}</span></td>
                <td>${t.inMbps}</td><td>${t.outMbps}</td><td>${t.sessions}</td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ── 5.11 LOG MANAGEMENT ─────────────────────────── */
    function renderLogs(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Log Management</h2>
        <span class="page-subtitle">Syslog · Windows Event Log · Audit Trail</span>
        <div class="page-actions">
          <input type="text" class="search-input" id="log-search" placeholder="Search logs…"
            oninput="DarpanDashboard.filterLogs(this.value)">
          <select class="select-sm" id="log-level">
            <option value="">All Levels</option>
            <option>ERROR</option><option>WARN</option><option>INFO</option><option>DEBUG</option>
          </select>
        </div>
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Log Volume (24h)</span></div>
          <canvas id="ch-log-vol" style="width:100%;height:200px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>Log Level Distribution</span></div>
          <canvas id="ch-log-lvl" style="width:100%;height:200px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Log Stream</span></div>
        <div id="log-stream" class="log-stream"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderStackedBar('ch-log-vol', d.logHours, d.logVolSeries,
                { title:'Log Events by Hour' });
            DarpanCharts.renderDonutChart('ch-log-lvl', d.logLevels,
                { title:'Log Level Distribution', donut:true });

            const stream = document.getElementById('log-stream');
            if (stream && d.logEntries) {
                stream.innerHTML = d.logEntries.map(l => `
          <div class="log-line log-${l.level.toLowerCase()}">
            <span class="log-ts">${l.ts}</span>
            <span class="log-lvl log-${l.level.toLowerCase()}">${l.level}</span>
            <span class="log-host">${l.host}</span>
            <span class="log-msg">${l.msg}</span>
          </div>`).join('');
            }
        }
    }

    /* ── 5.12 REPORTS ────────────────────────────────── */
    function renderReports(container) {
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Reports</h2>
        <span class="page-subtitle">HTML · CSV · XLS · Real-time &amp; Historical</span>
      </div>
      <div class="report-categories">
        ${_reportCategories().map(cat => `
          <div class="card report-cat-card">
            <div class="rcat-header">${cat.icon} ${cat.name}</div>
            <div class="rcat-list">
              ${cat.reports.map(r => `
                <div class="rcat-item">
                  <span>${r.name}</span>
                  <div class="rcat-actions">
                    <button class="btn-tiny" onclick="DarpanDashboard.generateReport('${r.id}','html')">HTML</button>
                    <button class="btn-tiny" onclick="DarpanDashboard.generateReport('${r.id}','csv')">CSV</button>
                    <button class="btn-tiny" onclick="DarpanDashboard.generateReport('${r.id}','xls')">XLS</button>
                  </div>
                </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="card mt-16">
        <div class="card-header"><span>Scheduled Reports</span>
          <button class="btn btn-primary btn-sm">+ Schedule</button></div>
        <div id="sched-reports"></div>
      </div>`;

        const d = window.DarpanData;
        const el = document.getElementById('sched-reports');
        if (el && d && d.scheduledReports) el.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Report</th><th>Schedule</th><th>Format</th><th>Recipients</th><th>Last Run</th><th>Status</th></tr></thead>
        <tbody>${d.scheduledReports.map(r => `
          <tr>
            <td>${r.name}</td><td>${r.schedule}</td>
            <td><span class="tag">${r.format}</span></td>
            <td>${r.recipients}</td><td>${r.lastRun}</td>
            <td><span class="status-pill ${r.active?'up':'down'}">${r.active?'Active':'Paused'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>`;
    }

    function _reportCategories() {
        return [
            { icon:'◎', name:'Performance',   reports:[{id:'cpu',name:'CPU Utilisation'},{id:'mem',name:'Memory Report'},{id:'bw',name:'Bandwidth Report'}] },
            { icon:'◈', name:'Fault',         reports:[{id:'alarm',name:'Alarm History'},{id:'rca',name:'Root Cause Analysis'},{id:'trend',name:'Fault Trend'}] },
            { icon:'⊕', name:'Configuration', reports:[{id:'change',name:'Change Log'},{id:'ver',name:'Version History'}] },
            { icon:'◑', name:'SLA',           reports:[{id:'sla',name:'SLA Compliance'},{id:'viol',name:'SLA Violations'}] },
            { icon:'⛨', name:'Security',      reports:[{id:'audit',name:'Audit Trail'},{id:'threat',name:'Threat Report'}] },
            { icon:'⇌', name:'Traffic',       reports:[{id:'flow',name:'Flow Summary'},{id:'talker',name:'Top Talkers'},{id:'app',name:'Application Usage'}] },
        ];
    }

    /* ── 5.13 HELP DESK ──────────────────────────────── */
    function renderHelpDesk(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Help Desk</h2>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="DarpanDashboard.newTicket()">+ New Ticket</button>
        </div>
      </div>
      <div class="grid-3 mb-16">
        ${_topoStat('Open Tickets',     d ? d.helpdesk.open     : 0, '#ff9f43')}
        ${_topoStat('In Progress',      d ? d.helpdesk.inprog   : 0, '#1e90ff')}
        ${_topoStat('Closed Today',     d ? d.helpdesk.closed   : 0, '#28c76f')}
      </div>
      <div class="grid-2 mb-16">
        <div class="card">
          <div class="card-header"><span>Ticket Trend (14 Days)</span></div>
          <canvas id="ch-hd-trend" style="width:100%;height:220px"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span>Priority Distribution</span></div>
          <canvas id="ch-hd-prio" style="width:100%;height:220px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Ticket Queue</span>
          <input type="text" class="search-input" placeholder="Search tickets…">
        </div>
        <div id="ticket-table"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderLineChart('ch-hd-trend', d.helpdesk.trendSeries,
                { title:'Tickets Opened vs Closed', labels: d.helpdesk.trendDays, area:false });
            DarpanCharts.renderDonutChart('ch-hd-prio', d.helpdesk.prioSegments,
                { title:'Ticket Priority', donut:true });

            const tbl = document.getElementById('ticket-table');
            if (tbl && d.helpdesk.tickets) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Ticket ID</th><th>Subject</th><th>Priority</th>
            <th>Assignee</th><th>Created</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${d.helpdesk.tickets.map(t => `
              <tr>
                <td class="mono">${t.id}</td>
                <td>${t.subject}</td>
                <td><span class="sev-tag sev-${t.priority.toLowerCase()}">${t.priority}</span></td>
                <td>${t.assignee}</td>
                <td>${t.created}</td>
                <td><span class="status-pill ${t.status==='Open'?'warn':t.status==='In Progress'?'info':'up'}">${t.status}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ── 5.14 INVENTORY ──────────────────────────────── */
    function renderInventory(container) {
        const d = window.DarpanData;
        container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Inventory Management</h2>
        <div class="page-actions">
          <select class="select-sm" id="inv-domain">
            <option>All Domains</option>
            ${(d ? d.domains : []).map(dm => `<option>${dm}</option>`).join('')}
          </select>
          <select class="select-sm" id="inv-type">
            <option>All Types</option>
            <option>Router</option><option>Switch</option><option>Server</option>
            <option>Firewall</option><option>AP</option>
          </select>
          <button class="btn btn-outline btn-sm" onclick="DarpanDashboard.exportInventory()">↑ Export</button>
        </div>
      </div>
      <div class="grid-3 mb-16">
        <div class="card">
          <canvas id="ch-inv-type" style="width:100%;height:200px"></canvas>
        </div>
        <div class="card">
          <canvas id="ch-inv-status" style="width:100%;height:200px"></canvas>
        </div>
        <div class="card">
          <canvas id="ch-inv-domain" style="width:100%;height:200px"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Asset Register</span></div>
        <div id="inv-table"></div>
      </div>`;

        if (d) {
            DarpanCharts.renderDonutChart('ch-inv-type', d.inventory.typeSegments,
                { title:'Device Types', donut:true });
            DarpanCharts.renderDonutChart('ch-inv-status', d.inventory.statusSegments,
                { title:'Device Status', donut:true });
            DarpanCharts.renderBarChart('ch-inv-domain', d.inventory.domainBar,
                { title:'Devices per Domain' });

            const tbl = document.getElementById('inv-table');
            if (tbl && d.inventory.assets) tbl.innerHTML = `
        <table class="data-table">
          <thead><tr>
            <th>Name</th><th>IP</th><th>Type</th><th>Vendor</th>
            <th>Model</th><th>Location</th><th>Domain</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${d.inventory.assets.map(a => `
              <tr>
                <td>${a.name}</td>
                <td class="mono">${a.ip}</td>
                <td><span class="tag">${a.type}</span></td>
                <td>${a.vendor}</td><td>${a.model}</td>
                <td>${a.location}</td><td>${a.domain}</td>
                <td><span class="status-pill ${a.status==='up'?'up':'down'}">${a.status.toUpperCase()}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
        }
    }

    /* ════════════════════════════════════════════════════
       6. ACTION HANDLERS (called from inline HTML)
    ════════════════════════════════════════════════════ */
    function toggleCHOP(id, val) {
        _notify(`selfCHOP: ${id} ${val ? 'enabled' : 'disabled'}`, val ? 'success' : 'warn');
    }

    function acknowledgeAll() {
        document.querySelectorAll('.status-pill.open').forEach(el => {
            el.classList.replace('open','acked'); el.textContent = 'Acked';
        });
        _notify('All faults acknowledged', 'success');
    }

    function clearFaults() {
        const wrap = document.getElementById('fault-table-wrap');
        if (wrap) wrap.innerHTML = '<p class="text-muted p12">All faults cleared.</p>';
        _notify('Fault list cleared', 'info');
    }

    function ackFault(id) {
        const row = document.getElementById(`frow-${id}`);
        if (row) {
            const pill = row.querySelector('.status-pill');
            if (pill) { pill.className = 'status-pill acked'; pill.textContent = 'Acked'; }
        }
    }

    function closeFault(id) {
        const row = document.getElementById(`frow-${id}`);
        if (row) row.remove();
    }

    function filterFaults(q) {
        const tbl = document.getElementById('fault-table');
        if (!tbl) return;
        tbl.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
        });
    }

    function filterLogs(q) {
        const stream = document.getElementById('log-stream');
        if (!stream) return;
        stream.querySelectorAll('.log-line').forEach(line => {
            line.style.display = line.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
        });
    }

    function backupAll()     { _notify('Configuration backup initiated for all devices', 'info');    }
    function compareConfig() { _notify('Launching config diff viewer…', 'info'); }
    function rediscoverTopology() { _notify('Topology rediscovery started…', 'info'); setTimeout(() => navigateTo('topology'), 1500); }
    function generateReport(id, fmt) { _notify(`Generating ${id.toUpperCase()} report in ${fmt.toUpperCase()} format…`, 'info'); }
    function newTicket()     { _notify('New ticket form opened', 'info'); }
    function exportInventory() { _notify('Inventory export queued', 'success'); }

    /* ════════════════════════════════════════════════════
       7. NOTIFICATION SYSTEM
    ════════════════════════════════════════════════════ */
    function _notify(msg, type = 'info') {
        state.notifications.unshift({ msg, type, ts: new Date().toLocaleTimeString() });
        const cnt = document.getElementById('notif-count');
        if (cnt) cnt.textContent = state.notifications.length;
        _renderNotifList();
    }

    function _renderNotifList() {
        const list = document.getElementById('notif-list');
        if (!list) return;
        list.innerHTML = state.notifications.slice(0,20).map(n => `
      <div class="notif-item notif-${n.type}">
        <span class="notif-dot notif-${n.type}"></span>
        <div class="notif-body">
          <span class="notif-msg">${n.msg}</span>
          <span class="notif-ts">${n.ts}</span>
        </div>
      </div>`).join('') || '<p class="text-muted" style="padding:12px">No notifications</p>';
    }

    function _toggleNotifPanel() {
        const panel = document.getElementById('notif-panel');
        if (panel) panel.classList.toggle('hidden');
        _renderNotifList();
    }

    function _clearNotifications() {
        state.notifications = [];
        const cnt = document.getElementById('notif-count');
        if (cnt) cnt.textContent = '0';
        _renderNotifList();
    }

    function _startNotificationPoller() {
        const msgs = [
            { msg:'New device discovered: 192.168.1.54', type:'info' },
            { msg:'High CPU on Core-Router-01 (89%)',    type:'warn' },
            { msg:'SLA breach: WAN latency > 50ms',      type:'danger' },
            { msg:'Configuration backup completed',       type:'success' },
            { msg:'Threat blocked: Port scan from external IP', type:'danger' },
            { msg:'Self-Healing: Rerouted traffic on Fa0/1',    type:'success' },
        ];
        let i = 0;
        setInterval(() => {
            _notify(msgs[i % msgs.length].msg, msgs[i % msgs.length].type);
            i++;
        }, 15000);
    }

    function _startAlertSimulator() {
        // Simulate badge counts on fault and security nav items
        setInterval(() => {
            const b = document.getElementById('badge-fault');
            if (b) {
                const n = Math.floor(Math.random() * 5);
                b.textContent = n;
                b.style.display = n > 0 ? 'inline-flex' : 'none';
            }
        }, 10000);
    }

    /* ════════════════════════════════════════════════════
       8. CLOCK
    ════════════════════════════════════════════════════ */
    function _startClock() {
        const el = document.getElementById('live-time');
        if (!el) return;
        function tick() {
            el.textContent = new Date().toLocaleString('en-IN', {
                hour:'2-digit', minute:'2-digit', second:'2-digit',
                day:'2-digit', month:'short', year:'numeric',
            });
        }
        tick();
        setInterval(tick, 1000);
    }

    /* ════════════════════════════════════════════════════
       9. UI HELPERS
    ════════════════════════════════════════════════════ */
    function _toggleSidebar() {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.toggle('collapsed');
    }

    function _toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
    }

    function _el(tag, cls) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        return e;
    }

    /* Fallback KPIs if data.js not loaded */
    const DarpanData_FALLBACK = {
        kpis: [
            { id:'devices', label:'Total Devices',   value:142, icon:'◉', color:'#1e90ff', suffix:'', spark:[80,90,85,95,88,92,100,95,98,142] },
            { id:'alarms',  label:'Active Alarms',    value:7,   icon:'◈', color:'#ea5455', suffix:'', spark:[2,5,3,8,4,6,3,7,5,7] },
            { id:'sla',     label:'SLA Compliance',   value:98,  icon:'◑', color:'#28c76f', suffix:'%', spark:[95,96,97,96,98,99,98,97,98,98] },
            { id:'uptime',  label:'Network Uptime',   value:99,  icon:'⊕', color:'#ff9f43', suffix:'%', spark:[99,99,100,99,98,99,100,99,99,99] },
        ],
    };

    /* ════════════════════════════════════════════════════
       PUBLIC API
    ════════════════════════════════════════════════════ */
    return {
        init,
        navigateTo,
        toggleCHOP,
        acknowledgeAll,
        clearFaults,
        ackFault,
        closeFault,
        filterFaults,
        filterLogs,
        backupAll,
        compareConfig,
        rediscoverTopology,
        generateReport,
        newTicket,
        exportInventory,
        notify: _notify,
    };

})();

window.DarpanDashboard = DarpanDashboard;

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DarpanDashboard.init);
} else {
    DarpanDashboard.init();
}