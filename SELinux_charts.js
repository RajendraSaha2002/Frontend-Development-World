// Custom Bar Chart using purely HTML5 Canvas API (No Chart.js)
const SecurityChart = {
    canvas: null,
    ctx: null,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        // Handle High-DPI screens
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    draw(logData) {
        if (!this.ctx) return;

        // Group data by Target Class
        const groupedData = {};
        logData.forEach(log => {
            if (log.action === 'denied') {
                groupedData[log.tclass] = (groupedData[log.tclass] || 0) + 1;
            }
        });

        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);
        if (labels.length === 0) return;

        const maxVal = Math.max(...values, 5); // Minimum scale of 5
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        const barWidth = (width - padding * 2) / labels.length - 20;

        // Clear Canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw Axes
        this.ctx.strokeStyle = '#1e3a5f';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, 20);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.lineTo(width - 20, height - padding);
        this.ctx.stroke();

        // Draw Bars
        labels.forEach((label, index) => {
            const val = values[index];
            const barHeight = ((height - padding * 2) / maxVal) * val;
            const x = padding + 10 + (index * (barWidth + 20));
            const y = height - padding - barHeight;

            // Bar Color
            this.ctx.fillStyle = 'rgba(255, 59, 59, 0.7)';
            this.ctx.fillRect(x, y, barWidth, barHeight);

            // Value Text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText(val, x + barWidth / 2 - 5, y - 5);

            // Label Text
            this.ctx.fillStyle = '#a3c2e0';
            this.ctx.fillText(label, x + barWidth / 2 - 20, height - padding + 20);
        });
    }
};