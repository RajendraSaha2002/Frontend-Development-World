/**
 * Biometric Terminal Ingestion & Polling Station
 */
const AttendanceModule = (() => {
    const terminalLogConsole = document.getElementById('terminalRawConsole');

    function init() {
        renderTerminalList();
        bindEvents();
        startLiveLogStream();
    }

    function renderTerminalList() {
        const container = document.getElementById('terminalListContainer');
        if (!container) return;
        const terminals = AppState.get('terminals');

        container.innerHTML = terminals.map(t => `
      <div class="terminal-node">
        <div>
          <strong>${t.location}</strong>
          <div style="font-size:11px; color:#64748b;">IP: ${t.ip} | Handshake Pings: ${t.pings}</div>
        </div>
        <span class="badge badge-success">${t.state}</span>
      </div>
    `).join('');
    }

    function bindEvents() {
        document.getElementById('simulateTerminalPunch')?.addEventListener('click', () => {
            simulateBiometricScan();
        });

        document.getElementById('syncBioBtn')?.addEventListener('click', () => {
            NotificationsModule.dispatchAlert('SYSTEM', 'Biometric sync initiated across all gateways. All transactions verified.');
        });

        document.getElementById('exportAttendanceLogBtn')?.addEventListener('click', () => {
            ReportsModule.exportCSV([
                { PIN: 'EMP-1001', Name: 'Dr. Suresh Ray', Timestamp: '2024-08-25 08:58:12', Terminal: 'TERM-01', Status: 'VERIFIED' },
                { PIN: 'EMP-1002', Name: 'Ananya Sharma', Timestamp: '2024-08-25 09:02:40', Terminal: 'TERM-02', Status: 'VERIFIED' },
                { PIN: 'EMP-1003', Name: 'Rajeev Menon', Timestamp: '2024-08-25 09:14:02', Terminal: 'TERM-01', Status: 'LATE_COMP' }
            ], 'Biometric_Daily_Punches.csv');
        });
    }

    function simulateBiometricScan() {
        const emps = AppState.get('employees');
        const randomEmp = emps[Math.floor(Math.random() * emps.length)];
        const time = new Date().toLocaleTimeString();

        const entry = `[${time}] PUNCH_OK: RFID/FP matched for ${randomEmp.pin} (${randomEmp.name}) at Terminal 192.168.10.201`;
        appendRawConsole(entry);
        NotificationsModule.dispatchToast(`Biometric Scan Logged: ${randomEmp.name}`);
    }

    function appendRawConsole(str) {
        if (!terminalLogConsole) return;
        const line = document.createElement('div');
        line.textContent = str;
        terminalLogConsole.prepend(line);
    }

    function startLiveLogStream() {
        appendRawConsole(`[INITIALIZE] TCP/IP Socket listening on port 4370...`);
        appendRawConsole(`[INFO] Auto-sync daemon polling interval: 3000ms`);
    }

    return { init, simulateBiometricScan };
})();