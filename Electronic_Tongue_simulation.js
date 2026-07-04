const Simulation = (() => {
    let cycle = 0;

    function run(sampleKey) {
        cycle += 1;
        const match = 91 + Math.random() * 8;
        const drift = 0.012 + Math.random() * 0.025;
        const pass = match > 93 && drift < 0.032;
        document.getElementById("accuracyMetric").textContent = `${match.toFixed(1)}%`;
        document.getElementById("throughputMetric").textContent = `${38 + Math.round(Math.random() * 9)}/hr`;
        document.getElementById("driftMetric").textContent = drift.toFixed(3);
        document.getElementById("verdictMetric").textContent = pass ? "Pass" : "Review";
        document.getElementById("pcaState").textContent = `Cluster distance: ${(0.12 + Math.random() * 0.28).toFixed(2)}`;
        document.getElementById("annState").textContent = `Class: ${TasteLabData.samples[sampleKey].name}`;
        document.getElementById("fuzzyState").textContent = `Risk: ${pass ? "Low" : "Medium"}`;
        Alerts.add("Cycle " + cycle, `${TasteLabData.samples[sampleKey].name} analyzed with ${match.toFixed(1)}% profile match.`, pass ? "pass" : "review");
        renderPca(sampleKey);
        document.querySelectorAll(".metric-card").forEach(card => card.classList.add("flash"));
        setTimeout(() => document.querySelectorAll(".flash").forEach(card => card.classList.remove("flash")), 750);
    }

    function renderPca(sampleKey) {
        const offsets = { tea: [26, 42], milk: [62, 22], water: [48, 70], syrup: [70, 34] };
        const point = offsets[sampleKey] || [50, 50];
        Charts.scatter(document.getElementById("pcaChart"), TasteLabData.pcaReference, {
            x: point[0] + Math.random() * 6 - 3,
            y: point[1] + Math.random() * 6 - 3,
            c: "#111827"
        });
    }

    return { run, renderPca };
})();