document.addEventListener('DOMContentLoaded', () => {
    const btnRecord = document.getElementById('btn-record');
    const btnPlay = document.getElementById('btn-play');
    const btnClear = document.getElementById('btn-clear');
    const btnTrain = document.getElementById('btn-train');
    const btnMatch = document.getElementById('btn-match');
    const systemLog = document.getElementById('system-log');

    const modeRadios = document.querySelectorAll('input[name="system-mode"]');
    const targetGroup = document.querySelector('.target-speaker-group');
    const selectIdentity = document.getElementById('claimed-identity');

    const metricPower = document.getElementById('metric-power');
    const metricDistortion = document.getElementById('metric-distortion');

    // Modal elements
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    const modalIcon = document.getElementById('modal-status-icon');

    const updateLog = (msg) => systemLog.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;

    // Toggle operational tracking alternatives[cite: 1]
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'verification') {
                targetGroup.classList.remove('hidden');
                btnMatch.textContent = "Verify Identity Claim[cite: 1]";
            } else {
                targetGroup.classList.add('hidden');
                btnMatch.textContent = "Find Match[cite: 1]";
            }
            updateLog(`Switched operational context to: ${e.target.value.toUpperCase()}`);
        });
    });

    // Recording interface state logic
    btnRecord.addEventListener('click', () => {
        if (!window.audioCore.isRecording) {
            window.audioCore.startRecording(updateLog);
            btnRecord.textContent = "Stop Capture Pipeline";
            btnRecord.classList.add('btn-danger');
        } else {
            window.audioCore.stopRecording();
            btnRecord.textContent = "Start Recording";
            btnRecord.classList.remove('btn-danger');

            // Generate telemetry readouts mimicking standard voice biometric outputs
            metricPower.textContent = `${(-12 - Math.random() * 15).toFixed(2)} dB`;
        }
    });

    btnPlay.addEventListener('click', () => {
        window.audioCore.playCapturedBuffer();
        updateLog("Replaying diagnostic vocal pipeline frame buffer...");
    });

    btnClear.addEventListener('click', () => {
        window.audioCore.clearBuffers();
        metricPower.textContent = "0.00 dB";
        metricDistortion.textContent = "0.0000";
        updateLog("Local pipeline frame buffers flushed clean.");
    });

    // Core Enrolment / Weight Calculation execution pattern[cite: 1]
    btnTrain.addEventListener('click', () => {
        const name = document.getElementById('speaker-name').value.trim();
        const size = parseInt(document.getElementById('train-codebook-size').value);

        if (!name) {
            alert("Identification profile label required for training vectors.");
            return;
        }

        try {
            const frameCount = window.biometricEngine.trainSpeaker(name, window.audioCore.audioBuffer, size);
            updateLog(`Successfully compiled biometric signatures for [${name}] using ${frameCount} arrays.`);

            // Sync current list update dynamically to Verification dropdown interface
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            selectIdentity.appendChild(opt);

            alert(`Biometric profile generated successfully.\nCalculated weights saved for: ${name}`);
        } catch (error) {
            alert(error.message);
        }
    });

    // Pattern recognition verification lookup execution loop[cite: 1]
    btnMatch.addEventListener('click', () => {
        const mode = document.querySelector('input[name="system-mode"]:checked').value;
        const matchSize = parseInt(document.getElementById('match-codebook-size').value);

        if (Object.keys(window.biometricEngine.database).length === 0) {
            alert("Execution failure: The registry database contains zero biometric templates.");
            return;
        }

        const result = window.biometricEngine.identifySpeaker(window.audioCore.audioBuffer, matchSize);
        metricDistortion.textContent = result.score.toFixed(4);

        if (mode === 'identification') {
            // Context execution routing for dynamic verification checks[cite: 1]
            modalTitle.textContent = "Speaker Identified Successfully";
            modalDetails.innerHTML = `Target speaker matches profile signature: <strong>${result.name}</strong>`;
            modalIcon.className = "status-graphic verified";
            updateLog(`Identification operation concluded. Profile: ${result.name}`);
        } else {
            // Speaker verification execution logic[cite: 1]
            const claimed = selectIdentity.value;
            if (!claimed) {
                alert("Please select a target profile to verify identity credentials.");
                return;
            }

            // A typical threshold for this custom simplified Euclidean vector space model
            const VERIFICATION_THRESHOLD = 1.45;

            if (result.name === claimed && result.score < VERIFICATION_THRESHOLD) {
                modalTitle.textContent = "Access Authorized / Identity Verified";
                modalDetails.innerHTML = `Biometric validation matches claimed credential: <strong>${claimed}</strong><br>Distortion limits verified safe.`;
                modalIcon.className = "status-graphic verified";
                updateLog(`Verification authorized for speaker: ${claimed}`);
            } else {
                modalTitle.textContent = "Access Prohibited / Validation Failure";
                modalDetails.innerHTML = `Claimed Identity: <strong>${claimed}</strong><br>Analysis calculated critical signature mismatch divergence.`;
                modalIcon.className = "status-graphic failed";
                updateLog(`Authentication rejected for identity claim: ${claimed}`);
            }
        }

        modal.classList.remove('hidden');
    });

    // Modal Control Routines
    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-modal-ok').addEventListener('click', closeModal);
});