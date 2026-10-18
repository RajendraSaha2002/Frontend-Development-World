/**
 * Core Application State Store & Mock Enterprise Database
 * Fully offline, reactive mock storage with transactional schema.
 */
const AppState = (() => {
    const store = {
        currentUser: {
            id: 'USR-9021',
            name: 'A. Devraj',
            role: 'hrmanager',
            designation: 'Joint Director (HR)',
            division: 'Headquarters'
        },

        // Core demographic alignment with provided system blueprint
        employees: [
            { pin: 'EMP-1001', name: 'Dr. Suresh Ray', gender: 'M', cadre: 'Permanent', designation: 'Scientist-G', dept: 'Systems Engineering', status: 'Active', basic: 144200 },
            { pin: 'EMP-1002', name: 'Ananya Sharma', gender: 'F', cadre: 'Permanent', designation: 'Sr. Director', dept: 'Cyber Security', status: 'Active', basic: 131100 },
            { pin: 'EMP-1003', name: 'Rajeev Menon', gender: 'M', cadre: 'Contractual', designation: 'Lead Architect', dept: 'Cloud Division', status: 'Active', basic: 95000 },
            { pin: 'EMP-1004', name: 'Pooja Kulkarni', gender: 'F', cadre: 'Permanent', designation: 'Tech Officer', dept: 'HR Information Cell', status: 'Active', basic: 67700 },
            { pin: 'EMP-1005', name: 'Amitabh Sen', gender: 'M', cadre: 'Deputation', designation: 'Finance Controller', dept: 'Accounts & Audit', status: 'Active', basic: 118500 },
            { pin: 'EMP-1006', name: 'Meenakshi Iyer', gender: 'F', cadre: 'Contractual', designation: 'Associate Engineer', dept: 'Systems Engineering', status: 'Active', basic: 48000 },
            { pin: 'EMP-1007', name: 'Kavita Das', gender: 'F', cadre: 'Permanent', designation: 'Section Officer', dept: 'General Admin', status: 'Active', basic: 78800 }
        ],

        // Hardware Biometric Terminal Gateway Statuses
        terminals: [
            { id: 'TERM-01', location: 'Gate 1 - Main Biometric Turnstile', ip: '192.168.10.201', state: 'ONLINE', pings: 432 },
            { id: 'TERM-02', location: 'Gate 2 - Admin North Corridor', ip: '192.168.10.202', state: 'ONLINE', pings: 310 },
            { id: 'TERM-03', location: 'R&D Block - Server Room Access', ip: '192.168.10.203', state: 'ONLINE', pings: 128 },
            { id: 'TERM-04', location: 'Regional Center - Silchar Hub', ip: '10.24.1.5', state: 'ONLINE', pings: 98 }
        ],

        // Recruitment Applications Pipeline
        recruitmentCandidates: [
            { id: 'APP-801', name: 'Vikram Joshi', position: 'Scientific Officer-C', stage: 'screening', score: 88, exp: '6 Yrs' },
            { id: 'APP-802', name: 'Neha Chawla', position: 'HR Analytics Specialist', stage: 'technical', score: 92, exp: '4 Yrs' },
            { id: 'APP-803', name: 'Tariq Anwar', position: 'Network Architect', stage: 'interview', score: 95, exp: '10 Yrs' },
            { id: 'APP-804', name: 'Debolina Roy', position: 'Junior System Analyst', stage: 'offered', score: 90, exp: '2 Yrs' }
        ],

        // Transfers & Relieving Workflow
        transfers: [
            { orderId: 'TR-2024-091', empPin: 'EMP-1003', empName: 'Rajeev Menon', currentStation: 'New Delhi HQ', targetStation: 'Assam Regional Office', effective: '2024-10-01', approved: true, signed: true },
            { orderId: 'TR-2024-092', empPin: 'EMP-1006', empName: 'Meenakshi Iyer', currentStation: 'Bengaluru Complex', targetStation: 'Pune Center', effective: '2024-11-15', approved: false, signed: false }
        ],

        // Leave Balances and Requests
        leaveRequests: [
            { reqId: 'LV-449', empPin: 'EMP-1002', name: 'Ananya Sharma', type: 'Earned Leave (EL)', start: '2024-09-02', end: '2024-09-06', days: 5, reason: 'Conference & Research Workshop', status: 'Pending' },
            { reqId: 'LV-450', empPin: 'EMP-1004', name: 'Pooja Kulkarni', type: 'Casual Leave (CL)', start: '2024-08-28', end: '2024-08-29', days: 2, reason: 'Family engagement', status: 'Approved' }
        ],

        // Grievance Cases
        grievances: [
            { ticketId: 'GRV-102', complainant: 'EMP-1006', category: 'Shift Allowance Differential', filed: '2024-08-10', officer: 'D. Goswami, Vigilance', status: 'Under Board Review' },
            { ticketId: 'GRV-098', complainant: 'EMP-1005', category: 'Deputation Grade Pay Fixation', filed: '2024-07-22', officer: 'Director (Finance)', status: 'Resolved & Disbursed' }
        ],

        // System-wide Event Log
        notifications: [
            { id: 1, type: 'SMS', to: 'ALL EMPLOYEES', text: 'Biometric daily log generated. Total punches: 962.', time: '10:45 AM' },
            { id: 2, type: 'EMAIL', to: 'finance-audit@ehrmis.internal', text: 'August salary payroll computed. Awaiting digital sign-off.', time: '09:30 AM' }
        ]
    };

    return {
        get: (key) => store[key],
        set: (key, value) => { store[key] = value; },
        addEmployee: (emp) => store.employees.unshift(emp),
        addNotification: (notif) => store.notifications.unshift(notif)
    };
})();