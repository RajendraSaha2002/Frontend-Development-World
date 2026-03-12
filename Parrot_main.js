// ============================================================
// main.js — Master Controller (FINAL FIXED VERSION)
// Parrot Security OS Dashboard — Pro Edition
// Load Order: api.js → charts.js → terminal.js →
//             network.js → alerts.js → main.js (LAST)
// ============================================================

'use strict';

// ════════════════════════════════════════════════════════════
// SECTION 1 — APP CONFIGURATION
// ════════════════════════════════════════════════════════════

const APP_CONFIG = Object.freeze({
    overviewRefreshMs:      5000,
    alertRefreshMs:         30000,
    maxSparkPoints:         20,
    cpuCriticalThreshold:   90,
    cpuWarningThreshold:    70,
    ramCriticalThreshold:   90,
    ramWarningThreshold:    80,
    diskCriticalThreshold:  95,
    diskWarningThreshold:   85,
});

// ════════════════════════════════════════════════════════════
// SECTION 2 — GLOBAL STATE
// ════════════════════════════════════════════════════════════

const State = {
    currentPanel:     'overview',
    isLoggedIn:       false,
    currentUser:      null,
    sparkBuffer: {
        cpu:  [],
        ram:  [],
        disk: [],
    },
    scanState: {
        isScanning:      false,
        lastTarget:      '',
        lastResults:     [],
        lastHostResults: [],
        lastCidr:        '',
    },
    logFilter: {
        severity:    '',
        limit:       100,
        autoRefresh: false,
    },
    lastSystemData:   null,
    lastAlerts:       [],
    refreshIntervals: [],
};

// ════════════════════════════════════════════════════════════
// SECTION 3 — UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════

const Utils = {

    // ── HTML Escape ──────────────────────────────────────────
    escHtml(str) {
        return String(str ?? '')
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#39;');
    },

    // ── Session Storage ──────────────────────────────────────
    setSession(key, value) {
        try { sessionStorage.setItem(key, value); } catch {}
    },

    getSession(key) {
        try { return sessionStorage.getItem(key) ?? ''; } catch { return ''; }
    },

    clearSession() {
        try { sessionStorage.clear(); } catch {}
    },

    // ── Date Formatters ─────���────────────────────────────────
    formatTime(ts) {
        if (!ts) return '';
        try { return new Date(ts).toLocaleTimeString(); }
        catch { return String(ts); }
    },

    formatDateTime(ts) {
        if (!ts) return '';
        try { return new Date(ts).toLocaleString(); }
        catch { return String(ts); }
    },

    formatNow() {
        return new Date().toLocaleString('en-GB', {
            weekday: 'short',
            year:    'numeric',
            month:   'short',
            day:     '2-digit',
            hour:    '2-digit',
            minute:  '2-digit',
            second:  '2-digit',
        });
    },

    // ── Validators ───────────────────────────────────────────
    isValidIP(ip) {
        const parts = String(ip).split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => {
            const n = parseInt(p, 10);
            return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
        });
    },

    isValidCIDR(cidr) {
        const parts = String(cidr).split('/');
        if (parts.length !== 2) return false;
        const prefix = parseInt(parts[1], 10);
        return this.isValidIP(parts[0]) && prefix >= 0 && prefix <= 32;
    },

    // ── DOM Helpers ──────────────────────────────────────────
    getEl(id) {
        return document.getElementById(id);
    },

    setText(id, value) {
        const el = this.getEl(id);
        if (el) el.textContent = String(value ?? '');
    },

    setHTML(id, html) {
        const el = this.getEl(id);
        if (el) el.innerHTML = html;
    },

    show(id) {
        const el = this.getEl(id);
        if (el) el.classList.remove('hidden');
    },

    hide(id) {
        const el = this.getEl(id);
        if (el) el.classList.add('hidden');
    },

    addClass(id, cls) {
        const el = this.getEl(id);
        if (el) el.classList.add(cls);
    },

    removeClass(id, cls) {
        const el = this.getEl(id);
        if (el) el.classList.remove(cls);
    },

    // ── Clamp ────────────────────────────────────────────────
    clamp(val, min, max) {
        return Math.min(Math.max(Number(val) || 0, min), max);
    },

    // ── Sparkline Buffer ─────────────────────────────────────
    pushToBuffer(buffer, value, maxLen = APP_CONFIG.maxSparkPoints) {
        const next = [...buffer, Number(value) || 0];
        return next.length > maxLen
            ? next.slice(next.length - maxLen)
            : next;
    },

    // ── Color by Percent ─────────────────────────────────────
    colorForPercent(percent) {
        const p = Number(percent) || 0;
        if (p >= 90) return '#ff3366';
        if (p >= 75) return '#ffcc00';
        if (p >= 50) return '#00b4ff';
        return '#00ff88';
    },

    // ── Severity Icon ────────────────────────────────────────
    severityIcon(sev) {
        const icons = {
            CRITICAL: '🔴',
            WARNING:  '🟡',
            ERROR:    '🔴',
            INFO:     '🔵',
            SUCCESS:  '🟢',
        };
        return icons[String(sev)] ?? '⚪';
    },

    // ── Port Risk Info (FIXED — matches main.ts fix) ─────────
    portRiskInfo(port) {
        // Fix: use plain arrays + explicit Number cast
        const highRisk = [21, 22, 23, 445, 139, 3389];
        const medRisk  = [80, 443, 8080, 8443, 3306, 5432, 6379, 27017];

        // Fix: use Map instead of plain object for notes
        const notes = new Map([
            [21,    'FTP — File Transfer (unencrypted)'],
            [22,    'SSH — Secure Shell'],
            [23,    'Telnet — Unencrypted Remote!'],
            [25,    'SMTP — Mail Transfer'],
            [53,    'DNS — Domain Name System'],
            [80,    'HTTP — Web Server'],
            [110,   'POP3 — Mail'],
            [143,   'IMAP — Mail'],
            [443,   'HTTPS — Secure Web'],
            [445,   'SMB — File Sharing (WannaCry risk)'],
            [3306,  'MySQL — Database'],
            [3389,  'RDP — Remote Desktop'],
            [5432,  'PostgreSQL — Database'],
            [6379,  'Redis — Cache (auth risk)'],
            [8080,  'HTTP Alt — Web Server'],
            [8443,  'HTTPS Alt'],
            [27017, 'MongoDB — Database'],
        ]);

        const p       = Number(port);
        const getNote = (n) => notes.get(n) ?? '';

        if (highRisk.includes(p)) {
            return { level: 'HIGH',   color: '#ff3366', note: getNote(p) };
        }
        if (medRisk.includes(p)) {
            return { level: 'MEDIUM', color: '#ffcc00', note: getNote(p) };
        }
        return         { level: 'LOW',    color: '#00ff88', note: getNote(p) };
    },

    // ── Group Alerts by Severity ─────────────────────────────
    groupAlertsBySeverity(alerts) {
        const order = ['CRITICAL', 'WARNING', 'INFO'];
        return order
            .map(sev => ({
                severity: sev,
                items: (alerts || []).filter(a => a.severity === sev),
            }))
            .filter(g => g.items.length > 0);
    },

    // ── Build System Detail Items ────────────────────────────
    buildSystemDetails(sys) {
        if (!sys) return [];
        return [
            { key: 'OS',        value: sys.os         ?? 'N/A' },
            { key: 'Hostname',  value: sys.hostname    ?? 'N/A' },
            { key: 'Kernel',    value: sys.kernel      ?? 'N/A' },
            { key: 'Arch',      value: sys.arch        ?? 'N/A' },
            { key: 'CPU %',     value: `${sys.cpu_percent ?? 0}%` },
            { key: 'RAM Used',  value: `${sys.ram?.used_mb ?? 0} MB / ${sys.ram?.total_mb ?? 0} MB` },
            { key: 'RAM %',     value: `${sys.ram?.percent ?? 0}%` },
            { key: 'Disk Used', value: `${sys.disk?.used_gb ?? 0} GB / ${sys.disk?.total_gb ?? 0} GB` },
            { key: 'Disk %',    value: `${sys.disk?.percent ?? 0}%` },
        ];
    },

    // ── Build Process Table Rows ─────────────────────────────
    buildProcessRows(processes) {
        return (processes || []).map(p => ({
            user:      p.user    ?? '',
            pid:       p.pid     ?? '',
            cpu:       p.cpu     ?? '0',
            mem:       p.mem     ?? '0',
            command:   p.command ?? '',
            isHighCpu: parseFloat(p.cpu || '0') > 20,
        }));
    },

    // ── Inject Style Tag ─────────────────────────────────────
    injectStyle(id, css) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('style');
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = css;
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 4 — RENDER FUNCTIONS
// ════════════════════════════════════════════════════════════

const Render = {

    // ── Stat Card ────────────────────────────────────────────
    statCard(valueId, cardId, value, unit, warnT, critT) {
        Utils.setText(valueId, `${value}${unit}`);
        const card = Utils.getEl(cardId);
        if (!card) return;
        card.classList.remove('critical', 'warning');
        const v = Number(value) || 0;
        if (v >= critT) card.classList.add('critical');
        else if (v >= warnT) card.classList.add('warning');
    },

    // ── Process Table ────────────────────────────────────────
    processTable(rows) {
        const tbody = document.querySelector('#process-table tbody');
        if (!tbody) return;
        if (!rows || rows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;
                        color:#4a5568;padding:16px">
                        No process data available
                    </td>
                </tr>`;
            return;
        }
        tbody.innerHTML = rows.map(r => `
            <tr>
                <td>${Utils.escHtml(r.user)}</td>
                <td>${Utils.escHtml(r.pid)}</td>
                <td style="color:${r.isHighCpu ? '#ff3366' : '#00ff88'}">
                    ${Utils.escHtml(r.cpu)}%
                </td>
                <td>${Utils.escHtml(r.mem)}%</td>
                <td style="max-width:200px;overflow:hidden;
                           text-overflow:ellipsis;white-space:nowrap"
                    title="${Utils.escHtml(r.command)}">
                    ${Utils.escHtml(r.command)}
                </td>
            </tr>`).join('');
    },

    // ── Alerts Sidebar Widget ────────────────────────────────
    alertsSidebar(alerts) {
        const el = Utils.getEl('alerts-list');
        if (!el) return;
        if (!alerts || alerts.length === 0) {
            el.innerHTML = `
                <div class="alert-item">
                    <div class="alert-dot INFO"></div>
                    <span class="alert-msg">
                        ✅ No active alerts — System is secure
                    </span>
                </div>`;
            return;
        }
        el.innerHTML = alerts.slice(0, 6).map(a => `
            <div class="alert-item" data-id="${Utils.escHtml(String(a.id))}">
                <div class="alert-dot ${Utils.escHtml(a.severity ?? 'INFO')}">
                </div>
                <div style="flex:1">
                    <span class="alert-msg">
                        ${Utils.escHtml(a.message ?? '')}
                    </span>
                    <span style="display:block;font-size:0.68rem;
                                 color:#4a5568;margin-top:2px">
                        ${Utils.escHtml(a.alert_type ?? '')}
                    </span>
                </div>
                <span class="alert-time">
                    ${Utils.escHtml(Utils.formatTime(a.created_at))}
                </span>
            </div>`).join('');
    },

    // ── Alerts Full Panel ────────────────────────────────────
    alertsFull(groups) {
        const el = Utils.getEl('full-alerts-list');
        if (!el) return;
        if (!groups || groups.length === 0) {
            el.innerHTML = `
                <div style="padding:40px;text-align:center;color:#4a5568">
                    <div style="font-size:3rem;margin-bottom:12px">✅</div>
                    <p>No active alerts. System is secure.</p>
                </div>`;
            return;
        }
        el.innerHTML = groups.map(g => `
            <div class="alert-group">
                <div class="alert-group-header
                     severity-${Utils.escHtml(g.severity.toLowerCase())}">
                    ${Utils.severityIcon(g.severity)}
                    ${Utils.escHtml(g.severity)} — ${g.items.length} alert(s)
                </div>
                ${g.items.map(a => `
                    <div class="alert-item alert-full"
                         data-id="${Utils.escHtml(String(a.id))}">
                        <div class="alert-dot
                             ${Utils.escHtml(a.severity ?? 'INFO')}">
                        </div>
                        <div style="flex:1">
                            <div class="alert-title">
                                ${Utils.escHtml(a.alert_type ?? '')}
                            </div>
                            <div class="alert-msg">
                                ${Utils.escHtml(a.message ?? '')}
                            </div>
                            <div class="alert-meta">
                                ${Utils.escHtml(
            Utils.formatDateTime(a.created_at)
        )}
                            </div>
                        </div>
                        <button class="btn-sm ack-btn"
                                data-id="${Utils.escHtml(String(a.id))}">
                            Acknowledge
                        </button>
                    </div>`).join('')}
            </div>`).join('');

        // Wire acknowledge buttons
        el.querySelectorAll('.ack-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                AckHandler.acknowledge(btn);
            });
        });
    },

    // ── Security Logs ────────────────────────────────────────
    securityLogs(logs) {
        const el = Utils.getEl('logs-container');
        if (!el) return;
        if (!logs || logs.length === 0) {
            el.innerHTML = `
                <p style="padding:12px;color:#4a5568">
                    No logs found.
                </p>`;
            return;
        }
        el.innerHTML = logs.map(l => `
            <span class="log-line ${Utils.escHtml(l.severity ?? 'INFO')}">
                [${Utils.escHtml(l.severity ?? 'INFO')}]
                [${Utils.escHtml(l.log_type ?? '')}]
                ${Utils.escHtml(l.message ?? '')}
                — IP: ${Utils.escHtml(l.source_ip ?? '')}
                <span style="float:right;color:#4a5568">
                    ${Utils.escHtml(Utils.formatTime(l.timestamp))}
                </span>
            </span>`).join('');
    },

    // ── System File Logs ─────────────────────────────────────
    systemLogs(logs) {
        const el = Utils.getEl('sys-logs-container');
        if (!el) return;
        if (!logs || logs.length === 0) {
            el.innerHTML = `
                <p style="padding:12px;color:#4a5568">
                    No system logs accessible.
                </p>`;
            return;
        }
        el.innerHTML = logs.map(l => `
            <span class="log-line">
                <span style="color:#4a5568;margin-right:8px">
                    ${Utils.escHtml(l.file ?? '')}
                </span>
                ${Utils.escHtml(l.line ?? '')}
            </span>`).join('');
    },

    // ── System Detail Grid ───────────────────────────────────
    systemDetails(items) {
        const el = Utils.getEl('system-details');
        if (!el) return;
        if (!items || items.length === 0) return;
        el.innerHTML = items.map(i => `
            <div class="detail-item">
                <div class="detail-key">
                    ${Utils.escHtml(i.key)}
                </div>
                <div class="detail-val">
                    ${Utils.escHtml(i.value)}
                </div>
            </div>`).join('');
    },

    // ── Port Scan Results ────────────────────────────────────
    portScanResults(target, ports) {
        const el = Utils.getEl('scan-results');
        if (!el) return;
        if (!ports || ports.length === 0) {
            el.innerHTML = `
                <div class="scan-empty">
                    <p>🔍 No open ports on
                        <strong>${Utils.escHtml(target)}</strong>
                        (range 1–1024)
                    </p>
                    <p class="scan-note">
                        Host offline or all ports filtered.
                    </p>
                </div>`;
            return;
        }
        const rows = ports.map(p => {
            const risk = Utils.portRiskInfo(p.port);
            return `
                <div class="port-result">
                    <span class="port-num">
                        ${Utils.escHtml(String(p.port))}
                    </span>
                    <span class="badge"
                          style="color:${risk.color};
                                 border-color:${risk.color}">
                        ${Utils.escHtml(risk.level)}
                    </span>
                    <span class="port-svc">
                        ${Utils.escHtml(p.service ?? '')}
                    </span>
                    <span class="port-note">
                        ${Utils.escHtml(risk.note)}
                    </span>
                </div>`;
        }).join('');

        el.innerHTML = `
            <div class="scan-header">
                <span>🎯 Target:
                    <strong>${Utils.escHtml(target)}</strong>
                </span>
                <span class="scan-count">
                    ${ports.length} open port(s)
                </span>
            </div>
            ${rows}
            <canvas id="port-visual" width="680" height="60"
                style="display:block;margin:12px 16px;">
            </canvas>`;

        // Draw port bar chart if Charts available
        if (typeof Charts !== 'undefined' && Charts.portBar) {
            Charts.portBar('port-visual', ports);
        }
    },

    // ── Range Scan Host Results ──────────────────────────────
    rangeScanResults(cidr, hosts) {
        const el = Utils.getEl('range-results');
        if (!el) return;
        if (!hosts || hosts.length === 0) {
            el.innerHTML = `
                <div class="scan-empty">
                    <p>📡 No live hosts in
                        <strong>${Utils.escHtml(cidr)}</strong>
                    </p>
                    <p class="scan-note">
                        Network offline or ICMP blocked.
                    </p>
                </div>`;
            return;
        }
        el.innerHTML = `
            <div class="scan-header">
                <span>🌐 Range:
                    <strong>${Utils.escHtml(cidr)}</strong>
                </span>
                <span class="scan-count">
                    ${hosts.length} host(s) up
                </span>
            </div>
            ${hosts.map((h, i) => `
                <div class="host-item"
                     style="animation-delay:${i * 0.04}s">
                    <div class="host-status pulse-green"></div>
                    <span class="host-ip">
                        ${Utils.escHtml(h.ip ?? '')}
                    </span>
                    <span class="host-status-label">● ONLINE</span>
                    <button class="btn-sm host-scan-btn"
                            data-ip="${Utils.escHtml(h.ip ?? '')}">
                        Scan Ports
                    </button>
                </div>`).join('')}
            <canvas id="network-map" width="680" height="120"
                style="display:block;margin:12px 16px;">
            </canvas>`;

        // Draw network map if Charts available
        if (typeof Charts !== 'undefined' && Charts.networkMap) {
            Charts.networkMap(
                'network-map',
                hosts.map(h => h.ip)
            );
        }

        // Wire quick-scan buttons
        el.querySelectorAll('.host-scan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ip = btn.getAttribute('data-ip') ?? '';
                const scanTarget = Utils.getEl('scan-target');
                if (scanTarget) scanTarget.value = ip;
                NetworkScan.runPortScan();
            });
        });
    },

    // ── Nav Badge ────────────────────────────────────────────
    navBadge(panel, count) {
        const navItem = document.querySelector(
            `.nav-item[data-panel="${panel}"]`
        );
        if (!navItem) return;
        let badge = navItem.querySelector('.nav-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-badge';
            navItem.appendChild(badge);
        }
        const n = Number(count) || 0;
        badge.textContent  = n > 99 ? '99+' : String(n);
        badge.style.cssText = `
            background:    #ff3366;
            color:         white;
            font-size:     0.65rem;
            padding:       2px 6px;
            border-radius: 10px;
            margin-left:   auto;
            display:       ${n > 0 ? 'inline-block' : 'none'};`;
    },

    // ── Toast Notification ───────────────────────────────────
    toast(message, severity = 'INFO', duration = 5000) {
        const colors = {
            CRITICAL: '#ff3366',
            WARNING:  '#ffcc00',
            ERROR:    '#ff3366',
            INFO:     '#00b4ff',
            SUCCESS:  '#00ff88',
        };
        const color = colors[String(severity)] ?? colors.INFO;

        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position:       fixed;
                bottom:         24px;
                right:          24px;
                z-index:        9999;
                display:        flex;
                flex-direction: column;
                gap:            8px;
                max-width:      320px;`;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background:    #0f1623;
            border:        1px solid ${color};
            border-left:   4px solid ${color};
            border-radius: 6px;
            padding:       12px 16px;
            font-size:     0.78rem;
            color:         #e0e6f0;
            font-family:   'Courier New', monospace;
            box-shadow:    0 4px 20px rgba(0,0,0,0.5);
            animation:     slideIn 0.3s ease;
            cursor:        pointer;`;
        toast.innerHTML = `
            <div style="color:${color};font-weight:bold;
                        margin-bottom:4px">
                ${Utils.severityIcon(severity)} ${Utils.escHtml(severity)}
            </div>
            ${Utils.escHtml(message)}`;

        toast.addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity    = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, duration);
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 5 — ACKNOWLEDGE HANDLER
// ════════════════════════════════════════════════════════════

const AckHandler = {
    async acknowledge(btn) {
        const id  = btn.getAttribute('data-id') ?? '';
        const row = btn.closest('.alert-item');

        btn.disabled    = true;
        btn.textContent = '✓ Done';

        try {
            await API.post('/api/logs/add', {
                type:     'ALERT_ACK',
                message:  `Alert #${id} acknowledged`,
                severity: 'INFO',
            });
            if (row) {
                row.style.opacity    = '0.4';
                row.style.transition = 'opacity 0.4s';
            }
            // Remove from state
            State.lastAlerts = State.lastAlerts.filter(
                a => String(a.id) !== String(id)
            );
            Render.navBadge('alerts', State.lastAlerts.length);
            Render.alertsSidebar(State.lastAlerts);

        } catch {
            btn.disabled    = false;
            btn.textContent = 'Acknowledge';
            Render.toast('Failed to acknowledge alert.', 'ERROR');
        }
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 6 — CLOCK
// ════════════════════════════════════════════════════════════

const Clock = {
    start() {
        const tick = () => Utils.setText('current-time', Utils.formatNow());
        tick();
        setInterval(tick, 1000);
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 7 — DASHBOARD DATA LOADERS
// ════════════════════════════════════════════════════════════

const DataLoader = {

    // ── Overview ─────────────────────────────────────────────
    async loadOverview() {
        try {
            const data = await API.dashboard();
            if (!data) return;

            const sys = data.system ?? {};

            State.lastSystemData = sys;
            State.lastAlerts     = data.alerts ?? [];

            // Stat cards
            Render.statCard(
                'cpu-val',  'cpu-card',
                sys.cpu_percent  ?? 0, '%',
                APP_CONFIG.cpuWarningThreshold,
                APP_CONFIG.cpuCriticalThreshold
            );
            Render.statCard(
                'ram-val',  'ram-card',
                sys.ram?.percent ?? 0, '%',
                APP_CONFIG.ramWarningThreshold,
                APP_CONFIG.ramCriticalThreshold
            );
            Render.statCard(
                'disk-val', 'disk-card',
                sys.disk?.percent ?? 0, '%',
                APP_CONFIG.diskWarningThreshold,
                APP_CONFIG.diskCriticalThreshold
            );
            Utils.setText('ip-val', data.local_ip ?? '--');

            // Threshold toasts
            if ((sys.cpu_percent ?? 0) >= APP_CONFIG.cpuCriticalThreshold) {
                Render.toast(
                    `CPU critical: ${sys.cpu_percent}%`, 'CRITICAL'
                );
            }
            if ((sys.ram?.percent ?? 0) >= APP_CONFIG.ramCriticalThreshold) {
                Render.toast(
                    `RAM critical: ${sys.ram.percent}%`, 'CRITICAL'
                );
            }
            if ((sys.disk?.percent ?? 0) >= APP_CONFIG.diskCriticalThreshold){
                Render.toast(
                    `Disk critical: ${sys.disk.percent}%`, 'CRITICAL'
                );
            }

            // Sparkline buffers
            State.sparkBuffer.cpu  = Utils.pushToBuffer(
                State.sparkBuffer.cpu,  sys.cpu_percent  ?? 0
            );
            State.sparkBuffer.ram  = Utils.pushToBuffer(
                State.sparkBuffer.ram,  sys.ram?.percent ?? 0
            );
            State.sparkBuffer.disk = Utils.pushToBuffer(
                State.sparkBuffer.disk, sys.disk?.percent ?? 0
            );

            // Draw sparklines
            if (typeof Charts !== 'undefined') {
                Charts.sparkline(
                    'cpu-chart',  State.sparkBuffer.cpu,  '#00ff88'
                );
                Charts.sparkline(
                    'ram-chart',  State.sparkBuffer.ram,  '#00b4ff'
                );
                Charts.sparkline(
                    'disk-chart', State.sparkBuffer.disk, '#ff3366'
                );
            }

            // Process table
            const rows = Utils.buildProcessRows(sys.processes ?? []);
            Render.processTable(rows);

            // Alerts sidebar + badge
            Render.alertsSidebar(data.alerts ?? []);
            Render.navBadge('alerts', (data.alerts ?? []).length);

        } catch (err) {
            console.warn('[DataLoader] loadOverview error:', err);
        }
    },

    // ── System History ───────────────────────────────────────
    async loadSystemHistory() {
        try {
            const rows = await API.systemHistory();
            if (!rows || !rows.length) return;

            const cpu  = rows.map(r => Number(r.cpu_percent)  || 0).reverse();
            const ram  = rows.map(r => Number(r.ram_percent)  || 0).reverse();
            const disk = rows.map(r => Number(r.disk_percent) || 0).reverse();

            if (typeof Charts !== 'undefined') {
                Charts.lineChart(
                    'history-chart',
                    [cpu, ram, disk],
                    ['CPU', 'RAM', 'Disk']
                );
            }
        } catch (err) {
            console.warn('[DataLoader] loadSystemHistory error:', err);
        }

        try {
            const sys   = await API.system();
            const items = Utils.buildSystemDetails(sys);
            Render.systemDetails(items);
        } catch (err) {
            console.warn('[DataLoader] loadSystem error:', err);
        }
    },

    // ── Logs ─────────────────────────────────────────────────
    async loadLogs() {
        try {
            const logs = await API.logs(State.logFilter.severity);
            Render.securityLogs(logs ?? []);
        } catch (err) {
            console.warn('[DataLoader] loadLogs error:', err);
        }
        try {
            const sysLogs = await API.sysLogs();
            Render.systemLogs(sysLogs ?? []);
        } catch (err) {
            console.warn('[DataLoader] loadSysLogs error:', err);
        }
    },

    // ── Alerts ───────────────────────────────────────────────
    async loadAlerts() {
        try {
            const alerts = await API.alerts();
            State.lastAlerts = alerts ?? [];
            const groups = Utils.groupAlertsBySeverity(State.lastAlerts);
            Render.alertsFull(groups);
            Render.navBadge('alerts', State.lastAlerts.length);
        } catch (err) {
            console.warn('[DataLoader] loadAlerts error:', err);
        }
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 8 — NETWORK SCAN CONTROLLER
// ════════════════════════════════════════════════════════════

const NetworkScan = {

    init() {
        const scanBtn    = Utils.getEl('scan-btn');
        const rangeBtn   = Utils.getEl('range-btn');
        const scanTarget = Utils.getEl('scan-target');
        const rangeInput = Utils.getEl('range-input');

        if (scanBtn)  scanBtn.addEventListener('click',  () => this.runPortScan());
        if (rangeBtn) rangeBtn.addEventListener('click', () => this.runRangeScan());

        if (scanTarget) {
            scanTarget.addEventListener('keydown', e => {
                if (e.key === 'Enter') this.runPortScan();
            });
        }
        if (rangeInput) {
            rangeInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') this.runRangeScan();
            });
        }

        // Set placeholder to local IP
        API.localIp()
            .then(data => {
                const el = Utils.getEl('scan-target');
                if (el) el.placeholder = `Target IP (e.g. ${data.ip ?? '192.168.1.1'})`;
            })
            .catch(() => {});
    },

    async runPortScan() {
        const targetEl = Utils.getEl('scan-target');
        const scanBtn  = Utils.getEl('scan-btn');
        const target   = (targetEl?.value ?? '').trim();

        if (!target) {
            this._showError('scan-results', 'Please enter a target IP.');
            return;
        }
        if (!Utils.isValidIP(target)) {
            this._showError('scan-results', 'Invalid IP address format.');
            return;
        }

        State.scanState.isScanning  = true;
        State.scanState.lastTarget  = target;

        this._showLoading('scan-results', `Scanning ${target} — ports 1–1024...`);
        if (scanBtn) { scanBtn.disabled = true; scanBtn.textContent = '⏳ Scanning...'; }

        try {
            const data  = await API.portScan(target);
            const ports = data.open_ports ?? [];
            State.scanState.lastResults = ports;
            Render.portScanResults(target, ports);
        } catch (err) {
            this._showError('scan-results', 'Scan failed. Check target and try again.');
            console.warn('[NetworkScan] portScan error:', err);
        } finally {
            State.scanState.isScanning = false;
            if (scanBtn) { scanBtn.disabled = false; scanBtn.textContent = 'Scan Ports'; }
        }
    },

    async runRangeScan() {
        const rangeEl  = Utils.getEl('range-input');
        const rangeBtn = Utils.getEl('range-btn');
        const cidr     = (rangeEl?.value ?? '').trim();

        if (!cidr) {
            this._showError('range-results', 'Please enter a CIDR range.');
            return;
        }
        if (!Utils.isValidCIDR(cidr)) {
            this._showError('range-results', 'Invalid CIDR. Use format: x.x.x.x/xx');
            return;
        }

        State.scanState.lastCidr = cidr;
        this._showLoading('range-results', `Discovering hosts in ${cidr}...`);
        if (rangeBtn) { rangeBtn.disabled = true; rangeBtn.textContent = '⏳ Discovering...'; }

        try {
            const data  = await API.rangeScan(cidr);
            const hosts = data.hosts ?? [];
            State.scanState.lastHostResults = hosts;
            Render.rangeScanResults(cidr, hosts);
        } catch (err) {
            this._showError('range-results', 'Discovery failed. Check range and try again.');
            console.warn('[NetworkScan] rangeScan error:', err);
        } finally {
            if (rangeBtn) { rangeBtn.disabled = false; rangeBtn.textContent = 'Discover Hosts'; }
        }
    },

    _showLoading(elId, msg) {
        Utils.setHTML(elId, `
            <div class="scan-loading scanning-overlay">
                <span>⏳ ${Utils.escHtml(msg)}</span>
            </div>`);
    },

    _showError(elId, msg) {
        Utils.setHTML(elId, `
            <div class="scan-error">
                <span class="term-error">✖ ${Utils.escHtml(msg)}</span>
            </div>`);
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 9 — AUTH CONTROLLER
// ════════════════════════════════════════════════════════════

const Auth = {

    setup() {
        const loginBtn = Utils.getEl('login-btn');
        const userInp  = Utils.getEl('login-user');
        const passInp  = Utils.getEl('login-pass');

        if (!loginBtn || !userInp || !passInp) return;

        const attempt = () => this.tryLogin(userInp, passInp, loginBtn);

        loginBtn.addEventListener('click', attempt);
        passInp.addEventListener('keydown', e => {
            if (e.key === 'Enter') attempt();
        });
        userInp.addEventListener('keydown', e => {
            if (e.key === 'Enter') passInp.focus();
        });

        // Check existing session
        API.me()
            .then(res => {
                if (res && res.logged_in && res.user) {
                    this.onLoginSuccess(res.user);
                }
            })
            .catch(() => {});
    },

    async tryLogin(userInp, passInp, loginBtn) {
        const username = (userInp.value ?? '').trim();
        const password =  passInp.value ?? '';

        if (!username || !password) {
            Utils.setText('login-error', 'Please enter username and password.');
            return;
        }

        loginBtn.disabled    = true;
        loginBtn.textContent = '⏳ Authenticating...';
        Utils.setText('login-error', '');

        try {
            const res = await API.login(username, password);
            if (res && res.success && res.user) {
                this.onLoginSuccess(res.user);
            } else {
                Utils.setText(
                    'login-error',
                    res?.message ?? 'Access denied.'
                );
                passInp.value = '';
            }
        } catch {
            Utils.setText(
                'login-error',
                'Server unreachable. Is Flask running?'
            );
        } finally {
            loginBtn.disabled    = false;
            loginBtn.textContent = 'ACCESS SYSTEM';
        }
    },

    onLoginSuccess(user) {
        State.isLoggedIn  = true;
        State.currentUser = user;

        Utils.setSession('username',   user.username   ?? '');
        Utils.setSession('role',       user.role       ?? '');
        Utils.setSession('login_time', new Date().toLocaleString());

        Utils.hide('login-screen');
        Utils.show('main-dashboard');
        Utils.setText(
            'user-badge',
            `👤 ${user.username} [${user.role}]`
        );

        App.init();
    },

    setupLogout() {
        const btn = Utils.getEl('logout-btn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to log out?')) return;
            try { await API.logout(); } catch {}
            State.isLoggedIn  = false;
            State.currentUser = null;
            AutoRefresh.stop();
            Utils.clearSession();
            window.location.reload();
        });
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 10 — NAVIGATION CONTROLLER
// ════════════════════════════════════════════════════════════

const Nav = {

    setup() {
        const items = document.querySelectorAll('.nav-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const panel = item.getAttribute('data-panel');
                if (!panel) return;
                this.switchTo(panel, item, items);
            });
        });
    },

    switchTo(panel, activeItem, allItems) {
        // Update nav state
        allItems.forEach(n => n.classList.remove('active'));
        activeItem.classList.add('active');

        // Update panel visibility
        document.querySelectorAll('.panel').forEach(p => {
            p.classList.remove('active');
            p.classList.add('hidden');
        });
        const target = document.getElementById(`panel-${panel}`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Update header title
        Utils.setText(
            'panel-title',
            (activeItem.textContent ?? panel).trim()
        );
        State.currentPanel = panel;

        // Panel-specific init
        this.onActivate(panel);
    },

    onActivate(panel) {
        switch (panel) {
            case 'system':
                DataLoader.loadSystemHistory();
                break;
            case 'logs':
                DataLoader.loadLogs();
                break;
            case 'alerts':
                DataLoader.loadAlerts();
                break;
            case 'network':
                NetworkScan.init();
                break;
            case 'terminal':
                if (typeof Terminal !== 'undefined') {
                    Terminal.init();
                }
                setTimeout(() => {
                    Utils.getEl('terminal-input')?.focus();
                }, 100);
                break;
            default:
                break;
        }
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 11 — AUTO-REFRESH CONTROLLER
// ════════════════════════════════════════════════════════════

const AutoRefresh = {

    start() {
        DataLoader.loadOverview();
        const t1 = setInterval(
            () => DataLoader.loadOverview(),
            APP_CONFIG.overviewRefreshMs
        );
        const t2 = setInterval(
            () => DataLoader.loadAlerts(),
            APP_CONFIG.alertRefreshMs
        );
        State.refreshIntervals.push(t1, t2);
    },

    stop() {
        State.refreshIntervals.forEach(id => clearInterval(id));
        State.refreshIntervals = [];
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 12 — LOG CONTROLS
// ════════════════════════════════════════════════════════════

const LogControls = {
    setup() {
        const filterEl  = Utils.getEl('log-severity-filter');
        const refreshEl = Utils.getEl('refresh-logs-btn');

        if (filterEl) {
            filterEl.addEventListener('change', () => {
                State.logFilter.severity = filterEl.value ?? '';
                DataLoader.loadLogs();
            });
        }
        if (refreshEl) {
            refreshEl.addEventListener('click', () => {
                DataLoader.loadLogs();
            });
        }
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 13 — EXTRA STYLES INJECTOR
// ════════════════════════════════════════════════════════════

const Styles = {
    inject() {
        Utils.injectStyle('parrot-extra-styles', `
            .badge {
                display:       inline-block;
                padding:       2px 7px;
                border-radius: 10px;
                font-size:     0.65rem;
                font-weight:   bold;
                margin:        0 4px;
                border:        1px solid currentColor;
            }
            .port-note {
                color:       #4a5568;
                font-size:   0.72rem;
                margin-left: auto;
            }
            .scan-empty,
            .scan-error {
                padding:   24px 16px;
                color:     #7a8ba0;
                font-size: 0.82rem;
            }
            .scan-header {
                display:         flex;
                justify-content: space-between;
                padding:         10px 16px;
                background:      #0f1623;
                border-bottom:   1px solid #1e2d45;
                font-size:       0.8rem;
            }
            .scan-count   { color: #00ff88; }
            .scan-loading {
                padding:   24px 16px;
                color:     #00b4ff;
                font-size: 0.85rem;
            }
            .alert-group  { margin-bottom: 8px; }
            .alert-group-header {
                padding:        8px 16px;
                font-size:      0.75rem;
                font-weight:    bold;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .severity-critical {
                background:  #ff336611;
                color:       #ff3366;
                border-left: 3px solid #ff3366;
            }
            .severity-warning {
                background:  #ffcc0011;
                color:       #ffcc00;
                border-left: 3px solid #ffcc00;
            }
            .severity-info {
                background:  #00b4ff11;
                color:       #00b4ff;
                border-left: 3px solid #00b4ff;
            }
            .alert-full  { padding: 12px 16px; }
            .alert-title {
                font-weight:   bold;
                font-size:     0.8rem;
                margin-bottom: 2px;
            }
            .alert-meta {
                color:      #4a5568;
                font-size:  0.68rem;
                margin-top: 4px;
            }
            .host-scan-btn { margin-left: auto; }
            .ack-btn {
                background: #1a2540;
                color:      #7a8ba0;
                border:     1px solid #1e2d45;
            }
            .ack-btn:hover {
                background: #00ff88;
                color:      #0a0e1a;
            }
            .host-status-label {
                color:     #00ff88;
                font-size: 0.72rem;
            }
        `);
    },
};

// ════════════════════════════════════════════════════════════
// SECTION 14 — MAIN APP BOOTSTRAP
// ════════════════════════════════════════════════════════════

const App = {
    init() {
        Auth.setupLogout();
        Nav.setup();
        LogControls.setup();
        Clock.start();
        AutoRefresh.start();
        Styles.inject();
        NetworkScan.init();
        console.log('[App] 🦜 Parrot OS Dashboard initialized.');
    },
};

// ── DOM Ready Entry Point ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    Auth.setup();
});