// Simulates state-of-the-art AI/ML video processing algorithms
class AIEngine {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }

    updateBadge(camId, state, type) {
        const badge = document.getElementById(`${camId}-badge`);
        const box = document.getElementById(`${camId}-box`);

        // Reset classes
        badge.className = 'ai-badge';
        box.className = 'bounding-box';

        // Apply new state
        badge.classList.add(state.toLowerCase());
        badge.innerText = state;

        if (state !== 'CLEAR' && state !== 'NORMAL') {
            box.classList.remove('hidden');
            box.classList.add(`box-${state.toLowerCase()}`);
            this._randomizeBox(box);

            // Dispatch SMS/Email alert
            this.dispatcher.dispatch(type, camId, state);
        } else {
            box.classList.add('hidden');
        }
    }

    _randomizeBox(box) {
        // Simulate ML object localization
        const top = Math.floor(Math.random() * 40) + 10;
        const left = Math.floor(Math.random() * 40) + 10;
        const width = Math.floor(Math.random() * 30) + 20;
        const height = Math.floor(Math.random() * 30) + 20;

        box.style.top = `${top}%`;
        box.style.left = `${left}%`;
        box.style.width = `${width}%`;
        box.style.height = `${height}%`;
    }

    simulateFireSmokeRoutine() {
        // Cam 1: Toggles CLEAR -> FIRE
        setInterval(() => {
            const isFire = Math.random() > 0.6;
            this.updateBadge('cam1', isFire ? 'FIRE' : 'CLEAR', 'Fire/Smoke AI');
        }, SystemConfig.aiThresholds.fireSmokeInterval);

        // Cam 2: Toggles CLEAR -> smoke
        setInterval(() => {
            const isSmoke = Math.random() > 0.5;
            this.updateBadge('cam2', isSmoke ? 'smoke' : 'CLEAR', 'Fire/Smoke AI');
        }, SystemConfig.aiThresholds.fireSmokeInterval + 2000);
    }

    simulateCrowdRoutine() {
        // Cam 3: Stays NORMAL mostly (Shopping Mall baseline)
        setInterval(() => {
            const isAbnormal = Math.random() > 0.8;
            this.updateBadge('cam3', isAbnormal ? 'ABNORMAL' : 'NORMAL', 'Crowd AI');
        }, SystemConfig.aiThresholds.crowdInterval);

        // Cam 4: Toggles NORMAL -> ABNORMAL (Railway station fluctuations)
        setInterval(() => {
            const isAbnormal = Math.random() > 0.4;
            this.updateBadge('cam4', isAbnormal ? 'ABNORMAL' : 'NORMAL', 'Crowd AI');
        }, SystemConfig.aiThresholds.crowdInterval - 3000);
    }
}