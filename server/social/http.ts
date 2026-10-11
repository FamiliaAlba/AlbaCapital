import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sanitizeError } from "./sanitize.js";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(res: VercelResponse, status: number, body: unknown): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(status).json(body);
}

export function fail(res: VercelResponse, err: unknown): void {
  if (err instanceof HttpError) return json(res, err.status, { error: err.message });
  // Errores internos: se registra una versión sanitizada y se devuelve un mensaje genérico.
  console.error("[social]", sanitizeError(err));
  json(res, 500, { error: "Error interno. Reintentá en unos minutos." });
}

export const bearer = (req: VercelRequest): string | null => {
  const h = req.headers.authorization;
  return h && /^Bearer\s+\S+$/i.test(h) ? h.replace(/^Bearer\s+/i, "") : null;
};

/** Solo se aceptan pedidos del propio sitio (defensa en profundidad además del Bearer). */
export function assertSameOrigin(req: VercelRequest, siteHosts: string[]): void {
  const origin = req.headers.origin;
  if (!origin) return;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Origen no permitido");
  }
  const reqHost = (req.headers["x-forwarded-host"] as string | undefined) ?? req.headers.host;
  if (host !== reqHost && !siteHosts.includes(host)) throw new HttpError(403, "Origen no permitido");
}
