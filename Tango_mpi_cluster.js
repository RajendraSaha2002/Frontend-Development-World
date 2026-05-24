/**
 * Visualizes the Master-Slave MPI Architecture.
 * Draws nodes in a tree-like fashion and simulates load balancing.
 */
class MPIClusterVisualizer {
    constructor() {
        this.canvas = document.getElementById('mpiClusterCanvas');
        this.ctx = null;
        this.nodes = [];
        this.activeJobs = 0;

        this.initCanvas();
        this.generateTopology();
        this.startAnimation();

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.generateTopology();
        });
    }

    initCanvas() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    generateTopology() {
        if (!this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.nodes = [];

        // Master Node
        this.nodes.push({ id: 0, x: w / 2, y: 50, type: 'master', load: 0 });

        // Branch/Manager Nodes (Level 1)
        const l1Count = 3;
        const l1Spacing = w / (l1Count + 1);
        for (let i = 1; i <= l1Count; i++) {
            this.nodes.push({ id: i, parentId: 0, x: i * l1Spacing, y: 150, type: 'manager', load: 0 });
        }

        // Slave/Worker Nodes (Level 2)
        let idCounter = l1Count + 1;
        for (let i = 1; i <= l1Count; i++) {
            const l2Count = 4; // 4 slaves per manager
            const parentX = i * l1Spacing;
            const spread = l1Spacing * 0.8;
            const startX = parentX - (spread / 2);
            const step = spread / (l2Count - 1);

            for (let j = 0; j < l2Count; j++) {
                this.nodes.push({
                    id: idCounter++,
                    parentId: i,
                    x: startX + (j * step),
                    y: h - 100,
                    type: 'slave',
                    load: Math.random() // Initialize with random load
                });
            }
        }

        // Update DOM Metric
        const metricEl = document.getElementById('node-count');
        if(metricEl) metricEl.textContent = `${this.nodes.filter(n => n.type === 'slave').length}/16`;
    }

    draw() {
        if (!this.ctx || this.canvas.offsetParent === null) return;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.clearRect(0, 0, w, h);

        // Draw connections
        this.ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
        this.ctx.lineWidth = 1;
        this.nodes.forEach(node => {
            if (node.parentId !== undefined) {
                const parent = this.nodes.find(n => n.id === node.parentId);
                if (parent) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(node.x, node.y);
                    this.ctx.lineTo(parent.x, parent.y);
                    this.ctx.stroke();

                    // Draw moving packets if load is > 0
                    if (node.load > 0.2 && window.isJobRunning) {
                        const time = (Date.now() / 1000) % 1;
                        const px = parent.x + (node.x - parent.x) * time;
                        const py = parent.y + (node.y - parent.y) * time;

                        this.ctx.fillStyle = "#06b6d4";
                        this.ctx.beginPath();
                        this.ctx.arc(px, py, 3, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
        });

        // Draw nodes
        this.nodes.forEach(node => {
            let radius = 10;
            let color = "#2a2a3d";

            if (node.type === 'master') { radius = 20; color = "#6366f1"; }
            else if (node.type === 'manager') { radius = 15; color = "#8b5cf6"; }
            else if (node.type === 'slave') {
                // Simulate load fluctuation
                if (window.isJobRunning) {
                    node.load += (Math.random() - 0.5) * 0.1;
                    node.load = Math.max(0, Math.min(1, node.load));
                } else {
                    node.load *= 0.9; // Decay to 0
                }

                // Color based on load (green to orange to red)
                if (node.load < 0.5) color = "#10b981";
                else if (node.load < 0.8) color = "#f59e0b";
                else color = "#ef4444";

                radius = 8 + (node.load * 4);
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Halo for master
            if (node.type === 'master') {
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius + 5 + Math.sin(Date.now()/300)*3, 0, Math.PI * 2);
                this.ctx.stroke();
            }
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
    window.ClusterSim = new MPIClusterVisualizer();
});