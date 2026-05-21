// Handles Adaptive Policy Enforcement logic
document.addEventListener('DOMContentLoaded', () => {
    const dbSlider = document.getElementById('policy-db-slider');
    const webSlider = document.getElementById('policy-web-slider');
    const btnUpdate = document.getElementById('btn-update-policy');
    const auditLog = document.getElementById('policy-audit-log');

    const threatGrid = document.getElementById('threat-hunting-grid');

    // Sync slider text
    if(dbSlider) dbSlider.addEventListener('input', (e) => document.getElementById('policy-db-val').textContent = e.target.value + '%');
    if(webSlider) webSlider.addEventListener('input', (e) => document.getElementById('policy-web-val').textContent = e.target.value + '%');

    if(btnUpdate) {
        btnUpdate.addEventListener('click', () => {
            const dbScore = dbSlider.value;
            const webScore = webSlider.value;

            const time = new Date().toISOString().substring(11, 19);
            const logHTML = `
                <div class="log-line">
                    <span class="log-time">[${time}]</span> 
                    <strong>POLICY UPDATE:</strong> Resource DB access requires ${dbScore}% Trust. DNS requires ${webScore}% Trust. Enforcing globally...
                </div>
            `;
            auditLog.insertAdjacentHTML('afterbegin', logHTML);
            window.AegisData.addLog(`Adaptive policies updated. Recalculating access permissions...`);
        });
    }

    // Populate Threat Hunting view
    if(threatGrid) {
        const threats = [
            { name: 'App ID: Shadow IT', desc: 'Detected unauthorized Cloud storage sync via port 443.' },
            { name: 'Traffic Profiling', desc: 'Baseline deviation: IoT-Sensor-Alpha uploading 500MB payload.' },
            { name: 'Rogue Device', desc: 'MAC FF:EE:DD:CC:BB:AA attempting brute force on internal AD.' },
            { name: 'Trust Score Decay', desc: 'Dev-Ops-01 trust score degraded due to missing critical OS patch.' }
        ];

        threats.forEach(t => {
            threatGrid.innerHTML += `
                <div class="threat-card">
                    <h4>${t.name}</h4>
                    <p>${t.desc}</p>
                </div>
            `;
        });
    }
});