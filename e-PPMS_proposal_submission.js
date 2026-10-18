/**
 * Paperless Proposal Submission Module
 */
const ProposalSubmission = (() => {
    function init() {
        const form = document.getElementById('proposalSubmissionForm');
        form?.addEventListener('submit', handleSubmission);

        document.getElementById('btnRunPreCheck')?.addEventListener('click', () => {
            const abstract = document.getElementById('pAbstract').value;
            if (!abstract) {
                alert('Please fill out the abstract first to run duplicate analysis.');
                return;
            }
            DuplicateDetector.runPreCheck(abstract);
        });
    }

    function handleSubmission(e) {
        e.preventDefault();

        const title = document.getElementById('pTitle').value;
        const domain = document.getElementById('pDomain').value;
        const pi = document.getElementById('pPIName').value;
        const inst = document.getElementById('pInstitute').value;
        const budget = parseFloat(document.getElementById('pBudget').value);
        const abstract = document.getElementById('pAbstract').value;

        const newId = `PROP-2024-${Math.floor(1000 + Math.random() * 9000)}`;

        const newProposal = {
            id: newId,
            title: title,
            pi: pi,
            institute: inst,
            domain: domain,
            budget: budget,
            stage: 2, // Moves to Preliminary Scrutiny
            scrutiny: 'Pending Scrutiny',
            reviewScore: null,
            tecDecision: 'Under Review',
            sanctioned: false,
            sanctionOrder: null,
            abstract: abstract
        };

        AppState.addProposal(newProposal);
        MainApp.triggerToast(`Proposal ${newId} transmitted successfully! Entering Stage 2.`);
        AppState.addNotification({
            id: Date.now(),
            type: 'DISPATCH',
            text: `Proposal ${newId} registered under ${domain}. Awaiting Preliminary Scrutiny.`,
            time: 'Just Now'
        });

        e.target.reset();
        MainApp.navigate('scrutiny');
    }

    return { init };
})();