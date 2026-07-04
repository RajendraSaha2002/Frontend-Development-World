const ReportExport = (() => {
    function exportText() {
        const sample = document.getElementById("sampleSelect").selectedOptions[0].textContent;
        const rows = [
            "AromaSense Nexus Electronic Tongue Report",
            "Generated offline in browser",
            "",
            `Sample: ${sample}`,
            `Accuracy: ${document.getElementById("accuracyMetric").textContent}`,
            `Throughput: ${document.getElementById("throughputMetric").textContent}`,
            `Drift index: ${document.getElementById("driftMetric").textContent}`,
            `Verdict: ${document.getElementById("verdictMetric").textContent}`
        ];
        const blob = new Blob([rows.join("\n")], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "electronic-tongue-report.txt";
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return { exportText };
})();