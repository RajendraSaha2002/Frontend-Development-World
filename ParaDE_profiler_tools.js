/**
 * Simulates Output for HPC Profilers (e.g., gprof, nvprof)
 */
window.ProfilerTools = {
    container: document.getElementById('profiler-stats'),

    generateAnalytics(nodes, tasks) {
        const totalCores = nodes * tasks;
        const efficiency = (Math.random() * 15 + 80).toFixed(1); // 80-95%

        this.container.style.textAlign = 'left';
        this.container.innerHTML = `
            <h3 style="color: var(--brand-accent); margin-bottom: 15px;">Execution Analytics</h3>
            <p><strong>Total Ranks/Threads:</strong> ${totalCores}</p>
            <p><strong>MPI Communication Time:</strong> 12.4%</p>
            <p><strong>Computation Time:</strong> 86.1%</p>
            <p><strong>I/O Wait Time:</strong> 1.5%</p>
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 15px 0;">
            <p><strong>Parallel Efficiency:</strong> <span style="color: var(--run-green);">${efficiency}%</span></p>
            <p><strong>Hotspot:</strong> <code>vecAdd()</code> in <em>kernel.cu</em> (42% of execution time)</p>
            <br>
            <button class="btn btn-compile">Download Full Trace (.csv)</button>
        `;
    }
};