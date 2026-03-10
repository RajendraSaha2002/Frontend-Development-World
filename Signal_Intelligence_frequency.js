// Analyzes text and builds a DOM-based bar chart without external libraries
const FrequencyAnalyzer = {
    analyze: function(text, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear old chart

        // Use Regex to strip spaces before counting
        const chars = text.toUpperCase().replace(/[^A-Z]/g, '');
        if (!chars) return;

        const counts = {};
        let maxCount = 0;

        // Count occurrences
        for (let char of chars) {
            counts[char] = (counts[char] || 0) + 1;
            if (counts[char] > maxCount) maxCount = counts[char];
        }

        // Sort characters alphabetically for the chart
        const sortedChars = Object.keys(counts).sort();

        // Build DOM elements dynamically
        sortedChars.forEach(char => {
            const bar = document.createElement('div');
            bar.className = 'bar';

            // Calculate height percentage relative to the highest count
            const heightPct = (counts[char] / maxCount) * 100;
            bar.style.height = `${heightPct}%`;

            const label = document.createElement('span');
            label.textContent = char;

            bar.appendChild(label);
            container.appendChild(bar);
        });
    }
};