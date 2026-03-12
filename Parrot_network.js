// ============================================================
// network.js — Network Scanner UI & Visual Host Map
// ============================================================

const Network = (() => {

    let scanBtn, rangeBtn, scanTarget, rangeInput, scanResults, rangeResults;

    function init() {
        scanBtn     = document.getElementById('scan-btn');
        rangeBtn    = document.getElementById('range-btn');
        scanTarget  = document.getElementById('scan-target');
        rangeInput  = document.getElementById('range-input');
        scanResults = document.getElementById('scan-results');
        rangeResults= document.getElementById('range-results');

        if (scanBtn)  scanBtn.addEventListener('click', runPortScan);
        if (rangeBtn) rangeBtn.addEventListener('click', runRangeScan);

        // Allow Enter key trigger
        if (scanTarget)  scanTarget.addEventListener('keydown', e => e.key === 'Enter' && runPortScan());
        if (rangeInput)  rangeInput.addEventListener('keydown', e => e.key === 'Enter' && runRangeScan());

        // Load local IP as default
        API.localIp().then(data => {
            if (scanTarget) scanTarget.placeholder = `Target IP (e.g. ${data.ip})`;
        }).catch(() => {});
    }

    async function runPortScan() {
        const target = scanTarget.value.trim();
        if (!target) {
            showError(scanResults, 'Please enter a target IP address.');
            return;
        }
        if (!isValidIP(target)) {
            showError(scanResults, 'Invalid IP address format.');
            return;
        }

        showLoading(scanResults, `Scanning ${target} — ports 1-1024...`);
        scanBtn.disabled = true;
        scanBtn.textContent = '⏳ Scanning...';

        try {
            const data  = await API.portScan(target);
            const ports = data.open_ports || [];
            renderPortResults(target, ports);
        } catch (err) {
            showError(scanResults, 'Scan failed: ' + err.message);
        } finally {
            scanBtn.disabled = false;
            scanBtn.textContent = 'Scan Ports';
        }
    }

    async function runRangeScan() {
        const cidr = rangeInput.value.trim();
        if (!cidr) {
            showError(rangeResults, 'Please enter a CIDR range (e.g. 192.168.1.0/24).');
            return;
        }
        if (!isValidCIDR(cidr)) {
            showError(rangeResults, 'Invalid CIDR format. Use format: x.x.x.x/xx');
            return;
        }

        showLoading(rangeResults, `Discovering hosts in ${cidr}...`);
        rangeBtn.disabled = true;
        rangeBtn.textContent = '⏳ Discovering...';

        try {
            const data  = await API.rangeScan(cidr);
            const hosts = data.hosts || [];
            renderHostMap(cidr, hosts);
        } catch (err) {
            showError(rangeResults, 'Discovery failed: ' + err.message);
        } finally {
            rangeBtn.disabled = false;
            rangeBtn.textContent = 'Discover Hosts';
        }
    }

    function renderPortResults(target, ports) {
        if (!scanResults) return;
        if (ports.length === 0) {
            scanResults.innerHTML = `
                <div class="scan-empty">
                    <p>🔍 No open ports found on <strong>${escHtml(target)}</strong> (range 1–1024)</p>
                    <p class="scan-note">Host may be offline or all ports are filtered.</p>
                </div>`;
            return;
        }

        const header = `
            <div class="scan-header">
                <span>🎯 Target: <strong>${escHtml(target)}</strong></span>
                <span class="scan-count">${ports.length} open port(s) found</span>
            </div>`;

        const rows = ports.map(p => `
            <div class="port-result">
                <span class="port-num">${p.port}</span>
                <span class="port-badge">${getSeverityBadge(p.port)}</span>
                <span class="port-svc">${escHtml(p.service)}</span>
                <span class="port-note">${getPortNote(p.port)}</span>
            </div>`).join('');

        const canvas = `<canvas id="port-visual" width="680" height="60" style="display:block;margin:12px 16px;"></canvas>`;

        scanResults.innerHTML = header + rows + canvas;

        // Draw port bar visualization
        drawPortBar(ports);
    }

    function renderHostMap(cidr, hosts) {
        if (!rangeResults) return;
        if (hosts.length === 0) {
            rangeResults.innerHTML = `
                <div class="scan-empty">
                    <p>📡 No live hosts found in <strong>${escHtml(cidr)}</strong></p>
                    <p class="scan-note">Network may be offline or ICMP is blocked.</p>
                </div>`;
            return;
        }

        const header = `
            <div class="scan-header">
                <span>🌐 Range: <strong>${escHtml(cidr)}</strong></span>
                <span class="scan-count">${hosts.length} host(s) up</span>
            </div>`;

        const hostItems = hosts.map((h, i) => `
            <div class="host-item" style="animation-delay:${i * 0.04}s">
                <div class="host-status pulse-green"></div>
                <span class="host-ip">${escHtml(h.ip)}</span>
                <span class="host-status-label">● ONLINE</span>
                <button class="btn-sm host-scan-btn" data-ip="${escHtml(h.ip)}">Scan Ports</button>
            </div>`).join('');

        const canvas = `<canvas id="network-map" width="680" height="120" style="display:block;margin:12px 16px;"></canvas>`;

        rangeResults.innerHTML = header + hostItems + canvas;
        drawNetworkMap(hosts);

        // Wire up quick-scan buttons
        rangeResults.querySelectorAll('.host-scan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ip = btn.getAttribute('data-ip');
                if (scanTarget) scanTarget.value = ip;
                document.querySelector('.nav-item[data-panel="network"]') && null;
                scanTarget.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => runPortScan(), 200);
            });
        });
    }

    // ── Canvas Visualizations ────────────────────────────────

    function drawPortBar(ports) {
        const canvas = document.getElementById('port-visual');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Port range bar
        ctx.fillStyle = '#1a2540';
        ctx.fillRect(0, 20, w, 20);

        const maxPort = 1024;
        ports.forEach(p => {
            const x = (p.port / maxPort) * w;
            const color = getPortColor(p.port);
            ctx.fillStyle = color;
            ctx.fillRect(x - 2, 16, 4, 28);
            // Glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.fillRect(x - 1, 18, 2, 24);
            ctx.shadowBlur = 0;
        });

        // Labels
        ctx.fillStyle = '#7a8ba0';
        ctx.font = '10px Courier New';
        ctx.fillText('Port 1', 0, 58);
        ctx.fillText('512', w / 2 - 10, 58);
        ctx.fillText('1024', w - 30, 58);
    }

    function drawNetworkMap(hosts) {
        const canvas = document.getElementById('network-map');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Central router node
        const cx = w / 2, cy = h / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#00b4ff33';
        ctx.fill();
        ctx.strokeStyle = '#00b4ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#00b4ff';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GW', cx, cy + 4);

        // Host nodes around the center
        const count = Math.min(hosts.length, 16);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const radius = Math.min(cx, cy) - 24;
            const nx = cx + radius * Math.cos(angle);
            const ny = cy + radius * Math.sin(angle);

            // Line from center
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = '#00ff8833';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Node
            ctx.beginPath();
            ctx.arc(nx, ny, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff8822';
            ctx.fill();
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // IP label
            ctx.fillStyle = '#e0e6f0';
            ctx.font = '8px Courier New';
            ctx.textAlign = 'center';
            const ip = hosts[i].ip.split('.').pop();
            ctx.fillText('.' + ip, nx, ny + 4);
        }
        ctx.textAlign = 'left';
    }

    // ── Helpers ──────────────────────────────────────────────

    function getSeverityBadge(port) {
        const critical = [22, 23, 21, 3389, 445, 139];
        const warning  = [80, 8080, 8000, 443, 3306, 5432, 6379];
        if (critical.includes(port)) return '<span class="badge badge-red">HIGH RISK</span>';
        if (warning.includes(port))  return '<span class="badge badge-yellow">MEDIUM</span>';
        return '<span class="badge badge-green">LOW</span>';
    }

    function getPortNote(port) {
        const notes = {
            21: 'FTP — File Transfer (unencrypted)',
            22: 'SSH — Secure Shell',
            23: 'Telnet — Remote (unencrypted!)',
            25: 'SMTP — Mail Transfer',
            53: 'DNS — Domain Name System',
            80: 'HTTP — Web Server',
            110:'POP3 — Mail',
            143:'IMAP — Mail',
            443:'HTTPS — Secure Web',
            445:'SMB — File Sharing',
            3306:'MySQL — Database',
            3389:'RDP — Remote Desktop',
            5432:'PostgreSQL — Database',
            6379:'Redis — Cache',
            8080:'HTTP Alt — Web',
            8443:'HTTPS Alt',
        };
        return notes[port] || '';
    }

    function getPortColor(port) {
        const critical = [22, 23, 21, 3389, 445];
        const warning  = [80, 8080, 443, 3306, 5432];
        if (critical.includes(port)) return '#ff3366';
        if (warning.includes(port))  return '#ffcc00';
        return '#00ff88';
    }

    function isValidIP(ip) {
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
            ip.split('.').every(n => parseInt(n) <= 255);
    }

    function isValidCIDR(cidr) {
        return /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(cidr);
    }

    function showLoading(el, msg) {
        if (el) el.innerHTML = `<div class="scan-loading scanning-overlay"><span>⏳ ${escHtml(msg)}</span></div>`;
    }

    function showError(el, msg) {
        if (el) el.innerHTML = `<div class="scan-error"><span class="term-error">✖ ${escHtml(msg)}</span></div>`;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { init };
})();