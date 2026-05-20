class NeSAEngine {
    constructor() {
        this.isCapturing = false;
        this.streamContainer = document.getElementById('packet-stream');
        this.toggleBtn = document.getElementById('toggle-capture');
        this.filterInput = document.getElementById('nesa-filter');
        this.stats = { total: 0, tcp: 0, sql: 0 };
        this.captureInterval = null;

        this.bindEvents();
    }

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => {
            this.isCapturing = !this.isCapturing;
            this.toggleBtn.textContent = this.isCapturing ? 'Stop Capture' : 'Start Capture';
            this.toggleBtn.classList.toggle('secondary');

            if (this.isCapturing) this.startCapture();
            else clearInterval(this.captureInterval);
        });

        this.filterInput.addEventListener('input', () => this.applyFilter());
    }

    generateMockPacket() {
        const protocols = ['TCP', 'TCP', 'UDP', 'ICMP'];
        const proto = protocols[Math.floor(Math.random() * protocols.length)];
        const time = new Date().toISOString().substring(11, 23);

        let src = `192.168.1.${Math.floor(Math.random() * 255)}`;
        let dst = `10.0.0.${Math.floor(Math.random() * 20)}`;
        let info = '';

        if (proto === 'TCP') {
            const ports = [80, 443, 22, 5432, 3389];
            const port = ports[Math.floor(Math.random() * ports.length)];
            info = `${port} > ${Math.floor(Math.random()*10000)+1024} [PSH, ACK] Seq=1`;
            if (port === 5432) {
                info = "PostgreSQL DB Auth Exchange";
                if(Math.random() > 0.8) {
                    info = "[!] PostgreSQL Brute Force Pattern Detected";
                    this.stats.sql++;
                }
            }
        } else {
            info = `Len=${Math.floor(Math.random() * 1500)}`;
        }

        return { time, src, dst, proto, info };
    }

    startCapture() {
        this.captureInterval = setInterval(() => {
            const pkt = this.generateMockPacket();
            this.stats.total++;
            if (pkt.proto === 'TCP') this.stats.tcp++;

            this.updateStatsUI();
            this.renderPacket(pkt);
        }, 800);
    }

    renderPacket(pkt) {
        const regexStr = this.filterInput.value;
        if (regexStr) {
            try {
                const regex = new RegExp(regexStr, 'i');
                const pktString = `${pkt.src} ${pkt.dst} ${pkt.proto} ${pkt.info}`;
                if (!regex.test(pktString)) return;
            } catch (e) { /* Ignore invalid regex while typing */ }
        }

        const div = document.createElement('div');
        div.className = 'packet-row';
        div.innerHTML = `
            <span class="pkt-time">${pkt.time}</span>
            <span>${pkt.src}</span>
            <span>${pkt.dst}</span>
            <span class="pkt-proto ${pkt.proto.toLowerCase()}">${pkt.proto}</span>
            <span>${pkt.info}</span>
        `;

        this.streamContainer.prepend(div);

        // Keep DOM light
        if (this.streamContainer.children.length > 50) {
            this.streamContainer.lastChild.remove();
        }
    }

    updateStatsUI() {
        document.getElementById('stat-total').textContent = this.stats.total;
        document.getElementById('stat-tcp').textContent = this.stats.tcp;
        document.getElementById('stat-sql').textContent = this.stats.sql;

        const tcpPercent = (this.stats.tcp / this.stats.total) * 100 || 0;
        document.getElementById('meter-tcp').style.width = `${tcpPercent}%`;
    }
}

document.addEventListener('DOMContentLoaded', () => new NeSAEngine());