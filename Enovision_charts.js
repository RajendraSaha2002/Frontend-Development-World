window.ChartTools = (() => {
    function clear(canvas) {
        const ctx = canvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = Number(canvas.getAttribute("height")) * ratio;
        ctx.scale(ratio, ratio);
        ctx.clearRect(0, 0, rect.width, canvas.height);
        return { ctx, width: rect.width, height: Number(canvas.getAttribute("height")) };
    }

    function drawLineChart(canvas, rows) {
        const { ctx, width, height } = clear(canvas);
        const pad = 34;
        const keys = [
            ["aroma", "#16805b"],
            ["colour", "#0c7885"],
            ["maturity", "#b76b10"]
        ];

        ctx.strokeStyle = "#dce5e1";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i += 1) {
            const y = pad + ((height - pad * 2) / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pad, y);
            ctx.lineTo(width - pad, y);
            ctx.stroke();
        }

        keys.forEach(([key, color]) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            rows.forEach((row, index) => {
                const x = pad + ((width - pad * 2) / (rows.length - 1)) * index;
                const y = height - pad - ((height - pad * 2) * row[key]) / 100;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        });

        ctx.fillStyle = "#60706b";
        ctx.font = "12px Inter, sans-serif";
        rows.forEach((row, index) => {
            const x = pad + ((width - pad * 2) / (rows.length - 1)) * index;
            ctx.fillText(row.t, x - 8, height - 8);
        });
    }

    function drawBarChart(canvas, rows) {
        const { ctx, width, height } = clear(canvas);
        const pad = 30;
        const barGap = 18;
        const barWidth = (width - pad * 2 - barGap * (rows.length - 1)) / rows.length;
        rows.forEach((row, index) => {
            const x = pad + index * (barWidth + barGap);
            const barHeight = ((height - pad * 2) * row.value) / 55;
            ctx.fillStyle = row.color;
            ctx.fillRect(x, height - pad - barHeight, barWidth, barHeight);
            ctx.fillStyle = "#17211f";
            ctx.font = "700 12px Inter, sans-serif";
            ctx.fillText(`${row.value}%`, x + 4, height - pad - barHeight - 8);
            ctx.fillStyle = "#60706b";
            ctx.font = "12px Inter, sans-serif";
            ctx.fillText(row.label.split(" ")[0], x, height - 8);
        });
    }

    return { drawLineChart, drawBarChart };
})();