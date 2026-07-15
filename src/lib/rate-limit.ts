// In-memory rate limiting map.
// In a real production app with multiple instances, use Redis or Supabase.
const rateLimitMap = new Map<string, number[]>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10; // Max scans per IP per window

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Get existing requests for this IP
  let timestamps = rateLimitMap.get(ip) || [];

  // Filter out timestamps older than the window
  timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    // Rate limit exceeded
    rateLimitMap.set(ip, timestamps);
    return false;
  }

  // Add the new request timestamp
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  return true;
}
