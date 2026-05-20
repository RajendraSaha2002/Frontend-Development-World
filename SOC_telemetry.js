class TelemetryMonitor {
    constructor() {
        this.canvas = document.getElementById('trafficChart');
        this.ctx = this.canvas.getContext('2d');
        this.dataPoints = new Array(50).fill(0);
        this.epsElement = document.getElementById('eps-val');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.startMonitoring();
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
    }

    startMonitoring() {
        setInterval(() => {
            // Generate synthetic network traffic data
            const baseTraffic = Math.floor(Math.random() * 50) + 20;
            const spike = Math.random() > 0.95 ? Math.floor(Math.random() * 150) : 0;
            const currentEps = baseTraffic + spike;

            this.dataPoints.push(currentEps);
            this.dataPoints.shift();

            this.epsElement.textContent = currentEps;
            this.drawChart();
        }, 1000);
    }

    drawChart() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        const maxVal = 200;
        const stepX = width / (this.dataPoints.length - 1);

        // Draw Grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for(let i = 0; i < height; i += 50) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(width, i);
        }
        this.ctx.stroke();

        // Draw Line
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 2;

        this.dataPoints.forEach((val, index) => {
            const x = index * stepX;
            const y = height - ((val / maxVal) * height);

            if (index === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });

        this.ctx.stroke();

        // Draw Fill Gradient
        this.ctx.lineTo(width, height);
        this.ctx.lineTo(0, height);
        this.ctx.closePath();

        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TelemetryMonitor();
});