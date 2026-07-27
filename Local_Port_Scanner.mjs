import net from "node:net";



const ALLOWED_HOSTS = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
]);

function parseInteger(value, name, minimum, maximum) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
        throw new Error(`${name} must be from ${minimum} to ${maximum}`);
    }

    return parsed;
}

function validateHost(host) {
    if (!ALLOWED_HOSTS.has(host.toLowerCase())) {
        throw new Error(
            "Safety restriction: only localhost, 127.0.0.1, and ::1 are allowed.",
        );
    }
}

function isHttpPort(port) {
    return [80, 8000, 8080, 8081, 8888].includes(port);
}

function serviceProbe(port) {
    if (isHttpPort(port)) {
        return Buffer.from(
            "HEAD / HTTP/1.0\r\n"
            + "Host: localhost\r\n"
            + "Connection: close\r\n\r\n",
            "ascii",
        );
    }

    return null;
}

function cleanBanner(data) {
    const text = data.toString("latin1");

    const cleaned = text
        .replace(/[\r\n\t]+/g, " ")
        .replace(/[^\x20-\x7e]/g, "")
        .trim();

    return cleaned.length > 0
        ? cleaned.slice(0, 120)
        : "(connected; no readable banner)";
}

function identifyService(port, banner) {
    const lower = banner.toLowerCase();

    if (lower.includes("ssh-") || port === 22) {
        return "SSH";
    }

    if (lower.includes("ftp") || port === 21) {
        return "FTP";
    }

    if (lower.includes("smtp") || port === 25 || port === 587) {
        return "SMTP";
    }

    if (lower.includes("http/") || isHttpPort(port)) {
        return "HTTP";
    }

    if (port === 3306) {
        return "MySQL";
    }

    if (port === 5432) {
        return "PostgreSQL";
    }

    if (port === 6379) {
        return "Redis";
    }

    if (port === 27017) {
        return "MongoDB";
    }

    return "Unknown TCP service";
}

/*
 * Connects to one local TCP port and optionally reads a short banner.
 */
function probePort(host, port, timeoutMs) {
    return new Promise((resolve) => {
        let completed = false;
        let connected = false;
        let socket;

        function finish(result) {
            if (completed) {
                return;
            }

            completed = true;
            clearTimeout(timer);

            if (socket) {
                socket.destroy();
            }

            resolve(result);
        }

        const timer = setTimeout(() => {
            if (connected) {
                finish({
                    port,
                    open: true,
                    banner: "(connected; no banner received)",
                    service: identifyService(port, ""),
                });
            } else {
                finish({
                    port,
                    open: false,
                    banner: "",
                    service: "",
                });
            }
        }, timeoutMs);

        try {
            socket = net.createConnection({ host, port });

            socket.once("connect", () => {
                connected = true;

                const probe = serviceProbe(port);

                if (probe) {
                    socket.write(probe);
                }
            });

            socket.once("data", (data) => {
                const banner = cleanBanner(data);

                finish({
                    port,
                    open: true,
                    banner,
                    service: identifyService(port, banner),
                });
            });

            socket.once("error", () => {
                finish({
                    port,
                    open: false,
                    banner: "",
                    service: "",
                });
            });
        } catch {
            finish({
                port,
                open: false,
                banner: "",
                service: "",
            });
        }
    });
}

/*
 * Runs asynchronous workers with a maximum concurrency limit.
 */
async function scanPorts(host, startPort, endPort, concurrency, timeoutMs) {
    const total = endPort - startPort + 1;
    let nextPort = startPort;
    let completed = 0;

    const openPorts = [];

    async function worker() {
        while (true) {
            if (nextPort > endPort) {
                return;
            }

            const port = nextPort;
            nextPort++;

            const result = await probePort(host, port, timeoutMs);

            completed++;

            process.stdout.write(
                `\rScanned ${completed}/${total} ports`,
            );

            if (result.open) {
                openPorts.push(result);
            }
        }
    }

    const workers = [];

    for (let i = 0; i < concurrency; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    process.stdout.write("\n");

    return openPorts.sort((first, second) => first.port - second.port);
}

function limit(text, length) {
    if (!text || text.length === 0) {
        return "-";
    }

    return text.length <= length
        ? text
        : `${text.slice(0, length - 3)}...`;
}

function printResults(results) {
    console.log();
    console.log("+-------+--------+----------------------+-----------------------------------+");
    console.log("| Port  | State  | Service              | Banner / response                 |");
    console.log("+-------+--------+----------------------+-----------------------------------+");

    if (results.length === 0) {
        console.log("| No open local TCP ports found.                                           |");
    } else {
        for (const result of results) {
            const port = String(result.port).padEnd(5);
            const state = "OPEN".padEnd(6);
            const service = limit(result.service, 20).padEnd(20);
            const banner = limit(result.banner, 33).padEnd(33);

            console.log(
                `| ${port} | ${state} | ${service} | ${banner} |`,
            );
        }
    }

    console.log("+-------+--------+----------------------+-----------------------------------+");
}

async function main() {
    const host = process.argv[2] ?? "127.0.0.1";
    const startPort = parseInteger(
        process.argv[3] ?? "1",
        "Start port",
        1,
        65535,
    );

    const endPort = parseInteger(
        process.argv[4] ?? "1024",
        "End port",
        1,
        65535,
    );

    const concurrency = parseInteger(
        process.argv[5] ?? "50",
        "Concurrency",
        1,
        256,
    );

    const timeoutMs = parseInteger(
        process.argv[6] ?? "800",
        "Timeout",
        50,
        10000,
    );

    if (startPort > endPort) {
        throw new Error("Start port cannot exceed end port");
    }

    validateHost(host);

    console.log("Local async TCP port scanner");
    console.log(`Target      : ${host}`);
    console.log(`Port range  : ${startPort}-${endPort}`);
    console.log(`Concurrency : ${concurrency}`);
    console.log(`Timeout     : ${timeoutMs} ms`);
    console.log();

    const startedAt = performance.now();

    const results = await scanPorts(
        host,
        startPort,
        endPort,
        concurrency,
        timeoutMs,
    );

    const elapsed = performance.now() - startedAt;

    printResults(results);

    console.log();
    console.log(`Open ports found: ${results.length}`);
    console.log(`Scan time: ${elapsed.toFixed(2)} ms`);
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
});