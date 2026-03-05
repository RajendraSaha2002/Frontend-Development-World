/**
 * charts.js — DARPAN S3 Chart Engine
 * Pure Canvas-based charts. No external dependencies.
 * Charts: Line, Bar, Donut, Gauge, Area, Sparkline, Heatmap
 */

'use strict';

const DarpanCharts = (() => {

    /* ─── Palette ─────────────────────────────────────── */
    const COLORS = {
        primary  : '#1e90ff',
        success  : '#28c76f',
        warning  : '#ff9f43',
        danger   : '#ea5455',
        purple   : '#9c27b0',
        teal     : '#00cfe8',
        gray     : '#b0bec5',
        darkBg   : '#1a2035',
        gridLine : 'rgba(255,255,255,0.07)',
        text     : '#a8b8d8',
    };

    const PALETTE = [
        COLORS.primary, COLORS.success, COLORS.warning,
        COLORS.danger,  COLORS.purple,  COLORS.teal,
    ];

    /* ─── Utility ──────────────────────────────────────── */
    function getCanvas(id) {
        const el = document.getElementById(id);
        if (!el) { console.warn(`[DarpanCharts] Canvas #${id} not found`); return null; }
        return el;
    }

    function setupHiDPI(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width  = rect.width  * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return { ctx, w: rect.width, h: rect.height };
    }

    function hexToRgba(hex, a) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }

    function drawGrid(ctx, x, y, w, h, steps = 5) {
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        for (let i = 0; i <= steps; i++) {
            const yy = y + (h / steps) * i;
            ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
        }
    }

    function drawAxisLabels(ctx, labels, x, y, w, h) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const step = w / (labels.length - 1 || 1);
        labels.forEach((lbl, i) => {
            ctx.fillText(lbl, x + i * step, y + h + 14);
        });
    }

    function drawYLabels(ctx, min, max, x, y, h, steps = 5) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= steps; i++) {
            const val = max - ((max - min) / steps) * i;
            const yy  = y + (h / steps) * i;
            ctx.fillText(val % 1 === 0 ? val : val.toFixed(1), x - 6, yy + 3);
        }
    }

    function drawTitle(ctx, title, w) {
        ctx.fillStyle = '#e0e9ff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, w / 2, 18);
    }

    /* ─── Line / Area Chart ────────────────────────────── */
    /**
     * renderLineChart(canvasId, datasets, options)
     * datasets: [{ label, data:[nums], color }]
     * options:  { title, labels:[str], yMin, yMax, area:bool, smooth:bool }
     */
    function renderLineChart(id, datasets, opts = {}) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        const pad = { top: 36, right: 20, bottom: 36, left: 46 };
        const gw  = w - pad.left - pad.right;
        const gh  = h - pad.top  - pad.bottom;

        // Background
        ctx.fillStyle = COLORS.darkBg;
        ctx.fillRect(0, 0, w, h);

        if (opts.title) drawTitle(ctx, opts.title, w);

        const allVals = datasets.flatMap(d => d.data);
        const yMin  = opts.yMin !== undefined ? opts.yMin : Math.floor(Math.min(...allVals) * 0.9);
        const yMax  = opts.yMax !== undefined ? opts.yMax : Math.ceil( Math.max(...allVals) * 1.1);
        const range = yMax - yMin || 1;

        drawGrid(ctx, pad.left, pad.top, gw, gh);
        drawYLabels(ctx, yMin, yMax, pad.left, pad.top, gh);

        const labels = opts.labels || datasets[0].data.map((_, i) => i);
        drawAxisLabels(ctx, labels, pad.left, pad.top, gw, gh);

        datasets.forEach((ds, di) => {
            const color = ds.color || PALETTE[di % PALETTE.length];
            const pts   = ds.data.map((v, i) => ({
                x: pad.left + (gw / (ds.data.length - 1 || 1)) * i,
                y: pad.top  + gh - ((v - yMin) / range) * gh,
            }));

            // Area fill
            if (opts.area !== false) {
                const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gh);
                grad.addColorStop(0, hexToRgba(color, 0.35));
                grad.addColorStop(1, hexToRgba(color, 0.02));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pad.top + gh);
                pts.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.lineTo(pts[pts.length-1].x, pad.top + gh);
                ctx.closePath(); ctx.fill();
            }

            // Line
            ctx.strokeStyle = color;
            ctx.lineWidth   = 2;
            ctx.lineJoin    = 'round';
            ctx.beginPath();
            pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.stroke();

            // Dots
            pts.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = color; ctx.fill();
                ctx.strokeStyle = COLORS.darkBg; ctx.lineWidth = 1.5; ctx.stroke();
            });
        });

        // Legend
        if (datasets.length > 1) _drawLegend(ctx, datasets, w, h);
    }

    /* ─── Bar Chart ────────────────────────────────────── */
    /**
     * renderBarChart(canvasId, data, options)
     * data:    [{ label, value, color? }]
     * options: { title, yMax, horizontal:bool }
     */
    function renderBarChart(id, data, opts = {}) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        const pad = { top: 36, right: 20, bottom: 36, left: 46 };
        const gw  = w - pad.left - pad.right;
        const gh  = h - pad.top  - pad.bottom;

        ctx.fillStyle = COLORS.darkBg;
        ctx.fillRect(0, 0, w, h);

        if (opts.title) drawTitle(ctx, opts.title, w);

        const vals = data.map(d => d.value);
        const yMax = opts.yMax || Math.ceil(Math.max(...vals) * 1.15) || 1;

        drawGrid(ctx, pad.left, pad.top, gw, gh);
        drawYLabels(ctx, 0, yMax, pad.left, pad.top, gh);

        const gap    = 8;
        const bw     = (gw - gap * (data.length + 1)) / data.length;

        data.forEach((d, i) => {
            const color = d.color || PALETTE[i % PALETTE.length];
            const bh    = (d.value / yMax) * gh;
            const bx    = pad.left + gap + i * (bw + gap);
            const by    = pad.top  + gh - bh;

            // Bar gradient
            const grad = ctx.createLinearGradient(0, by, 0, by + bh);
            grad.addColorStop(0, hexToRgba(color, 0.95));
            grad.addColorStop(1, hexToRgba(color, 0.45));
            ctx.fillStyle = grad;

            const r = Math.min(4, bw / 2);
            ctx.beginPath();
            ctx.moveTo(bx + r, by);
            ctx.lineTo(bx + bw - r, by);
            ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
            ctx.lineTo(bx + bw, by + bh);
            ctx.lineTo(bx, by + bh);
            ctx.lineTo(bx, by + r);
            ctx.quadraticCurveTo(bx, by, bx + r, by);
            ctx.closePath(); ctx.fill();

            // Value label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.value, bx + bw / 2, by - 4);

            // X label
            ctx.fillStyle = COLORS.text;
            ctx.fillText(d.label, bx + bw / 2, pad.top + gh + 14);
        });
    }

    /* ─── Donut / Pie Chart ────────────────────────────── */
    /**
     * renderDonutChart(canvasId, segments, options)
     * segments: [{ label, value, color? }]
     * options:  { title, donut:bool, centerText }
     */
    function renderDonutChart(id, segments, opts = {}) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        ctx.fillStyle = COLORS.darkBg;
        ctx.fillRect(0, 0, w, h);

        if (opts.title) drawTitle(ctx, opts.title, w);

        const total  = segments.reduce((s, d) => s + d.value, 0) || 1;
        const cx     = w / 2;
        const cy     = h / 2 + 8;
        const radius = Math.min(w, h) * 0.35;
        const inner  = opts.donut !== false ? radius * 0.55 : 0;
        let   angle  = -Math.PI / 2;

        segments.forEach((seg, i) => {
            const color = seg.color || PALETTE[i % PALETTE.length];
            const slice = (seg.value / total) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + slice);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = COLORS.darkBg;
            ctx.lineWidth = 2; ctx.stroke();

            angle += slice;
        });

        // Donut hole
        if (inner > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, inner, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.darkBg; ctx.fill();

            if (opts.centerText) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(opts.centerText, cx, cy + 5);
            }
        }

        // Legend
        _drawLegend(ctx, segments.map((s,i) => ({
            label: `${s.label} (${Math.round(s.value/total*100)}%)`,
            color: s.color || PALETTE[i % PALETTE.length],
        })), w, h);
    }

    /* ─── Gauge Chart ──────────────────────────────────── */
    /**
     * renderGaugeChart(canvasId, value, options)
     * value:   0–100
     * options: { title, min, max, unit, thresholds:[{at,color}] }
     */
    function renderGaugeChart(id, value, opts = {}) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        ctx.fillStyle = COLORS.darkBg;
        ctx.fillRect(0, 0, w, h);

        if (opts.title) drawTitle(ctx, opts.title, w);

        const cx    = w / 2;
        const cy    = h * 0.62;
        const r     = Math.min(w * 0.38, h * 0.52);
        const start = Math.PI * 0.8;
        const end   = Math.PI * 2.2;
        const min   = opts.min || 0;
        const max   = opts.max || 100;
        const unit  = opts.unit || '%';

        // Track
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, end);
        ctx.strokeStyle = hexToRgba(COLORS.gray, 0.2);
        ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();

        // Color arcs (thresholds)
        const thresholds = opts.thresholds || [
            { at: 60,  color: COLORS.success },
            { at: 85,  color: COLORS.warning },
            { at: 100, color: COLORS.danger  },
        ];

        let prev = min;
        thresholds.forEach(t => {
            const s = start + ((prev - min)/(max - min)) * (end - start);
            const e = start + ((Math.min(t.at, max) - min)/(max - min)) * (end - start);
            ctx.beginPath(); ctx.arc(cx, cy, r, s, e);
            ctx.strokeStyle = hexToRgba(t.color, 0.25);
            ctx.lineWidth = 14; ctx.lineCap = 'butt'; ctx.stroke();
            prev = t.at;
        });

        // Value arc
        const pct = (value - min) / (max - min);
        const valEnd = start + pct * (end - start);
        let arcColor = COLORS.success;
        thresholds.forEach(t => { if (value >= (t.at * (max-min)/100 + min)) arcColor = t.color; });
        // simple color pick
        if (value > (max * 0.85)) arcColor = COLORS.danger;
        else if (value > (max * 0.6)) arcColor = COLORS.warning;

        const grd = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
        grd.addColorStop(0, COLORS.primary);
        grd.addColorStop(1, arcColor);

        ctx.beginPath(); ctx.arc(cx, cy, r, start, valEnd);
        ctx.strokeStyle = grd; ctx.lineWidth = 14;
        ctx.lineCap = 'round'; ctx.stroke();

        // Needle
        const needleAngle = start + pct * (end - start);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(needleAngle);
        ctx.beginPath();
        ctx.moveTo(-4, 0); ctx.lineTo(0, -(r * 0.75)); ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.restore();

        // Center dot
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2);
        ctx.fillStyle = '#fff'; ctx.fill();

        // Value text
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(r*0.38)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${value}${unit}`, cx, cy + r * 0.35);

        // Min / Max labels
        ctx.fillStyle = COLORS.text; ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(min, cx - r * 0.95, cy + 18);
        ctx.textAlign = 'right';
        ctx.fillText(max, cx + r * 0.95, cy + 18);
    }

    /* ─── Sparkline ────────────────────────────────────── */
    /**
     * renderSparkline(canvasId, data, color)
     */
    function renderSparkline(id, data, color = COLORS.primary) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        ctx.clearRect(0, 0, w, h);

        const min = Math.min(...data);
        const max = Math.max(...data) || 1;
        const range = max - min || 1;
        const pad = 3;

        const pts = data.map((v, i) => ({
            x: pad + (w - pad*2) / (data.length - 1 || 1) * i,
            y: pad + (h - pad*2) - ((v - min) / range) * (h - pad*2),
        }));

        // Area
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, hexToRgba(color, 0.4));
        grad.addColorStop(1, hexToRgba(color, 0.0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, h);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length-1].x, h);
        ctx.closePath(); ctx.fill();

        // Line
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }

    /* ─── Heatmap (for traffic / log density) ─────────── */
    /**
     * renderHeatmap(canvasId, matrix, options)
     * matrix: 2D array of values
     * options: { title, rowLabels, colLabels }
     */
    function renderHeatmap(id, matrix, opts = {}) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        ctx.fillStyle = COLORS.darkBg;
        ctx.fillRect(0, 0, w, h);

        if (opts.title) drawTitle(ctx, opts.title, w);

        const rows    = matrix.length;
        const cols    = matrix[0].length;
        const pad     = { top: 44, left: 52, right: 10, bottom: 24 };
        const cellW   = (w - pad.left - pad.right)  / cols;
        const cellH   = (h - pad.top  - pad.bottom) / rows;
        const allVals = matrix.flat();
        const minV    = Math.min(...allVals);
        const maxV    = Math.max(...allVals) || 1;

        matrix.forEach((row, ri) => {
            row.forEach((val, ci) => {
                const t  = (val - minV) / (maxV - minV);
                const r2 = Math.floor(30  + t * (234 - 30));
                const g2 = Math.floor(144 + t * (107 - 144));
                const b2 = Math.floor(255 + t * (69  - 255));
                ctx.fillStyle = `rgb(${r2},${g2},${b2})`;
                const x = pad.left + ci * cellW;
                const y = pad.top  + ri * cellH;
                ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

                // value
                ctx.fillStyle = t > 0.55 ? '#111' : '#eee';
                ctx.font = '9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(val, x + cellW/2, y + cellH/2 + 3);
            });
        });

        // Row labels
        if (opts.rowLabels) {
            ctx.fillStyle = COLORS.text; ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'right';
            opts.rowLabels.forEach((lbl, i) => {
                ctx.fillText(lbl, pad.left - 4, pad.top + i * cellH + cellH/2 + 3);
            });
        }

        // Col labels
        if (opts.colLabels) {
            ctx.fillStyle = COLORS.text; ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            opts.colLabels.forEach((lbl, i) => {
                ctx.fillText(lbl, pad.left + i * cellW + cellW/2, pad.top - 6);
            });
        }
    }

    /* ─── Stacked Bar ──────────────────────────────────── */
    /**
     * renderStackedBar(canvasId, categories, series, options)
     * categories: ['Jan','Feb',...]
     * series:     [{ label, data:[nums], color? }]
     */
    function renderStackedBar(id, categories, series, opts = {}) {
        const canvas = getCanvas(id);
        if (!canvas) return;
        const { ctx, w, h } = setupHiDPI(canvas);

        const pad = { top: 36, right: 20, bottom: 36, left: 46 };
        const gw  = w - pad.left - pad.right;
        const gh  = h - pad.top  - pad.bottom;

        ctx.fillStyle = COLORS.darkBg; ctx.fillRect(0, 0, w, h);
        if (opts.title) drawTitle(ctx, opts.title, w);

        const totals = categories.map((_, i) => series.reduce((s,se) => s + se.data[i], 0));
        const yMax   = Math.ceil(Math.max(...totals) * 1.1) || 1;

        drawGrid(ctx, pad.left, pad.top, gw, gh);
        drawYLabels(ctx, 0, yMax, pad.left, pad.top, gh);

        const gap = 10;
        const bw  = (gw - gap*(categories.length+1)) / categories.length;

        categories.forEach((cat, ci) => {
            let stackY = pad.top + gh;
            series.forEach((s, si) => {
                const color = s.color || PALETTE[si % PALETTE.length];
                const bh    = (s.data[ci] / yMax) * gh;
                const bx    = pad.left + gap + ci*(bw+gap);
                stackY -= bh;
                ctx.fillStyle = hexToRgba(color, 0.85);
                ctx.fillRect(bx, stackY, bw, bh);
            });
            ctx.fillStyle = COLORS.text; ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(cat, pad.left + gap + ci*(bw+gap) + bw/2, pad.top + gh + 14);
        });

        _drawLegend(ctx, series.map((s,i) => ({
            label: s.label, color: s.color || PALETTE[i%PALETTE.length],
        })), w, h);
    }

    /* ─── Internal Legend ──────────────────────────────── */
    function _drawLegend(ctx, items, w, h) {
        const itemW = 100;
        const startX = (w - items.length * itemW) / 2;
        const y = h - 12;
        items.forEach((item, i) => {
            const x = startX + i * itemW;
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y - 7, 10, 10);
            ctx.fillStyle = COLORS.text;
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'left';
            const lbl = item.label || item.name || '';
            ctx.fillText(lbl.length > 10 ? lbl.slice(0,9)+'…' : lbl, x + 13, y + 2);
        });
    }

    /* ─── Animated Counter ─────────────────────────────── */
    /**
     * animateCounter(elementId, from, to, duration, suffix)
     */
    function animateCounter(id, from, to, duration = 1200, suffix = '') {
        const el = document.getElementById(id);
        if (!el) return;
        const start  = performance.now();
        const range  = to - from;
        function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(from + range * ease) + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ─── Resize Observer helper ───────────────────────── */
    /**
     * watchResize(canvasId, renderFn)
     * Re-calls renderFn whenever the canvas container resizes.
     */
    function watchResize(id, renderFn) {
        const canvas = getCanvas(id);
        if (!canvas || !window.ResizeObserver) return;
        const obs = new ResizeObserver(() => renderFn());
        obs.observe(canvas.parentElement || canvas);
        return obs;
    }

    /* ─── Public API ───────────────────────────────────── */
    return {
        COLORS,
        PALETTE,
        renderLineChart,
        renderBarChart,
        renderDonutChart,
        renderGaugeChart,
        renderSparkline,
        renderHeatmap,
        renderStackedBar,
        animateCounter,
        watchResize,
        hexToRgba,
    };

})();

// Make available globally
window.DarpanCharts = DarpanCharts;