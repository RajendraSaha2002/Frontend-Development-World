document.addEventListener('DOMContentLoaded', () => {
    // MRI Segmentation Simulation[cite: 3]
    const btnMri = document.getElementById('btn-run-mri');
    const mriMask = document.getElementById('mri-mask');
    btnMri.addEventListener('click', () => {
        btnMri.textContent = "Segmenting...";
        setTimeout(() => {
            mriMask.classList.remove('hidden');
            btnMri.textContent = "Analysis Complete - Tumor Boundary Identified";
        }, 800);
    });

    // Mammography Abnormality Detection Simulation[cite: 3]
    const btnMammo = document.getElementById('btn-run-mammo');
    const mammoBox = document.getElementById('mammo-box');
    btnMammo.addEventListener('click', () => {
        btnMammo.textContent = "Scanning for Microcalcifications...";
        setTimeout(() => {
            mammoBox.classList.remove('hidden');
            btnMammo.textContent = "Abnormality Detected (BI-RADS 4)";
            btnMammo.style.borderColor = "var(--danger-red)";
            btnMammo.style.color = "var(--danger-red)";
        }, 1100);
    });

    // Digital Histopathology Classification Simulation[cite: 3]
    const btnPath = document.getElementById('btn-run-path');
    const pathResults = document.getElementById('path-results');
    btnPath.addEventListener('click', () => {
        pathResults.innerHTML = "Extracting cellular features...<br>Running Multi-class SVM...";
        setTimeout(() => {
            pathResults.innerHTML = `
                <strong style="color:var(--accent-teal)">Classification Complete</strong><br>
                Binary: Malignant (99.2% confidence)<br>
                Multi-class Subtype: Invasive Ductal Carcinoma.
            `;
        }, 1500);
    });
});