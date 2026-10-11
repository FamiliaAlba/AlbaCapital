import { ProviderError, sanitizeError } from "../sanitize.js";

/** fetch con timeout. Marca como incierto un fallo posterior al envío (timeout/red). */
export async function request(url: string, init: RequestInit = {}, timeoutMs = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    throw new ProviderError(`Sin respuesta del proveedor: ${sanitizeError(e)}`, true, true);
  } finally {
    clearTimeout(timer);
  }
}

export async function requestJson<T = Record<string, unknown>>(
  url: string,
  init: RequestInit = {},
  timeoutMs?: number,
): Promise<{ status: number; body: T; headers: Headers }> {
  const res = await request(url, init, timeoutMs);
  const text = await res.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  return { status: res.status, body: body as T, headers: res.headers };
}

/** Traduce el estado HTTP de un proveedor en un error clasificado. */
export function providerError(status: number, message: string): ProviderError {
  if (status === 429) return new ProviderError(`Límite de frecuencia del proveedor: ${message}`, false, true, status);
  if (status >= 500) return new ProviderError(`Error del proveedor (${status}): ${message}`, true, true, status);
  return new ProviderError(`${message} (HTTP ${status})`, false, false, status);
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}
