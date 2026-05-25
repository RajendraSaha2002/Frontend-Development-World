/**
 * Simulates a Next-Gen Cloud Security SIEM terminal log.
 */
class SecurityLogger {
    constructor() {
        this.terminal = document.getElementById('security-log-terminal');
        this.threatCountEl = document.getElementById('threat-counter');
        this.threats = 0;

        this.events = [
            { level: 'info', msg: 'Firewall Policy Synced across OpenStack edges.' },
            { level: 'info', msg: 'Automated snapshot backup verified for Storage Pool Alpha.' },
            { level: 'warn', msg: 'High IOPS latency detected on Node 14. Load balancer re-routing traffic.' },
            { level: 'info', msg: 'K8s Ingress Controller updated routing rules successfully.' }
        ];

        this.startLogging();
    }

    startLogging() {
        setInterval(() => {
            if(this.terminal && this.terminal.offsetParent !== null) {
                // 10% chance of critical security event
                if(Math.random() > 0.90) {
                    this.logEvent('crit', 'MALICIOUS PAYLOAD DETECTED. IPS engine blocked unauthorized lateral movement attempt on subnet 10.0.4.x.');
                    this.threats++;
                    this.threatCountEl.textContent = this.threats;
                } else {
                    const evt = this.events[Math.floor(Math.random() * this.events.length)];
                    this.logEvent(evt.level, evt.msg);
                }
            }
        }, 2000);
    }

    logEvent(level, msg) {
        const time = new Date().toISOString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-level ${level}">${level.toUpperCase()}</span>
            <span class="log-msg">${msg}</span>
        `;

        this.terminal.appendChild(entry);

        // Auto-scroll
        this.terminal.scrollTop = this.terminal.scrollHeight;

        // Prevent DOM bloat
        if(this.terminal.children.length > 50) {
            this.terminal.removeChild(this.terminal.children[0]); // Keep top system messages if possible, but for simplicity remove first
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.SecuritySIEM = new SecurityLogger();
});