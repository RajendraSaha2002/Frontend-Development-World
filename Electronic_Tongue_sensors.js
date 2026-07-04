const Sensors = (() => {
    function valuesFor(sampleKey, shift = 0) {
        const sample = TasteLabData.samples[sampleKey];
        return sample.base.map((value, index) => {
            const wave = Math.sin((Date.now() / 700) + index + shift) * 4;
            return Math.max(2, value + wave);
        });
    }

    function tasteFor(sampleKey, shift = 0) {
        const sample = TasteLabData.samples[sampleKey];
        return sample.taste.map((value, index) => {
            const wave = Math.cos((Date.now() / 900) + index + shift) * 3;
            return Math.max(1, value + wave);
        });
    }

    function renderLegend(container) {
        container.innerHTML = TasteLabData.sensors.map(sensor => (
            `<span><strong style="color:${sensor.color}">${sensor.id}</strong> ${sensor.label}</span>`
        )).join("");
    }

    function renderSensorChart(sampleKey) {
        const values = valuesFor(sampleKey);
        Charts.bar(
            document.getElementById("sensorChart"),
            values,
            TasteLabData.sensors.map(sensor => sensor.id),
            TasteLabData.sensors.map(sensor => sensor.color)
        );
        Charts.radar(
            document.getElementById("tasteChart"),
            tasteFor(sampleKey),
            TasteLabData.tasteLabels,
            ["#0f766e"]
        );
    }

    return { valuesFor, tasteFor, renderLegend, renderSensorChart };
})();