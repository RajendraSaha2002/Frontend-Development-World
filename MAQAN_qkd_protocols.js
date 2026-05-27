/**
 * QKD Protocol Animator (CoW / DPS)
 */
document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll('.proto-btn');
    const animContainer = document.getElementById('q-wave-anim');
    const streamAlice = document.getElementById('stream-alice');
    const streamBob = document.getElementById('stream-bob');
    const stepError = document.getElementById('step-error');
    const stepPrivacy = document.getElementById('step-privacy');
    const telProto = document.getElementById('telemetry-protocol');

    const cowChars = ['●', '○', '●', '—', '●', '○']; // Decoy / Data
    const dpsChars = ['↑', '↓', '↑', '↑', '↓', '↓']; // Phase shifts

    function generatePhotons(chars) {
        animContainer.innerHTML = '';
        for(let i=0; i<3; i++) {
            const el = document.createElement('div');
            el.className = 'photon-pulse';
            el.textContent = chars[Math.floor(Math.random() * chars.length)];
            el.style.animationDelay = `${i * 0.6}s`;
            animContainer.appendChild(el);
        }
    }

    // Init
    generatePhotons(cowChars);

    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const isCow = e.target.getAttribute('data-proto') === 'cow';
            telProto.textContent = isCow ? "CoW (Coherent One-Way)" : "DPS (Differential Phase Shift)";

            // Randomize bitstreams to show reset
            streamAlice.textContent = Array.from({length: 10}, () => Math.random() > 0.5 ? 1 : 0).join(' ');

            // Reset pipeline steps temporarily
            stepError.className = 'pipeline-step';
            stepPrivacy.className = 'pipeline-step';

            setTimeout(() => {
                streamBob.textContent = streamAlice.textContent;
                stepError.className = 'pipeline-step success';
                stepPrivacy.className = 'pipeline-step success';
            }, 800);

            generatePhotons(isCow ? cowChars : dpsChars);
        });
    });
});