// Production-safe error responses.
// Returns a generic message + stable code to clients, logs the real error server-side.

export function genericError(
  status: number,
  code: string,
  message?: string,
): Response {
  return Response.json(
    { error: message ?? "Request failed", code },
    { status },
  );
}

export function logServerError(
  context: string,
  err: unknown,
  extra?: Record<string, unknown>,
) {
  const id = crypto.randomUUID();
  console.error(`[server-error ${id}] ${context}`, err, extra ?? {});
  return id;
}
