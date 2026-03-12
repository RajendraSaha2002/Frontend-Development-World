// ============================================================
// terminal.js — Built-in Terminal Emulator (No External Lib)
// Simulates a real Linux-like terminal via Flask API calls
// ============================================================

const Terminal = (() => {

    const COMMANDS = {
        help: () => [
            { type: 'info', text: '╔══════════════════════════════════════════╗' },
            { type: 'info', text: '║     PARROT OS DASHBOARD — COMMAND HELP   ║' },
            { type: 'info', text: '╚══════════════════════════════════════════╝' },
            { type: 'output', text: 'Available Commands:' },
            { type: 'output', text: '  help            — Show this help menu' },
            { type: 'output', text: '  clear            — Clear terminal screen' },
            { type: 'output', text: '  whoami           — Show current user' },
            { type: 'output', text: '  uname -a         — Show system info' },
            { type: 'output', text: '  date             — Show current date/time' },
            { type: 'output', text: '  uptime           — Show system uptime start' },
            { type: 'output', text: '  ifconfig         — Show network interfaces' },
            { type: 'output', text: '  netstat          — Show open ports summary' },
            { type: 'output', text: '  ps               — Show top processes' },
            { type: 'output', text: '  df               — Show disk usage' },
            { type: 'output', text: '  free             — Show memory usage' },
            { type: 'output', text: '  top              — Live system snapshot' },
            { type: 'output', text: '  ping <host>      — Ping a host' },
            { type: 'output', text: '  scan <ip>        — Port scan a target' },
            { type: 'output', text: '  discover <cidr>  — Discover hosts in range' },
            { type: 'output', text: '  logs             — Show recent security logs' },
            { type: 'output', text: '  alerts           — Show active alerts' },
            { type: 'output', text: '  banner           — Show Parrot OS banner' },
            { type: 'output', text: '  history          — Show command history' },
            { type: 'output', text: '  exit             — Log out of dashboard' },
        ],

        banner: () => [
            { type: 'info', text: '' },
            { type: 'info', text: ' ██████╗  █████╗ ██████╗ ██████╗  ██████╗ ████████╗' },
            { type: 'info', text: ' ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝' },
            { type: 'info', text: ' ██████╔╝███████║██████╔╝██████╔╝██║   ██║   ██║   ' },
            { type: 'info', text: ' ██╔═══╝ ██╔══██║██╔══██╗██╔══██╗██║   ██║   ██║   ' },
            { type: 'info', text: ' ██║     ██║  ██║██║  ██║██║  ██║╚██████╔╝   ██║   ' },
            { type: 'info', text: ' ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ' },
            { type: 'info', text: '' },
            { type: 'output', text: '         🦜 Parrot Security OS — Pro Dashboard' },
            { type: 'output', text: '              "Security. Privacy. Freedom."' },
            { type: 'output', text: '' },
        ],

        whoami: () => {
            const user = sessionStorage.getItem('username') || 'admin';
            return [{ type: 'output', text: user }];
        },

        date: () => [
            { type: 'output', text: new Date().toString() }
        ],

        uptime: () => [
            { type: 'output', text: `Dashboard started at: ${sessionStorage.getItem('login_time') || new Date().toLocaleString()}` }
        ],

        clear: () => '__clear__',

        history: () => {
            const hist = Terminal.cmdHistory;
            return hist.map((cmd, i) => ({ type: 'output', text: `  ${i + 1}  ${cmd}` }));
        },

        exit: () => {
            setTimeout(() => {
                API.logout().then(() => window.location.reload());
            }, 800);
            return [{ type: 'info', text: 'Logging out... 🔒' }];
        }
    };

    let cmdHistory = [];
    let historyIndex = -1;
    let outputEl, inputEl, promptEl;

    function init() {
        outputEl = document.getElementById('terminal-output');
        inputEl  = document.getElementById('terminal-input');
        promptEl = document.getElementById('term-prompt-label');

        if (!inputEl) return;

        inputEl.addEventListener('keydown', handleKey);

        // Show banner on load
        appendLines(COMMANDS.banner());
        appendLine('output', 'Type "help" to see all available commands.');
        appendLine('output', '');
    }

    function handleKey(e) {
        if (e.key === 'Enter') {
            const cmd = inputEl.value.trim();
            if (cmd) {
                cmdHistory.unshift(cmd);
                historyIndex = -1;
                appendLine('prompt', cmd);
                processCommand(cmd);
            }
            inputEl.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++;
                inputEl.value = cmdHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                inputEl.value = cmdHistory[historyIndex];
            } else {
                historyIndex = -1;
                inputEl.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autoComplete(inputEl.value);
        }
    }

    function autoComplete(partial) {
        const allCmds = Object.keys(COMMANDS).concat(['ping', 'scan', 'discover', 'uname', 'ps', 'df', 'free', 'top', 'ifconfig', 'netstat', 'logs', 'alerts']);
        const matches = allCmds.filter(c => c.startsWith(partial));
        if (matches.length === 1) {
            inputEl.value = matches[0];
        } else if (matches.length > 1) {
            appendLine('info', matches.join('  '));
        }
    }

    async function processCommand(raw) {
        const parts = raw.split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1);

        // Built-in commands
        if (COMMANDS[cmd]) {
            const result = COMMANDS[cmd](args);
            if (result === '__clear__') {
                outputEl.innerHTML = '';
                return;
            }
            appendLines(result);
            return;
        }

        // System commands via API
        switch (cmd) {
            case 'uname':
                await cmdUname();
                break;
            case 'ps':
                await cmdPs();
                break;
            case 'df':
                await cmdDf();
                break;
            case 'free':
                await cmdFree();
                break;
            case 'top':
                await cmdTop();
                break;
            case 'ifconfig':
                await cmdIfconfig();
                break;
            case 'netstat':
                appendLine('info', 'Fetching open port summary...');
                appendLine('output', 'Use "scan 127.0.0.1" to perform local port scan.');
                break;
            case 'ping':
                if (!args[0]) { appendLine('error', 'Usage: ping <host>'); break; }
                await cmdPing(args[0]);
                break;
            case 'scan':
                if (!args[0]) { appendLine('error', 'Usage: scan <ip>'); break; }
                await cmdScan(args[0]);
                break;
            case 'discover':
                if (!args[0]) { appendLine('error', 'Usage: discover <cidr>  e.g. discover 192.168.1.0/24'); break; }
                await cmdDiscover(args[0]);
                break;
            case 'logs':
                await cmdLogs();
                break;
            case 'alerts':
                await cmdAlerts();
                break;
            default:
                appendLine('error', `Command not found: ${cmd} — type "help" for available commands`);
        }

        scrollBottom();
    }

    // ── API-backed command handlers ──────────────────────────

    async function cmdUname() {
        try {
            const data = await API.system();
            appendLine('output', `${data.os} ${data.hostname} ${data.kernel} ${data.arch} — Parrot Security OS Pro`);
        } catch { appendLine('error', 'Failed to fetch system info'); }
    }

    async function cmdPs() {
        try {
            appendLine('info', 'USER            PID     CPU%  MEM%  COMMAND');
            appendLine('info', '─'.repeat(70));
            const data = await API.system();
            (data.processes || []).forEach(p => {
                appendLine('output', `${p.user.padEnd(15)} ${p.pid.padEnd(7)} ${p.cpu.padEnd(5)} ${p.mem.padEnd(5)} ${p.command}`);
            });
        } catch { appendLine('error', 'Failed to fetch processes'); }
    }

    async function cmdDf() {
        try {
            const data = await API.system();
            const d = data.disk;
            appendLine('info',   'Filesystem     Size      Used      Avail     Use%');
            appendLine('info',   '─'.repeat(55));
            appendLine('output', `/dev/sda1      ${d.total_gb}GB    ${d.used_gb}GB    ${(d.total_gb - d.used_gb).toFixed(2)}GB    ${d.percent}%`);
        } catch { appendLine('error', 'Failed to fetch disk info'); }
    }

    async function cmdFree() {
        try {
            const data = await API.system();
            const r = data.ram;
            appendLine('info',   '              Total      Used       Free');
            appendLine('info',   '─'.repeat(45));
            appendLine('output', `Mem:          ${r.total_mb}MB   ${r.used_mb}MB   ${(r.total_mb - r.used_mb).toFixed(2)}MB`);
        } catch { appendLine('error', 'Failed to fetch memory info'); }
    }

    async function cmdTop() {
        appendLine('info', '⚡ Live System Snapshot — fetching...');
        try {
            const data = await API.system();
            appendLine('output', `CPU:  ${data.cpu_percent}%   RAM: ${data.ram.percent}%   Disk: ${data.disk.percent}%`);
            appendLine('output', `Host: ${data.hostname}   OS: ${data.os}   Kernel: ${data.kernel}`);
            appendLine('info', '─'.repeat(50));
            (data.processes || []).slice(0, 5).forEach(p => {
                appendLine('output', `  PID ${p.pid} | CPU ${p.cpu}% | ${p.command}`);
            });
        } catch { appendLine('error', 'Failed to fetch live data'); }
    }

    async function cmdIfconfig() {
        try {
            const data = await API.system();
            const nets = data.network || {};
            appendLine('info', 'Interface        RX (MB)     TX (MB)');
            appendLine('info', '─'.repeat(45));
            Object.entries(nets).forEach(([iface, stats]) => {
                appendLine('output', `${iface.padEnd(16)} ${String(stats.recv_mb).padEnd(11)} ${stats.sent_mb}`);
            });
        } catch { appendLine('error', 'Failed to fetch network interfaces'); }
    }

    async function cmdPing(host) {
        appendLine('info', `PING ${host} — sending 4 packets...`);
        try {
            const start = Date.now();
            const data  = await API.rangeScan(`${host}/32`);
            const alive = (data.hosts || []).length > 0;
            const ms    = Date.now() - start;
            if (alive) {
                for (let i = 1; i <= 4; i++) {
                    appendLine('output', `64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${(ms / 4 + Math.random() * 2).toFixed(1)} ms`);
                }
                appendLine('info', `--- ${host} ping statistics: 4 packets transmitted, 4 received, 0% loss`);
            } else {
                appendLine('error', `Request timeout for ${host} — Host unreachable`);
            }
        } catch { appendLine('error', `Failed to ping ${host}`); }
    }

    async function cmdScan(target) {
        appendLine('info', `Starting port scan on ${target} (1-1024)...`);
        appendLine('info', 'This may take a moment ⏳');
        try {
            const data = await API.portScan(target);
            const ports = data.open_ports || [];
            if (ports.length === 0) {
                appendLine('output', 'No open ports found in range 1-1024.');
            } else {
                appendLine('info', `Found ${ports.length} open port(s):`);
                appendLine('info', 'PORT      SERVICE');
                appendLine('info', '─'.repeat(30));
                ports.forEach(p => {
                    appendLine('output', `${String(p.port).padEnd(9)} ${p.service}`);
                });
            }
        } catch { appendLine('error', `Scan failed for ${target}`); }
    }

    async function cmdDiscover(cidr) {
        appendLine('info', `Discovering hosts in ${cidr}...`);
        appendLine('info', 'Scanning up to 50 hosts ⏳');
        try {
            const data  = await API.rangeScan(cidr);
            const hosts = data.hosts || [];
            if (hosts.length === 0) {
                appendLine('output', 'No live hosts found.');
            } else {
                appendLine('info', `${hosts.length} host(s) up:`);
                hosts.forEach(h => appendLine('output', `  ✓  ${h.ip}  [UP]`));
            }
        } catch { appendLine('error', 'Discovery failed'); }
    }

    async function cmdLogs() {
        try {
            const logs = await API.logs();
            appendLine('info', `Showing last ${Math.min(logs.length, 15)} security logs:`);
            appendLine('info', '─'.repeat(60));
            (logs || []).slice(0, 15).forEach(l => {
                appendLine(
                    l.severity === 'CRITICAL' ? 'error' : l.severity === 'WARNING' ? 'info' : 'output',
                    `[${l.severity}] ${l.log_type} — ${l.message} (${l.source_ip})`
                );
            });
        } catch { appendLine('error', 'Failed to fetch logs'); }
    }

    async function cmdAlerts() {
        try {
            const alerts = await API.alerts();
            appendLine('info', `Active alerts: ${alerts.length}`);
            (alerts || []).slice(0, 10).forEach(a => {
                appendLine('error', `🚨 [${a.severity}] ${a.alert_type}: ${a.message}`);
            });
            if (!alerts.length) appendLine('output', 'No active alerts. System is clean ✅');
        } catch { appendLine('error', 'Failed to fetch alerts'); }
    }

    // ── Render Helpers ───────────────────────────────────────

    function appendLine(type, text) {
        const div  = document.createElement('div');
        div.classList.add('term-line');
        const user = sessionStorage.getItem('username') || 'admin';
        if (type === 'prompt') {
            div.innerHTML = `<span class="term-prompt">parrot@${user}:~$</span> <span class="term-output">${escHtml(text)}</span>`;
        } else if (type === 'error') {
            div.innerHTML = `<span class="term-error">${escHtml(text)}</span>`;
        } else if (type === 'info') {
            div.innerHTML = `<span class="term-info">${escHtml(text)}</span>`;
        } else {
            div.innerHTML = `<span class="term-output">${escHtml(text)}</span>`;
        }
        outputEl.appendChild(div);
        scrollBottom();
    }

    function appendLines(lines) {
        lines.forEach(l => appendLine(l.type, l.text));
    }

    function scrollBottom() {
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    return { init, cmdHistory, appendLine };
})();