// Handles writing logs to the UI exactly like a Linux Terminal
const TerminalUI = {
    container: null,
    seenLogIds: new Set(),

    init(containerId) {
        this.container = document.getElementById(containerId);
    },

    update(logs) {
        // Reverse so chronological order (oldest at top) for typical terminal feel
        const sortedLogs = [...logs].reverse();

        let newLogsAdded = false;

        sortedLogs.forEach(log => {
            if (!this.seenLogIds.has(log.id)) {
                this.seenLogIds.add(log.id);
                this.printLog(log);
                newLogsAdded = true;
            }
        });

        // Auto-scroll to bottom if new logs arrived
        if (newLogsAdded) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    },

    printLog(log) {
        const div = document.createElement('div');
        div.className = `log-line ${log.action === 'denied' ? 'log-denied' : ''}`;

        // Format similar to actual auditd logs
        const time = new Date(log.timestamp).toISOString();
        const msg = `type=AVC msg=audit(${time}): avc:  ${log.action}  { ${log.details} } for  scontext=${log.scontext} tcontext=${log.tcontext} tclass=${log.tclass}`;

        div.textContent = msg;
        this.container.appendChild(div);

        // Prevent DOM overflow (keep last 100 items)
        if (this.container.childElementCount > 100) {
            this.container.removeChild(this.container.firstChild);
        }
    }
};