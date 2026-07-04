document.addEventListener('DOMContentLoaded', () => {
    const btnPredict = document.getElementById('btn-predict-outcome');
    const resultsPanel = document.getElementById('ehr-results');
    const predictionText = document.getElementById('prediction-text');

    btnPredict.addEventListener('click', () => {
        const cancerType = document.getElementById('cancer-type').value;
        const stage = document.getElementById('tnm-stage').value;

        btnPredict.textContent = "Processing via HPC-AI...";
        btnPredict.disabled = true;

        // Mock computational delay simulating HPC prediction of treatment outcome[cite: 3]
        setTimeout(() => {
            resultsPanel.classList.remove('hidden');
            predictionText.innerHTML = `
                <strong>Condition:</strong> ${cancerType.toUpperCase()} CANCER<br>
                <strong>Clinical Staging:</strong> ${stage}<br>
                <strong>AI Prognosis:</strong> 87.4% probability of positive response to targeted adjuvant therapy. 
                Recommendation generated via integrated evidence-based diagnostic models[cite: 3].
            `;

            btnPredict.textContent = "Run HPC-AI Prognosis Model[cite: 3]";
            btnPredict.disabled = false;
        }, 1200);
    });
});