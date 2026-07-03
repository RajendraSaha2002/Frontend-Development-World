(function boot() {
    const data = window.ENOVISION_DATA;
    const sensorValues = [0.45, 0.78, 0.62, 0.9, 0.55, 0.72, 0.84, 0.67, 0.5, 0.81, 0.76, 0.6];

    function drawAll() {
        ChartTools.drawLineChart(document.getElementById("fusionChart"), data.fusion);
        ChartTools.drawBarChart(document.getElementById("gradeChart"), data.grades);
    }

    function renderAll() {
        Modules.renderSensors(document.getElementById("sensorArray"), sensorValues);
        Modules.renderSwatches(document.getElementById("visionSwatches"), data.swatches);
        Modules.renderSignals(document.getElementById("signalList"), data.signals);
        Modules.renderReferences(document.getElementById("referenceTable"), data.references);
        Modules.renderGradeSummary(document.getElementById("gradeSummary"), data.grades);
        document.getElementById("meterRing").style.setProperty("--meter", "84%");
        drawAll();
    }

    function runCycle() {
        const aroma = (90 + Math.random() * 6).toFixed(1);
        const eta = Math.max(3, Math.round(8 - Math.random() * 5));
        document.getElementById("aromaScore").textContent = `${aroma}%`;
        document.getElementById("fermentEta").textContent = `ETA ${String(eta).padStart(2, "0")} min`;
        document.getElementById("pumpState").textContent = Math.random() > 0.5 ? "Sampling" : "Conditioning";
        document.getElementById("purgeState").textContent = Math.random() > 0.6 ? "Active" : "Standby";
        const score = Math.round(80 + Math.random() * 16);
        document.getElementById("meterValue").textContent = score;
        document.getElementById("meterRing").style.setProperty("--meter", `${score}%`);
        document.getElementById("decisionText").textContent = score > 88 ? "Move to next stage" : "Continue monitoring";
        Modules.renderSensors(
            document.getElementById("sensorArray"),
            sensorValues.map(() => (0.42 + Math.random() * 0.52).toFixed(2))
        );
        data.fusion = data.fusion.map((row) => ({
            ...row,
            aroma: Math.max(18, Math.min(96, row.aroma + Math.round(Math.random() * 10 - 5))),
            colour: Math.max(18, Math.min(96, row.colour + Math.round(Math.random() * 8 - 4))),
            maturity: Math.max(12, Math.min(98, row.maturity + Math.round(Math.random() * 7 - 3)))
        }));
        drawAll();
        Interactions.toast("New local acquisition cycle completed");
    }

    window.addEventListener("resize", drawAll);
    Interactions.bindNavigation();
    Interactions.bindSimulation(runCycle);
    renderAll();
})();
