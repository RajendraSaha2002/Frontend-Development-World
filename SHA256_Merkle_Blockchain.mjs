
const encoder = new TextEncoder();

function rotateRight(value, bits) {
    return (value >>> bits) | (value << (32 - bits));
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

function bytesToHex(bytes) {
    return Array.from(
        bytes,
        (value) => value.toString(16).padStart(2, "0"),
    ).join("");
}

function equalBytes(first, second) {
    if (first.length !== second.length) {
        return false;
    }

    let difference = 0;

    for (let i = 0; i < first.length; i++) {
        difference |= first[i] ^ second[i];
    }

    return difference === 0;
}

// ================================================================
// SHA-256 from scratch using Uint32Array
// ================================================================

function sha256(message) {
    if (!(message instanceof Uint8Array)) {
        throw new TypeError("SHA-256 input must be a Uint8Array");
    }

    const bitLength = BigInt(message.length) * 8n;
    const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);

    padded.set(message);
    padded[message.length] = 0x80;

    for (let i = 0; i < 8; i++) {
        padded[padded.length - 1 - i] =
            Number((bitLength >> BigInt(i * 8)) & 0xffn);
    }

    const hash = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ]);

    const constants = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ]);

    const words = new Uint32Array(64);

    for (let offset = 0; offset < padded.length; offset += 64) {
        for (let i = 0; i < 16; i++) {
            const position = offset + i * 4;

            words[i] = (
                (padded[position] << 24)
                | (padded[position + 1] << 16)
                | (padded[position + 2] << 8)
                | padded[position + 3]
            ) >>> 0;
        }

        for (let i = 16; i < 64; i++) {
            const smallSigma0 =
                rotateRight(words[i - 15], 7)
                ^ rotateRight(words[i - 15], 18)
                ^ (words[i - 15] >>> 3);

            const smallSigma1 =
                rotateRight(words[i - 2], 17)
                ^ rotateRight(words[i - 2], 19)
                ^ (words[i - 2] >>> 10);

            words[i] = (
                words[i - 16]
                + smallSigma0
                + words[i - 7]
                + smallSigma1
            ) >>> 0;
        }

        let a = hash[0];
        let b = hash[1];
        let c = hash[2];
        let d = hash[3];
        let e = hash[4];
        let f = hash[5];
        let g = hash[6];
        let h = hash[7];

        for (let i = 0; i < 64; i++) {
            const sigma1 =
                rotateRight(e, 6)
                ^ rotateRight(e, 11)
                ^ rotateRight(e, 25);

            const choice = (e & f) ^ (~e & g);

            const temp1 = (
                h + sigma1 + choice + constants[i] + words[i]
            ) >>> 0;

            const sigma0 =
                rotateRight(a, 2)
                ^ rotateRight(a, 13)
                ^ rotateRight(a, 22);

            const majority = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (sigma0 + majority) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        hash[0] = (hash[0] + a) >>> 0;
        hash[1] = (hash[1] + b) >>> 0;
        hash[2] = (hash[2] + c) >>> 0;
        hash[3] = (hash[3] + d) >>> 0;
        hash[4] = (hash[4] + e) >>> 0;
        hash[5] = (hash[5] + f) >>> 0;
        hash[6] = (hash[6] + g) >>> 0;
        hash[7] = (hash[7] + h) >>> 0;
    }

    const output = new Uint8Array(32);

    for (let i = 0; i < 8; i++) {
        output[i * 4] = hash[i] >>> 24;
        output[i * 4 + 1] = hash[i] >>> 16;
        output[i * 4 + 2] = hash[i] >>> 8;
        output[i * 4 + 3] = hash[i];
    }

    return output;
}

// ================================================================
// Merkle tree with O(log N) inclusion proofs
// ================================================================

class MerkleTree {
    constructor(transactions) {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            throw new Error("Merkle tree requires at least one transaction");
        }

        this.levels = [];
        this.levels.push(
            transactions.map((transaction) => sha256(encoder.encode(transaction))),
        );

        while (this.levels[this.levels.length - 1].length > 1) {
            const current = this.levels[this.levels.length - 1];
            const next = [];

            for (let i = 0; i < current.length; i += 2) {
                const left = current[i];
                const right = i + 1 < current.length ? current[i + 1] : left;

                next.push(sha256(concatBytes(left, right)));
            }

            this.levels.push(next);
        }
    }

    get root() {
        return this.levels[this.levels.length - 1][0];
    }

    createProof(transactionIndex) {
        if (transactionIndex < 0 || transactionIndex >= this.levels[0].length) {
            throw new Error("Invalid transaction index");
        }

        const proof = [];
        let index = transactionIndex;

        for (let level = 0; level < this.levels.length - 1; level++) {
            const nodes = this.levels[level];
            let siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

            if (siblingIndex >= nodes.length) {
                siblingIndex = index;
            }

            proof.push({
                sibling: nodes[siblingIndex],
                siblingOnLeft: index % 2 === 1,
            });

            index = Math.floor(index / 2);
        }

        return proof;
    }

    static verifyProof(transaction, proof, expectedRoot) {
        let current = sha256(encoder.encode(transaction));

        for (const step of proof) {
            current = step.siblingOnLeft
                ? sha256(concatBytes(step.sibling, current))
                : sha256(concatBytes(current, step.sibling));
        }

        return equalBytes(current, expectedRoot);
    }
}

// ================================================================
// Mini blockchain with BigInt proof-of-work
// ================================================================

class Block {
    constructor(index, previousHash, transactions, difficultyBits) {
        this.index = index;
        this.previousHash = previousHash;
        this.transactions = [...transactions];
        this.merkleRoot = bytesToHex(new MerkleTree(this.transactions).root);
        this.timestamp = Date.now();
        this.nonce = 0n;
        this.hash = "";
        this.difficultyBits = difficultyBits;
    }

    calculateHash() {
        const header = [
            this.index,
            this.previousHash,
            this.merkleRoot,
            this.timestamp,
            this.nonce.toString(),
        ].join("|");

        return bytesToHex(sha256(encoder.encode(header)));
    }

    mine() {
        const target = 1n << BigInt(256 - this.difficultyBits);
        let attempts = 0;

        console.log(`Mining block ${this.index}...`);

        while (true) {
            this.hash = this.calculateHash();
            attempts++;

            if (BigInt(`0x${this.hash}`) < target) {
                console.log(
                    `Block ${this.index} mined: nonce=${this.nonce}, attempts=${attempts}`,
                );
                console.log(`Hash: ${this.hash}`);
                return;
            }

            this.nonce++;

            if (attempts % 10000 === 0) {
                process.stdout.write(
                    `\rMining block ${this.index}: ${attempts} attempts`,
                );
            }
        }
    }
}

class Blockchain {
    constructor(difficultyBits = 14) {
        if (difficultyBits < 1 || difficultyBits > 248) {
            throw new Error("Difficulty must be between 1 and 248 bits");
        }

        this.difficultyBits = difficultyBits;
        this.blocks = [];
    }

    addBlock(transactions) {
        const previousHash = this.blocks.length === 0
            ? "0".repeat(64)
            : this.blocks[this.blocks.length - 1].hash;

        const block = new Block(
            this.blocks.length,
            previousHash,
            transactions,
            this.difficultyBits,
        );

        block.mine();
        this.blocks.push(block);
    }

    isValid() {
        const target = 1n << BigInt(256 - this.difficultyBits);

        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];

            const expectedPreviousHash = i === 0
                ? "0".repeat(64)
                : this.blocks[i - 1].hash;

            if (block.previousHash !== expectedPreviousHash) {
                return false;
            }

            const expectedMerkleRoot =
                bytesToHex(new MerkleTree(block.transactions).root);

            if (block.merkleRoot !== expectedMerkleRoot) {
                return false;
            }

            if (block.hash !== block.calculateHash()) {
                return false;
            }

            if (BigInt(`0x${block.hash}`) >= target) {
                return false;
            }
        }

        return true;
    }
}

// ================================================================
// Tests and demonstration
// ================================================================

function require(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runTests() {
    const expectedSha256OfAbc =
        "ba7816bf8f01cfea414140de5dae2223"
        + "b00361a396177a9cb410ff61f20015ad";

    const actualSha256OfAbc = bytesToHex(sha256(encoder.encode("abc")));

    require(
        actualSha256OfAbc === expectedSha256OfAbc,
        "SHA-256 known-answer test failed",
    );

    const transactions = [
        "Alice pays Bob 10",
        "Bob pays Carol 4",
        "Carol pays Dave 2",
        "Dave pays Eve 1",
        "Eve pays Frank 7",
    ];

    const tree = new MerkleTree(transactions);
    const proof = tree.createProof(2);

    require(
        MerkleTree.verifyProof(transactions[2], proof, tree.root),
        "Merkle inclusion proof failed",
    );

    require(
        !MerkleTree.verifyProof("Carol pays Dave 2000", proof, tree.root),
        "Modified transaction unexpectedly verified",
    );

    console.log("SHA-256 known-answer test passed.");
    console.log(`SHA-256(abc): ${actualSha256OfAbc}`);
    console.log(`Merkle root: ${bytesToHex(tree.root)}`);
    console.log("Merkle proof test passed.\n");
}

function runBlockchainDemo() {
    const chain = new Blockchain(14);

    chain.addBlock([
        "Alice pays Bob 10",
        "Bob pays Carol 4",
    ]);

    chain.addBlock([
        "Carol pays Dave 2",
        "Dave pays Eve 1",
        "Eve pays Frank 7",
    ]);

    require(chain.isValid(), "Blockchain validation failed");

    console.log(`\nBlockchain valid: ${chain.isValid()}`);
    console.log(`Blocks mined: ${chain.blocks.length}`);

    chain.blocks[1].transactions[0] = "Carol pays Dave 2000";

    console.log(`Valid after tampering: ${chain.isValid()}`);
}

runTests();
runBlockchainDemo();