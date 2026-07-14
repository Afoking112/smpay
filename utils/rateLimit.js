const windowMs = 60 * 1000;

function createRateLimiter(maxRequests = 10, ttlMs = windowMs) {
    const buckets = new Map();

    return function checkLimit(key) {
        const now = Date.now();
        const bucket = buckets.get(key);

        if (!bucket) {
            buckets.set(key, { count: 1, resetAt: now + ttlMs });
            return true;
        }

        if (bucket.resetAt <= now) {
            bucket.count = 1;
            bucket.resetAt = now + ttlMs;
            return true;
        }

        if (bucket.count >= maxRequests) {
            return false;
        }

        bucket.count += 1;
        return true;
    };
}

module.exports = {
    createRateLimiter,
};
