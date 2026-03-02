/* ================================================================
   charts.js  –  Canvas chart renderers for DEMS
   ================================================================ */

// ── Helpers ───────────────────────────────────────────────────────
function clearCanvas(id) {
    const c = document.getElementById(id);
    if (!c) return null;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#1c2330';
    ctx.fillRect(0, 0, c.width, c.height);
    return { ctx, w: c.width, h: c.height };
}

function drawGrid(ctx, x0, y0, w, h, steps, color) {
    ctx.strokeStyle = color || 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= steps; i++) {
        const y = y0 + (i / steps) * h;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    }
}

// ════════════════════════════════════════════════════════════════
//  STACKED BAR CHART – Case Status by Month
// ════════════════════════════════════════════════════════════════
function drawCaseStatusBar(canvasId) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const pad = { top:30, right:120, bottom:40, left:40 };
    const cW  = W - pad.left - pad.right;
    const cH  = H - pad.top  - pad.bottom;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#1c2330'; ctx.fillRect(0,0,W,H);

    const data   = CASE_STATUS_DATA;
    const keys   = ['open','investigation','review','closed'];
    const colors = { open:'#f85149', investigation:'#388bfd', review:'#d29922', closed:'#3fb950' };
    const labels = { open:'Open', investigation:'Under Investigation', review:'Pending Review', closed:'Closed' };
    const maxVal = Math.max(...data.map(d => d.open + d.investigation + d.review + d.closed));
    const barW   = Math.max(4, cW / data.length - 6);

    drawGrid(ctx, pad.left, pad.top, cW, cH, 5);

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const y = pad.top + cH - (i / 5) * cH;
        ctx.fillStyle = '#484f58'; ctx.font = '9px Consolas'; ctx.textAlign = 'right';
        ctx.fillText(Math.round((i / 5) * maxVal), pad.left - 4, y + 3);
    }

    // Stacked bars
    data.forEach((d, i) => {
        const x   = pad.left + i * (cW / data.length) + (cW / data.length - barW) / 2;
        let yOff  = 0;
        keys.forEach(k => {
            const segH = (d[k] / maxVal) * cH;
            const y    = pad.top + cH - yOff - segH;
            ctx.fillStyle = colors[k];
            ctx.fillRect(x, y, barW, segH);
            yOff += segH;
        });
        // X label
        ctx.fillStyle = '#484f58'; ctx.font = '9px Segoe UI'; ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barW / 2, pad.top + cH + 14);
    });

    // Legend
    let lx = W - pad.right + 16;
    let ly = pad.top;
    keys.forEach(k => {
        ctx.fillStyle = colors[k];
        ctx.fillRect(lx, ly, 10, 10);
        ctx.fillStyle = '#7d8590'; ctx.font = '10px Segoe UI'; ctx.textAlign = 'left';
        ctx.fillText(labels[k], lx + 14, ly + 9);
        ly += 18;
    });
}

// ════════════════════════════════════════════════════════════════
//  DONUT – Evidence by Type
// ════════════════════════════════════════════════════════════════
function drawEvidenceDonut(canvasId, legendId) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1c2330'; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2 - 4;
    const outer = Math.min(W, H) * 0.38;
    const inner = outer * 0.60;
    const total = EVIDENCE_TYPES.reduce((s, d) => s + d.pct, 0);
    let angle   = -Math.PI / 2;

    EVIDENCE_TYPES.forEach(d => {
        const slice = (d.pct / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outer, angle, angle + slice);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color; ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Separator
        ctx.strokeStyle = '#1c2330'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,outer,angle,angle+slice); ctx.closePath(); ctx.stroke();
        angle += slice;
    });

    // Hole
    ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = '#1c2330'; ctx.fill();

    // Center text
    ctx.fillStyle = '#e6edf3'; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText('Evidence', cx, cy - 4);
    ctx.font = '10px Segoe UI'; ctx.fillStyle = '#7d8590';
    ctx.fillText('7 Types', cx, cy + 12);

    // Legend
    const leg = document.getElementById(legendId);
    if (leg) {
        leg.innerHTML = EVIDENCE_TYPES.map(d =>
            `<div class="dl-item">
        <div class="dl-dot" style="background:${d.color}"></div>
        <span>${d.name} (${d.pct}%)</span>
      </div>`).join('');
    }
}

// ════════════════════════════════════════════════════════════════
//  GAUGE – SLA Compliance
// ════════════════════════════════════════════════════════════════
function drawSLAGauge(canvasId) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1c2330'; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H - 24;
    const r  = Math.min(W, H) * 0.60;

    // Compliance value
    const compliance = 87.4;
    const startA = Math.PI;
    const endA   = Math.PI + (compliance / 100) * Math.PI;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#21262d'; ctx.lineWidth = 22; ctx.stroke();

    // Zones
    const zones = [
        { from:0,  to:0.50, color:'#f85149' },  // Red 0-50%
        { from:0.50,to:0.75, color:'#d29922' },  // Yellow 50-75%
        { from:0.75,to:1.0,  color:'#3fb950' }   // Green 75-100%
    ];
    zones.forEach(z => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI + z.from * Math.PI, Math.PI + z.to * Math.PI);
        ctx.strokeStyle = z.color + '44'; ctx.lineWidth = 22; ctx.stroke();
    });

    // Value arc
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, '#f85149');
    grad.addColorStop(0.5, '#d29922');
    grad.addColorStop(1, '#3fb950');
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = grad; ctx.lineWidth = 20;
    ctx.lineCap = 'round'; ctx.stroke();

    // Needle
    const needleAngle = startA + (compliance / 100) * Math.PI;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-(r - 20), 0);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();

    // Center circle
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();

    // Value text
    ctx.fillStyle = '#e6edf3'; ctx.font = 'bold 22px Consolas'; ctx.textAlign = 'center';
    ctx.fillText(compliance + '%', cx, cy - 10);

    // Label
    const lbl = document.getElementById('gaugeLabel');
    if (lbl) lbl.textContent = `SLA Compliance: ${compliance}% | Breached: 12 cases`;
}

// ════════════════════════════════════════════════════════════════
//  LINE CHART – Monthly Case Intake
// ════════════════════════════════════════════════════════════════
function drawMonthlyLine(canvasId) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const pad = { top:20, right:16, bottom:30, left:36 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top  - pad.bottom;
    const data   = MONTHLY_CASES;
    const labels = MONTHLY_LABELS;
    const maxV   = Math.max(...data) + 5;
    const minV   = 0;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#1c2330'; ctx.fillRect(0,0,W,H);

    const px = i => pad.left + (i / (data.length - 1)) * cW;
    const py = v => pad.top  + cH - ((v - minV) / (maxV - minV)) * cH;

    drawGrid(ctx, pad.left, pad.top, cW, cH, 5);

    // Y labels
    for (let i = 0; i <= 5; i++) {
        const v = Math.round((i / 5) * maxV);
        const y = pad.top + cH - (i / 5) * cH;
        ctx.fillStyle = '#484f58'; ctx.font = '9px Consolas'; ctx.textAlign = 'right';
        ctx.fillText(v, pad.left - 4, y + 3);
    }

    // Fill area
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, '#1f6feb55'); grad.addColorStop(1, '#1f6feb00');
    ctx.beginPath();
    ctx.moveTo(px(0), py(data[0]));
    data.forEach((v, i) => {
        if (!i) return;
        const x0 = px(i-1), y0 = py(data[i-1]), x1 = px(i), y1 = py(v);
        ctx.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
    });
    ctx.lineTo(px(data.length-1), pad.top+cH);
    ctx.lineTo(px(0), pad.top+cH);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(px(0), py(data[0]));
    data.forEach((v, i) => {
        if (!i) return;
        const x0 = px(i-1), y0 = py(data[i-1]), x1 = px(i), y1 = py(v);
        ctx.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
    });
    ctx.strokeStyle = '#388bfd'; ctx.lineWidth = 2;
    ctx.shadowColor = '#388bfd'; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

    // Dots + values
    data.forEach((v, i) => {
        ctx.beginPath(); ctx.arc(px(i), py(v), 3.5, 0, Math.PI*2);
        ctx.fillStyle = '#388bfd'; ctx.fill();
        ctx.fillStyle = '#e6edf3'; ctx.font = '9px Consolas'; ctx.textAlign = 'center';
        ctx.fillText(v, px(i), py(v) - 8);
    });

    // X labels
    labels.forEach((l, i) => {
        ctx.fillStyle = '#484f58'; ctx.font = '9px Segoe UI'; ctx.textAlign = 'center';
        ctx.fillText(l, px(i), pad.top + cH + 16);
    });
}

// ════════════════════════════════════════════════════════════════
//  LIFECYCLE BAR
// ════════════════════════════════════════════════════════════════
function drawLifecycleBar(canvasId) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const pad = { top:20, right:16, bottom:50, left:44 };
    const cW  = W - pad.left - pad.right;
    const cH  = H - pad.top  - pad.bottom;
    const data = LIFECYCLE_STATUS;
    const maxV = Math.max(...data.map(d => d.count));
    const barW = Math.max(6, cW / data.length - 10);
    const colors = ['#388bfd','#1f6feb','#79c0ff','#3fb950','#d29922','#3fb950','#484f58'];

    ctx.clearRect(0,0,W,H); ctx.fillStyle = '#1c2330'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx, pad.left, pad.top, cW, cH, 5);

    for (let i=0;i<=5;i++) {
        ctx.fillStyle='#484f58';ctx.font='9px Consolas';ctx.textAlign='right';
        ctx.fillText(Math.round((i/5)*maxV), pad.left-4, pad.top+cH-(i/5)*cH+3);
    }

    data.forEach((d, i) => {
        const x    = pad.left + i*(cW/data.length) + (cW/data.length - barW)/2;
        const barH = (d.count / maxV) * cH;
        const y    = pad.top + cH - barH;
        const col  = colors[i];
        const grad = ctx.createLinearGradient(x, y, x, y+barH);
        grad.addColorStop(0, col); grad.addColorStop(1, col+'33');
        ctx.shadowColor = col; ctx.shadowBlur = 8;
        ctx.fillStyle = grad; ctx.fillRect(x, y, barW, barH);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e6edf3'; ctx.font='9px Consolas'; ctx.textAlign='center';
        ctx.fillText(d.count, x+barW/2, y-5);
        ctx.fillStyle = '#7d8590'; ctx.font='9px Segoe UI';
        // Wrap long labels
        const lbl = d.label.replace(' ','\n');
        lbl.split('\n').forEach((ln, j) => {
            ctx.fillText(ln, x+barW/2, pad.top+cH+16+j*12);
        });
    });
}

// ════════════════════════════════════════════════════════════════
//  SLA PERFORMANCE BAR (grouped)
// ════════════════════════════════════════════════════════════════
function drawSLABar(canvasId) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const pad = { top:20, right:120, bottom:40, left:36 };
    const cW  = W - pad.left - pad.right;
    const cH  = H - pad.top  - pad.bottom;
    const data = SLA_PERFORMANCE;
    const groupW = cW / data.length;
    const barW   = Math.max(8, groupW / 3 - 3);
    const colors = { compliant:'#3fb950', warning:'#d29922', breached:'#f85149' };
    const keys   = ['compliant','warning','breached'];

    ctx.clearRect(0,0,W,H); ctx.fillStyle = '#1c2330'; ctx.fillRect(0,0,W,H);
    drawGrid(ctx, pad.left, pad.top, cW, cH, 5);

    for (let i=0;i<=5;i++){
        ctx.fillStyle='#484f58';ctx.font='9px Consolas';ctx.textAlign='right';
        ctx.fillText(Math.round((i/5)*100)+'%', pad.left-4, pad.top+cH-(i/5)*cH+3);
    }

    data.forEach((d, i) => {
        keys.forEach((k, j) => {
            const x    = pad.left + i*groupW + j*(barW+3) + 4;
            const barH = (d[k] / 100) * cH;
            const y    = pad.top + cH - barH;
            ctx.fillStyle = colors[k]; ctx.fillRect(x, y, barW, barH);
            ctx.fillStyle='#e6edf3';ctx.font='8px Consolas';ctx.textAlign='center';
            ctx.fillText(d[k], x+barW/2, y-4);
        });
        ctx.fillStyle='#484f58';ctx.font='9px Segoe UI';ctx.textAlign='center';
        ctx.fillText(d.type, pad.left+i*groupW+groupW/2, pad.top+cH+16);
    });

    // Legend
    let ly = pad.top;
    keys.forEach(k => {
        ctx.fillStyle = colors[k]; ctx.fillRect(W-pad.right+16, ly, 10, 10);
        ctx.fillStyle = '#7d8590'; ctx.font='10px Segoe UI'; ctx.textAlign='left';
        ctx.fillText(k.charAt(0).toUpperCase()+k.slice(1), W-pad.right+30, ly+9);
        ly += 18;
    });
}