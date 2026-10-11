import { NETWORK_RULES } from "./formats";
import type { Network } from "./types";

export interface CaptionInput {
  title: string;
  description: string;
  cta: string;
  /** URL ya con UTM para esta red. */
  url: string;
  tipo?: string | null;
  location?: string | null;
}

/** Quita caracteres de control y colapsa espacios: el contenido es dato, nunca instrucción. */
export function cleanText(input: string): string {
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Resumen de 2–3 frases tomado literalmente de la descripción pública. */
export function summarize(description: string, maxSentences = 3, maxChars = 420): string {
  const text = cleanText(description).replace(/\s*\n+\s*/g, " ");
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text];
  let out = "";
  for (const s of sentences.slice(0, maxSentences)) {
    if ((out + s).length > maxChars && out) break;
    out += s;
  }
  out = out.trim();
  if (out.length > maxChars) out = `${out.slice(0, maxChars - 1).trimEnd()}…`;
  return out;
}

const toHashtag = (word: string): string | null => {
  const cleaned = word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
  if (cleaned.length < 4) return null;
  return `#${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1).toLowerCase()}`;
};

/** Hashtags a partir de los campos reales de la ficha (tipo y ubicación) más la marca. */
export function buildHashtags(input: Pick<CaptionInput, "tipo" | "location">, max = 6): string[] {
  const out = new Set<string>(["#AlbaCapital", "#Inversiones"]);
  const words = `${input.tipo ?? ""} ${input.location ?? ""}`.split(/[\s·,/|-]+/);
  for (const w of words) {
    const h = toHashtag(w);
    if (h) out.add(h);
    if (out.size >= max) break;
  }
  return [...out].slice(0, max);
}

const urlLine = (network: Network, url: string): string => {
  if (NETWORK_RULES[network].linkClickable) return url;
  // Instagram no vuelve clickeables los enlaces de un pie de foto: se muestra como texto plano.
  return `Más información: ${url.replace(/^https?:\/\//, "").split("?")[0]}`;
};

/** Texto base por red. Respeta el límite de la red recortando el resumen, nunca el enlace ni la llamada a la acción. */
export function buildCaption(network: Network, input: CaptionInput): string {
  const limit = NETWORK_RULES[network].maxCaption;
  const title = cleanText(input.title);
  const cta = cleanText(input.cta);
  const hashtags = buildHashtags(input, network === "linkedin" ? 4 : 6).join(" ");
  const tail = `${cta}\n${urlLine(network, input.url)}\n\n${hashtags}`;
  const head = network === "telegram" ? title : title;
  let summary = summarize(input.description, network === "telegram" ? 2 : 3);
  const compose = (s: string) => [head, s, tail].filter(Boolean).join("\n\n");
  let text = compose(summary);
  while (text.length > limit && summary.length > 0) {
    summary = summary.length > 40 ? `${summary.slice(0, Math.max(0, summary.length - 40)).trimEnd()}…` : "";
    text = compose(summary);
  }
  return text.length > limit ? text.slice(0, limit) : text;
}

export function countHashtags(text: string): number {
  return (text.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? []).length;
}
