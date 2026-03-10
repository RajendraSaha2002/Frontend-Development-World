const Targeting = {
    targets: [],
    lockThreshold: 150, // pixels

    init() {
        const zone = document.getElementById('target-zone');
        // Create a few random targets
        for(let i=0; i<3; i++) {
            const trgt = document.createElement('div');
            trgt.className = 'bogie';
            zone.appendChild(trgt);

            this.targets.push({
                el: trgt,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4
            });
        }
    },

    update() {
        const reticle = document.getElementById('reticle');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        let lockedTarget = null;
        let minDistance = this.lockThreshold;

        this.targets.forEach(t => {
            // Move targets
            t.x += t.vx;
            t.y += t.vy;

            // Bounce off walls
            if(t.x < 0 || t.x > window.innerWidth) t.vx *= -1;
            if(t.y < 0 || t.y > window.innerHeight) t.vy *= -1;

            // Apply position
            t.el.style.left = `${t.x}px`;
            t.el.style.top = `${t.y}px`;

            // Calculate Euclidean Distance to center crosshair
            const dist = Math.hypot(t.x - centerX, t.y - centerY);

            if (dist < minDistance) {
                minDistance = dist;
                lockedTarget = t;
            }
        });

        // Reticle Snapping Logic
        if (lockedTarget) {
            reticle.classList.add('locked');
            reticle.style.left = `${lockedTarget.x}px`;
            reticle.style.top = `${lockedTarget.y}px`;
        } else {
            reticle.classList.remove('locked');
            reticle.style.left = `50%`;
            reticle.style.top = `50%`;
        }
    }
};