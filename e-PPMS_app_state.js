/**
 * Core Application State & R&D Project Proposal Master Store
 */
const AppState = (() => {
    const store = {
        currentUser: {
            id: 'USR-PI-104',
            name: 'Prof. V. Raman',
            role: 'pi',
            institute: 'National Center for Advanced Technology'
        },

        // Master Proposal Lifecycle Registry
        proposals: [
            {
                id: 'PROP-2024-8841',
                title: 'Autonomous Edge-AI Sensors for Coastal Ocean Acidification Telemetry',
                pi: 'Prof. V. Raman',
                institute: 'National Center for Advanced Technology',
                domain: 'Ocean Engineering',
                budget: 84.50,
                stage: 3, // Peer Review
                scrutiny: 'Verified & Endorsed',
                reviewScore: 88,
                tecDecision: 'Recommended',
                sanctioned: false,
                sanctionOrder: null,
                abstract: 'Implementation of localized low-power IoT micro-sensor arrays with edge inference algorithms to quantify maritime pH deviations.'
            },
            {
                id: 'PROP-2024-7712',
                title: 'Room-Temperature Superconducting Thin Films via High-Pressure Hydrides',
                pi: 'Dr. Sunita Deshmukh',
                institute: 'Institute of Condensed Matter Research',
                domain: 'Quantum Systems',
                budget: 142.00,
                stage: 4, // TEC Evaluation
                scrutiny: 'Verified & Endorsed',
                reviewScore: 94,
                tecDecision: 'Oral Presentation Scheduled',
                sanctioned: false,
                sanctionOrder: null,
                abstract: 'Synthesizing novel cage hydride compositions deposited via pulsed laser methods for macroscopic room-temperature conductivity analysis.'
            },
            {
                id: 'PROP-2023-5521',
                title: 'CRISPR-Cas12 Diagnostic Strips for Multi-Drug Resistant Mycobacteria',
                pi: 'Dr. Tariq Anwar',
                institute: 'Apex Health Science Institute',
                domain: 'Biotechnology',
                budget: 68.20,
                stage: 6, // Sanction & Release
                scrutiny: 'Verified & Endorsed',
                reviewScore: 91,
                tecDecision: 'Formally Approved',
                sanctioned: true,
                sanctionOrder: 'SANCT-2024-Q1-094',
                abstract: 'Paper-based lateral flow enzymatic biosensors enabling 15-minute point-of-care detection of multi-drug resistant pathogens.'
            },
            {
                id: 'PROP-2023-4108',
                title: 'Membrane-Less High-Current Electrolyzers for Decentralized Green Hydrogen',
                pi: 'Er. Rajesh K. Pillai',
                institute: 'Clean Energy Energy Foundation',
                domain: 'Clean Energy',
                budget: 195.00,
                stage: 7, // Project Monitoring
                scrutiny: 'Verified & Endorsed',
                reviewScore: 89,
                tecDecision: 'Formally Approved',
                sanctioned: true,
                sanctionOrder: 'SANCT-2023-Q4-018',
                abstract: 'Hydrodynamic separation of hydrogen gas bubbles in flowing alkaline media eliminating costly perfluorinated polymer membranes.'
            }
        ],

        // Multi-Agency Historical Rollout (Page 1)
        deployments: [
            { agency: 'Health Research Council', year: '2012' },
            { agency: 'Science & Engg. Board', year: '2013' },
            { agency: 'Bi-National Science Alliance', year: '2014' },
            { agency: 'Health & Medical Research', year: '2016' },
            { agency: 'Regional International Tech', year: '2017' },
            { agency: 'National Impact Mission', year: '2018' },
            { agency: 'Defense R&D Directorate', year: '2022' },
            { agency: 'Electronics & IT Ministry', year: '2023' },
            { agency: 'Ocean Technology Council', year: '2024' }
        ],

        // Communications Feed
        threads: [
            {
                id: 'TH-01',
                proposalId: 'PROP-2024-8841',
                title: 'Clarification regarding Foreign Equipment Budget',
                lastMessage: 'Please submit quotation proforma for the Ocean Spectrometer.',
                date: 'Today, 11:20 AM'
            },
            {
                id: 'TH-02',
                proposalId: 'PROP-2024-7712',
                title: 'TEC Oral Presentation Time Slot Confirmation',
                lastMessage: 'Your slot is confirmed for Monday, 14:30 hrs via secure video bridge.',
                date: 'Yesterday'
            }
        ],

        // Notifications
        notifications: [
            { id: 1, type: 'ALERT', text: 'Proposal PROP-2024-8841 moved to Stage 3 (Peer Review)', time: '10:15 AM' },
            { id: 2, type: 'SMS', text: 'Tranche 1 Grant of ₹42.2 Lakhs disbursed for SANCT-2024-Q1-094.', time: '09:00 AM' }
        ]
    };

    return {
        get: (key) => store[key],
        set: (key, val) => { store[key] = val; },
        addProposal: (p) => store.proposals.unshift(p),
        addNotification: (n) => store.notifications.unshift(n)
    };
})();