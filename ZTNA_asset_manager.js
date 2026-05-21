// Handles the IAM and Asset Discovery Matrix
const assets = [
    { mac: '00:1A:2B:3C:4D:5E', user: 'Admin-Sys', os: 'Windows 11 (Corp)', score: 98, vuln: '0 Known', status: 'GRANTED' },
    { mac: 'AA:BB:CC:DD:EE:FF', user: 'Dev-Ops-01', os: 'Ubuntu 22.04 LTS', score: 85, vuln: '2 Low', status: 'GRANTED' },
    { mac: '11:22:33:44:55:66', user: 'IoT-Sensor-Alpha', os: 'RTOS Embedded', score: 62, vuln: '1 High', status: 'RESTRICTED' },
    { mac: 'FF:EE:DD:CC:BB:AA', user: 'UNKNOWN', os: 'Kali Linux', score: 12, vuln: 'Critical Threat', status: 'BLOCKED' }
];

function renderAssetTable() {
    const tbody = document.getElementById('asset-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    let rogueCount = 0;

    assets.forEach(asset => {
        const tr = document.createElement('tr');

        let statusBadge = 'safe';
        if(asset.status === 'RESTRICTED') statusBadge = 'warn';
        if(asset.status === 'BLOCKED') {
            statusBadge = 'danger';
            rogueCount++;
        }

        tr.innerHTML = `
            <td style="font-family: monospace">${asset.mac}</td>
            <td>${asset.user}</td>
            <td>${asset.os}</td>
            <td><strong style="color: ${asset.score > 80 ? 'var(--success)' : (asset.score > 50 ? 'var(--warning)' : 'var(--danger)')}">${asset.score}%</strong></td>
            <td>${asset.vuln}</td>
            <td><span class="badge ${statusBadge}">${asset.status}</span></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('rogue-device-count').textContent = rogueCount;

    // Update global indicator
    const health = document.getElementById('global-health-indicator');
    if(rogueCount > 0) {
        health.textContent = 'ROGUE DEVICE DETECTED';
        health.className = 'health-status danger';
    }
}

document.getElementById('btn-scan-network')?.addEventListener('click', (e) => {
    e.target.textContent = 'Scanning network footprints...';
    setTimeout(() => {
        e.target.textContent = 'Run Agent-less Scan';
        window.AegisData.addLog("Agent-less Asset scan completed. 4 devices identified.");
        renderAssetTable();
    }, 1500);
});

document.addEventListener('DOMContentLoaded', renderAssetTable);