/**
 * SIEM Logic Correlation Core
 * Evaluates raw data streams against specialized security parsing constraints.
 */
class CorrelationRulesEngine {
    constructor() {
        this.terminal = document.getElementById('siem-live-feed-terminal');
        this.logsCount = 0;
        this.startIngestionLoop();
    }

    startIngestionLoop() {
        setInterval(() => {
            this.logsCount++;
            this.generateLogFrame();
        }, 1800);

        // Inject a critical security alert immediately into the correlation queue
        setTimeout(() => {
            this.injectCriticalOTBreach();
        }, 5000);
    }

    generateLogFrame() {
        if (!this.terminal) return;

        const timestamp = new Date().toISOString().substring(11, 19);
        const logTemplates = [
            { type: "it-type", msg: "Wazuh Agent ENT-SRV-01: User Authentication Success for local administrator" },
            { type: "it-type", msg: "Syslog Ingestion Gateway: Firewall established session path TCP 443 -> 10.100.10.4" },
            { type: "ot-type", msg: "DPI Engine: Modbus Transaction Read Holding Registers completed on Station ID 0x01" },
            { type: "ot-type", msg: "DPI Engine: IEC 60870-5-104 Type 30 (Interrogation Command) processed cleanly" }
        ];

        const selection = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        const row = document.createElement('div');
        row.className = `terminal-frame-line ${selection.type}`;
        row.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${selection.msg}`;

        this.terminal.prepend(row);
        this.trimTerminalCache();
    }

    injectCriticalOTBreach() {
        if (!this.terminal) return;
        const timestamp = new Date().toISOString().substring(11, 19);

        const row = document.createElement('div');
        row.className = `terminal-frame-line critical-alert-type`;
        row.innerHTML = `<span class="timestamp">[${timestamp}]</span> <strong>CRITICAL INCIDENT:</strong> SIEM Event Correlation Match on Modbus Address 0x0064. Unauthorized Write Command Attempt to Substation Valve.`;

        this.terminal.prepend(row);
        window.MasterSOCController.incrementAnomalyCounter(1);

        // Propagate event tracking to the Threat Intelligence stack module
        if (window.ThreatIntelEngineInstance) {
            window.ThreatIntelEngineInstance.registerMitreVector(
                "T0855 - Unauthorized Command Execution",
                "Attacker bypassed level 3 boundaries to issue malicious Modbus control registers payload."
            );
        }
    }

    trimTerminalCache() {
        while (this.terminal.children.length > 40) {
            this.terminal.lastChild.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.CorrelationEngineInstance = new CorrelationRulesEngine();
});