class EmailForensics {
    constructor() {
        this.analyzeBtn = document.getElementById('analyze-header');
        this.headerInput = document.getElementById('header-input');
        this.resultsDiv = document.getElementById('metadata-results');
        this.mapContainer = document.getElementById('geo-map');

        this.bindEvents();
    }

    bindEvents() {
        this.analyzeBtn.addEventListener('click', () => this.processHeader());
    }

    processHeader() {
        const headerText = this.headerInput.value;

        if (!headerText) {
            this.headerInput.value = `Received: from mail.attacker-node.net (node.attacker.net [203.0.113.55])
    by mx.secure-corp.com (Postfix) with ESMTPS id 4K3B2B1
    for <ceo@secure-corp.com>; Wed, 20 May 2026 11:02:41 +0530 (IST)
From: "IT Admin" <admin@secure-corp.com>
To: ceo@secure-corp.com
Subject: URGENT: Server Password Reset
Message-ID: <payload.2026@attacker-node.net>`;
        }

        // Simulate Regex Parsing
        this.resultsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; font-family: var(--font-mono); font-size: 0.9rem;">
                <strong style="color: var(--text-muted)">Originating IP:</strong> <span style="color: var(--alert-critical)">203.0.113.55</span>
                <strong style="color: var(--text-muted)">Spoofed Sender:</strong> <span>admin@secure-corp.com</span>
                <strong style="color: var(--text-muted)">True Domain:</strong> <span>attacker-node.net</span>
                <strong style="color: var(--text-muted)">Auth Results:</strong> <span style="color: var(--alert-warn)">SPF=SoftFail DKIM=None</span>
            </div>
        `;

        this.drawGeoTrace();
    }

    drawGeoTrace() {
        // Pure SVG Map Generation simulating an IP trace route
        this.mapContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 800 300" style="background: #020617;">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                <circle cx="200" cy="150" r="4" fill="var(--alert-critical)" />
                <text x="200" y="170" fill="var(--text-muted)" font-family="monospace" font-size="12" text-anchor="middle">Node A (203.0.113.55)</text>

                <circle cx="400" cy="100" r="4" fill="var(--alert-warn)" />
                <text x="400" y="90" fill="var(--text-muted)" font-family="monospace" font-size="12" text-anchor="middle">Hop 1 (Relay)</text>

                <circle cx="600" cy="200" r="4" fill="var(--success)" />
                <text x="600" y="220" fill="var(--text-muted)" font-family="monospace" font-size="12" text-anchor="middle">Destination (Kolkata)</text>

                <path d="M 200 150 Q 300 50 400 100 T 600 200" fill="none" stroke="var(--brand-primary)" stroke-width="2" stroke-dasharray="5,5">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                </path>
            </svg>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => new EmailForensics());