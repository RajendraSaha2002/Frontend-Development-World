/**
 * In-Vehicle Server PKI Lifecycle Simulator
 */
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('pki-lifecycle-log');
    const btnIssue = document.getElementById('btn-issue-cert');
    const btnRevoke = document.getElementById('btn-revoke-cert');

    const logToTerminal = (msg, type = '') => {
        const time = new Date().toISOString().substring(11, 19);
        const entry = document.createElement('div');
        entry.className = `log-line ${type}`;
        entry.textContent = `[${time}] ${msg}`;
        terminal.appendChild(entry);
        terminal.scrollTop = terminal.scrollHeight;
    };

    btnIssue.addEventListener('click', () => {
        logToTerminal("Generating ECDSA secp256r1 Keypair for new Telematics ECU...", "sys");
        setTimeout(() => logToTerminal("CSR generated. Sending to Automotive-CA (BLR) via secure channel."), 800);
        setTimeout(() => logToTerminal("CA signature verified. Certificate Issued. Serial: 0x8F4A...", "succ"), 2000);
    });

    btnRevoke.addEventListener('click', () => {
        logToTerminal("CRITICAL: Compromise detected on Sensor Domain ECU.", "err");
        setTimeout(() => logToTerminal("Initiating OCSP/CRL update to Central Gateway..."), 800);
        setTimeout(() => logToTerminal("Certificate Revoked. Device quarantined from CAN bus.", "succ"), 1800);
    });
});