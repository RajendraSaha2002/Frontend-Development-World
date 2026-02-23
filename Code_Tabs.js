/* ================================================================
   tabs.js  –  Tab & File Manager for Mini VS Code
   ================================================================ */

// ── Default starter files ─────────────────────────────────────────
const DEFAULT_FILES = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>My Page</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello, World! 👋</h1>
  <p>Edit me and click <strong>Run</strong> to preview.</p>
  <button onclick="greet()">Click Me</button>
  <script src="app.js"><\/script>
</body>
</html>`,

    'style.css': `/* My Styles */
body {
  font-family: 'Segoe UI', sans-serif;
  background: #f0f4ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
}

h1 {
  color: #3a86ff;
  font-size: 2.5rem;
}

button {
  background: #3a86ff;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.2s;
}

button:hover {
  background: #2563eb;
}`,

    'app.js': `// My JavaScript
function greet() {
  const name = prompt('What is your name?');
  if (name) {
    alert('Hello, ' + name + '! 🎉');
  }
}

console.log('Script loaded!');`
};

// ── State ─────────────────────────────────────────────────────────
let files       = {};    // { filename: content }
let openTabs    = [];    // array of filenames
let activeTab   = '';    // currently active filename

// ── DOM ───────────────────────────────────────────────────────────
const tabbar   = document.getElementById('tabbar');
const fileList = document.getElementById('fileList');

// ── Icon by extension ─────────────────────────────────────────────
function fileIcon(name) {
    const ext = name.split('.').pop();
    if (ext === 'html') return '🌐';
    if (ext === 'css')  return '🎨';
    if (ext === 'js')   return '⚡';
    return '📄';
}

// ── Render Tab Bar ────────────────────────────────────────────────
function renderTabs() {
    tabbar.innerHTML = '';
    openTabs.forEach(name => {
        const tab = document.createElement('div');
        tab.className = 'tab' + (name === activeTab ? ' active' : '');

        const icon  = document.createElement('span');
        icon.className = 'tab-icon';
        icon.textContent = fileIcon(name);

        const label = document.createElement('span');
        label.textContent = name;

        const close = document.createElement('button');
        close.className   = 'tab-close';
        close.textContent = '×';
        close.title       = 'Close tab';
        close.addEventListener('click', e => { e.stopPropagation(); closeTab(name); });

        tab.appendChild(icon);
        tab.appendChild(label);
        tab.appendChild(close);
        tab.addEventListener('click', () => switchTab(name));
        tabbar.appendChild(tab);
    });
}

// ── Render Sidebar File List ──────────────────────────────────────
function renderFileList() {
    fileList.innerHTML = '';
    Object.keys(files).forEach(name => {
        const li = document.createElement('li');
        li.className = 'file-item' + (name === activeTab ? ' active' : '');

        const icon  = document.createElement('span');
        icon.textContent = fileIcon(name);

        const label = document.createElement('span');
        label.textContent = name;
        label.style.flex  = '1';

        const del = document.createElement('span');
        del.className   = 'file-del';
        del.textContent = '🗑';
        del.title       = 'Delete file';
        del.addEventListener('click', e => { e.stopPropagation(); deleteFile(name); });

        li.appendChild(icon);
        li.appendChild(label);
        li.appendChild(del);
        li.addEventListener('click', () => openFile(name));
        fileList.appendChild(li);
    });
}

// ── Open File ─────────────────────────────────────────────────────
function openFile(name) {
    if (!openTabs.includes(name)) openTabs.push(name);
    switchTab(name);
}

// ── Switch Tab ────────────────────────────────────────────────────
function switchTab(name) {
    // Save current content before switching
    if (activeTab && typeof saveCurrentContent === 'function') {
        saveCurrentContent();
    }
    activeTab = name;
    renderTabs();
    renderFileList();
    document.getElementById('activeFileName').textContent = name;

    // Load content into editor
    if (typeof loadFileIntoEditor === 'function') {
        loadFileIntoEditor(name);
    }
}

// ── Close Tab ─────────────────────────────────────────────────────
function closeTab(name) {
    if (typeof saveCurrentContent === 'function') saveCurrentContent();
    openTabs = openTabs.filter(t => t !== name);
    if (activeTab === name) {
        activeTab = openTabs[openTabs.length - 1] || '';
    }
    renderTabs();
    renderFileList();
    if (activeTab && typeof loadFileIntoEditor === 'function') {
        loadFileIntoEditor(activeTab);
        document.getElementById('activeFileName').textContent = activeTab;
    }
}

// ── Create New File ───────────────────────────────────────────────
function createFile(name) {
    name = name.trim();
    if (!name) return;
    if (files[name]) { openFile(name); return; }
    files[name] = '';
    openFile(name);
    renderFileList();
}

// ── Delete File ───────────────────────────────────────────────────
function deleteFile(name) {
    if (!confirm(`Delete "${name}"?`)) return;
    delete files[name];
    openTabs = openTabs.filter(t => t !== name);
    if (activeTab === name) {
        activeTab = openTabs[openTabs.length - 1] || '';
    }
    renderTabs();
    renderFileList();
    if (activeTab && typeof loadFileIntoEditor === 'function') {
        loadFileIntoEditor(activeTab);
    }
}

// ── Init: load default files ──────────────────────────────────────
function initTabs() {
    files    = { ...DEFAULT_FILES };
    openTabs = Object.keys(files);
    activeTab = openTabs[0];
    renderTabs();
    renderFileList();
}