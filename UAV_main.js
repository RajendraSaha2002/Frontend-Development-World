// Main Game/Animation Loop using requestAnimationFrame
function animationLoop() {
    FlightDynamics.update();
    Targeting.update();

    // Call the next frame (locks to browser refresh rate, usually 60fps)
    requestAnimationFrame(animationLoop);
}

// Bootstrap application on load
document.addEventListener('DOMContentLoaded', () => {
    FlightDynamics.init();
    Targeting.init();
    Telemetry.init();

    // Start the loop
    requestAnimationFrame(animationLoop);
});