/**
 * Protocol Management UI
 * Simulates switching between QKD, Teleportation, etc.
 */
document.addEventListener('DOMContentLoaded', () => {
    const protoItems = document.querySelectorAll('.proto-item');
    const title = document.getElementById('proto-analytics-title');
    const terminal = document.getElementById('proto-live-feed');

    const protocolData = {
        'teleport': { title: 'Quantum Teleportation Metrics', logs: ['Initialize Teleportation Protocol...', 'Alice applies CNOT to |ψ⟩ and EPR half.', 'Measurement yields classical bits (1,0).'] },
        'qkd': { title: 'QKD (BB84) Metrics', logs: ['Establishing Quantum Key Distribution...', 'Alice sending random polarized photons.', 'Bob measuring in random bases.', 'Sifting keys over classical channel...'] },
        'sdc': { title: 'Super Dense Coding Metrics', logs: ['Alice encodes 2 classical bits on 1 qubit...', 'Applying Pauli gates based on bitstring.', 'Qubit transmitted to Bob.'] },
        'purify': { title: 'Entanglement Purification', logs: ['Assessing degraded Bell pairs...', 'Applying bilateral CNOT operations.', 'Sacrificing pairs to increase target fidelity.'] }
    };

    protoItems.forEach(item => {
        item.addEventListener('click', (e) => {
            protoItems.forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');

            const key = e.target.getAttribute('data-proto');
            const data = protocolData[key];

            title.textContent = data.title;

            // Clear and rewrite terminal
            terminal.innerHTML = '';
            data.logs.forEach(log => {
                const div = document.createElement('div');
                div.className = 't-line info';
                div.textContent = log;
                terminal.appendChild(div);
            });
        });
    });
});