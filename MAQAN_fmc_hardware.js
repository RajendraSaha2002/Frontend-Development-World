/**
 * FMC Card Hardware Telemetry Simulator
 */
document.addEventListener('DOMContentLoaded', () => {
    const btnRecal = document.getElementById('btn-recalibrate');
    const valTDC = document.getElementById('val-tdc');
    const valGate = document.getElementById('val-gate');

    btnRecal.addEventListener('click', () => {
        btnRecal.textContent = "Recalibrating MZI Delays...";
        btnRecal.style.opacity = "0.7";

        // Jitter values
        const interval = setInterval(() => {
            valTDC.textContent = Math.floor(Math.random() * 20 + 40);
            valGate.textContent = (Math.random() * 0.5 + 1.0).toFixed(2);
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            valTDC.textContent = "50";
            valGate.textContent = "1.20";
            btnRecal.textContent = "Recalibrate Biases";
            btnRecal.style.opacity = "1";
        }, 1500);
    });
});