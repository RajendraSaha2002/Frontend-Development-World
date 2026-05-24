/**
 * Native Canvas Visualizer for the Purdue Model Architecture.
 * Draws Level 0 through Level 4 and animates packet transmission.
 */
class PurdueVisualizer {
    constructor() {
        this.canvas = document.getElementById('purdueMapCanvas');
        this.initCanvas();
        this.startAnimation();

        window.addEventListener('resize', () => this.initCanvas());
    }

    initCanvas() {
        if (!this.canvas || this.canvas.offsetParent === null) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    drawArchitecture() {
        if (!this.ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);

        // Draw Purdue Zones (Horizontal Background Bands)
        const levels = [
            { name: "L4 Enterprise Zone", color: "rgba(59, 130, 246, 0.05)", y: 0, height: h * 0.2 },
            { name: "L3 Control Center", color: "rgba(6, 182, 212, 0.05)", y: h * 0.2, height: h * 0.2 },
            { name: "L2 Local Control Systems", color: "rgba(16, 185, 129, 0.05)", y: h * 0.4, height: h * 0.2 },
            { name: "L1 Controller LAN", color: "rgba(249, 115, 22, 0.05)", y: h * 0.6, height: h * 0.2 },
            { name: "L0 Field I/O Devices", color: "rgba(239, 68, 68, 0.05)", y: h * 0.8, height: h * 0.2 }
        ];

        levels.forEach(lvl => {
            ctx.fillStyle = lvl.color;
            ctx.fillRect(0, lvl.y, w, lvl.height);
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.font = "12px monospace";
            ctx.fillText(lvl.name, 10, lvl.y + 20);

            // Separator Line
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.moveTo(0, lvl.y + lvl.height);
            ctx.lineTo(w, lvl.y + lvl.height);
            ctx.stroke();
        });

        // Define Nodes (AMT Servers, Switches, MTUs, RTUs, PLCs, Sensors)
        this.nodes = [
            // L4
            { id: "AMT_SRV", x: w*0.3, y: h*0.1, label: "AMT Server", type: "server" },
            { id: "L4_SW", x: w*0.5, y: h*0.1, label: "Switch", type: "switch" },
            { id: "L4_HMI", x: w*0.7, y: h*0.1, label: "HMI", type: "workstation" },
            // Firewall between L4 and L3
            { id: "FW", x: w*0.5, y: h*0.2, label: "Firewall", type: "firewall" },
            // L3
            { id: "L3_SW", x: w*0.5, y: h*0.3, label: "Switch", type: "switch" },
            { id: "L3_MTU", x: w*0.3, y: h*0.25, label: "MTU", type: "server" },
            { id: "L3_HIST", x: w*0.7, y: h*0.35, label: "Data Historian", type: "server" },
            // L2
            { id: "L2_SW", x: w*0.6, y: h*0.5, label: "Switch", type: "switch" },
            { id: "L2_MTU", x: w*0.8, y: h*0.45, label: "MTU", type: "server" },
            // L1
            { id: "L1_SW", x: w*0.5, y: h*0.7, label: "Switch", type: "switch" },
            { id: "PLC_1", x: w*0.3, y: h*0.7, label: "PLC (IDAD)", type: "plc" },
            { id: "RTU_1", x: w*0.7, y: h*0.7, label: "RTU (IDAD)", type: "plc" },
            // L0
            { id: "SENS_1", x: w*0.2, y: h*0.9, label: "Sensor", type: "io" },
            { id: "ACT_1", x: w*0.4, y: h*0.9, label: "Actuator", type: "io" },
            { id: "SENS_2", x: w*0.6, y: h*0.9, label: "Sensor", type: "io" },
            { id: "ACT_2", x: w*0.8, y: h*0.9, label: "Actuator", type: "io" }
        ];

        const connections = [
            ["AMT_SRV", "L4_SW"], ["L4_SW", "L4_HMI"], ["L4_SW", "FW"], ["FW", "L3_SW"],
            ["L3_SW", "L3_MTU"], ["L3_SW", "L3_HIST"], ["L3_SW", "L2_SW"], ["L3_SW", "L1_SW"],
            ["L2_SW", "L2_MTU"], ["L1_SW", "PLC_1"], ["L1_SW", "RTU_1"],
            ["PLC_1", "SENS_1"], ["PLC_1", "ACT_1"], ["RTU_1", "SENS_2"], ["RTU_1", "ACT_2"]
        ];

        // Draw Connections
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
        ctx.lineWidth = 2;
        connections.forEach(conn => {
            const n1 = this.nodes.find(n => n.id === conn[0]);
            const n2 = this.nodes.find(n => n.id === conn[1]);
            if(n1 && n2) {
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
            }
        });

        // Draw Nodes
        this.nodes.forEach(node => {
            ctx.fillStyle = node.type === 'switch' ? '#3b82f6' : (node.type === 'firewall' ? '#ef4444' : '#06b6d4');
            if (node.type === 'io') ctx.fillStyle = '#10b981';

            ctx.beginPath();
            if (node.type === 'switch' || node.type === 'firewall') {
                ctx.rect(node.x - 15, node.y - 10, 30, 20);
            } else {
                ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.fillStyle = "#e2e8f0";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(node.label, node.x, node.y + 20);
        });

        // Draw SPAN/TAP Sensors
        const sensors = [
            { x: w*0.6, y: h*0.1, label: "L4 Sensor" },
            { x: w*0.2, y: h*0.3, label: "L3 Sensor" },
            { x: w*0.5, y: h*0.5, label: "L2 Sensor" },
            { x: w*0.25, y: h*0.65, label: "L1 Sensor" }
        ];

        const time = Date.now() / 300;
        sensors.forEach(s => {
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Radar pulse
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.8 - (time % 2) * 0.4})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, (time % 2) * 20, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#f97316";
            ctx.fillText(s.label, s.x, s.y - 12);
        });
    }

    startAnimation() {
        const animate = () => {
            if(this.canvas && this.canvas.offsetParent !== null) {
                this.drawArchitecture();
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.Visualizer = new PurdueVisualizer();
});