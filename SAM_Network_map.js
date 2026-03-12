const TacticalMap = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    // Coordinate Mapper: Map 0-100km logic to screen pixels
    scaleX: 1,
    scaleY: 1,

    init() {
        this.canvas = document.getElementById('tacticalMap');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.scaleX = this.width / 100; // Map is 100km wide
        this.scaleY = this.height / 100; // Map is 100km tall
    },

    draw(data) {
        // Clear Screen
        this.ctx.fillStyle = '#000500';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Grid
        this.ctx.strokeStyle = '#003300';
        this.ctx.lineWidth = 1;
        for(let i=0; i<100; i+=10) {
            let x = i * this.scaleX;
            let y = i * this.scaleY;
            this.ctx.beginPath(); this.ctx.moveTo(x,0); this.ctx.lineTo(x,this.height); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.moveTo(0,y); this.ctx.lineTo(this.width,y); this.ctx.stroke();
        }

        // Draw Batteries
        data.batteries.forEach(bat => {
            const bx = bat.pos_x * this.scaleX;
            const by = bat.pos_y * this.scaleY;

            // Draw Range Ring
            this.ctx.strokeStyle = 'rgba(0, 50, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(bx, by, bat.radar_range_km * this.scaleX, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw Icon (Triangle)
            this.ctx.fillStyle = '#00ff41';
            this.ctx.beginPath();
            this.ctx.moveTo(bx, by - 10);
            this.ctx.lineTo(bx - 10, by + 10);
            this.ctx.lineTo(bx + 10, by + 10);
            this.ctx.fill();

            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(bat.callsign, bx + 12, by);
        });

        // Draw Threats
        data.threats.forEach(t => {
            if (t.status === 'DESTROYED') return;
            const tx = t.x * this.scaleX;
            const ty = t.y * this.scaleY;

            this.ctx.fillStyle = '#ff3333';
            this.ctx.beginPath();
            this.ctx.arc(tx, ty, 5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillText(`${t.id} [${t.alt}m]`, tx + 8, ty);
        });

        // Draw Engagement Lines (Missile Trails)
        data.engagements.forEach(eng => {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(eng.from.x * this.scaleX, eng.from.y * this.scaleY);
            this.ctx.lineTo(eng.to.x * this.scaleX, eng.to.y * this.scaleY);
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Reset
        });
    }
};