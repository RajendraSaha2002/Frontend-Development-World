/* ================================================================
   script.js  –  Main controller for the Paint App
   ================================================================ */

// ── Canvas Setup ─────────────────────────────────────────────────
const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');

canvas.width  = 1200;
canvas.height = 700;

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

document.getElementById('canvasSizeLabel').textContent =
    `Canvas: ${canvas.width} × ${canvas.height}`;

// ── State ────────────────────────────────────────────────────────
let activeTool  = 'brush';
let color       = '#e63946';
let brushSize   = 6;
let opacity     = 1.0;
let isDrawing   = false;
let startX      = 0;
let startY      = 0;
let snapshot    = null;       // saved canvas state before shape preview
let undoStack   = [];
let redoStack   = [];

// ── DOM References ───────────────────────────────────────────────
const colorPicker   = document.getElementById('colorPicker');
const brushSlider   = document.getElementById('brushSize');
const sizeLabel     = document.getElementById('sizeLabel');
const opacitySlider = document.getElementById('opacity');
const opacityLabel  = document.getElementById('opacityLabel');
const coordsLabel   = document.getElementById('coordsLabel');
const toolLabel     = document.getElementById('toolLabel');
const cursorPreview = document.getElementById('cursorPreview');
const toolButtons   = document.querySelectorAll('.tool-btn');

// ── Palette Colors ───────────────────────────────────────────────
const PALETTE = [
    '#000000','#ffffff','#e63946','#f4a261','#e9c46a',
    '#2a9d8f','#264653','#457b9d','#a8dadc','#6d6875',
    '#c77dff','#ff6b6b','#ffd166','#06d6a0','#118ab2',
    '#ef476f','#ffc43d','#1b998b','#3a86ff','#8338ec'
];

(function buildPalette() {
    const palette = document.getElementById('palette');
    PALETTE.forEach(c => {
        const swatch = document.createElement('div');
        swatch.className   = 'palette-color';
        swatch.style.background = c;
        swatch.title = c;
        swatch.addEventListener('click', () => {
            color = c;
            colorPicker.value = c;
            document.querySelectorAll('.palette-color').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
        });
        palette.appendChild(swatch);
    });
    palette.firstChild.classList.add('selected');
})();

// ── Tool Button Activation ───────────────────────────────────────
const toolMap = {
    'btn-brush':   'brush',
    'btn-eraser':  'eraser',
    'btn-fill':    'fill',
    'btn-line':    'line',
    'btn-rect':    'rect',
    'btn-circle':  'circle',
    'btn-eyedrop': 'eyedrop'
};

toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        activeTool = toolMap[btn.id];
        toolButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        toolLabel.textContent = 'Tool: ' + activeTool.charAt(0).toUpperCase() + activeTool.slice(1);
        updateCursorSize();
    });
});

// ── Controls ─────────────────────────────────────────────────────
colorPicker.addEventListener('input', e => {
    color = e.target.value;
    document.querySelectorAll('.palette-color').forEach(s => s.classList.remove('selected'));
});

brushSlider.addEventListener('input', e => {
    brushSize = parseInt(e.target.value);
    sizeLabel.textContent = brushSize + 'px';
    updateCursorSize();
});

opacitySlider.addEventListener('input', e => {
    opacity = parseInt(e.target.value) / 100;
    opacityLabel.textContent = e.target.value + '%';
});

// ── Undo / Redo ──────────────────────────────────────────────────
function saveState() {
    undoStack.push(canvas.toDataURL());
    if (undoStack.length > 30) undoStack.shift();
    redoStack = [];
}

function undo() {
    if (!undoStack.length) return;
    redoStack.push(canvas.toDataURL());
    restoreState(undoStack.pop());
}

function redo() {
    if (!redoStack.length) return;
    undoStack.push(canvas.toDataURL());
    restoreState(redoStack.pop());
}

function restoreState(dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);

// ── Clear Canvas ─────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
    if (!confirm('Clear the entire canvas?')) return;
    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// ── Save as Image ─────────────────────────────────────────────────
document.getElementById('btn-save').addEventListener('click', () => {
    const link    = document.createElement('a');
    link.download = 'drawing.png';
    link.href     = canvas.toDataURL('image/png');
    link.click();
});

// ── Custom Cursor ────────────────────────────────────────────────
function updateCursorSize() {
    const size = activeTool === 'eraser' ? brushSize * 2 : brushSize;
    cursorPreview.style.width  = size + 'px';
    cursorPreview.style.height = size + 'px';
}

document.addEventListener('mousemove', e => {
    cursorPreview.style.left = e.clientX + 'px';
    cursorPreview.style.top  = e.clientY + 'px';
});

// ── Get Canvas Coords ─────────────────────────────────────────────
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(e.clientX - rect.left),
        y: Math.floor(e.clientY - rect.top)
    };
}

// ── Drawing Events ────────────────────────────────────────────────
canvas.addEventListener('mousedown', e => {
    const { x, y } = getPos(e);
    isDrawing = true;
    startX    = x;
    startY    = y;

    // Single-click tools
    if (activeTool === 'fill') {
        saveState();
        floodFill(ctx, canvas, x, y, color);
        isDrawing = false;
        return;
    }

    if (activeTool === 'eyedrop') {
        color = pickColor(ctx, x, y);
        colorPicker.value = color;
        document.querySelectorAll('.palette-color').forEach(s => s.classList.remove('selected'));
        isDrawing = false;
        return;
    }

    // Save snapshot for shape preview (line, rect, circle)
    if (['line','rect','circle'].includes(activeTool)) {
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    saveState();

    // Start brush/eraser stroke
    if (activeTool === 'brush') {
        drawBrush(ctx, x, y, color, brushSize, opacity);
    }
    if (activeTool === 'eraser') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
});

canvas.addEventListener('mousemove', e => {
    const { x, y } = getPos(e);
    coordsLabel.textContent = `X: ${x}  Y: ${y}`;
    if (!isDrawing) return;

    if (activeTool === 'brush') {
        drawBrush(ctx, x, y, color, brushSize, opacity);
        drawLine(ctx, startX, startY, x, y, color, brushSize * 0.8, opacity);
        startX = x; startY = y;
    }

    if (activeTool === 'eraser') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth   = brushSize * 2;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
        startX = x; startY = y;
    }

    // Shape preview — restore snapshot then redraw
    if (['line','rect','circle'].includes(activeTool) && snapshot) {
        ctx.putImageData(snapshot, 0, 0);

        if (activeTool === 'line') {
            drawLine(ctx, startX, startY, x, y, color, brushSize, opacity);
        }
        if (activeTool === 'rect') {
            drawRect(ctx, startX, startY, x, y, color, brushSize, opacity, false);
        }
        if (activeTool === 'circle') {
            drawCircle(ctx, startX, startY, x, y, color, brushSize, opacity, false);
        }
    }
});

canvas.addEventListener('mouseup', e => {
    const { x, y } = getPos(e);
    if (!isDrawing) return;
    isDrawing = false;

    if (activeTool === 'line') {
        ctx.putImageData(snapshot, 0, 0);
        drawLine(ctx, startX, startY, x, y, color, brushSize, opacity);
    }
    if (activeTool === 'rect') {
        ctx.putImageData(snapshot, 0, 0);
        drawRect(ctx, startX, startY, x, y, color, brushSize, opacity, false);
    }
    if (activeTool === 'circle') {
        ctx.putImageData(snapshot, 0, 0);
        drawCircle(ctx, startX, startY, x, y, color, brushSize, opacity, false);
    }

    snapshot = null;
});

canvas.addEventListener('mouseleave', () => { isDrawing = false; });

// ── Keyboard Shortcuts ────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); return; }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); return; }

    const shortcuts = { b:'btn-brush', e:'btn-eraser', f:'btn-fill',
        l:'btn-line',  r:'btn-rect',   c:'btn-circle', i:'btn-eyedrop' };
    if (shortcuts[e.key]) {
        document.getElementById(shortcuts[e.key]).click();
    }
});

// ── Init ──────────────────────────────────────────────────────────
updateCursorSize();