/**
 * Advanced HTML5 Canvas Renderer for Entanglement Swapping Topology
 * Draws static Classical/Quantum channels and animates data flows without external libraries.
 */
class TopologyVisualizer {
    constructor() {
        this.canvas = document.getElementById('topology-canvas');
        this.container = document.getElementById('swapping-topology');
        this.ctx = null;
        this.isSimulating = false;

        // Define connection lines based on the PDF diagram
        // CC = Classical Channel (Blue), QC = Quantum Channel (Pink)
        this.lines = [
            { id: 'CC1', from: 'node-a', to: 'node-b', type: 'cc', label: 'CC1' },
            { id: 'CC2', from: 'node-b', to: 'node-c', type: 'cc', label: 'CC2' },
            { id: 'QC3', from: 'node-a', to: 'bsm-1', type: 'qc', label: 'QC3', offset: -15 },
            { id: 'CC3', from: 'node-a', to: 'bsm-1', type: 'cc', label: 'CC3', offset: 15 },
            { id: 'QC1', from: 'node-b', to: 'bsm-1', type: 'qc', label: 'QC1', offset: -15 },
            { id: 'CC5', from: 'node-b', to: 'bsm-1', type: 'cc', label: 'CC5', offset: 15 },
            { id: 'QC4', from: 'node-b', to: 'bsm-2', type: 'qc', label: 'QC4', offset: -15 },
            { id: 'CC4', from: 'node-b', to: 'bsm-2', type: 'cc', label: 'CC4', offset: 15 },
            { id: 'QC2', from: 'node-c', to: 'bsm-2', type: 'qc', label: 'QC2', offset: -15 },
            { id: 'CC6', from: 'node-c', to: 'bsm-2', type: 'cc', label: 'CC6', offset: 15 }
        ];

        this.initCanvas();
        this.startAnimation();

        window.addEventListener('resize', () => this.initCanvas());

        document.getElementById('btn-master-sim').addEventListener('click', (e) => {
            window.isSimulating = !window.isSimulating;
            e.target.textContent = window.isSimulating ? "Stop Simulation" : "Start Simulation";
            e.target.style.background = window.isSimulating ? "var(--alert-red)" : "var(--accent-purple)";
        });
    }

    initCanvas() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    getCenterCoords(elementId) {
        const el = document.getElementById(elementId);
        if(!el) return {x: 0, y: 0};
        const rect = el.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        return {
            x: (rect.left - containerRect.left) + (rect.width / 2),
            y: (rect.top - containerRect.top) + (rect.height / 2)
        };
    }

    drawLines() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const time = Date.now() / 1000;

        this.lines.forEach(line => {
            const start = this.getCenterCoords(line.from);
            const end = this.getCenterCoords(line.to);

            // Calculate perpendicular offset for parallel lines
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const nx = -dy / len;
            const ny = dx / len;

            const offset = line.offset || 0;
            const sx = start.x + nx * offset;
            const sy = start.y + ny * offset;
            const ex = end.x + nx * offset;
            const ey = end.y + ny * offset;

            // Draw Base Channel
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.lineWidth = 6;
            ctx.strokeStyle = line.type === 'cc' ? '#3b82f6' : '#ec4899'; // Blue or Pink
            ctx.stroke();

            // Draw Arrowhead logic omitted for brevity, but we draw Labels
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(line.label, sx + (ex-sx)/2 + nx*15, sy + (ey-sy)/2 + ny*15);

            // Animate Data Packets if Simulating
            if (window.isSimulating) {
                const pTime = (time * (line.type === 'qc' ? 1.5 : 0.8)) % 1; // QC is faster in UI
                const px = sx + (ex - sx) * pTime;
                const py = sy + (ey - sy) * pTime;

                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';

                // Reset shadow
                ctx.shadowBlur = 0;
            }
        });
    }

    startAnimation() {
        const animate = () => {
            if(this.canvas && this.canvas.offsetParent !== null) {
                this.drawLines();
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.TopologySim = new TopologyVisualizer();
});