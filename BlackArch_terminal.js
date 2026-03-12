const terminalOutput = document.getElementById('terminal-output');
const fakeLogs = [
    "[*] Booting BlackArch OS components...",
    "[*] Initializing network interfaces... eth0 [UP]",
    "[*] Mounting PostgreSQL data volumes...",
    "[+] Connected to local database.",
    "[*] Commencing automated subnet scan on 192.168.1.0/24",
    "[!] Warning: Anomaly detected on 192.168.1.105",
    "[*] Injecting payload... [FAILED]",
    "[*] Rerouting through proxy chain..."
];

let logIndex = 0;

function printLiveLog() {
    if (logIndex < fakeLogs.length) {
        terminalOutput.innerHTML += `<div>${fakeLogs[logIndex]}</div>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll to bottom
        logIndex++;
        // Randomize the typing speed for a realistic effect
        setTimeout(printLiveLog, Math.random() * 2500 + 500);
    }
}

// Start terminal simulation after 1 second
setTimeout(printLiveLog, 1000);