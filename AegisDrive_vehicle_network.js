/**
 * Global Network Telemetry Simulation
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-global-scan').addEventListener('click', (e) => {
        e.target.textContent = "Scanning FlexRay/CAN/ETH...";
        setTimeout(() => {
            e.target.textContent = "Run Security Audit";
            alert("Security Audit Complete.\nNo rogue MAC addresses detected.\nIPsec tunnels verified on Automotive Ethernet.");
        }, 1500);
    });
});