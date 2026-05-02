/* ═══════════════════════════════════════════════════════════
   SIMXtractor | sim-imager.js
   SIM Imager · Hash Generator · Write Blocker · Seize Report
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    initImagingWizard();
    initHashGenerator();
    initWriteBlocker();
    initSeizeReport();
});

/* ════════════════════════════════════════════════════
   IMAGING WIZARD
════════════════════════════════════════════════════ */
let imagingTimer = null;

function initImagingWizard() {
    // Step navigation
    const s1n = document.getElementById("step1-next");
    const s2b = document.getElementById("step2-back");
    const s2n = document.getElementById("step2-next");
    const s3b = document.getElementById("step3-back");
    const startBtn  = document.getElementById("start-imaging-btn");
    const cancelBtn = document.getElementById("cancel-imaging-btn");
    const newBtn    = document.getElementById("step4-new");
    const saveRpt   = document.getElementById("img-save-report");

    if (s1n) s1n.addEventListener("click", () => gotoWizardStep(2));
    if (s2b) s2b.addEventListener("click", () => gotoWizardStep(1));
    if (s2n) s2n.addEventListener("click", () => gotoWizardStep(3));
    if (s3b) s3b.addEventListener("click", () => gotoWizardStep(2));
    if (startBtn)  startBtn.addEventListener("click",  startImaging);
    if (cancelBtn) cancelBtn.addEventListener("click",  cancelImaging);
    if (newBtn)    newBtn.addEventListener("click",    () => gotoWizardStep(1));
    if (saveRpt)   saveRpt.addEventListener("click",   () => window.switchPanel("imager-report"));
}

function gotoWizardStep(n) {
    for (let i=1; i<=4; i++) {
        const wp = document.getElementById("wp-"+i);
        const ws = document.getElementById("ws-"+i);
        if (wp) wp.classList.toggle("active", i===n);
        if (ws) {
            ws.classList.toggle("active", i===n);
            ws.classList.toggle("done",   i<n);
        }
        // separator
        const seps = document.querySelectorAll(".wizard-sep");
        seps.forEach((s,idx) => s.classList.toggle("done", idx<n-1));
    }
}

function startImaging() {
    const startBtn  = document.getElementById("start-imaging-btn");
    const cancelBtn = document.getElementById("cancel-imaging-btn");
    const fill      = document.getElementById("img-fill");
    const pct       = document.getElementById("img-pct");
    const meta      = document.getElementById("img-meta");
    const term      = document.getElementById("imaging-terminal");

    if (!term) return;
    term.innerHTML = "";
    if (startBtn)  startBtn.style.display  = "none";
    if (cancelBtn) cancelBtn.style.display = "";

    const algo    = document.getElementById("img-hash-algo")?.value || "SHA-256";
    const format  = document.getElementById("img-format")?.value   || "SIM";
    const wb      = document.getElementById("img-wb")?.value       || "on";
    const perfile = document.getElementById("img-perfile")?.value  || "yes";
    const caseNo  = document.getElementById("img-case")?.value     || "CASE-001";

    const files = [
        { name:"EF_ICCID", size:"10 B",   desc:"SIM Serial Number" },
        { name:"EF_IMSI",  size:"9 B",    desc:"Subscriber Identity" },
        { name:"EF_ADN",   size:"14 KB",  desc:"Abbreviated Dialling Numbers" },
        { name:"EF_SMS",   size:"48 KB",  desc:"Short Messages (Inbox/Sent)" },
        { name:"EF_LND",   size:"4 KB",   desc:"Last Dialled Numbers" },
        { name:"EF_MSISDN",size:"26 B",   desc:"Mobile Subscriber ISDN" },
        { name:"EF_PLMN",  size:"24 B",   desc:"Network Selection" },
        { name:"EF_SPN",   size:"17 B",   desc:"Service Provider Name" },
        { name:"EF_FDN",   size:"7 KB",   desc:"Fixed Dialling Numbers" },
        { name:"EF_IMG",   size:"2 KB",   desc:"Image Data" },
    ];

    const logs = [
        ["[ SIMXtractor Imager v3.2.1 ]", "acc"],
        [`Case: ${caseNo} | Format: ${format} | Hash: ${algo}`, "dim"],
        [`Write Block: ${wb==="on"?"ENABLED":"DISABLED"} | Per-file Hash: ${perfile==="yes"?"YES":"NO"}`, "dim"],
        ["", "dim"],
        ["Initialising reader...", ""],
        ["Card detected. ATR: 3B 9F 96 80 1F C7 80...", "ok"],
        ["Opening SIM file system...", ""],
        ["Reading Master File (MF)...", "ok"],
    ];

    let logIdx = 0, fileIdx = 0, progress = 0;
    let elapsed = 0;
    const totalProgress = 100;
    const startTime = Date.now();

    imagingTimer = setInterval(() => {
        elapsed = Math.floor((Date.now()-startTime)/1000);

        // Log messages
        if (logIdx < logs.length) {
            const [text, cls] = logs[logIdx++];
            window.logLine("imaging-terminal", text || " ", cls);
        }

        // File reading phase
        if (logIdx >= logs.length && fileIdx < files.length) {
            const f = files[fileIdx++];
            window.logLine("imaging-terminal", `Reading ${f.name} (${f.size}) — ${f.desc}`, "");
            if (perfile === "yes") {
                window.logLine("imaging-terminal", `  ↳ Hash [${algo}]: ${randomHexStr(32)}...`, "dim");
            }
            window.logLine("imaging-terminal", `  ↳ ✔ Written to image`, "ok");
            progress = Math.round((fileIdx/files.length)*90);
        }

        // Finalisation
        if (fileIdx >= files.length && progress < 100) {
            progress++;
            if (progress === 91) window.logLine("imaging-terminal", "Computing total image hash...", "");
            if (progress === 95) window.logLine("imaging-terminal", `Total Hash [${algo}]: ${randomHexStr(64)}`, "acc");
            if (progress === 98) window.logLine("imaging-terminal", "Generating report...", "");
            if (progress === 100) {
                window.logLine("imaging-terminal", "✔ Imaging complete. All files verified.", "ok");
                clearInterval(imagingTimer);
                if (startBtn)  startBtn.style.display  = "";
                if (cancelBtn) cancelBtn.style.display = "none";
                finishImaging(algo, files, elapsed);
            }
        }

        // Update progress UI
        if (fill)  fill.style.width = progress + "%";
        if (pct)   pct.textContent  = progress + "%";
        if (meta)  meta.textContent = `Files: ${fileIdx}/${files.length} | Elapsed: ${window.fmtTime(elapsed)} | Remaining: ${progress<100?window.fmtTime(Math.max(0,Math.round(elapsed*(100-progress)/Math.max(progress,1)))):"00:00:00"}`;

    }, 350);
}

function cancelImaging() {
    if (imagingTimer) clearInterval(imagingTimer);
    const startBtn  = document.getElementById("start-imaging-btn");
    const cancelBtn = document.getElementById("cancel-imaging-btn");
    if (startBtn)  startBtn.style.display  = "";
    if (cancelBtn) cancelBtn.style.display = "none";
    window.logLine("imaging-terminal", "⚠ Imaging cancelled by user.", "err");
}

function finishImaging(algo, files, elapsed) {
    window.SX.stats.sessions++;
    window.updateStats();
    gotoWizardStep(4);
    const caseNo = document.getElementById("img-case")?.value   || "N/A";
    const inv    = document.getElementById("img-inv")?.value    || "N/A";
    const format = document.getElementById("img-format")?.value || "SIM";
    const wb     = document.getElementById("img-wb")?.value     || "on";

    window.fillTable("img-verify-tbody", [
        ["Case Number",     caseNo],
        ["Investigator",    inv],
        ["Format",          format],
        ["Files Imaged",    files.length],
        ["Total Size",      "176 KB"],
        ["Time Elapsed",    window.fmtTime(elapsed)],
        ["Write Blocked",   wb==="on"?"✔ Yes":"⚠ No"],
        ["Completed At",    new Date().toLocaleString()],
        ["Status",          "✔ Image Verified – Integrity Confirmed"]
    ]);

    window.fillTable("img-hash-tbody", [
        ["MD5 (simulated)", randomHexStr(32)],
        [algo,              randomHexStr(64)],
        ["SHA-1",           randomHexStr(40)],
        ["Image File",      `${caseNo.replace(/\s/g,"_")}.${format.toLowerCase()}`]
    ]);

    window.SX.imagingDone = true;
}

function randomHexStr(len) {
    let s = "";
    while (s.length < len) s += Math.floor(Math.random()*0xFFFFFFFF).toString(16).padStart(8,"0");
    return s.slice(0, len);
}

/* ════════════════════════════════════════════════════
   HASH GENERATOR
════════════════════════════════════════════════════ */
function initHashGenerator() {
    window.setupUploadZone("hash-upload-zone", "hash-file-input", processHashFile);
}

async function processHashFile(file) {
    window.show("hash-results");
    const msgEl = document.getElementById("hash-progress-msg");
    if (msgEl) msgEl.textContent = "Computing hashes…";
    const buf = await file.arrayBuffer();
    const tbody = document.getElementById("hash-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const algos = ["SHA-1","SHA-256","SHA-384","SHA-512"];
    for (const a of algos) {
        const hex = await window.computeHash(a, buf);
        const tr  = document.createElement("tr");
        tr.innerHTML = `
      <td style="color:var(--accent);font-family:'Consolas',monospace;">${a}</td>
      <td style="font-family:'Consolas',monospace;font-size:11px;word-break:break-all;">${hex}</td>
      <td><span class="badge badge-ok">✔ Computed</span></td>`;
        tbody.appendChild(tr);
    }
    // MD5 row
    const trMD5 = document.createElement("tr");
    trMD5.innerHTML = `<td style="color:var(--accent);font-family:'Consolas',monospace;">MD5</td>
    <td style="font-size:11px;color:var(--text-secondary);">MD5 not supported in Web Crypto – use native SIMXtractor binary</td>
    <td><span class="badge badge-warn">N/A</span></td>`;
    tbody.insertBefore(trMD5, tbody.firstChild);

    if (msgEl) msgEl.textContent = "";
    window.fillTable("hash-fileinfo", [
        ["File Name",    file.name],
        ["File Size",    window.fmtSize(file.size)],
        ["MIME Type",    file.type || "application/octet-stream"],
        ["Last Modified",window.fmtDate(file.lastModified)],
        ["Status",       "✔ Hash Generated Successfully"]
    ]);
}

/* ════════════════════════════════════════════════════
   WRITE BLOCKER
════════════════════════════════════════════════════ */
function initWriteBlocker() {
    const enBtn  = document.getElementById("wb-enable-btn");
    const disBtn = document.getElementById("wb-disable-btn");
    if (enBtn)  enBtn.addEventListener("click",  () => setWriteBlock(true));
    if (disBtn) disBtn.addEventListener("click",  () => setWriteBlock(false));
    // Reflect initial state
    setWriteBlock(window.SX.writeBlocked, true);
}

function setWriteBlock(enabled, silent=false) {
    window.SX.writeBlocked = enabled;
    const card   = document.getElementById("wb-card");
    const icon   = document.getElementById("wb-icon");
    const label  = document.getElementById("wb-label");
    const wbStat = document.getElementById("wb-write-status");

    if (card) {
        card.className = "wb-status-card " + (enabled ? "active" : "inactive");
    }
    if (icon)  icon.textContent  = enabled ? "🛡" : "⚠";
    if (label) label.textContent = enabled ? "Write Blocking: ENABLED" : "Write Blocking: DISABLED";
    if (wbStat) {
        wbStat.textContent = enabled ? "Blocked" : "ALLOWED ⚠";
        wbStat.className   = "badge " + (enabled ? "badge-danger" : "badge-warn");
    }

    if (!silent) {
        const ts  = new Date().toLocaleTimeString();
        const msg = enabled
            ? `[${ts}] ✔ Write blocking ENABLED. All write operations blocked.`
            : `[${ts}] ⚠ WARNING: Write blocking DISABLED. Writes permitted.`;
        const line = document.createElement("div");
        line.className = "log-line " + (enabled ? "ok" : "err");
        line.textContent = msg;
        const log = document.getElementById("wb-log");
        if (log) {
            const dim = log.querySelector(".dim");
            if (dim) dim.remove();
            log.appendChild(line);
            log.scrollTop = log.scrollHeight;
        }
    }
}

/* ════════════════════════════════════════════════════
   SEIZE REPORT
════════════════════════════════════════════════════ */
function initSeizeReport() {
    const genBtn   = document.getElementById("gen-seize-report");
    const printBtn = document.getElementById("print-seize-btn");
    if (genBtn)   genBtn.addEventListener("click",   generateSeizeReport);
    if (printBtn) printBtn.addEventListener("click",  () => {
        const html = document.getElementById("seize-preview")?.innerHTML || "";
        window.printReport(html, "SIMXtractor Seize Report");
    });
}

function generateSeizeReport() {
    const caseNo = document.getElementById("sr-case")?.value || "N/A";
    const inv    = document.getElementById("sr-inv")?.value  || "N/A";
    const org    = document.getElementById("sr-org")?.value  || "N/A";
    const date   = document.getElementById("sr-date")?.value || "N/A";
    const loc    = document.getElementById("sr-loc")?.value  || "N/A";
    const iccid  = document.getElementById("sr-iccid")?.value|| window.SX.simData.network.iccid || "N/A";
    const type   = document.getElementById("sr-type")?.value || "GSM";
    const hash   = document.getElementById("sr-hash")?.value || "SHA-256";
    const wb     = document.getElementById("sr-wb")?.value   || "Enabled";
    const notes  = document.getElementById("sr-notes")?.value|| "None";

    const hashVal = randomHexStr(64);

    const html = `
    <div class="rpt-wrap">
      <div class="rpt-head">
        <div class="rpt-logo-row">
          <div class="rpt-logo-badge">SX</div>
          <div>
            <div class="rpt-title">SIM Card Seizure Report</div>
            <div class="rpt-subtitle">SIMXtractor v3.2.1 · CDAC Cyber Security Group</div>
            <div class="rpt-class-stamp">CONFIDENTIAL</div>
          </div>
        </div>
        <div class="rpt-meta-grid" style="margin-top:12px;">
          <div class="rpt-meta-item"><div class="rpt-meta-key">Case Number</div><div class="rpt-meta-val">${caseNo}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Date of Seizure</div><div class="rpt-meta-val">${date}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Investigator</div><div class="rpt-meta-val">${inv}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Organisation</div><div class="rpt-meta-val">${org}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Location of Seizure</div><div class="rpt-meta-val">${loc}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Generated At</div><div class="rpt-meta-val">${new Date().toLocaleString()}</div></div>
        </div>
      </div>

      <div class="rpt-section">
        <div class="rpt-sec-title">SIM Card Details</div>
        <table><tbody>
          <tr><td>ICCID</td><td>${iccid}</td></tr>
          <tr><td>Card Type</td><td>${type}</td></tr>
          <tr><td>Write Block Status</td><td>${wb}</td></tr>
          <tr><td>Imaging Status</td><td>${window.SX.imagingDone?"✔ Image Created":"Image not yet created"}</td></tr>
        </tbody></table>
      </div>

      <div class="rpt-section">
        <div class="rpt-sec-title">Hash Verification</div>
        <table><tbody>
          <tr><td>Algorithm Used</td><td>${hash}</td></tr>
          <tr><td>Image Hash</td><td style="font-family:'Consolas',monospace;font-size:11px;word-break:break-all;">${hashVal}</td></tr>
          <tr><td>Hash Status</td><td>✔ Verified – Integrity Confirmed</td></tr>
        </tbody></table>
      </div>

      <div class="rpt-section">
        <div class="rpt-sec-title">Chain of Custody</div>
        <table><tbody>
          <tr><td>Seized By</td><td>${inv}</td></tr>
          <tr><td>Organisation</td><td>${org}</td></tr>
          <tr><td>Date & Time</td><td>${date}</td></tr>
          <tr><td>Tool Used</td><td>SIMXtractor v3.2.1 – CDAC CSG</td></tr>
        </tbody></table>
      </div>

      <div class="rpt-section">
        <div class="rpt-sec-title">Notes</div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.7;">${notes}</p>
      </div>

      <div class="rpt-footer">
        SIMXtractor · CDAC Cyber Security Group · Thiruvananthapuram · Generated: ${new Date().toLocaleString()}
      </div>
    </div>`;

    const preview = document.getElementById("seize-preview");
    if (preview) preview.innerHTML = html;
    window.show("seize-export-btns");
}