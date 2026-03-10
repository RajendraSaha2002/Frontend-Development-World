// Uses native Web Audio API to generate synthetic signals and draw them to canvas
const AudioIntercept = {
    audioCtx: null,
    analyser: null,
    oscillator: null,
    canvasCtx: null,
    animationId: null,

    init: function(canvasId) {
        const canvas = document.getElementById(canvasId);
        this.canvasCtx = canvas.getContext('2d');
        // Match internal canvas resolution to CSS size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    },

    start: function() {
        if (this.audioCtx) this.stop();

        // Initialize Audio Context (requires user interaction first)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();

        // Create an oscillator (the "enemy signal")
        this.oscillator = this.audioCtx.createOscillator();
        this.oscillator.type = 'sawtooth';
        this.oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime); // 440Hz

        // Add an LFO (Low Frequency Oscillator) to modulate frequency and make it sound like a crypto transmission
        const lfo = this.audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 8; // fast wobble
        const lfoGain = this.audioCtx.createGain();
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(this.oscillator.frequency);
        lfo.start();

        // Lower the volume so we don't blow out speakers
        const mainGain = this.audioCtx.createGain();
        mainGain.gain.value = 0.05;

        // Connect nodes: Osc -> Analyser -> Volume -> Speakers
        this.oscillator.connect(this.analyser);
        this.analyser.connect(mainGain);
        mainGain.connect(this.audioCtx.destination);

        this.oscillator.start();
        this.drawVisualizer();
    },

    stop: function() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
        }
        if (this.audioCtx) {
            this.audioCtx.close();
        }
        cancelAnimationFrame(this.animationId);

        // Draw flatline
        const width = this.canvasCtx.canvas.width;
        const height = this.canvasCtx.canvas.height;
        this.canvasCtx.fillStyle = '#000';
        this.canvasCtx.fillRect(0, 0, width, height);
        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.strokeStyle = '#0f0';
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(0, height / 2);
        this.canvasCtx.lineTo(width, height / 2);
        this.canvasCtx.stroke();
    },

    drawVisualizer: function() {
        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            this.analyser.getByteTimeDomainData(dataArray);

            const width = this.canvasCtx.canvas.width;
            const height = this.canvasCtx.canvas.height;

            this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Slight fade for trails
            this.canvasCtx.fillRect(0, 0, width, height);

            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeStyle = '#0f0';
            this.canvasCtx.beginPath();

            const sliceWidth = width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) this.canvasCtx.moveTo(x, y);
                else this.canvasCtx.lineTo(x, y);

                x += sliceWidth;
            }

            this.canvasCtx.lineTo(width, height / 2);
            this.canvasCtx.stroke();
        };
        draw();
    }
};