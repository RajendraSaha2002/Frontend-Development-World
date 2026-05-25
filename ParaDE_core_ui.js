/**
 * UI State Management: Handles Panel Tabs, Dropdowns, and Modals
 */
document.addEventListener('DOMContentLoaded', () => {
    // Bottom Panel Tab Switching
    const panelTabs = document.querySelectorAll('.panel-tab');
    const panelViews = document.querySelectorAll('.panel-view');

    panelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            panelTabs.forEach(t => t.classList.remove('active'));
            panelViews.forEach(v => v.classList.add('hidden'));

            tab.classList.add('active');
            document.getElementById(`panel-${tab.dataset.panel}`).classList.remove('hidden');
        });
    });

    // Toolbar Actions
    document.getElementById('action-download').addEventListener('click', (e) => {
        e.preventDefault();
        window.HPCCompiler.logToTerminal("Packing project with customized Makefiles...", "sys");
        setTimeout(() => window.HPCCompiler.logToTerminal("parade_project_export.tar.gz downloaded successfully.", "succ"), 1000);
    });

    document.getElementById('action-converter').addEventListener('click', (e) => {
        e.preventDefault();
        window.HPCCompiler.logToTerminal("Starting Source Converter...", "sys");
        window.HPCCompiler.logToTerminal("Translating OpenMP pragmas to OpenACC directives...", "sys");
        setTimeout(() => window.HPCCompiler.logToTerminal("Conversion complete. Generated kernel_acc.c", "succ"), 1500);
    });
});