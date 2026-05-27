/**
 * Client-Side Lightweight OpenQASM 2.0 Instruction String Lexical Tokenizer Engine
 */
const QASMParser = {
    parse: (codeString) => {
        const actions = [];
        const lines = codeString.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            // Skip comments and file headers
            if (!line || line.startsWith('//') || line.startsWith('OPENQASM') || line.startsWith('include')) continue;

            // Basic instruction matching patterns
            if (line.startsWith('qreg') || line.startsWith('creg')) continue;

            if (line.startsWith('x ')) actions.push('X');
            else if (line.startsWith('y ')) actions.push('Y');
            else if (line.startsWith('z ')) actions.push('Z');
            else if (line.startsWith('h ')) actions.push('H');
            else if (line.startsWith('s ')) actions.push('S');
            else if (line.startsWith('t ')) actions.push('T');
        }
        return actions;
    }
};