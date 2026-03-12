// ============================================================
// alerts.js — Alert System, Notifications & Badge Counter
// ============================================================

const Alerts = (() => {

    let alertsData    = [];
    let notifCount    = 0;
    let notifBadgeEl  = null;

    function init() {
        notifBadgeEl = document.getElementById('notif-count');
        loadAlerts();
        // Auto-refresh every 30 seconds
        setInterval(loadAlerts, 30000);
    }

    async function loadAlerts() {
        try {
            alertsData = await API.alerts();
            updateBadge(alertsData.length);
            renderSidebarAlerts();
            renderFullAlerts();
        } catch (err) {
            console.warn('Alerts load failed:', err);
        }
    }

    function updateBadge(count) {
        notifCount = count;
        // Update sidebar nav badge
        const navAlerts = document.querySelector('.nav-item[data-panel="alerts"]');
        if (navAlerts) {
            let badge = navAlerts.querySelector('.nav-badge');
            if (!badge && count > 0) {
                badge = document.createElement('span');
                badge.className = 'nav-badge';
                navAlerts.appendChild(badge);
            }
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
                badge.style.cssText = `
                    background: #ff3366;
                    color: white;
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 10px;
                    margin-left: auto;
                    display: ${count > 0 ? 'inline-block' : 'none'};
                `;
            }
        }
    }

    function renderSidebarAlerts() {
        // Overview widget — recent alerts (max 5)
        const listEl = document.getElementById('alerts-list');
        if (!listEl) return;

        if (alertsData.length === 0) {
            listEl.innerHTML = `
                <div class="alert-item">
                    <div class="alert-dot INFO"></div>
                    <span class="alert-msg">✅ No active alerts — System is secure</span>
                </div>`;
            return;
        }

        listEl.innerHTML = alertsData.slice(0, 6).map(a => `
            <div class="alert-item" data-id="${a.id}">
                <div class="alert-dot ${a.severity || 'INFO'}"></div>
                <div style="flex:1">
                    <span class="alert-msg">${escHtml(a.message)}</span>
                    <span style="display:block;font-size:0.68rem;color:#4a5568;margin-top:2px">${escHtml(a.alert_type)}</span>
                </div>
                <span class="alert-time">${formatTime(a.created_at)}</span>
            </div>`).join('');
    }

    function renderFullAlerts() {
        // Full alerts panel
        const fullEl = document.getElementById('full-alerts-list');
        if (!fullEl) return;

        if (alertsData.length === 0) {
            fullEl.innerHTML = `
                <div style="padding:40px;text-align:center;color:#4a5568">
                    <div style="font-size:3rem;margin-bottom:12px">✅</div>
                    <p>No active alerts. System is secure.</p>
                </div>`;
            return;
        }

        const grouped = groupBySeverity(alertsData);
        let html = '';

        ['CRITICAL', 'WARNING', 'INFO'].forEach(sev => {
            const items = grouped[sev];
            if (!items || items.length === 0) return;

            html += `<div class="alert-group">
                <div class="alert-group-header severity-${sev.toLowerCase()}">
                    ${getSeverityIcon(sev)} ${sev} — ${items.length} alert(s)
                </div>`;

            html += items.map(a => `
                <div class="alert-item alert-full" data-id="${a.id}">
                    <div class="alert-dot ${a.severity}"></div>
                    <div style="flex:1">
                        <div class="alert-title">${escHtml(a.alert_type)}</div>
                        <div class="alert-msg">${escHtml(a.message)}</div>
                        <div class="alert-meta">${formatDateTime(a.created_at)}</div>
                    </div>
                    <button class="btn-sm ack-btn" data-id="${a.id}">Acknowledge</button>
                </div>`).join('');

            html += `</div>`;
        });

        fullEl.innerHTML = html;

        // Wire acknowledge buttons (logs to DB via log endpoint)
        fullEl.querySelectorAll('.ack-btn').forEach(btn => {
            btn.addEventListener('click', () => acknowledgeAlert(btn));
        });
    }

    async function acknowledgeAlert(btn) {
        const id  = btn.getAttribute('data-id');
        const row = btn.closest('.alert-item');
        btn.disabled = true;
        btn.textContent = '✓ Done';

        try {
            await API.post('/api/logs/add', {
                type: 'ALERT_ACK',
                message: `Alert #${id} acknowledged by user`,
                severity: 'INFO'
            });
            if (row) {
                row.style.opacity = '0.4';
                row.style.transition = 'opacity 0.4s';
            }
            // Remove from local list
            alertsData = alertsData.filter(a => String(a.id) !== String(id));
            updateBadge(alertsData.length);
            renderSidebarAlerts();
        } catch {
            btn.disabled = false;
            btn.textContent = 'Acknowledge';
        }
    }

    // Create an alert programmatically (called from main.js on threshold breach)
    async function triggerAlert(type, message, severity = 'WARNING') {
        try {
            await API.post('/api/logs/alerts', { alert_type: type, message, severity });
        } catch {}
        // Also show a toast notification
        showToast(message, severity);
    }

    function showToast(message, severity = 'INFO') {
        const existing = document.getElementById('toast-container');
        let container  = existing;
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed; bottom: 24px; right: 24px;
                z-index: 9999; display: flex; flex-direction: column; gap: 8px;
                max-width: 320px;`;
            document.body.appendChild(container);
        }

        const colors = {
            CRITICAL: '#ff3366',
            WARNING:  '#ffcc00',
            INFO:     '#00b4ff',
            SUCCESS:  '#00ff88'
        };
        const color = colors[severity] || colors.INFO;

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: #0f1623;
            border: 1px solid ${color};
            border-left: 4px solid ${color};
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 0.78rem;
            color: #e0e6f0;
            font-family: 'Courier New', monospace;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            animation: slideIn 0.3s ease;
            cursor: pointer;`;
        toast.innerHTML = `
            <div style="color:${color};font-weight:bold;margin-bottom:4px">
                ${getSeverityIcon(severity)} ${severity}
            </div>
            ${escHtml(message)}`;

        toast.addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    // ── Helpers ──────────────────────────────────────────────

    function groupBySeverity(alerts) {
        return alerts.reduce((acc, a) => {
            const sev = a.severity || 'INFO';
            if (!acc[sev]) acc[sev] = [];
            acc[sev].push(a);
            return acc;
        }, {});
    }

    function getSeverityIcon(sev) {
        const icons = { CRITICAL: '🔴', WARNING: '🟡', INFO: '🔵', SUCCESS: '🟢', ERROR: '🔴' };
        return icons[sev] || '⚪';
    }

    function formatTime(ts) {
        if (!ts) return '';
        try {
            const d = new Date(ts);
            return d.toLocaleTimeString();
        } catch { return ts; }
    }

    function formatDateTime(ts) {
        if (!ts) return '';
        try {
            return new Date(ts).toLocaleString();
        } catch { return ts; }
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { init, showToast, triggerAlert, loadAlerts };
})();