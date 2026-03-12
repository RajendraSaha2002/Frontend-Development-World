// ============================================================
// charts.js — Full Canvas-Based Chart Library
// Zero Dependencies | Pure HTML5 Canvas API
// Charts: Sparkline, Line, Bar, Donut, Gauge, Heatmap, Area
// ============================================================

const Charts = (() => {

    // ── Global Chart Registry (for redraw/resize) ────────────
    const registry = {};

    // ── Color Palette ────────────────────────────────────────
    const COLORS = {
        green:    '#00ff88',
        blue:     '#00b4ff',
        red:      '#ff3366',
        yellow:   '#ffcc00',
        purple:   '#9b59b6',
        orange:   '#ff6b35',
        cyan:     '#00e5ff',
        pink:     '#ff4da6',
        white:    '#e0e6f0',
        muted:    '#7a8ba0',
        dimmed:   '#4a5568',
        bg:       '#0a0e1a',
        bgCard:   '#141c2e',
        bgSecond: '#0f1623',
        border:   '#1e2d45',
    };

    // ── Utility Helpers ──────────────────────────────────────

    function getCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`[Charts] Canvas not found: #${canvasId}`);
            return null;
        }
        return canvas;
    }

    function getCtx(canvasId) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return null;
        return canvas.getContext('2d');
    }

    function clearCanvas(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    function getColorForPercent(percent) {
        if (percent >= 90) return COLORS.red;
        if (percent >= 75) return COLORS.yellow;
        if (percent >= 50) return COLORS.blue;
        return COLORS.green;
    }

    function drawGrid(ctx, w, h, cols = 6, rows = 5, color = COLORS.border) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);

        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = (i / rows) * h;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            const x = (i / cols) * w;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        ctx.restore();
    }

    function drawText(ctx, text, x, y, color = COLORS.muted, size = 10, align = 'left') {
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = `${size}px 'Courier New', monospace`;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function drawGlow(ctx, x, y, radius, color) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // ── Animate Helper ───────────────────────────────────────
    function animate(duration, drawFn) {
        const start = performance.now();
        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            drawFn(eased);
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    // ════════════════════════════════════════════════════════
    // 1. SPARKLINE CHART — Mini inline trend line
    // Usage: Charts.sparkline('canvas-id', [10,20,15,...], '#00ff88')
    // ════════════════════════════════════════════════════════
    function sparkline(canvasId, data, color = COLORS.green, filled = true) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        if (!data || data.length < 2) {
            drawText(ctx, 'No data', w / 2, h / 2, COLORS.dimmed, 9, 'center');
            return;
        }

        const max = Math.max(...data, 1);
        const min = Math.min(...data, 0);
        const range = max - min || 1;
        const pad = 4;

        const points = data.map((val, i) => ({
            x: pad + (i / (data.length - 1)) * (w - pad * 2),
            y: (h - pad) - ((val - min) / range) * (h - pad * 2),
        }));

        // Filled area
        if (filled) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, h);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, h);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, hexToRgba(color, 0.3));
            grad.addColorStop(1, hexToRgba(color, 0.0));
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineJoin = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Last point dot
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        registry[canvasId] = { type: 'sparkline', data, color, filled };
    }

    // ════════════════════════════════════════════════════════
    // 2. LINE CHART — Multi-dataset time series
    // Usage: Charts.lineChart('canvas-id', [[10,20,...],[5,15,...]], ['CPU','RAM'])
    // ════════════════════════════════════════════════════════
    function lineChart(canvasId, datasets = [], labels = [], yMax = 100) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const padLeft = 42;
        const padRight = 16;
        const padTop = 28;
        const padBottom = 28;
        const chartW = w - padLeft - padRight;
        const chartH = h - padTop - padBottom;

        const lineColors = [COLORS.green, COLORS.blue, COLORS.red, COLORS.yellow, COLORS.purple];

        // Background
        ctx.fillStyle = COLORS.bgCard;
        ctx.fillRect(0, 0, w, h);

        // Grid
        const gridRows = 5;
        for (let i = 0; i <= gridRows; i++) {
            const y = padTop + (i / gridRows) * chartH;
            const val = Math.round(yMax - (i / gridRows) * yMax);
            ctx.strokeStyle = COLORS.border;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + chartW, y);
            ctx.stroke();
            ctx.setLineDash([]);
            drawText(ctx, val + '%', padLeft - 6, y + 3, COLORS.dimmed, 9, 'right');
        }

        // X-axis labels (time indices)
        const maxPoints = Math.max(...datasets.map(d => d.length), 1);
        const xStep = Math.max(Math.floor(maxPoints / 6), 1);
        for (let i = 0; i < maxPoints; i += xStep) {
            const x = padLeft + (i / Math.max(maxPoints - 1, 1)) * chartW;
            drawText(ctx, String(i), x, h - 8, COLORS.dimmed, 8, 'center');
        }

        // Datasets
        datasets.forEach((data, di) => {
            if (!data || data.length < 2) return;
            const color = lineColors[di % lineColors.length];

            animate(600, (progress) => {
                // Redraw only this dataset's region
                const visibleCount = Math.ceil(data.length * progress);
                const visibleData = data.slice(0, Math.max(visibleCount, 2));

                const points = visibleData.map((val, i) => ({
                    x: padLeft + (i / Math.max(data.length - 1, 1)) * chartW,
                    y: padTop + chartH - clamp((val / yMax) * chartH, 0, chartH),
                }));

                // Area fill
                ctx.beginPath();
                ctx.moveTo(points[0].x, padTop + chartH);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.lineTo(points[points.length - 1].x, padTop + chartH);
                ctx.closePath();
                const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
                grad.addColorStop(0, hexToRgba(color, 0.15));
                grad.addColorStop(1, hexToRgba(color, 0.0));
                ctx.fillStyle = grad;
                ctx.fill();

                // Line
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.lineJoin = 'round';
                ctx.shadowColor = color;
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });
        });

        // Legend
        datasets.forEach((_, di) => {
            const color = lineColors[di % lineColors.length];
            const label = labels[di] || `Series ${di + 1}`;
            const lx = padLeft + di * 90;
            ctx.fillStyle = color;
            ctx.fillRect(lx, 8, 14, 3);
            drawText(ctx, label, lx + 18, 12, color, 9);
        });

        // Border
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(padLeft, padTop, chartW, chartH);

        registry[canvasId] = { type: 'lineChart', datasets, labels, yMax };
    }

    // ════════════════════════════════════════════════════════
    // 3. BAR CHART — Vertical bars
    // Usage: Charts.barChart('canvas-id', [45,80,30], ['CPU','RAM','Disk'])
    // ════════════════════════════════════════════════════════
    function barChart(canvasId, values = [], labels = [], yMax = 100) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const padLeft = 36;
        const padRight = 12;
        const padTop = 16;
        const padBottom = 32;
        const chartW = w - padLeft - padRight;
        const chartH = h - padTop - padBottom;
        const barColors = [COLORS.green, COLORS.blue, COLORS.red, COLORS.yellow, COLORS.purple, COLORS.orange];

        // Background
        ctx.fillStyle = COLORS.bgCard;
        ctx.fillRect(0, 0, w, h);

        // Grid
        for (let i = 0; i <= 5; i++) {
            const y = padTop + (i / 5) * chartH;
            const val = Math.round(yMax - (i / 5) * yMax);
            ctx.strokeStyle = COLORS.border;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + chartW, y);
            ctx.stroke();
            ctx.setLineDash([]);
            drawText(ctx, val + '%', padLeft - 4, y + 3, COLORS.dimmed, 9, 'right');
        }

        const barCount = values.length;
        const barWidth = (chartW / barCount) * 0.55;
        const barSpacing = chartW / barCount;

        animate(500, (progress) => {
            values.forEach((val, i) => {
                const color = barColors[i % barColors.length];
                const barH = clamp((val / yMax) * chartH, 0, chartH) * progress;
                const x = padLeft + i * barSpacing + (barSpacing - barWidth) / 2;
                const y = padTop + chartH - barH;

                // Shadow bar
                ctx.fillStyle = hexToRgba(color, 0.15);
                ctx.fillRect(x + 2, padTop, barWidth, chartH);

                // Main bar gradient
                const grad = ctx.createLinearGradient(x, y, x, padTop + chartH);
                grad.addColorStop(0, color);
                grad.addColorStop(1, hexToRgba(color, 0.3));
                ctx.fillStyle = grad;
                ctx.fillRect(x, y, barWidth, barH);

                // Top glow cap
                ctx.fillStyle = hexToRgba(color, 0.9);
                ctx.fillRect(x, y, barWidth, 3);

                // Value label on top
                drawText(ctx, val + '%', x + barWidth / 2, y - 5, color, 9, 'center');

                // X label at bottom
                const label = labels[i] || `Item ${i + 1}`;
                drawText(ctx, label, x + barWidth / 2, padTop + chartH + 18, COLORS.muted, 9, 'center');
            });
        });

        // Bottom axis line
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop + chartH);
        ctx.lineTo(padLeft + chartW, padTop + chartH);
        ctx.stroke();

        registry[canvasId] = { type: 'barChart', values, labels, yMax };
    }

    // ════════════════════════════════════════════════════════
    // 4. DONUT CHART — Circular percentage chart
    // Usage: Charts.donutChart('canvas-id', [60,25,15], ['Used','Free','Cache'])
    // ════════════════════════════════════════════════════════
    function donutChart(canvasId, values = [], labels = [], title = '') {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const cx = w / 2;
        const cy = h / 2;
        const outerR = Math.min(w, h) / 2 - 20;
        const innerR = outerR * 0.58;
        const sliceColors = [COLORS.green, COLORS.blue, COLORS.red, COLORS.yellow, COLORS.purple, COLORS.orange];

        const total = values.reduce((a, b) => a + b, 0) || 1;
        let startAngle = -Math.PI / 2;

        animate(700, (progress) => {
            clearCanvas(ctx, canvas);

            values.forEach((val, i) => {
                const sliceAngle = (val / total) * Math.PI * 2 * progress;
                const color = sliceColors[i % sliceColors.length];
                const endAngle = startAngle + sliceAngle;
                const midAngle = startAngle + sliceAngle / 2;

                // Outer slice
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, outerR, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Separator gap
                ctx.strokeStyle = COLORS.bg;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Percentage label on slice (if large enough)
                if (sliceAngle > 0.3) {
                    const lx = cx + (outerR * 0.75) * Math.cos(midAngle);
                    const ly = cy + (outerR * 0.75) * Math.sin(midAngle);
                    drawText(ctx, Math.round(val / total * 100) + '%', lx, ly + 4, COLORS.bg, 9, 'center');
                }

                if (progress >= 1) startAngle = endAngle; // only advance on final frame
            });

            // Reset and redraw properly on final frame
            if (progress >= 1) {
                clearCanvas(ctx, canvas);
                let angle = -Math.PI / 2;
                values.forEach((val, i) => {
                    const color = sliceColors[i % sliceColors.length];
                    const sliceAngle = (val / total) * Math.PI * 2;
                    const end = angle + sliceAngle;
                    const mid = angle + sliceAngle / 2;

                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, outerR, angle, end);
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = COLORS.bg;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    if (sliceAngle > 0.3) {
                        const lx = cx + (outerR * 0.75) * Math.cos(mid);
                        const ly = cy + (outerR * 0.75) * Math.sin(mid);
                        drawText(ctx, Math.round(val / total * 100) + '%', lx, ly + 4, COLORS.bg, 9, 'center');
                    }
                    angle = end;
                });
            }

            // Donut hole
            ctx.beginPath();
            ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.bgCard;
            ctx.fill();

            // Center title text
            if (title) {
                drawText(ctx, title, cx, cy - 6, COLORS.muted, 9, 'center');
            }
            const topVal = values[0] || 0;
            drawText(ctx, Math.round(topVal / total * 100) + '%', cx, cy + 10, sliceColors[0], 14, 'center');

            // Legend (right side)
            labels.forEach((lbl, i) => {
                const color = sliceColors[i % sliceColors.length];
                const ly = 16 + i * 18;
                ctx.fillStyle = color;
                ctx.fillRect(w - 90, ly, 10, 10);
                drawText(ctx, lbl, w - 76, ly + 9, COLORS.muted, 8);
            });
        });

        registry[canvasId] = { type: 'donutChart', values, labels, title };
    }

    // ════════════════════════════════════════════════════════
    // 5. GAUGE CHART — Speedometer style (0–100%)
    // Usage: Charts.gaugeChart('canvas-id', 75, 'CPU', '%')
    // ════════════════════════════════════════════════════════
    function gaugeChart(canvasId, value = 0, label = '', unit = '%') {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const cx = w / 2;
        const cy = h * 0.6;
        const radius = Math.min(w, h) * 0.4;
        const startAngle = Math.PI;
        const endAngle = Math.PI * 2;
        const color = getColorForPercent(value);

        animate(800, (progress) => {
            clearCanvas(ctx, canvas);

            const currentVal = value * progress;
            const fillAngle = startAngle + (currentVal / 100) * Math.PI;

            // Track (background arc)
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.strokeStyle = COLORS.border;
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Filled arc
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, fillAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Tick marks
            for (let i = 0; i <= 10; i++) {
                const tickAngle = startAngle + (i / 10) * Math.PI;
                const inner = radius - 20;
                const outer = radius - 10;
                ctx.beginPath();
                ctx.moveTo(
                    cx + inner * Math.cos(tickAngle),
                    cy + inner * Math.sin(tickAngle)
                );
                ctx.lineTo(
                    cx + outer * Math.cos(tickAngle),
                    cy + outer * Math.sin(tickAngle)
                );
                ctx.strokeStyle = i % 5 === 0 ? COLORS.muted : COLORS.dimmed;
                ctx.lineWidth = i % 5 === 0 ? 2 : 1;
                ctx.stroke();
            }

            // Needle
            const needleAngle = startAngle + (currentVal / 100) * Math.PI;
            const needleLen = radius - 22;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(needleAngle);
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(needleLen, 0);
            ctx.strokeStyle = COLORS.white;
            ctx.lineWidth = 2;
            ctx.shadowColor = COLORS.white;
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Needle pivot
            drawGlow(ctx, cx, cy, 5, color);

            // Value display
            drawText(ctx, Math.round(currentVal) + unit, cx, cy + 24, color, 20, 'center');
            if (label) drawText(ctx, label, cx, cy + 40, COLORS.muted, 10, 'center');

            // Scale labels
            drawText(ctx, '0',    cx - radius - 4, cy + 14, COLORS.dimmed, 8, 'center');
            drawText(ctx, '50',   cx,              cy - radius - 8, COLORS.dimmed, 8, 'center');
            drawText(ctx, '100',  cx + radius + 4, cy + 14, COLORS.dimmed, 8, 'center');
        });

        registry[canvasId] = { type: 'gaugeChart', value, label, unit };
    }

    // ════════════════════════════════════════════════════════
    // 6. AREA CHART — Stacked area (for network traffic etc.)
    // Usage: Charts.areaChart('canvas-id', {sent:[...], recv:[...]})
    // ════════════════════════════════════════════════════════
    function areaChart(canvasId, datasets = {}, yLabel = 'MB') {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const padLeft = 44;
        const padRight = 12;
        const padTop = 16;
        const padBottom = 28;
        const chartW = w - padLeft - padRight;
        const chartH = h - padTop - padBottom;

        const keys    = Object.keys(datasets);
        const allVals = keys.flatMap(k => datasets[k]);
        const yMax    = Math.max(...allVals, 1) * 1.15;

        const areaColors = {
            sent: COLORS.green,
            recv: COLORS.blue,
            upload: COLORS.green,
            download: COLORS.blue,
        };

        // Background
        ctx.fillStyle = COLORS.bgCard;
        ctx.fillRect(0, 0, w, h);

        // Grid
        for (let i = 0; i <= 5; i++) {
            const y = padTop + (i / 5) * chartH;
            const val = (yMax - (i / 5) * yMax).toFixed(1);
            ctx.strokeStyle = COLORS.border;
            ctx.lineWidth = 0.5;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + chartW, y);
            ctx.stroke();
            ctx.setLineDash([]);
            drawText(ctx, val, padLeft - 4, y + 3, COLORS.dimmed, 8, 'right');
        }

        // Y-axis label
        ctx.save();
        ctx.translate(10, padTop + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        drawText(ctx, yLabel, 0, 0, COLORS.muted, 8, 'center');
        ctx.restore();

        keys.forEach((key, ki) => {
            const data  = datasets[key];
            const color = areaColors[key] || [COLORS.green, COLORS.blue, COLORS.red][ki % 3];
            if (!data || data.length < 2) return;

            const points = data.map((val, i) => ({
                x: padLeft + (i / Math.max(data.length - 1, 1)) * chartW,
                y: padTop + chartH - clamp((val / yMax) * chartH, 0, chartH),
            }));

            animate(600, (progress) => {
                const visible = Math.max(Math.ceil(points.length * progress), 2);
                const pts = points.slice(0, visible);

                // Smooth bezier curve area
                ctx.beginPath();
                ctx.moveTo(pts[0].x, padTop + chartH);
                ctx.lineTo(pts[0].x, pts[0].y);

                for (let i = 1; i < pts.length; i++) {
                    const cpx = (pts[i - 1].x + pts[i].x) / 2;
                    ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
                }

                ctx.lineTo(pts[pts.length - 1].x, padTop + chartH);
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
                grad.addColorStop(0, hexToRgba(color, 0.35));
                grad.addColorStop(1, hexToRgba(color, 0.02));
                ctx.fillStyle = grad;
                ctx.fill();

                // Line
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    const cpx = (pts[i - 1].x + pts[i].x) / 2;
                    ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.shadowColor = color;
                ctx.shadowBlur = 5;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });
        });

        // Legend
        keys.forEach((key, i) => {
            const color = areaColors[key] || COLORS.green;
            const lx = padLeft + i * 100;
            ctx.fillStyle = color;
            ctx.fillRect(lx, 5, 14, 3);
            drawText(ctx, key, lx + 18, 10, color, 9);
        });

        // Border
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(padLeft, padTop, chartW, chartH);

        registry[canvasId] = { type: 'areaChart', datasets, yLabel };
    }

    // ════════════════════════════════════════════════════════
    // 7. HEATMAP CHART — Activity grid (like GitHub heatmap)
    // Usage: Charts.heatmap('canvas-id', [[0,1,3,2,...], ...], 7, 24)
    // ════════════════════════════════════════════════════════
    function heatmap(canvasId, data = [], rows = 7, cols = 24, title = 'Activity Heatmap') {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const padLeft = 30;
        const padTop = 20;
        const padBottom = 16;
        const cellW = (w - padLeft - 10) / cols;
        const cellH = (h - padTop - padBottom) / rows;

        const allVals = data.flat();
        const maxVal  = Math.max(...allVals, 1);

        // Title
        drawText(ctx, title, padLeft, 12, COLORS.muted, 9);

        // Row labels (Days)
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        data.forEach((row, ri) => {
            if (ri < dayLabels.length) {
                drawText(ctx, dayLabels[ri], padLeft - 4, padTop + ri * cellH + cellH / 2 + 3, COLORS.dimmed, 7, 'right');
            }

            row.forEach((val, ci) => {
                const x = padLeft + ci * cellW;
                const y = padTop + ri * cellH;
                const intensity = val / maxVal;

                // Cell background
                ctx.fillStyle = COLORS.bgSecond;
                ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

                // Value cell
                if (val > 0) {
                    const alpha = 0.15 + intensity * 0.85;
                    ctx.fillStyle = hexToRgba(COLORS.green, alpha);
                    ctx.shadowColor = COLORS.green;
                    ctx.shadowBlur = intensity > 0.7 ? 6 : 0;
                    ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
                    ctx.shadowBlur = 0;
                }

                // Tooltip on hover (store for later)
            });
        });

        // Col labels (Hours)
        for (let i = 0; i < cols; i += 4) {
            const x = padLeft + i * cellW + cellW / 2;
            drawText(ctx, i + 'h', x, h - 3, COLORS.dimmed, 7, 'center');
        }

        // Color scale legend
        const scaleX = w - 90;
        const scaleY = h - 12;
        drawText(ctx, 'Low', scaleX - 4, scaleY, COLORS.dimmed, 7, 'right');
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = hexToRgba(COLORS.green, 0.1 + i * 0.2);
            ctx.fillRect(scaleX + i * 12, scaleY - 9, 10, 9);
        }
        drawText(ctx, 'High', scaleX + 65, scaleY, COLORS.dimmed, 7);

        registry[canvasId] = { type: 'heatmap', data, rows, cols, title };
    }

    // ════════════════════════════════════════════════════════
    // 8. HORIZONTAL BAR CHART — For port/process comparison
    // Usage: Charts.horizontalBar('canvas-id', [80,60,40], ['HTTP','SSH','FTP'])
    // ════════════════════════════════════════════════════════
    function horizontalBar(canvasId, values = [], labels = [], xMax = 100) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const padLeft = 70;
        const padRight = 50;
        const padTop = 12;
        const chartW = w - padLeft - padRight;
        const rowH = (h - padTop) / Math.max(values.length, 1);
        const barH = rowH * 0.5;

        const barColors = [COLORS.green, COLORS.blue, COLORS.red, COLORS.yellow, COLORS.purple, COLORS.orange, COLORS.cyan];

        ctx.fillStyle = COLORS.bgCard;
        ctx.fillRect(0, 0, w, h);

        animate(500, (progress) => {
            // Clear chart area only (not labels)
            ctx.clearRect(padLeft, 0, chartW, h);

            values.forEach((val, i) => {
                const color = barColors[i % barColors.length];
                const barW  = clamp((val / xMax) * chartW, 0, chartW) * progress;
                const y     = padTop + i * rowH + (rowH - barH) / 2;

                // Background track
                ctx.fillStyle = hexToRgba(color, 0.08);
                ctx.fillRect(padLeft, y, chartW, barH);

                // Bar fill gradient
                const grad = ctx.createLinearGradient(padLeft, 0, padLeft + barW, 0);
                grad.addColorStop(0, hexToRgba(color, 0.5));
                grad.addColorStop(1, color);
                ctx.fillStyle = grad;
                ctx.fillRect(padLeft, y, barW, barH);

                // Right cap glow
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.fillRect(padLeft + barW - 3, y, 3, barH);
                ctx.shadowBlur = 0;

                // Value label at end of bar
                if (progress >= 1) {
                    drawText(ctx, val + (xMax === 100 ? '%' : ''), padLeft + barW + 6, y + barH / 2 + 3, color, 9);
                }
            });

            // Labels (left side)
            values.forEach((_, i) => {
                const y = padTop + i * rowH + rowH / 2 + 3;
                drawText(ctx, labels[i] || `Item ${i + 1}`, padLeft - 6, y, COLORS.muted, 9, 'right');
            });

            // Vertical grid lines
            for (let i = 0; i <= 4; i++) {
                const x = padLeft + (i / 4) * chartW;
                ctx.strokeStyle = COLORS.border;
                ctx.lineWidth = 0.5;
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.moveTo(x, padTop);
                ctx.lineTo(x, h);
                ctx.stroke();
                ctx.setLineDash([]);
                drawText(ctx, Math.round((i / 4) * xMax) + '', x, h - 3, COLORS.dimmed, 7, 'center');
            }
        });

        registry[canvasId] = { type: 'horizontalBar', values, labels, xMax };
    }

    // ════════════════════════════════════════════════════════
    // 9. PORT BAR — Visual port range indicator for scanner
    // Usage: Charts.portBar('canvas-id', [{port:22,service:'ssh'}, ...])
    // ════════════════════════════════════════════════════════
    function portBar(canvasId, ports = [], maxPort = 1024) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const padH = 12;
        const barY = h / 2 - 8;
        const barH = 16;

        // Background range bar
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, COLORS.bgSecond);
        grad.addColorStop(1, COLORS.bgCard);
        ctx.fillStyle = grad;
        ctx.fillRect(padH, barY, w - padH * 2, barH);
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(padH, barY, w - padH * 2, barH);

        // Port markers
        ports.forEach(p => {
            const x = padH + (p.port / maxPort) * (w - padH * 2);
            const color = p.port === 22 || p.port === 23 || p.port === 21 ? COLORS.red
                : p.port === 80 || p.port === 443 || p.port === 8080 ? COLORS.yellow
                    : COLORS.green;

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillRect(x - 2, barY - 4, 4, barH + 8);
            ctx.shadowBlur = 0;

            // Port label above
            drawText(ctx, p.port, x, barY - 8, color, 7, 'center');
        });

        // Scale labels
        drawText(ctx, '1', padH, h - 3, COLORS.dimmed, 7);
        drawText(ctx, '512', w / 2, h - 3, COLORS.dimmed, 7, 'center');
        drawText(ctx, String(maxPort), w - padH, h - 3, COLORS.dimmed, 7, 'right');

        // Legend
        [[COLORS.red, 'High Risk'], [COLORS.yellow, 'Medium'], [COLORS.green, 'Low']].forEach(([c, lbl], i) => {
            ctx.fillStyle = c;
            ctx.fillRect(padH + i * 80, 4, 8, 4);
            drawText(ctx, lbl, padH + i * 80 + 12, 10, c, 7);
        });

        registry[canvasId] = { type: 'portBar', ports, maxPort };
    }

    // ════════════════════════════════════════════════════════
    // 10. NETWORK MAP — Visual node/host topology
    // Usage: Charts.networkMap('canvas-id', ['192.168.1.1', ...])
    // ════════════════════════════════════════════════════════
    function networkMap(canvasId, hosts = [], gatewayIp = 'Gateway') {
        const canvas = getCanvas(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        clearCanvas(ctx, canvas);

        const cx = w / 2;
        const cy = h / 2;
        const maxHosts = Math.min(hosts.length, 20);
        const orbitR  = Math.min(cx, cy) - 32;

        // Animated pulse rings
        animate(1000, (progress) => {
            clearCanvas(ctx, canvas);

            // Pulse rings
            [1, 0.65, 0.35].forEach((scale, i) => {
                const r = orbitR * scale * progress;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = hexToRgba(COLORS.green, 0.06 + i * 0.04);
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 8]);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            // Gateway node (center)
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(COLORS.blue, 0.25);
            ctx.fill();
            ctx.strokeStyle = COLORS.blue;
            ctx.lineWidth = 2;
            ctx.shadowColor = COLORS.blue;
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
            drawText(ctx, 'GW', cx, cy + 4, COLORS.blue, 10, 'center');

            // Host nodes
            for (let i = 0; i < maxHosts; i++) {
                const angle = (i / maxHosts) * Math.PI * 2 - Math.PI / 2;
                const nx = cx + orbitR * Math.cos(angle);
                const ny = cy + orbitR * Math.sin(angle);
                const ip = hosts[i];

                // Connection line
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                const lineProgress = Math.min(progress * 2, 1);
                ctx.lineTo(
                    cx + (nx - cx) * lineProgress,
                    cy + (ny - cy) * lineProgress,
                );
                ctx.strokeStyle = hexToRgba(COLORS.green, 0.25);
                ctx.lineWidth = 1;
                ctx.stroke();

                if (progress > 0.5) {
                    // Host circle
                    const nodeOpacity = (progress - 0.5) * 2;
                    ctx.beginPath();
                    ctx.arc(nx, ny, 10, 0, Math.PI * 2);
                    ctx.fillStyle = hexToRgba(COLORS.green, 0.15 * nodeOpacity);
                    ctx.fill();
                    ctx.strokeStyle = hexToRgba(COLORS.green, nodeOpacity);
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = COLORS.green;
                    ctx.shadowBlur = 8 * nodeOpacity;
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // IP label
                    const lastOctet = String(ip).split('.').pop() || ip;
                    drawText(ctx, '.' + lastOctet, nx, ny + 4, hexToRgba(COLORS.white, nodeOpacity), 8, 'center');

                    // Full IP below for outer nodes
                    if (maxHosts <= 10) {
                        const lx = nx + 14 * Math.cos(angle);
                        const ly = ny + 14 * Math.sin(angle);
                        drawText(ctx, String(ip).split('.').slice(-2).join('.'), lx, ly, hexToRgba(COLORS.muted, nodeOpacity * 0.7), 7, 'center');
                    }
                }
            }
        });

        registry[canvasId] = { type: 'networkMap', hosts, gatewayIp };
    }

    // ════════════════════════════════════════════════════════
    // 11. REAL-TIME LINE — Live updating single line chart
    // Usage: const rt = Charts.realtimeLine('canvas-id', 'CPU %', '#00ff88')
    //        rt.push(newValue)   ← call this on each new data point
    // ════════════════════════════════════════════════════════
    function realtimeLine(canvasId, label = '', color = COLORS.green, maxPoints = 60) {
        const canvas = getCanvas(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        let buffer = [];

        const padLeft = 36;
        const padRight = 10;
        const padTop = 14;
        const padBottom = 20;
        const chartW = w - padLeft - padRight;
        const chartH = h - padTop - padBottom;

        function draw() {
            clearCanvas(ctx, canvas);

            // Background
            ctx.fillStyle = COLORS.bgCard;
            ctx.fillRect(0, 0, w, h);

            // Grid
            for (let i = 0; i <= 5; i++) {
                const y = padTop + (i / 5) * chartH;
                ctx.strokeStyle = COLORS.border;
                ctx.lineWidth = 0.5;
                ctx.setLineDash([2, 5]);
                ctx.beginPath();
                ctx.moveTo(padLeft, y);
                ctx.lineTo(padLeft + chartW, y);
                ctx.stroke();
                ctx.setLineDash([]);
                drawText(ctx, (100 - i * 20) + '%', padLeft - 4, y + 3, COLORS.dimmed, 8, 'right');
            }

            if (buffer.length < 2) return;

            const points = buffer.map((val, i) => ({
                x: padLeft + (i / Math.max(buffer.length - 1, 1)) * chartW,
                y: padTop + chartH - clamp((val / 100) * chartH, 0, chartH),
            }));

            // Area fill
            ctx.beginPath();
            ctx.moveTo(points[0].x, padTop + chartH);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, padTop + chartH);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
            grad.addColorStop(0, hexToRgba(color, 0.3));
            grad.addColorStop(1, hexToRgba(color, 0.0));
            ctx.fillStyle = grad;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Live dot at end
            const last = points[points.length - 1];
            drawGlow(ctx, last.x, last.y, 4, color);

            // Current value
            const curVal = buffer[buffer.length - 1];
            drawText(ctx, label + ': ' + curVal.toFixed(1) + '%', padLeft, padTop - 3, color, 9);

            // Border
            ctx.strokeStyle = COLORS.border;
            ctx.lineWidth = 1;
            ctx.strokeRect(padLeft, padTop, chartW, chartH);
        }

        return {
            push(value) {
                buffer.push(parseFloat(value) || 0);
                if (buffer.length > maxPoints) buffer.shift();
                draw();
            },
            clear() {
                buffer = [];
                clearCanvas(ctx, canvas);
            },
            getData() {
                return [...buffer];
            }
        };
    }

    // ════════════════════════════════════════════════════════
    // 12. RESIZE HANDLER — Redraw all charts on window resize
    // ════════════════════════════════════════════════════════
    function handleResize() {
        Object.entries(registry).forEach(([id, config]) => {
            switch (config.type) {
                case 'sparkline':      sparkline(id, config.data, config.color, config.filled); break;
                case 'lineChart':      lineChart(id, config.datasets, config.labels, config.yMax); break;
                case 'barChart':       barChart(id, config.values, config.labels, config.yMax); break;
                case 'donutChart':     donutChart(id, config.values, config.labels, config.title); break;
                case 'gaugeChart':     gaugeChart(id, config.value, config.label, config.unit); break;
                case 'areaChart':      areaChart(id, config.datasets, config.yLabel); break;
                case 'heatmap':        heatmap(id, config.data, config.rows, config.cols, config.title); break;
                case 'horizontalBar':  horizontalBar(id, config.values, config.labels, config.xMax); break;
                case 'portBar':        portBar(id, config.ports, config.maxPort); break;
                case 'networkMap':     networkMap(id, config.hosts, config.gatewayIp); break;
            }
        });
    }

    window.addEventListener('resize', handleResize);

    // ── Public API ───────────────────────────────────────────
    return {
        sparkline,
        lineChart,
        barChart,
        donutChart,
        gaugeChart,
        areaChart,
        heatmap,
        horizontalBar,
        portBar,
        networkMap,
        realtimeLine,
        COLORS,
        redrawAll: handleResize,
    };

})();