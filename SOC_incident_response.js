class IncidentResponseEngine {
    constructor() {
        this.logContainer = document.getElementById('live-logs');
        this.forensicQueue = document.getElementById('forensic-queue');
        this.remediationBtn = document.getElementById('run-remediation');
        this.remediationLog = document.getElementById('remediation-log');
        this.threatCount = document.getElementById('threat-val');
        this.statusBadge = document.getElementById('global-status');

        this.threats = 0;
        this.initSimulations();
    }

    initSimulations() {
        // Start generating normal background logs
        setInterval(() => this.generateLog(), 2000);

        // Inject advanced persistent threat scenarios periodically
        setTimeout(() => this.triggerVortexAnomaly(), 15000);
        setTimeout(() => this.triggerIronGateAudit(), 35000);
    }

    generateLog(message = null, level = 'info') {
        const time = new Date().toISOString().substring(11, 23);
        const ips = `192.168.1.${Math.floor(Math.random()*255)}`;

        const defaultMessages = [
            `[Auth] Successful login for user admin from ${ips}`,
            `[Net] TCP connection established on port 443 -> ${ips}`,
            `[Sys] Service health check: OK`,
            `[DB] PostgreSQL connection pool optimized`
        ];

        const logMsg = message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

        const div = document.createElement('div');
        div.className = `terminal-line ${level}`;
        div.innerHTML = `<span class="time">[${time}]</span> ${logMsg}`;

        this.logContainer.prepend(div);
        if (this.logContainer.children.length > 50) {
            this.logContainer.lastChild.remove();
        }
    }

    triggerVortexAnomaly() {
        this.threats++;
        this.updateThreatUI();

        this.generateLog('[!] SYSCALL ANOMALY: Unauthorized VS Code extension execution blocked.', 'critical');
        this.generateLog('[!] SIGNATURE MATCH: Project Vortex supply chain payload variant detected.', 'critical');

        this.addForensicTask('Malware Analysis: VORTEX.ext', 'High');
    }

    triggerIronGateAudit() {
        this.generateLog('[*] AUDIT INITIATED: Iron-Gate Sovereign Grid Document Exchange', 'warn');
        this.generateLog('[*] ENCRYPTION VERIFY: PostgreSQL backend handshake verified.', 'info');
        this.addForensicTask('Compliance Check: Iron-Gate Protocol', 'Medium');
    }

    addForensicTask(name, severity) {
        const div = document.createElement('div');
        div.style.cssText = `
            padding: 10px; border-left: 3px solid ${severity === 'High' ? 'var(--alert-red)' : 'var(--alert-orange)'};
            background: rgba(0,0,0,0.3); margin-bottom: 10px; font-family: var(--font-mono); font-size: 0.85rem; cursor: pointer;
        `;
        div.innerHTML = `<strong>${severity} Priority</strong><br/>${name}<br/><small style="color: var(--text-muted)">Awaiting Analyst Review</small>`;

        div.addEventListener('click', () => {
            this.remediationLog.innerHTML = `Initiating Forensics for: ${name}...\n\n[1] Isolating affected network segment...\n[2] Extracting artefacts (Memory Dump)...\n[3] Reversing payload signature...\n\nStatus: Awaiting execution command.`;
        });

        this.forensicQueue.prepend(div);

        this.remediationBtn.addEventListener('click', () => {
            this.remediationLog.innerHTML += `\n\n>> Executing Remediation Protocol...\n>> Eradicating malicious processes...\n>> Restoring from clean baseline.\n>> Incident Closed.`;
            if (this.threats > 0) this.threats--;
            this.updateThreatUI();
        }, { once: true });
    }

    updateThreatUI() {
        this.threatCount.textContent = this.threats;
        if (this.threats > 0) {
            this.statusBadge.textContent = 'ACTIVE BREACH DETECTED';
            this.statusBadge.className = 'grid-status breach';
        } else {
            this.statusBadge.textContent = 'SYSTEM SECURE';
            this.statusBadge.className = 'grid-status';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IncidentResponseEngine();
});