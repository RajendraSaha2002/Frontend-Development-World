import pg from 'pg';

export async function createPipeline(pool, body, res) {
    const { name, idempotency_key, jobs, dependencies } = body;
    if (!name || !jobs || !Array.isArray(jobs)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request: Missing name or jobs array' }));
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check for idempotency conflicts
        if (idempotency_key) {
            const existing = await client.query('SELECT id, status FROM pipelines WHERE idempotency_key = $1', [idempotency_key]);
            if (existing.rows.length > 0) {
                await client.query('ROLLBACK');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'EXISTING', pipeline: existing.rows[0] }));
                return;
            }
        }

        const pipeRes = await client.query(
            'INSERT INTO pipelines (name, idempotency_key, status) VALUES ($1, $2, $3) RETURNING id',
            [name, idempotency_key || null, 'RUNNING']
        );
        const pipelineId = pipeRes.rows[0].id;
        const jobIdMap = new Map();

        // Check which jobs have no parent dependencies so they can start as READY immediately
        const childSet = new Set((dependencies || []).map(d => d.child));

        for (const j of jobs) {
            const isRoot = !childSet.has(j.name);
            const status = isRoot ? 'READY' : 'BLOCKED';

            const jRes = await client.query(
                `INSERT INTO jobs (pipeline_id, name, command, args, status, priority, timeout_ms, output_cap_bytes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [
                    pipelineId,
                    j.name,
                    j.command,
                    JSON.stringify(j.args || []),
                    status,
                    j.priority || 100,
                    j.timeout_ms || 30000,
                    j.output_cap_bytes || 1048576
                ]
            );
            jobIdMap.set(j.name, jRes.rows[0].id);
        }

        if (dependencies && Array.isArray(dependencies)) {
            for (const dep of dependencies) {
                const parentId = jobIdMap.get(dep.parent);
                const childId = jobIdMap.get(dep.child);
                if (!parentId || !childId) {
                    throw new Error(`Invalid dependency definition: ${dep.parent} -> ${dep.child}`);
                }
                await client.query('INSERT INTO job_deps (parent_job_id, child_job_id) VALUES ($1, $2)', [parentId, childId]);
            }
        }

        await client.query('COMMIT');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'CREATED', pipeline_id: pipelineId }));
    } catch (err) {
        await client.query('ROLLBACK');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    } finally {
        client.release();
    }
}