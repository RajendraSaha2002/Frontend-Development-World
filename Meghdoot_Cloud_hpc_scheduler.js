/**
 * Populates the HPC Scheduler table and generates dynamic VDI nodes.
 */
document.addEventListener('DOMContentLoaded', () => {
    // HPC Job Scheduler Data
    const hpcBody = document.getElementById('hpc-queue-body');
    const jobs = [
        { id: "SIM-9921", type: "Computational Fluid Dynamics", nodes: 16, cores: 1024, time: "04:12:00", status: "RUNNING", prog: 68 },
        { id: "SIM-9922", type: "Molecular Dynamics", nodes: 8, cores: 512, time: "01:45:30", status: "RUNNING", prog: 34 },
        { id: "SIM-9923", type: "Weather Model Prediction", nodes: 32, cores: 2048, time: "--:--:--", status: "QUEUED", prog: 0 },
        { id: "SIM-9924", type: "Finite Element Analysis", nodes: 4, cores: 256, time: "12:00:05", status: "COMPLETED", prog: 100 }
    ];

    if(hpcBody) {
        jobs.forEach(job => {
            const tr = document.createElement('tr');
            let badgeClass = 'blue';
            if(job.status === 'QUEUED') badgeClass = 'purple';
            if(job.status === 'COMPLETED') badgeClass = 'green';

            tr.innerHTML = `
                <td style="color:var(--accent-cyan)">${job.id}</td>
                <td>${job.type}</td>
                <td>${job.nodes}</td>
                <td>${job.cores}</td>
                <td style="font-family: var(--font-mono)">${job.time}</td>
                <td><span class="badge ${badgeClass}">${job.status}</span></td>
                <td>
                    <div class="progress-bar-bg">
                        <div class="progress-fill" style="width: ${job.prog}%"></div>
                    </div>
                </td>
            `;
            hpcBody.appendChild(tr);
        });
    }

    // VDI Provisioning Data
    const vdiContainer = document.getElementById('vdi-container');
    if(vdiContainer) {
        for(let i=1; i<=16; i++) {
            const isActive = Math.random() > 0.3;
            const os = Math.random() > 0.5 ? "Win11_Corp_Image" : "Ubuntu_22.04_Dev";

            const node = document.createElement('div');
            node.className = 'vdi-node';
            node.innerHTML = `
                <div class="vdi-header">
                    <span class="vdi-id">VDI-NODE-${String(i).padStart(3, '0')}</span>
                    <span class="vdi-status ${isActive ? 'active' : 'idle'}"></span>
                </div>
                <div class="vdi-user">${isActive ? 'User_ID: ADM_'+Math.floor(Math.random()*9999) : 'Unassigned Pool'}</div>
                <div class="vdi-os">IMG: ${os}</div>
            `;
            vdiContainer.appendChild(node);
        }
    }
});