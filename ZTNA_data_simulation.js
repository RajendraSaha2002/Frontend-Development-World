// Simulates the Zero Trust backend data generation and event logging
window.AegisData = {
    logs: [],
    addLog: function(msg, isAlert = false) {
        const terminal = document.getElementById('live-event-log');
        if(!terminal) return;

        const time = new Date().toISOString().substring(11, 19);
        const div = document.createElement('div');
        div.className = `log-line ${isAlert ? 'alert' : ''}`;
        div.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;

        terminal.prepend(div);
        if(terminal.children.length > 50) terminal.lastChild.remove();
    }
};

// Background simulation loop
setInterval(() => {
    const events = [
        "Identity verified for user: jsmith@domain.local",
        "Adaptive Policy: Access granted to DNS Resource",
        "Asset Management: Device posture verified (Patch level OK)",
        "Traffic Profiling: Normal HTTP/S baseline calculated"
    ];

    // 5% chance of anomaly
    if(Math.random() > 0.95) {
        window.AegisData.addLog("ANOMALY DETECTED: Unrecognized MAC address attempting DB connection.", true);
    } else {
        window.AegisData.addLog(events[Math.floor(Math.random() * events.length)]);
    }
}, 2500);