class AudioCoreManager {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.stream = null;
        this.source = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBuffer = null;
        this.isRecording = false;

        // Visualizer Canvas Contexts
        this.waveCanvas = document.getElementById('waveform-canvas');
        this.specCanvas = document.getElementById('spectrogram-canvas');
        this.waveCtx = this.waveCanvas.getContext('2d');
        this.specCtx = this.specCanvas.getContext('2d');

        this.initResize();
    }

    initResize() {
        const resize = () => {
            this.waveCanvas.width = this.waveCanvas.parentElement.clientWidth;
            this.waveCanvas.height = 140;
            this.specCanvas.width = this.specCanvas.parentElement.clientWidth;
            this.specCanvas.height = 140;
        };
        window.addEventListener('resize', resize);
        setTimeout(resize, 100);
    }

    async initAudio() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;

        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.source = this.audioCtx.createMediaStreamSource(this.stream);
        this.source.connect(this.analyser);

        this.drawVisuals();
    }

    startRecording(onStateChange) {
        this.initAudio().then(() => {
            this.audioChunks = [];
            this.isRecording = true;
            onStateChange('Recording operational audio window...');

            this.mediaRecorder = new MediaRecorder(this.stream);
            this.mediaRecorder.ondataavailable = e => this.audioChunks.push(e.data);
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const arrayBuffer = await audioBlob.arrayBuffer();
                this.audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
                    this.audioBuffer = buffer;
                    document.getElementById('btn-play').disabled = false;
                    document.getElementById('btn-train').disabled = false;
                    document.getElementById('btn-match').disabled = false;
                    onStateChange('Audio parsing complete. Spectral vectors computed.');
                });
            };
            this.mediaRecorder.start();
        }).catch(err => {
            console.error(err);
            onStateChange('Stream error: Ensure mic privileges are clear.');
        });
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    playCapturedBuffer() {
        if (!this.audioBuffer || !this.audioCtx) return;
        const playSource = this.audioCtx.createBufferSource();
        playSource.buffer = this.audioBuffer;
        playSource.connect(this.audioCtx.destination);
        playSource.connect(this.analyser);
        playSource.start(0);
    }

    clearBuffers() {
        this.audioBuffer = null;
        this.audioChunks = [];
        document.getElementById('btn-play').disabled = true;
        document.getElementById('btn-train').disabled = true;
        document.getElementById('btn-match').disabled = true;
    }

    drawVisuals() {
        requestAnimationFrame(() => this.drawVisuals());
        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        const freqData = new Uint8Array(bufferLength);

        this.analyser.getByteTimeDomainData(timeData);
        this.analyser.getByteFrequencyData(freqData);

        // Render Waveform
        this.waveCtx.fillStyle = '#05070f';
        this.waveCtx.fillRect(0, 0, this.waveCanvas.width, this.waveCanvas.height);
        this.waveCtx.lineWidth = 2;
        this.waveCtx.strokeStyle = '#00f0ff';
        this.waveCtx.beginPath();
        let sliceWidth = this.waveCanvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            let v = timeData[i] / 128.0;
            let y = v * this.waveCanvas.height / 2;
            if (i === 0) this.waveCtx.moveTo(x, y); else this.waveCtx.lineTo(x, y);
            x += sliceWidth;
        }
        this.waveCtx.lineTo(this.waveCanvas.width, this.waveCanvas.height / 2);
        this.waveCtx.stroke();

        // Render Spectrogram Visual Simulation Bars
        this.specCtx.fillStyle = '#05070f';
        this.specCtx.fillRect(0, 0, this.specCanvas.width, this.specCanvas.height);
        let barWidth = (this.specCanvas.width / bufferLength) * 1.5;
        let barHeight;
        let xBar = 0;
        for (let i = 0; i < bufferLength; i++) {
            barHeight = freqData[i] * 0.5;
            this.specCtx.fillStyle = `rgba(189, 0, 255, ${freqData[i]/255})`;
            this.specCtx.fillRect(xBar, this.specCanvas.height - barHeight, barWidth - 1, barHeight);
            xBar += barWidth;
        }
    }
}

window.audioCore = new AudioCoreManager();