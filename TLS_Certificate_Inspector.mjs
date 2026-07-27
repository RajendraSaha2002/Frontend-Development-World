import tls from "node:tls";



const SIGNATURE_ALGORITHMS = {
    "1.2.840.113549.1.1.4": "md5WithRSAEncryption",
    "1.2.840.113549.1.1.5": "sha1WithRSAEncryption",
    "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
    "1.2.840.113549.1.1.12": "sha384WithRSAEncryption",
    "1.2.840.113549.1.1.13": "sha512WithRSAEncryption",
    "1.2.840.10045.4.1": "ecdsa-with-SHA1",
    "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
    "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
    "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
    "1.3.101.112": "Ed25519",
    "1.3.101.113": "Ed448",
};

function parsePort(text) {
    const port = Number.parseInt(text, 10);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("Port must be from 1 to 65535");
    }

    return port;
}

function connectTls(host, port) {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({
            host,
            port,
            servername: host,
            rejectUnauthorized: true,
        });

        const timer = setTimeout(() => {
            socket.destroy();
            reject(new Error("Connection timed out"));
        }, 10000);

        socket.once("secureConnect", () => {
            clearTimeout(timer);

            const certificate = socket.getPeerCertificate(true);

            const result = {
                authorized: socket.authorized,
                authorizationError: socket.authorizationError,
                protocol: socket.getProtocol(),
                cipher: socket.getCipher(),
                certificate,
            };

            socket.end();
            resolve(result);
        });

        socket.once("error", (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}

/*
 * getPeerCertificate(true) returns the leaf with issuerCertificate links.
 */
function extractCertificateChain(leafCertificate) {
    const chain = [];
    const fingerprints = new Set();

    let current = leafCertificate;

    while (current && current.raw && current.fingerprint256) {
        if (fingerprints.has(current.fingerprint256)) {
            break;
        }

        chain.push(current);
        fingerprints.add(current.fingerprint256);

        if (!current.issuerCertificate) {
            break;
        }

        current = current.issuerCertificate;
    }

    return chain;
}

function objectToText(object) {
    if (!object || Object.keys(object).length === 0) {
        return "(not available)";
    }

    return Object.entries(object)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
}

function sameIdentity(first, second) {
    return objectToText(first) === objectToText(second);
}

function isExpired(certificate) {
    const now = Date.now();
    const validFrom = Date.parse(certificate.valid_from);
    const validTo = Date.parse(certificate.valid_to);

    return Number.isNaN(validFrom)
        || Number.isNaN(validTo)
        || now < validFrom
        || now > validTo;
}

function isNotYetValid(certificate) {
    const validFrom = Date.parse(certificate.valid_from);
    return !Number.isNaN(validFrom) && Date.now() < validFrom;
}

function isSelfSigned(certificate) {
    return sameIdentity(certificate.subject, certificate.issuer);
}

/*
 * Reads one DER TLV object.
 */
function readDerTlv(bytes, offset) {
    if (offset >= bytes.length) {
        throw new Error("Invalid DER offset");
    }

    const tag = bytes[offset];
    const firstLengthByte = bytes[offset + 1];

    let length = 0;
    let lengthBytes = 1;

    if ((firstLengthByte & 0x80) === 0) {
        length = firstLengthByte;
    } else {
        const count = firstLengthByte & 0x7f;

        if (count === 0 || count > 4) {
            throw new Error("Unsupported DER length encoding");
        }

        lengthBytes += count;

        for (let i = 0; i < count; i++) {
            length = (length << 8) | bytes[offset + 2 + i];
        }
    }

    const headerLength = 1 + lengthBytes;
    const valueStart = offset + headerLength;
    const nextOffset = valueStart + length;

    if (nextOffset > bytes.length) {
        throw new Error("Invalid DER object length");
    }

    return {
        tag,
        valueStart,
        length,
        nextOffset,
    };
}

function decodeOid(bytes, start, length) {
    const end = start + length;
    const first = bytes[start];

    const parts = [
        Math.floor(first / 40),
        first % 40,
    ];

    let value = 0;

    for (let i = start + 1; i < end; i++) {
        value = (value << 7) | (bytes[i] & 0x7f);

        if ((bytes[i] & 0x80) === 0) {
            parts.push(value);
            value = 0;
        }
    }

    return parts.join(".");
}

/*
 * Certificate ::= SEQUENCE {
 *   tbsCertificate,
 *   signatureAlgorithm,
 *   signatureValue
 * }
 */
function signatureAlgorithmFromRawCertificate(raw) {
    try {
        const outer = readDerTlv(raw, 0);

        if (outer.tag !== 0x30) {
            return "Unknown";
        }

        const tbsCertificate = readDerTlv(raw, outer.valueStart);
        const algorithmSequence = readDerTlv(raw, tbsCertificate.nextOffset);

        if (algorithmSequence.tag !== 0x30) {
            return "Unknown";
        }

        const oid = readDerTlv(raw, algorithmSequence.valueStart);

        if (oid.tag !== 0x06) {
            return "Unknown";
        }

        const oidText = decodeOid(raw, oid.valueStart, oid.length);

        return SIGNATURE_ALGORITHMS[oidText]
            ? `${SIGNATURE_ALGORITHMS[oidText]} (${oidText})`
            : `Unknown OID (${oidText})`;
    } catch {
        return "Unavailable";
    }
}

function keyDescription(certificate) {
    const keyType = certificate.asymmetricKeyType || "Unknown";
    const bits = certificate.bits || "Unknown";

    return `${keyType}, ${bits} bits`;
}

function weakKeyWarning(certificate) {
    const type = String(certificate.asymmetricKeyType || "").toLowerCase();
    const bits = Number(certificate.bits);

    return type === "rsa" && Number.isFinite(bits) && bits < 2048;
}

function weakSignatureWarning(signatureAlgorithm) {
    const lower = signatureAlgorithm.toLowerCase();

    return lower.includes("md5") || lower.includes("sha1");
}

function printCertificate(certificate, position, total) {
    const signatureAlgorithm =
        signatureAlgorithmFromRawCertificate(certificate.raw);

    console.log("============================================================");
    console.log(`Certificate ${position + 1} of ${total}`);
    console.log(`Subject          : ${objectToText(certificate.subject)}`);
    console.log(`Issuer           : ${objectToText(certificate.issuer)}`);
    console.log(`Serial number    : ${certificate.serialNumber || "Unknown"}`);
    console.log(`Valid from       : ${certificate.valid_from || "Unknown"}`);
    console.log(`Valid until      : ${certificate.valid_to || "Unknown"}`);
    console.log(`Subject Alt Name : ${certificate.subjectaltname || "Not specified"}`);
    console.log(`Public key       : ${keyDescription(certificate)}`);
    console.log(`Signature alg.   : ${signatureAlgorithm}`);
    console.log(`SHA-256 finger.  : ${certificate.fingerprint256 || "Unknown"}`);
    console.log(`CA certificate  : ${certificate.ca === true}`);

    if (isExpired(certificate)) {
        console.log("WARNING          : Certificate is expired or not currently valid");
    }

    if (isNotYetValid(certificate)) {
        console.log("WARNING          : Certificate is not yet valid");
    }

    if (weakKeyWarning(certificate)) {
        console.log("WARNING          : Weak RSA key: below 2048 bits");
    }

    if (weakSignatureWarning(signatureAlgorithm)) {
        console.log("WARNING          : Weak signature algorithm");
    }

    if (isSelfSigned(certificate) && position === total - 1) {
        console.log("INFO             : Self-signed root certificate");
    }

    console.log();
}

async function main() {
    const host = process.argv[2] ?? "example.com";
    const port = parsePort(process.argv[3] ?? "443");

    console.log("TLS certificate chain inspector");
    console.log(`Target: ${host}:${port}`);
    console.log();

    try {
        const result = await connectTls(host, port);

        console.log("TLS validation: PASSED");
        console.log(`Authorized     : ${result.authorized}`);
        console.log(`Protocol       : ${result.protocol}`);
        console.log(`Cipher         : ${result.cipher.name}`);
        console.log();

        const chain = extractCertificateChain(result.certificate);

        if (chain.length === 0) {
            throw new Error("Server did not provide an X.509 certificate chain");
        }

        for (let i = 0; i < chain.length; i++) {
            printCertificate(chain[i], i, chain.length);
        }
    } catch (error) {
        console.log("TLS validation: FAILED");
        console.log(`Reason: ${error.message}`);
        process.exitCode = 1;
    }
}

main();