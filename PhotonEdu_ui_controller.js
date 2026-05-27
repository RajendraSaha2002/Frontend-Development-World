/**
 * Main Architectural Synchronization Hub Engine Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    // Instantiate core sub-systems
    const benchSim = new OpticalBenchSimulator();
    const blochSim = new BlochSphereVisualizer();

    // Application state state vector cache
    let pipelineGates = ['H', 'T']; // Default pipeline matched from QASM preview input text

    // UI Elements Wire-up Map
    const circuitTimeline = document.getElementById('main-circuit-line');
    const qasmInput = document.getElementById('qasm-code-input');
    const btnCompile = document.getElementById('btn-compile-code');
    const btnFlush = document.getElementById('btn-flush-circuit');
    const btnGlobalTrigger = document.getElementById('btn-global-trigger');
    const lblSyntax = document.getElementById('lbl-syntax-msg');

    // Telemetry & Mathematical Field Injections
    const txtState = document.getElementById('telemetry-state');
    const cellAlpha = document.getElementById('mat-alpha');
    const cellBeta = document.getElementById('mat-beta');
    const barZero = document.getElementById('bar-prob-zero');
    const barOne = document.getElementById('bar-prob-one');
    const pctZero = document.getElementById('lbl-pct-zero');
    const pctOne = document.getElementById('lbl-pct-one');
    const bx = document.getElementById('b-coord-x');
    const by = document.getElementById('b-coord-y');
    const bz = document.getElementById('b-coord-z');

    // Draw the active interactive pipeline components onto the HTML timeline strip view
    function rebuildInteractiveWireDOM() {
        circuitTimeline.innerHTML = '';
        pipelineGates.forEach((gate, idx) => {
            const gateNode = document.createElement('div');
            gateNode.className = 'wire-gate-node';
            gateNode.textContent = gate;

            const removeBtn = document.createElement('div');
            removeBtn.className = 'node-remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                pipelineGates.splice(idx, 1);
                syncSystemPipeline();
            });

            gateNode.appendChild(removeBtn);
            circuitTimeline.appendChild(gateNode);
        });

        // Update the programmatic simulation benchmark configuration values
        benchSim.setPipeline(pipelineGates);
    }

    // Mathematical Calculation Solver Pipeline Core Execution Engine Frame
    function calculateQuantumMetrics() {
        let state = QMath.getIdentityState();

        // Chain multiply state values continuously across vector arrays
        pipelineGates.forEach(gateKey => {
            const matrix = QMath.gates[gateKey];
            if (matrix) {
                state = QMath.applyGate(state, matrix);
            }
        });

        // Compute metrics out from the final complex system parameters state
        const metrics = QMath.getMetrics(state);

        // Wire mathematical readouts seamlessly directly into UI view fields
        cellAlpha.textContent = `${state[0].r.toFixed(3)} ${state[0].i >= 0 ? '+' : '-'} ${Math.abs(state[0].i).toFixed(3)}i`;
        cellBeta.textContent  = `${state[1].r.toFixed(3)} ${state[1].i >= 0 ? '+' : '-'} ${Math.abs(state[1].i).toFixed(3)}i`;

        // Bar probability scale metrics
        const p0Pct = (metrics.p0 * 100).toFixed(1);
        const p1Pct = (metrics.p1 * 100).toFixed(1);

        barZero.style.width = `${p0Pct}%`;
        barOne.style.width = `${p1Pct}%`;
        pctZero.textContent = `${p0Pct}%`;
        pctOne.textContent = `${p1Pct}%`;

        // Update Bloch target point structures
        bx.textContent = metrics.x.toFixed(3);
        by.textContent = metrics.y.toFixed(3);
        bz.textContent = metrics.z.toFixed(3);
        blochSim.updateStateCoordinates(metrics.x, metrics.y, metrics.z);

        // Categorize Telemetry Label preview state
        if (pipelineGates.length === 0) txtState.textContent = '|0⟩';
        else txtState.textContent = `|ψ⟩ [Nodes: ${pipelineGates.length}]`;
    }

    function syncSystemPipeline() {
        rebuildInteractiveWireDOM();
        calculateQuantumMetrics();
    }

    // Compile Actions parsing raw text editor structures directly into operational queues
    btnCompile.addEventListener('click', () => {
        try {
            const parsedGates = QASMParser.parse(qasmInput.value);
            pipelineGates = parsedGates;
            syncSystemPipeline();
            lblSyntax.textContent = "Compiled & Injected Successfully";
            lblSyntax.className = "syntax-status text-emerald";
        } catch(err) {
            lblSyntax.textContent = "Error parsing compilation strings";
            lblSyntax.className = "syntax-status text-laser";
        }
    });

    btnFlush.addEventListener('click', () => {
        pipelineGates = [];
        syncSystemPipeline();
        qasmInput.value = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[1];\ncreg c[1];\n\nmeasure q[0] -> c[0];`;
    });

    btnGlobalTrigger.addEventListener('click', () => {
        benchSim.triggerPhotonPulse();
    });

    // Handle HTML Drag/Drop events inside toolbox primitives
    const toolGates = document.querySelectorAll('.draggable-gate-primitive');
    toolGates.forEach(tg => {
        tg.addEventListener('click', (e) => {
            const newGate = e.target.getAttribute('data-gate');
            if(pipelineGates.length < 8) { // Absolute limits avoiding buffer stack overflow overflow
                pipelineGates.push(newGate);
                syncSystemPipeline();

                // Append text instruction inside raw text element code line blocks manually
                const currentCode = qasmInput.value;
                const measureIndex = currentCode.indexOf('measure');
                if(measureIndex !== -1) {
                    qasmInput.value = currentCode.substring(0, measureIndex) + `${newGate.toLowerCase()} q[0];\n` + currentCode.substring(measureIndex);
                }
            }
        });
    });

    // Fire default startup configuration system matrices synchronization tracking routines
    syncSystemPipeline();
});