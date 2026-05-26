/**
 * Flexible Parameter Configuration
 * Binds UI sliders for physical quantum noise properties.
 */
document.addEventListener('DOMContentLoaded', () => {
    const bindSlider = (sliderId, valId, suffix) => {
        const slider = document.getElementById(sliderId);
        const val = document.getElementById(valId);
        if(slider && val) {
            slider.addEventListener('input', (e) => {
                val.textContent = e.target.value + suffix;
            });
        }
    };

    bindSlider('slide-t1', 'val-t1', ' µs');
    bindSlider('slide-t2', 'val-t2', ' µs');
    bindSlider('slide-loss', 'val-loss', ' dB/km');
    bindSlider('slide-drift', 'val-drift', ' ns');
    bindSlider('slide-lat', 'val-lat', ' ms');

    document.getElementById('btn-apply-params').addEventListener('click', (e) => {
        e.target.textContent = "Parameters Injected to Backend";
        e.target.style.background = "var(--safe-green)";
        setTimeout(() => {
            e.target.textContent = "Apply Flexible Parameters";
            e.target.style.background = "var(--accent-purple)";
        }, 2000);
    });
});