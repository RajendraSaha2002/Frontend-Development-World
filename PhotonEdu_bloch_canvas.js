/**
 * 3D Bloch Sphere Geometrical Space Vector Math Renderer via 2D Isometric Tracing
 */
class BlochSphereVisualizer {
    constructor() {
        this.canvas = document.getElementById('bloch-sphere-canvas');
        this.ctx = null;
        this.coords = { x: 0, y: 0, z: 1 };
        this.rotationAngle = 0.6; // Soft continuous isometric rotational offset state

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.renderLoop();
    }

    resize() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    updateStateCoordinates(x, y, z) {
        this.coords = { x, y, z };
    }

    renderLoop() {
        if (this.canvas && this.canvas.offsetParent !== null && this.ctx) {
            this.draw();
        }
        // Slowly rotate sphere outline perspectives across time matrix
        this.rotationAngle += 0.002;
        requestAnimationFrame(() => this.renderLoop());
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const center = { x: w / 2, y: h / 2 };
        const radius = Math.min(w, h) * 0.38;

        ctx.clearRect(0, 0, w, h);

        // Render Back Orthogonal Horizon Grids
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;

        // Sphere Circular Rim Outline Boundary Trace
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Equator Latitude Oval Projection (Perspective mapping)
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Render Coordinate Pole Grid Axes Lines (X, Y, Z)
        // Z Axis (Vertical Pole Vector)
        ctx.beginPath();
        ctx.moveTo(center.x, center.y - radius);
        ctx.lineTo(center.x, center.y + radius);
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Calculations parsing 3D projection onto 2D viewport coordinates
        const xAngle = this.rotationAngle;
        const yAngle = this.rotationAngle + Math.PI / 2;

        const xEnd = {
            x: center.x - radius * Math.cos(xAngle) * 0.7,
            y: center.y + radius * Math.sin(xAngle) * 0.3
        };
        const yEnd = {
            x: center.x + radius * Math.cos(yAngle) * 0.7,
            y: center.y - radius * Math.sin(yAngle) * 0.3
        };

        // Draw X & Y Axes segments
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(xEnd.x, xEnd.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(yEnd.x, yEnd.y); ctx.stroke();

        // Pole State Labels Typography Placement
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('|0⟩ (+Z)', center.x - 22, center.y - radius - 10);
        ctx.fillText('|1⟩ (-Z)', center.x - 22, center.y + radius + 18);
        ctx.fillText('|+⟩ (+X)', xEnd.x - 50, xEnd.y + 4);
        ctx.fillText('|R⟩ (+Y)', yEnd.x + 10, yEnd.y);

        // Calculate mapped location coordinates of our parsed Wave Vector State
        // Mapping: combine space projections dynamically
        const stateX = this.coords.x;
        const stateY = this.coords.y;
        const stateZ = this.coords.z;

        const vectorTargetX = center.x + (stateY * Math.cos(yAngle) * 0.7 - stateX * Math.cos(xAngle) * 0.7) * radius;
        const vectorTargetY = center.y - stateZ * radius + (stateX * Math.sin(xAngle) * 0.3 - stateY * Math.sin(yAngle) * 0.3) * radius;

        // Render State Amplitude Pointer Line
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(vectorTargetX, vectorTargetY);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#06b6d4';
        ctx.stroke();
        ctx.lineWidth = 1;

        // Vector Node Circle Core Tip
        ctx.beginPath();
        ctx.arc(vectorTargetX, vectorTargetY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff2a6d';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    }
}