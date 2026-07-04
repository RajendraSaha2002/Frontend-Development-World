document.addEventListener('DOMContentLoaded', () => {
    const consoleOutput = document.getElementById('pipeline-console');

    const logToConsole = (message) => {
        const time = new Date().toLocaleTimeString();
        consoleOutput.innerHTML += `<br>[${time}] > ${message}`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    };

    document.getElementById('btn-upload-data').addEventListener('click', () => {
        logToConsole("Initiating Data Upload... Importing standard Proforma based Data collection[cite: 3].");
        setTimeout(() => logToConsole("SUCCESS: Demographic & Genetics datasets merged."), 500);
    });

    document.getElementById('btn-upload-model').addEventListener('click', () => {
        logToConsole("Loading pre-trained HPC AI based model for classification[cite: 3] into memory.");
    });

    document.getElementById('btn-retrain').addEventListener('click', () => {
        logToConsole("Executing Model re-training[cite: 3] using new clinical investigation data...");
        let epoch = 1;
        const interval = setInterval(() => {
            logToConsole(`Epoch ${epoch}/5 - Loss: ${(0.8 / epoch).toFixed(4)}`);
            epoch++;
            if(epoch > 5) {
                clearInterval(interval);
                logToConsole("Re-training complete. Weights updated.");
            }
        }, 400);
    });

    document.getElementById('btn-validate').addEventListener('click', () => {
        logToConsole("Initiating Model validation[cite: 3] against ground-truth pathology reports...");
        setTimeout(() => logToConsole("Validation Result: Accuracy of Diagnosis improved to 96.8%[cite: 3]."), 600);
    });

    document.getElementById('btn-export').addEventListener('click', () => {
        logToConsole("Executing Data export[cite: 3]. Packaging model weights for Decision Support System integration.");
    });
});