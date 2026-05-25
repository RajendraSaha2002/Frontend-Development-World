/**
 * Text Editor Logic: Handles Line Numbers and Cursor Tracking
 */
window.CodeEditor = {
    input: document.getElementById('code-input'),
    lineNumbers: document.getElementById('line-numbers'),
    cursorPos: document.getElementById('cursor-pos'),

    init() {
        this.input.addEventListener('input', () => this.updateLines());
        this.input.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.input.scrollTop;
        });

        ['keyup', 'click', 'focus'].forEach(evt => {
            this.input.addEventListener(evt, () => this.updateCursor());
        });
    },

    setContent(text) {
        this.input.value = text;
        this.updateLines();
        this.updateCursor();
    },

    updateLines() {
        const lines = this.input.value.split('\n').length;
        this.lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    },

    updateCursor() {
        const text = this.input.value;
        const pos = this.input.selectionStart;
        const textUpToCursor = text.substring(0, pos);
        const line = textUpToCursor.split('\n').length;
        const col = pos - textUpToCursor.lastIndexOf('\n');
        this.cursorPos.textContent = `Ln ${line}, Col ${col}`;
    }
};

document.addEventListener('DOMContentLoaded', () => window.CodeEditor.init());