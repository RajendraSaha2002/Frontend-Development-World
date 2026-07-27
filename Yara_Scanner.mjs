

class AhoCorasick {
    constructor() {
        this.nodes = [{
            next: new Map(),
            failure: 0,
            outputs: new Set(),
        }];
    }

    addPattern(patternId, pattern) {
        if (!Buffer.isBuffer(pattern) || pattern.length === 0) {
            throw new Error("Aho-Corasick patterns must be non-empty Buffers");
        }

        let state = 0;

        for (const byte of pattern) {
            let nextState = this.nodes[state].next.get(byte);

            if (nextState === undefined) {
                nextState = this.nodes.length;

                this.nodes[state].next.set(byte, nextState);

                this.nodes.push({
                    next: new Map(),
                    failure: 0,
                    outputs: new Set(),
                });
            }

            state = nextState;
        }

        this.nodes[state].outputs.add(patternId);
    }

    build() {
        const queue = [];

        for (const child of this.nodes[0].next.values()) {
            this.nodes[child].failure = 0;
            queue.push(child);
        }

        while (queue.length > 0) {
            const current = queue.shift();

            for (const [byte, child] of this.nodes[current].next.entries()) {
                queue.push(child);

                let failure = this.nodes[current].failure;

                while (
                    failure !== 0
                    && !this.nodes[failure].next.has(byte)
                    ) {
                    failure = this.nodes[failure].failure;
                }

                const fallback = this.nodes[failure].next.get(byte);

                if (fallback !== undefined && fallback !== child) {
                    this.nodes[child].failure = fallback;
                } else {
                    this.nodes[child].failure = 0;
                }

                for (const output of this.nodes[this.nodes[child].failure].outputs) {
                    this.nodes[child].outputs.add(output);
                }
            }
        }
    }

    search(data) {
        const matches = new Set();
        let state = 0;

        for (const byte of data) {
            while (
                state !== 0
                && !this.nodes[state].next.has(byte)
                ) {
                state = this.nodes[state].failure;
            }

            const nextState = this.nodes[state].next.get(byte);

            if (nextState !== undefined) {
                state = nextState;
            }

            for (const output of this.nodes[state].outputs) {
                matches.add(output);
            }
        }

        return matches;
    }
}

class RuleParser {
    static parse(text) {
        const rules = [];

        /*
         * Closing brace must start a line, so hex-pattern braces do not
         * prematurely end the rule body.
         */
        const rulePattern = /rule\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)^\}/gm;

        let ruleMatch;

        while ((ruleMatch = rulePattern.exec(text)) !== null) {
            const name = ruleMatch[1];
            const body = ruleMatch[2];

            const metadataBlock = RuleParser.section(body, "meta:", "strings:");
            const stringsBlock = RuleParser.section(body, "strings:", "condition:");
            const conditionBlock = RuleParser.after(body, "condition:");

            const metadata = RuleParser.parseMetadata(metadataBlock);
            const strings = RuleParser.parseStrings(stringsBlock);
            const condition = RuleParser.parseCondition(conditionBlock);

            if (strings.length === 0) {
                throw new Error(`Rule ${name} has no string patterns`);
            }

            rules.push({
                name,
                metadata,
                strings,
                condition,
            });
        }

        if (rules.length === 0) {
            throw new Error("No valid rules found");
        }

        return rules;
    }

    static section(body, startMarker, endMarker) {
        const start = body.indexOf(startMarker);

        if (start < 0) {
            return "";
        }

        const contentStart = start + startMarker.length;
        const end = body.indexOf(endMarker, contentStart);

        return end < 0
            ? body.slice(contentStart)
            : body.slice(contentStart, end);
    }

    static after(body, marker) {
        const index = body.indexOf(marker);

        return index < 0 ? "" : body.slice(index + marker.length);
    }

    static parseMetadata(text) {
        const metadata = {};
        const pattern = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)"\s*$/gm;

        let match;

        while ((match = pattern.exec(text)) !== null) {
            metadata[match[1]] = match[2];
        }

        return metadata;
    }

    static parseStrings(text) {
        const strings = [];

        const pattern =
            /^\s*\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\{([^}]*)\}|"([^"]*)")\s*(ascii|wide)?\s*(nocase)?\s*$/gm;

        let match;

        while ((match = pattern.exec(text)) !== null) {
            const identifier = match[1];
            const completePattern = match[2];
            const hexText = match[3];
            const stringText = match[4];
            const encoding = match[5] || "ascii";
            const noCase = Boolean(match[6]);

            let bytes;

            if (completePattern.startsWith("{")) {
                bytes = RuleParser.hexBytes(hexText);
            } else if (encoding.toLowerCase() === "wide") {
                bytes = RuleParser.wideBytes(stringText);
            } else {
                bytes = Buffer.from(stringText, "ascii");
            }

            strings.push({
                identifier,
                bytes,
                noCase,
            });
        }

        return strings;
    }

    static parseCondition(text) {
        const value = text.trim().toLowerCase();

        if (value === "all of them") {
            return { type: "all", threshold: 0 };
        }

        if (value === "any of them") {
            return { type: "any", threshold: 0 };
        }

        const thresholdMatch = /^(\d+)\s+of\s+them$/.exec(value);

        if (thresholdMatch) {
            return {
                type: "threshold",
                threshold: Number.parseInt(thresholdMatch[1], 10),
            };
        }

        throw new Error(
            "Supported conditions: all of them, any of them, N of them",
        );
    }

    static hexBytes(text) {
        const cleaned = text.replace(/\s+/g, "");

        if (cleaned.length === 0 || cleaned.length % 2 !== 0) {
            throw new Error(`Invalid hex pattern: ${text}`);
        }

        if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
            throw new Error(`Invalid hex pattern: ${text}`);
        }

        return Buffer.from(cleaned, "hex");
    }

    static wideBytes(text) {
        const output = Buffer.alloc(text.length * 2);

        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);

            if (code > 127) {
                throw new Error("This example supports ASCII wide strings only");
            }

            output[i * 2] = code;
            output[i * 2 + 1] = 0;
        }

        return output;
    }
}

function lowerAscii(buffer) {
    const output = Buffer.from(buffer);

    for (let i = 0; i < output.length; i++) {
        if (output[i] >= 65 && output[i] <= 90) {
            output[i] += 32;
        }
    }

    return output;
}

function conditionMatches(condition, matchedCount, totalStrings) {
    if (condition.type === "all") {
        return matchedCount === totalStrings;
    }

    if (condition.type === "any") {
        return matchedCount > 0;
    }

    return matchedCount >= condition.threshold;
}

function severityScore(severity) {
    switch ((severity || "").toLowerCase()) {
        case "critical":
            return 100;
        case "high":
            return 70;
        case "medium":
            return 40;
        case "low":
            return 10;
        default:
            return 20;
    }
}

function compileRules(rules) {
    const exactAutomaton = new AhoCorasick();
    const noCaseAutomaton = new AhoCorasick();
    const references = new Map();

    for (const rule of rules) {
        for (const ruleString of rule.strings) {
            const patternId = `${rule.name}:${ruleString.identifier}`;

            references.set(patternId, {
                ruleName: rule.name,
                identifier: ruleString.identifier,
            });

            if (ruleString.noCase) {
                noCaseAutomaton.addPattern(patternId, lowerAscii(ruleString.bytes));
            } else {
                exactAutomaton.addPattern(patternId, ruleString.bytes);
            }
        }
    }

    exactAutomaton.build();
    noCaseAutomaton.build();

    return {
        exactAutomaton,
        noCaseAutomaton,
        references,
    };
}

function scanBuffer(sample, rules, compiled) {
    const exactMatches = compiled.exactAutomaton.search(sample.bytes);
    const noCaseMatches = compiled.noCaseAutomaton.search(
        lowerAscii(sample.bytes),
    );

    const allPatternMatches = new Set([
        ...exactMatches,
        ...noCaseMatches,
    ]);

    const matchesByRule = new Map();

    for (const patternId of allPatternMatches) {
        const reference = compiled.references.get(patternId);

        if (!reference) {
            continue;
        }

        if (!matchesByRule.has(reference.ruleName)) {
            matchesByRule.set(reference.ruleName, new Set());
        }

        matchesByRule.get(reference.ruleName).add(reference.identifier);
    }

    const matches = [];
    let totalScore = 0;

    for (const rule of rules) {
        const matchedIdentifiers = matchesByRule.get(rule.name) || new Set();

        if (
            conditionMatches(
                rule.condition,
                matchedIdentifiers.size,
                rule.strings.length,
            )
        ) {
            const score =
                severityScore(rule.metadata.severity)
                + matchedIdentifiers.size * 10;

            totalScore += score;

            matches.push({
                rule,
                matchedIdentifiers: [...matchedIdentifiers].sort(),
                score,
            });
        }
    }

    return {
        sample,
        matches,
        score: totalScore,
    };
}

function printResults(results) {
    for (const result of results) {
        console.log(`Sample: ${result.sample.name}`);
        console.log(`Size  : ${result.sample.bytes.length} bytes`);
        console.log(`Score : ${result.score}`);

        if (result.matches.length === 0) {
            console.log("Result: No matching rules");
        } else {
            console.log("Result: MATCH");

            for (const match of result.matches) {
                console.log(`  Rule     : ${match.rule.name}`);
                console.log(
                    `  Severity : ${match.rule.metadata.severity || "unknown"}`,
                );

                console.log(`  IOCs     : ${match.matchedIdentifiers.join(", ")}`);
                console.log(`  Score    : ${match.score}`);
            }
        }

        console.log();
    }
}

// ================================================================
// Simulated rule data and simulated byte-array samples
// ================================================================

const ruleText = `
rule Suspicious_Loader {
meta:
  author = "security-team"
  severity = "high"
  description = "Detects simulated loader indicators"
strings:
  $mz = { 4D 5A }
  $shell = "powershell" ascii nocase
  $download = "download" ascii nocase
  $evil_wide = "evil" wide nocase
condition:
  2 of them
}

rule Benign_Document {
meta:
  author = "security-team"
  severity = "low"
  description = "Detects simulated document data"
strings:
  $pdf = "%PDF" ascii
  $document = "document" ascii nocase
condition:
  all of them
}
`;

const simulatedSamples = [
    {
        name: "simulated-loader.bin",
        bytes: Buffer.concat([
            Buffer.from("4d5a900003000000", "hex"),
            Buffer.from(" harmless buffer POWERSHELL DOWNLOAD ", "ascii"),
            RuleParser.wideBytes("evil"),
        ]),
    },
    {
        name: "simulated-document.bin",
        bytes: Buffer.from("%PDF-1.7 simulated document content", "ascii"),
    },
    {
        name: "clean-data.bin",
        bytes: Buffer.from("Ordinary local test data.", "ascii"),
    },
];

function main() {
    const rules = RuleParser.parse(ruleText);
    const compiled = compileRules(rules);

    const results = simulatedSamples.map((sample) =>
        scanBuffer(sample, rules, compiled),
    );

    results.sort((first, second) => second.score - first.score);

    console.log("YARA-inspired Aho-Corasick scanner");
    console.log("Scanning embedded simulated byte buffers only.\n");

    printResults(results);
}

main();