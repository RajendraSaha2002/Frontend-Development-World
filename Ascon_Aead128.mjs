import assert from "node:assert/strict";


const MASK64 = 0xffffffffffffffffn;
const RATE = 16;
const KEY_BYTES = 16;
const NONCE_BYTES = 16;
const TAG_BYTES = 16;

// NIST SP 800-232 Ascon-AEAD128 IV.
const IV = 0x00001000808c0001n;

function mask(value) {
    return value & MASK64;
}

function rotateRight64(value, distance) {
    const shift = BigInt(distance);
    return mask((value >> shift) | (value << (64n - shift)));
}

function load64LE(bytes, offset) {
    let value = 0n;

    for (let i = 0; i < 8; i++) {
        value |= BigInt(bytes[offset + i]) << BigInt(i * 8);
    }

    return value;
}

function store64LE(value, output, offset) {
    for (let i = 0; i < 8; i++) {
        output[offset + i] = Number((value >> BigInt(i * 8)) & 0xffn);
    }
}

function getByte(state, byteIndex) {
    const word = Math.floor(byteIndex / 8);
    const shift = BigInt((byteIndex % 8) * 8);
    return Number((state[word] >> shift) & 0xffn);
}

function setByte(state, byteIndex, value) {
    const word = Math.floor(byteIndex / 8);
    const shift = BigInt((byteIndex % 8) * 8);
    const byteMask = 0xffn << shift;

    state[word] = mask(
        (state[word] & ~byteMask) | (BigInt(value & 0xff) << shift),
    );
}

function xorByte(state, byteIndex, value) {
    const word = Math.floor(byteIndex / 8);
    const shift = BigInt((byteIndex % 8) * 8);

    state[word] = mask(
        state[word] ^ (BigInt(value & 0xff) << shift),
    );
}

/*
 * Ascon-p permutation.
 * rounds = 12 for initialization/finalization,
 * rounds = 8 for associated data and message processing.
 */
function permute(state, rounds) {
    let [x0, x1, x2, x3, x4] = state;
    const firstRound = 12 - rounds;

    for (let round = firstRound; round < 12; round++) {
        const roundConstant = BigInt(((0xf - round) << 4) | round);

        // Addition of round constant.
        x2 = mask(x2 ^ roundConstant);

        // Substitution layer.
        x0 = mask(x0 ^ x4);
        x4 = mask(x4 ^ x3);
        x2 = mask(x2 ^ x1);

        const t0 = mask((~x0) & x1);
        const t1 = mask((~x1) & x2);
        const t2 = mask((~x2) & x3);
        const t3 = mask((~x3) & x4);
        const t4 = mask((~x4) & x0);

        x0 = mask(x0 ^ t1);
        x1 = mask(x1 ^ t2);
        x2 = mask(x2 ^ t3);
        x3 = mask(x3 ^ t4);
        x4 = mask(x4 ^ t0);

        x1 = mask(x1 ^ x0);
        x0 = mask(x0 ^ x4);
        x3 = mask(x3 ^ x2);
        x2 = mask(~x2);

        // Linear diffusion layer.
        x0 = mask(x0 ^ rotateRight64(x0, 19) ^ rotateRight64(x0, 28));
        x1 = mask(x1 ^ rotateRight64(x1, 61) ^ rotateRight64(x1, 39));
        x2 = mask(x2 ^ rotateRight64(x2, 1) ^ rotateRight64(x2, 6));
        x3 = mask(x3 ^ rotateRight64(x3, 10) ^ rotateRight64(x3, 17));
        x4 = mask(x4 ^ rotateRight64(x4, 7) ^ rotateRight64(x4, 41));
    }

    return [x0, x1, x2, x3, x4];
}

function checkInputs(key, nonce) {
    if (!(key instanceof Uint8Array) || key.length !== KEY_BYTES) {
        throw new TypeError("Key must be a 16-byte Uint8Array");
    }

    if (!(nonce instanceof Uint8Array) || nonce.length !== NONCE_BYTES) {
        throw new TypeError("Nonce must be a 16-byte Uint8Array");
    }
}

function initialise(key, nonce) {
    const k0 = load64LE(key, 0);
    const k1 = load64LE(key, 8);
    const n0 = load64LE(nonce, 0);
    const n1 = load64LE(nonce, 8);

    let state = [IV, k0, k1, n0, n1];
    state = permute(state, 12);

    state[3] = mask(state[3] ^ k0);
    state[4] = mask(state[4] ^ k1);

    return state;
}

function absorbAssociatedData(state, associatedData) {
    let offset = 0;

    while (associatedData.length - offset >= RATE) {
        state[0] = mask(state[0] ^ load64LE(associatedData, offset));
        state[1] = mask(state[1] ^ load64LE(associatedData, offset + 8));

        state = permute(state, 8);
        offset += RATE;
    }

    const remaining = associatedData.length - offset;

    for (let i = 0; i < remaining; i++) {
        xorByte(state, i, associatedData[offset + i]);
    }

    // pad10*: append byte 0x01.
    xorByte(state, remaining, 0x01);

    state = permute(state, 8);

    // Domain separation between AD and plaintext.
    state[4] = mask(state[4] ^ 1n);

    return state;
}

/*
 * Returns ciphertext || 16-byte tag.
 */
export function encrypt(key, nonce, associatedData = new Uint8Array(),
                        plaintext = new Uint8Array()) {
    checkInputs(key, nonce);

    if (!(associatedData instanceof Uint8Array)) {
        throw new TypeError("Associated data must be a Uint8Array");
    }

    if (!(plaintext instanceof Uint8Array)) {
        throw new TypeError("Plaintext must be a Uint8Array");
    }

    let state = initialise(key, nonce);
    state = absorbAssociatedData(state, associatedData);

    const output = new Uint8Array(plaintext.length + TAG_BYTES);
    let offset = 0;

    // Complete 16-byte message blocks.
    while (plaintext.length - offset >= RATE) {
        state[0] = mask(state[0] ^ load64LE(plaintext, offset));
        state[1] = mask(state[1] ^ load64LE(plaintext, offset + 8));

        store64LE(state[0], output, offset);
        store64LE(state[1], output, offset + 8);

        state = permute(state, 8);
        offset += RATE;
    }

    // Final message block.
    const remaining = plaintext.length - offset;

    for (let i = 0; i < remaining; i++) {
        const ciphertextByte = plaintext[offset + i] ^ getByte(state, i);

        output[offset + i] = ciphertextByte;

        // State absorbs plaintext and now contains ciphertext.
        xorByte(state, i, plaintext[offset + i]);
    }

    xorByte(state, remaining, 0x01);

    // Finalization.
    const k0 = load64LE(key, 0);
    const k1 = load64LE(key, 8);

    state[2] = mask(state[2] ^ k0);
    state[3] = mask(state[3] ^ k1);
    state = permute(state, 12);
    state[3] = mask(state[3] ^ k0);
    state[4] = mask(state[4] ^ k1);

    store64LE(state[3], output, plaintext.length);
    store64LE(state[4], output, plaintext.length + 8);

    return output;
}

/*
 * Verifies ciphertext || tag and returns plaintext.
 * Throws if authentication fails.
 */
export function decrypt(key, nonce, associatedData = new Uint8Array(),
                        ciphertextAndTag) {
    checkInputs(key, nonce);

    if (!(associatedData instanceof Uint8Array)) {
        throw new TypeError("Associated data must be a Uint8Array");
    }

    if (!(ciphertextAndTag instanceof Uint8Array)
        || ciphertextAndTag.length < TAG_BYTES) {
        throw new TypeError("Ciphertext must contain at least a 16-byte tag");
    }

    const ciphertextLength = ciphertextAndTag.length - TAG_BYTES;
    const plaintext = new Uint8Array(ciphertextLength);

    let state = initialise(key, nonce);
    state = absorbAssociatedData(state, associatedData);

    let offset = 0;

    while (ciphertextLength - offset >= RATE) {
        const c0 = load64LE(ciphertextAndTag, offset);
        const c1 = load64LE(ciphertextAndTag, offset + 8);

        store64LE(mask(state[0] ^ c0), plaintext, offset);
        store64LE(mask(state[1] ^ c1), plaintext, offset + 8);

        state[0] = c0;
        state[1] = c1;

        state = permute(state, 8);
        offset += RATE;
    }

    const remaining = ciphertextLength - offset;

    for (let i = 0; i < remaining; i++) {
        const ciphertextByte = ciphertextAndTag[offset + i];

        plaintext[offset + i] = ciphertextByte ^ getByte(state, i);

        // During decryption, state must contain the ciphertext byte.
        setByte(state, i, ciphertextByte);
    }

    xorByte(state, remaining, 0x01);

    // Finalization and tag generation.
    const k0 = load64LE(key, 0);
    const k1 = load64LE(key, 8);

    state[2] = mask(state[2] ^ k0);
    state[3] = mask(state[3] ^ k1);
    state = permute(state, 12);
    state[3] = mask(state[3] ^ k0);
    state[4] = mask(state[4] ^ k1);

    const expectedTag = new Uint8Array(TAG_BYTES);

    store64LE(state[3], expectedTag, 0);
    store64LE(state[4], expectedTag, 8);

    const suppliedTag = ciphertextAndTag.slice(ciphertextLength);

    if (!constantTimeEqual(expectedTag, suppliedTag)) {
        plaintext.fill(0);
        throw new Error("Authentication failed: tag is invalid");
    }

    return plaintext;
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

function hex(text) {
    if (text.length % 2 !== 0) {
        throw new Error("Hex text must have an even length");
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

function toHex(bytes) {
    return Array.from(bytes, (value) =>
        value.toString(16).padStart(2, "0"),
    ).join("");
}

function runTests() {
    const encoder = new TextEncoder();

    const key = hex("000102030405060708090a0b0c0d0e0f");
    const nonce = hex("101112131415161718191a1b1c1d1e1f");
    const aad = encoder.encode("header=user=cyber");
    const message = encoder.encode("ASCON-AEAD128 in pure Node.js.");

    const sealed = encrypt(key, nonce, aad, message);
    const recovered = decrypt(key, nonce, aad, sealed);

    assert.deepEqual(recovered, message);

    const changedCiphertext = sealed.slice();
    changedCiphertext[0] ^= 0x01;

    assert.throws(
        () => decrypt(key, nonce, aad, changedCiphertext),
        /Authentication failed/,
    );

    const wrongAssociatedData = encoder.encode("header=user=attacker");

    assert.throws(
        () => decrypt(key, nonce, wrongAssociatedData, sealed),
        /Authentication failed/,
    );

    console.log("Ascon-AEAD128 self-tests passed.");
    console.log(`Ciphertext and tag: ${toHex(sealed)}`);
    console.log(`Recovered plaintext: ${new TextDecoder().decode(recovered)}`);
}

runTests();