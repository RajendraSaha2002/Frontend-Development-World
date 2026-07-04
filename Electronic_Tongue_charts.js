const Charts = (() => {
    function setup(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(320, rect.width * dpr);
        canvas.height = Math.max(180, canvas.height * dpr);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w: canvas.width / dpr, h: canvas.height / dpr };
    }

    function clear(ctx, w, h) {
        ctx.clearRect(0, 0, w, h);
    }

    function grid(ctx, w, h) {
        ctx.strokeStyle = "rgba(100, 116, 139, 0.22)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i += 1) {
            const y = (h - 34) * i / 5 + 8;
            ctx.beginPath();
            ctx.moveTo(34, y);
            ctx.lineTo(w - 12, y);
            ctx.stroke();
        }
    }

    function bar(canvas, values, labels, colors) {
        const { ctx, w, h } = setup(canvas);
        clear(ctx, w, h);
        grid(ctx, w, h);
        const max = Math.max(100, ...values);
        const gap = 12;
        const barW = (w - 58 - gap * (values.length - 1)) / values.length;
        values.forEach((value, index) => {
            const x = 38 + index * (barW + gap);
            const bh = (h - 58) * value / max;
            const y = h - 34 - bh;
            ctx.fillStyle = colors[index];
            ctx.fillRect(x, y, barW, bh);
            ctx.fillStyle = getTextColor();
            ctx.font = "700 11px Segoe UI";
            ctx.fillText(labels[index], x, h - 12);
            ctx.fillText(String(Math.round(value)), x, y - 6);
        });
    }

    function radar(canvas, values, labels, colors) {
        const { ctx, w, h } = setup(canvas);
        clear(ctx, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.34;
        ctx.strokeStyle = "rgba(100,116,139,0.25)";
        for (let r = 1; r <= 4; r += 1) {
            polygon(ctx, labels.length, cx, cy, radius * r / 4);
            ctx.stroke();
        }
        ctx.beginPath();
        values.forEach((value, index) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / values.length;
            const pointRadius = radius * value / 70;
            const x = cx + Math.cos(angle) * pointRadius;
            const y = cy + Math.sin(angle) * pointRadius;
            index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(15,118,110,0.25)";
        ctx.fill();
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 2;
        ctx.stroke();
        labels.forEach((label, index) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / labels.length;
            ctx.fillStyle = getTextColor();
            ctx.font = "700 11px Segoe UI";
            ctx.fillText(label.slice(0, 5), cx + Math.cos(angle) * (radius + 18) - 16, cy + Math.sin(angle) * (radius + 18));
        });
    }

    function scatter(canvas, points, active) {
        const { ctx, w, h } = setup(canvas);
        clear(ctx, w, h);
        grid(ctx, w, h);
        [...points, active].forEach((point, index) => {
            const x = 34 + point.x / 100 * (w - 52);
            const y = h - 30 - point.y / 100 * (h - 48);
            ctx.beginPath();
            ctx.arc(x, y, index === points.length ? 8 : 5, 0, Math.PI * 2);
            ctx.fillStyle = point.c;
            ctx.fill();
            if (index === points.length) {
                ctx.strokeStyle = "#111827";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
        ctx.fillStyle = getTextColor();
        ctx.font = "700 12px Segoe UI";
        ctx.fillText("PC1", w - 42, h - 8);
        ctx.fillText("PC2", 8, 16);
    }

    function polygon(ctx, sides, cx, cy, radius) {
        ctx.beginPath();
        for (let i = 0; i < sides; i += 1) {
            const angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
    }

    function getTextColor() {
        return getComputedStyle(document.querySelector(".app-shell")).getPropertyValue("--text").trim() || "#17212b";
    }

    return { bar, radar, scatter };
})();