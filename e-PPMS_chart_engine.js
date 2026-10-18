/**
 * Zero-Dependency SVG Visualization Engine
 */
const ChartEngine = (() => {

    function renderDonut(containerId, dataset, total) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const size = 200;
        const strokeWidth = 30;
        const radius = (size - strokeWidth) / 2;
        const cx = size / 2;
        const cy = size / 2;
        const circ = 2 * Math.PI * radius;
        let offset = 0;

        let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="${strokeWidth}" />`;

        dataset.forEach(d => {
            const ratio = d.value / total;
            const dash = `${ratio * circ} ${circ}`;
            const off = -offset * circ;
            svg += `
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none"
          stroke="${d.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${dash}" stroke-dashoffset="${off}">
          <title>${d.label}: ${d.value} Proposals</title>
        </circle>
      `;
            offset += ratio;
        });

        svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.3em" font-weight="700" font-size="16" fill="#0f172a">${total}</text></svg>`;
        el.innerHTML = svg;
    }

    function renderBarChart(containerId, dataset) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const width = 460;
        const height = 200;
        const pad = 35;
        const barWidth = 32;
        const maxVal = Math.max(...dataset.map(d => d.val)) * 1.25;

        let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;

        for (let i = 0; i <= 4; i++) {
            const y = height - pad - (i * (height - 2 * pad) / 4);
            const val = Math.round((maxVal / 4) * i);
            svg += `<line x1="${pad}" y1="${y}" x2="${width - 10}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />`;
            svg += `<text x="${pad - 6}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end">₹${val}Cr</text>`;
        }

        const step = (width - 2 * pad) / dataset.length;
        dataset.forEach((d, idx) => {
            const x = pad + (idx * step) + (step - barWidth) / 2;
            const bHeight = (d.val / maxVal) * (height - 2 * pad);
            const y = height - pad - bHeight;

            svg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${bHeight}" rx="4" fill="#0284c7">
          <title>${d.year}: ₹${d.val} Crores</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${height - pad + 15}" font-size="10" fill="#475569" text-anchor="middle">${d.year}</text>
        <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" font-weight="700" fill="#0369a1" text-anchor="middle">${d.val}</text>
      `;
        });

        svg += `</svg>`;
        el.innerHTML = svg;
    }

    return { renderDonut, renderBarChart };
})();