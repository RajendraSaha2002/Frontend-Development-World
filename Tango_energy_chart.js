/**
 * Renders the 2D Scatter Plot: RMSD (Å) vs MOPAC Energy (kcal/mol)
 * Identifies Best Conformation and Alternate Stable conformers.
 */
class EnergyChart {
    constructor() {
        this.canvas = document.getElementById('energyChartCanvas');
        this.ctx = null;
        this.dataPoints = [];
        this.globalMetrics = { count: 0, bestEnergy: 0 };

        this.initCanvas();
        this.drawEmptyAxes();

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.draw();
        });
    }

    initCanvas() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    generateData(totalConformers) {
        this.dataPoints = [];
        let minEnergy = Infinity;
        let bestPoint = null;

        for (let i = 0; i < totalConformers; i++) {
            // Simulate RMSD between 0 and 3.0 Å
            const rmsd = Math.random() * 3.0;

            // Simulate Energy funnel (lower energy usually clusters around specific RMSDs)
            // Base energy around 50-150 kcal/mol, dropping at "stable" RMSD pockets
            let energy = 100 + (Math.random() * 200);

            // Create "funnels" of stability near RMSD 0.5, 1.5, 2.5
            const dist1 = Math.abs(rmsd - 0.5);
            const dist2 = Math.abs(rmsd - 1.5);
            const dist3 = Math.abs(rmsd - 2.5);

            if (dist1 < 0.2) energy -= (60 + Math.random()*20); // Best conformer pocket
            else if (dist2 < 0.2 || dist3 < 0.2) energy -= (40 + Math.random()*20); // Alternate stables

            const point = { rmsd, energy, type: 'unstable' };

            if (energy < minEnergy) {
                minEnergy = energy;
                bestPoint = point;
            }

            this.dataPoints.push(point);
        }

        // Classify points
        this.dataPoints.forEach(p => {
            if (p === bestPoint) p.type = 'best';
            else if (p.energy < minEnergy + 30) p.type = 'alternate';
        });

        this.globalMetrics.count = totalConformers;
        this.globalMetrics.bestEnergy = minEnergy.toFixed(2);
        this.updateMetricsUI();
        this.animateDrawing();
    }

    updateMetricsUI() {
        document.getElementById('conformer-count').textContent = this.globalMetrics.count;
        document.getElementById('best-energy-val').textContent = this.globalMetrics.bestEnergy;
    }

    drawEmptyAxes() {
        if (!this.ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 40;

        this.ctx.clearRect(0, 0, w, h);
        this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
        this.ctx.lineWidth = 1;
        this.ctx.font = "10px sans-serif";
        this.ctx.fillStyle = "#808099";

        // Y Axis (Energy)
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, h - padding);
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.translate(15, h / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = "center";
        this.ctx.fillText("MOPAC Energy (kcal/mol)", 0, 0);
        this.ctx.restore();

        // X Axis (RMSD)
        this.ctx.beginPath();
        this.ctx.moveTo(padding, h - padding);
        this.ctx.lineTo(w - padding, h - padding);
        this.ctx.stroke();

        this.ctx.textAlign = "center";
        this.ctx.fillText("RMSD (Å)", w / 2, h - 10);
    }

    draw(progress = 1) {
        if (!this.ctx || this.canvas.offsetParent === null) return;
        this.drawEmptyAxes();

        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 40;

        const plotW = w - (padding * 2);
        const plotH = h - (padding * 2);

        // Max values for scaling
        const maxRMSD = 3.0;
        const minEnergy = 0;
        const maxEnergy = 350;

        const pointsToDraw = Math.floor(this.dataPoints.length * progress);

        for (let i = 0; i < pointsToDraw; i++) {
            const p = this.dataPoints[i];
            const x = padding + (p.rmsd / maxRMSD) * plotW;
            const y = (h - padding) - ((p.energy - minEnergy) / (maxEnergy - minEnergy)) * plotH;

            this.ctx.beginPath();
            if (p.type === 'best') {
                this.ctx.fillStyle = "#10b981"; // Green
                this.ctx.arc(x, y, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.stroke();
            } else if (p.type === 'alternate') {
                this.ctx.fillStyle = "#06b6d4"; // Cyan
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = "rgba(239, 68, 68, 0.4)"; // Red fade
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    animateDrawing() {
        let progress = 0;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            progress = Math.min(elapsed / duration, 1);

            // Ease out quad
            const easedProgress = progress * (2 - progress);
            this.draw(easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                window.isJobRunning = false; // Stop cluster animation load
            }
        };
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ChartEngine = new EnergyChart();
});