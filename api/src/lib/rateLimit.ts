// In-memory per-IP rate limiter (FR-F3). Good enough for a single-instance hackathon
// deployment; resets if the Function host recycles — acceptable trade-off for the demo.
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = parseInt(process.env.RATE_LIMIT_PER_HOUR || "5", 10);

const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > LIMIT;
}
