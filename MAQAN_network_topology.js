/**
 * Dynamic SVG Line Drawer for Metro Area QKD Network Topology
 */
class TopologyMap {
    constructor() {
        this.container = document.getElementById('network-topology-map');
        this.svg = document.getElementById('topology-svg');
        this.eveNode = document.getElementById('node-eve');
        this.btnEavesdrop = document.getElementById('btn-eavesdrop');
        this.qberLabel = document.getElementById('lbl-qber-val');

        // Define links matching the PDF diagram
        this.links = [
            { source: 'node-a', target: 'node-b', type: 'qkd' },
            { source: 'node-b', target: 'node-c', type: 'qkd' },
            { source: 'node-b', target: 'node-d', type: 'qkd' },
            { source: 'node-c', target: 'node-mux', type: 'qkd' },
            { source: 'node-d', target: 'node-mux', type: 'qkd' },
            { source: 'node-mux', target: 'node-e', type: 'qkd' },

            // SDN/Management links (dashed in PDF)
            { source: 'node-a', target: 'node-c', type: 'cc' },
            { source: 'node-b', target: 'node-c', type: 'cc' },
            { source: 'node-c', target: 'node-d', type: 'cc' },
            { source: 'node-e', target: 'node-c', type: 'cc' }
        ];

        window.addEventListener('resize', () => this.drawLines());
        this.drawLines();
        this.bindEvents();
    }

    getCenterCoords(elementId) {
        const el = document.getElementById(elementId);
        if(!el) return {x: 0, y: 0};
        const rect = el.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        return {
            x: (rect.left - containerRect.left) + (rect.width / 2),
            y: (rect.top - containerRect.top) + (rect.height / 2)
        };
    }

    drawLines() {
        this.svg.innerHTML = '';

        this.links.forEach(link => {
            const start = this.getCenterCoords(link.source);
            const end = this.getCenterCoords(link.target);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', start.x);
            line.setAttribute('y1', start.y);
            line.setAttribute('x2', end.x);
            line.setAttribute('y2', end.y);

            if(link.type === 'qkd') {
                line.setAttribute('stroke', 'var(--accent-gold)');
                line.setAttribute('stroke-width', '3');
            } else {
                line.setAttribute('stroke', 'var(--text-secondary)');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('stroke-dasharray', '5,5');
            }

            this.svg.appendChild(line);
        });
    }

    bindEvents() {
        this.btnEavesdrop.addEventListener('click', () => {
            const isHidden = this.eveNode.classList.contains('hidden');

            if(isHidden) {
                // Deploy Eve on Node B -> C channel
                this.eveNode.style.left = '42.5%';
                this.eveNode.style.top = '35%';
                this.eveNode.classList.remove('hidden');
                this.btnEavesdrop.textContent = "Remove Eavesdropper";
                this.btnEavesdrop.style.background = "var(--alert-red)";

                // Spike QBER
                this.qberLabel.textContent = "18.75%";
                this.qberLabel.style.color = "var(--alert-red)";

                // Log to DARPAN
                window.SDNController.log("CRITICAL: Quantum Bit Error Rate (QBER) exceeded threshold on Link B->C.", "err");
                window.SDNController.log("Intercept-Resend attack suspected. Halting key distillation.", "err");

            } else {
                this.eveNode.classList.add('hidden');
                this.btnEavesdrop.textContent = "Simulate Eavesdropper (Eve)";
                this.btnEavesdrop.style.background = "var(--accent-blue)";
                this.qberLabel.textContent = "1.24%";
                this.qberLabel.style.color = "var(--text-primary)";

                window.SDNController.log("Channel cleared. QBER normalized. Resuming key exchange.", "succ");
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully painted before calculating coordinates
    setTimeout(() => { window.TopoMap = new TopologyMap(); }, 100);
});