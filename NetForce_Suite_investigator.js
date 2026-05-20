class CyberInvestigator {
    constructor() {
        this.analyzeBtn = document.getElementById('parse-logs');
        this.logViewer = document.getElementById('log-viewer');
        this.threatFeed = document.getElementById('threat-feed');
        this.searchInput = document.getElementById('log-search');
        this.rawLogs = "";

        this.bindEvents();
    }

    bindEvents() {
        this.analyzeBtn.addEventListener('click', () => this.ingestLogs());
        this.searchInput.addEventListener('input', (e) => this.highlightLogs(e.target.value));
    }

    ingestLogs() {
        // Simulating complex log ingestion
        this.rawLogs = `
May 20 11:42:01 secure-gateway sshd[1204]: Failed password for invalid user admin from 185.12.x.x port 39412 ssh2
May 20 11:42:05 secure-gateway kernel: [VORTEX_DETECT] Unsigned VS Code extension payload blocked in /home/dev/.vscode-server/
May 20 11:45:10 secure-gateway sudo: dev_user : TTY=pts/0 ; PWD=/var/www ; USER=root ; COMMAND=/bin/bash
May 20 11:46:22 secure-gateway kernel: iptables: DROP IN=eth0 OUT= SRC=45.33.x.x DST=192.168.1.10 LEN=40 TOS=0x00 PROTO=TCP DPT=22
        `.trim();

        this.logViewer.textContent = this.rawLogs;

        this.threatFeed.innerHTML = `
            <li><strong>CRITICAL:</strong> Supply Chain Anomaly - Unsigned Developer Tool Execution Attempted (VORTEX indicator)</li>
            <li><strong>HIGH:</strong> Root privilege escalation (sudo /bin/bash) detected.</li>
            <li><strong>WARN:</strong> Repeated SSH auth failures from subnet 185.12.0.0/16.</li>
        `;
    }

    highlightLogs(searchTerm) {
        if (!searchTerm || !this.rawLogs) {
            this.logViewer.textContent = this.rawLogs || "Awaiting log ingestion...";
            return;
        }

        try {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlighted = this.rawLogs.replace(regex, '<span class="highlight">$1</span>');
            this.logViewer.innerHTML = highlighted;
        } catch(e) {
            // fail silently on bad regex typing
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new CyberInvestigator());