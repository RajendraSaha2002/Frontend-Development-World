// ─────────────────────────────────────────────────────────
// SPEED FIX — Replace these two lines in your app.js
// ─────────────────────────────────────────────────────────

// ❌ OLD (too fast — hammers the server)
// loadDashboard();
// setInterval(loadDashboard, 5000);

// ✅ NEW — Ping server first, then poll every 8 seconds
const API = "http://127.0.0.1:5000/api";

async function checkServerAlive() {
    try {
        const res = await fetch(`${API}/ping`, { method: "GET" });
        const data = await res.json();
        if (data.status === "ok") {
            console.log("✅ Server connected");
            document.querySelector(".status-label").textContent = "SYSTEM ACTIVE";
            document.querySelector(".status-dot").style.background = "#22c55e";
            return true;
        }
    } catch (e) {
        console.warn("⚠ Server not reachable:", e.message);
        document.querySelector(".status-label").textContent = "SERVER OFFLINE";
        document.querySelector(".status-dot").style.background = "#ef4444";
        return false;
    }
}

// ✅ Start polling only after confirming server is alive
async function startDashboard() {
    const alive = await checkServerAlive();
    if (alive) {
        loadDashboard();                          // first load
        setInterval(loadDashboard, 8000);         // poll every 8s (not 5s)
    } else {
        // Retry connection every 3 seconds until server responds
        console.log("Retrying server connection in 3s...");
        setTimeout(startDashboard, 3000);
    }
}

startDashboard();