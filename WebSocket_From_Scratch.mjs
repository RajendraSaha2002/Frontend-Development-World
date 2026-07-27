import net from "node:net";
import { createHash, randomBytes } from "node:crypto";



const HOST = "127.0.0.1";
const WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const OPCODES = {
    CONTINUATION: 0x0,
    TEXT: 0x1,
    BINARY: 0x2,
    CLOSE: 0x8,
    PING: 0x9,
    PONG: 0xa,
};

function websocketAccept(clientKey) {
    return createHash("sha1")
        .update(clientKey + WEBSOCKET_GUID, "ascii")
        .digest("base64");
}

function encodeFrame(opcode, payload = Buffer.alloc(0), masked = false) {
    const data = Buffer.from(payload);

    if (opcode >= 0x8 && (data.length > 125)) {
        throw new Error("Control frame payload cannot exceed 125 bytes");
    }

    const header = [];
    header.push(0x80 | opcode); // FIN = 1

    const maskBit = masked ? 0x80 : 0;

    if (data.length < 126) {
        header.push(maskBit | data.length);
    } else if (data.length <= 0xffff) {
        header.push(maskBit | 126);
        header.push((data.length >>> 8) & 0xff);
        header.push(data.length & 0xff);
    } else {
        header.push(maskBit | 127);

        const length = BigInt(data.length);

        for (let i = 7; i >= 0; i--) {
            header.push(Number((length >> BigInt(i * 8)) & 0xffn));
        }
    }

    if (!masked) {
        return Buffer.concat([Buffer.from(header), data]);
    }

    const maskingKey = randomBytes(4);
    const maskedPayload = Buffer.alloc(data.length);

    for (let i = 0; i < data.length; i++) {
        maskedPayload[i] = data[i] ^ maskingKey[i % 4];
    }

    return Buffer.concat([
        Buffer.from(header),
        maskingKey,
        maskedPayload,
    ]);
}

/*
 * Incremental parser: feed arbitrary TCP chunks into push().
 */
class FrameParser {
    constructor(expectMasked, onFrame) {
        this.expectMasked = expectMasked;
        this.onFrame = onFrame;
        this.buffer = Buffer.alloc(0);
    }

    push(data) {
        this.buffer = Buffer.concat([this.buffer, data]);

        while (true) {
            if (this.buffer.length < 2) {
                return;
            }

            const first = this.buffer[0];
            const second = this.buffer[1];

            const fin = (first & 0x80) !== 0;
            const opcode = first & 0x0f;
            const masked = (second & 0x80) !== 0;

            let payloadLength = second & 0x7f;
            let offset = 2;

            if (payloadLength === 126) {
                if (this.buffer.length < offset + 2) {
                    return;
                }

                payloadLength = this.buffer.readUInt16BE(offset);
                offset += 2;
            } else if (payloadLength === 127) {
                if (this.buffer.length < offset + 8) {
                    return;
                }

                let length = 0n;

                for (let i = 0; i < 8; i++) {
                    length = (length << 8n) | BigInt(this.buffer[offset + i]);
                }

                if (length > BigInt(Number.MAX_SAFE_INTEGER)) {
                    throw new Error("WebSocket payload is too large");
                }

                payloadLength = Number(length);
                offset += 8;
            }

            if (opcode >= 0x8 && (!fin || payloadLength > 125)) {
                throw new Error("Invalid WebSocket control frame");
            }

            if (masked !== this.expectMasked) {
                throw new Error(
                    this.expectMasked
                        ? "Client frame was not masked"
                        : "Server frame was unexpectedly masked",
                );
            }

            const maskLength = masked ? 4 : 0;
            const completeLength = offset + maskLength + payloadLength;

            if (this.buffer.length < completeLength) {
                return;
            }

            let maskingKey = null;

            if (masked) {
                maskingKey = this.buffer.subarray(offset, offset + 4);
                offset += 4;
            }

            const payload = Buffer.from(
                this.buffer.subarray(offset, offset + payloadLength),
            );

            if (masked) {
                for (let i = 0; i < payload.length; i++) {
                    payload[i] ^= maskingKey[i % 4];
                }
            }

            this.buffer = this.buffer.subarray(completeLength);

            this.onFrame({
                fin,
                opcode,
                payload,
            });
        }
    }
}

function parseHttpHeaders(text) {
    const lines = text.split("\r\n");
    const firstLine = lines.shift();
    const headers = {};

    for (const line of lines) {
        const separator = line.indexOf(":");

        if (separator < 0) {
            continue;
        }

        const name = line.slice(0, separator).trim().toLowerCase();
        const value = line.slice(separator + 1).trim();

        headers[name] = value;
    }

    return {
        firstLine,
        headers,
    };
}

function isWebSocketUpgrade(headers) {
    return headers.upgrade?.toLowerCase() === "websocket"
        && headers.connection?.toLowerCase().includes("upgrade")
        && headers["sec-websocket-version"] === "13"
        && Boolean(headers["sec-websocket-key"]);
}

function createLoopbackWebSocketServer() {
    const server = net.createServer((socket) => {
        let handshakeComplete = false;
        let httpBuffer = Buffer.alloc(0);
        let parser = null;

        socket.on("data", (data) => {
            try {
                if (!handshakeComplete) {
                    httpBuffer = Buffer.concat([httpBuffer, data]);

                    const headerEnd = httpBuffer.indexOf("\r\n\r\n");

                    if (headerEnd < 0) {
                        return;
                    }

                    const headerText = httpBuffer
                        .subarray(0, headerEnd)
                        .toString("utf8");

                    const remaining = httpBuffer.subarray(headerEnd + 4);
                    const request = parseHttpHeaders(headerText);

                    if (!request.firstLine.startsWith("GET ") ||
                        !isWebSocketUpgrade(request.headers)) {
                        socket.end(
                            "HTTP/1.1 400 Bad Request\r\n"
                            + "Connection: close\r\n\r\n",
                        );
                        return;
                    }

                    const accept = websocketAccept(
                        request.headers["sec-websocket-key"],
                    );

                    socket.write(
                        "HTTP/1.1 101 Switching Protocols\r\n"
                        + "Upgrade: websocket\r\n"
                        + "Connection: Upgrade\r\n"
                        + `Sec-WebSocket-Accept: ${accept}\r\n`
                        + "\r\n",
                    );

                    handshakeComplete = true;

                    parser = new FrameParser(true, (frame) => {
                        handleServerFrame(socket, frame);
                    });

                    if (remaining.length > 0) {
                        parser.push(remaining);
                    }

                    return;
                }

                parser.push(data);
            } catch (error) {
                console.log(`Server protocol error: ${error.message}`);
                socket.destroy();
            }
        });

        socket.on("error", () => {
            // Socket errors are expected when clients disconnect unexpectedly.
        });
    });

    return server;
}

function handleServerFrame(socket, frame) {
    if (frame.opcode === OPCODES.TEXT) {
        const text = frame.payload.toString("utf8");

        console.log(`Server received text: ${text}`);

        socket.write(
            encodeFrame(
                OPCODES.TEXT,
                Buffer.from(`Echo: ${text}`, "utf8"),
                false,
            ),
        );

        return;
    }

    if (frame.opcode === OPCODES.BINARY) {
        console.log(`Server received binary frame: ${frame.payload.length} bytes`);
        socket.write(encodeFrame(OPCODES.BINARY, frame.payload, false));
        return;
    }

    if (frame.opcode === OPCODES.PING) {
        console.log("Server received ping; sending pong.");
        socket.write(encodeFrame(OPCODES.PONG, frame.payload, false));
        return;
    }

    if (frame.opcode === OPCODES.PONG) {
        console.log("Server received pong.");
        return;
    }

    if (frame.opcode === OPCODES.CLOSE) {
        console.log("Server received close frame.");

        socket.write(encodeFrame(OPCODES.CLOSE, frame.payload, false));
        socket.end();
        return;
    }

    console.log(`Server received unsupported opcode: ${frame.opcode}`);
    socket.destroy();
}

function startServer(server) {
    return new Promise((resolve, reject) => {
        server.once("error", reject);

        server.listen(0, HOST, () => {
            server.removeListener("error", reject);

            const address = server.address();

            if (!address || typeof address === "string") {
                reject(new Error("Unable to get loopback server port"));
                return;
            }

            resolve(address.port);
        });
    });
}

function connectLocalWebSocket(port) {
    return new Promise((resolve, reject) => {
        const clientKey = randomBytes(16).toString("base64");
        const expectedAccept = websocketAccept(clientKey);

        const socket = net.createConnection({
            host: HOST,
            port,
        });

        let handshakeComplete = false;
        let httpBuffer = Buffer.alloc(0);
        let parser = null;
        let pongReceived = false;

        socket.once("connect", () => {
            const request =
                "GET /echo HTTP/1.1\r\n"
                + `Host: ${HOST}:${port}\r\n`
                + "Upgrade: websocket\r\n"
                + "Connection: Upgrade\r\n"
                + `Sec-WebSocket-Key: ${clientKey}\r\n`
                + "Sec-WebSocket-Version: 13\r\n"
                + "\r\n";

            socket.write(request);
        });

        socket.on("data", (data) => {
            try {
                if (!handshakeComplete) {
                    httpBuffer = Buffer.concat([httpBuffer, data]);

                    const headerEnd = httpBuffer.indexOf("\r\n\r\n");

                    if (headerEnd < 0) {
                        return;
                    }

                    const responseText = httpBuffer
                        .subarray(0, headerEnd)
                        .toString("utf8");

                    const remaining = httpBuffer.subarray(headerEnd + 4);
                    const response = parseHttpHeaders(responseText);

                    if (!response.firstLine.startsWith("HTTP/1.1 101")) {
                        throw new Error("WebSocket Upgrade was rejected");
                    }

                    if (response.headers["sec-websocket-accept"] !== expectedAccept) {
                        throw new Error("Invalid Sec-WebSocket-Accept value");
                    }

                    handshakeComplete = true;

                    console.log("Client handshake completed.");

                    parser = new FrameParser(false, (frame) => {
                        if (frame.opcode === OPCODES.TEXT) {
                            console.log(`Client received text: ${frame.payload.toString("utf8")}`);

                            if (!pongReceived) {
                                socket.write(
                                    encodeFrame(
                                        OPCODES.PING,
                                        Buffer.from("ping-data", "utf8"),
                                        true,
                                    ),
                                );
                            }

                            return;
                        }

                        if (frame.opcode === OPCODES.PONG) {
                            console.log(`Client received pong: ${frame.payload.toString("utf8")}`);
                            pongReceived = true;

                            const closePayload = Buffer.alloc(2);
                            closePayload.writeUInt16BE(1000, 0);

                            socket.write(
                                encodeFrame(OPCODES.CLOSE, closePayload, true),
                            );

                            return;
                        }

                        if (frame.opcode === OPCODES.CLOSE) {
                            console.log("Client received close frame.");
                            socket.end();
                            resolve();
                        }
                    });

                    socket.write(
                        encodeFrame(
                            OPCODES.TEXT,
                            Buffer.from("Hello from local raw WebSocket client", "utf8"),
                            true,
                        ),
                    );

                    if (remaining.length > 0) {
                        parser.push(remaining);
                    }

                    return;
                }

                parser.push(data);
            } catch (error) {
                socket.destroy();
                reject(error);
            }
        });

        socket.once("error", reject);

        socket.once("close", () => {
            if (!handshakeComplete) {
                reject(new Error("Socket closed before WebSocket handshake completed"));
            }
        });
    });
}

async function main() {
    const server = createLoopbackWebSocketServer();

    try {
        const port = await startServer(server);

        console.log(`Local WebSocket server listening on ws://${HOST}:${port}`);

        await connectLocalWebSocket(port);

        console.log("Local WebSocket demo completed successfully.");
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
}

main().catch((error) => {
    console.error(`WebSocket demo failed: ${error.message}`);
    process.exitCode = 1;
});