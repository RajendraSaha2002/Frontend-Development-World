/* ================================================================
   charts.js  –  All Canvas-based chart renderers for CTMS
   ================================================================ */

// ════════════════════════════════════════════════════════════════
//  THREAT MAP  (animated attack arcs on a world map grid)
// ════════════════════════════════════════════════════════════════
class ThreatMap {
    constructor(canvasId, w, h) {
        this.canvas  = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx     = this.canvas.getContext('2d');
        this.w       = w || this.canvas.width;
        this.h       = h || this.canvas.height;
        this.canvas.width  = this.w;
        this.canvas.height = this.h;
        this.arcs    = [];
        this.paused  = false;
        this.animId  = null;
        this.target  = { x: this.w * 0.70, y: this.h * 0.42 }; // India
        this.loop    = this.loop.bind(this);
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0,212,255,0.06)';
        ctx.lineWidth   = 0.5;
        // Lat lines
        for (let y = 0; y <= this.h; y += this.h / 9) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.w, y); ctx.stroke();
        }
        // Lon lines
        for (let x = 0; x <= this.w; x += this.w / 18) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.h); ctx.stroke();
        }
    }

    drawLandmasses() {
        const ctx = this.ctx, w = this.w, h = this.h;
        ctx.fillStyle   = 'rgba(0,212,255,0.07)';
        ctx.strokeStyle = 'rgba(0,212,255,0.25)';
        ctx.lineWidth   = 0.8;

        const continents = [
            // North America
            [[0.05,0.18],[0.28,0.18],[0.28,0.55],[0.14,0.60],[0.05,0.50]],
            // South America
            [[0.22,0.55],[0.35,0.55],[0.38,0.82],[0.20,0.85]],
            // Europe
            [[0.46,0.18],[0.62,0.18],[0.64,0.35],[0.46,0.38]],
            // Africa
            [[0.46,0.38],[0.63,0.38],[0.60,0.75],[0.44,0.72]],
            // Asia
            [[0.62,0.15],[0.92,0.15],[0.92,0.55],[0.62,0.52]],
            // Australia
            [[0.78,0.58],[0.92,0.58],[0.92,0.74],[0.78,0.74]]
        ];

        continents.forEach(pts => {
            ctx.beginPath();
            ctx.moveTo(pts[0][0]*w, pts[0][1]*h);
            pts.slice(1).forEach(p => ctx.lineTo(p[0]*w, p[1]*h));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }

    drawCountryDots() {
        const ctx = this.ctx, w = this.w, h = this.h;
        COUNTRIES.forEach(c => {
            const x = c.x * w, y = c.y * h;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = (c.name === 'India') ? '#00ff88' : '#00d4ff';
            ctx.fill();
            // Pulse ring on India
            if (c.name === 'India') {
                const r = 10 + 4 * Math.sin(Date.now() / 400);
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0,255,136,0.4)';
                ctx.lineWidth   = 1.5;
                ctx.stroke();
            }
        });
    }

    spawnArc() {
        const src = COUNTRIES[Math.floor(Math.random() * (COUNTRIES.length - 1))];
        const sev = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
        const colors = { critical:'#ff3b3b', high:'#ff8c00', medium:'#ffd700', low:'#00ff88' };
        this.arcs.push({
            sx: src.x * this.w, sy: src.y * this.h,
            ex: this.target.x,  ey: this.target.y,
            progress: 0, speed: 0.008 + Math.random() * 0.01,
            color: colors[sev],
            sev,
            trail: []
        });
    }

    drawArcs() {
        const ctx = this.ctx;
        this.arcs.forEach((a, i) => {
            if (!this.paused) a.progress = Math.min(1, a.progress + a.speed);

            // Bezier control point
            const cx = (a.sx + a.ex) / 2 - (a.sy - a.ey) * 0.3;
            const cy = (a.sy + a.ey) / 2 - Math.abs(a.sx - a.ex) * 0.3;

            // Get current point along bezier
            const t  = a.progress;
            const px = (1-t)*(1-t)*a.sx + 2*(1-t)*t*cx + t*t*a.ex;
            const py = (1-t)*(1-t)*a.sy + 2*(1-t)*t*cy + t*t*a.ey;

            a.trail.push({ x:px, y:py, t });
            if (a.trail.length > 30) a.trail.shift();

            // Draw trail
            if (a.trail.length > 1) {
                for (let j = 1; j < a.trail.length; j++) {
                    const alpha = j / a.trail.length;
                    ctx.beginPath();
                    ctx.moveTo(a.trail[j-1].x, a.trail[j-1].y);
                    ctx.lineTo(a.trail[j].x,   a.trail[j].y);
                    ctx.strokeStyle = a.color + Math.floor(alpha*255).toString(16).padStart(2,'0');
                    ctx.lineWidth   = 1.5 * alpha;
                    ctx.stroke();
                }
            }

            // Draw head dot
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = a.color;
            ctx.shadowColor = a.color;
            ctx.shadowBlur  = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Impact flash at target
            if (a.progress >= 1) {
                const r = Math.random() * 10 + 4;
                ctx.beginPath();
                ctx.arc(a.ex, a.ey, r, 0, Math.PI * 2);
                ctx.strokeStyle = a.color + '88';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Remove finished arcs
            if (a.progress >= 1 && a.trail.length === 0) {
                this.arcs.splice(i, 1);
            }
        });
    }

    loop() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);
        ctx.fillStyle = '#080d14';
        ctx.fillRect(0, 0, this.w, this.h);

        this.drawGrid();
        this.drawLandmasses();
        this.drawCountryDots();
        this.drawArcs();

        // Spawn arcs
        if (!this.paused && Math.random() < 0.03 && this.arcs.length < 12) {
            this.spawnArc();
        }

        this.animId = requestAnimationFrame(this.loop);
    }

    start() { this.loop(); }
    pause() { this.paused = !this.paused; }
    stop()  { cancelAnimationFrame(this.animId); }
}

// ════════════════════════════════════════════════════════════════
//  DONUT CHART
// ════════════════════════════════════════════════════════════════
function drawDonut(canvasId, data, legendId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2 - 10;
    const outer = Math.min(w, h) * 0.38;
    const inner = outer * 0.58;

    ctx.clearRect(0, 0, w, h);

    const total = data.reduce((s, d) => s + d.pct, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(d => {
        const slice = (d.pct / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outer, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Separator
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outer, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.strokeStyle = '#080d14';
        ctx.lineWidth   = 2;
        ctx.stroke();

        startAngle += slice;
    });

    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = '#080d14';
    ctx.fill();

    // Center label
    ctx.fillStyle   = '#cdd6f4';
    ctx.font        = 'bold 13px Segoe UI';
    ctx.textAlign   = 'center';
    ctx.fillText('Sectors', cx, cy);
    ctx.font        = '11px Segoe UI';
    ctx.fillStyle   = '#5a7a9a';
    ctx.fillText(data.length + ' Types', cx, cy + 16);

    // Legend
    if (legendId) {
        const legendEl = document.getElementById(legendId);
        if (legendEl) {
            legendEl.innerHTML = data.map(d =>
                `<div class="dl-item">
          <div class="dl-dot" style="background:${d.color}"></div>
          <span>${d.name} ${d.pct}%</span>
        </div>`
            ).join('');
        }
    }
}

// ════════════════════════════════════════════════════════════════
//  BAR CHART  (malware families / monthly)
// ════════════════════════════════════════════════════════════════
function drawBar(canvasId, data, xKey, yKey, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { top:20, right:14, bottom:40, left:40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top  - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, 0, w, h);

    const vals   = data.map(d => d[yKey]);
    const maxVal = Math.max(...vals);
    const barW   = Math.max(4, (chartW / data.length) - 6);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + chartH - (i / 4) * chartH;
        ctx.strokeStyle = 'rgba(0,212,255,0.08)';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + chartW, y);
        ctx.stroke();

        ctx.fillStyle = '#3a5a7a';
        ctx.font      = '10px Consolas';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((i / 4) * maxVal), pad.left - 4, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
        const x    = pad.left + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
        const barH = (d[yKey] / maxVal) * chartH;
        const y    = pad.top + chartH - barH;
        const c    = (typeof color === 'function') ? color(d, i) : (d.color || color || '#00d4ff');

        // Shadow glow
        ctx.shadowColor = c;
        ctx.shadowBlur  = 8;

        // Gradient bar
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0,   c);
        grad.addColorStop(0.7, c + '99');
        grad.addColorStop(1,   c + '22');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barW, barH);
        ctx.shadowBlur = 0;

        // Bar top value
        ctx.fillStyle = '#cdd6f4';
        ctx.font      = '9px Consolas';
        ctx.textAlign = 'center';
        ctx.fillText(d[yKey], x + barW / 2, y - 4);

        // X label
        ctx.fillStyle = '#5a7a9a';
        ctx.font      = '9px Segoe UI';
        const label = String(d[xKey]);
        ctx.fillText(label.length > 8 ? label.slice(0,8) : label, x + barW / 2, pad.top + chartH + 14);
    });
}

// ════════════════════════════════════════════════════════════════
//  LINE CHART  (trend / risk)
// ════════════════════════════════════════════════════════════════
function drawLine(canvasId, dataArr, label, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { top:16, right:16, bottom:26, left:40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top  - pad.bottom;
    const maxVal = Math.max(...dataArr);
    const minVal = Math.min(...dataArr);
    const range  = maxVal - minVal || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, 0, w, h);

    const c    = color || '#00d4ff';
    const step = chartW / (dataArr.length - 1);

    const px = i => pad.left + i * step;
    const py = v => pad.top  + chartH - ((v - minVal) / range) * chartH;

    // Grid
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + (i / 4) * chartH;
        ctx.strokeStyle = 'rgba(0,212,255,0.07)';
        ctx.lineWidth   = 0.5;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
        const val = maxVal - (i / 4) * range;
        ctx.fillStyle = '#3a5a7a'; ctx.font='10px Consolas'; ctx.textAlign='right';
        ctx.fillText(Math.round(val), pad.left - 4, y + 4);
    }

    // Fill area under line
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0,   c + '44');
    grad.addColorStop(1,   c + '00');

    ctx.beginPath();
    ctx.moveTo(px(0), py(dataArr[0]));
    dataArr.forEach((v, i) => {
        if (i === 0) return;
        const x0 = px(i-1), y0 = py(dataArr[i-1]);
        const x1 = px(i),   y1 = py(v);
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
    });
    ctx.lineTo(px(dataArr.length - 1), pad.top + chartH);
    ctx.lineTo(px(0), pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(px(0), py(dataArr[0]));
    dataArr.forEach((v, i) => {
        if (i === 0) return;
        const x0 = px(i-1), y0 = py(dataArr[i-1]);
        const x1 = px(i),   y1 = py(v);
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
    });
    ctx.strokeStyle = c;
    ctx.lineWidth   = 2;
    ctx.shadowColor = c;
    ctx.shadowBlur  = 6;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Dots on latest point
    const last = dataArr.length - 1;
    ctx.beginPath();
    ctx.arc(px(last), py(dataArr[last]), 4, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.shadowColor = c; ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // X labels (every 4th)
    ctx.fillStyle = '#3a5a7a'; ctx.font='9px Consolas'; ctx.textAlign='center';
    dataArr.forEach((v, i) => {
        if (i % 4 === 0) ctx.fillText(String(i).padStart(2,'0')+'h', px(i), pad.top + chartH + 16);
    });
}