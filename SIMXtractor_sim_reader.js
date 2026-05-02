/* ═══════════════════════════════════════════════════════════
   SIMXtractor | sim-reader.js
   SIM Card Reader: Connect · Reader Info · Card Detection
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    initReaderConnect();
    initCardDetect();
});

/* ════════════════════════════════════════════════════
   READER CONNECT PANEL
════════════════════════════════════════════════════ */
function initReaderConnect() {
    const detectBtn     = document.getElementById("detect-reader-btn");
    const disconnectBtn = document.getElementById("disconnect-reader-btn");
    if (detectBtn)     detectBtn.addEventListener("click", detectReader);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectReader);
}

function detectReader() {
    // Simulate reader detection sequence
    const led      = document.getElementById("usb-led");
    const infoBox  = document.getElementById("reader-conn-info");
    const statusBox = document.getElementById("reader-status-box");

    if (led) { led.className = "usb-led"; }
    if (infoBox) infoBox.innerHTML = "<p>🔍 Scanning USB ports for SIMXtractor reader...</p>";

    setTimeout(() => {
        window.SX.readerConnected = true;
        if (led) led.className = "usb-led on";
        updateDeviceStatus(true, "Reader Connected");

        if (infoBox) infoBox.innerHTML = `
      <p><strong style="color:var(--green);">✔ SIMXtractor Reader Detected</strong></p>
      <p>Port: <strong>USB 2.0 – COM7</strong></p>
      <p>Vendor ID: <strong>0x04CC</strong> | Product ID: <strong>0x1A1B</strong></p>
      <p>Driver: SIMXtractor USB Driver v3.2.1 — <span style="color:var(--green);">Active</span></p>
      <p>PC/SC: <span style="color:var(--green);">Connected · T=0/T=1</span></p>
    `;

        window.fillTable("reader-status-tbody", [
            ["Device Name",    "SIMXtractor USB SIM Card Reader"],
            ["Port",           "USB 2.0 – COM7"],
            ["Vendor ID",      "0x04CC"],
            ["Product ID",     "0x1A1B"],
            ["Driver Version", "v3.2.1"],
            ["PC/SC Protocol", "T=0 / T=1"],
            ["Max Voltage",    "5V / 3.3V / 1.8V"],
            ["Status",         "✔ Connected & Ready"],
            ["Write Blocker",  window.SX.writeBlocked ? "✔ Enabled" : "⚠ Disabled"],
            ["ISO Standard",   "ISO-7816"],
            ["Firmware",       "FW-2024.09.15"],
        ]);
        window.show("reader-status-box");
    }, 1400);
}

function disconnectReader() {
    window.SX.readerConnected = false;
    window.SX.cardDetected    = false;
    const led = document.getElementById("usb-led");
    if (led) { led.className = "usb-led off"; setTimeout(()=>{led.className="usb-led";}, 1200); }
    updateDeviceStatus(false, "No Device");
    const infoBox = document.getElementById("reader-conn-info");
    if (infoBox) infoBox.innerHTML = "<p>Reader disconnected. Re-insert device and click Detect.</p>";
    window.hide("reader-status-box");
}

function updateDeviceStatus(on, label) {
    const dot   = document.getElementById("status-dot");
    const lbl   = document.getElementById("status-label");
    if (dot) dot.className = "dot " + (on ? "dot-on" : "dot-off");
    if (lbl) lbl.textContent = label;
}

/* ════════════════════════════════════════════════════
   CARD DETECTION PANEL
════════════════════════════════════════════════════ */
function initCardDetect() {
    const zone       = document.getElementById("card-detect-zone");
    const detectBtn  = document.getElementById("detect-card-btn");
    const ejectBtn   = document.getElementById("eject-card-btn");

    if (zone)      zone.addEventListener("click", simulateCardInsert);
    if (detectBtn) detectBtn.addEventListener("click", detectCard);
    if (ejectBtn)  ejectBtn.addEventListener("click", ejectCard);
}

function simulateCardInsert() {
    const zone = document.getElementById("card-detect-zone");
    if (zone) {
        zone.classList.add("detected");
        const t = zone.querySelector(".upload-text");
        if (t) t.textContent = "📶 SIM Card Inserted – Click Detect to Read";
        setTimeout(() => zone.classList.remove("detected"), 3000);
    }
}

function detectCard() {
    if (!window.SX.readerConnected) {
        alert("⚠ No reader connected. Please connect the SIM Card Reader first.");
        return;
    }

    const resultBox = document.getElementById("card-detect-result");
    const tbody     = document.getElementById("card-info-tbody");
    if (!resultBox || !tbody) return;

    // Generate realistic SIM card data
    const types    = ["GSM (SIM)", "GSM (USIM)", "CDMA (RUIM)", "GSM (ISIM)"];
    const voltages = ["1.8V", "3.3V", "5V", "1.8V / 3.3V"];
    const atrs     = [
        "3B 9F 96 80 1F C7 80 31 E0 73 FE 21 13 67 D0 00 61 82 91 00 04",
        "3B 7F 18 00 00 00 31 C0 73 9E 01 0B 64 FF 40 14 19 A8 83 02 90 00",
        "3B FA 18 00 00 81 31 FE 45 4A 33 41 33 32 31 35 33 30 37 33 36 30"
    ];
    const simType = window.rndFrom(types);

    window.SX.cardDetected = true;
    window.SX.simData.network = {
        iccid:  window.rndICCID(),
        imsi:   window.rndIMSI(),
        msisdn: window.rndPhone(),
        type:   simType,
        atr:    window.rndFrom(atrs),
        voltage:window.rndFrom(voltages)
    };

    updateDeviceStatus(true, "Card Detected");

    window.fillTable("card-info-tbody", [
        ["Card Type",       simType],
        ["ICCID",           window.SX.simData.network.iccid],
        ["IMSI",            window.SX.simData.network.imsi],
        ["ATR",             window.SX.simData.network.atr],
        ["Voltage Class",   window.SX.simData.network.voltage],
        ["Protocol",        "T=0"],
        ["ISO Standard",    "ISO-7816"],
        ["Detected At",     new Date().toLocaleString()],
        ["Write Protected", window.SX.writeBlocked ? "✔ Yes" : "⚠ No"],
        ["Card Status",     "✔ Active & Readable"],
        ["PIN Status",      "PIN1 Enabled · Verified"],
        ["Remaining PINs",  "3"],
        ["ADM Lock",        "Not Locked"]
    ]);

    window.show("card-detect-result");

    // Show SIM type badge in header
    const badge = document.getElementById("gsm-badge");
    if (badge) {
        badge.textContent = simType.includes("CDMA") ? "CDMA" : "GSM";
        badge.style.color = simType.includes("CDMA") ? "var(--purple)" : "var(--accent)";
    }
}

function ejectCard() {
    window.SX.cardDetected = false;
    window.hide("card-detect-result");
    updateDeviceStatus(window.SX.readerConnected, window.SX.readerConnected ? "Reader Connected" : "No Device");
    const t = document.querySelector("#card-detect-zone .upload-text");
    if (t) t.textContent = "Click to Simulate Card Insertion / Detection";
    const badge = document.getElementById("gsm-badge");
    if (badge) { badge.textContent = "GSM/CDMA"; badge.style.color=""; }
}