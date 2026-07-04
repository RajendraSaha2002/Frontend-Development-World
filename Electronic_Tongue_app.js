const App = (() => {
    function currentSample() {
        return document.getElementById("sampleSelect").value;
    }

    function render() {
        Sensors.renderSensorChart(currentSample());
        Simulation.renderPca(currentSample());
    }

    function boot() {
        Sensors.renderLegend(document.getElementById("sensorLegend"));
        Calibration.render();
        Alerts.render();
        UI.renderBatches();
        UI.bindNavigation();
        render();

        document.getElementById("sampleSelect").addEventListener("change", render);
        document.getElementById("runCycle").addEventListener("click", () => Simulation.run(currentSample()));
        document.getElementById("calibrateBtn").addEventListener("click", Calibration.calibrate);
        document.getElementById("exportReport").addEventListener("click", ReportExport.exportText);
        document.getElementById("themeToggle").addEventListener("click", UI.toggleTheme);
        window.addEventListener("resize", render);
        setInterval(() => Sensors.renderSensorChart(currentSample()), 2200);
    }

    return { boot, render };
})();

document.addEventListener("DOMContentLoaded", App.boot);