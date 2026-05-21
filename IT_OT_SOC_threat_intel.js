/**
 * Threat Intelligence & MITRE Incident Playbook Execution System
 * Guides automation matrices through containment pathways.
 */
class ThreatIntelEngine {
    constructor() {
        this.stackContainer = document.getElementById('mitre-incident-stack');
        this.playbookConsole = document.getElementById('playbook-console-output');
        this.remediateBtn = document.getElementById('execute-remediation-playbook');
        this.activeIncidentNode = null;
        this.bindPlaybookTriggers();
    }

    registerMitreVector(techniqueId, description) {
        if (!this.stackContainer) return;
        this.stackContainer.innerHTML = ""; // Flush unhandled parameters placeholder

        const node = document.createElement('div');
        node.className = "mitre-incident-node unhandled";
        node.innerHTML = `
            <h4>${techniqueId}</h4>
            <p>${description}</p>
            <small style="color:var(--crimson-alarm); font-weight:bold; font-family:var(--font-scada-mono)">Action Required: MITRE ICS Playbook Ready</small>
        `;

        node.addEventListener('click', () => {
            this.activeIncidentNode = node;
            this.displayPlaybookStaging(techniqueId);
        });

        this.stackContainer.prepend(node);
    }

    displayPlaybookStaging(techId) {
        if (!this.playbookConsole) return;
        this.playbookConsole.innerHTML = `
[SIEM AUTOMATION ALERT CORE]
MAPPED REMEDIATION PLAYBOOK FOR TECHNIQUE: ${techId}
----------------------------------------------------------------------
[STAGE 1] Isolate SCADA Master Terminal session trace footprint... [READY]
[STAGE 2] Revoke industrial application network session routes between level 2 and level 1... [READY]
[STAGE 3] Revert Modbus register 0x0064 memory address parameter to safety baseline index... [READY]

>> Awaiting Operator Command Authorization to execute system-wide mitigation...
        `;
    }

    bindPlaybookTriggers() {
        if (!this.remediateBtn) return;
        this.remediateBtn.addEventListener('click', () => {
            if (!this.activeIncidentNode) {
                alert("No active unhandled security anomalies selected inside the MITRE execution stack.");
                return;
            }

            this.playbookConsole.innerHTML += `
\n\n[EXECUTING COMMAND PROTOCOLS...]
>> Deploying SPAN filter adjustments... [SUCCESS]
>> Severing unauthorized access tunnels dynamically... [SUCCESS]
>> Modbus Coils restored to nominal configuration vectors.
>> Threat eradicated. Incident state marked as RESOLVED.
            `;

            this.activeIncidentNode.className = "mitre-incident-node";
            this.activeIncidentNode.querySelector('small').style.color = "var(--emerald-safe)";
            this.activeIncidentNode.querySelector('small').textContent = "Status: Mitigated Core Baseline Verified";

            window.MasterSOCController.incrementAnomalyCounter(-1);
            this.activeIncidentNode = null;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ThreatIntelEngineInstance = new ThreatIntelEngine();
});