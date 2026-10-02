/**
 * 02-chart-engine.js
 * Native HTML5 Canvas Data Visualizer.
 * Renders resolution velocity curves and donut distributions without external libraries.
 */
const SaranCharts = (function () {
    'use strict';

    function renderVelocityChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Auto-scale to display device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);

        // Grid baseline
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let y = 30; y < h - 20; y += 40) {
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(w - 10, y);
            ctx.stroke();
        }

        // Mock data for 7 hourly buckets
        const incoming = [8, 14, 22, 19, 28, 15, 24];
        const resolved = [6, 11, 18, 24, 25, 21, 29];
        const maxVal = 35;
        const stepX = (w - 50) / (incoming.length - 1);

        function drawLine(data, color, fillColor) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;

            data.forEach((val, i) => {
                const x = 35 + i * stepX;
                const y = (h - 30) - (val / maxVal) * (h - 60);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Soft Area Fill
            ctx.lineTo(35 + (data.length - 1) * stepX, h - 30);
            ctx.lineTo(35, h - 30);
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        drawLine(incoming, '#0284c7', 'rgba(2, 132, 199, 0.08)');
        drawLine(resolved, '#10b981', 'rgba(16, 185, 129, 0.08)');
    }

    function renderProfileDonut(canvasId, legendContainerId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY) - 15;
        const innerRadius = radius * 0.65;

        ctx.clearRect(0, 0, w, h);

        const tickets = SaranStore.getTickets();
        let counts = { incident: 0, change: 0, service_request: 0 };
        tickets.forEach(t => {
            if (counts[t.profile] !== undefined) counts[t.profile]++;
        });

        const total = tickets.length || 1;
        const data = [
            { label: 'Incidents', count: counts.incident, color: '#ef4444' },
            { label: 'Changes', count: counts.change, color: '#f59e0b' },
            { label: 'Requests', count: counts.service_request, color: '#10b981' }
        ];

        let currentAngle = -0.5 * Math.PI;
        data.forEach(item => {
            const sliceAngle = (item.count / total) * (2 * Math.PI);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            currentAngle += sliceAngle;
        });

        // Inner Donut Cutout
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Center text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${total} Total`, centerX, centerY);

        // Legend
        const legend = document.getElementById(legendContainerId);
        if (legend) {
            legend.innerHTML = data.map(d => `
        <span><span class="legend-dot" style="background:${d.color}"></span> ${d.label} (${d.count})</span>
      `).join('');
        }
    }

    return {
        init: () => {
            renderVelocityChart('velocityChart');
            renderProfileDonut('profileDonutChart', 'donutLegend');
        },
        refresh: () => {
            renderVelocityChart('velocityChart');
            renderProfileDonut('profileDonutChart', 'donutLegend');
        }
    };
})();