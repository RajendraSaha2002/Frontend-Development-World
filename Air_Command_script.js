async function updateDashboard() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();

        // Update Radar
        document.getElementById('radar-range').innerText = data.radar.range;
        document.getElementById('radar-contacts').innerText = data.radar.contacts;
        document.getElementById('radar-bearing').innerText = data.radar.bearing;

        // Update Status
        document.getElementById('eng-1').innerText = data.ship_status.engine_1;
        document.getElementById('eng-2').innerText = data.ship_status.engine_2;
        document.getElementById('fuel-lvl').innerText = data.ship_status.fuel;
        document.getElementById('sys-msg').innerText = data.ship_status.status;

        // Update Nav
        document.getElementById('nav-coords').innerText = data.navigation.coords;
        document.getElementById('nav-speed').innerText = data.navigation.speed;
        document.getElementById('nav-eta').innerText = data.navigation.eta;

        // Update Threat
        document.getElementById('threat-lvl').innerText = data.threat.level;
        document.getElementById('threat-f').innerText = data.threat.friendly;
        document.getElementById('threat-u').innerText = data.threat.unknown;

    } catch (error) {
        console.error("Error fetching operational data:", error);
    }
}

// Refresh data every 3 seconds
setInterval(updateDashboard, 3000);
updateDashboard(); // Initial call