class CoreAudioHandler {
    constructor() {
        this.audioElement = document.getElementById('main-audio');
        this.fileInput = document.getElementById('audio-upload');
        this.processBtn = document.getElementById('btn-process');
        this.currentFile = null;

        this.bindEvents();
    }

    bindEvents() {
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Support multiple audio/video file formats locally[cite: 2]
                this.currentFile = file;
                const objectUrl = URL.createObjectURL(file);
                this.audioElement.src = objectUrl;
                this.processBtn.disabled = false;
                window.DOMController.updateStatus(`File loaded: ${file.name}. Ready for processing.`);
            }
        });
    }

    getDuration() {
        return this.audioElement.duration || 0;
    }
}