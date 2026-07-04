const Alerts = (() => {
    const events = [...TasteLabData.events];

    function add(time, text, state) {
        events.unshift([time, text, state]);
        render();
    }

    function render() {
        document.getElementById("eventList").innerHTML = events.slice(0, 6).map(event => `
      <div class="event-item">
        <strong>${event[0]}</strong>
        <span>${event[1]}</span>
        <span class="pill ${event[2]}">${event[2]}</span>
      </div>
    `).join("");
    }

    return { add, render };
})();