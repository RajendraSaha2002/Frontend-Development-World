/**
 * Python Code Editor Logic
 * Syncs line numbers and handles basic text area interactions.
 */
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('line-numbers');

    const updateLineNumbers = () => {
        const lines = editor.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    };

    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', () => {
        lineNumbers.scrollTop = editor.scrollTop;
    });

    // Handle Tab key insertion
    editor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
            updateLineNumbers();
        }
    });

    // Initial call
    updateLineNumbers();
});