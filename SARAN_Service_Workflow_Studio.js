/**
 * 04-workflow-studio.js
 * Graphical User Interface for Workflow Management and Flow Designer.
 */
const SaranWorkflow = (function () {
    'use strict';

    const defaultNodes = [
        { id: 'node_1', type: 'trigger', label: 'Inbound Ticket Ingestion', x: 40, y: 80, desc: 'Sources: REST API, Email, Web Portal' },
        { id: 'node_2', type: 'condition', label: 'Evaluate SLA Matrix', x: 280, y: 80, desc: 'Calculates business hours & priority' },
        { id: 'node_3', type: 'action', label: 'Assign Specialist Team', x: 520, y: 50, desc: 'Auto-route by Configuration Item (CI)' },
        { id: 'node_4', type: 'notify', label: 'SMS & Email Notification', x: 520, y: 180, desc: 'Dispatches alerts to Tier Leads' }
    ];

    function renderNodes() {
        const layer = document.getElementById('workflowNodesLayer');
        const svg = document.getElementById('workflowSvgCanvas');
        if (!layer || !svg) return;

        layer.innerHTML = '';
        // Clear dynamic paths except defs
        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        svg.appendChild(defs);

        defaultNodes.forEach(n => {
            const el = document.createElement('div');
            el.className = 'flow-node';
            el.id = n.id;
            el.style.left = `${n.x}px`;
            el.style.top = `${n.y}px`;

            el.innerHTML = `
        <div class="flow-node-header">
          <span class="profile-dot ${n.type === 'trigger' ? 'change' : (n.type === 'action' ? 'incident' : 'request')}"></span>
          <span>${n.label}</span>
        </div>
        <div class="flow-node-body">${n.desc}</div>
      `;

            // Enable drag simulation
            makeDraggable(el, n);
            layer.appendChild(el);
        });

        drawConnections();
    }

    function drawConnections() {
        const svg = document.getElementById('workflowSvgCanvas');
        if (!svg) return;

        // Connect node_1 -> node_2
        connectNodes(svg, defaultNodes[0], defaultNodes[1]);
        // Connect node_2 -> node_3
        connectNodes(svg, defaultNodes[1], defaultNodes[2]);
        // Connect node_2 -> node_4
        connectNodes(svg, defaultNodes[1], defaultNodes[3]);
    }

    function connectNodes(svg, source, target) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = source.x + 180;
        const startY = source.y + 40;
        const endX = target.x;
        const endY = target.y + 40;

        const deltaX = (endX - startX) / 2;
        const d = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

        path.setAttribute('d', d);
        path.setAttribute('stroke', '#94a3b8');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(path);
    }

    function makeDraggable(element, nodeData) {
        let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;
        element.onmousedown = function (e) {
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmouseup = closeDrag;
            document.onmousemove = dragElement;
        };

        function dragElement(e) {
            e.preventDefault();
            offsetX = mouseX - e.clientX;
            offsetY = mouseY - e.clientY;
            mouseX = e.clientX;
            mouseY = e.clientY;

            nodeData.x = element.offsetLeft - offsetX;
            nodeData.y = element.offsetTop - offsetY;
            element.style.left = `${nodeData.x}px`;
            element.style.top = `${nodeData.y}px`;

            drawConnections();
        }

        function closeDrag() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    return {
        init: renderNodes
    };
})();