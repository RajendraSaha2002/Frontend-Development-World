// Pure vanilla JS to fetch data from PostgreSQL via Python
async function fetchDatabaseAlerts() {
    try {
        const response = await fetch('/get_alerts');
        const data = await response.json();
        const tbody = document.querySelector('#alerts-table tbody');

        tbody.innerHTML = ''; // Clear old data

        data.forEach(alert => {
            // Apply red color if severity is critical
            const severityColor = alert.severity === 'Critical' ? 'style="color: #ff0000;"' : '';

            const row = `<tr>
                <td>${new Date(alert.time).toLocaleString()}</td>
                <td>${alert.ip}</td>
                <td>${alert.type}</td>
                <td ${severityColor}>[${alert.severity}]</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error("Database connection lost...", error);
    }
}

// Fetch data immediately, then poll every 10 seconds
fetchDatabaseAlerts();
setInterval(fetchDatabaseAlerts, 10000);