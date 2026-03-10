const mapNodes = [
    { name: "USA", x: 150, y: 180 },
    { name: "Brazil", x: 300, y: 350 },
    { name: "UK", x: 480, y: 120 },
    { name: "China", x: 800, y: 180 },
    { name: "Russia", x: 700, y: 100 },
    { name: "Australia", x: 850, y: 400 }
];

const logStream = document.getElementById('log-stream');
const attackLayer = document.getElementById('attack-lines');
let isEmergency = false;

// 1. Initialize Map Nodes
const nodeLayer = document.getElementById('map-nodes');
mapNodes.forEach(node => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", "var(--primary)");
    nodeLayer.appendChild(circle);
});

// 2. Simulate Attacks
function launchAttack() {
    const origin = mapNodes[Math.floor(Math.random() * mapNodes.length)];
    const target = mapNodes[Math.floor(Math.random() * mapNodes.length)];

    if (origin === target) return;

    // Create SVG Path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const curve = (origin.x + target.x) / 2;
    const d = `M ${origin.x} ${origin.y} Q ${curve} ${Math.min(origin.y, target.y) - 50} ${target.x} ${target.y}`;

    path.setAttribute("d", d);
    path.setAttribute("class", "attack-line");
    attackLayer.appendChild(path);

    // Add Log Entry
    const log = document.createElement('div');
    log.className = 'log-entry';
    log.innerHTML = `> [BREACH ATTEMPT] ORIGIN: ${origin.name} -> TARGET: ${target.name} [IP: ${Math.floor(Math.random() * 255)}... ]`;
    logStream.prepend(log);

    // Remove line after animation
    setTimeout(() => path.remove(), 3000);
}

// 3. UI Toggles
function toggleEmergency() {
    isEmergency = !isEmergency;
    document.body.className = isEmergency ? 'emergency-red' : 'normal-ops';
    document.getElementById('threat-lvl').innerText = isEmergency ? 'CRITICAL' : 'LOW';
    document.getElementById('isolate-btn').innerText = isEmergency ? 'RESTORE SYSTEMS' : 'ISOLATE SERVERS';
}

function toggleFirewall() {
    const btn = document.getElementById('firewall-btn');
    btn.style.boxShadow = "0 0 40px var(--accent)";
    setTimeout(() => btn.style.boxShadow = "none", 1000);
}

// 4. Clocks & Intervals
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString() + " UTC";
}, 1000);

// Launch random attacks
setInterval(launchAttack, 1500);