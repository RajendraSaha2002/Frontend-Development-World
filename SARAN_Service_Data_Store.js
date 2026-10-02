/**
 * 01-data-store.js
 * In-memory enterprise repository for SARAN NextGen Service Desk.
 * Manages Multi-Tenant partitions, ITSM Profiles, Tickets, SLAs, and Logs.
 */
const SaranStore = (function () {
    'use strict';

    // State Partition by Tenant
    const state = {
        currentTenant: 'tenant_apex_global',
        tenants: {
            tenant_apex_global: { name: 'Apex Global Enterprise (Primary)', code: 'AGE' },
            tenant_fintech: { name: 'FinTech Prime Core Corp', code: 'FTP' },
            tenant_health_care: { name: 'BioCare Health Systems', code: 'BCH' }
        },
        profiles: {
            incident: {
                id: 'incident',
                name: 'Incident Management Profile',
                badgeColor: 'red',
                checklists: [
                    'Verify user identity & asset tag',
                    'Check system event log telemetry',
                    'Validate SLA priority parameters',
                    'Execute disaster recovery / rollback test'
                ],
                customFields: [
                    { name: 'impacted_ci', label: 'Impacted Configuration Item (CI)', type: 'text' },
                    { name: 'business_interruption', label: 'Service Interruption Occurred', type: 'checkbox' }
                ]
            },
            change: {
                id: 'change',
                name: 'Change Governance Profile',
                badgeColor: 'amber',
                checklists: [
                    'CAB Risk Assessment completed',
                    'Peer code review sign-off',
                    'Scheduled maintenance window approved',
                    'Back-out plan verified'
                ],
                customFields: [
                    { name: 'change_window', label: 'Implementation Window', type: 'text' },
                    { name: 'rollback_plan_ref', label: 'Rollback Documentation Link', type: 'text' }
                ]
            },
            service_request: {
                id: 'service_request',
                name: 'Service Request Profile',
                badgeColor: 'green',
                checklists: [
                    'Manager approval verified',
                    'Software license quota checked',
                    'Provisioning credentials assigned'
                ],
                customFields: [
                    { name: 'cost_center', label: 'Billing Cost Center', type: 'text' }
                ]
            }
        },
        tickets: [
            {
                id: 'TKT-8801',
                tenant: 'tenant_apex_global',
                profile: 'incident',
                title: 'Core Database Connection Pool Saturation',
                requester: 'db-monitor@apex.org',
                priority: 'Critical',
                status: 'Work in Progress',
                assignedGroup: 'Database Engineering Core',
                createdTime: Date.now() - 3600000,
                slaRemainingSeconds: 2400, // 40 mins
                slaTotalSeconds: 7200,
                source: 'Automated Event API',
                description: 'Connection pool exhausted on DB Cluster Node-02. Queries queueing rapidly.',
                checklistState: [true, true, false, false],
                auditTrail: ['Ticket auto-created by API Alert', 'Assigned to Database Engineering Core']
            },
            {
                id: 'TKT-8802',
                tenant: 'tenant_apex_global',
                profile: 'change',
                title: 'Edge API Gateway TLS 1.3 Cipher Upgrade',
                requester: 'sarah.jenkins@apex.org',
                priority: 'High',
                status: 'Pending User/CAB',
                assignedGroup: 'Change Advisory Board (CAB)',
                createdTime: Date.now() - 86400000,
                slaRemainingSeconds: 43200,
                slaTotalSeconds: 86400,
                source: 'Web Portal',
                description: 'Upgrade deprecated cipher suites across the perimeter load balancers.',
                checklistState: [true, true, false, false],
                auditTrail: ['CAB Review session opened']
            },
            {
                id: 'TKT-8803',
                tenant: 'tenant_apex_global',
                profile: 'service_request',
                title: 'Developer Sandbox Provisioning - Kubernetes',
                requester: 'alex.t@apex.org',
                priority: 'Medium',
                status: 'Open',
                assignedGroup: 'Cloud SecOps Squad',
                createdTime: Date.now() - 14400000,
                slaRemainingSeconds: 18000,
                slaTotalSeconds: 28800,
                source: 'Email Ingestion',
                description: 'Request for namespace isolation and 32GB memory resource quota.',
                checklistState: [false, false, false],
                auditTrail: ['Created via support-inbox@apex.org']
            },
            {
                id: 'TKT-8804',
                tenant: 'tenant_apex_global',
                profile: 'incident',
                title: 'VoIP Softphone Inbound Gateway Latency',
                requester: 'callcenter-sup@apex.org',
                priority: 'Low',
                status: 'Resolved',
                assignedGroup: 'Network Infrastructure Team',
                createdTime: Date.now() - 180000000,
                slaRemainingSeconds: 0,
                slaTotalSeconds: 86400,
                source: 'SMS Webhook',
                description: 'Jitter observed during regional voice routing.',
                checklistState: [true, true, true, true],
                auditTrail: ['Ticket marked as Resolved by Network team']
            }
        ],
        auditLogs: [
            {
                timestamp: new Date().toISOString(),
                category: 'Authentication',
                user: 'sarah.jenkins',
                ip: '192.168.1.104',
                severity: 'INFO',
                message: 'Federated LDAP Token issued successfully',
                hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            },
            {
                timestamp: new Date(Date.now() - 600000).toISOString(),
                category: 'Workflow Automation',
                user: 'SYSTEM_DAEMON',
                ip: '127.0.0.1',
                severity: 'INFO',
                message: 'SLA Calculation evaluated for 4 active work items',
                hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
            }
        ]
    };

    return {
        getState: () => state,
        getCurrentTenant: () => state.currentTenant,
        setTenant: (tenantId) => {
            if (state.tenants[tenantId]) {
                state.currentTenant = tenantId;
            }
        },
        getTickets: () => state.tickets.filter(t => t.tenant === state.currentTenant),
        addTicket: (ticket) => {
            ticket.tenant = state.currentTenant;
            ticket.id = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
            ticket.createdTime = Date.now();
            ticket.auditTrail = [
                `Created on ${new Date().toLocaleTimeString()} by ${ticket.requester}`
            ];
            state.tickets.unshift(ticket);
            return ticket;
        },
        updateTicket: (ticketId, updateFields) => {
            const idx = state.tickets.findIndex(t => t.id === ticketId);
            if (idx !== -1) {
                state.tickets[idx] = { ...state.tickets[idx], ...updateFields };
                return state.tickets[idx];
            }
            return null;
        },
        addAuditLog: (entry) => {
            entry.timestamp = new Date().toISOString();
            entry.hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            state.auditLogs.unshift(entry);
        },
        getAuditLogs: () => state.auditLogs
    };
})();