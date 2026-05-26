/**
 * Quantum Noise Configuration Module
 * Syncs UI sliders and maintains the noise model state for simulations.
 */
document.addEventListener('DOMContentLoaded', () => {
    const depSlider = document.getElementById('noise-depolarizing');
    const depVal = document.getElementById('val-depolarizing');

    const t1Slider = document.getElementById('noise-t1');
    const t1Val = document.getElementById('val-t1');

    const t2Slider = document.getElementById('noise-t2');
    const t2Val = document.getElementById('val-t2');

    // Sync values
    depSlider.addEventListener('input', (e) => {
        depVal.textContent = (e.target.value / 100).toFixed(2);
    });

    t1Slider.addEventListener('input', (e) => {
        t1Val.textContent = e.target.value + ' µs';
    });

    t2Slider.addEventListener('input', (e) => {
        t2Val.textContent = e.target.value + ' µs';
    });

    document.getElementById('btn-apply-noise').addEventListener('click', () => {
        alert(`Noise Profile Applied to Simulator Backend:\nDepolarizing: ${depVal.textContent}\nThermal Relaxation (T1): ${t1Val.textContent}\nDephasing (T2): ${t2Val.textContent}`);
    });
});