/**
 * Lumina Core Mathematics Engine
 * Pure Complex Matrix Vector Mechanics for Precise Single Photon State Tracking
 */
const QMath = {
    // Basic Complex Number Factories
    complex: (r, i = 0) => ({ r, i }),

    add: (c1, c2) => ({ r: c1.r + c2.r, i: c1.i + c2.i }),

    multiply: (c1, c2) => ({
        r: c1.r * c2.r - c1.i * c2.i,
        i: c1.r * c2.i + c1.i * c2.r
    }),

    // Native Single-Qubit Identity Matrix
    getIdentityState: () => [
        { r: 1, i: 0 }, // Alpha |0>
        { r: 0, i: 0 }  // Beta  |1>
    ],

    // Pure Quantum Logical Gate Operators Matrix Set
    gates: {
        X: [
            [{r:0, i:0}, {r:1, i:0}],
            [{r:1, i:0}, {r:0, i:0}]
        ],
        Y: [
            [{r:0, i:0}, {r:0, i:-1}],
            [{r:0, i:1}, {r:0, i:0}]
        ],
        Z: [
            [{r:1, i:0}, {r:0, i:0}],
            [{r:0, i:0}, {r:-1, i:0}]
        ],
        H: [
            [{r: 1/Math.sqrt(2), i:0}, {r: 1/Math.sqrt(2), i:0}],
            [{r: 1/Math.sqrt(2), i:0}, {r: -1/Math.sqrt(2), i:0}]
        ],
        S: [
            [{r:1, i:0}, {r:0, i:0}],
            [{r:0, i:0}, {r:0, i:1}]
        ],
        T: [
            [{r:1, i:0}, {r:0, i:0}],
            [{r:0, i:0}, {r: Math.cos(Math.PI/4), i: Math.sin(Math.PI/4)}]
        ]
    },

    // Transforms input state vector sequentially across operational gates
    applyGate: (state, gateMatrix) => {
        const nextState = [{r:0, i:0}, {r:0, i:0}];

        // Matrix multiplication execution tracking
        nextState[0] = QMath.add(QMath.multiply(gateMatrix[0][0], state[0]), QMath.multiply(gateMatrix[0][1], state[1]));
        nextState[1] = QMath.add(QMath.multiply(gateMatrix[1][0], state[0]), QMath.multiply(gateMatrix[1][1], state[1]));

        return nextState;
    },

    // Extracts physical properties out from pure probability amplitudes
    getMetrics: (state) => {
        const p0 = state[0].r * state[0].r + state[0].i * state[0].i;
        const p1 = state[1].r * state[1].r + state[1].i * state[1].i;

        // Compute Coordinate Map Projections onto the 3D Bloch Sphere
        // x = 2 * Real(alpha * conj(beta))
        // y = 2 * Imag(alpha * conj(beta))
        // z = |alpha|^2 - |beta|^2
        const conjBeta = { r: state[1].r, i: -state[1].i };
        const prod = QMath.multiply(state[0], conjBeta);

        const x = 2 * prod.r;
        const y = 2 * prod.i;
        const z = p0 - p1;

        return { p0, p1, x, y, z };
    }
};