/**
 * Logic to tie the UI actions to the visualizations and CLI outputs.
 */
document.addEventListener('DOMContentLoaded', () => {
    window.isJobRunning = false;

    const startBtn = document.getElementById('btn-start-generation');
    const termBox = document.getElementById('cli-terminal');

    function logToTerminal(msg, type="data") {
        if(!termBox) return;
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.textContent = `[${new Date().toISOString().substring(11, 19)}] ${msg}`;
        termBox.appendChild(line);
        termBox.scrollTop = termBox.scrollHeight;
    }

    if(startBtn) {
        startBtn.addEventListener('click', () => {
            if(window.isJobRunning) return;
            window.isJobRunning = true;

            const steps = document.getElementById('torsion-step').value;
            logToTerminal(`> tangorun --ligand MOL_7842_A --step ${steps} --method pm6`, "cmd");
            logToTerminal("Parsing input in tree-like fashion. Validating exocyclic bonds...");
            logToTerminal("Distributing tasks to MPI Master Node. Load balancing across 12 slave nodes...");

            // Change button state
            startBtn.textContent = "Optimization in Progress...";
            startBtn.disabled = true;
            startBtn.style.opacity = "0.5";

            // Trigger visual generation (simulate calculation delay)
            setTimeout(() => {
                const totalConformers = steps === "15" ? 2500 : (steps === "30" ? 1296 : 400);
                window.ChartEngine.generateData(totalConformers);

                logToTerminal(`Generated ${totalConformers} conformers.`);
                logToTerminal("Running MOPAC semi-empirical energy calculations...");

                // Reset button after chart finishes (approx 2s)
                setTimeout(() => {
                    logToTerminal(`Optimization Complete. Best Energy: ${window.ChartEngine.globalMetrics.bestEnergy} kcal/mol`);
                    startBtn.textContent = "Initialize MPI Generation";
                    startBtn.disabled = false;
                    startBtn.style.opacity = "1";
                }, 2200);

            }, 800);
        });
    }
});