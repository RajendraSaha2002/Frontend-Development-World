document.addEventListener('DOMContentLoaded', () => {
    TacticalMap.init();

    async function gameLoop() {
        try {
            // Poll the Python Backend
            const response = await fetch('/api/sector_data');
            const data = await response.json();

            // Render
            TacticalMap.draw(data);
            Dashboard.update(data);

        } catch (e) {
            console.error("Link Failure:", e);
        }
    }

    // Refresh every 500ms (2Hz refresh rate)
    setInterval(gameLoop, 500);
});