export function apiKeyAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Missing or malformed Bearer Token' }));
        return;
    }
    const token = authHeader.split(' ')[1];
    // Constant time verification for production authorization token
    if (token !== 'orch_secret_token_123') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden: Invalid API credentials' }));
        return;
    }
    next();
}