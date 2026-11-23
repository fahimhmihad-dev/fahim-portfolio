import { createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

const memoryBuckets = new Map<string, number[]>();

export function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) || "fahim-portfolio-rl";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Distributed rate limiter backed by Supabase `rate_limits` table when service role
 * is available, with an in-memory sliding window fallback.
 */
export async function checkRateLimit(
  bucket: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  const now = Date.now();
  const windowStart = new Date(now - windowSeconds * 1000).toISOString();

  const service = createServiceRoleClient();
  if (service) {
    try {
      const { count } = await service
        .from("rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("bucket", bucket)
        .gte("created_at", windowStart);

      if ((count ?? 0) >= maxRequests) {
        return { allowed: false, retryAfter: windowSeconds };
      }

      await service.from("rate_limits").insert({ bucket });

      // Opportunistic cleanup of stale entries older than 24h (non-blocking)
      if (Math.random() < 0.05) {
        const dayAgo = new Date(now - 86_400_000).toISOString();
        void service.from("rate_limits").delete().lt("created_at", dayAgo);
      }

      return { allowed: true, retryAfter: 0 };
    } catch {
      // Fall through to in-memory limiter if DB unreachable
    }
  }

  const cutoff = now - windowSeconds * 1000;
  const recent = (memoryBuckets.get(bucket) ?? []).filter((ts) => ts > cutoff);
  if (recent.length >= maxRequests) {
    memoryBuckets.set(bucket, recent);
    return { allowed: false, retryAfter: windowSeconds };
  }
  recent.push(now);
  memoryBuckets.set(bucket, recent);
  return { allowed: true, retryAfter: 0 };
}
