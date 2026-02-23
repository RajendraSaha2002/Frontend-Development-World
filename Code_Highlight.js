/* ================================================================
   highlight.js  –  Syntax highlighting engine (regex-based)
   Supports: HTML, CSS, JavaScript
   ================================================================ */

// ── Escape HTML special chars ─────────────────────────────────────
function escapeHtml(str) {
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;');
}

// ── Detect language from filename ─────────────────────────────────
function detectLang(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'html' || ext === 'htm') return 'html';
    if (ext === 'css')                   return 'css';
    if (ext === 'js')                    return 'javascript';
    return 'plain';
}

// ════════════════════════════════════════════════════════════════
//  HTML HIGHLIGHTER
// ════════════════════════════════════════════════════════════════
function highlightHTML(code) {
    const safe = escapeHtml(code);

    return safe
        // Comments <!-- -->
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g,
            '<span class="cmt">$1</span>')

        // DOCTYPE
        .replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi,
            '<span class="cmt">$1</span>')

        // Closing tags </tag>
        .replace(/(&lt;\/)([\w-]+)(&gt;)/g,
            '<span class="tag">$1$2$3</span>')

        // Opening tags with attributes <tag attr="val">
        .replace(/(&lt;)([\w-]+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s&>]+))?)*\s*\/?)(&gt;)/g,
            (m, open, tag, attrs, close) => {
                const styledAttrs = attrs.replace(
                    /([\w-]+)(\s*=\s*)(".*?"|'.*?')/g,
                    '<span class="attr">$1</span>$2<span class="val">$3</span>'
                ).replace(/([\w-]+)(?!=)/g, '<span class="attr">$1</span>');
                return `<span class="tag">${open}${tag}</span>${styledAttrs}<span class="tag">${close}</span>`;
            }
        )

        // Strings inside content (not already in tags)
        .replace(/(&quot;[^&]*&quot;)/g,
            '<span class="str">$1</span>');
}

// ════════════════════════════════════════════════════════════════
//  CSS HIGHLIGHTER
// ════════════════════════════════════════════════════════════════
function highlightCSS(code) {
    const safe = escapeHtml(code);

    return safe
        // Comments /* */
        .replace(/(\/\*[\s\S]*?\*\/)/g,
            '<span class="cmt">$1</span>')

        // Strings
        .replace(/(".*?"|'.*?')/g,
            '<span class="str">$1</span>')

        // @rules
        .replace(/(@[\w-]+)/g,
            '<span class="kw">$1</span>')

        // Selectors (before {)
        .replace(/([^{};\/\n][^{};\/\n]*?)(\s*\{)/g,
            '<span class="sel">$1</span>$2')

        // Properties (after { and before :)
        .replace(/\{([^}]*)\}/g, (m, inner) => {
            const styled = inner.replace(
                /([\w-]+)\s*:/g,
                '<span class="prop">$1</span>:'
            );
            return '{' + styled + '}';
        })

        // Numbers + units
        .replace(/\b(-?\d*\.?\d+)(px|em|rem|vh|vw|%|deg|s|ms)?\b/g,
            '<span class="num">$1$2</span>')

        // Colors #hex
        .replace(/(#[0-9a-fA-F]{3,8})\b/g,
            '<span class="num">$1</span>');
}

// ════════════════════════════════════════════════════════════════
//  JAVASCRIPT HIGHLIGHTER
// ════════════════════════════════════════════════════════════════
const JS_KEYWORDS = [
    'break','case','catch','class','const','continue','debugger',
    'default','delete','do','else','export','extends','false',
    'finally','for','function','if','import','in','instanceof',
    'let','new','null','return','static','super','switch','this',
    'throw','true','try','typeof','undefined','var','void',
    'while','with','yield','async','await','of','from'
];

function highlightJS(code) {
    const safe = escapeHtml(code);

    return safe
        // Single-line comments
        .replace(/(\/\/[^\n]*)/g,
            '<span class="cmt">$1</span>')

        // Multi-line comments
        .replace(/(\/\*[\s\S]*?\*\/)/g,
            '<span class="cmt">$1</span>')

        // Template literals
        .replace(/(`[^`]*`)/g,
            '<span class="str">$1</span>')

        // Strings
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
            '<span class="str">$1</span>')

        // Keywords
        .replace(new RegExp(`\\b(${JS_KEYWORDS.join('|')})\\b`, 'g'),
            '<span class="kw">$1</span>')

        // Function names  myFunc(
        .replace(/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g,
            '<span class="fn">$1</span>')

        // Numbers
        .replace(/\b(0x[0-9a-fA-F]+|\d*\.?\d+([eE][+-]?\d+)?)\b/g,
            '<span class="num">$1</span>')

        // Punctuation  { } ( ) [ ] ; , .
        .replace(/([{}()\[\];,.])/g,
            '<span class="pun">$1</span>');
}

// ════════════════════════════════════════════════════════════════
//  MAIN HIGHLIGHT FUNCTION  (called by editor.js)
// ════════════════════════════════════════════════════════════════
function highlight(code, lang) {
    if (!code) return '';
    switch (lang) {
        case 'html':       return highlightHTML(code);
        case 'css':        return highlightCSS(code);
        case 'javascript': return highlightJS(code);
        default:           return escapeHtml(code);
    }
}