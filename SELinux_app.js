// Central logic orchestrating data fetching and UI updates
document.addEventListener('DOMContentLoaded', () => {

    // Initialize components
    SecurityChart.init('threatChart');
    TerminalUI.init('log-output');

    // Fetch System Status (e.g. Enforcing mode)
    async function fetchSystemStatus() {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();

            const badge = document.getElementById('sys-status-badge');
            badge.textContent = `${data.mode} MODE`;

            if (data.mode === 'ENFORCING') {
                badge.className = 'system-status enforcing';
            } else {
                badge.className = 'system-status permissive';
            }

            document.getElementById('policy-type').textContent = data.policy_type;
        } catch (error) {
            console.error("Status Error:", error);
        }
    }

    // Fetch AVC Audit Logs
    async function fetchAuditLogs() {
        try {
            const res = await fetch('/api/logs');
            const logs = await res.json();

            // Pass data to external modules
            SecurityChart.draw(logs);
            TerminalUI.update(logs);
        } catch (error) {
            console.error("Log Fetch Error:", error);
        }
    }

    // Handle Window Resize for Canvas
    window.addEventListener('resize', () => {
        SecurityChart.init('threatChart');
        fetchAuditLogs(); // Redraw immediately
    });

    // Initial Load
    fetchSystemStatus();
    fetchAuditLogs();

    // Setup polling (simulate real-time monitoring every 2 seconds)
    setInterval(fetchAuditLogs, 2000);
});