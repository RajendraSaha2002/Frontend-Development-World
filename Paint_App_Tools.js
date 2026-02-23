/* ================================================================
   tools.js  –  All drawing tool logic for the Paint App
   ================================================================ */

// ── Flood Fill (Bucket Tool) ──────────────────────────────────────
function floodFill(ctx, canvas, startX, startY, fillColor) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data    = imgData.data;
    const w       = canvas.width;
    const h       = canvas.height;

    // Parse fill color into RGBA
    const tmp  = document.createElement('canvas').getContext('2d');
    tmp.fillStyle = fillColor;
    tmp.fillRect(0, 0, 1, 1);
    const fc = tmp.getImageData(0, 0, 1, 1).data;
    const [fr, fg, fb, fa] = [fc[0], fc[1], fc[2], fc[3]];

    // Get target color at click position
    const idx = (startY * w + startX) * 4;
    const [tr, tg, tb, ta] = [data[idx], data[idx+1], data[idx+2], data[idx+3]];

    // Don't fill if same color
    if (tr === fr && tg === fg && tb === fb && ta === fa) return;

    function match(i) {
        return data[i]===tr && data[i+1]===tg && data[i+2]===tb && data[i+3]===ta;
    }

    function paint(i) {
        data[i]=fr; data[i+1]=fg; data[i+2]=fb; data[i+3]=fa;
    }

    // BFS flood fill
    const stack = [[startX, startY]];
    const visited = new Uint8Array(w * h);

    while (stack.length) {
        const [x, y] = stack.pop();
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        const i = (y * w + x) * 4;
        if (visited[y * w + x] || !match(i)) continue;
        visited[y * w + x] = 1;
        paint(i);
        stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }

    ctx.putImageData(imgData, 0, 0);
}

// ── Eyedropper (Pick Color from Canvas) ──────────────────────────
function pickColor(ctx, x, y) {
    const p = ctx.getImageData(x, y, 1, 1).data;
    return '#' + [p[0], p[1], p[2]].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ── Draw Line ─────────────────────────────────────────────────────
function drawLine(ctx, x1, y1, x2, y2, color, size, alpha) {
    ctx.save();
    ctx.globalAlpha    = alpha;
    ctx.strokeStyle    = color;
    ctx.lineWidth      = size;
    ctx.lineCap        = 'round';
    ctx.lineJoin       = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

// ── Draw Rectangle ────────────────────────────────────────────────
function drawRect(ctx, x1, y1, x2, y2, color, size, alpha, filled) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = size;
    const rx = Math.min(x1, x2);
    const ry = Math.min(y1, y2);
    const rw = Math.abs(x2 - x1);
    const rh = Math.abs(y2 - y1);
    if (filled) ctx.fillRect(rx, ry, rw, rh);
    else        ctx.strokeRect(rx, ry, rw, rh);
    ctx.restore();
}

// ── Draw Circle ───────────────────────────────────────────────────
function drawCircle(ctx, x1, y1, x2, y2, color, size, alpha, filled) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = size;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (filled) ctx.fill();
    else        ctx.stroke();
    ctx.restore();
}

// ── Soft Brush ────────────────────────────────────────────────────
function drawBrush(ctx, x, y, color, size, alpha) {
    const r = size / 2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,   hexToRgba(color, alpha));
    g.addColorStop(0.5, hexToRgba(color, alpha * 0.6));
    g.addColorStop(1,   hexToRgba(color, 0));
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ── Helper: hex + alpha → rgba string ────────────────────────────
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
}