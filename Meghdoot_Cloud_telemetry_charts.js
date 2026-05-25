/**
 * High-Performance Native HTML5 Canvas Visualizations for HCI Telemetry
 * Rendered without external libraries.
 */
class TelemetryEngine {
    constructor() {
        this.lineCanvas = document.getElementById('computeTelemetryCanvas');
        this.donutCanvas = document.getElementById('storageDonutCanvas');
        this.cpuData = new Array(40).fill(40);
        this.netData = new Array(40).fill(20);

        this.initResizer();
        this.startRenderLoops();
        this.drawDonutChart();
    }

    initResizer() {
        const resize = () => {
            if(this.lineCanvas && this.lineCanvas.offsetParent !== null) {
                this.lineCanvas.width = this.lineCanvas.parentElement.clientWidth;
                this.lineCanvas.height = this.lineCanvas.parentElement.clientHeight;
            }
            if(this.donutCanvas && this.donutCanvas.offsetParent !== null) {
                this.donutCanvas.width = this.donutCanvas.parentElement.clientWidth;
                this.donutCanvas.height = this.donutCanvas.parentElement.clientHeight;
                this.drawDonutChart(); // Redraw static donut on resize
            }
        };
        window.addEventListener('resize', resize);
        resize();
    }

    startRenderLoops() {
        setInterval(() => {
            // Simulate Data Center Compute Load
            this.cpuData.push(Math.max(10, Math.min(90, this.cpuData[this.cpuData.length-1] + (Math.random() * 20 - 10))));
            this.netData.push(Math.max(5, Math.min(60, this.netData[this.netData.length-1] + (Math.random() * 10 - 5))));

            this.cpuData.shift();
            this.netData.shift();

            this.drawLineChart();
        }, 1000);
    }

    drawLineChart() {
        if(!this.lineCanvas || this.lineCanvas.offsetParent === null) return;
        const ctx = this.lineCanvas.getContext('2d');
        const w = this.lineCanvas.width;
        const h = this.lineCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for(let i = 0; i < h; i += 40) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        const drawLine = (data, color, fillRgba) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            const step = w / (data.length - 1);

            data.forEach((val, i) => {
                const x = i * step;
                const y = h - (val / 100) * h;
                if(i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Gradient Fill
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, fillRgba);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fill();
        };

        // CPU Line (Blue)
        drawLine(this.cpuData, '#3b82f6', 'rgba(59, 130, 246, 0.3)');
        // Network Line (Cyan)
        drawLine(this.netData, '#06b6d4', 'rgba(6, 182, 212, 0.2)');
    }

    drawDonutChart() {
        if(!this.donutCanvas || this.donutCanvas.offsetParent === null) return;
        const ctx = this.donutCanvas.getContext('2d');
        const w = this.donutCanvas.width;
        const h = this.donutCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 20;

        ctx.clearRect(0, 0, w, h);

        const segments = [
            { val: 60, color: '#3b82f6' }, // Block
            { val: 25, color: '#8b5cf6' }, // Object
            { val: 15, color: '#06b6d4' }  // File
        ];

        let startAngle = -Math.PI / 2;

        segments.forEach(seg => {
            const sliceAngle = (seg.val / 100) * 2 * Math.PI;
            ctx.beginPath();
            ctx.fillStyle = seg.color;
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
            ctx.fill();
            startAngle += sliceAngle;
        });

        // Cutout for donut
        ctx.beginPath();
        ctx.fillStyle = '#1e293b'; // Match card background
        ctx.arc(cx, cy, radius * 0.65, 0, 2 * Math.PI);
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Telemetry = new TelemetryEngine();
});