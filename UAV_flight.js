const FlightDynamics = {
    pitch: 0,
    roll: 0,
    speed: 350,
    alt: 25000,
    keys: { w: false, a: false, s: false, d: false },

    init() {
        // Generate Pitch Ladder Lines
        const ladder = document.getElementById('pitch-ladder');
        for(let i = 90; i >= -90; i -= 10) {
            if(i === 0) continue; // Horizon line is handled by the ground div
            const rung = document.createElement('div');
            rung.className = 'ladder-rung';
            rung.setAttribute('data-deg', Math.abs(i));
            if (i < 0) rung.style.borderStyle = 'dashed'; // Negative pitch is dashed
            ladder.appendChild(rung);
        }

        window.addEventListener('keydown', (e) => this.handleKey(e.key.toLowerCase(), true));
        window.addEventListener('keyup', (e) => this.handleKey(e.key.toLowerCase(), false));
    },

    handleKey(key, state) {
        if(this.keys.hasOwnProperty(key)) this.keys[key] = state;
    },

    update() {
        // Apply physics/input adjustments
        if (this.keys.w) this.pitch -= 1.5; // Pitch down
        if (this.keys.s) this.pitch += 1.5; // Pitch up
        if (this.keys.a) this.roll -= 2;    // Roll left
        if (this.keys.d) this.roll += 2;    // Roll right

        // Auto-leveling friction
        if (!this.keys.w && !this.keys.s) this.pitch *= 0.95;
        if (!this.keys.a && !this.keys.d) this.roll *= 0.95;

        // Clamp values
        this.pitch = Math.max(-60, Math.min(60, this.pitch));
        this.roll = Math.max(-45, Math.min(45, this.roll));

        // Update UI Text
        document.getElementById('readout-spd').innerText = Math.floor(this.speed + (this.pitch * 2));
        document.getElementById('readout-alt').innerText = Math.floor(this.alt + (this.pitch * 10));

        // APPLY CSS 3D TRANSFORM TO WORLD
        // RotateZ handles the Roll, RotateX handles the 3D Pitch
        const world = document.getElementById('world');
        world.style.transform = `rotateZ(${this.roll}deg) rotateX(${this.pitch}deg)`;
    }
};