const MapSys = {
    satEl: document.getElementById('satellite-icon'),
    statusEl: document.getElementById('link-status'),
    latEl: document.getElementById('latency'),
    feedEl: document.getElementById('feed-log'),

    updateMap(orbit) {
        // Map Logic: Convert Lat/Lon to CSS Top/Left percentages
        // Simple Equirectangular projection approximation for demo
        const x = ((orbit.lon + 180) / 360) * 100;
        const y = ((-orbit.lat + 90) / 180) * 100;

        this.satEl.style.left = `${x}%`;
        this.satEl.style.top = `${y}%`;

        document.getElementById('sat-id').innerText = orbit.id;
    },

    logTelemetry(packet) {
        if (!packet) {
            this.statusEl.innerText = "PACKET LOSS / INTERFERENCE";
            this.statusEl.style.color = "orange";
            return;
        }

        this.statusEl.innerText = "SECURE / ENCRYPTED";
        this.statusEl.style.color = "#00f0ff";
        this.latEl.innerText = `${packet.latency_ms}ms`;

        // Parse Payload (Simulating Decryption at Client)
        const data = JSON.parse(packet.payload);

        const row = document.createElement('div');
        row.className = `log-entry alert-${data.alert_level}`;
        const time = new Date().toLocaleTimeString();
        row.innerText = `[${time}] SIG: ${packet.signature.substring(0,8)}... | TYPE: ${data.type} | SECTOR: ${data.sector}`;

        this.feedEl.prepend(row);
    }
};

async function uplinkLoop() {
    try {
        const res = await fetch('/api/uplink');
        const data = await res.json();

        MapSys.updateMap(data.orbit);
        MapSys.logTelemetry(data.packet);

    } catch (e) {
        console.error("Uplink lost");
    }
}

// 1Hz Update Rate for Satellite
setInterval(uplinkLoop, 1000);