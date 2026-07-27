import { createHash, randomBytes } from "node:crypto";



class GF256 {
    static LOG = new Uint16Array(256);
    static EXP = new Uint16Array(512);

    static {
        let value = 1;

        /*
         * Primitive polynomial:
         * x^8 + x^4 + x^3 + x^2 + 1 = 0x11D
         */
        for (let i = 0; i < 255; i++) {
            GF256.EXP[i] = value;
            GF256.LOG[value] = i;

            value <<= 1;

            if ((value & 0x100) !== 0) {
                value ^= 0x11d;
            }
        }

        // Duplicate values to avoid modulus 255 during multiplication.
        for (let i = 255; i < 512; i++) {
            GF256.EXP[i] = GF256.EXP[i - 255];
        }
    }

    static multiply(a, b) {
        if (a === 0 || b === 0) {
            return 0;
        }

        return GF256.EXP[GF256.LOG[a] + GF256.LOG[b]];
    }

    static divide(a, b) {
        if (b === 0) {
            throw new Error("Division by zero in GF(256)");
        }

        if (a === 0) {
            return 0;
        }

        let exponent = GF256.LOG[a] - GF256.LOG[b];

        if (exponent < 0) {
            exponent += 255;
        }

        return GF256.EXP[exponent];
    }
}

/*
 * A share consists of:
 * - x: nonzero finite-field coordinate, 1 to 255
 * - y: byte array holding f(x) for every secret byte
 */
function createShare(x, y) {
    return {
        x,
        y: Buffer.from(y),
    };
}

function evaluatePolynomial(coefficients, x) {
    let result = coefficients[coefficients.length - 1];

    // Horner's rule in GF(256).
    for (let i = coefficients.length - 2; i >= 0; i--) {
        result = GF256.multiply(result, x) ^ coefficients[i];
    }

    return result;
}

/*
 * Split a byte secret into n shares, requiring k shares to reconstruct.
 */
function splitSecret(secret, threshold, shareCount) {
    if (!Buffer.isBuffer(secret) && !(secret instanceof Uint8Array)) {
        throw new TypeError("Secret must be bytes");
    }

    if (secret.length === 0) {
        throw new Error("Secret cannot be empty");
    }

    if (threshold < 2 || threshold > shareCount || shareCount > 255) {
        throw new Error("Require 2 <= threshold <= shareCount <= 255");
    }

    const shares = [];

    for (let i = 0; i < shareCount; i++) {
        shares.push(createShare(i + 1, Buffer.alloc(secret.length)));
    }

    /*
     * Each secret byte becomes the constant term of a random polynomial:
     *
     * f(x) = secretByte + a1*x + a2*x^2 + ... + a(k-1)*x^(k-1)
     */
    for (let byteIndex = 0; byteIndex < secret.length; byteIndex++) {
        const coefficients = new Uint8Array(threshold);

        coefficients[0] = secret[byteIndex];

        if (threshold > 1) {
            coefficients.set(randomBytes(threshold - 1), 1);
        }

        for (const share of shares) {
            share.y[byteIndex] = evaluatePolynomial(coefficients, share.x);
        }
    }

    return shares;
}

/*
 * Reconstructs the original secret with Lagrange interpolation at x = 0.
 */
function reconstructSecret(selectedShares, threshold) {
    if (!Array.isArray(selectedShares) || selectedShares.length < threshold) {
        throw new Error("At least threshold shares are required");
    }

    const secretLength = selectedShares[0].y.length;
    const usedShares = selectedShares.slice(0, threshold);

    validateShares(usedShares, secretLength);

    const secret = Buffer.alloc(secretLength);

    /*
     * f(0) = sum(yi * product(xj / (xi XOR xj)))
     *
     * In GF(256), addition and subtraction are both XOR.
     */
    for (let byteIndex = 0; byteIndex < secretLength; byteIndex++) {
        let value = 0;

        for (let i = 0; i < usedShares.length; i++) {
            const xi = usedShares[i].x;
            const yi = usedShares[i].y[byteIndex];

            let numerator = 1;
            let denominator = 1;

            for (let j = 0; j < usedShares.length; j++) {
                if (i === j) {
                    continue;
                }

                const xj = usedShares[j].x;

                numerator = GF256.multiply(numerator, xj);
                denominator = GF256.multiply(denominator, xi ^ xj);
            }

            const basis = GF256.divide(numerator, denominator);
            value ^= GF256.multiply(yi, basis);
        }

        secret[byteIndex] = value;
    }

    return secret;
}

function validateShares(shares, expectedLength) {
    const seenX = new Set();

    for (const share of shares) {
        if (!share || !Number.isInteger(share.x)
            || share.x < 1 || share.x > 255) {
            throw new Error("Invalid share x coordinate");
        }

        if (!Buffer.isBuffer(share.y) || share.y.length !== expectedLength) {
            throw new Error("Invalid share data");
        }

        if (seenX.has(share.x)) {
            throw new Error("Duplicate x coordinate in shares");
        }

        seenX.add(share.x);
    }
}

/*
 * Commitment = SHA-256(x || y).
 *
 * Store the expected commitment separately in a trusted location.
 * A plain hash detects corruption only when its expected value is trusted.
 */
function commitmentForShare(share) {
    const input = Buffer.concat([
        Buffer.from([share.x]),
        share.y,
    ]);

    return createHash("sha256").update(input).digest("hex");
}

function verifyShare(share, expectedCommitment) {
    const actual = commitmentForShare(share);

    if (actual.length !== expectedCommitment.length) {
        return false;
    }

    let difference = 0;

    for (let i = 0; i < actual.length; i++) {
        difference |= actual.charCodeAt(i)
            ^ expectedCommitment.charCodeAt(i);
    }

    return difference === 0;
}

function copyShare(share) {
    return createShare(share.x, share.y);
}

function require(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// ================================================================
// Console demonstration
// ================================================================

function runDemo() {
    const secret = Buffer.from(
        "0123456789abcdef0123456789abcdef",
        "utf8",
    );

    const threshold = 3;
    const shareCount = 5;

    console.log("Shamir Secret Sharing over GF(256)");
    console.log(`Secret: ${secret.toString("utf8")}`);
    console.log(`Creating ${shareCount} shares; threshold k=${threshold}.\n`);

    const shares = splitSecret(secret, threshold, shareCount);
    const commitments = new Map();

    for (const share of shares) {
        commitments.set(share.x, commitmentForShare(share));

        console.log(`Share ${share.x}`);
        console.log(`  Data       : ${share.y.toString("hex")}`);
        console.log(`  Commitment : ${commitments.get(share.x)}`);
        console.log(
            `  Valid      : ${verifyShare(share, commitments.get(share.x))}`,
        );
    }

    const selected = [
        shares[0],
        shares[2],
        shares[4],
    ];

    for (const share of selected) {
        require(
            verifyShare(share, commitments.get(share.x)),
            `Share ${share.x} failed commitment verification`,
        );
    }

    const reconstructed = reconstructSecret(selected, threshold);

    require(
        reconstructed.equals(secret),
        "Secret reconstruction failed",
    );

    console.log("\nReconstruction using shares 1, 3, and 5:");
    console.log(`Reconstructed secret: ${reconstructed.toString("utf8")}`);
    console.log(`Correct: ${reconstructed.equals(secret)}`);

    const corrupted = copyShare(shares[1]);
    corrupted.y[0] ^= 0x01;

    console.log("\nCorruption detection:");
    console.log(
        `Original share valid : ${
            verifyShare(shares[1], commitments.get(shares[1].x))
        }`,
    );

    console.log(
        `Modified share valid : ${
            verifyShare(corrupted, commitments.get(corrupted.x))
        }`,
    );

    require(
        !verifyShare(corrupted, commitments.get(corrupted.x)),
        "Corrupted share was incorrectly accepted",
    );

    console.log("Corrupted share correctly rejected.");
}

runDemo();