window.Modules = (() => {
    function renderSensors(target, values) {
        target.innerHTML = values.map((value) => (
            `<span class="sensor-cell" style="--intensity:${value}"></span>`
        )).join("");
    }

    function renderSwatches(target, swatches) {
        target.innerHTML = swatches.map((item) => (
            `<div class="swatch" style="background:${item.color}">${item.label}</div>`
        )).join("");
    }

    function renderSignals(target, signals) {
        target.innerHTML = signals.map(([label, value]) => (
            `<li><span>${label}</span><strong>${value}</strong></li>`
        )).join("");
    }

    function renderReferences(target, rows) {
        target.innerHTML = rows.map(([profile, useCase, method, status, confidence]) => {
            const statusClass = status === "Ready" ? "status-good" : "status-watch";
            return `<tr>
        <td>${profile}</td>
        <td>${useCase}</td>
        <td>${method}</td>
        <td class="${statusClass}">${status}</td>
        <td>${confidence}</td>
      </tr>`;
        }).join("");
    }

    function renderGradeSummary(target, grades) {
        target.innerHTML = grades.slice(0, 3).map((grade) => (
            `<div><span>${grade.label}</span><strong>${grade.value}%</strong></div>`
        )).join("");
    }

    return { renderSensors, renderSwatches, renderSignals, renderReferences, renderGradeSummary };
})();