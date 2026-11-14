export class TokenBucketLimiter {
    constructor(capacity, refillRatePerSec) {
        this.capacity = capacity;
        this.refillRate = refillRatePerSec;
        this.buckets = new Map();
    }

    isAllowed(ip) {
        const now = Date.now();
        let bucket = this.buckets.get(ip);

        if (!bucket) {
            bucket = { tokens: this.capacity, lastRefill: now };
            this.buckets.set(ip, bucket);
        } else {
            const elapsed = (now - bucket.lastRefill) / 1000;
            bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRate);
            bucket.lastRefill = now;
        }

        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return true;
        }
        return false;
    }
}