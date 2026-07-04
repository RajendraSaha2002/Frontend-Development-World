document.addEventListener('DOMContentLoaded', () => {
    // Initialize global modules
    window.DOMController = new DOMController();
    const audioHandler = new CoreAudioHandler();
    const engine = new NLPEngine();

    const processBtn = document.getElementById('btn-process');
    const enrollBtn = document.getElementById('btn-enroll');

    // Trigger AI Analysis Pipeline
    processBtn.addEventListener('click', async () => {
        const duration = audioHandler.getDuration() || 30; // Fallback for testing
        const services = window.DOMController.getSelectedServices();

        window.DOMController.updateStatus('Extracting acoustic vectors and running Deep Learning models...', true);
        processBtn.disabled = true;

        // Execute NLP/ML processing simulation
        const results = await engine.processAudio(duration, services);

        // Render dashboard
        window.DOMController.renderResults(results);
        window.DOMController.updateStatus('Analysis Complete. Data mapped to dashboard successfully.', false);
        processBtn.disabled = false;
    });

    // Handle New Speaker Enrollment[cite: 2]
    enrollBtn.addEventListener('click', () => {
        alert("Initializing secure biometric enrolment terminal. Please prepare the reference audio sample.");
    });
});