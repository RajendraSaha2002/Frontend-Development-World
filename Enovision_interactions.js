window.Interactions = (() => {
    function toast(message) {
        const node = document.getElementById("toast");
        node.textContent = message;
        node.classList.add("show");
        window.setTimeout(() => node.classList.remove("show"), 2600);
    }

    function bindNavigation() {
        document.querySelectorAll(".nav-item").forEach((button) => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                toast(`${button.textContent} workspace selected`);
            });
        });
    }

    function bindSimulation(onRun) {
        document.getElementById("simulateBtn").addEventListener("click", onRun);
        document.getElementById("exportBtn").addEventListener("click", () => {
            toast("Local report package prepared for current batch");
        });
        document.getElementById("batchSelect").addEventListener("change", (event) => {
            toast(`Loaded reference profiles for ${event.target.value}`);
        });
    }

    return { bindNavigation, bindSimulation, toast };
})();