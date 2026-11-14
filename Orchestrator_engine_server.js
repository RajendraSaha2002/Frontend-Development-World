import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { apiKeyAuth } from './middleware/Orchestrator_engine_auth.js';
import { TokenBucketLimiter } from './middleware/Orchestrator_engine_rateLimiter.js';
import { createPipeline } from './routes/Orchestrator_engine_pipelines.js';
import { handleSSEStream } from './routes/Orchestrator_engine_stream.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// DATABASE CONFIGURATION
// Edit your PostgreSQL connection credentials here or set them via ENV variables
// =============================================================================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sharma30@',
    database: process.env.DB_NAME || 'postgres', // Change to 'orchestrator_db' if using a dedicated database
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

    // Connection Pool Tuning
    max: 20,                          // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,         // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000,    // Return an error after 5s if a connection cannot be established
};

// Initialize PostgreSQL Connection Pool
const pool = new pg.Pool(dbConfig);

// Verify Database Connection on Gateway Boot
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error(`[Database Error] Failed to connect to PostgreSQL at ${dbConfig.host}:${dbConfig.port}:`, err.message);
        console.error('[Database Error] Verify that PostgreSQL is running and your credentials in server.js are correct.');
    } else {
        console.log(`[Database Ready] Connected to PostgreSQL (${dbConfig.database}) at ${dbConfig.host}:${dbConfig.port} | Server Time: ${res.rows[0].now}`);
    }
});

// =============================================================================
// SERVER SETUP & MIDDLEWARE
// =============================================================================
const PORT = parseInt(process.env.PORT || '4000', 10);
const limiter = new TokenBucketLimiter(30, 10); // 30 token capacity, refills 10 tokens/sec

const MIME_MAP = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // 1. IP Rate Limiting Check
    const ip = req.socket.remoteAddress || '127.0.0.1';
    if (!limiter.isAllowed(ip)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Too Many Requests: Token bucket rate limit exceeded' }));
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // 2. Static Asset Delivery (Serves public/ files: index.html, CSS, JS)
    if (req.method === 'GET' && !pathname.startsWith('/api/')) {
        let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
        const ext = path.extname(filePath);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME_MAP[ext] || 'application/octet-stream' });
            res.end(data);
        });
        return;
    }

    // 3. Real-Time SSE Log Streaming Endpoint
    if (req.method === 'GET' && pathname.startsWith('/api/v1/jobs/') && pathname.endsWith('/logs/stream')) {
        const parts = pathname.split('/');
        const jobId = parts[4];
        handleSSEStream(req, res, dbConfig, jobId);
        return;
    }

    // 4. DAG Pipeline State Query Endpoint
    if (req.method === 'GET' && pathname.startsWith('/api/v1/pipelines/')) {
        const pipelineId = pathname.split('/')[4];
        const query = `
            SELECT j.id, j.name, j.status, j.priority, j.retry_count,
                   COALESCE(array_agg(jd.parent_job_id) FILTER (WHERE jd.parent_job_id IS NOT NULL), '{}') as parents
            FROM jobs j
            LEFT JOIN job_deps jd ON j.id = jd.child_job_id
            WHERE j.pipeline_id = $1
            GROUP BY j.id
            ORDER BY j.created_at ASC
        `;

        pool.query(query, [pipelineId])
            .then(result => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });
        return;
    }

    // 5. Secured Pipeline Submission Endpoint (Protected with Bearer Token)
    if (req.method === 'POST' && pathname === '/api/v1/pipelines') {
        apiKeyAuth(req, res, () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk;
                if (body.length > 1e6) { // 1MB payload limit
                    res.writeHead(413, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Payload Too Large' }));
                    req.destroy();
                }
            });

            req.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    createPipeline(pool, parsed, res);
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
                }
            });
        });
        return;
    }

    // Default 404 Fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\n[Node.js Gateway] Shutting down HTTP server and PostgreSQL pool...');
    await pool.end();
    server.close(() => {
        console.log('[Node.js Gateway] Server closed safely.');
        process.exit(0);
    });
});

// Start Gateway
server.listen(PORT, () => {
    console.log(`[Node.js Gateway] Live and listening on http://localhost:${PORT}`);
});