/**
 * HPC Terminal Logger
 * Generates automated logs simulating an HPC backend connection.
 */
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('hpc-console');

    const sysLogs = [
        "Syncing clock drift across distributed nodes...",
        "Solving Lindblad Master Equation for noisy channel...",
        "Executing tensor network contraction...",
        "Purification protocol subroutine completed. Delta: +0.02 Fidelity."
    ];

    setInterval(() => {
        if(terminal.offsetParent !== null && window.isSimulating) {
            const time = new Date().toISOString().substring(11, 23);
            const msg = sysLogs[Math.floor(Math.random() * sysLogs.length)];

            const div = document.createElement('div');
            div.className = 't-line info';
            div.innerHTML = `<span style="color:#94a3b8">[${time}]</span> ${msg}`;

            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;

            if(terminal.children.length > 50) {
                terminal.removeChild(terminal.children[0]);
            }
        }
    }, 2500);
});