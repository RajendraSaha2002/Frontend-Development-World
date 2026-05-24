/**
 * SPAN / TAP Packet Sniffer Terminal
 * Simulates Deep Packet Inspection (DPI) of ICS protocols (Modbus, DNP3, Ethernet/IP).
 */
class PacketInspector {
    constructor() {
        this.terminal = document.getElementById('packet-sniffer-terminal');
        this.anomalyCountEl = document.getElementById('anomaly-count');
        this.anomalies = 0;

        this.protocols = ["MODBUS", "DNP3", "CIP", "PROFINET", "TCP/IP"];
        this.actions = [
            "Read Holding Registers (0x03) - Success",
            "Read Coils (0x01) - Success",
            "Write Single Register (0x06) - Validated",
            "Unsolicited Message Response - OK",
            "Keep-Alive Broadcast"
        ];

        this.startSniffing();
    }

    startSniffing() {
        setInterval(() => {
            if (this.terminal && this.terminal.offsetParent !== null) {
                this.logPacket();
            }
        }, 800); // New packet every 0.8s
    }

    logPacket() {
        const time = new Date().toISOString().substring(11, 23);
        const protocol = this.protocols[Math.floor(Math.random() * this.protocols.length)];
        let action = this.actions[Math.floor(Math.random() * this.actions.length)];

        let isAnomaly = false;

        // 5% chance to simulate a detected anomaly via DPI
        if (Math.random() > 0.95) {
            isAnomaly = true;
            action = "MALFORMED PACKET / UNAUTHORIZED WRITE COMMAND DETECTED";
            this.anomalies++;
            if (this.anomalyCountEl) this.anomalyCountEl.textContent = this.anomalies;
        }

        const div = document.createElement('div');
        div.className = 'pkt-line';
        if (isAnomaly) {
            div.style.color = 'var(--alert-red)';
            div.style.borderLeft = '3px solid var(--alert-red)';
            div.style.paddingLeft = '8px';
            div.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        }

        div.innerHTML = `
            <span class="pkt-time">[${time}]</span>
            <span class="pkt-protocol">${protocol}</span>
            <span class="pkt-info">${action}</span>
        `;

        this.terminal.prepend(div);

        // Limit DOM size to prevent lag
        if (this.terminal.children.length > 60) {
            this.terminal.removeChild(this.terminal.lastChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Sniffer = new PacketInspector();
});