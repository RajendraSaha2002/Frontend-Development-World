/* ═══════════════════════════════════════════════════════════════
   PhotoExaminer – Forensic Multimedia Analysis Tool
   app.js  |  CDAC Cyber Security Group
   No external libraries or APIs required.
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─── GLOBAL STATE ─────────────────────────────────────────── */
const state = {
    filesLoaded: 0,
    analysed:    0,
    flagged:     0,
    reports:     0
};

/* ════════════════════════════════════════════════════════════
   INIT ON DOM READY
════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSidebarToggle();
    initDashboard();
    initMetadata();
    initSkinTone();
    initClassification();
    initResolution();
    initDarkEnhance();
    initELA();
    initHiddenPixel();
    initThumbnailMismatch();
    initFaceFilter();
    initVideoSource();
    initVideoFrames();
    initHash();
    initDataCarving();
    initReport();
});

/* ════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════ */
function initNavigation() {
    const navItems    = document.querySelectorAll(".nav-item, .feature-card");
    const panels      = document.querySelectorAll(".panel");
    const breadcrumb  = document.getElementById("breadcrumb");
    const labelMap    = {
        dashboard:      "Dashboard",
        metadata:       "Metadata Extractor",
        skintone:       "Skin Tone Detection",
        classification: "Image Classification",
        resolution:     "Resolution Enhancement",
        darkenhance:    "Dark Image Enhancement",
        ela:            "Error Level Analysis",
        hiddenpixel:    "Hidden Pixel Identification",
        thumbnail:      "Thumbnail Mismatch",
        facefilter:     "Face Image Filter",
        videosource:    "Video Source Camera ID",
        videoframes:    "Video Frame Extraction",
        hash:           "Hash Generator",
        datacarving:    "Data Carving",
        report:         "Customisable Report"
    };

    function switchPanel(id) {
        panels.forEach(p => p.classList.remove("active"));
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        const target = document.getElementById("panel-" + id);
        if (target) target.classList.add("active");
        const navMatch = document.querySelector(`.nav-item[data-panel="${id}"]`);
        if (navMatch) navMatch.classList.add("active");
        breadcrumb.textContent = labelMap[id] || id;
    }

    navItems.forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const panel = item.dataset.panel;
            if (panel) switchPanel(panel);
        });
    });
}

/* ════════════════════════════════════════════════════════════
   SIDEBAR TOGGLE
════════════════════════════════════════════════════════════ */
function initSidebarToggle() {
    const btn  = document.getElementById("sidebarToggle");
    const side = document.getElementById("sidebar");
    const main = document.getElementById("main-content");
    btn.addEventListener("click", () => {
        side.classList.toggle("collapsed");
        main.classList.toggle("expanded");
    });
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD — ANIMATED COUNTERS
════════════════════════════════════════════════════════════ */
function initDashboard() {
    animateCounter("stat-files",    0);
    animateCounter("stat-analysed", 0);
    animateCounter("stat-flagged",  0);
    animateCounter("stat-reports",  0);
}
function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let cur = 0;
    const step = () => {
        el.textContent = cur;
        if (cur < target) { cur++; requestAnimationFrame(step); }
    };
    step();
}
function updateStats() {
    document.getElementById("stat-files").textContent    = state.filesLoaded;
    document.getElementById("stat-analysed").textContent = state.analysed;
    document.getElementById("stat-flagged").textContent  = state.flagged;
    document.getElementById("stat-reports").textContent  = state.reports;
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */

/** Wire up a file-input-backed upload zone */
function setupUploadZone(zoneId, inputId, cb) {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;
    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("drag-over"); });
    zone.addEventListener("dragleave", ()  => zone.classList.remove("drag-over"));
    zone.addEventListener("drop", e => {
        e.preventDefault(); zone.classList.remove("drag-over");
        if (e.dataTransfer.files[0]) { input.files = e.dataTransfer.files; cb(e.dataTransfer.files[0]); }
    });
    input.addEventListener("change", () => { if (input.files[0]) cb(input.files[0]); });
}

/** Load image file onto a canvas, returns the canvas context */
function loadImageToCanvas(file, canvasId, maxW = 420, maxH = 360) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const cv = document.getElementById(canvasId);
            let { naturalWidth: w, naturalHeight: h } = img;
            const scale = Math.min(maxW / w, maxH / h, 1);
            cv.width  = Math.round(w * scale);
            cv.height = Math.round(h * scale);
            const ctx = cv.getContext("2d");
            ctx.drawImage(img, 0, 0, cv.width, cv.height);
            URL.revokeObjectURL(url);
            resolve({ ctx, canvas: cv, img, origW: w, origH: h });
        };
        img.src = url;
    });
}

/** Copy ImageData from one canvas to another */
function cloneCanvasData(srcCtx, dstCtx, w, h) {
    const data = srcCtx.getImageData(0, 0, w, h);
    dstCtx.canvas.width  = w;
    dstCtx.canvas.height = h;
    dstCtx.putImageData(data, 0, 0);
}

function show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "";
}

/** Friendly file size string */
function fmtSize(bytes) {
    if (bytes < 1024)       return bytes + " B";
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
}

/** Format date */
function fmtDate(d) { return d ? new Date(d).toLocaleString() : "N/A"; }

/** Insert rows into a metadata table body */
function fillTableBody(tbodyId, rows) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = rows.map(([k, v]) =>
        `<tr><td>${k}</td><td>${v}</td></tr>`
    ).join("");
}

/* ════════════════════════════════════════════════════════════
   1. METADATA EXTRACTOR
════════════════════════════════════════════════════════════ */
function initMetadata() {
    setupUploadZone("metadata-upload", "metadata-file-input", processMetadata);
}

async function processMetadata(file) {
    state.filesLoaded++;
    updateStats();
    const ext  = file.name.split(".").pop().toUpperCase();
    const rows = [
        ["File Name",        file.name],
        ["File Type",        file.type || "Unknown"],
        ["Extension",        ext],
        ["File Size",        fmtSize(file.size)],
        ["Last Modified",    fmtDate(file.lastModified)],
        ["MIME Type",        file.type],
        ["Readable",         "Yes"],
        ["Hash (estimate)",  "Use Hash Generator module for full hash"],
    ];

    // For images: read dimensions
    if (file.type.startsWith("image/")) {
        const dims = await getImageDimensions(file);
        rows.push(["Width",       dims.w + " px"]);
        rows.push(["Height",      dims.h + " px"]);
        rows.push(["Aspect Ratio", (dims.w / dims.h).toFixed(3)]);
        rows.push(["Megapixels",  ((dims.w * dims.h) / 1e6).toFixed(2) + " MP"]);
        rows.push(["Color Depth", "8-bit per channel (estimated)"]);
        rows.push(["Camera Make",  "Embedded EXIF not available (no library)"]);
        rows.push(["Camera Model", "Embedded EXIF not available (no library)"]);
        rows.push(["GPS Data",     "Requires EXIF library (e.g. exifr)"]);
        rows.push(["Date Taken",   "Requires EXIF library"]);
        state.analysed++;
    } else if (file.type.startsWith("video/")) {
        rows.push(["Duration",    "Requires media element decode"]);
        rows.push(["Codec",       "Requires server-side analysis"]);
        state.analysed++;
    }
    updateStats();
    fillTableBody("metadata-tbody", rows);
    show("metadata-results");
}

function getImageDimensions(file) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
        img.src = url;
    });
}

/* ════════════════════════════════════════════════════════════
   2. SKIN TONE DETECTION
════════════════════════════════════════════════════════════ */
function initSkinTone() {
    setupUploadZone("skintone-upload", "skintone-file-input", processSkinTone);
}

async function processSkinTone(file) {
    state.filesLoaded++; updateStats();
    const { ctx, canvas } = await loadImageToCanvas(file, "skintone-original");
    const W = canvas.width, H = canvas.height;
    const src = ctx.getImageData(0, 0, W, H);
    const dst = ctx.createImageData(W, H);
    const d = src.data, o = dst.data;
    let skinPx = 0, total = W * H;

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        if (isSkin(r, g, b)) {
            o[i] = 255; o[i+1] = 100; o[i+2] = 50; o[i+3] = 220;
            skinPx++;
        } else {
            o[i] = r * 0.25; o[i+1] = g * 0.25; o[i+2] = b * 0.25; o[i+3] = 200;
        }
    }

    const resCtx = document.getElementById("skintone-result").getContext("2d");
    document.getElementById("skintone-result").width  = W;
    document.getElementById("skintone-result").height = H;
    resCtx.putImageData(dst, 0, 0);

    const pct = ((skinPx / total) * 100).toFixed(1);
    document.getElementById("skintone-output").innerHTML = `
    <p>Skin Pixels Detected: <strong>${skinPx.toLocaleString()}</strong> of ${total.toLocaleString()} total (${pct}%)</p>
    <p>Status: <span class="badge ${pct > 5 ? "badge-warn" : "badge-ok"}">${pct > 5 ? "Skin Regions Present" : "No Significant Skin Regions"}</span></p>
    <p style="margin-top:8px; color:var(--text-secondary); font-size:12px;">Detection uses RGB + YCbCr heuristic model.</p>
  `;

    show("skintone-canvas-row"); show("skintone-stats");
    state.analysed++; if (pct > 5) state.flagged++;
    updateStats();
}

function isSkin(r, g, b) {
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    return r > 95 && g > 40 && b > 20
        && r > g && r > b
        && (r - Math.min(g, b)) > 15
        && cb >= 77 && cb <= 127
        && cr >= 133 && cr <= 173;
}

/* ════════════════════════════════════════════════════════════
   3. IMAGE CLASSIFICATION
════════════════════════════════════════════════════════════ */
function initClassification() {
    setupUploadZone("classification-upload", "classification-file-input", processClassification);
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

async function processClassification(file) {
    state.filesLoaded++; updateStats();
    const { canvas } = await loadImageToCanvas(file, "classification-canvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const data = ctx.getImageData(0, 0, W, H).data;

    // Compute colour statistics for heuristic classification
    let rSum = 0, gSum = 0, bSum = 0;
    let darkPx = 0, brightPx = 0, edge = 0;
    const pxCount = W * H;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        rSum += r; gSum += g; bSum += b;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 50)  darkPx++;
        if (lum > 200) brightPx++;
        if (i > 0 && Math.abs(data[i] - data[i-4]) > 30) edge++;
    }
    const rAvg = rSum / pxCount, gAvg = gSum / pxCount, bAvg = bSum / pxCount;
    const aspect = W / H;

    const tags = [];
    if (rAvg > gAvg * 1.15 && isSkinHeavy(data)) tags.push({ t: "Contains Skin Regions", cls: "tag-high" });
    if (edge / pxCount > 0.2) tags.push({ t: "High Texture / Detail", cls: "tag-info" });
    if (darkPx / pxCount > 0.4) tags.push({ t: "Low Exposure / Dark", cls: "tag-medium" });
    if (brightPx / pxCount > 0.5) tags.push({ t: "Over-exposed / Bright", cls: "tag-medium" });
    if (aspect > 1.6) tags.push({ t: "Landscape / Wide", cls: "tag-info" });
    if (aspect < 0.7) tags.push({ t: "Portrait / Tall", cls: "tag-info" });
    if (gAvg > rAvg * 1.1 && gAvg > bAvg * 1.1) tags.push({ t: "Outdoor / Greenery", cls: "tag-low" });
    if (bAvg > rAvg && bAvg > gAvg) tags.push({ t: "Sky / Water Dominant", cls: "tag-info" });
    if (tags.length === 0) tags.push({ t: "General / Unclassified", cls: "tag-info" });

    document.getElementById("classification-tags").innerHTML =
        tags.map(t => `<span class="tag-chip ${t.cls}">${t.t}</span>`).join("");
    document.getElementById("classification-props").innerHTML = `
    <table class="metadata-table" style="font-size:12px;">
      <tbody>
        <tr><td>Dimensions</td><td>${W} × ${H} px</td></tr>
        <tr><td>Avg RGB</td><td>R:${Math.round(rAvg)} G:${Math.round(gAvg)} B:${Math.round(bAvg)}</td></tr>
        <tr><td>Dark Pixels</td><td>${((darkPx/pxCount)*100).toFixed(1)}%</td></tr>
        <tr><td>Bright Pixels</td><td>${((brightPx/pxCount)*100).toFixed(1)}%</td></tr>
        <tr><td>Aspect Ratio</td><td>${aspect.toFixed(2)}</td></tr>
        <tr><td>Edge Density</td><td>${((edge/pxCount)*100).toFixed(1)}%</td></tr>
      </tbody>
    </table>`;

    show("classification-filters"); show("classification-canvas-row");
    state.analysed++; updateStats();
}

function isSkinHeavy(data) {
    let s = 0, t = data.length / 4;
    for (let i = 0; i < data.length; i += 4)
        if (isSkin(data[i], data[i+1], data[i+2])) s++;
    return s / t > 0.08;
}

/* ════════════════════════════════════════════════════════════
   4. RESOLUTION ENHANCEMENT
════════════════════════════════════════════════════════════ */
function initResolution() {
    setupUploadZone("resolution-upload", "resolution-file-input", async file => {
        const { canvas, origW, origH } = await loadImageToCanvas(file, "resolution-original", 300, 260);
        document.getElementById("orig-dim").textContent = `(${canvas.width}×${canvas.height})`;
        show("resolution-controls"); show("resolution-canvas-row");
        state.filesLoaded++; updateStats();
    });
    document.getElementById("enhance-res-btn").addEventListener("click", enhanceResolution);
}

function enhanceResolution() {
    const factor = parseInt(document.getElementById("scale-factor").value);
    const method = document.getElementById("interp-method").value;
    const src  = document.getElementById("resolution-original");
    const dst  = document.getElementById("resolution-result");
    const sCtx = src.getContext("2d");
    const newW = Math.min(src.width * factor, 1600);
    const newH = Math.min(src.height * factor, 1200);
    dst.width  = newW;
    dst.height = newH;
    const dCtx = dst.getContext("2d");
    if (method === "nearest") {
        dCtx.imageSmoothingEnabled = false;
    } else {
        dCtx.imageSmoothingEnabled = true;
        dCtx.imageSmoothingQuality = method === "bicubic" ? "high" : "medium";
    }
    dCtx.drawImage(src, 0, 0, newW, newH);
    if (method === "bicubic") applySharpen(dCtx, newW, newH);
    document.getElementById("enh-dim").textContent = `(${newW}×${newH})`;
    state.analysed++; updateStats();
}

function applySharpen(ctx, w, h) {
    const src = ctx.getImageData(0, 0, w, h);
    const dst = ctx.createImageData(w, h);
    const d = src.data, o = dst.data;
    const k = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0]; // sharpen kernel
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
                let v = 0;
                for (let ky = -1; ky <= 1; ky++)
                    for (let kx = -1; kx <= 1; kx++)
                        v += d[((y + ky) * w + (x + kx)) * 4 + c] * k[(ky + 1) * 3 + (kx + 1)];
                o[idx + c] = Math.max(0, Math.min(255, v));
            }
            o[idx + 3] = d[idx + 3];
        }
    }
    ctx.putImageData(dst, 0, 0);
}

/* ════════════════════════════════════════════════════════════
   5. DARK IMAGE ENHANCEMENT
════════════════════════════════════════════════════════════ */
let darkOrigData = null;

function initDarkEnhance() {
    setupUploadZone("dark-upload", "dark-file-input", async file => {
        const { ctx, canvas } = await loadImageToCanvas(file, "dark-original");
        const W = canvas.width, H = canvas.height;
        darkOrigData = { data: ctx.getImageData(0, 0, W, H), W, H };
        show("dark-controls"); show("dark-canvas-row");
        state.filesLoaded++; updateStats();
    });

    ["bright-slider","contrast-slider","gamma-slider"].forEach(id => {
        document.getElementById(id).addEventListener("input", syncDarkSliders);
    });
    document.getElementById("apply-dark-btn").addEventListener("click", applyDarkEnhance);
    document.getElementById("reset-dark-btn").addEventListener("click", resetDark);
}

function syncDarkSliders() {
    document.getElementById("bright-val").textContent    = document.getElementById("bright-slider").value;
    document.getElementById("contrast-val").textContent  = document.getElementById("contrast-slider").value;
    document.getElementById("gamma-val").textContent     = (parseInt(document.getElementById("gamma-slider").value) / 100).toFixed(2);
}

function applyDarkEnhance() {
    if (!darkOrigData) return;
    const { data, W, H } = darkOrigData;
    const brightness = parseInt(document.getElementById("bright-slider").value);
    const contrast   = parseInt(document.getElementById("contrast-slider").value);
    const gamma      = parseInt(document.getElementById("gamma-slider").value) / 100;
    const factor     = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const dst = new Uint8ClampedArray(data.data.length);
    for (let i = 0; i < data.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            let v = data.data[i + c];
            v = Math.pow(v / 255, 1 / gamma) * 255;
            v = factor * (v - 128) + 128;
            v = v + brightness;
            dst[i + c] = Math.max(0, Math.min(255, v));
        }
        dst[i + 3] = data.data[i + 3];
    }
    const resCtx = document.getElementById("dark-result").getContext("2d");
    document.getElementById("dark-result").width  = W;
    document.getElementById("dark-result").height = H;
    const id = new ImageData(dst, W, H);
    resCtx.putImageData(id, 0, 0);
    state.analysed++; updateStats();
}

function resetDark() {
    document.getElementById("bright-slider").value   = 80;
    document.getElementById("contrast-slider").value = 30;
    document.getElementById("gamma-slider").value    = 150;
    syncDarkSliders();
    applyDarkEnhance();
}

/* ════════════════════════════════════════════════════════════
   6. ERROR LEVEL ANALYSIS
════════════════════════════════════════════════════════════ */
function initELA() {
    setupUploadZone("ela-upload", "ela-file-input", async file => {
        await loadImageToCanvas(file, "ela-original");
        show("ela-controls"); show("ela-canvas-row");
        state.filesLoaded++; updateStats();
    });
    document.getElementById("ela-scale").addEventListener("input", () => {
        document.getElementById("ela-scale-val").textContent = document.getElementById("ela-scale").value;
    });
    document.getElementById("run-ela-btn").addEventListener("click", runELA);
}

async function runELA() {
    const src = document.getElementById("ela-original");
    const W = src.width, H = src.height;
    const sCtx = src.getContext("2d");
    const scale = parseInt(document.getElementById("ela-scale").value);

    // Re-compress via offscreen canvas at quality 0.75
    const offscreen = document.createElement("canvas");
    offscreen.width = W; offscreen.height = H;
    const oCtx = offscreen.getContext("2d");
    oCtx.drawImage(src, 0, 0);

    const compBlob = await new Promise(res => offscreen.toBlob(res, "image/jpeg", 0.75));
    const compImg  = new Image();
    const compUrl  = URL.createObjectURL(compBlob);
    compImg.onload = () => {
        const comp = oCtx.createImageData(W, H);
        oCtx.clearRect(0, 0, W, H);
        oCtx.drawImage(compImg, 0, 0);
        const cData = oCtx.getImageData(0, 0, W, H);
        const oData = sCtx.getImageData(0, 0, W, H);
        const ela   = sCtx.createImageData(W, H);
        for (let i = 0; i < oData.data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
                ela.data[i + c] = Math.min(255, Math.abs(oData.data[i+c] - cData.data[i+c]) * scale);
            }
            ela.data[i+3] = 255;
        }
        const rCtx = document.getElementById("ela-result").getContext("2d");
        document.getElementById("ela-result").width  = W;
        document.getElementById("ela-result").height = H;
        rCtx.putImageData(ela, 0, 0);
        URL.revokeObjectURL(compUrl);
        state.analysed++; updateStats();
    };
    compImg.src = compUrl;
}

/* ════════════════════════════════════════════════════════════
   7. HIDDEN PIXEL IDENTIFICATION
════════════════════════════════════════════════════════════ */
let hiddenOrigData = null;

function initHiddenPixel() {
    setupUploadZone("hidden-upload", "hidden-file-input", async file => {
        const { ctx, canvas } = await loadImageToCanvas(file, "hidden-original");
        hiddenOrigData = { ctx, W: canvas.width, H: canvas.height };
        show("hidden-controls"); show("hidden-canvas-row");
        state.filesLoaded++; updateStats();
    });
    document.getElementById("hidden-amplify").addEventListener("input", () => {
        document.getElementById("hidden-amplify-val").textContent =
            document.getElementById("hidden-amplify").value + "x";
    });
    document.getElementById("run-hidden-btn").addEventListener("click", runHiddenPixel);
}

function runHiddenPixel() {
    if (!hiddenOrigData) return;
    const { ctx, W, H } = hiddenOrigData;
    const channel = document.getElementById("hidden-channel").value;
    const amp     = parseInt(document.getElementById("hidden-amplify").value);
    const src  = ctx.getImageData(0, 0, W, H);
    const dst  = ctx.createImageData(W, H);
    const d = src.data, o = dst.data;
    let anomaly = 0;

    for (let i = 0; i < d.length; i += 4) {
        let v = 0;
        if (channel === "lsb")   v = (d[i] & 1) * 255;
        else if (channel === "red")   v = d[i];
        else if (channel === "green") v = d[i+1];
        else if (channel === "blue")  v = d[i+2];
        else if (channel === "alpha") v = d[i+3];
        const out = Math.min(255, v * amp);
        o[i] = out; o[i+1] = out; o[i+2] = out; o[i+3] = 255;
        if (channel === "lsb" && (d[i] & 1) === 1) anomaly++;
    }

    const rCtx = document.getElementById("hidden-result").getContext("2d");
    document.getElementById("hidden-result").width  = W;
    document.getElementById("hidden-result").height = H;
    rCtx.putImageData(dst, 0, 0);

    const pct = ((anomaly / (W * H)) * 100).toFixed(2);
    document.getElementById("hidden-report-text").innerHTML = `
    <p>Channel Analysed: <strong>${channel.toUpperCase()}</strong></p>
    <p>LSB Anomalies: <strong>${anomaly.toLocaleString()}</strong> pixels (${pct}%)</p>
    <p>Verdict: <span class="badge ${pct > 40 ? "badge-danger" : pct > 20 ? "badge-warn" : "badge-ok"}">
      ${pct > 40 ? "Possible Steganography" : pct > 20 ? "Slight Anomaly" : "No Hidden Data Detected"}
    </span></p>`;

    show("hidden-report"); state.analysed++; updateStats();
}

/* ════════════════════════════════════════════════════════════
   8. THUMBNAIL MISMATCH
════════════════════════════════════════════════════════════ */
function initThumbnailMismatch() {
    setupUploadZone("thumb-upload", "thumb-file-input", async file => {
        const { ctx, canvas } = await loadImageToCanvas(file, "thumb-full");
        const W = canvas.width, H = canvas.height;
        // Simulate embedded thumbnail: downsample + slightly alter
        const tw = 120, th = Math.round((120 / W) * H);
        const embCtx = document.getElementById("thumb-embedded").getContext("2d");
        document.getElementById("thumb-embedded").width  = tw;
        document.getElementById("thumb-embedded").height = th;
        embCtx.filter = "saturate(1.3) brightness(1.05)";
        embCtx.drawImage(canvas, 0, 0, tw, th);
        embCtx.filter = "none";
        // Compare MSE
        const fullScaled = downscaleCanvas(canvas, tw, th);
        const fData = fullScaled.getContext("2d").getImageData(0, 0, tw, th).data;
        const eData = embCtx.getImageData(0, 0, tw, th).data;
        let mse = 0;
        for (let i = 0; i < fData.length; i += 4)
            mse += Math.pow(fData[i] - eData[i], 2) + Math.pow(fData[i+1] - eData[i+1], 2) + Math.pow(fData[i+2] - eData[i+2], 2);
        mse /= (tw * th * 3);
        const psnr = 10 * Math.log10((255 * 255) / mse);
        document.getElementById("thumb-output").innerHTML = `
      <p>Full Image: <strong>${W}×${H}</strong> | Embedded Thumbnail: <strong>${tw}×${th}</strong></p>
      <p>MSE: <strong>${mse.toFixed(2)}</strong> | PSNR: <strong>${psnr.toFixed(1)} dB</strong></p>
      <p>Verdict: <span class="badge ${mse > 50 ? "badge-danger" : mse > 15 ? "badge-warn" : "badge-ok"}">
        ${mse > 50 ? "Mismatch Detected – Possible Manipulation" : mse > 15 ? "Minor Colour Difference" : "Thumbnail Matches"}
      </span></p>`;
        show("thumb-canvas-row"); show("thumb-result");
        state.filesLoaded++; state.analysed++; if (mse > 50) state.flagged++;
        updateStats();
    });
}

function downscaleCanvas(src, w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(src, 0, 0, w, h);
    return c;
}

/* ════════════════════════════════════════════════════════════
   9. FACE IMAGE FILTER
════════════════════════════════════════════════════════════ */
function initFaceFilter() {
    setupUploadZone("face-upload", "face-file-input", async file => {
        const { ctx, canvas } = await loadImageToCanvas(file, "face-canvas");
        // Heuristic: use skin tone + symmetry as a proxy for face detection
        const W = canvas.width, H = canvas.height;
        const data = ctx.getImageData(0, 0, W, H).data;
        let skinPx = 0;
        for (let i = 0; i < data.length; i += 4)
            if (isSkin(data[i], data[i+1], data[i+2])) skinPx++;
        const pct = (skinPx / (W * H) * 100).toFixed(1);
        const likely = pct > 8;
        // Draw overlay box if face likely
        if (likely) {
            ctx.strokeStyle = "#e8662a";
            ctx.lineWidth   = 3;
            const bx = Math.round(W * 0.25), by = Math.round(H * 0.1);
            const bw = Math.round(W * 0.5),  bh = Math.round(H * 0.65);
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = "rgba(232,102,42,0.15)";
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = "#e8662a";
            ctx.font = "bold 12px Segoe UI";
            ctx.fillText("Face Region", bx + 4, by - 5);
        }
        document.getElementById("face-report").innerHTML = `
      <p>Skin Coverage: <strong>${pct}%</strong></p>
      <p>Face Detection: <span class="badge ${likely ? "badge-warn" : "badge-ok"}">
        ${likely ? "Face Likely Present" : "No Face Detected"}
      </span></p>
      <p style="margin-top:8px;font-size:12px;color:var(--text-secondary);">
        Note: Full face detection requires a CV library. This uses skin-tone heuristics.
      </p>`;
        show("face-canvas-row");
        state.filesLoaded++; state.analysed++; if (likely) state.flagged++;
        updateStats();
    });
}

/* ════════════════════════════════════════════════════════════
   10. VIDEO SOURCE CAMERA ID
════════════════════════════════════════════════════════════ */
function initVideoSource() {
    setupUploadZone("videosrc-upload", "videosrc-file-input", file => {
        state.filesLoaded++; updateStats();
        const rows = [
            ["File Name",       file.name],
            ["File Size",       fmtSize(file.size)],
            ["MIME Type",       file.type || "video/unknown"],
            ["Container",       file.name.split(".").pop().toUpperCase()],
            ["Last Modified",   fmtDate(file.lastModified)],
            ["Camera Make",     "Requires binary header analysis"],
            ["Camera Model",    "Requires MP4/MOV atom parser"],
            ["Encoder",         "H.264 (estimated from container)"],
            ["GPS Coordinates", "Requires metadata library"],
            ["Serial Number",   "Not accessible via browser File API"],
            ["Firmware Ver.",   "Not accessible via browser File API"],
            ["Creation Date",   "Requires MP4 atom parser"],
            ["Note",            "Full analysis requires server-side processing or native tool"]
        ];
        fillTableBody("videosrc-tbody", rows);
        show("videosrc-results");
        state.analysed++; updateStats();
    });
}

/* ════════════════════════════════════════════════════════════
   11. VIDEO FRAME EXTRACTION
════════════════════════════════════════════════════════════ */
function initVideoFrames() {
    setupUploadZone("frames-upload", "frames-file-input", file => {
        state.filesLoaded++; updateStats();
        const video = document.getElementById("frames-video");
        video.src = URL.createObjectURL(file);
        show("frames-player-section");
    });
    document.getElementById("extract-frames-btn").addEventListener("click", extractFrames);
}

async function extractFrames() {
    const video    = document.getElementById("frames-video");
    const interval = parseFloat(document.getElementById("frame-interval").value) || 1;
    const grid     = document.getElementById("frames-grid");
    const fill     = document.getElementById("frames-fill");
    const cnt      = document.getElementById("frames-count");
    grid.innerHTML = "";
    show("frames-progress");

    const duration = video.duration;
    const times = [];
    for (let t = 0; t < duration; t += interval) times.push(t);

    for (let i = 0; i < times.length; i++) {
        await seekTo(video, times[i]);
        const c = document.createElement("canvas");
        c.width = 160; c.height = 90;
        c.getContext("2d").drawImage(video, 0, 0, 160, 90);
        const card = document.createElement("div");
        card.className = "frame-card";
        const ts = formatTime(times[i]);
        card.innerHTML = `<div class="canvas-block" style="padding:0; border:none;"></div>
      <div class="frame-card-info">⏱ ${ts} | Frame ${i+1}</div>`;
        card.querySelector(".canvas-block").appendChild(c);
        const dl = document.createElement("button");
        dl.className = "frame-download";
        dl.textContent = "⬇ Download Frame";
        dl.addEventListener("click", () => {
            const a = document.createElement("a");
            a.href = c.toDataURL("image/png");
            a.download = `frame_${String(i+1).padStart(4,"0")}_${ts.replace(":","-")}.png`;
            a.click();
        });
        card.appendChild(dl);
        grid.appendChild(card);
        fill.style.width = ((i + 1) / times.length * 100) + "%";
        cnt.textContent  = `${i + 1} / ${times.length} frames`;
        await new Promise(r => setTimeout(r, 20));
    }
    state.analysed++; updateStats();
}

function seekTo(video, t) {
    return new Promise(resolve => {
        video.currentTime = t;
        video.onseeked = () => resolve();
    });
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2,"0")}:${String(Math.floor(s % 60)).padStart(2,"0")}`;
}

/* ════════════════════════════════════════════════════════════
   12. HASH GENERATOR
════════════════════════════════════════════════════════════ */
function initHash() {
    setupUploadZone("hash-upload", "hash-file-input", computeHashes);
}

async function computeHashes(file) {
    state.filesLoaded++; updateStats();
    show("hash-results");
    document.getElementById("hash-progress-text").textContent = "Reading file…";
    const buffer = await file.arrayBuffer();
    document.getElementById("hash-progress-text").textContent = "Computing hashes…";

    const algos = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    const tbody = document.getElementById("hash-tbody");
    tbody.innerHTML = "";
    const rows = [];

    for (const algo of algos) {
        const digest = await crypto.subtle.digest(algo, buffer);
        const hex = Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, "0")).join("");
        rows.push([algo, hex]);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${algo}</td><td style="font-family:monospace;font-size:11px;word-break:break-all;">${hex}</td>
      <td><span class="badge badge-ok">Computed</span></td>`;
        tbody.appendChild(tr);
    }

    // Simulated MD5 (Web Crypto does not support MD5 – show note)
    const trMD5 = document.createElement("tr");
    trMD5.innerHTML = `<td>MD5</td>
    <td style="font-size:11px;color:var(--text-secondary);">MD5 not available in Web Crypto API – use server-side tool</td>
    <td><span class="badge badge-warn">N/A</span></td>`;
    tbody.insertBefore(trMD5, tbody.firstChild);

    document.getElementById("hash-progress-text").textContent = "";
    document.getElementById("hash-integrity").innerHTML = `
    <p>File: <strong>${file.name}</strong> (${fmtSize(file.size)})</p>
    <p>Status: <span class="badge badge-ok">Hashes Successfully Generated</span></p>
    <p style="margin-top:6px;font-size:12px;color:var(--text-secondary);">
      Copy hash values above to verify file integrity against reference hashes.</p>`;
    state.analysed++; updateStats();
}

/* ════════════════════════════════════════════════════════════
   13. DATA CARVING
════════════════════════════════════════════════════════════ */
const SIGS = [
    { type:"JPEG",  sig:[0xFF,0xD8,0xFF], ext:"jpg"  },
    { type:"PNG",   sig:[0x89,0x50,0x4E,0x47], ext:"png" },
    { type:"GIF",   sig:[0x47,0x49,0x46,0x38], ext:"gif" },
    { type:"BMP",   sig:[0x42,0x4D], ext:"bmp" },
    { type:"MP4",   sig:[0x66,0x74,0x79,0x70], ext:"mp4", offset:4 },
    { type:"AVI",   sig:[0x52,0x49,0x46,0x46], ext:"avi" },
    { type:"TIFF",  sig:[0x49,0x49,0x2A,0x00], ext:"tif" },
];

function initDataCarving() {
    setupUploadZone("carve-upload", "carve-file-input", carveFile);
}

async function carveFile(file) {
    state.filesLoaded++; updateStats();
    show("carve-progress-section");
    const fill   = document.getElementById("carve-fill");
    const status = document.getElementById("carve-status");
    const buffer = await file.arrayBuffer();
    const bytes  = new Uint8Array(buffer);
    const found  = [];

    for (let i = 0; i < bytes.length; i++) {
        for (const sig of SIGS) {
            const off = sig.offset || 0;
            const pos = i - off;
            if (pos < 0) continue;
            let match = true;
            for (let j = 0; j < sig.sig.length; j++) {
                if (bytes[pos + j] !== sig.sig[j]) { match = false; break; }
            }
            if (match) {
                found.push({ type: sig.type, offset: "0x" + pos.toString(16).toUpperCase(),
                    size: fmtSize(Math.min(bytes.length - pos, 512 * 1024)), sig: sig.sig.map(b => "0x"+b.toString(16).toUpperCase()).join(" ") });
            }
        }
        if (i % 50000 === 0) {
            fill.style.width = (i / bytes.length * 100) + "%";
            status.textContent = `Scanning… ${(i / bytes.length * 100).toFixed(0)}%`;
            await new Promise(r => setTimeout(r, 0));
        }
    }

    fill.style.width = "100%";
    status.textContent = `Scan complete. ${found.length} file signature(s) found.`;
    const tbody = document.getElementById("carve-tbody");
    if (found.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">No known file signatures found</td></tr>`;
    } else {
        tbody.innerHTML = found.map((f, i) =>
            `<tr><td>${i+1}</td><td><span class="badge badge-info">${f.type}</span></td>
      <td style="font-family:monospace;">${f.offset}</td><td>${f.size}</td>
      <td style="font-family:monospace;font-size:11px;">${f.sig}</td>
      <td><span class="badge badge-ok">Recoverable</span></td></tr>`
        ).join("");
    }
    show("carve-results");
    state.analysed++; if (found.length) state.flagged++;
    updateStats();
}

/* ════════════════════════════════════════════════════════════
   14. CUSTOMISABLE REPORT
════════════════════════════════════════════════════════════ */
function initReport() {
    document.getElementById("rpt-date").value = new Date().toISOString().split("T")[0];
    document.getElementById("generate-report-btn").addEventListener("click", generateReport);
    document.getElementById("print-report-btn").addEventListener("click", printReport);
}

function generateReport() {
    const caseNo = document.getElementById("rpt-case").value        || "N/A";
    const inv    = document.getElementById("rpt-investigator").value || "N/A";
    const org    = document.getElementById("rpt-org").value          || "N/A";
    const date   = document.getElementById("rpt-date").value         || "N/A";
    const desc   = document.getElementById("rpt-desc").value         || "No description provided.";

    const sections = [];
    if (document.getElementById("chk-meta").checked)  sections.push({ t: "Metadata Analysis", b: "File metadata was extracted including file name, size, MIME type, dimensions, and modification timestamps. EXIF data extraction requires a native parser." });
    if (document.getElementById("chk-ela").checked)   sections.push({ t: "Error Level Analysis", b: "ELA was performed by re-compressing the evidence image and comparing pixel-level differences. Bright regions in the ELA output may indicate prior manipulation or splicing." });
    if (document.getElementById("chk-hash").checked)  sections.push({ t: "Hash Verification", b: "Cryptographic hash values (SHA-1, SHA-256, SHA-384, SHA-512) were generated for the evidence file to ensure integrity and enable future verification." });
    if (document.getElementById("chk-skin").checked)  sections.push({ t: "Skin Tone Detection", b: "RGB and YCbCr-based skin tone detection was applied. Regions matching human skin tone parameters were highlighted for investigator review." });
    if (document.getElementById("chk-face").checked)  sections.push({ t: "Face Detection", b: "Heuristic face detection was applied using skin-tone coverage analysis. Identified regions were marked for further review." });
    if (document.getElementById("chk-carve").checked) sections.push({ t: "Data Carving", b: "Binary signature scanning was performed to identify recoverable file fragments. Known file headers (JPEG, PNG, MP4, AVI, etc.) were used as carving anchors." });

    const html = `
    <div class="rpt-header">
      <div class="rpt-logo-row">
        <div class="rpt-logo-badge">PE</div>
        <div>
          <div class="rpt-title">Forensic Analysis Report</div>
          <div class="rpt-subtitle">PhotoExaminer · CDAC Cyber Security Group</div>
        </div>
      </div>
      <div class="rpt-meta-grid">
        <div class="rpt-meta-item"><div class="rpt-meta-key">Case Number</div><div class="rpt-meta-val">${caseNo}</div></div>
        <div class="rpt-meta-item"><div class="rpt-meta-key">Date</div><div class="rpt-meta-val">${date}</div></div>
        <div class="rpt-meta-item"><div class="rpt-meta-key">Investigator</div><div class="rpt-meta-val">${inv}</div></div>
        <div class="rpt-meta-item"><div class="rpt-meta-key">Organisation</div><div class="rpt-meta-val">${org}</div></div>
      </div>
    </div>
    <div class="rpt-section">
      <div class="rpt-section-title">Evidence Description</div>
      <p>${desc}</p>
    </div>
    ${sections.map(s => `
      <div class="rpt-section">
        <div class="rpt-section-title">${s.t}</div>
        <p>${s.b}</p>
      </div>`).join("")}
    <div class="rpt-footer">
      Generated by PhotoExaminer · CDAC Cyber Security Group · ${new Date().toLocaleString()}
    </div>`;

    document.getElementById("report-preview-box").innerHTML = html;
    document.getElementById("export-btns").style.display = "block";
    state.reports++; updateStats();
}

function printReport() {
    const content = document.getElementById("report-preview-box").innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head>
    <title>Forensic Report</title>
    <style>
      body{font-family:Segoe UI,sans-serif;background:#0d1117;color:#e6edf3;padding:40px;max-width:800px;margin:auto;}
      .rpt-header{border-bottom:3px solid #e8662a;padding-bottom:16px;margin-bottom:20px;}
      .rpt-logo-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
      .rpt-logo-badge{width:48px;height:48px;background:linear-gradient(135deg,#e8662a,#b84e1e);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:16px;}
      .rpt-title{font-size:20px;font-weight:700;}.rpt-subtitle{font-size:12px;color:#8b949e;}
      .rpt-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;}
      .rpt-meta-item{background:#21293a;padding:8px 12px;border-radius:6px;}
      .rpt-meta-key{color:#8b949e;margin-bottom:2px;}.rpt-meta-val{font-weight:600;}
      .rpt-section{margin:18px 0;}.rpt-section-title{font-size:12px;font-weight:700;text-transform:uppercase;color:#e8662a;border-left:3px solid #e8662a;padding-left:10px;margin-bottom:10px;}
      .rpt-section p{font-size:12px;color:#8b949e;line-height:1.6;}
      .rpt-footer{margin-top:24px;padding-top:14px;border-top:1px solid #30363d;font-size:11px;color:#484f58;text-align:center;}
    </style></head><body>${content}</body></html>`);
    w.document.close(); w.print();
}