/**
 * Zero-Dependency Native SVG Charting Engine
 * Creates vector-sharp charts without Chart.js or D3.
 */
const ChartEngine = (() => {

    /**
     * Generates a Donut / Pie SVG chart
     */
    function createDonutChart(containerId, data, totalCount) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = 200;
        const strokeWidth = 32;
        const radius = (size - strokeWidth) / 2;
        const cx = size / 2;
        const cy = size / 2;
        const circumference = 2 * Math.PI * radius;

        let accumulatedAngle = 0;

        let svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        svgContent += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="${strokeWidth}" />`;

        data.forEach(item => {
            const sliceRatio = item.value / totalCount;
            const strokeDasharray = `${sliceRatio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;

            svgContent += `
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none"
          stroke="${item.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          style="transition: stroke-dasharray 0.5s ease;">
          <title>${item.label}: ${item.value} (${(sliceRatio * 100).toFixed(1)}%)</title>
        </circle>
      `;
            accumulatedAngle += sliceRatio;
        });

        svgContent += `
      <text x="${cx}" y="${cy}" text-anchor="middle" dy="0.3em" font-weight="700" font-size="18" fill="#1e293b">
        ${totalCount}
      </text>
    </svg>`;

        container.innerHTML = svgContent;
    }

    /**
     * Multi-Year Manpower Cost Trend (Pure SVG Bar Chart)
     */
    function createBarChart(containerId, dataset) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = 460;
        const height = 200;
        const padding = 35;
        const barWidth = 36;
        const maxValue = Math.max(...dataset.map(d => d.cost)) * 1.2;

        let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;

        // Horizontal guide lines
        for (let i = 0; i <= 4; i++) {
            const y = height - padding - (i * (height - 2 * padding) / 4);
            const val = Math.round((maxValue / 4) * i);
            svg += `<line x1="${padding}" y1="${y}" x2="${width - 10}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />`;
            svg += `<text x="${padding - 8}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end">${val}M</text>`;
        }

        // Bars
        const step = (width - 2 * padding) / dataset.length;
        dataset.forEach((d, idx) => {
            const x = padding + (idx * step) + (step - barWidth) / 2;
            const barHeight = (d.cost / maxValue) * (height - 2 * padding);
            const y = height - padding - barHeight;

            svg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#3b82f6">
          <title>${d.year}: ₹${d.cost} Million</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${height - padding + 16}" font-size="11" fill="#475569" text-anchor="middle">
          ${d.year}
        </text>
        <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" font-weight="bold" fill="#1e3a8a" text-anchor="middle">
          ₹${d.cost}
        </text>
      `;
        });

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    return {
        renderDonut: createDonutChart,
        renderBarChart: createBarChart
    };
})();