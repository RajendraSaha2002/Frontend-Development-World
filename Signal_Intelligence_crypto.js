// Handles Regex filtering and the simulated Rotor encryption
const CryptoEngine = {
    // Advanced Regex: Remove non-letters, convert to uppercase, and group into blocks of 5 (Military Standard)
    formatToMilitaryBlocks: function(text) {
        const cleaned = text.toUpperCase().replace(/[^A-Z]/g, ''); // REGEX: Keep only A-Z
        const blocks = cleaned.match(/.{1,5}/g); // REGEX: Match groups of 1 to 5 characters
        return blocks ? blocks.join(' ') : '';
    },

    encrypt: function(text, shift) {
        const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
        let result = '';

        for (let i = 0; i < cleaned.length; i++) {
            let charCode = cleaned.charCodeAt(i);
            // Simulate a dynamic rotor that shifts differently based on position
            let dynamicShift = (shift + i) % 26;
            let newCode = ((charCode - 65 + dynamicShift) % 26) + 65;
            result += String.fromCharCode(newCode);
        }

        return this.formatToMilitaryBlocks(result);
    },

    decrypt: function(text, shift) {
        const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
        let result = '';

        for (let i = 0; i < cleaned.length; i++) {
            let charCode = cleaned.charCodeAt(i);
            let dynamicShift = (shift + i) % 26;
            let newCode = ((charCode - 65 - dynamicShift + 26) % 26) + 65;
            result += String.fromCharCode(newCode);
        }

        return result;
    }
};