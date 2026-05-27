/**
 * Physical Optics Hardware Track Simulations Renderer (Vanilla Canvas 2D)
 */
class OpticalBenchSimulator {
    constructor() {
        this.canvas = document.getElementById('optical-bench-canvas');
        this.wrapper = document.getElementById('canvas-bench-wrapper');
        this.ctx = null;
        this.currentGatesSequence = [];
        this.pulseProgress = 0;
        this.isFiringAnimation = false;

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.animateLoop();
    }

    resize() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.wrapper.clientWidth;
        this.canvas.height = this.wrapper.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    setPipeline(gates) {
        this.currentGatesSequence = [...gates];
    }

    triggerPhotonPulse() {
        if (this.isFiringAnimation) return;
        this.pulseProgress = 0;
        this.isFiringAnimation = true;
    }

    animateLoop() {
        if (this.canvas && this.canvas.offsetParent !== null && this.ctx) {
            this.render();
        }
        requestAnimationFrame(() => this.animateLoop());
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Core Horizontal Benchmark Rail Axis
        const railY = h / 2;
        ctx.beginPath();
        ctx.moveTo(50, railY);
        ctx.lineTo(w - 50, railY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();

        // 1. Source Component Emitter Assembly (Laser 405nm)
        this.drawComponent(ctx, 60, railY, 'LASER Source\n(405nm)', '#ff2a6d');

        // 2. Non-Linear Crystal Module (SPDC Generator)
        this.drawComponent(ctx, 180, railY, 'Beta-BBO\nCrystal (SPDC)', '#06b6d4');

        // Render Applied Programmed Physical Optical Elements dynamically
        let startX = 300;
        const spacing = (w - 450) / Math.max(this.currentGatesSequence.length, 1);

        this.currentGatesSequence.forEach((gate, idx) => {
            const posX = startX + (idx * spacing);
            let compLabel = '';
            let compColor = '#a855f7';

            switch(gate) {
                case 'X': compLabel = 'HWP Plate\n(Pauli-X)'; break;
                case 'Y': compLabel = 'WP Array\n(Pauli-Y)'; break;
                case 'Z': compLabel = 'QWP Stage\n(Pauli-Z)'; break;
                case 'H': compLabel = 'BS Splitter\n(Hadamard)'; compColor = '#384566'; break;
                case 'S': compLabel = 'Phase Cell\n(S Gate)'; break;
                case 'T': compLabel = 'π/8 Crystal\n(T Gate)'; break;
            }

            this.drawComponent(ctx, posX, railY, compLabel, compColor);

            // Link connection lines on active processing track
            ctx.fillStyle = '#475569';
            ctx.font = '10px monospace';
            ctx.fillText(`[Node ${idx+1}]`, posX - 20, railY - 35);
        });

        // End Terminal Stage (Polarizing Beam Splitter and Photodiode Detectors Array)
        const endX = w - 100;
        this.drawComponent(ctx, endX, railY, 'PBS Analysis\n& Detectors', '#f59e0b');

        // Photon Pulse Track Animation Mechanics
        if (this.isFiringAnimation) {
            this.pulseProgress += 0.01;
            if (this.pulseProgress > 1) this.isFiringAnimation = false;

            const beamCurrentX = 60 + (endX - 60) * this.pulseProgress;

            // Core Laser Beam Trace Segment
            ctx.beginPath();
            ctx.moveTo(60, railY);
            ctx.lineTo(beamCurrentX, railY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(255, 42, 109, 0.8)';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff2a6d';
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset canvas context state instantly

            // Simulating Single Photon Energy Unit Circle Node
            ctx.beginPath();
            ctx.arc(beamCurrentX, railY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
    }

    drawComponent(ctx, x, y, text, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x - 30, y - 25, 60, 50);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 30, y - 25, 60, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';

        const lines = text.split('\n');
        if(lines.length === 1) {
            ctx.fillText(text, x, y + 3);
        } else {
            ctx.fillText(lines[0], x, y - 2);
            ctx.fillText(lines[1], x, y + 10);
        }
    }
}