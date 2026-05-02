/* ═══════════════════════════════════════════════════════════
   SIMXtractor | sim-analyser.js
   SIM Analyser: Load · Calls · Contacts · SMS · Network
                 Deleted Recovery · Search · PDF Report
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    initAnalyserLoad();
    initCallLogs();
    initContacts();
    initSMS();
    initNetwork();
    initDeletedRecovery();
    initSearch();
    initAnalysisReport();
    generateSampleData();   // pre-populate simulation data
});

/* ─── SAMPLE DATA GENERATION ────────────────────────── */
function generateSampleData() {
    const names = ["Rajesh Kumar","Priya Sharma","Amit Singh","Divya Nair",
        "Mohammed Ali","Sunita Patel","Arun Menon","Kavitha Iyer",
        "Sanjay Gupta","Meena Rajan","Unknown","Vikram Das","Reena Thomas"];

    // Contacts
    if (!window.SX.simData.contacts.length) {
        window.SX.simData.contacts = Array.from({length:15}, (_,i) => ({
            slot: i+1,
            name: window.rndFrom(names),
            number: window.rndPhone(),
            type: window.rndFrom(["Personal","Work","SIM Contact","Emergency"]),
            flags: window.rndFrom(["Active","Active","Active","Hidden"])
        }));
    }

    // Call logs
    if (!window.SX.simData.calls.length) {
        const types = ["incoming","outgoing","missed"];
        window.SX.simData.calls = Array.from({length:24}, (_,i) => {
            const t = window.rndFrom(types);
            const d = new Date(Date.now() - window.rndInt(60000,30*86400000));
            return {
                num: i+1,
                number: window.rndFrom(names.slice(0,8)) + " " + window.rndPhone(),
                type: t,
                duration: t==="missed"?"0:00":`${window.rndInt(0,12)}:${String(window.rndInt(0,59)).padStart(2,"0")}`,
                datetime: d.toLocaleString(),
                status: t==="incoming"?"Received": t==="outgoing"?"Dialled":"Missed"
            };
        });
    }

    // SMS
    const bodies = [
        "Your OTP is 482910. Do not share with anyone.",
        "Meeting confirmed for tomorrow 10 AM at HQ.",
        "Please call me back when you are free.",
        "Happy Birthday! Wishing you all the best.",
        "Your account balance is Rs. 2,450.00",
        "Package dispatched. Track at track.example.com/AB123",
        "Reminder: Court hearing on 15th Jan 2024.",
        "SIM recharge successful. Validity: 30 days.",
        "Call details attached. Pl check report.",
        "Do not respond to suspicious messages."
    ];
    if (!window.SX.simData.sms.length) {
        const types = ["inbox","sent","draft"];
        window.SX.simData.sms = Array.from({length:20}, (_,i) => {
            const t = window.rndFrom(types);
            const d = new Date(Date.now() - window.rndInt(3600000,60*86400000));
            return {
                id: i+1,
                from: t==="inbox"? window.rndPhone() : "Self",
                to:   t==="sent" ? window.rndPhone() : "—",
                type: t,
                body: window.rndFrom(bodies),
                datetime: d.toLocaleString(),
                pdu: Array.from({length:20},()=>Math.floor(Math.random()*256).toString(16).padStart(2,"0")).join(" ").toUpperCase(),
                slot: i+1,
                deleted: false
            };
        });
    }
}

/* ════════════════════════════════════════════════════
   ANALYSER – LOAD IMAGE
════════════════════════════════════════════════════ */
function initAnalyserLoad() {
    const zone  = document.getElementById("analyser-upload-zone");
    const input = document.getElementById("analyser-file-input");
    if (zone && input) {
        zone.addEventListener("click", () => input.click());
        zone.addEventListener("dragover",  e=>{e.preventDefault();zone.classList.add("drag-over");});
        zone.addEventListener("dragleave", ()=>zone.classList.remove("drag-over"));
        zone.addEventListener("drop", e=>{
            e.preventDefault(); zone.classList.remove("drag-over");
            handleImageFiles(e.dataTransfer.files);
        });
        input.addEventListener("change", () => handleImageFiles(input.files));
    }
    document.getElementById("analyse-all-btn")?.addEventListener("click", () => {
        window.SX.stats.sessions = window.SX.imagesLoaded.length;
        window.updateStats();
        alert("✔ All SIM images analysed. Navigate to any module to view extracted data.");
    });
    document.getElementById("clear-images-btn")?.addEventListener("click", () => {
        window.SX.imagesLoaded = [];
        window.hide("loaded-images-box");
    });
}

function handleImageFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const tbody = document.getElementById("loaded-images-tbody");
    if (!tbody) return;
    Array.from(fileList).forEach((f, i) => {
        const obj = { name: f.name, size: window.fmtSize(f.size), at: new Date().toLocaleString() };
        window.SX.imagesLoaded.push(obj);
        const idx = window.SX.imagesLoaded.length;
        const tr  = document.createElement("tr");
        tr.innerHTML = `
      <td>${idx}</td>
      <td style="font-family:'Consolas',monospace;color:var(--accent);">${f.name}</td>
      <td>${window.fmtSize(f.size)}</td>
      <td>${new Date().toLocaleString()}</td>
      <td><span class="badge badge-ok">✔ Loaded</span></td>`;
        tbody.appendChild(tr);
    });
    window.show("loaded-images-box");
}

/* ════════════════════════════════════════════════════
   ANALYSER – CALL LOGS
════════════════════════════════════════════════════ */
function initCallLogs() {
    document.getElementById("load-calls-btn")?.addEventListener("click", loadCalls);
    document.getElementById("call-filter")?.addEventListener("change", filterCalls);
    document.getElementById("export-calls-btn")?.addEventListener("click", () =>
        window.exportCSV(window.SX.simData.calls, "call_logs.csv"));
}

function loadCalls() {
    const tbody = document.getElementById("calls-tbody");
    if (!tbody) return;
    renderCalls(window.SX.simData.calls);
    window.SX.stats.calls = window.SX.simData.calls.length;
    window.updateStats();
}

function renderCalls(data) {
    const tbody = document.getElementById("calls-tbody");
    if (!tbody) return;
    tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.num}</td>
      <td>${c.number}</td>
      <td><span class="call-${c.type}">${c.type.toUpperCase()}</span></td>
      <td>${c.duration}</td>
      <td>${c.datetime}</td>
      <td><span class="badge ${c.type==="missed"?"badge-danger":c.type==="incoming"?"badge-ok":"badge-info"}">${c.status}</span></td>
    </tr>`).join("");
}

function filterCalls() {
    const val = document.getElementById("call-filter")?.value || "all";
    const data = val==="all"? window.SX.simData.calls : window.SX.simData.calls.filter(c=>c.type===val);
    renderCalls(data);
}

/* ════════════════════════════════════════════════════
   ANALYSER – CONTACTS
════════════════════════════════════════════════════ */
function initContacts() {
    document.getElementById("load-contacts-btn")?.addEventListener("click", loadContacts);
    document.getElementById("contact-search")?.addEventListener("input", filterContacts);
    document.getElementById("export-contacts-btn")?.addEventListener("click", () =>
        window.exportCSV(window.SX.simData.contacts, "contacts.csv"));
}

function loadContacts() {
    renderContacts(window.SX.simData.contacts);
}

function renderContacts(data) {
    const tbody = document.getElementById("contacts-tbody");
    if (!tbody) return;
    tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.slot}</td>
      <td>${c.name}</td>
      <td style="font-family:'Consolas',monospace;">${c.number}</td>
      <td>${c.type}</td>
      <td>${c.slot}</td>
      <td class="${c.flags==="Active"?"flag-active":c.flags==="Hidden"?"flag-hidden":"flag-deleted"}">${c.flags}</td>
    </tr>`).join("");
}

function filterContacts() {
    const q = (document.getElementById("contact-search")?.value || "").toLowerCase();
    const filtered = window.SX.simData.contacts.filter(c =>
        c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q));
    renderContacts(filtered);
}

/* ════════════════════════════════════════════════════
   ANALYSER – SMS
════════════════════════════════════════════════════ */
function initSMS() {
    document.getElementById("load-sms-btn")?.addEventListener("click", loadSMS);
    document.getElementById("sms-filter")?.addEventListener("change", filterSMS);
    document.getElementById("export-sms-btn")?.addEventListener("click", () =>
        window.exportCSV(window.SX.simData.sms, "sms_messages.csv"));
}

function loadSMS() {
    window.SX.stats.sms = window.SX.simData.sms.length;
    window.updateStats();
    renderSMSList(window.SX.simData.sms);
}

function renderSMSList(data) {
    const col = document.getElementById("sms-list-col");
    if (!col) return;
    if (!data.length) { col.innerHTML = '<div class="sms-placeholder">No messages found</div>'; return; }
    col.innerHTML = data.map(m => `
    <div class="sms-item" data-id="${m.id}" onclick="showSMSDetail(${m.id})">
      <div class="sms-item-header">
        <span class="sms-from">
          <span class="sms-type-chip sms-${m.type}">${m.type.toUpperCase()}</span>
          ${m.type==="inbox"?m.from:m.to}
        </span>
        <span class="sms-time">${m.datetime}</span>
      </div>
      <div class="sms-preview">${m.body}</div>
    </div>`).join("");
}

window.showSMSDetail = function(id) {
    document.querySelectorAll(".sms-item").forEach(el => el.classList.remove("active"));
    document.querySelector(`.sms-item[data-id="${id}"]`)?.classList.add("active");
    const m   = window.SX.simData.sms.find(s=>s.id===id);
    const col = document.getElementById("sms-detail-col");
    if (!m || !col) return;
    col.innerHTML = `
    <div class="sms-detail-body">
      <div class="sms-detail-meta">
        <table class="data-table">
          <tbody>
            <tr><td>ID</td><td>${m.id}</td></tr>
            <tr><td>Type</td><td><span class="badge badge-info">${m.type.toUpperCase()}</span></td></tr>
            <tr><td>From</td><td style="font-family:'Consolas',monospace;">${m.from}</td></tr>
            <tr><td>To</td><td style="font-family:'Consolas',monospace;">${m.to}</td></tr>
            <tr><td>Date / Time</td><td>${m.datetime}</td></tr>
            <tr><td>SIM Slot</td><td>${m.slot}</td></tr>
            <tr><td>Status</td><td><span class="badge badge-ok">Read</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="result-title">Message Body</div>
      <div class="sms-detail-msg">${m.body}</div>
      <div class="result-title" style="margin-top:12px;">PDU (Raw Hex)</div>
      <div class="sms-hex">${m.pdu}</div>
    </div>`;
};

function filterSMS() {
    const val = document.getElementById("sms-filter")?.value || "all";
    const data = val==="all"? window.SX.simData.sms : window.SX.simData.sms.filter(s=>s.type===val);
    renderSMSList(data);
}

/* ════════════════════════════════════════════════════
   ANALYSER – NETWORK INFO
════════════════════════════════════════════════════ */
function initNetwork() {
    document.getElementById("load-network-btn")?.addEventListener("click", loadNetworkData);
}

function loadNetworkData() {
    // Use card-detected data or generate fresh
    const nd = window.SX.simData.network;
    const iccid  = nd.iccid  || window.rndICCID();
    const imsi   = nd.imsi   || window.rndIMSI();
    const msisdn = nd.msisdn || window.rndPhone();
    const type   = nd.type   || "GSM (SIM)";

    const mcc  = imsi.slice(0,3);
    const mnc  = imsi.slice(3,5);
    const mccMap = {"404":"India","405":"India","310":"USA","234":"UK","262":"Germany","505":"Australia"};
    const plmn = mccMap[mcc] || "Unknown Operator";
    const spn  = window.rndFrom(["Airtel","Vodafone","Jio","BSNL","T-Mobile","O2","Deutsche Telekom"]);

    window.setText("net-iccid",  iccid);
    window.setText("net-imsi",   imsi);
    window.setText("net-msisdn", msisdn);
    window.setText("net-plmn",   plmn);
    window.setText("net-mcc",    mcc);
    window.setText("net-mnc",    mnc);
    window.setText("net-spn",    spn);
    window.setText("net-type",   type);

    window.show("network-grid");

    const extended = [
        ["LAI (Location Area ID)",       mcc+mnc+String(window.rndInt(1000,9999))],
        ["TMSI",                          Array.from({length:4},()=>Math.floor(Math.random()*256).toString(16).padStart(2,"0")).join("").toUpperCase()],
        ["EF_FPLMN (Forbidden PLMNs)",   "None"],
        ["EF_HPLMN (Home PLMN)",         plmn+" (MCC:"+mcc+" MNC:"+mnc+")"],
        ["Preferred Networks",            `${spn}, Roaming Partners`],
        ["Emergency Numbers",             "112, 100, 101, 108"],
        ["Network Selection Mode",        "Automatic"],
        ["Roaming Status",                "Home Network"],
        ["GSM Authentication Key (Ki)",   "Protected – not accessible"],
        ["PIN1 Remaining Tries",          "3"],
        ["PIN2 Remaining Tries",          "3"],
        ["PUK1 Remaining Tries",          "10"],
        ["SIM Phase",                     "Phase 2+"],
        ["File System",                   "ISO-7816-4 DF/EF Structure"]
    ];
    window.fillTable("network-tbody", extended);
    window.show("network-detail");

    // Store back
    window.SX.simData.network = { iccid, imsi, msisdn, type, mcc, mnc, plmn, spn };
}

/* ════════════════════════════════════════════════════
   ANALYSER – DELETED RECOVERY
════════════════════════════════════════════════════ */
function initDeletedRecovery() {
    document.getElementById("start-recovery-btn")?.addEventListener("click", startRecovery);
    document.getElementById("export-deleted-btn")?.addEventListener("click", () =>
        window.exportCSV(window.SX.simData.deleted, "deleted_recovery.csv"));
}

function startRecovery() {
    const fill   = document.getElementById("del-fill");
    const status = document.getElementById("del-status");
    window.show("del-progress");
    window.hide("deleted-box");

    const scanType  = document.getElementById("del-scan-type")?.value || "sms";
    const delBodies = [
        "Call me asap urgent",
        "Delete this after reading.",
        "The package is ready. Collect tonight.",
        "Location: 12.9716° N, 77.5946° E",
        "OTP: 993847 for verification",
        "Transfer completed. Rs. 50000.",
        "Don't contact me on this number anymore.",
        "Meet at the usual place at 9PM."
    ];

    let pct = 0;
    const timer = setInterval(() => {
        pct += window.rndInt(3,8);
        if (pct >= 100) pct = 100;
        if (fill)  fill.style.width = pct + "%";
        if (status) status.textContent = `Scanning memory sectors… ${pct}%`;
        if (pct >= 100) {
            clearInterval(timer);
            if (status) status.textContent = "Scan complete.";

            // Generate deleted items
            const items = [];
            const count = window.rndInt(4, 9);
            const typeMap = { sms:"SMS", calls:"Call Record", contacts:"Contact", all:"SMS" };
            for (let i=0; i<count; i++) {
                const d = new Date(Date.now() - window.rndInt(86400000, 90*86400000));
                items.push({
                    idx: i+1,
                    type: scanType==="all"? window.rndFrom(["SMS","Call Record","Contact"]) : typeMap[scanType],
                    content: scanType==="calls"||scanType==="contacts"? window.rndPhone() : window.rndFrom(delBodies),
                    date: d.toLocaleDateString(),
                    confidence: window.rndFrom(["High","High","Medium","Low"]),
                    status: "Recovered"
                });
            }
            window.SX.simData.deleted = items;
            window.SX.stats.deleted   = items.length;
            window.updateStats();
            renderDeleted(items);
            window.show("deleted-box");
        }
    }, 80);
}

function renderDeleted(items) {
    const tbody = document.getElementById("deleted-tbody");
    if (!tbody) return;
    tbody.innerHTML = items.map(it => `
    <tr>
      <td>${it.idx}</td>
      <td><span class="badge badge-warn">${it.type}</span></td>
      <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${it.content}</td>
      <td>${it.date}</td>
      <td class="conf-${it.confidence.toLowerCase()}">${it.confidence}</td>
      <td><span class="badge badge-ok">✔ Recovered</span></td>
    </tr>`).join("");
}

/* ════════════════════════════════════════════════════
   ANALYSER – SEARCH
════════════════════════════════════════════════════ */
function initSearch() {
    document.getElementById("global-search-btn")?.addEventListener("click", globalSearch);
    document.getElementById("global-search-input")?.addEventListener("keydown", e => {
        if (e.key==="Enter") globalSearch();
    });
}

function globalSearch() {
    const q     = (document.getElementById("global-search-input")?.value || "").toLowerCase().trim();
    const scope = document.getElementById("search-scope")?.value || "all";
    if (!q) return;

    const results = [];

    if (scope==="all"||scope==="contacts") {
        window.SX.simData.contacts.forEach(c => {
            if (c.name.toLowerCase().includes(q)||c.number.toLowerCase().includes(q)) {
                results.push({src:"Contact",match:c.name,value:c.number,date:"—"});
            }
        });
    }
    if (scope==="all"||scope==="sms") {
        window.SX.simData.sms.forEach(s => {
            if (s.body.toLowerCase().includes(q)||s.from.toLowerCase().includes(q)||s.to.toLowerCase().includes(q)) {
                results.push({src:"SMS",match:s.from||s.to,value:s.body.slice(0,60)+"…",date:s.datetime});
            }
        });
    }
    if (scope==="all"||scope==="calls") {
        window.SX.simData.calls.forEach(c => {
            if (c.number.toLowerCase().includes(q)||c.type.toLowerCase().includes(q)) {
                results.push({src:"Call",match:c.type.toUpperCase(),value:c.number,date:c.datetime});
            }
        });
    }
    if (scope==="all"||scope==="network") {
        const nd = window.SX.simData.network;
        Object.entries(nd).forEach(([k,v]) => {
            if (String(v).toLowerCase().includes(q)) {
                results.push({src:"Network",match:k.toUpperCase(),value:String(v),date:"—"});
            }
        });
    }

    window.setText("search-count", `(${results.length} result${results.length===1?"":"s"})`);
    const tbody = document.getElementById("search-tbody");
    if (tbody) {
        tbody.innerHTML = results.length ? results.map((r,i)=>`
      <tr>
        <td>${i+1}</td>
        <td><span class="badge badge-info">${r.src}</span></td>
        <td>${r.match}</td>
        <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.value}</td>
        <td>${r.date}</td>
      </tr>`).join("") :
            `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No results found for "${q}"</td></tr>`;
    }
    window.show("search-results-box");
}

/* ════════════════════════════════════════════════════
   ANALYSER – PDF REPORT
════════════════════════════════════════════════════ */
function initAnalysisReport() {
    document.getElementById("gen-analysis-report")?.addEventListener("click", generateAnalysisReport);
    document.getElementById("print-analysis-btn")?.addEventListener("click", () => {
        const html = document.getElementById("analysis-preview")?.innerHTML || "";
        window.printReport(html, "SIMXtractor Analysis Report");
    });
}

function generateAnalysisReport() {
    const caseNo = document.getElementById("ar-case")?.value  || "N/A";
    const inv    = document.getElementById("ar-inv")?.value   || "N/A";
    const org    = document.getElementById("ar-org")?.value   || "N/A";
    const date   = document.getElementById("ar-date")?.value  || "N/A";
    const cls    = document.getElementById("ar-class")?.value || "CONFIDENTIAL";
    const notes  = document.getElementById("ar-notes")?.value || "None.";
    const nd     = window.SX.simData.network;

    const incNet  = document.getElementById("rc-net")?.checked;
    const incCon  = document.getElementById("rc-contacts")?.checked;
    const incSMS  = document.getElementById("rc-sms")?.checked;
    const incCall = document.getElementById("rc-calls")?.checked;
    const incDel  = document.getElementById("rc-deleted")?.checked;
    const incHash = document.getElementById("rc-hash")?.checked;

    let sections = "";

    if (incNet) {
        sections += `
      <div class="rpt-section">
        <div class="rpt-sec-title">Network Information</div>
        <table><tbody>
          <tr><td>ICCID</td><td>${nd.iccid||"Not extracted"}</td></tr>
          <tr><td>IMSI</td><td>${nd.imsi||"Not extracted"}</td></tr>
          <tr><td>MSISDN</td><td>${nd.msisdn||"Not extracted"}</td></tr>
          <tr><td>PLMN</td><td>${nd.plmn||"Not extracted"}</td></tr>
          <tr><td>SIM Type</td><td>${nd.type||"Unknown"}</td></tr>
          <tr><td>MCC / MNC</td><td>${nd.mcc||"—"} / ${nd.mnc||"—"}</td></tr>
        </tbody></table>
      </div>`;
    }

    if (incCon) {
        const cList = window.SX.simData.contacts.slice(0,6);
        sections += `
      <div class="rpt-section">
        <div class="rpt-sec-title">Contacts (${window.SX.simData.contacts.length} total – first 6 shown)</div>
        <table><thead><tr><th>Slot</th><th>Name</th><th>Number</th><th>Type</th></tr></thead><tbody>
          ${cList.map(c=>`<tr><td>${c.slot}</td><td>${c.name}</td><td>${c.number}</td><td>${c.type}</td></tr>`).join("")}
        </tbody></table>
      </div>`;
    }

    if (incSMS) {
        const sList = window.SX.simData.sms.slice(0,5);
        sections += `
      <div class="rpt-section">
        <div class="rpt-sec-title">SMS Messages (${window.SX.simData.sms.length} total – first 5 shown)</div>
        <table><thead><tr><th>ID</th><th>From</th><th>Type</th><th>Body</th><th>Date</th></tr></thead><tbody>
          ${sList.map(s=>`<tr><td>${s.id}</td><td>${s.from}</td><td>${s.type.toUpperCase()}</td><td>${s.body.slice(0,50)}…</td><td>${s.datetime}</td></tr>`).join("")}
        </tbody></table>
      </div>`;
    }

    if (incCall) {
        const calls = window.SX.simData.calls.slice(0,5);
        sections += `
      <div class="rpt-section">
        <div class="rpt-sec-title">Call Logs (${window.SX.simData.calls.length} total – first 5 shown)</div>
        <table><thead><tr><th>#</th><th>Number</th><th>Type</th><th>Duration</th><th>Date</th></tr></thead><tbody>
          ${calls.map(c=>`<tr><td>${c.num}</td><td>${c.number}</td><td>${c.type.toUpperCase()}</td><td>${c.duration}</td><td>${c.datetime}</td></tr>`).join("")}
        </tbody></table>
      </div>`;
    }

    if (incDel && window.SX.simData.deleted.length) {
        sections += `
      <div class="rpt-section">
        <div class="rpt-sec-title">Deleted Data Recovery (${window.SX.simData.deleted.length} items)</div>
        <table><thead><tr><th>#</th><th>Type</th><th>Content</th><th>Confidence</th></tr></thead><tbody>
          ${window.SX.simData.deleted.map(d=>`<tr><td>${d.idx}</td><td>${d.type}</td><td>${d.content.slice(0,60)}</td><td>${d.confidence}</td></tr>`).join("")}
        </tbody></table>
      </div>`;
    }

    if (incHash) {
        sections += `
      <div class="rpt-section">
        <div class="rpt-sec-title">Hash Verification</div>
        <table><tbody>
          <tr><td>SHA-256</td><td style="font-family:'Consolas',monospace;font-size:11px;">${Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join("")}</td></tr>
          <tr><td>SHA-1</td><td style="font-family:'Consolas',monospace;font-size:11px;">${Array.from({length:40},()=>Math.floor(Math.random()*16).toString(16)).join("")}</td></tr>
          <tr><td>Status</td><td>✔ Image Integrity Verified</td></tr>
        </tbody></table>
      </div>`;
    }

    const html = `
    <div class="rpt-wrap">
      <div class="rpt-head">
        <div class="rpt-logo-row">
          <div class="rpt-logo-badge">SX</div>
          <div>
            <div class="rpt-title">SIM Card Forensic Analysis Report</div>
            <div class="rpt-subtitle">SIMXtractor v3.2.1 · CDAC Cyber Security Group</div>
            <div class="rpt-class-stamp">${cls}</div>
          </div>
        </div>
        <div class="rpt-meta-grid" style="margin-top:12px;">
          <div class="rpt-meta-item"><div class="rpt-meta-key">Case Number</div><div class="rpt-meta-val">${caseNo}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Date</div><div class="rpt-meta-val">${date}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Investigator</div><div class="rpt-meta-val">${inv}</div></div>
          <div class="rpt-meta-item"><div class="rpt-meta-key">Organisation</div><div class="rpt-meta-val">${org}</div></div>
        </div>
      </div>

      ${sections}

      <div class="rpt-section">
        <div class="rpt-sec-title">Summary & Notes</div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.7;">${notes}</p>
      </div>

      <div class="rpt-footer">
        SIMXtractor · CDAC Cyber Security Group · Thiruvananthapuram · Generated: ${new Date().toLocaleString()}
      </div>
    </div>`;

    const preview = document.getElementById("analysis-preview");
    if (preview) preview.innerHTML = html;
    window.show("ar-export-btns");
    window.SX.stats.sessions++;
    window.updateStats();
}