/**
 * Protective Mitigation Engine
 * Simulates real-time interception of malicious domains based on Rakshak PDF parameters.
 */
class ThreatEngine {
    constructor() {
        this.terminal = document.getElementById('threat-log-terminal');
        this.threatCountElement = document.getElementById('threat-counter');
        this.totalBlocked = 0;

        this.domains = [
            "login-paypal-secure-update.com",
            "microsoft-auth-verify.net",
            "cryptominer-pool.xyz",
            "typosquat-googIe.com",
            "tracking-pixel-data.io"
        ];

        this.types = [
            { type: "Phishing", color: "var(--alert-red)" },
            { type: "Malware", color: "var(--alert-orange)" },
            { type: "Privacy", color: "var(--alert-yellow)" }
        ];

        this.startMitigationLog();
    }

    startMitigationLog() {
        setInterval(() => {
            if(this.terminal && this.terminal.offsetParent !== null) {
                this.generateLogEntry();
            }
        }, 1200); // Generate a block every 1.2s
    }

    generateLogEntry() {
        const time = new Date().toISOString().substring(11, 23);
        const ip = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
        const threat = this.types[Math.floor(Math.random() * this.types.length)];

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-ip">${ip}</span>
            <span class="log-domain">Query: ${domain}</span>
            <span class="log-action" style="color: ${threat.color}">BLOCKED [${threat.type}]</span>
        `;

        this.terminal.prepend(entry);

        // Keep DOM light
        if(this.terminal.children.length > 50) {
            this.terminal.removeChild(this.terminal.lastChild);
        }

        // Increment Global Block Counter
        this.totalBlocked++;
        this.threatCountElement.textContent = this.totalBlocked.toLocaleString();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.MitigationEngine = new ThreatEngine();
});