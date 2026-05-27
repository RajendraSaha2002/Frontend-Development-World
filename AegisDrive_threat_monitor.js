/**
 * Attack Vector Simulator & Mitigation Logging
 */
window.ThreatMonitor = {
    terminal: document.getElementById('threat-monitor-log'),

    log: function(msg, type) {
        if (!this.terminal) this.terminal = document.getElementById('threat-monitor-log');
        const time = new Date().toISOString().substring(11, 19);
        const entry = document.createElement('div');
        entry.className = `log-line ${type}`;
        entry.innerHTML = `<span style="color:#64748b">[${time}]</span> ${msg}`;
        this.terminal.appendChild(entry);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    },

    simulate: function(type) {
        this.log(`Simulating Attack Vector: ${type.toUpperCase()}...`, "sys");

        setTimeout(() => {
            switch(type) {
                case 'ecu':
                    this.log("ALERT: Spoofed CAN Frame detected from unauthenticated node.", "err");
                    setTimeout(() => this.log("MITIGATION: X.509 Certificate missing. Gateway dropped frame.", "succ"), 1000);
                    break;
                case 'mitm':
                    this.log("ALERT: Traffic interception detected on OTA channel.", "err");
                    setTimeout(() => this.log("MITIGATION: TLS 1.3 Handshake enforced. Payload encrypted via AES-256-GCM.", "succ"), 1000);
                    break;
                case 'keyless':
                    this.log("ALERT: Unrecognized RF replay attack detected.", "err");
                    setTimeout(() => this.log("MITIGATION: Challenge-response failed. ECDSA signature invalid. Doors locked.", "succ"), 1000);
                    break;
                case 'malware':
                    this.log("ALERT: Unauthorized binary execution attempted via USB Interface.", "err");
                    setTimeout(() => this.log("MITIGATION: Secure Boot sequence blocked execution. Signature hash mismatch.", "succ"), 1000);
                    break;
            }
        }, 800);
    }
};