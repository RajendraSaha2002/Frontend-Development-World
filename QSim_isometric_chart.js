/**
 * Native HTML5 Canvas 3D Isometric Bar Chart
 * Recreates the "Simulated Density Matrix" visual using pure mathematics.
 */
class IsometricChart {
    constructor() {
        this.canvas = document.getElementById('density-matrix-canvas');
        this.ctx = null;
        // Mock Density Matrix Data (4x4 for 2 qubits: |00>, |01>, |10>, |11>)
        this.data = [
            [0.5, 0.1, 0.0, 0.5],
            [0.1, 0.0, 0.0, 0.0],
            [0.0, 0.0, 0.0, 0.0],
            [0.5, 0.0, 0.0, 0.5]
        ];

        this.colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

        this.initCanvas();
        this.drawChart();

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.drawChart();
        });

        // Hook up the simulate button
        document.getElementById('btn-simulate').addEventListener('click', () => {
            this.simulateExecution();
        });
    }

    initCanvas() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    drawIsometricBlock(x, y, w, d, h, colorHex) {
        const ctx = this.ctx;
        const angle = Math.PI / 6; // ~30 degrees for isometric

        const dx = Math.cos(angle) * d;
        const dy = Math.sin(angle) * d;
        const wx = Math.cos(angle) * w;
        const wy = Math.sin(angle) * w;

        // Colors for lighting effect
        const topColor = this.lightenColor(colorHex, 40);
        const rightColor = this.lightenColor(colorHex, -20);
        const leftColor = colorHex;

        // Top Face
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + wx, y - h - wy);
        ctx.lineTo(x + wx - dx, y - h - wy - dy);
        ctx.lineTo(x - dx, y - h - dy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Face
        ctx.fillStyle = leftColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + wx, y - wy);
        ctx.lineTo(x + wx, y - h - wy);
        ctx.lineTo(x, y - h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Face
        ctx.fillStyle = rightColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - dx, y - dy);
        ctx.lineTo(x - dx, y - h - dy);
        ctx.lineTo(x, y - h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            B = (num >> 8 & 0x00FF) + amt,
            G = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
    }

    drawChart() {
        if (!this.ctx || this.canvas.offsetParent === null) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const originX = this.canvas.width / 2;
        const originY = this.canvas.height - 80;

        const blockSize = 25;
        const maxBarHeight = 150;

        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;

        // Draw from back to front (Painters algorithm for 2D array mapping isometric)
        for (let row = 0; row < this.data.length; row++) {
            for (let col = this.data[row].length - 1; col >= 0; col--) {
                const val = this.data[row][col];
                if (val > 0) {
                    // Isometric projection mapping
                    const isoX = originX + (col - row) * Math.cos(Math.PI/6) * blockSize;
                    const isoY = originY + (col + row) * Math.sin(Math.PI/6) * blockSize;

                    const barHeight = val * maxBarHeight;
                    const color = this.colors[(row + col) % this.colors.length];

                    this.drawIsometricBlock(isoX, isoY, blockSize, blockSize, barHeight, color);
                }
            }
        }

        // Draw axis labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('|00⟩', originX - 90, originY - 10);
        ctx.fillText('|11⟩', originX + 70, originY - 10);
        ctx.fillText('Basis States', originX - 30, originY + 40);
    }

    simulateExecution() {
        const btn = document.getElementById('btn-simulate');
        btn.textContent = "Computing...";
        btn.disabled = true;

        // Simulate noise causing decoherence in the density matrix
        setTimeout(() => {
            this.data = [
                [0.45, 0.05, 0.02, 0.40],
                [0.05, 0.02, 0.01, 0.05],
                [0.02, 0.01, 0.01, 0.02],
                [0.40, 0.05, 0.02, 0.45]
            ];
            this.drawChart();

            btn.textContent = "Run Simulation";
            btn.disabled = false;
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ResultChart = new IsometricChart();
});