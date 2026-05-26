/**
 * Visual Circuit Builder Engine
 * Generates the quantum tracks and simulates drag-and-drop slots.
 */
class CircuitBuilder {
    constructor(qubits = 2, clbits = 2) {
        this.qubits = qubits;
        this.clbits = clbits;
        this.grid = document.getElementById('circuit-grid');
        this.renderCircuit();
    }

    renderCircuit() {
        this.grid.innerHTML = '';

        // Render Quantum Wires
        for (let i = 0; i < this.qubits; i++) {
            const wire = document.createElement('div');
            wire.className = 'q-wire';

            const label = document.createElement('div');
            label.className = 'wire-label';
            label.innerHTML = `|q<sub>${i}</sub>⟩`;

            const track = document.createElement('div');
            track.className = 'wire-track';

            // Create slots for gates
            for (let j = 0; j < 6; j++) {
                const slot = document.createElement('div');
                slot.className = 'gate-slot';

                // Pre-populate specific slots based on the PDF image example
                if (i === 0 && j === 0) slot.innerHTML = '<div class="gate-draggable hadamard" style="width:100%;height:100%">H</div>';
                if (i === 1 && j === 0) slot.innerHTML = '<div class="gate-draggable pauli-x" style="width:100%;height:100%">X</div>';
                if (j === 5) slot.innerHTML = '<div class="gate-draggable measure" style="width:100%;height:100%">M</div>';

                track.appendChild(slot);
            }

            wire.appendChild(label);
            wire.appendChild(track);
            this.grid.appendChild(wire);
        }

        // Draw CNOT connection (Hardcoded visual for the demo based on PDF)
        const cnotTarget = document.createElement('div');
        cnotTarget.className = 'cnot-target';
        cnotTarget.style.left = '168px'; // Align with slot 2
        cnotTarget.style.top = '128px'; // Align with q1

        const cnotLine = document.createElement('div');
        cnotLine.className = 'cnot-line';
        cnotLine.style.left = '180px';
        cnotLine.style.top = '60px'; // From q0
        cnotLine.style.height = '68px';

        // Add control dot
        const cnotControl = document.createElement('div');
        cnotControl.style.position = 'absolute';
        cnotControl.style.width = '12px';
        cnotControl.style.height = '12px';
        cnotControl.style.background = 'var(--gate-cx)';
        cnotControl.style.borderRadius = '50%';
        cnotControl.style.left = '174px';
        cnotControl.style.top = '54px';
        cnotControl.style.zIndex = '3';

        this.grid.appendChild(cnotTarget);
        this.grid.appendChild(cnotLine);
        this.grid.appendChild(cnotControl);

        // Render Classical Register
        const cWire = document.createElement('div');
        cWire.className = 'c-wire';
        cWire.innerHTML = `<div class="wire-label">c / ${this.clbits}</div><div class="c-wire-track"></div>`;
        this.grid.appendChild(cWire);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.VisualCircuit = new CircuitBuilder(2, 2);
});