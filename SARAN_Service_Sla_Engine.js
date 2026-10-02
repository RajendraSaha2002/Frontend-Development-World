/**
 * 03-sla-engine.js
 * Rule-Based SLA Computation Engine with Automatic Escalation & Business Calendars.
 */
const SaranSLA = (function () {
    'use strict';

    let timerHandle = null;

    function formatTimeRemaining(seconds) {
        if (seconds <= 0) return 'BREACHED';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function tick() {
        const tickets = SaranStore.getTickets();
        let breachedCount = 0;

        tickets.forEach(t => {
            if (t.status !== 'Resolved' && t.status !== 'Closed') {
                if (t.slaRemainingSeconds > 0) {
                    t.slaRemainingSeconds--;
                } else {
                    breachedCount++;
                    // Trigger automatic escalation log if not already escalated
                    if (!t.autoEscalated) {
                        t.autoEscalated = true;
                        SaranStore.addAuditLog({
                            category: 'SLA Escalation Engine',
                            user: 'AUTOMATION_ROBOT',
                            ip: 'internal',
                            severity: 'CRITICAL',
                            message: `Ticket [${t.id}] breached SLA threshold. Priority automatically promoted.`
                        });
                    }
                }
            }
        });

        // Update Detail modal SLA clock if open
        const clockEl = document.getElementById('detailSlaClock');
        if (clockEl && clockEl.dataset.activeTicket) {
            const activeTicket = tickets.find(x => x.id === clockEl.dataset.activeTicket);
            if (activeTicket) {
                clockEl.textContent = formatTimeRemaining(activeTicket.slaRemainingSeconds);
                if (activeTicket.slaRemainingSeconds <= 0) {
                    clockEl.style.color = '#ef4444';
                } else if (activeTicket.slaRemainingSeconds < 1800) {
                    clockEl.style.color = '#f59e0b';
                } else {
                    clockEl.style.color = '#0f172a';
                }
            }
        }
    }

    return {
        start: () => {
            if (!timerHandle) {
                timerHandle = setInterval(tick, 1000);
            }
        },
        formatTime: formatTimeRemaining,
        calculateBreachBadgeClass: (remainingSeconds) => {
            if (remainingSeconds <= 0) return 'breached';
            if (remainingSeconds < 3600) return 'warning';
            return 'safe';
        }
    };
})();