/**
 * Firmware Over-The-Air (FOTA) Simulator
 */
document.addEventListener('DOMContentLoaded', () => {
    const btnPush = document.getElementById('btn-push-ota');
    const terminal = document.getElementById('ota-verification-log');
    const progContainer = document.getElementById('ota-progress-bar');
    const progFill = document.getElementById('ota-fill');
    const progPct = document.getElementById('ota-pct');

    const logToOTA = (msg, type = '') => {
        const time = new Date().toISOString().substring(11, 19);
        const entry = document.createElement('div');
        entry.className = `log-line ${type}`;
        entry.textContent = `[${time}] ${msg}`;
        terminal.appendChild(entry);
        terminal.scrollTop = terminal.scrollHeight;
    };

    btnPush.addEventListener('click', () => {
        btnPush.disabled = true;
        logToOTA("Signing firmware payload with OEM Private Key...", "sys");

        setTimeout(() => {
            logToOTA("Initiating secure transmission to Vehicle Central Gateway...");
            progContainer.classList.remove('hidden');

            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progFill.style.width = `${progress}%`;
                progPct.textContent = `${progress}%`;

                if(progress >= 100) {
                    clearInterval(interval);
                    logToOTA("Payload transferred. Verifying Digital Signature...", "sys");

                    setTimeout(() => {
                        logToOTA("Signature VERIFIED. Firmware authenticity confirmed.", "succ");
                        logToOTA("Flashing A/B partition. Update successful.", "succ");
                        setTimeout(() => {
                            progContainer.classList.add('hidden');
                            progFill.style.width = '0%';
                            progPct.textContent = '0%';
                            btnPush.disabled = false;
                        }, 2000);
                    }, 1500);
                }
            }, 300);

        }, 1000);
    });
});