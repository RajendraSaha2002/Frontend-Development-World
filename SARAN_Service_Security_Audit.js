/**
 * 06-security-audit.js
 * Cryptographic Audit Logging, Auto-Lockout Defense & Incident Simulator.
 */
const SaranSecurity = (function () {
    'use strict';

    let failedAttempts = 0;

    function renderAuditTable() {
        const tbody = document.getElementById('auditTableBody');
        if (!tbody) return;

        const logs = SaranStore.getAuditLogs();
        tbody.innerHTML = '';

        logs.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td><small>${l.timestamp}</small></td>
        <td><strong>${l.category}</strong></td>
        <td>${l.user}</td>
        <td><code>${l.ip}</code></td>
        <td><span class="badge ${l.severity === 'CRITICAL' ? 'red' : 'green'}">${l.severity}</span></td>
        <td><small><code>${l.hash.substring(0, 16)}...</code></small></td>
      `;
            tbody.appendChild(tr);
        });

        // Update Quick Stream on Dashboard
        const stream = document.getElementById('dashboardAuditStream');
        if (stream) {
            stream.innerHTML = logs.slice(0, 4).map(l => `
        <div class="audit-stream-item ${l.severity === 'CRITICAL' ? 'warn' : ''}">
          <div>
            <strong>[${l.category}]</strong> ${l.message}
            <br><small style="color:#64748b;">Operator: ${l.user} | ${new Date(l.timestamp).toLocaleTimeString()}</small>
          </div>
        </div>
      `).join('');
        }
    }

    function simulateFailedLogin(notifyCallback) {
        failedAttempts++;
        const ip = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;

        if (failedAttempts >= 3) {
            SaranStore.addAuditLog({
                category: 'Intrusion Detection',
                user: 'ATTACKER_LOCKED_OUT',
                ip: ip,
                severity: 'CRITICAL',
                message: `Account AUTO-LOCKED after ${failedAttempts} invalid authentication tokens. Multi-factor lock engaged.`
            });
            failedAttempts = 0;
            if (notifyCallback) notifyCallback('SECURITY ALERT: Maximum auth failures exceeded. Client source IP auto-locked.', 'danger');
        } else {
            SaranStore.addAuditLog({
                category: 'Authentication',
                user: 'unknown_operator',
                ip: ip,
                severity: 'WARNING',
                message: `Failed password authentication attempt (${failedAttempts}/3).`
            });
            if (notifyCallback) notifyCallback(`Auth Warning: Invalid credential provided (${failedAttempts}/3).`, 'warning');
        }

        renderAuditTable();
    }

    return {
        init: renderAuditTable,
        refresh: renderAuditTable,
        simulateFailedLogin: simulateFailedLogin
    };
})();