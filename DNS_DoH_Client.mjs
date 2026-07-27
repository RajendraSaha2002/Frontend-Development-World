import https from "node:https";



const TYPES = {
    A: 1,
    CNAME: 5,
    MX: 15,
    TXT: 16,
    AAAA: 28,
};

const TYPE_NAMES = {
    1: "A",
    5: "CNAME",
    15: "MX",
    16: "TXT",
    28: "AAAA",
};

function typeNumber(typeName) {
    const normalized = typeName.toUpperCase();

    if (!Object.prototype.hasOwnProperty.call(TYPES, normalized)) {
        throw new Error("Supported query types: A, AAAA, MX, CNAME, TXT");
    }

    return TYPES[normalized];
}

function encodeName(domain) {
    const normalized = domain.replace(/\.$/, "");

    if (normalized.length === 0) {
        return Buffer.from([0]);
    }

    const labels = normalized.split(".");
    const parts = [];

    for (const label of labels) {
        const bytes = Buffer.from(label, "ascii");

        if (bytes.length === 0 || bytes.length > 63) {
            throw new Error(`Invalid DNS label: ${label}`);
        }

        parts.push(Buffer.from([bytes.length]));
        parts.push(bytes);
    }

    parts.push(Buffer.from([0]));

    return Buffer.concat(parts);
}

function randomTransactionId() {
    return Math.floor(Math.random() * 65536);
}

/*
 * Creates an RFC 1035 recursive DNS query.
 */
function buildDnsQuery(domain, typeName) {
    const transactionId = randomTransactionId();
    const type = typeNumber(typeName);
    const encodedName = encodeName(domain);

    const header = Buffer.alloc(12);

    header.writeUInt16BE(transactionId, 0);
    header.writeUInt16BE(0x0100, 2); // Standard query + recursion desired.
    header.writeUInt16BE(1, 4); // One question.
    header.writeUInt16BE(0, 6); // Answer count.
    header.writeUInt16BE(0, 8); // Authority count.
    header.writeUInt16BE(0, 10); // Additional count.

    const questionTail = Buffer.alloc(4);
    questionTail.writeUInt16BE(type, 0);
    questionTail.writeUInt16BE(1, 2); // IN class.

    return {
        transactionId,
        message: Buffer.concat([header, encodedName, questionTail]),
    };
}

/*
 * Reads a domain name, including RFC 1035 compression pointers.
 */
function readName(message, offset) {
    const labels = [];
    let position = offset;
    let nextOffset = offset;
    let jumped = false;
    let jumps = 0;

    while (true) {
        if (position >= message.length) {
            throw new Error("DNS name extends past message length");
        }

        const length = message[position];

        if ((length & 0xc0) === 0xc0) {
            if (position + 1 >= message.length) {
                throw new Error("Incomplete DNS compression pointer");
            }

            const pointer = ((length & 0x3f) << 8) | message[position + 1];

            if (pointer >= message.length || jumps++ > 50) {
                throw new Error("Invalid DNS compression pointer");
            }

            if (!jumped) {
                nextOffset = position + 2;
                jumped = true;
            }

            position = pointer;
            continue;
        }

        if (length === 0) {
            if (!jumped) {
                nextOffset = position + 1;
            }

            break;
        }

        if ((length & 0xc0) !== 0 || length > 63) {
            throw new Error("Invalid DNS label length");
        }

        position++;

        if (position + length > message.length) {
            throw new Error("DNS label extends past message length");
        }

        labels.push(message.subarray(position, position + length).toString("ascii"));
        position += length;

        if (!jumped) {
            nextOffset = position;
        }
    }

    return {
        name: labels.length === 0 ? "." : labels.join("."),
        nextOffset,
    };
}

function parseQuestion(message, offset) {
    const nameResult = readName(message, offset);
    const position = nameResult.nextOffset;

    if (position + 4 > message.length) {
        throw new Error("Incomplete DNS question");
    }

    return {
        question: {
            name: nameResult.name,
            type: message.readUInt16BE(position),
            class: message.readUInt16BE(position + 2),
        },
        nextOffset: position + 4,
    };
}

function parseIpv6(bytes) {
    const groups = [];

    for (let i = 0; i < 16; i += 2) {
        groups.push(bytes.readUInt16BE(i).toString(16));
    }

    return groups.join(":");
}

function parseTxt(bytes) {
    const texts = [];
    let offset = 0;

    while (offset < bytes.length) {
        const length = bytes[offset];
        offset++;

        if (offset + length > bytes.length) {
            return "(invalid TXT data)";
        }

        texts.push(bytes.subarray(offset, offset + length).toString("utf8"));
        offset += length;
    }

    return texts.join(" ");
}

function parseRdata(message, type, rdataOffset, rdataLength) {
    const rdata = message.subarray(rdataOffset, rdataOffset + rdataLength);

    if (type === TYPES.A && rdataLength === 4) {
        return Array.from(rdata).join(".");
    }

    if (type === TYPES.AAAA && rdataLength === 16) {
        return parseIpv6(rdata);
    }

    if (type === TYPES.CNAME) {
        return readName(message, rdataOffset).name;
    }

    if (type === TYPES.MX && rdataLength >= 3) {
        const preference = rdata.readUInt16BE(0);
        const exchange = readName(message, rdataOffset + 2).name;

        return `${preference} ${exchange}`;
    }

    if (type === TYPES.TXT) {
        return parseTxt(rdata);
    }

    return `0x${rdata.toString("hex")}`;
}

function parseResourceRecord(message, offset) {
    const nameResult = readName(message, offset);
    const position = nameResult.nextOffset;

    if (position + 10 > message.length) {
        throw new Error("Incomplete DNS resource record");
    }

    const type = message.readUInt16BE(position);
    const recordClass = message.readUInt16BE(position + 2);
    const ttl = message.readUInt32BE(position + 4);
    const rdataLength = message.readUInt16BE(position + 8);
    const rdataOffset = position + 10;
    const nextOffset = rdataOffset + rdataLength;

    if (nextOffset > message.length) {
        throw new Error("DNS RDATA extends past message length");
    }

    return {
        record: {
            name: nameResult.name,
            type,
            typeName: TYPE_NAMES[type] || `TYPE${type}`,
            class: recordClass,
            ttl,
            data: parseRdata(message, type, rdataOffset, rdataLength),
        },
        nextOffset,
    };
}

function parseRecords(message, offset, count) {
    const records = [];
    let position = offset;

    for (let i = 0; i < count; i++) {
        const result = parseResourceRecord(message, position);
        records.push(result.record);
        position = result.nextOffset;
    }

    return {
        records,
        nextOffset: position,
    };
}

/*
 * Decodes an RFC 1035 DNS response message.
 */
function parseDnsResponse(message) {
    if (!Buffer.isBuffer(message) || message.length < 12) {
        throw new Error("DNS message is too short");
    }

    const transactionId = message.readUInt16BE(0);
    const flags = message.readUInt16BE(2);
    const questionCount = message.readUInt16BE(4);
    const answerCount = message.readUInt16BE(6);
    const authorityCount = message.readUInt16BE(8);
    const additionalCount = message.readUInt16BE(10);

    const responseCode = flags & 0x000f;
    const truncated = (flags & 0x0200) !== 0;
    const recursionAvailable = (flags & 0x0080) !== 0;

    let offset = 12;
    const questions = [];

    for (let i = 0; i < questionCount; i++) {
        const result = parseQuestion(message, offset);
        questions.push(result.question);
        offset = result.nextOffset;
    }

    const answersResult = parseRecords(message, offset, answerCount);
    offset = answersResult.nextOffset;

    const authorityResult = parseRecords(message, offset, authorityCount);
    offset = authorityResult.nextOffset;

    const additionalResult = parseRecords(message, offset, additionalCount);

    return {
        transactionId,
        flags,
        responseCode,
        truncated,
        recursionAvailable,
        questions,
        answers: answersResult.records,
        authority: authorityResult.records,
        additional: additionalResult.records,
    };
}

/*
 * Sends an RFC 8484 DNS-over-HTTPS POST request.
 */
function dohQuery(host, dnsMessage) {
    return new Promise((resolve, reject) => {
        const request = https.request(
            {
                hostname: host,
                port: 443,
                path: "/dns-query",
                method: "POST",
                headers: {
                    "Content-Type": "application/dns-message",
                    "Accept": "application/dns-message",
                    "Content-Length": dnsMessage.length,
                },
                timeout: 10000,
            },
            (response) => {
                const chunks = [];

                response.on("data", (chunk) => chunks.push(chunk));

                response.on("end", () => {
                    const body = Buffer.concat(chunks);

                    if (response.statusCode !== 200) {
                        reject(
                            new Error(
                                `${host} returned HTTP ${response.statusCode}: ${body.toString()}`,
                            ),
                        );
                        return;
                    }

                    resolve(body);
                });
            },
        );

        request.on("timeout", () => {
            request.destroy();
            reject(new Error(`${host} request timed out`));
        });

        request.on("error", reject);

        request.write(dnsMessage);
        request.end();
    });
}

function normalisedAnswers(response) {
    return response.answers
        .map((record) => `${record.name}|${record.typeName}|${record.data}`)
        .sort();
}

function printResponse(resolverName, response) {
    console.log(`Resolver: ${resolverName}`);
    console.log(`Response code: ${response.responseCode}`);
    console.log(`Recursion available: ${response.recursionAvailable}`);
    console.log(`Truncated: ${response.truncated}`);

    if (response.questions.length > 0) {
        const question = response.questions[0];

        console.log(
            `Question: ${question.name} ${TYPE_NAMES[question.type] || question.type}`,
        );
    }

    if (response.answers.length === 0) {
        console.log("Answers: none");
    } else {
        console.log("Answers:");

        for (const answer of response.answers) {
            console.log(
                `  ${answer.name} ${answer.ttl} IN ${answer.typeName} ${answer.data}`,
            );
        }
    }

    console.log();
}

async function main() {
    const domain = process.argv[2] ?? "example.com";
    const typeName = (process.argv[3] ?? "A").toUpperCase();

    const query = buildDnsQuery(domain, typeName);

    console.log("DNS RFC 1035 wire-format + DoH client");
    console.log(`Domain: ${domain}`);
    console.log(`Type: ${typeName}`);
    console.log(`Transaction ID: 0x${query.transactionId.toString(16).padStart(4, "0")}`);
    console.log();

    const resolvers = [
        {
            name: "Cloudflare DoH (1.1.1.1)",
            host: "cloudflare-dns.com",
        },
        {
            name: "Google DoH (8.8.8.8)",
            host: "dns.google",
        },
    ];

    const results = await Promise.allSettled(
        resolvers.map(async (resolver) => {
            const responseBytes = await dohQuery(resolver.host, query.message);
            const response = parseDnsResponse(responseBytes);

            if (response.transactionId !== query.transactionId) {
                throw new Error(`${resolver.name} returned a mismatched transaction ID`);
            }

            return {
                resolver,
                response,
            };
        }),
    );

    const successful = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            successful.push(result.value);
            printResponse(result.value.resolver.name, result.value.response);
        } else {
            console.log(`Resolver query failed: ${result.reason.message}\n`);
        }
    }

    if (successful.length === 2) {
        const firstAnswers = normalisedAnswers(successful[0].response);
        const secondAnswers = normalisedAnswers(successful[1].response);

        const identical =
            firstAnswers.length === secondAnswers.length
            && firstAnswers.every((answer, index) => answer === secondAnswers[index]);

        console.log("Resolver comparison:");

        if (identical) {
            console.log("  Result: Answer records match.");
        } else {
            console.log("  Result: Answer records differ.");
            console.log("  Note: CDN, geo-routing, and resolver policy can cause valid differences.");
            console.log("  Review unexpected differences before treating them as hijacking.");
        }
    }
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
});