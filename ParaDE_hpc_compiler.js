/**
 * HPC Compilation & Slurm/Torque LRM Simulation
 */
window.HPCCompiler = {
    term: document.getElementById('panel-terminal'),
    comp: document.getElementById('panel-compiler'),
    jobBody: document.getElementById('job-queue-body'),
    jobIdCounter: 14590,

    init() {
        // Compile Action
        document.getElementById('btn-compile').addEventListener('click', () => {
            this.switchToTab('compiler');
            this.logToCompiler("> make all", "sys");
            this.logToCompiler("mpicc -O3 -march=native -fopenmp -o main main.c");

            setTimeout(() => {
                this.logToCompiler("Build successful. 0 warnings, 0 errors.", "succ");
            }, 800);
        });

        // Modal Logic for Job Submission
        const modal = document.getElementById('job-modal');
        document.getElementById('btn-submit-job').addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
        document.getElementById('btn-cancel-job').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Job Submission (Slurm)
        document.getElementById('btn-confirm-job').addEventListener('click', () => {
            modal.classList.add('hidden');
            const nodes = document.getElementById('job-nodes').value;
            const tasks = document.getElementById('job-tasks').value;
            this.submitJob(nodes, tasks);
        });
    },

    switchToTab(panelName) {
        document.querySelector(`.panel-tab[data-panel="${panelName}"]`).click();
    },

    logToTerminal(msg, type="") {
        const div = document.createElement('div');
        div.className = `term-line ${type}`;
        div.textContent = msg;
        this.term.appendChild(div);
        this.term.scrollTop = this.term.scrollHeight;
    },

    logToCompiler(msg, type="") {
        const div = document.createElement('div');
        div.className = `term-line ${type}`;
        div.textContent = msg;
        this.comp.appendChild(div);
        this.comp.scrollTop = this.comp.scrollHeight;
    },

    submitJob(nodes, tasks) {
        this.switchToTab('terminal');
        const jobId = this.jobIdCounter++;

        this.logToTerminal(`> sbatch --nodes=${nodes} --ntasks-per-node=${tasks} job_script.sh`, "sys");
        this.logToTerminal(`Submitted batch job ${jobId}`, "succ");

        this.addJobToQueue(jobId, nodes, tasks);
    },

    addJobToQueue(id, nodes, tasks) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${id}</td>
            <td>parade_hybrid</td>
            <td>${nodes}</td>
            <td>${tasks * nodes}</td>
            <td><span class="job-status status-pending">PENDING</span></td>
            <td>00:00:00</td>
        `;
        this.jobBody.prepend(tr);

        // Simulate Job State Changes
        setTimeout(() => {
            tr.querySelector('.job-status').className = 'job-status status-running';
            tr.querySelector('.job-status').textContent = 'RUNNING';
            tr.cells[5].textContent = '00:00:01';

            // Generate output and profiling data
            window.ProfilerTools.generateAnalytics(nodes, tasks);
        }, 2000);

        setTimeout(() => {
            tr.querySelector('.job-status').className = 'job-status status-completed';
            tr.querySelector('.job-status').textContent = 'COMPLETED';
            tr.cells[5].textContent = '00:00:04';

            this.switchToTab('terminal');
            this.logToTerminal(`Job ${id} completed. Output written to slurm-${id}.out`, "sys");
            this.logToTerminal("Hello from thread 0\nHello from thread 1\n...", "");
        }, 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => window.HPCCompiler.init());