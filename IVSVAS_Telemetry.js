// Simulates hardware loads for Intel i5, 16GB RAM, and Nvidia GPU
class SystemTelemetry {
    constructor() {
        this.cpuBar = document.getElementById('cpu-bar');
        this.cpuVal = document.getElementById('cpu-val');
        this.gpuBar = document.getElementById('gpu-bar');
        this.gpuVal = document.getElementById('gpu-val');
        this.ramBar = document.getElementById('ram-bar');
        this.ramVal = document.getElementById('ram-val');

        this.initDOM();
    }

    initDOM() {
        document.getElementById('os-name').innerText = SystemConfig.specs.os;
        document.getElementById('storage-val').innerText = SystemConfig.specs.storage;
    }

    updateMetrics() {
        // Simulate fluctuating loads based on AI processing
        const cpuLoad = Math.floor(Math.random() * (75 - 45 + 1) + 45);
        const gpuLoad = Math.floor(Math.random() * (95 - 75 + 1) + 75); // GPU works harder in ML
        const ramLoad = (Math.random() * (14.5 - 11.0) + 11.0).toFixed(1);

        this.cpuBar.style.width = `${cpuLoad}%`;
        this.cpuVal.innerText = `${cpuLoad}%`;

        this.gpuBar.style.width = `${gpuLoad}%`;
        this.gpuVal.innerText = `${gpuLoad}%`;

        this.ramBar.style.width = `${(ramLoad/16)*100}%`;
        this.ramVal.innerText = `${ramLoad}GB`;
    }

    startMonitoring() {
        setInterval(() => this.updateMetrics(), 3000);
    }
}