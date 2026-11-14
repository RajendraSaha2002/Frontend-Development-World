let activeEventSource = null;
let currentPipelineId = null;

const dagSvg = document.getElementById('dag-svg');
const terminalView = document.getElementById('terminal-view');
const activeJobName = document.getElementById('active-job-name');

document.getElementById('btn-trigger').addEventListener('click', triggerWorkflow);

async function triggerWorkflow() {
    const payload = {
        name: "data-processing-dag",
        idempotency_key: "run-" + Date.now(),
        jobs: [
            { name: "extract-data", command: "bash", args: ["-c", "echo '[1/4] Extracting raw datasets...'; sleep 2; echo 'Extracted 4500 rows.'"], priority: 200 },
            { name: "clean-data", command: "bash", args: ["-c", "echo '[2/4] Cleaning nulls and invalid types...'; sleep 2; echo 'Sanitized dataset.'"], priority: 150 },
            { name: "generate-ml-vectors", command: "bash", args: ["-c", "echo '[3/4] Vectorizing tensors...'; sleep 3; echo 'Matrix computed.'"], priority: 100 },
            { name: "publish-reports", command: "bash", args: ["-c", "echo '[4/4] Uploading artifacts to store...'; sleep 1; echo 'Complete.'"], priority: 50 }
        ],
        dependencies: [
            { parent: "extract-data", child: "clean-data" },
            { parent: "clean-data", child: "generate-ml-vectors" },
            { parent: "generate-ml-vectors", child: "publish-reports" }
        ]
    };

    const res = await fetch('/api/v1/pipelines', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer orch_secret_token_123'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    currentPipelineId = data.pipeline_id;
    startGraphPoller();
}

function startGraphPoller() {
    setInterval(async () => {
        if (!currentPipelineId) return;
        const res = await fetch(`/api/v1/pipelines/${currentPipelineId}`);
        const jobs = await res.json();
        renderDAG(jobs);
    }, 1000);
}

function renderDAG(jobs) {
    dagSvg.innerHTML = '';
    const nodeWidth = 160;
    const nodeHeight = 44;
    const spacingY = 90;
    const startX = 140;

    jobs.forEach((job, index) => {
        const y = 40 + (index * spacingY);
        const x = startX;

        // Draw Edge to next element
        if (index < jobs.length - 1) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x + nodeWidth / 2);
            line.setAttribute('y1', y + nodeHeight);
            line.setAttribute('x2', x + nodeWidth / 2);
            line.setAttribute('y2', y + spacingY);
            line.setAttribute('class', 'dag-edge');
            dagSvg.appendChild(line);
        }

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'dag-node');
        g.setAttribute('style', `--status-color: var(--color-${job.status.toLowerCase()})`);
        g.onclick = () => attachLogStream(job.id, job.name);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', nodeWidth);
        rect.setAttribute('height', nodeHeight);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 12);
        text.setAttribute('y', y + 26);
        text.textContent = job.name;

        g.appendChild(rect);
        g.appendChild(text);
        dagSvg.appendChild(g);
    });
}

function attachLogStream(jobId, jobName) {
    activeJobName.textContent = jobName;
    terminalView.innerHTML = '';

    if (activeEventSource) {
        activeEventSource.close();
    }

    activeEventSource = new EventSource(`/api/v1/jobs/${jobId}/logs/stream`);
    activeEventSource.onmessage = (event) => {
        const log = JSON.parse(event.data);
        const div = document.createElement('div');
        div.className = 'log-entry';

        const stream = document.createElement('span');
        stream.className = `log-stream ${log.stream || 'SYSTEM'}`;
        stream.textContent = `[${log.stream || 'SYS'}]`;

        const chunk = document.createElement('span');
        chunk.textContent = log.chunk || log.system;

        div.appendChild(stream);
        div.appendChild(chunk);
        terminalView.appendChild(div);
        terminalView.scrollTop = terminalView.scrollHeight;
    };
}