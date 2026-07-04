class DOMController {
    constructor() {
        this.statusText = document.getElementById('system-status');
        this.pulse = document.querySelector('.pulse');
    }

    updateStatus(message, isProcessing = false) {
        this.statusText.textContent = message;
        if (isProcessing) {
            this.pulse.classList.add('active');
        } else {
            this.pulse.classList.remove('active');
        }
    }

    getSelectedServices() {
        return {
            stt: document.getElementById('svc-stt').checked,
            gid: document.getElementById('svc-gid').checked,
            kws: document.getElementById('svc-kws').checked,
            slid: document.getElementById('svc-slid').checked,
            sid: document.getElementById('svc-sid').checked,
            sd: document.getElementById('svc-sd').checked
        };
    }

    renderResults(data) {
        // Speaker Identification and Verification[cite: 2]
        if (data.speakerId) document.getElementById('out-speaker').textContent = data.speakerId;
        if (data.gender) document.getElementById('out-gender').textContent = data.gender;
        if (data.language) document.getElementById('out-language').textContent = data.language;

        // ASR Rendering
        if (data.asr) {
            const asrBox = document.getElementById('out-asr');
            asrBox.innerHTML = `<p>${data.asr}</p>`;
        }

        // Keyword Spotting Table Rendering[cite: 2]
        if (data.keywords) {
            const tbody = document.getElementById('out-kws');
            tbody.innerHTML = '';
            if (data.keywords.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No matches found.</td></tr>';
            } else {
                data.keywords.forEach(kw => {
                    tbody.innerHTML += `
                        <tr>
                            <td style="color: var(--accent-gold); font-weight: bold;">${kw.word}</td>
                            <td>${kw.start}</td>
                            <td>${kw.end}</td>
                            <td style="font-family: monospace;">${kw.context}</td>
                        </tr>
                    `;
                });
            }
        }

        // Speaker Diarization Timeline Rendering[cite: 2]
        if (data.diarization) {
            document.getElementById('out-speaker-count').textContent = `Count: ${data.diarization.count}`;
            const tlContainer = document.getElementById('out-sd');
            tlContainer.innerHTML = '';
            data.diarization.timeline.forEach(seg => {
                tlContainer.innerHTML += `<div class="segment ${seg.class}" style="width: ${seg.percentage}%" title="${seg.speaker}"></div>`;
            });
        }
    }
}