import pg from 'pg';

export function handleSSEStream(req, res, dbConfig, jobId) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ system: `Connected to stream channel for Job: ${jobId}` })}\n\n`);

    const client = new pg.Client(dbConfig);
    client.connect().then(async () => {
        // Stream out historical logs first
        const history = await client.query(
            'SELECT stream, chunk, created_at FROM job_logs WHERE job_id = $1 ORDER BY id ASC',
            [jobId]
        );
        for (const row of history.rows) {
            res.write(`data: ${JSON.stringify(row)}\n\n`);
        }

        await client.query(`LISTEN job_logs_${jobId}`);
        client.on('notification', (msg) => {
            res.write(`data: ${msg.payload}\n\n`);
        });
    }).catch(err => {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    });

    req.on('close', () => {
        client.end();
    });
}