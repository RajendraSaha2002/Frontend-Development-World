/**
 * Purdue Hierarchy Asset Manager
 * Simulates automated data parsing matching discovery layers mapped via Wazuh/SPAN.
 */
class AssetDiscoveryEngine {
    constructor() {
        this.assets = [
            { id: "ENT-SRV-01", layer: "Level 5", type: "Active Directory Domain Controller", ip: "10.100.10.4", vulnerabilities: "0 Critical", state: "Nominal" },
            { id: "DMZ-WZH-MX", layer: "Level 4", type: "Wazuh IT Log Aggregator Node", ip: "10.100.20.15", vulnerabilities: "1 Medium", state: "Nominal" },
            { id: "SCADA-HMI-01", layer: "Level 2", type: "Supervisory Operator Station Windows Terminal", ip: "192.168.50.10", vulnerabilities: "3 High", state: "Warning" },
            { id: "PLC-MOD-SUB01", layer: "Level 1", type: "Schneider Electric Modbus PLC", ip: "192.168.100.22", vulnerabilities: "0 Critical", state: "Nominal" },
            { id: "RTu-IEC-FEED02", layer: "Level 1", type: "ABB Remote Terminal Unit (IEC-104)", ip: "192.168.100.45", vulnerabilities: "Configuration Drift Detected", state: "Anomalous" }
        ];
        this.initPurdueHealthView();
        this.renderAssetTable();
        this.bindEvents();
    }

    initPurdueHealthView() {
        const wrapper = document.getElementById('purdue-health-indicators');
        if (!wrapper) return;
        wrapper.innerHTML = "";

        const mapping = [
            { lvl: "level-5", label: "Level 5: Enterprise Security Perimeter" },
            { lvl: "level-4", label: "Level 4: Logistics and DMZ Boundaries" },
            { lvl: "level-3", label: "Level 3: Operational Site Management" },
            { lvl: "level-2", label: "Level 2: Supervisory Console SCADA" },
            { lvl: "level-1", label: "Level 1: Local Automation PLCs" },
            { lvl: "level-0", label: "Level 0: Substation Sensors Grid" }
        ];

        mapping.forEach(item => {
            const node = document.createElement('div');
            node.className = `purdue-layer-node ${item.lvl}`;

            // Generate arbitrary drift markers matching sample dataset
            const isCompromised = item.lvl === 'level-1' || item.lvl === 'level-2';

            node.innerHTML = `
                <div class="purdue-layer-meta">
                    <span class="layer-num">${item.label}</span>
                    <span class="layer-nm">Wazuh Agents Online: ${isCompromised ? 'Drift Identified' : 'Verified Secure'}</span>
                </div>
                <span class="layer-integrity-status ${isCompromised ? 'compromised' : 'nominal'}">
                    ${isCompromised ? 'ATTACK VECTOR' : 'HEALTHY'}
                </span>
            `;
            wrapper.appendChild(node);
        });
    }

    renderAssetTable() {
        const body = document.getElementById('asset-matrix-table-body');
        if (!body) return;
        body.innerHTML = "";

        this.assets.forEach(asset => {
            const tr = document.createElement('tr');
            let badgeClass = 'clear';
            if (asset.state === 'Warning') badgeClass = 'warn';
            if (asset.state === 'Anomalous') badgeClass = 'danger';

            tr.innerHTML = `
                <td><strong>${asset.id}</strong></td>
                <td>${asset.layer}</td>
                <td>${asset.type}</td>
                <td>${asset.ip}</td>
                <td><span class="table-badge ${badgeClass}">${asset.vulnerabilities}</span></td>
                <td><span class="status-dot ${asset.state === 'Nominal' ? 'green' : (asset.state === 'Warning' ? 'yellow' : 'red')}"></span> ${asset.state}</td>
            `;
            body.appendChild(tr);
        });
    }

    bindEvents() {
        const btn = document.getElementById('trigger-asset-scan');
        if (btn) {
            btn.addEventListener('click', () => {
                btn.textContent = "Scanning SPAN Matrices...";
                setTimeout(() => {
                    btn.textContent = "Run SPAN Asset Discovery";
                    this.initPurdueHealthView();
                    this.renderAssetTable();
                }, 1200);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AssetDiscoveryEngineInstance = new AssetDiscoveryEngine();
});