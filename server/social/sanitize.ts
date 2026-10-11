/** Redacta tokens y secretos antes de guardar o devolver un error. */
export function sanitizeError(err: unknown, max = 300): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "Error desconocido";
  return raw
    .replace(/(access_token|client_secret|token|bot)=[^&\s"']+/gi, "$1=[redactado]")
    .replace(/bot\d+:[A-Za-z0-9_-]{20,}/g, "bot[redactado]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redactado]")
    .replace(/(EA[A-Za-z0-9]{30,})/g, "[redactado]")
    .slice(0, max);
}

export class ProviderError extends Error {
  constructor(
    message: string,
    /** Si la solicitud pudo haber llegado al proveedor (timeouts / 5xx): el resultado es incierto. */
    public readonly uncertain = false,
    public readonly retryable = false,
    public readonly status?: number,
  ) {
    super(message);
  }
}
