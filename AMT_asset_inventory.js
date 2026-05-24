/**
 * Asset Inventory Manager
 * Tracks Authorized vs Unauthorized assets identified via passive scanning.
 */
class AssetInventory {
    constructor() {
        this.assets = [
            { mac: "00:1A:2B:3C:4D:5E", type: "AMT Server", level: "L4", ip: "10.10.1.5", os: "Windows Server 2022", auth: true },
            { mac: "00:1A:2B:3C:4D:5F", type: "Data Historian", level: "L3", ip: "10.10.2.20", os: "Linux Kernel 5.15", auth: true },
            { mac: "AA:BB:CC:DD:EE:11", type: "MTU (Master Terminal)", level: "L2", ip: "192.168.1.10", os: "Proprietary SCADA", auth: true },
            { mac: "AA:BB:CC:DD:EE:22", type: "Siemens S7 PLC", level: "L1", ip: "192.168.1.50", os: "Firmware v4.2", auth: true },
            { mac: "AA:BB:CC:DD:EE:33", type: "ABB RTU", level: "L1", ip: "192.168.1.51", os: "Firmware v2.1", auth: true },
            { mac: "FF:EE:DD:CC:BB:AA", type: "Unknown Laptop", level: "L2", ip: "192.168.1.115", os: "Kali Linux", auth: false }
        ];

        this.renderTable();
        this.updateMetrics();
        this.bindEvents();
    }

    renderTable() {
        const tbody = document.getElementById('asset-inventory-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        this.assets.forEach(asset => {
            const tr = document.createElement('tr');
            const authBadge = asset.auth ? '<span class="badge safe">Authorized</span>' : '<span class="badge danger">Unauthorized</span>';

            tr.innerHTML = `
                <td>${asset.mac}</td>
                <td>${asset.type}</td>
                <td>${asset.level}</td>
                <td>${asset.ip}</td>
                <td>${asset.os}</td>
                <td>${authBadge}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateMetrics() {
        let authCount = 0;
        let rogueCount = 0;
        this.assets.forEach(a => a.auth ? authCount++ : rogueCount++);

        document.getElementById('auth-asset-count').textContent = authCount;
        document.getElementById('rogue-asset-count').textContent = rogueCount;
    }

    bindEvents() {
        document.getElementById('btn-baseline')?.addEventListener('click', (e) => {
            e.target.textContent = "Baselining Network...";
            setTimeout(() => {
                // "Authorize" the rogue asset as part of a new baseline
                this.assets[5].auth = true;
                this.assets[5].type = "Contractor Maintenance PC";
                this.renderTable();
                this.updateMetrics();
                e.target.textContent = "Establish New Baseline";
            }, 1500);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.InventoryManager = new AssetInventory();
});