const Calibration = (() => {
    const health = [
        ["Electrode response", 96],
        ["Baseline recovery", 92],
        ["Temperature correction", 98],
        ["Reference repeatability", 94]
    ];

    function render() {
        document.getElementById("healthBars").innerHTML = health.map(item => `
      <div class="health-item">
        <strong>${item[0]}</strong>
        <div class="health-meter"><span style="width:${item[1]}%"></span></div>
      </div>
    `).join("");
    }

    function calibrate() {
        const ph = Number(document.getElementById("phInput").value);
        const temp = Number(document.getElementById("tempInput").value);
        const rinse = Number(document.getElementById("rinseInput").value);
        const drift = Math.abs(7 - ph) * 0.006 + Math.abs(25 - temp) * 0.001 + Math.max(0, 30 - rinse) * 0.0005;
        document.getElementById("driftMetric").textContent = drift.toFixed(3);
        Alerts.add("Now", `Calibration profile updated at pH ${ph.toFixed(1)} and ${temp.toFixed(1)} C.`, drift < 0.05 ? "pass" : "review");
    }

    return { render, calibrate };
})();