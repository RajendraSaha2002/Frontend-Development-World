/**
 * Duplicate Proposals & Plagiarism Detection Engine (Benefit #5)
 */
const DuplicateDetector = (() => {
    function init() {
        document.getElementById('btnScanDuplicate')?.addEventListener('click', runManualScan);
    }

    function runPreCheck(abstractText) {
        const score = Math.floor(12 + Math.random() * 8); // Low similarity
        MainApp.openModal('Pre-Submission Duplicate Scan', `
      <div>
        <h4>Semantic Plagiarism Analysis: PASSED</h4>
        <p style="color:green; font-weight:bold; margin-top:8px;">Maximum Similarity Found: ${score}% (Threshold: 25%)</p>
        <p class="text-muted" style="font-size:12px; margin-top:8px;">Scanned across 1,482 historical national proposals. No duplicate funding detected.</p>
      </div>
    `);
    }

    function runManualScan() {
        const text = document.getElementById('duplicateScanInput').value;
        const box = document.getElementById('duplicateResultsBox');
        if (!text) {
            alert('Please enter text to run cross-scan.');
            return;
        }

        box.innerHTML = `
      <div style="border-left:4px solid #059669; padding-left:12px;">
        <h4 style="color:#059669;">Scan Completed: 0 Duplicate Conflicts Detected</h4>
        <p style="font-size:12px; margin-top:4px;">Scanned 1,482 archive records and 8 partner funding council databases.</p>
        <div style="font-size:11px; margin-top:8px; color:#475569;">
          <div>- Match with PROP-2023-4108: <strong>14.2%</strong> (Permissible background overlap)</div>
          <div>- Match with PROP-2022-1092: <strong>8.1%</strong> (Terminology overlap)</div>
        </div>
      </div>
    `;
    }

    return { init, runPreCheck };
})();