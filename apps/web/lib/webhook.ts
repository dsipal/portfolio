import { createHmac, timingSafeEqual } from "node:crypto";

/** How far a signed request's timestamp may be from now */
const MAX_AGE_MS = 5 * 60 * 1000;

/** The X-Ghost-Signature header Ghost sends for `body` at `timestamp` (ms) */
export function signGhostPayload(body: string, secret: string, timestamp = Date.now()) {
  const hash = createHmac("sha256", secret).update(`${body}${timestamp}`).digest("hex");
  return `sha256=${hash}, t=${timestamp}`;
}

/**
 * Check Ghost's `X-Ghost-Signature: sha256=<hex>, t=<ms>` header: an
 * HMAC-SHA256 of the raw body followed by the timestamp, keyed with the
 * webhook secret. Stale timestamps are rejected to limit replays.
 */
export function verifyGhostSignature(
  header: string | null,
  body: string,
  secret: string | undefined,
  now = Date.now(),
) {
  if (!secret || !header) return false;
  const parts = new Map(
    header.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")] as const;
    }),
  );
  const signature = parts.get("sha256");
  const t = parts.get("t");
  const timestamp = Number(t);
  if (!signature || !t || !Number.isFinite(timestamp) || Math.abs(now - timestamp) > MAX_AGE_MS) return false;

  const expected = createHmac("sha256", secret).update(`${body}${t}`).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
