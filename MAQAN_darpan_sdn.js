/**
 * DARPAN-Q SDN Controller Logger
 */
class DarpanController {
    constructor() {
        this.terminal = document.getElementById('sdn-terminal-log');
        this.btnSync = document.getElementById('btn-sdn-sync');
        this.btnRoute = document.getElementById('btn-sdn-route');

        this.bindEvents();
    }

    log(msg, type = '') {
        if (!this.terminal) return;
        const time = new Date().toISOString().substring(11, 19);
        const entry = document.createElement('div');
        entry.className = `t-line ${type}`;
        entry.textContent = `[${time}] ${msg}`;
        this.terminal.appendChild(entry);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    bindEvents() {
        this.btnSync.addEventListener('click', () => {
            this.log("Dispatching WDM clock synchronization frames to Alpha and Beta nodes...", "sys");
            setTimeout(() => this.log("WDM Sync Locked. Timing jitter < 10ps.", "succ"), 1000);
        });

        this.btnRoute.addEventListener('click', () => {
            this.log("Calculating shortest secure path (Alpha -> Omega) using Trusted Node routing...", "sys");
            setTimeout(() => this.log("Route established via Gamma Site 1. End-to-end key distillation initiated.", "succ"), 1200);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.SDNController = new DarpanController();
});