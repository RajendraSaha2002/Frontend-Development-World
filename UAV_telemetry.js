const Telemetry = {
    logEl: document.getElementById('telemetry-log'),
    messages: [
        "GYRO_CAL: NOMINAL",
        "DATALINK: SECURE",
        "RADAR_SWEEP: CLEAR",
        "WEAPON_SYS: SAFE",
        "ENG_TEMP: 450C",
        "SATCOM: CONNECTED"
    ],

    init() {
        // Run a system log every 800ms
        setInterval(() => this.generateLog(), 800);
    },

    generateLog() {
        const p = document.createElement('div');
        const time = new Date().toISOString().substring(11, 19);
        const randMsg = this.messages[Math.floor(Math.random() * this.messages.length)];
        const hex = Math.floor(Math.random()*16777215).toString(16).toUpperCase();

        p.innerText = `[${time}] 0x${hex} - ${randMsg}`;

        this.logEl.appendChild(p);

        // Keep only last 8 logs to prevent DOM bloat
        if(this.logEl.children.length > 8) {
            this.logEl.removeChild(this.logEl.firstChild);
        }
    }
};