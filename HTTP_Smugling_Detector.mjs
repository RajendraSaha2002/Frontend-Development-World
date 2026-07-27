

function findHeaderEnd(buffer) {
    return buffer.indexOf(Buffer.from("\r\n\r\n", "ascii"));
}

function parseRawRequest(buffer) {
    const headerEnd = findHeaderEnd(buffer);

    if (headerEnd < 0) {
        throw new Error("Incomplete HTTP headers");
    }

    const headerText = buffer.subarray(0, headerEnd).toString("latin1");
    const lines = headerText.split("\r\n");
    const requestLine = lines.shift();

    if (!requestLine || requestLine.split(" ").length < 3) {
        throw new Error("Invalid HTTP request line");
    }

    const headers = [];
    const valuesByNormalizedName = new Map();

    for (const line of lines) {
        const separator = line.indexOf(":");

        if (separator < 1) {
            throw new Error(`Invalid HTTP header line: ${line}`);
        }

        const rawName = line.slice(0, separator);
        const rawValue = line.slice(separator + 1);

        const normalizedName = rawName.trim().toLowerCase();
        const value = rawValue.trim();

        const header = {
            rawName,
            normalizedName,
            value,
            hasNameWhitespace: rawName !== rawName.trim(),
        };

        headers.push(header);

        if (!valuesByNormalizedName.has(normalizedName)) {
            valuesByNormalizedName.set(normalizedName, []);
        }

        valuesByNormalizedName.get(normalizedName).push(header);
    }

    return {
        requestLine,
        headers,
        valuesByNormalizedName,
        bodyStart: headerEnd + 4,
        raw: buffer,
    };
}

function contentLengthValues(request) {
    const entries = request.valuesByNormalizedName.get("content-length") || [];
    const values = [];

    for (const entry of entries) {
        if (!/^\d+$/.test(entry.value)) {
            throw new Error(`Invalid Content-Length: ${entry.value}`);
        }

        values.push(Number.parseInt(entry.value, 10));
    }

    return values;
}

function transferEncodingHeaders(request, strictHeaderSyntax) {
    const headers = request.valuesByNormalizedName.get("transfer-encoding") || [];

    return headers.filter((header) => {
        if (!strictHeaderSyntax) {
            return true;
        }

        /*
         * Strict parser recognizes only a legal field name with no whitespace
         * before the colon.
         */
        return !header.hasNameWhitespace;
    });
}

function hasChunkedTransferEncoding(request, strictHeaderSyntax) {
    const headers = transferEncodingHeaders(request, strictHeaderSyntax);

    return headers.some((header) => {
        const tokens = header.value
            .toLowerCase()
            .split(",")
            .map((item) => item.trim());

        return tokens.includes("chunked");
    });
}

/*
 * Parses chunked transfer encoding and returns the byte offset
 * immediately after the terminating zero-size chunk and trailers.
 */
function chunkedBodyEnd(buffer, bodyStart) {
    let offset = bodyStart;

    while (true) {
        const lineEnd = buffer.indexOf(Buffer.from("\r\n", "ascii"), offset);

        if (lineEnd < 0) {
            throw new Error("Incomplete chunk-size line");
        }

        const line = buffer.subarray(offset, lineEnd).toString("ascii");
        const sizeText = line.split(";")[0].trim();

        if (!/^[0-9a-fA-F]+$/.test(sizeText)) {
            throw new Error(`Invalid chunk size: ${sizeText}`);
        }

        const chunkSize = Number.parseInt(sizeText, 16);
        offset = lineEnd + 2;

        if (offset + chunkSize + 2 > buffer.length) {
            throw new Error("Incomplete chunk payload");
        }

        offset += chunkSize;

        if (
            buffer[offset] !== 0x0d
            || buffer[offset + 1] !== 0x0a
        ) {
            throw new Error("Chunk payload is missing CRLF");
        }

        offset += 2;

        if (chunkSize === 0) {
            /*
             * After 0\r\n, optional trailers end with another \r\n.
             */
            const trailerEnd = buffer.indexOf(Buffer.from("\r\n", "ascii"), offset);

            if (trailerEnd < 0) {
                throw new Error("Incomplete chunked trailer section");
            }

            return trailerEnd + 2;
        }
    }
}

/*
 * Simulates one server/parser boundary decision.
 */
function determineBodyBoundary(request, policy) {
    const lengths = contentLengthValues(request);
    const hasTransferEncoding = hasChunkedTransferEncoding(
        request,
        policy.strictTransferEncodingHeader,
    );

    let contentLength = null;

    if (lengths.length > 0) {
        contentLength = policy.contentLengthSelection === "last"
            ? lengths[lengths.length - 1]
            : lengths[0];
    }

    if (hasTransferEncoding && policy.preferTransferEncoding) {
        return {
            framing: "chunked",
            endOffset: chunkedBodyEnd(request.raw, request.bodyStart),
            contentLength,
        };
    }

    if (contentLength !== null) {
        const endOffset = request.bodyStart + contentLength;

        if (endOffset > request.raw.length) {
            throw new Error("Content-Length body is incomplete");
        }

        return {
            framing: "content-length",
            endOffset,
            contentLength,
        };
    }

    return {
        framing: "no-body",
        endOffset: request.bodyStart,
        contentLength: null,
    };
}

function detectIssues(request) {
    const findings = [];
    const lengths = contentLengthValues(request);

    const allTransferEncodingHeaders =
        request.valuesByNormalizedName.get("transfer-encoding") || [];

    const strictTransferEncoding = hasChunkedTransferEncoding(request, true);
    const lenientTransferEncoding = hasChunkedTransferEncoding(request, false);

    if (lengths.length > 1 && new Set(lengths).size > 1) {
        findings.push("CL.CL: conflicting Content-Length values");
    }

    if (
        allTransferEncodingHeaders.some((header) => header.hasNameWhitespace)
        || (lenientTransferEncoding && !strictTransferEncoding)
    ) {
        findings.push("TE.TE: obfuscated/ambiguous Transfer-Encoding header");
    }

    if (lengths.length > 0 && lenientTransferEncoding) {
        findings.push("CL + TE: request contains both Content-Length and Transfer-Encoding");
    }

    return findings;
}

function bytePositionDescription(buffer, offset) {
    const previewStart = Math.max(0, offset - 16);
    const previewEnd = Math.min(buffer.length, offset + 35);

    const preview = buffer
        .subarray(previewStart, previewEnd)
        .toString("latin1")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");

    return `offset ${offset}, near: "${preview}"`;
}

function analyzeScenario(name, rawText, frontEndPolicy, backEndPolicy) {
    const raw = Buffer.from(rawText, "latin1");
    const request = parseRawRequest(raw);

    console.log("============================================================");
    console.log(`Scenario: ${name}`);
    console.log(`Request line: ${request.requestLine}`);

    const findings = detectIssues(request);

    console.log("Detector findings:");

    if (findings.length === 0) {
        console.log("  None");
    } else {
        for (const finding of findings) {
            console.log(`  - ${finding}`);
        }
    }

    const frontEnd = determineBodyBoundary(request, frontEndPolicy);
    const backEnd = determineBodyBoundary(request, backEndPolicy);

    console.log(`Front-end framing: ${frontEnd.framing}`);
    console.log(
        `Front-end boundary: ${bytePositionDescription(raw, frontEnd.endOffset)}`,
    );

    console.log(`Back-end framing: ${backEnd.framing}`);
    console.log(
        `Back-end boundary: ${bytePositionDescription(raw, backEnd.endOffset)}`,
    );

    if (frontEnd.endOffset !== backEnd.endOffset) {
        console.log("ALERT: Front-end and back-end disagree on request boundary.");
    } else {
        console.log("Result: Both simulated parsers agree on request boundary.");
    }

    console.log();
}

// ================================================================
// Simulated parser policies
// ================================================================

const FRONT_END_CL_POLICY = {
    preferTransferEncoding: false,
    strictTransferEncodingHeader: true,
    contentLengthSelection: "first",
};

const BACK_END_TE_POLICY = {
    preferTransferEncoding: true,
    strictTransferEncodingHeader: false,
    contentLengthSelection: "last",
};

const FRONT_END_TE_POLICY = {
    preferTransferEncoding: true,
    strictTransferEncodingHeader: true,
    contentLengthSelection: "first",
};

const BACK_END_CL_POLICY = {
    preferTransferEncoding: false,
    strictTransferEncodingHeader: false,
    contentLengthSelection: "last",
};

// ================================================================
// Embedded safe training inputs
// ================================================================

const scenarios = [
    {
        name: "CL.TE simulation",
        frontEndPolicy: FRONT_END_CL_POLICY,
        backEndPolicy: BACK_END_TE_POLICY,
        raw:
            "POST /training HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "Content-Length: 4\r\n"
            + "Transfer-Encoding: chunked\r\n"
            + "\r\n"
            + "0\r\n"
            + "\r\n"
            + "GET /benign HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "\r\n",
    },
    {
        name: "TE.CL simulation",
        frontEndPolicy: FRONT_END_TE_POLICY,
        backEndPolicy: BACK_END_CL_POLICY,
        raw:
            "POST /training HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "Transfer-Encoding: chunked\r\n"
            + "Content-Length: 4\r\n"
            + "\r\n"
            + "0\r\n"
            + "\r\n"
            + "GET /benign HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "\r\n",
    },
    {
        name: "TE.TE obfuscation simulation",
        frontEndPolicy: FRONT_END_CL_POLICY,
        backEndPolicy: BACK_END_TE_POLICY,
        raw:
            "POST /training HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "Content-Length: 4\r\n"
            + "Transfer-Encoding : chunked\r\n"
            + "\r\n"
            + "0\r\n"
            + "\r\n"
            + "GET /benign HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "\r\n",
    },
    {
        name: "CL.CL conflict simulation",
        frontEndPolicy: {
            preferTransferEncoding: false,
            strictTransferEncodingHeader: true,
            contentLengthSelection: "first",
        },
        backEndPolicy: {
            preferTransferEncoding: false,
            strictTransferEncodingHeader: true,
            contentLengthSelection: "last",
        },
        raw:
            "POST /training HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "Content-Length: 4\r\n"
            + "Content-Length: 5\r\n"
            + "\r\n"
            + "ABCD"
            + "E"
            + "GET /benign HTTP/1.1\r\n"
            + "Host: example.test\r\n"
            + "\r\n",
    },
];

function main() {
    console.log("HTTP request-smuggling detector");
    console.log("Simulation only: no server, socket, or network traffic.\n");

    for (const scenario of scenarios) {
        analyzeScenario(
            scenario.name,
            scenario.raw,
            scenario.frontEndPolicy,
            scenario.backEndPolicy,
        );
    }
}

main();