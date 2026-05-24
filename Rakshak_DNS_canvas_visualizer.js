/**
 * High-Performance Native HTML5 Canvas Visualizations
 * Renders the Global Map and Health Index without external libraries (No D3/Chart.js).
 */
class VisualizerEngine {
    constructor() {
        this.mapCanvas = document.getElementById('globalTrafficMap');
        this.healthCanvas = document.getElementById('healthIndexChart');
        this.healthData = new Array(30).fill(100);

        this.initResizer();
        this.startRenderLoops();
    }

    initResizer() {
        const resize = () => {
            if(this.mapCanvas && this.mapCanvas.offsetParent !== null) {
                this.mapCanvas.width = this.mapCanvas.parentElement.clientWidth;
                this.mapCanvas.height = this.mapCanvas.parentElement.clientHeight;
            }
            if(this.healthCanvas && this.healthCanvas.offsetParent !== null) {
                this.healthCanvas.width = this.healthCanvas.parentElement.clientWidth;
                this.healthCanvas.height = this.healthCanvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();
    }

    startRenderLoops() {
        // Map Animation Loop
        const renderMap = () => {
            this.drawNodeMap();
            requestAnimationFrame(renderMap);
        };
        requestAnimationFrame(renderMap);

        // Health Chart Loop (Updates every second)
        setInterval(() => {
            // Fluctuate health between 92% and 100%
            const newHealth = 92 + (Math.random() * 8);
            this.healthData.push(newHealth);
            this.healthData.shift();
            this.drawHealthChart();
        }, 1000);
    }

    drawNodeMap() {
        if(!this.mapCanvas || this.mapCanvas.offsetParent === null) return;
        const ctx = this.mapCanvas.getContext('2d');
        const w = this.mapCanvas.width;
        const h = this.mapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw Abstract Continents Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for(let x=0; x<w; x+=20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for(let y=0; y<h; y+=20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Draw active resolver locations (Simulated Coordinates)
        const nodes = [
            { x: w * 0.2, y: h * 0.3, color: '#3b82f6', label: 'NA-EAST' },
            { x: w * 0.5, y: h * 0.25, color: '#10b981', label: 'EU-CENTRAL' },
            { x: w * 0.75, y: h * 0.45, color: '#06b6d4', label: 'ASIA-SOUTH (103.58.x.x)' },
            { x: w * 0.85, y: h * 0.35, color: '#06b6d4', label: 'ASIA-EAST (220.156.x.x)' }
        ];

        const time = Date.now() / 500;

        nodes.forEach(node => {
            // Node core
            ctx.beginPath();
            ctx.fillStyle = node.color;
            ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Node pulse
            ctx.beginPath();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 1.5;
            ctx.arc(node.x, node.y, 10 + Math.sin(time) * 5, 0, Math.PI * 2);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px monospace';
            ctx.fillText(node.label, node.x + 15, node.y + 3);
        });

        // Occasional threat lines
        if(Math.random() > 0.8) {
            const start = nodes[Math.floor(Math.random() * nodes.length)];
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(w * Math.random(), h * Math.random());
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    drawHealthChart() {
        if(!this.healthCanvas || this.healthCanvas.offsetParent === null) return;
        const ctx = this.healthCanvas.getContext('2d');
        const w = this.healthCanvas.width;
        const h = this.healthCanvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;

        const step = w / (this.healthData.length - 1);

        this.healthData.forEach((val, i) => {
            const x = i * step;
            // Map 80-100 to canvas height
            const normalized = (val - 80) / 20;
            const y = h - (normalized * (h - 20));

            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // Gradient Fill
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Visualizer = new VisualizerEngine();
});