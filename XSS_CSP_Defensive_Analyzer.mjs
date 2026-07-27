

const SAFE_MARKER = "<xss-test>SAFE_MARKER</xss-test>";

function htmlEntityEncode(text) {
    return Array.from(text, (character) => {
        return `&#x${character.charCodeAt(0).toString(16)};`;
    }).join("");
}

function unicodeEscapeEncode(text) {
    return Array.from(text, (character) => {
        return `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
    }).join("");
}

function urlEncode(text) {
    return encodeURIComponent(text);
}

function doubleUrlEncode(text) {
    return encodeURIComponent(encodeURIComponent(text));
}

function decodeHtmlEntities(text) {
    return text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
        return String.fromCharCode(Number.parseInt(hex, 16));
    });
}

function decodeUnicodeEscapes(text) {
    return text.replace(/\\u([0-9a-f]{4})/gi, (_, hex) => {
        return String.fromCharCode(Number.parseInt(hex, 16));
    });
}

function repeatedUrlDecode(text, maximumRounds = 3) {
    let current = text;

    for (let i = 0; i < maximumRounds; i++) {
        try {
            const decoded = decodeURIComponent(current);

            if (decoded === current) {
                break;
            }

            current = decoded;
        } catch {
            break;
        }
    }

    return current;
}

/*
 * Simulated defensive sanitizer.
 * It normalizes likely encodings, then rejects HTML metacharacters
 * and the known test marker.
 */
function simulatedSanitize(input) {
    let normalized = String(input);

    normalized = repeatedUrlDecode(normalized);
    normalized = decodeUnicodeEscapes(normalized);
    normalized = decodeHtmlEntities(normalized);

    const dangerousCharacters = /[<>"'`]/;
    const markerFound = normalized.includes("SAFE_MARKER");

    if (dangerousCharacters.test(normalized) || markerFound) {
        return {
            accepted: false,
            normalized,
            reason: "Normalized input contains a test marker or HTML metacharacters",
        };
    }

    return {
        accepted: true,
        normalized,
        reason: "Input accepted by simulated sanitizer",
    };
}

function parseCsp(headerValue) {
    const directives = new Map();

    for (const segment of headerValue.split(";")) {
        const trimmed = segment.trim();

        if (trimmed.length === 0) {
            continue;
        }

        const [directive, ...sources] = trimmed.split(/\s+/);

        directives.set(
            directive.toLowerCase(),
            sources.map((source) => source.toLowerCase()),
        );
    }

    return directives;
}

function analyzeCsp(headerValue) {
    const directives = parseCsp(headerValue);
    const findings = [];

    const scriptSources = directives.get("script-src")
        || directives.get("default-src")
        || [];

    if (!directives.has("default-src")) {
        findings.push("Missing default-src directive");
    }

    if (!directives.has("script-src")) {
        findings.push("Missing script-src directive; default-src fallback is used");
    }

    if (scriptSources.includes("'unsafe-inline'")) {
        findings.push("script-src permits 'unsafe-inline'");
    }

    if (scriptSources.includes("'unsafe-eval'")) {
        findings.push("script-src permits 'unsafe-eval'");
    }

    if (scriptSources.includes("*")) {
        findings.push("script-src permits wildcard source *");
    }

    if (scriptSources.some((source) => source.startsWith("http:"))) {
        findings.push("script-src permits insecure HTTP source");
    }

    if (!directives.has("object-src")) {
        findings.push("Missing object-src directive");
    }

    if (!directives.has("base-uri")) {
        findings.push("Missing base-uri directive");
    }

    if (!directives.has("frame-ancestors")) {
        findings.push("Missing frame-ancestors directive");
    }

    return findings;
}

function printEncodingReport() {
    const variants = [
        {
            name: "Raw harmless marker",
            value: SAFE_MARKER,
        },
        {
            name: "HTML entity encoding",
            value: htmlEntityEncode(SAFE_MARKER),
        },
        {
            name: "Unicode escape encoding",
            value: unicodeEscapeEncode(SAFE_MARKER),
        },
        {
            name: "URL percent encoding",
            value: urlEncode(SAFE_MARKER),
        },
        {
            name: "Double URL encoding",
            value: doubleUrlEncode(SAFE_MARKER),
        },
    ];

    console.log("Defensive encoding test report:");
    console.log();

    for (const variant of variants) {
        const result = simulatedSanitize(variant.value);

        console.log(`Variant : ${variant.name}`);
        console.log(`Encoded : ${variant.value}`);
        console.log(`Accepted: ${result.accepted}`);
        console.log(`Reason  : ${result.reason}`);
        console.log(`Decoded : ${result.normalized}`);
        console.log();
    }
}

function printCspReport(title, header) {
    const findings = analyzeCsp(header);

    console.log(`CSP report: ${title}`);
    console.log(`Header: ${header}`);

    if (findings.length === 0) {
        console.log("Result: No configured weakness checks were triggered.");
    } else {
        console.log("Findings:");

        for (const finding of findings) {
            console.log(`  - ${finding}`);
        }
    }

    console.log();
}

function main() {
    console.log("XSS encoding and CSP defensive analyzer");
    console.log("Simulation only: no executable payloads are generated.\n");

    printEncodingReport();

    const weakPolicy =
        "default-src *; script-src 'self' 'unsafe-inline' https:;";

    const strongerPolicy =
        "default-src 'self'; "
        + "script-src 'self' 'nonce-random-value'; "
        + "object-src 'none'; "
        + "base-uri 'none'; "
        + "frame-ancestors 'none';";

    printCspReport("Weak example policy", weakPolicy);
    printCspReport("Stronger example policy", strongerPolicy);
}

main();