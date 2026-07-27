import { performance } from "node:perf_hooks";



const KEY_BYTES = 32;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;

const MASK32 = 0xffffffff;
const POLY1305_MODULUS = (1n << 130n) - 5n;
const POLY1305_TAG_MODULUS = 1n << 128n;

function rotateLeft32(value, bits) {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function load32LE(bytes, offset) {
    return (
        bytes[offset]
        | (bytes[offset + 1] << 8)
        | (bytes[offset + 2] << 16)
        | (bytes[offset + 3] << 24)
    ) >>> 0;
}

function store32LE(value, output, offset) {
    output[offset] = value & 0xff;
    output[offset + 1] = (value >>> 8) & 0xff;
    output[offset + 2] = (value >>> 16) & 0xff;
    output[offset + 3] = (value >>> 24) & 0xff;
}

function leBytesToBigInt(bytes) {
    let value = 0n;

    for (let i = 0; i < bytes.length; i++) {
        value |= BigInt(bytes[i]) << BigInt(i * 8);
    }

    return value;
}

function bigIntToLeBytes(value, length) {
    const output = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        output[i] = Number((value >> BigInt(i * 8)) & 0xffn);
    }

    return output;
}

function concatBytes(...arrays) {
    let length = 0;

    for (const array of arrays) {
        length += array.length;
    }

    const output = new Uint8Array(length);
    let offset = 0;

    for (const array of arrays) {
        output.set(array, offset);
        offset += array.length;
    }

    return output;
}

function hexToBytes(text) {
    if (text.length % 2 !== 0) {
        throw new Error("Hex text length must be even");
    }

    const output = new Uint8Array(text.length / 2);

    for (let i = 0; i < output.length; i++) {
        const value = Number.parseInt(text.slice(i * 2, i * 2 + 2), 16);

        if (Number.isNaN(value)) {
            throw new Error("Invalid hexadecimal text");
        }

        output[i] = value;
    }

    return output;
}

function bytesToHex(bytes) {
    return Array.from(
        bytes,
        (value) => value.toString(16).padStart(2, "0"),
    ).join("");
}

function constantTimeEqual(first, second) {
    if (first.length !== second.length) {
        return false;
    }

    let difference = 0;

    for (let i = 0; i < first.length; i++) {
        difference |= first[i] ^ second[i];
    }

    return difference === 0;
}

function checkKeyAndNonce(key, nonce) {
    if (!(key instanceof Uint8Array) || key.length !== KEY_BYTES) {
        throw new TypeError("ChaCha20 key must be exactly 32 bytes");
    }

    if (!(nonce instanceof Uint8Array) || nonce.length !== NONCE_BYTES) {
        throw new TypeError("ChaCha20 nonce must be exactly 12 bytes");
    }
}

// ================================================================
// ChaCha20
// ================================================================

function quarterRound(state, a, b, c, d) {
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] = rotateLeft32(state[d] ^ state[a], 16);

    state[c] = (state[c] + state[d]) >>> 0;
    state[b] = rotateLeft32(state[b] ^ state[c], 12);

    state[a] = (state[a] + state[b]) >>> 0;
    state[d] = rotateLeft32(state[d] ^ state[a], 8);

    state[c] = (state[c] + state[d]) >>> 0;
    state[b] = rotateLeft32(state[b] ^ state[c], 7);
}

/*
 * RFC 8439 ChaCha20 block function.
 */
function chacha20Block(key, counter, nonce) {
    checkKeyAndNonce(key, nonce);

    const initial = new Uint32Array(16);

    initial[0] = 0x61707865;
    initial[1] = 0x3320646e;
    initial[2] = 0x79622d32;
    initial[3] = 0x6b206574;

    for (let i = 0; i < 8; i++) {
        initial[4 + i] = load32LE(key, i * 4);
    }

    initial[12] = counter >>> 0;
    initial[13] = load32LE(nonce, 0);
    initial[14] = load32LE(nonce, 4);
    initial[15] = load32LE(nonce, 8);

    const state = new Uint32Array(initial);

    for (let round = 0; round < 10; round++) {
        // Column rounds.
        quarterRound(state, 0, 4, 8, 12);
        quarterRound(state, 1, 5, 9, 13);
        quarterRound(state, 2, 6, 10, 14);
        quarterRound(state, 3, 7, 11, 15);

        // Diagonal rounds.
        quarterRound(state, 0, 5, 10, 15);
        quarterRound(state, 1, 6, 11, 12);
        quarterRound(state, 2, 7, 8, 13);
        quarterRound(state, 3, 4, 9, 14);
    }

    const output = new Uint8Array(64);

    for (let i = 0; i < 16; i++) {
        store32LE((state[i] + initial[i]) >>> 0, output, i * 4);
    }

    return output;
}

function chacha20Xor(key, nonce, initialCounter, input) {
    const output = new Uint8Array(input.length);
    let counter = initialCounter >>> 0;
    let offset = 0;

    while (offset < input.length) {
        const block = chacha20Block(key, counter, nonce);
        const count = Math.min(64, input.length - offset);

        for (let i = 0; i < count; i++) {
            output[offset + i] = input[offset + i] ^ block[i];
        }

        offset += count;
        counter = (counter + 1) >>> 0;

        if (counter === 0 && offset < input.length) {
            throw new Error("ChaCha20 counter exhausted");
        }
    }

    return output;
}

// ================================================================
// Poly1305 using BigInt
// ================================================================

function poly1305(message, oneTimeKey) {
    if (!(oneTimeKey instanceof Uint8Array) || oneTimeKey.length !== 32) {
        throw new TypeError("Poly1305 requires a 32-byte one-time key");
    }

    const rBytes = Uint8Array.from(oneTimeKey.slice(0, 16));

    // Poly1305 r clamping.
    rBytes[3] &= 15;
    rBytes[7] &= 15;
    rBytes[11] &= 15;
    rBytes[15] &= 15;

    rBytes[4] &= 252;
    rBytes[8] &= 252;
    rBytes[12] &= 252;

    const r = leBytesToBigInt(rBytes);
    const s = leBytesToBigInt(oneTimeKey.slice(16, 32));

    let accumulator = 0n;

    for (let offset = 0; offset < message.length; offset += 16) {
        const blockLength = Math.min(16, message.length - offset);
        const block = message.slice(offset, offset + blockLength);

        /*
         * Each Poly1305 block represents:
         * littleEndian(block) + 2^(8 * blockLength)
         */
        const blockValue =
            leBytesToBigInt(block) + (1n << BigInt(blockLength * 8));

        accumulator = ((accumulator + blockValue) * r) % POLY1305_MODULUS;
    }

    const tag = (accumulator + s) % POLY1305_TAG_MODULUS;

    return bigIntToLeBytes(tag, TAG_BYTES);
}

// ================================================================
// ChaCha20-Poly1305 AEAD
// ================================================================

function padTo16(length) {
    const remainder = length % 16;
    return remainder === 0 ? new Uint8Array() : new Uint8Array(16 - remainder);
}

function uint64LE(value) {
    const output = new Uint8Array(8);
    let current = BigInt(value);

    for (let i = 0; i < 8; i++) {
        output[i] = Number(current & 0xffn);
        current >>= 8n;
    }

    return output;
}

function buildMacData(aad, ciphertext) {
    return concatBytes(
        aad,
        padTo16(aad.length),
        ciphertext,
        padTo16(ciphertext.length),
        uint64LE(aad.length),
        uint64LE(ciphertext.length),
    );
}

/*
 * Returns ciphertext || 16-byte authentication tag.
 */
export function encrypt(key, nonce, aad = new Uint8Array(),
                        plaintext = new Uint8Array()) {
    checkKeyAndNonce(key, nonce);

    if (!(aad instanceof Uint8Array) || !(plaintext instanceof Uint8Array)) {
        throw new TypeError("AAD and plaintext must be Uint8Array values");
    }

    // Counter 0 creates the one-time Poly1305 key.
    const polyKey = chacha20Block(key, 0, nonce).slice(0, 32);

    // Counter 1 begins ChaCha20 message encryption.
    const ciphertext = chacha20Xor(key, nonce, 1, plaintext);

    const tag = poly1305(buildMacData(aad, ciphertext), polyKey);

    return concatBytes(ciphertext, tag);
}

/*
 * Verifies ciphertext || tag before returning plaintext.
 */
export function decrypt(key, nonce, aad = new Uint8Array(),
                        ciphertextAndTag) {
    checkKeyAndNonce(key, nonce);

    if (!(aad instanceof Uint8Array)
        || !(ciphertextAndTag instanceof Uint8Array)
        || ciphertextAndTag.length < TAG_BYTES) {
        throw new TypeError("Invalid AAD or ciphertext/tag input");
    }

    const ciphertextLength = ciphertextAndTag.length - TAG_BYTES;
    const ciphertext = ciphertextAndTag.slice(0, ciphertextLength);
    const suppliedTag = ciphertextAndTag.slice(ciphertextLength);

    const polyKey = chacha20Block(key, 0, nonce).slice(0, 32);
    const expectedTag = poly1305(buildMacData(aad, ciphertext), polyKey);

    if (!constantTimeEqual(expectedTag, suppliedTag)) {
        throw new Error("Authentication failed: invalid Poly1305 tag");
    }

    return chacha20Xor(key, nonce, 1, ciphertext);
}

// ================================================================
// RFC 8439 test and benchmark
// ================================================================

function require(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runRfc8439Test() {
    const key = hexToBytes(
        "808182838485868788898a8b8c8d8e8f"
        + "909192939495969798999a9b9c9d9e9f",
    );

    const nonce = hexToBytes("070000004041424344454647");
    const aad = hexToBytes("50515253c0c1c2c3c4c5c6c7");

    const plaintext = new TextEncoder().encode(
        "Ladies and Gentlemen of the class of '99: If I could offer you "
        + "only one tip for the future, sunscreen would be it.",
    );

    const expected = hexToBytes(
        "d31a8d34648e60db7b86afbc53ef7ec2"
        + "a4aded51296e08fea9e2b5a736ee62d6"
        + "3dbea45e8ca9671282fafb69da92728b"
        + "1a71de0a9e060b2905d6a5b67ecd3b36"
        + "92ddbd7f2d778b8c9803aee328091b58"
        + "fab324e4fad675945585808b4831d7bc"
        + "3ff4def08e4b7a9de576d26586cec64b"
        + "6116"
        + "1ae10b594f09e26a7e902ecbd0600691",
    );

    const actual = encrypt(key, nonce, aad, plaintext);

    require(
        constantTimeEqual(actual, expected),
        "RFC 8439 ChaCha20-Poly1305 known-answer test failed",
    );

    const recovered = decrypt(key, nonce, aad, actual);

    require(
        constantTimeEqual(recovered, plaintext),
        "RFC 8439 decryption test failed",
    );

    console.log("RFC 8439 ChaCha20-Poly1305 test passed.");
}

function runTamperTest() {
    const key = new Uint8Array(32);
    const nonce = new Uint8Array(12);
    const aad = new TextEncoder().encode("authenticated metadata");
    const message = new TextEncoder().encode("Pure Node.js AEAD test.");

    const sealed = encrypt(key, nonce, aad, message);
    const recovered = decrypt(key, nonce, aad, sealed);

    require(
        constantTimeEqual(recovered, message),
        "Round-trip encryption/decryption failed",
    );

    const modified = sealed.slice();
    modified[0] ^= 1;

    let rejected = false;

    try {
        decrypt(key, nonce, aad, modified);
    } catch {
        rejected = true;
    }

    require(rejected, "Modified ciphertext was accepted");

    console.log("Round-trip and tamper tests passed.");
}

function runBenchmark() {
    const key = new Uint8Array(32);
    const nonce = new Uint8Array(12);
    const aad = new TextEncoder().encode("benchmark metadata");
    const message = new Uint8Array(1024 * 1024);

    for (let i = 0; i < key.length; i++) {
        key[i] = i;
    }

    for (let i = 0; i < nonce.length; i++) {
        nonce[i] = i + 32;
    }

    for (let i = 0; i < message.length; i++) {
        message[i] = i & 0xff;
    }

    const start = performance.now();
    const sealed = encrypt(key, nonce, aad, message);
    const elapsedMilliseconds = performance.now() - start;

    const mebibytesPerSecond =
        (message.length / (1024 * 1024)) / (elapsedMilliseconds / 1000);

    console.log("Benchmark:");
    console.log(`  Input size : ${message.length} bytes`);
    console.log(`  Time       : ${elapsedMilliseconds.toFixed(2)} ms`);
    console.log(`  Throughput : ${mebibytesPerSecond.toFixed(2)} MiB/s`);

    sealed.fill(0);
    message.fill(0);
}

runRfc8439Test();
runTamperTest();
runBenchmark();