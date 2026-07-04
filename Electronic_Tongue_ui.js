const UI = (() => {
    function renderBatches() {
        document.getElementById("batchTable").innerHTML = TasteLabData.batches.map(batch => `
      <tr>
        <td>${batch[0]}</td>
        <td>${batch[1]}</td>
        <td>${batch[2]}%</td>
        <td><span class="pill ${batch[3]}">${batch[3]}</span></td>
      </tr>
    `).join("");
    }

    function toggleTheme() {
        const shell = document.querySelector(".app-shell");
        shell.dataset.theme = shell.dataset.theme === "dark" ? "light" : "dark";
        App.render();
    }

    function bindNavigation() {
        document.querySelectorAll(".nav-item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
                item.classList.add("active");
            });
        });
    }

    return { renderBatches, toggleTheme, bindNavigation };
})();