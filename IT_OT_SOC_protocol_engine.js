/**
 * Industrial Protocol Engine
 * Decodes telemetry streams via native Canvas tracking matrices.
 */
class ProtocolEngine {
    constructor() {
        this.dashboardCanvas = document.getElementById('convergenceTelemetryCanvas');
        this.snifferCanvas = document.getElementById('protocolSnifferCanvas');
        this.dpiPanel = document.getElementById('dpi-breakdown-panel');

        this.telemetryHistory = new Array(40).fill(0).map(() => Math.floor(Math.random() * 30) + 10);

        this.initCanvasResizing();
        this.startSnifferSim();
        this.renderLoop();
    }

    initCanvasResizing() {
        const handleResize = () => {
            if (this.dashboardCanvas) {
                this.dashboardCanvas.width = this.dashboardCanvas.parentElement.clientWidth;
                this.dashboardCanvas.height = this.dashboardCanvas.parentElement.clientHeight;
            }
            if (this.snifferCanvas) {
                this.snifferCanvas.width = this.snifferCanvas.parentElement.clientWidth;
                this.snifferCanvas.height = this.snifferCanvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
    }

    startSnifferSim() {
        // Intermittent updates mimicking deep packet inspection parameters
        setInterval(() => {
            this.telemetryHistory.push(Math.floor(Math.random() * 40) + 15);
            this.telemetryHistory.shift();
        }, 1000);

        if (this.snifferCanvas) {
            this.snifferCanvas.addEventListener('click', (e) => {
                this.injectDecodedDpiBlock();
            });
        }
    }

    injectDecodedDpiBlock() {
        if (!this.dpiPanel) return;
        this.dpiPanel.innerHTML = `
            <div class="dpi-block">
                <div class="dpi-title">Industrial Frame: Modbus TCP Packet</div>
                <div class="dpi-kv"><span>Transaction Identifier:</span><span class="val">0x2A4F</span></div>
                <div class="dpi-kv"><span>Protocol ID / Length:</span><span class="val">0x0000 / 6 Bytes</span></div>
                <div class="dpi-kv"><span>Target Unit ID / Station:</span><span class="val">0x01</span></div>
                <div class="dpi-kv"><span>Function Code Executed:</span><span class="val" style="color:var(--crimson-alarm)">0x05 (Force Single Coil)</span></div>
                <div class="dpi-kv"><span>Register Memory Address:</span><span class="val">0x0064 [Substation Gate Valve]</span></div>
                <div class="dpi-kv"><span>Command State Value:</span><span class="val" style="color:var(--crimson-alarm)">0xFF00 [FORCE SHUTDOWN]</span></div>
            </div>
        `;
    }

    renderLoop() {
        const render = () => {
            this.drawConvergenceChart();
            this.drawSnifferWaterfall();
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    drawConvergenceChart() {
        if (!this.dashboardCanvas) return;
        const ctx = this.dashboardCanvas.getContext('2d');
        const w = this.dashboardCanvas.width;
        const h = this.dashboardCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < h; i += 40) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        // Render dynamic path vector
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        const step = w / (this.telemetryHistory.length - 1);

        this.telemetryHistory.forEach((val, idx) => {
            const x = idx * step;
            const y = h - ((val / 100) * h) - 20;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    drawSnifferWaterfall() {
        if (!this.snifferCanvas) return;
        const ctx = this.snifferCanvas.getContext('2d');
        const w = this.snifferCanvas.width;
        const h = this.snifferCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Render a simulated real-time telemetry waterfall tracking Modbus/IEC-104 packets
        ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
        ctx.fillRect(10, 10, w - 20, h - 20);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText(">> [SPAN PORT SNIFFER ACTIVE] - CLICK ANYWHERE TO CAPTURE & INJECT PACKET ARTEFACT", 20, 30);

        // Pulse vector line visualization
        const timeShift = Date.now() * 0.005;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        for (let x = 0; x < w; x++) {
            const y = (h / 2) + Math.sin(x * 0.02 + timeShift) * 30;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ProtocolEngineInstance = new ProtocolEngine();
});