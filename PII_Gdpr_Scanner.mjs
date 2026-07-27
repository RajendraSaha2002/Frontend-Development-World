import fs from "node:fs";
import path from "node:path";



const SUPPORTED_EXTENSIONS = new Set([
    ".txt",
    ".csv",
    ".log",
    ".md",
    ".json",
    ".xml",
]);

const CLASSIFICATION = {
    CREDIT_CARD: "Restricted",
    SSN: "Restricted",
    IBAN: "Restricted",
    EMAIL: "Confidential",
    PHONE: "Confidential",
    IPV4: "Internal",
    IPV6: "Internal",
};

function luhnValid(candidate) {
    const digits = candidate.replace(/[ -]/g, "");

    if (!/^\d{13,19}$/.test(digits)) {
        return false;
    }

    let sum = 0;
    let doubleDigit = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let value = Number.parseInt(digits[i], 10);

        if (doubleDigit) {
            value *= 2;

            if (value > 9) {
                value -= 9;
            }
        }

        sum += value;
        doubleDigit = !doubleDigit;
    }

    return sum % 10 === 0;
}

function ibanValid(candidate) {
    const iban = candidate.replace(/\s/g, "").toUpperCase();

    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) {
        return false;
    }

    const rearranged = iban.slice(4) + iban.slice(0, 4);
    let remainder = 0;

    for (const character of rearranged) {
        const numeric = character >= "A" && character <= "Z"
            ? String(character.charCodeAt(0) - 55)
            : character;

        for (const digit of numeric) {
            remainder = (remainder * 10 + Number.parseInt(digit, 10)) % 97;
        }
    }

    return remainder === 1;
}

function ipv4Valid(candidate) {
    const parts = candidate.split(".");

    return parts.length === 4
        && parts.every((part) => {
            if (!/^\d{1,3}$/.test(part)) {
                return false;
            }

            const value = Number.parseInt(part, 10);

            return value >= 0 && value <= 255;
        });
}

function likelyIpv6(candidate) {
    if (!candidate.includes(":")) {
        return false;
    }

    const withoutCompression = candidate.replace("::", ":");
    const groups = withoutCompression.split(":");

    return groups.length >= 3
        && groups.length <= 8
        && groups.every((group) => /^[0-9a-f]{0,4}$/i.test(group));
}

function getLineAndColumn(text, position) {
    const before = text.slice(0, position);
    const lines = before.split(/\r?\n/);

    return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
    };
}

function addMatches(findings, text, expression, type, validator = null) {
    expression.lastIndex = 0;

    let match;

    while ((match = expression.exec(text)) !== null) {
        const value = match[0];

        if (validator && !validator(value)) {
            continue;
        }

        const location = getLineAndColumn(text, match.index);

        findings.push({
            type,
            classification: CLASSIFICATION[type],
            start: match.index,
            end: match.index + value.length,
            line: location.line,
            column: location.column,
        });
    }
}

function removeOverlappingFindings(findings) {
    const priority = {
        CREDIT_CARD: 1,
        SSN: 2,
        IBAN: 3,
        EMAIL: 4,
        PHONE: 5,
        IPV4: 6,
        IPV6: 7,
    };

    const sorted = [...findings].sort((first, second) => {
        if (first.start !== second.start) {
            return first.start - second.start;
        }

        return priority[first.type] - priority[second.type];
    });

    const accepted = [];
    let previousEnd = -1;

    for (const finding of sorted) {
        if (finding.start >= previousEnd) {
            accepted.push(finding);
            previousEnd = finding.end;
        }
    }

    return accepted;
}

function scanText(text) {
    const findings = [];

    addMatches(
        findings,
        text,
        /\b(?:\d[ -]?){13,19}\b/g,
        "CREDIT_CARD",
        luhnValid,
    );

    addMatches(
        findings,
        text,
        /\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g,
        "SSN",
    );

    addMatches(
        findings,
        text,
        /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b/gi,
        "IBAN",
        ibanValid,
    );

    addMatches(
        findings,
        text,
        /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        "IPV4",
        ipv4Valid,
    );

    addMatches(
        findings,
        text,
        /\b(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}\b/gi,
        "IPV6",
        likelyIpv6,
    );

    addMatches(
        findings,
        text,
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        "EMAIL",
    );

    addMatches(
        findings,
        text,
        /\b(?:\+\d{1,3}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)\d{3,4}[ -]?\d{3,4}\b/g,
        "PHONE",
    );

    return removeOverlappingFindings(findings);
}

function redactText(text, findings) {
    let redacted = text;

    /*
     * Work backwards so earlier character positions remain unchanged.
     */
    const reverseOrder = [...findings].sort(
        (first, second) => second.start - first.start,
    );

    for (const finding of reverseOrder) {
        const replacement = `[REDACTED:${finding.type}]`;

        redacted =
            redacted.slice(0, finding.start)
            + replacement
            + redacted.slice(finding.end);
    }

    return redacted;
}

function collectTextFiles(targetPath) {
    const resolved = path.resolve(targetPath);

    if (!fs.existsSync(resolved)) {
        throw new Error(`Path does not exist: ${resolved}`);
    }

    const details = fs.statSync(resolved);

    if (details.isFile()) {
        return SUPPORTED_EXTENSIONS.has(path.extname(resolved).toLowerCase())
            ? [resolved]
            : [];
    }

    const files = [];

    for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
        const entryPath = path.join(resolved, entry.name);

        if (entry.isDirectory()) {
            files.push(...collectTextFiles(entryPath));
        } else if (
            entry.isFile()
            && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
        ) {
            files.push(entryPath);
        }
    }

    return files;
}

function countByType(findings) {
    const counts = {};

    for (const finding of findings) {
        counts[finding.type] = (counts[finding.type] || 0) + 1;
    }

    return counts;
}

function buildGdprReport(scanResults, applyRedaction) {
    const totalFindings = scanResults.reduce(
        (total, result) => total + result.findings.length,
        0,
    );

    const combinedFindings = scanResults.flatMap(
        (result) => result.findings,
    );

    return {
        reportType: "GDPR-style PII data-mapping report",
        generatedAt: new Date().toISOString(),
        scanMode: applyRedaction ? "redaction-applied" : "dry-run",
        dataMinimization: "Detected PII values are intentionally omitted from this report.",
        summary: {
            filesScanned: scanResults.length,
            totalFindings,
            findingsByCategory: countByType(combinedFindings),
        },
        dataCategories: Object.entries(CLASSIFICATION).map(
            ([category, classification]) => ({
                category,
                classification,
                recommendedHandling:
                    classification === "Restricted"
                        ? "Restrict access, encrypt, minimize retention, and review legal basis."
                        : "Apply access control and data-minimization controls.",
            }),
        ),
        files: scanResults.map((result) => ({
            path: result.path,
            redactionApplied: result.redactionApplied,
            findingCount: result.findings.length,
            findingsByCategory: countByType(result.findings),
            locations: result.findings.map((finding) => ({
                category: finding.type,
                classification: finding.classification,
                line: finding.line,
                column: finding.column,
            })),
        })),
    };
}

function printSummary(scanResults, applyRedaction) {
    let total = 0;

    console.log("PII scanner and GDPR classification engine");
    console.log(`Mode: ${applyRedaction ? "APPLY REDACTION" : "DRY RUN"}\n`);

    for (const result of scanResults) {
        total += result.findings.length;

        console.log(`File: ${result.path}`);
        console.log(`Findings: ${result.findings.length}`);

        if (result.findings.length === 0) {
            console.log("  No supported PII patterns detected.");
        } else {
            for (const [type, count] of Object.entries(
                countByType(result.findings),
            )) {
                console.log(
                    `  ${type}: ${count} (${CLASSIFICATION[type]})`,
                );
            }
        }

        if (result.redactionApplied) {
            console.log("  Redaction: applied in place");
        }

        console.log();
    }

    console.log(`Total findings: ${total}`);
}

function main() {
    const argumentsList = process.argv.slice(2);
    const applyRedaction = argumentsList.includes("--apply");

    const targetPath = argumentsList.find(
        (argument) => argument !== "--apply",
    );

    if (!targetPath) {
        throw new Error(
            "Usage: node pii-gdpr-scanner.mjs <file-or-directory> [--apply]",
        );
    }

    const files = collectTextFiles(targetPath);

    if (files.length === 0) {
        throw new Error("No supported text files found");
    }

    const scanResults = [];

    for (const filePath of files) {
        const text = fs.readFileSync(filePath, "utf8");
        const findings = scanText(text);

        let redactionApplied = false;

        if (applyRedaction && findings.length > 0) {
            const redacted = redactText(text, findings);

            /*
             * --apply is explicit authorization to overwrite the selected file.
             */
            fs.writeFileSync(filePath, redacted, "utf8");
            redactionApplied = true;
        }

        scanResults.push({
            path: filePath,
            findings,
            redactionApplied,
        });
    }

    printSummary(scanResults, applyRedaction);

    const report = buildGdprReport(scanResults, applyRedaction);

    const reportPath = path.resolve("gdpr-data-mapping-report.json");

    fs.writeFileSync(
        reportPath,
        JSON.stringify(report, null, 2),
        "utf8",
    );

    console.log(`\nGDPR-style report written to: ${reportPath}`);
}

try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}