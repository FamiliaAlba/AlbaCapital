/**
 * Formulario de consultas: validación y envío.
 *
 * IMPORTANTE: no hay un receptor autorizado conectado. El envío sale hacia el endpoint HTTPS que se configure en
 * VITE_DS_INQUIRY_ENDPOINT (por ejemplo, una función de servidor que reenvía a un correo o a un CRM autorizado).
 * Sin esa variable, `submitInquiry` devuelve "not-configured" y NO envía ni guarda nada: nunca simula éxito.
 * Ningún dato de contacto se escribe en logs ni en analítica.
 */
import { z } from "zod";

export const INQUIRY_TYPES = [
  { value: "software", label: "Software a medida" },
  { value: "visualizacion", label: "Visualización 3D y 360°" },
  { value: "asesoramiento", label: "Asesoramiento inmobiliario" },
  { value: "integral", label: "Solución integral" },
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];
export const isInquiryType = (v: string): v is InquiryType => INQUIRY_TYPES.some((t) => t.value === v);

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmailOrPhone = (v: string) => emailRe.test(v) || (/^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 8);

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Escribí tu nombre (mínimo 2 letras).").max(80, "El nombre es muy largo (máximo 80 caracteres)."),
  contact: z
    .string()
    .trim()
    .min(1, "Dejanos un correo o un teléfono para poder responderte.")
    .max(120, "El dato de contacto es muy largo.")
    .refine(isEmailOrPhone, "Revisá el dato: tiene que ser un correo válido o un teléfono con código de área."),
  type: z.enum(["software", "visualizacion", "asesoramiento", "integral"], { errorMap: () => ({ message: "Elegí un tipo de consulta." }) }),
  message: z.string().trim().min(10, "Contanos un poco más (mínimo 10 caracteres).").max(1000, "El mensaje es muy largo (máximo 1000 caracteres)."),
});

export type InquiryValues = z.infer<typeof inquirySchema>;
export type InquiryField = keyof InquiryValues;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export function validateInquiry(raw: { name: string; contact: string; type: string; message: string }): { ok: true; data: InquiryValues } | { ok: false; errors: InquiryErrors } {
  const r = inquirySchema.safeParse(raw);
  if (r.success) return { ok: true, data: r.data };
  const errors: InquiryErrors = {};
  for (const issue of r.error.issues) {
    const k = issue.path[0] as InquiryField;
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false, errors };
}

/** Endpoint configurado (solo HTTPS o ruta relativa). `null` = sin receptor. */
export function getInquiryEndpoint(raw: string | undefined = (import.meta.env.VITE_DS_INQUIRY_ENDPOINT as string | undefined)): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  // "//host" es una URL relativa al protocolo que apunta a otro dominio: no cuenta como ruta propia.
  return v.startsWith("https://") || (v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\")) ? v : null;
}

export type SubmitResult =
  | { status: "sent" }
  | { status: "not-configured" }
  | { status: "blocked" }
  | { status: "error"; message: string };

export async function submitInquiry(
  data: InquiryValues,
  opts: { endpoint?: string | null; honeypot?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<SubmitResult> {
  // Campo trampa: lo completa un bot. No se envía y tampoco se muestra como enviado.
  if ((opts.honeypot ?? "").trim()) return { status: "blocked" };
  const endpoint = opts.endpoint === undefined ? getInquiryEndpoint() : opts.endpoint;
  if (!endpoint) return { status: "not-configured" };
  const f = opts.fetchImpl ?? fetch;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
    const res = await f(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source: "alba-digital-solutions" }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return { status: "error", message: "No pudimos enviar la consulta. Probá de nuevo en unos minutos." };
    return { status: "sent" };
  } catch {
    return { status: "error", message: "No pudimos enviar la consulta. Revisá tu conexión y probá de nuevo." };
  }
}

/** Espera mínima entre envíos desde el mismo navegador. */
export const COOLDOWN_MS = 30_000;
