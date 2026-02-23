/* ================================================================
   editor.js  –  Main editor controller for Mini VS Code
   Depends on: highlight.js  tabs.js
   ================================================================ */

// ── DOM Elements ─────────────────────────────────────────────────
const codeInput     = document.getElementById('codeInput');
const highlightCode = document.getElementById('highlightCode');
const lineNumbers   = document.getElementById('lineNumbers');
const preview       = document.getElementById('preview');
const previewPane   = document.getElementById('previewPane');
const statusLang    = document.getElementById('statusLang');
const statusCursor  = document.getElementById('statusCursor');
const statusLines   = document.getElementById('statusLines');
const bracketTip    = document.getElementById('bracketTooltip');
const modalOverlay  = document.getElementById('modalOverlay');
const newFileName   = document.getElementById('newFileName');

// ── Editor State ──────────────────────────────────────────────────
let currentLang     = 'html';
let previewVisible  = true;
let undoStack       = [];
let redoStack       = [];
let lastSaved       = '';

// ── Bracket pairs ─────────────────────────────────────────────────
const OPEN_BRACKETS  = ['(', '[', '{', '<'];
const CLOSE_BRACKETS = [')', ']', '}', '>'];
const BRACKET_PAIRS  = { ')':'(', ']':'[', '}':'{', '>':'<' };
const AUTO_CLOSE     = { '(':')', '[':']', '{':'}', '"':'"', "'":"'", '`':'`' };

// ════════════════════════════════════════════════════════════════
//  CORE: Update Highlighting + Line Numbers
// ════════════════════════════════════════════════════════════════
function updateEditor() {
    const code = codeInput.value;

    // Syntax highlighting
    highlightCode.innerHTML = highlight(code, currentLang) + '\n';

    // Line numbers
    const lines = code.split('\n');
    const cursorLine = getCursorLine();
    lineNumbers.innerHTML = lines
        .map((_, i) => `<span class="${i+1 === cursorLine ? 'active-line' : ''}">${i+1}</span>`)
        .join('');

    // Status bar
    statusLines.textContent = lines.length + ' lines';
    statusLang.textContent  = currentLang.toUpperCase();

    // Sync scroll
    syncScroll();
}

// ── Sync textarea scroll → highlight layer ─────────────────────
function syncScroll() {
    const hl = document.getElementById('codeHighlight');
    hl.scrollTop  = codeInput.scrollTop;
    hl.scrollLeft = codeInput.scrollLeft;
    lineNumbers.scrollTop = codeInput.scrollTop;
}

// ── Get cursor line number ─────────────────────────────────────
function getCursorLine() {
    const txt = codeInput.value.substring(0, codeInput.selectionStart);
    return txt.split('\n').length;
}

// ── Get cursor col number ──────────────────────────────────────
function getCursorCol() {
    const txt  = codeInput.value.substring(0, codeInput.selectionStart);
    const last = txt.lastIndexOf('\n');
    return codeInput.selectionStart - last;
}

// ── Update status bar cursor position ─────────────────────────
function updateCursor() {
    statusCursor.textContent = `Ln ${getCursorLine()}, Col ${getCursorCol()}`;
    checkBracketMatch();
    updateEditor();
}

// ════════════════════════════════════════════════════════════════
//  LOAD / SAVE FILE
// ════════════════════════════════════════════════════════════════
function loadFileIntoEditor(name) {
    currentLang = detectLang(name);
    codeInput.value = files[name] || '';
    lastSaved       = codeInput.value;
    undoStack       = [];
    redoStack       = [];
    updateEditor();
    codeInput.focus();
}

function saveCurrentContent() {
    if (activeTab) files[activeTab] = codeInput.value;
}

// ════════════════════════════════════════════════════════════════
//  KEYBOARD HANDLING
// ════════════════════════════════════════════════════════════════
codeInput.addEventListener('keydown', e => {

    const { key, ctrlKey, shiftKey } = e;
    const start = codeInput.selectionStart;
    const end   = codeInput.selectionEnd;
    const val   = codeInput.value;

    // ── Ctrl+Z Undo ───────────────────────────────────────────────
    if (ctrlKey && key === 'z') {
        e.preventDefault();
        if (undoStack.length) {
            redoStack.push(val);
            codeInput.value = undoStack.pop();
            updateEditor();
        }
        return;
    }

    // ── Ctrl+Y Redo ───────────────────────────────────────────────
    if (ctrlKey && key === 'y') {
        e.preventDefault();
        if (redoStack.length) {
            undoStack.push(val);
            codeInput.value = redoStack.pop();
            updateEditor();
        }
        return;
    }

    // ── Ctrl+S Save ───────────────────────────────────────────────
    if (ctrlKey && key === 's') {
        e.preventDefault();
        saveCurrentContent();
        flashStatus('💾 Saved!');
        return;
    }

    // Save to undo before major edits
    if (!ctrlKey && key !== 'ArrowLeft' && key !== 'ArrowRight'
        && key !== 'ArrowUp' && key !== 'ArrowDown') {
        undoStack.push(val);
        if (undoStack.length > 100) undoStack.shift();
        redoStack = [];
    }

    // ── TAB key → 2 spaces ────────────────────────────────────────
    if (key === 'Tab') {
        e.preventDefault();
        const spaces = '  ';
        if (start !== end) {
            // Indent selected lines
            const before = val.substring(0, start);
            const sel    = val.substring(start, end);
            const after  = val.substring(end);
            const indented = shiftKey
                ? sel.replace(/^  /gm, '')
                : sel.replace(/^/gm, spaces);
            insertText(indented, start, end);
        } else {
            insertText(spaces, start, start);
        }
        return;
    }

    // ── Auto-close brackets & quotes ──────────────────────────────
    if (AUTO_CLOSE[key] && start === end) {
        e.preventDefault();
        const closing = AUTO_CLOSE[key];
        insertText(key + closing, start, start);
        codeInput.selectionStart = codeInput.selectionEnd = start + 1;
        return;
    }

    // ── Skip over closing bracket if already there ─────────────────
    if (CLOSE_BRACKETS.includes(key) && val[start] === key) {
        e.preventDefault();
        codeInput.selectionStart = codeInput.selectionEnd = start + 1;
        return;
    }

    // ── Enter → auto-indent ───────────────────────────────────────
    if (key === 'Enter') {
        e.preventDefault();
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const line      = val.substring(lineStart, start);
        const indent    = line.match(/^(\s*)/)[1];
        const prevChar  = val[start - 1];
        const nextChar  = val[start];

        // Extra indent inside bracket block
        const extra = (prevChar === '{' || prevChar === '[' || prevChar === '(') ? '  ' : '';
        const newline = '\n' + indent + extra;

        if (extra && (nextChar === '}' || nextChar === ']' || nextChar === ')')) {
            insertText(newline + '\n' + indent, start, end);
            codeInput.selectionStart = codeInput.selectionEnd = start + newline.length;
        } else {
            insertText(newline, start, end);
            codeInput.selectionStart = codeInput.selectionEnd = start + newline.length;
        }
        return;
    }

    // ── Backspace: remove auto-pair ───────────────────────────────
    if (key === 'Backspace' && start === end && start > 0) {
        const prev = val[start - 1];
        const next = val[start];
        if (AUTO_CLOSE[prev] && AUTO_CLOSE[prev] === next) {
            e.preventDefault();
            codeInput.value = val.substring(0, start - 1) + val.substring(start + 1);
            codeInput.selectionStart = codeInput.selectionEnd = start - 1;
            updateEditor();
            return;
        }
    }
});

// ── Helper: insert text at selection ──────────────────────────
function insertText(text, start, end) {
    const val = codeInput.value;
    codeInput.value = val.substring(0, start) + text + val.substring(end);
    codeInput.selectionStart = codeInput.selectionEnd = start + text.length;
    updateEditor();
}

// ════════════════════════════════════════════════════════════════
//  BRACKET MATCHING
// ════════════════════════════════════════════════════════════════
function checkBracketMatch() {
    const pos = codeInput.selectionStart;
    const val = codeInput.value;
    const ch  = val[pos - 1];

    if (!ch || (!OPEN_BRACKETS.includes(ch) && !CLOSE_BRACKETS.includes(ch))) {
        bracketTip.style.display = 'none';
        return;
    }

    let match = -1;
    if (CLOSE_BRACKETS.includes(ch)) {
        const open = BRACKET_PAIRS[ch];
        let depth  = 0;
        for (let i = pos - 1; i >= 0; i--) {
            if (val[i] === ch)   depth++;
            if (val[i] === open) depth--;
            if (depth === 0)     { match = i; break; }
        }
    } else {
        const close = AUTO_CLOSE[ch];
        if (!CLOSE_BRACKETS.includes(close)) { bracketTip.style.display='none'; return; }
        let depth = 0;
        for (let i = pos - 1; i < val.length; i++) {
            if (val[i] === ch)    depth++;
            if (val[i] === close) depth--;
            if (depth === 0)      { match = i; break; }
        }
    }

    if (match !== -1) {
        const matchLine = val.substring(0, match).split('\n').length;
        bracketTip.textContent   = `Matched at line ${matchLine}`;
        bracketTip.style.display = 'block';
        const rect = codeInput.getBoundingClientRect();
        bracketTip.style.left = (rect.left + 60) + 'px';
        bracketTip.style.top  = (rect.top  - 30) + 'px';
        setTimeout(() => bracketTip.style.display = 'none', 2000);
    } else {
        bracketTip.style.display = 'none';
    }
}

// ════════════════════════════════════════════════════════════════
//  LIVE PREVIEW
// ════════════════════════════════════════════════════════════════
function runPreview() {
    saveCurrentContent();

    // Combine all files: merge CSS and JS into the HTML
    let html = files['index.html'] || '';

    // Inject CSS files inline
    Object.keys(files).forEach(name => {
        if (name.endsWith('.css')) {
            const tag = `<link rel="stylesheet" href="${name}">`;
            if (html.includes(tag)) {
                html = html.replace(tag, `<style>${files[name]}</style>`);
            }
        }
    });

    // Inject JS files inline
    Object.keys(files).forEach(name => {
        if (name.endsWith('.js')) {
            const tag = `<script src="${name}">`;
            if (html.includes(tag)) {
                html = html.replace(tag + '<\/script>', `<script>${files[name]}<\/script>`);
            }
        }
    });

    // Write into iframe
    const doc = preview.contentDocument || preview.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
}

// ════════════════════════════════════════════════════════════════
//  DOWNLOAD CURRENT FILE
// ════════════════════════════════════════════════════════════════
function downloadFile() {
    saveCurrentContent();
    if (!activeTab) return;
    const blob = new Blob([files[activeTab]], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = activeTab;
    link.click();
}

// ════════════════════════════════════════════════════════════════
//  STATUS BAR FLASH
// ════════════════════════════════════════════════════════════════
function flashStatus(msg) {
    const orig = statusLang.textContent;
    statusLang.textContent = msg;
    setTimeout(() => statusLang.textContent = orig, 1500);
}

// ════════════════════════════════════════════════════════════════
//  TOGGLE PREVIEW PANE
// ════════════════════════════════════════════════════════════════
function togglePreview() {
    previewVisible = !previewVisible;
    previewPane.classList.toggle('hidden', !previewVisible);
    document.getElementById('btn-togglePreview').textContent =
        previewVisible ? '✕ Hide' : '◧ Show';
}

// ════════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ════════════════════════════════════════════════════════════════
codeInput.addEventListener('input',    updateEditor);
codeInput.addEventListener('keyup',    updateCursor);
codeInput.addEventListener('click',    updateCursor);
codeInput.addEventListener('scroll',   syncScroll);

document.getElementById('btn-run').addEventListener('click',          runPreview);
document.getElementById('btn-refresh').addEventListener('click',      runPreview);
document.getElementById('btn-download').addEventListener('click',     downloadFile);
document.getElementById('btn-togglePreview').addEventListener('click',togglePreview);

// ── New File Modal ────────────────────────────────────────────────
document.getElementById('btn-newfile').addEventListener('click', () => {
    newFileName.value = '';
    modalOverlay.classList.add('show');
    newFileName.focus();
});

document.getElementById('btn-createFile').addEventListener('click', () => {
    createFile(newFileName.value);
    renderTabs();
    renderFileList();
    modalOverlay.classList.remove('show');
});

document.getElementById('btn-cancelModal').addEventListener('click', () => {
    modalOverlay.classList.remove('show');
});

newFileName.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-createFile').click();
    if (e.key === 'Escape') document.getElementById('btn-cancelModal').click();
});

// ── Global keyboard shortcuts ─────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runPreview(); }
    if (e.ctrlKey && e.key === 'n')     { e.preventDefault(); document.getElementById('btn-newfile').click(); }
});

// ════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════
initTabs();
loadFileIntoEditor(activeTab);
runPreview();