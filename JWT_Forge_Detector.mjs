import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";



const EXPECTED_ALGORITHM = "HS256";

/*
 * Demo-only secret. Real applications must load a long random secret
 * from protected server-side configuration.
 */
const HMAC_SECRET = Buffer.from(
    "replace-this-demo-secret-with-a-long-random-production-secret",
    "utf8",
);

function base64UrlEncode(bytes) {
    return Buffer.from(bytes)
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}

function base64UrlDecode(text) {
    if (
        typeof text !== "string"
        || text.length === 0
        || !/^[A-Za-z0-9_-]+$/.test(text)
    ) {
        throw new Error("Invalid Base64URL data");
    }

    return Buffer.from(text, "base64url");
}

function hmacSha256(signingInput, secret) {
    return createHmac("sha256", secret)
        .update(signingInput, "ascii")
        .digest();
}

function createHs256Token(header, payload, secret) {
    const headerPart = base64UrlEncode(JSON.stringify(header));
    const payloadPart = base64UrlEncode(JSON.stringify(payload));

    const signingInput = `${headerPart}.${payloadPart}`;
    const signature = hmacSha256(signingInput, secret);

    return `${signingInput}.${base64UrlEncode(signature)}`;
}

function createRawToken(header, payload, signaturePart = "x") {
    return [
        base64UrlEncode(JSON.stringify(header)),
        base64UrlEncode(JSON.stringify(payload)),
        signaturePart,
    ].join(".");
}

function parseJsonObject(buffer, sectionName) {
    let value;

    try {
        value = JSON.parse(buffer.toString("utf8"));
    } catch {
        throw new Error(`${sectionName} is not valid JSON`);
    }

    if (
        value === null
        || Array.isArray(value)
        || typeof value !== "object"
    ) {
        throw new Error(`${sectionName} must be a JSON object`);
    }

    return value;
}

/*
 * Lightweight duplicate-key guard for JWT headers.
 * This rejects duplicate values for security-sensitive fields.
 */
function rejectDuplicateSensitiveHeaders(headerText) {
    const sensitiveFields = [
        "alg",
        "kid",
        "jku",
        "jwk",
        "x5u",
        "x5c",
        "crit",
    ];

    for (const field of sensitiveFields) {
        const expression = new RegExp(`"${field}"\\s*:`, "g");
        const matches = headerText.match(expression);

        if (matches && matches.length > 1) {
            throw new Error(`Duplicate JWT header field rejected: ${field}`);
        }
    }
}

function validateHeader(header) {
    if (typeof header.alg !== "string") {
        throw new Error("JWT alg header is missing");
    }

    if (header.alg.toLowerCase() === "none") {
        throw new Error("alg:none attack rejected");
    }

    if (header.alg !== EXPECTED_ALGORITHM) {
        throw new Error(
            `Algorithm rejected: expected ${EXPECTED_ALGORITHM}, received ${header.alg}`,
        );
    }

    const forbiddenHeaders = [
        "kid",
        "jku",
        "jwk",
        "x5u",
        "x5c",
        "crit",
    ];

    for (const field of forbiddenHeaders) {
        if (Object.prototype.hasOwnProperty.call(header, field)) {
            throw new Error(`Unsafe JWT header rejected: ${field}`);
        }
    }
}

function validateTimeClaims(payload) {
    const now = Math.floor(Date.now() / 1000);

    if (
        Object.prototype.hasOwnProperty.call(payload, "exp")
        && (
            typeof payload.exp !== "number"
            || !Number.isInteger(payload.exp)
        )
    ) {
        throw new Error("JWT exp claim must be an integer Unix timestamp");
    }

    if (
        Object.prototype.hasOwnProperty.call(payload, "nbf")
        && (
            typeof payload.nbf !== "number"
            || !Number.isInteger(payload.nbf)
        )
    ) {
        throw new Error("JWT nbf claim must be an integer Unix timestamp");
    }

    if (typeof payload.exp === "number" && now >= payload.exp) {
        throw new Error("JWT has expired");
    }

    if (typeof payload.nbf === "number" && now < payload.nbf) {
        throw new Error("JWT is not yet valid");
    }
}

/*
 * Returns decoded header/payload only after successful signature verification.
 */
function validateHs256Jwt(token, secret) {
    if (typeof token !== "string") {
        throw new Error("JWT must be a string");
    }

    const parts = token.split(".");

    if (
        parts.length !== 3
        || parts[0].length === 0
        || parts[1].length === 0
        || parts[2].length === 0
    ) {
        throw new Error("JWT must contain non-empty header, payload, and signature");
    }

    const headerBytes = base64UrlDecode(parts[0]);
    const payloadBytes = base64UrlDecode(parts[1]);
    const signature = base64UrlDecode(parts[2]);

    const headerText = headerBytes.toString("utf8");

    rejectDuplicateSensitiveHeaders(headerText);

    const header = parseJsonObject(headerBytes, "JWT header");
    const payload = parseJsonObject(payloadBytes, "JWT payload");

    /*
     * Validate algorithm and unsafe header fields before signature handling.
     * The server has a fixed HS256 policy and fixed server-side secret.
     */
    validateHeader(header);

    const signingInput = `${parts[0]}.${parts[1]}`;
    const expectedSignature = hmacSha256(signingInput, secret);

    if (
        signature.length !== expectedSignature.length
        || !timingSafeEqual(signature, expectedSignature)
    ) {
        throw new Error("JWT signature is invalid");
    }

    validateTimeClaims(payload);

    return {
        header,
        payload,
    };
}

function printResult(title, token) {
    try {
        const result = validateHs256Jwt(token, HMAC_SECRET);

        console.log(title);
        console.log("  Accepted: true");
        console.log("  Header  :", result.header);
        console.log("  Payload :", result.payload);
    } catch (error) {
        console.log(title);
        console.log("  Accepted: false");
        console.log(`  Reason  : ${error.message}`);
    }

    console.log();
}

function runDemo() {
    const future = Math.floor(Date.now() / 1000) + 3600;

    const validToken = createHs256Token(
        {
            alg: "HS256",
            typ: "JWT",
        },
        {
            sub: "alice",
            role: "user",
            exp: future,
        },
        HMAC_SECRET,
    );

    printResult("Valid HS256 token", validToken);

    /*
     * Attack 1: alg:none.
     * No signature is provided, but validator rejects the algorithm first.
     */
    const algNoneToken = createRawToken(
        {
            alg: "none",
            typ: "JWT",
        },
        {
            sub: "attacker",
            role: "admin",
            exp: future,
        },
    );

    printResult("alg:none crafted token", algNoneToken);

    /*
     * Attack 2: RSA-to-HMAC key confusion.
     * A vulnerable implementation may use an RSA public key as an HMAC key.
     * This validator rejects RS256 because it only accepts fixed HS256.
     */
    const rsaHeader = {
        alg: "RS256",
        typ: "JWT",
    };

    const rsaPayload = {
        sub: "attacker",
        role: "admin",
        exp: future,
    };

    const rsaHeaderPart = base64UrlEncode(JSON.stringify(rsaHeader));
    const rsaPayloadPart = base64UrlEncode(JSON.stringify(rsaPayload));
    const rsaSigningInput = `${rsaHeaderPart}.${rsaPayloadPart}`;

    const fakeRsaConfusionSignature = base64UrlEncode(
        hmacSha256(
            rsaSigningInput,
            Buffer.from("pretend-RSA-public-key", "utf8"),
        ),
    );

    const rsaConfusionToken =
        `${rsaSigningInput}.${fakeRsaConfusionSignature}`;

    printResult("RSA-to-HMAC key-confusion token", rsaConfusionToken);

    /*
     * Attack 3: kid injection.
     * The validator rejects kid instead of using it to select a file or key.
     */
    const kidInjectionToken = createRawToken(
        {
            alg: "HS256",
            typ: "JWT",
            kid: "../../attacker-controlled-key",
        },
        {
            sub: "attacker",
            role: "admin",
            exp: future,
        },
    );

    printResult("kid-injection token", kidInjectionToken);

    /*
     * Attack 4: Payload changes while keeping the original valid signature.
     */
    const tokenParts = validToken.split(".");
    const modifiedPayloadPart = base64UrlEncode(
        JSON.stringify({
            sub: "alice",
            role: "admin",
            exp: future,
        }),
    );

    const modifiedPayloadToken =
        `${tokenParts[0]}.${modifiedPayloadPart}.${tokenParts[2]}`;

    printResult("Modified-payload token", modifiedPayloadToken);

    /*
     * Attack 5: A correctly signed but expired JWT.
     */
    const expiredToken = createHs256Token(
        {
            alg: "HS256",
            typ: "JWT",
        },
        {
            sub: "alice",
            exp: Math.floor(Date.now() / 1000) - 60,
        },
        HMAC_SECRET,
    );

    printResult("Expired JWT", expiredToken);
}

runDemo();