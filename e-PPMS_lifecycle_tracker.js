/**
 * 8-Stage Information Flow & Life-Cycle State Machine
 */
const LifecycleTracker = (() => {
    const stepMetadata = {
        1: { name: 'Proposal Submission', desc: 'Online digital dossier ingestion, PI credentials verification, institutional endorsement upload, and IPR declarations.' },
        2: { name: 'Preliminary Scrutiny', desc: 'Secretariat review of administrative eligibility, financial ceiling bounds, and automated duplicate/plagiarism comparison.' },
        3: { name: 'Peer Review Evaluation', desc: 'Blind technical evaluation by national/international subject matter experts using calibrated multi-attribute score matrices.' },
        4: { name: 'Technical Evaluation Committee (TEC)', desc: 'Apex committee oral defense, budget rationalization, and formal sanction recommendation.' },
        5: { name: 'Administrative & Financial Approval', desc: 'Competent Authority concurrence, regulatory clearances (ethical/biosafety), and fund ceiling reservation.' },
        6: { name: 'Financial Sanction & Release', desc: 'Issue of formal Sanction Order, tranche schedule setup, and direct electronic treasury disbursal.' },
        7: { name: 'Project Monitoring', desc: 'Periodic submission of Annual Progress Reports (APR), Statement of Expenditure (SE), and Utilization Certificates (UC).' },
        8: { name: 'Project Closure', desc: 'Final Technical Report (FTR) evaluation, patent audit, asset transfer to host institute, and formal completion certification.' }
    };

    function selectStep(stepNum) {
        const titleEl = document.getElementById('activeStepTitle');
        const descEl = document.getElementById('activeStepBody');
        const steps = document.querySelectorAll('.stepper-step');

        steps.forEach((s, idx) => {
            s.classList.remove('active');
            if (idx + 1 === stepNum) s.classList.add('active');
        });

        const info = stepMetadata[stepNum];
        if (titleEl && info) {
            titleEl.textContent = `Stage ${stepNum}: ${info.name}`;
            descEl.innerHTML = `
        <p style="font-size:13px; line-height:1.6; color:#334155;">${info.desc}</p>
        <div style="margin-top:16px; display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="LifecycleTracker.advanceStage(${stepNum})">Validate & Progress to Stage ${stepNum < 8 ? stepNum + 1 : 8}</button>
          <button class="btn btn-secondary" onclick="MainApp.openAuditModal(${stepNum})">View Regulatory Audit Trail</button>
        </div>
      `;
        }
    }

    function advanceStage(currentStep) {
        if (currentStep >= 8) {
            MainApp.triggerToast('Project is already at final stage: Project Closure.');
            return;
        }
        selectStep(currentStep + 1);
        MainApp.triggerToast(`Lifecycle progressed to Stage ${currentStep + 1}. Notifications dispatched.`);
    }

    return { selectStep, advanceStage };
})();