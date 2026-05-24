/**
 * DNS Forensic Tools Logic
 * Handles interactive tool selection and simulated API processing.
 */
document.addEventListener('DOMContentLoaded', () => {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const toolTitle = document.getElementById('active-tool-title');
    const executeBtn = document.getElementById('execute-tool-btn');
    const resultsPanel = document.getElementById('tool-results-panel');
    const inputField = document.getElementById('tool-input');

    let currentTool = 'malicious';

    // Tool Switcher
    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toolBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            currentTool = e.target.getAttribute('data-tool');
            toolTitle.textContent = e.target.textContent;

            inputField.value = '';
            resultsPanel.innerHTML = 'Awaiting input for analysis...';
            resultsPanel.style.color = "var(--text-muted)";
        });
    });

    // Tool Execution
    executeBtn.addEventListener('click', () => {
        const query = inputField.value.trim();
        if(!query) {
            resultsPanel.innerHTML = "[ERROR] Domain input required.";
            resultsPanel.style.color = "var(--alert-red)";
            return;
        }

        resultsPanel.innerHTML = "Processing query through Sentinel Grid CoE Database...\n";
        resultsPanel.style.color = "var(--text-muted)";

        setTimeout(() => {
            let output = "";
            resultsPanel.style.color = "var(--accent-cyan)";

            switch(currentTool) {
                case 'malicious':
                    output = `[ANALYSIS COMPLETE] Target: ${query}\n`;
                    output += `Status: FLAGGED as Malicious\n`;
                    output += `Category: Phishing / Credential Harvesting\n`;
                    output += `Recommendation: DROP at edge resolver.`;
                    break;
                case 'punycode':
                    output = `[PUNYCODE CONVERSION] Target: ${query}\n`;
                    output += `Unicode: ${query.replace('xn--', 'α')}\n`;
                    output += `Note: Potential homograph attack detected.`;
                    break;
                case 'typosquatting':
                    output = `[TYPOSQUATTING CHECK] Target: ${query}\n`;
                    output += `Distance Matrix generated. Variations found in wild:\n`;
                    output += `- ${query.replace('e', '3')} (Registered)\n`;
                    output += `- ${query.replace('i', 'l')} (Parked, High Risk)`;
                    break;
                case 'health':
                    output = `[HEALTH ANALYZER] Target: ${query}\n`;
                    output += `DNSSEC: Disabled (Warning)\n`;
                    output += `SPF Record: Valid\n`;
                    output += `DMARC: p=reject (Strict)\n`;
                    output += `Overall Health Score: 78/100`;
                    break;
            }
            resultsPanel.innerHTML = output;
        }, 800); // Simulate network delay
    });
});