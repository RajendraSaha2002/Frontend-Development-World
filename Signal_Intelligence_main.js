// Connects UI buttons to the logic in the other scripts
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Canvas
    AudioIntercept.init('audioVisualizer');
    AudioIntercept.stop(); // draw initial flatline

    // Elements
    const rawInput = document.getElementById('raw-input');
    const cryptoOutput = document.getElementById('crypto-output');
    const shiftKey = document.getElementById('shift-key');
    const connStatus = document.getElementById('conn-status');

    // --- Cryptography Event Listeners ---
    document.getElementById('btn-encrypt').addEventListener('click', () => {
        const text = rawInput.value;
        const shift = parseInt(shiftKey.value) || 0;
        cryptoOutput.value = CryptoEngine.encrypt(text, shift);
    });

    document.getElementById('btn-decrypt').addEventListener('click', () => {
        const text = rawInput.value;
        const shift = parseInt(shiftKey.value) || 0;
        cryptoOutput.value = CryptoEngine.decrypt(text, shift);
    });

    document.getElementById('btn-analyze').addEventListener('click', () => {
        const textToAnalyze = cryptoOutput.value || rawInput.value;
        FrequencyAnalyzer.analyze(textToAnalyze, 'freq-chart');
    });

    // --- Audio Event Listeners ---
    document.getElementById('btn-start-audio').addEventListener('click', () => {
        AudioIntercept.start();
        connStatus.textContent = "INTERCEPTING SIGNAL...";
        connStatus.style.color = "#ff3333"; // Turn red when active
    });

    document.getElementById('btn-stop-audio').addEventListener('click', () => {
        AudioIntercept.stop();
        connStatus.textContent = "AWAITING SIGNAL";
        connStatus.style.color = "#0f0"; // Back to green
    });
});