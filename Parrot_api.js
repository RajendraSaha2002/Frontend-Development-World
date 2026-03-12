// ============================================================
// api.js — All Flask API Fetch Calls
// ============================================================

const API = {
    BASE: '',

    async post(endpoint, body) {
        const res = await fetch(this.BASE + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        return res.json();
    },

    async get(endpoint) {
        const res = await fetch(this.BASE + endpoint, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
    },

    login: (user, pass) => API.post('/api/login', { username: user, password: pass }),
    logout: () => API.post('/api/logout', {}),
    me: () => API.get('/api/me'),
    dashboard: () => API.get('/api/dashboard'),
    system: () => API.get('/api/system'),
    systemHistory: () => API.get('/api/system/history'),
    logs: (severity='') => API.get(`/api/logs${severity ? '?severity='+severity : ''}`),
    sysLogs: () => API.get('/api/logs/system'),
    alerts: () => API.get('/api/logs/alerts'),
    localIp: () => API.get('/api/network/local-ip'),
    portScan: (target) => API.post('/api/network/scan', { target }),
    rangeScan: (cidr) => API.post('/api/network/range', { cidr })
};