// Lightweight sliding-window in-memory rate limiter per user/ip
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale keys every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((t) => now - t < 60000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  let record = rateLimitMap.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  record.timestamps.push(now);
  return { success: true, remaining: limit - record.timestamps.length };
}
