// Application Bootstrap File
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize live clock
    const clockEl = document.getElementById('sys-clock');
    setInterval(() => {
        clockEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

    // 2. Initialize Hardware Telemetry (Ubuntu, i5, 16GB RAM)
    const telemetry = new SystemTelemetry();
    telemetry.startMonitoring();

    // 3. Initialize AI Simulation Engine
    const aiEngine = new AIEngine(Dispatcher);

    // Initial Dispatch Log
    Dispatcher.dispatch('System Status', 'Central Server', 'CLEAR');

    // Start Processing Algorithms
    setTimeout(() => aiEngine.simulateFireSmokeRoutine(), 2000);
    setTimeout(() => aiEngine.simulateCrowdRoutine(), 4000);
});