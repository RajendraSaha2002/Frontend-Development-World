// Native HTML5 Canvas rendering without external charting libraries
class ChartEngine {
    constructor() {
        this.initTrafficChart();
        this.initDonutChart();

        window.addEventListener('resize', () => {
            this.initTrafficChart();
            this.initDonutChart();
        });
    }

    initTrafficChart() {
        const canvas = document.getElementById('trafficChart');
        if(!canvas || canvas.parentElement.clientWidth === 0) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        let data = new Array(30).fill(0).map(() => Math.random() * 50 + 20);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            for(let i=0; i<canvas.height; i+=40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            }

            // Line
            ctx.beginPath();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;

            const step = canvas.width / (data.length - 1);
            data.forEach((val, i) => {
                const x = i * step;
                const y = canvas.height - val - 20;
                if(i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Gradient Fill
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Animate Data
            data.push(Math.random() * 50 + 20);
            data.shift();
        };

        if(this.trafficInterval) clearInterval(this.trafficInterval);
        this.trafficInterval = setInterval(draw, 1000);
        draw();
    }

    initDonutChart() {
        const canvas = document.getElementById('osDistributionChart');
        if(!canvas || canvas.parentElement.clientWidth === 0) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        const data = [
            { label: 'Windows', value: 45, color: '#3b82f6' },
            { label: 'Linux', value: 30, color: '#10b981' },
            { label: 'IoT/OT', value: 15, color: '#f59e0b' },
            { label: 'Unknown', value: 10, color: '#ef4444' }
        ];

        let total = data.reduce((sum, item) => sum + item.value, 0);
        let startAngle = -0.5 * Math.PI;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.fillStyle = item.color;
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.fill();
            startAngle += sliceAngle;
        });

        // Cutout for donut
        ctx.beginPath();
        ctx.fillStyle = '#151c33'; // Match card background
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fill();

        // Center Text
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Assets', centerX, centerY - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('Agent-less', centerX, centerY + 10);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AegisCharts = new ChartEngine();
});