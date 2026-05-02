/* ═══════════════════════════════════════════════════════════
   SIMXtractor | core.js
   Global state · Navigation · Shared utilities
   No external dependencies.
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ─── GLOBAL STATE ──────────────────────────────────── */
window.SX = {
    readerConnected: false,
    cardDetected:    false,
    writeBlocked:    true,
    imagingDone:     false,
    imagesLoaded:    [],
    simData: {
        contacts: [],
        calls:    [],
        sms:      [],
        network:  {},
        deleted:  []
    },
    stats: { sessions:0, sms:0, calls:0, deleted:0 }
};

/* ─── PANEL LABEL MAP ───────────────────────────────── */
const LABELS = {
    "dashboard":         "Dashboard",
    "reader-connect":    "SIM Card Reader › Connect",
    "reader-info":       "SIM Card Reader › Info",
    "reader-carddetect": "SIM Card Reader › Card Detection",
    "imager-new":        "SIM Imager › New Session",
    "imager-hash":       "SIM Imager › Hash Generator",
    "imager-writeblocker":"SIM Imager › Write Blocker",
    "imager-report":     "SIM Imager › Seize Report",
    "analyser-load":     "SIM Analyser › Load Image",
    "analyser-calllogs": "SIM Analyser › Call Logs",
    "analyser-contacts": "SIM Analyser › Contacts",
    "analyser-sms":      "SIM Analyser › SMS Messages",
    "analyser-network":  "SIM Analyser › Network Info",
    "analyser-deleted":  "SIM Analyser › Deleted Recovery",
    "analyser-search":   "SIM Analyser › Search",
    "analyser-report":   "SIM Analyser › PDF Report"
};

/* ─── DOM READY ─────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSidebarToggle();
    initDateDefaults();
});

/* ─── NAVIGATION ────────────────────────────────────── */
function initNavigation() {
    const navItems    = document.querySelectorAll(".nav-item, .module-card[data-panel]");
    const panels      = document.querySelectorAll(".panel");
    const breadcrumb  = document.getElementById("breadcrumb");

    window.switchPanel = function(id) {
        panels.forEach(p => p.classList.remove("active"));
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        const target = document.getElementById("panel-" + id);
        if (target) target.classList.add("active");
        const match = document.querySelector(`.nav-item[data-panel="${id}"]`);
        if (match) match.classList.add("active");
        breadcrumb.textContent = LABELS[id] || id;
        window.scrollTo(0, 0);
    };

    navItems.forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const p = item.dataset.panel;
            if (p) window.switchPanel(p);
        });
    });
}

/* ─── SIDEBAR TOGGLE ────────────────────────────────── */
function initSidebarToggle() {
    const btn  = document.getElementById("sidebarToggle");
    const side = document.getElementById("sidebar");
    const main = document.getElementById("main-content");
    btn.addEventListener("click", () => {
        side.classList.toggle("collapsed");
        main.classList.toggle("expanded");
    });
}

/* ─── DATE DEFAULTS ─────────────────────────────────── */
function initDateDefaults() {
    const now = new Date().toISOString();
    const dt  = document.getElementById("img-datetime");
    if (dt) dt.value = now.slice(0,16);
    const sd  = document.getElementById("sr-date");
    if (sd) sd.value = now.slice(0,10);
    const ad  = document.getElementById("ar-date");
    if (ad) ad.value = now.slice(0,10);
}

/* ─── UPDATE STATS ──────────────────────────────────── */
window.updateStats = function() {
    const s = window.SX.stats;
    setText("st-sessions", s.sessions);
    setText("st-sms",      s.sms);
    setText("st-calls",    s.calls);
    setText("st-deleted",  s.deleted);
};

/* ═══════════════════════════════════════════════════════════
   SHARED UTILITY FUNCTIONS (all modules use these)
═══════════════════════════════════════════════════════════ */

/** Set text content safely */
window.setText = function(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
};

/** Show element */
window.show = function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "";
};

/** Hide element */
window.hide = function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
};

/** Format bytes to readable string */
window.fmtSize = function(bytes) {
    if (bytes < 1024)     return bytes + " B";
    if (bytes < 1048576)  return (bytes/1024).toFixed(1) + " KB";
    return (bytes/1048576).toFixed(2) + " MB";
};

/** Format timestamp */
window.fmtDate = function(ts) {
    return ts ? new Date(ts).toLocaleString() : "N/A";
};

/** Format seconds as HH:MM:SS */
window.fmtTime = function(s) {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return [h,m,sec].map(v=>String(v).padStart(2,"0")).join(":");
};

/** Random integer in range */
window.rndInt = function(a, b) { return Math.floor(Math.random()*(b-a+1))+a; };

/** Random element from array */
window.rndFrom = function(arr) { return arr[Math.floor(Math.random()*arr.length)]; };

/** Generate random phone number */
window.rndPhone = function() {
    const prefixes = ["+91","+44","+1","+49","+61","+33"];
    return rndFrom(prefixes) + " " + String(rndInt(7000000000,9999999999));
};

/** Generate random ICCID-like string */
window.rndICCID = function() {
    let s = "8991";
    for (let i=0;i<16;i++) s += rndInt(0,9);
    return s;
};

/** Generate random IMSI-like string */
window.rndIMSI = function() {
    const mcc = ["404","405","310","234","262","505"];
    const mnc = ["01","02","10","20","30"];
    let s = rndFrom(mcc)+rndFrom(mnc);
    while(s.length<15) s += rndInt(0,9);
    return s;
};

/** Fill table body from rows array [[key, val], ...] */
window.fillTable = function(tbodyId, rows) {
    const tb = document.getElementById(tbodyId);
    if (!tb) return;
    tb.innerHTML = rows.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
};

/** Append a log line to a terminal element */
window.logLine = function(termId, text, cls="") {
    const t = document.getElementById(termId);
    if (!t) return;
    const d = document.createElement("div");
    d.className = "terminal-line " + cls;
    d.textContent = text;
    t.appendChild(d);
    t.scrollTop = t.scrollHeight;
};

/** Wire upload zone (click + drag-drop) */
window.setupUploadZone = function(zoneId, inputId, cb) {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone) return;
    if (input) {
        zone.addEventListener("click", () => input.click());
        input.addEventListener("change", () => { if (input.files[0]) cb(input.files[0]); });
    } else {
        zone.addEventListener("click", cb);
    }
    zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("drag-over"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
    zone.addEventListener("drop", e => {
        e.preventDefault(); zone.classList.remove("drag-over");
        const f = e.dataTransfer.files[0];
        if (f && input) { try { input.files = e.dataTransfer.files; } catch(_){} cb(f); }
        else if (!input) cb(e);
    });
};

/** Web Crypto hash computation */
window.computeHash = async function(algo, buffer) {
    if (algo === "MD5") return "MD5 not supported in Web Crypto – use native tool";
    const algMap = { "SHA-1":"SHA-1","SHA-256":"SHA-256","SHA-512":"SHA-512","SHA-2":"SHA-256" };
    const digest = await crypto.subtle.digest(algMap[algo]||"SHA-256", buffer);
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
};

/** Animate a number counter */
window.animCounter = function(id, target, dur=800) {
    const el = document.getElementById(id); if(!el) return;
    let cur=0, start=null;
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts-start)/dur,1);
        el.textContent = Math.round(p*target);
        if (p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

/** Export array-of-objects as CSV download */
window.exportCSV = function(data, filename) {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const rows = [keys.join(","), ...data.map(r => keys.map(k => `"${String(r[k]||"").replace(/"/g,'""')}"`).join(","))];
    const blob = new Blob([rows.join("\n")], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
};

/** Print a report HTML string in a new window */
window.printReport = function(html, title="SIMXtractor Report") {
    const w = window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;background:#0a0e17;color:#e2e8f0;padding:40px;max-width:820px;margin:auto;}
      table{width:100%;border-collapse:collapse;font-size:12px;}
      td,th{padding:6px 10px;border:1px solid #1e2d3d;}
      .rpt-title{font-size:18px;font-weight:700;}
      .rpt-subtitle{font-size:11px;color:#8a9bb0;}
      .rpt-head{border-bottom:3px solid #f0c020;padding-bottom:14px;margin-bottom:18px;}
      .rpt-logo-badge{display:inline-flex;width:40px;height:40px;background:linear-gradient(135deg,#f0c020,#c89c00);border-radius:8px;align-items:center;justify-content:center;font-weight:900;color:#111;font-size:14px;margin-right:10px;vertical-align:middle;}
      .rpt-sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#f0c020;border-left:3px solid #f0c020;padding-left:8px;margin:14px 0 6px;}
      .rpt-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;}
      .rpt-meta-item{background:#1c2535;padding:6px 10px;border-radius:4px;}
      .rpt-meta-key{color:#8a9bb0;font-size:10px;}
      .rpt-footer{margin-top:20px;padding-top:10px;border-top:1px solid #1e2d3d;font-size:10px;color:#4a5568;text-align:center;}
    </style></head>
    <body>${html}</body></html>`);
    w.document.close();
    setTimeout(()=>w.print(), 400);
};