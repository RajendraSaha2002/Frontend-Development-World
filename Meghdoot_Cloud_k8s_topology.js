/**
 * Interactive Particle/Node topology representing Kubernetes & OpenStack Architecture.
 */
class TopologyVisualizer {
    constructor() {
        this.canvas = document.getElementById('k8sTopologyCanvas');
        this.ctx = null;
        this.nodes = [];
        this.edges = [];

        this.initCanvas();
        this.buildCluster();
        this.startAnimation();

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.buildCluster();
        });
    }

    initCanvas() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    buildCluster() {
        if (!this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.nodes = [];
        this.edges = [];

        // 1 Control Plane (OpenStack/K8s Master)
        this.nodes.push({ id: 0, x: w/2, y: h/2, type: 'master', vx: 0, vy: 0 });

        // 6 Worker Nodes
        for(let i = 1; i <= 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dist = Math.min(w, h) * 0.25;
            this.nodes.push({
                id: i,
                x: w/2 + Math.cos(angle) * dist,
                y: h/2 + Math.sin(angle) * dist,
                type: 'worker',
                baseX: w/2 + Math.cos(angle) * dist,
                baseY: h/2 + Math.sin(angle) * dist,
                angle: angle
            });
            this.edges.push({ source: 0, target: i });

            // 3-5 Pods per worker
            const podCount = Math.floor(Math.random() * 3) + 3;
            for(let p = 0; p < podCount; p++) {
                const podAngle = angle + ((p - podCount/2) * 0.4);
                const podDist = dist + 60;
                const podId = this.nodes.length;
                this.nodes.push({
                    id: podId,
                    x: w/2 + Math.cos(podAngle) * podDist,
                    y: h/2 + Math.sin(podAngle) * podDist,
                    type: 'pod',
                    baseX: w/2 + Math.cos(podAngle) * podDist,
                    baseY: h/2 + Math.sin(podAngle) * podDist
                });
                this.edges.push({ source: i, target: podId });
            }
        }
    }

    draw() {
        if (!this.ctx || this.canvas.offsetParent === null) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);

        const time = Date.now() / 1000;

        // Draw Edges
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;
        this.edges.forEach(edge => {
            const source = this.nodes[edge.source];
            const target = this.nodes[edge.target];
            this.ctx.beginPath();
            this.ctx.moveTo(source.x, source.y);
            this.ctx.lineTo(target.x, target.y);
            this.ctx.stroke();

            // Draw flowing data packets
            if(target.type === 'worker' || (target.type === 'pod' && Math.random() > 0.95)) {
                const pTime = (time + edge.target) % 1;
                const px = source.x + (target.x - source.x) * pTime;
                const py = source.y + (target.y - source.y) * pTime;
                this.ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(px, py, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Draw Nodes
        this.nodes.forEach(node => {
            // Add subtle floating motion
            if(node.type !== 'master') {
                node.x = node.baseX + Math.sin(time + node.id) * 5;
                node.y = node.baseY + Math.cos(time + node.id) * 5;
            }

            let radius = 6;
            let color = '#10b981'; // Pods (Green)

            if(node.type === 'master') {
                radius = 20;
                color = '#3b82f6'; // Master (Blue)
                // Pulse ring
                this.ctx.strokeStyle = `rgba(59, 130, 246, ${Math.max(0, Math.sin(time*2))})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius + 10 + Math.sin(time*4)*5, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if(node.type === 'worker') {
                radius = 12;
                color = '#8b5cf6'; // Worker (Purple)
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner core for aesthetics
            this.ctx.fillStyle = '#1e293b';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    startAnimation() {
        const animate = () => {
            this.draw();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Topology = new TopologyVisualizer();
});