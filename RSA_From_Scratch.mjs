import { randomBytes } from "node:crypto";



const ZERO = 0n;
const ONE = 1n;
const TWO = 2n;
const THREE = 3n;
const PUBLIC_EXPONENT = 65537n;

function bytesToBigInt(bytes) {
    if (bytes.length === 0) {
        return ZERO;
    }

    return BigInt(`0x${Buffer.from(bytes).toString("hex")}`);
}

function bigIntToFixedBytes(value, length) {
    if (value < ZERO) {
        throw new Error("Cannot convert a negative BigInt");
    }

    let hex = value.toString(16);

    if (hex.length % 2 !== 0) {
        hex = `0${hex}`;
    }

    const source = Buffer.from(hex, "hex");

    if (source.length > length) {
        throw new Error("Integer does not fit in requested byte length");
    }

    const output = Buffer.alloc(length);
    source.copy(output, length - source.length);

    return output;
}

function bitLength(value) {
    return value === ZERO ? 0 : value.toString(2).length;
}

function gcd(first, second) {
    let a = first < ZERO ? -first : first;
    let b = second < ZERO ? -second : second;

    while (b !== ZERO) {
        const remainder = a % b;
        a = b;
        b = remainder;
    }

    return a;
}

function modPow(base, exponent, modulus) {
    if (modulus <= ZERO) {
        throw new Error("Modulus must be positive");
    }

    let result = ONE;
    let factor = base % modulus;
    let power = exponent;

    while (power > ZERO) {
        if ((power & ONE) === ONE) {
            result = (result * factor) % modulus;
        }

        factor = (factor * factor) % modulus;
        power >>= ONE;
    }

    return result;
}

/*
 * Extended Euclidean algorithm.
 * Returns value^-1 mod modulus.
 */
function modInverse(value, modulus) {
    let oldR = value;
    let r = modulus;
    let oldS = ONE;
    let s = ZERO;

    while (r !== ZERO) {
        const quotient = oldR / r;

        [oldR, r] = [r, oldR - quotient * r];
        [oldS, s] = [s, oldS - quotient * s];
    }

    if (oldR !== ONE) {
        throw new Error("Modular inverse does not exist");
    }

    return ((oldS % modulus) + modulus) % modulus;
}

function randomBigInt(bits) {
    const byteLength = Math.ceil(bits / 8);
    const bytes = randomBytes(byteLength);

    const excessBits = byteLength * 8 - bits;

    if (excessBits > 0) {
        bytes[0] &= (0xff >>> excessBits);
    }

    bytes[0] |= 1 << (7 - excessBits);
    bytes[bytes.length - 1] |= 1;

    return bytesToBigInt(bytes);
}

function randomBelow(limit) {
    if (limit <= ZERO) {
        throw new Error("Limit must be positive");
    }

    const bits = bitLength(limit - ONE);

    while (true) {
        const byteLength = Math.ceil(bits / 8);
        const bytes = randomBytes(byteLength);
        const excessBits = byteLength * 8 - bits;

        if (excessBits > 0) {
            bytes[0] &= (0xff >>> excessBits);
        }

        const candidate = bytesToBigInt(bytes);

        if (candidate < limit) {
            return candidate;
        }
    }
}

function randomBetween(minimum, maximum) {
    if (minimum > maximum) {
        throw new Error("Invalid random range");
    }

    return minimum + randomBelow(maximum - minimum + ONE);
}

/*
 * Miller-Rabin probabilistic primality test.
 */
function isProbablePrime(n, rounds = 24) {
    if (n < TWO) {
        return false;
    }

    const smallPrimes = [
        2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n,
    ];

    for (const prime of smallPrimes) {
        if (n === prime) {
            return true;
        }

        if (n % prime === ZERO) {
            return false;
        }
    }

    let d = n - ONE;
    let s = 0;

    while ((d & ONE) === ZERO) {
        d >>= ONE;
        s++;
    }

    for (let round = 0; round < rounds; round++) {
        const a = randomBetween(TWO, n - TWO);
        let x = modPow(a, d, n);

        if (x === ONE || x === n - ONE) {
            continue;
        }

        let passed = false;

        for (let r = 1; r < s; r++) {
            x = (x * x) % n;

            if (x === n - ONE) {
                passed = true;
                break;
            }
        }

        if (!passed) {
            return false;
        }
    }

    return true;
}

function generatePrime(bits) {
    while (true) {
        const candidate = randomBigInt(bits);

        if (isProbablePrime(candidate)) {
            return candidate;
        }
    }
}

function generateKeyPair(modulusBits = 1024) {
    if (modulusBits < 1024 || modulusBits % 2 !== 0) {
        throw new Error("Use an even RSA modulus of at least 1024 bits");
    }

    const primeBits = modulusBits / 2;

    while (true) {
        const p = generatePrime(primeBits);
        let q;

        do {
            q = generatePrime(primeBits);
        } while (q === p);

        const n = p * q;

        if (bitLength(n) !== modulusBits) {
            continue;
        }

        const phi = (p - ONE) * (q - ONE);

        if (gcd(PUBLIC_EXPONENT, phi) !== ONE) {
            continue;
        }

        const d = modInverse(PUBLIC_EXPONENT, phi);

        return {
            publicKey: { n, e: PUBLIC_EXPONENT },
            privateKey: { n, d },
        };
    }
}

// ================================================================
// Textbook RSA primitives
// ================================================================

function textbookEncrypt(message, publicKey) {
    if (message < ZERO || message >= publicKey.n) {
        throw new Error("RSA message representative is outside valid range");
    }

    return modPow(message, publicKey.e, publicKey.n);
}

function textbookDecrypt(ciphertext, privateKey) {
    if (ciphertext < ZERO || ciphertext >= privateKey.n) {
        throw new Error("RSA ciphertext representative is outside valid range");
    }

    return modPow(ciphertext, privateKey.d, privateKey.n);
}

// ================================================================
// RSAES-PKCS1-v1_5 encryption
// Encoded block: 00 || 02 || random nonzero padding || 00 || message
// ================================================================

function modulusByteLength(modulus) {
    return Math.ceil(bitLength(modulus) / 8);
}

function pkcs1v15Encode(message, blockLength) {
    if (!Buffer.isBuffer(message) && !(message instanceof Uint8Array)) {
        throw new TypeError("Message must be bytes");
    }

    if (message.length > blockLength - 11) {
        throw new Error("Message is too long for RSA PKCS#1 v1.5");
    }

    const paddingLength = blockLength - message.length - 3;
    const encoded = Buffer.alloc(blockLength);

    encoded[0] = 0x00;
    encoded[1] = 0x02;

    let offset = 2;

    while (offset < 2 + paddingLength) {
        const random = randomBytes(1)[0];

        if (random !== 0x00) {
            encoded[offset++] = random;
        }
    }

    encoded[offset++] = 0x00;
    Buffer.from(message).copy(encoded, offset);

    return encoded;
}

function pkcs1v15Decode(encoded) {
    if (encoded.length < 11 || encoded[0] !== 0x00 || encoded[1] !== 0x02) {
        throw new Error("Invalid PKCS#1 v1.5 block");
    }

    let separator = -1;

    for (let i = 2; i < encoded.length; i++) {
        if (encoded[i] === 0x00) {
            separator = i;
            break;
        }
    }

    if (separator < 10) {
        throw new Error("Invalid PKCS#1 v1.5 padding");
    }

    return Buffer.from(encoded.slice(separator + 1));
}

function encryptPkcs1v15(message, publicKey) {
    const blockLength = modulusByteLength(publicKey.n);
    const encoded = pkcs1v15Encode(message, blockLength);
    const ciphertext = textbookEncrypt(bytesToBigInt(encoded), publicKey);

    return bigIntToFixedBytes(ciphertext, blockLength);
}

function decryptPkcs1v15(ciphertext, privateKey) {
    const blockLength = modulusByteLength(privateKey.n);

    if (ciphertext.length !== blockLength) {
        throw new Error("Incorrect ciphertext length");
    }

    const plaintextInteger = textbookDecrypt(
        bytesToBigInt(ciphertext),
        privateKey,
    );

    const encoded = bigIntToFixedBytes(plaintextInteger, blockLength);

    return pkcs1v15Decode(encoded);
}

// ================================================================
// Attack demonstrations
// ================================================================

function demonstrateTextbookRsaAttack(keys) {
    const originalMessage = 42n;
    const ciphertext = textbookEncrypt(originalMessage, keys.publicKey);

    /*
     * c' = c * r^e mod n
     * RSA oracle returns m' = m * r mod n
     * attacker recovers m = m' * r^-1 mod n
     */
    const r = TWO;

    const changedCiphertext =
        (ciphertext * modPow(r, keys.publicKey.e, keys.publicKey.n))
        % keys.publicKey.n;

    const oracleResponse = textbookDecrypt(
        changedCiphertext,
        keys.privateKey,
    );

    const recoveredMessage =
        (oracleResponse * modInverse(r, keys.publicKey.n))
        % keys.publicKey.n;

    require(
        recoveredMessage === originalMessage,
        "Textbook RSA chosen-ciphertext demonstration failed",
    );

    console.log("Textbook RSA chosen-ciphertext attack:");
    console.log(`  Original integer message: ${originalMessage}`);
    console.log(`  Recovered integer message: ${recoveredMessage}`);
    console.log("  Result: textbook RSA is malleable and unsafe.");
    console.log();
}

function demonstratePaddingProtection(keys) {
    const message = Buffer.from("Confidential message", "utf8");
    const blockLength = modulusByteLength(keys.publicKey.n);

    const padded = pkcs1v15Encode(message, blockLength);
    const paddedInteger = bytesToBigInt(padded);
    const ciphertext = textbookEncrypt(paddedInteger, keys.publicKey);

    let rejected = false;

    for (let r = TWO; r < 100n; r++) {
        if (gcd(r, keys.publicKey.n) !== ONE) {
            continue;
        }

        const changedCiphertext =
            (ciphertext * modPow(r, keys.publicKey.e, keys.publicKey.n))
            % keys.publicKey.n;

        const changedPlaintext = textbookDecrypt(
            changedCiphertext,
            keys.privateKey,
        );

        try {
            pkcs1v15Decode(bigIntToFixedBytes(changedPlaintext, blockLength));
        } catch {
            rejected = true;
            break;
        }
    }

    require(rejected, "Expected modified padded ciphertext to be rejected");

    console.log("PKCS#1 v1.5 padding demonstration:");
    console.log("  Modified ciphertext produced an invalid padding block.");
    console.log("  The simple textbook-RSA recovery attack is blocked.");
    console.log(
        "  Note: PKCS#1 v1.5 is legacy; production systems should use RSA-OAEP.",
    );
    console.log();
}

// ================================================================
// Utilities and demo
// ================================================================

function require(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runDemo() {
    console.log("Generating 1024-bit RSA key pair...");
    const keys = generateKeyPair(1024);

    console.log("Key pair created.");
    console.log(`Modulus bits: ${bitLength(keys.publicKey.n)}`);
    console.log();

    const message = Buffer.from("Hello from pure BigInt RSA.", "utf8");

    const ciphertext = encryptPkcs1v15(message, keys.publicKey);
    const recovered = decryptPkcs1v15(ciphertext, keys.privateKey);

    require(
        Buffer.compare(message, recovered) === 0,
        "PKCS#1 v1.5 encryption/decryption test failed",
    );

    console.log(`Plaintext : ${message.toString("utf8")}`);
    console.log(`Ciphertext: ${ciphertext.toString("hex")}`);
    console.log(`Recovered : ${recovered.toString("utf8")}`);
    console.log();

    demonstrateTextbookRsaAttack(keys);
    demonstratePaddingProtection(keys);
}

runDemo();