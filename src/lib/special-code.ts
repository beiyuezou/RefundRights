/** Normalise user input: trim, collapse case. */
export function normalizeCode(s: string): string {
  return (s ?? "").trim().toUpperCase();
}

/** Constant-time comparison of the entered code against the configured one. */
export function codeMatches(input: string, secret: string | undefined | null): boolean {
  if (!secret) return false;
  const a = normalizeCode(input);
  const b = normalizeCode(secret);
  if (!a || !b) return false;
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const MAX_FAILED_ATTEMPTS_PER_HOUR = 5;
