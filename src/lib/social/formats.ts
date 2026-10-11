import type { FormatId, Network } from "./types";

export const FORMATS: Record<FormatId, { label: string; width: number; height: number }> = {
  square: { label: "Cuadrado 1080×1080", width: 1080, height: 1080 },
  portrait: { label: "Vertical 1080×1350", width: 1080, height: 1350 },
  story: { label: "Historia 1080×1920", width: 1080, height: 1920 },
  landscape: { label: "Horizontal 1200×630", width: 1200, height: 630 },
};

export const FORMAT_IDS = Object.keys(FORMATS) as FormatId[];

export const NETWORK_LABEL: Record<Network, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  telegram: "Telegram",
};

/**
 * Reglas verificadas contra la documentación oficial de cada API.
 * - Instagram (Content Publishing API): solo JPEG; el feed admite relaciones entre 4:5 y 1,91:1.
 *   Las historias NO se publican desde acá (solo exportación).
 * - Facebook (Pages API /photos): JPEG/PNG, sin restricción de relación relevante.
 * - LinkedIn (Images API + Posts API): una imagen por publicación.
 * - Telegram (Bot API sendPhoto): suma de ancho+alto <= 10000, relación <= 20, caption <= 1024.
 */
export const NETWORK_RULES: Record<
  Network,
  { maxCaption: number; maxHashtags: number; directFormats: FormatId[]; linkClickable: boolean; maxBytes: number }
> = {
  instagram: { maxCaption: 2200, maxHashtags: 30, directFormats: ["square", "portrait", "landscape"], linkClickable: false, maxBytes: 8 * 1024 * 1024 },
  facebook: { maxCaption: 5000, maxHashtags: 30, directFormats: ["square", "portrait", "landscape"], linkClickable: true, maxBytes: 4 * 1024 * 1024 },
  linkedin: { maxCaption: 3000, maxHashtags: 10, directFormats: ["square", "portrait", "landscape"], linkClickable: true, maxBytes: 4 * 1024 * 1024 },
  telegram: { maxCaption: 1024, maxHashtags: 30, directFormats: ["square", "portrait", "story", "landscape"], linkClickable: true, maxBytes: 4 * 1024 * 1024 },
};

export interface PieceCheck {
  ok: boolean;
  reason?: string;
}

/** Valida que una pieza ya generada pueda enviarse directo a una red. */
export function checkPieceForNetwork(
  network: Network,
  format: FormatId,
  dims: { width: number; height: number; bytes: number },
): PieceCheck {
  const rules = NETWORK_RULES[network];
  if (!rules.directFormats.includes(format)) {
    return { ok: false, reason: `${NETWORK_LABEL[network]} no admite publicar el formato "${FORMATS[format].label}" por API.` };
  }
  const target = FORMATS[format];
  if (dims.width !== target.width || dims.height !== target.height) {
    return { ok: false, reason: "Las dimensiones de la pieza no coinciden con el formato elegido." };
  }
  if (dims.bytes > rules.maxBytes) return { ok: false, reason: "La imagen supera el peso máximo permitido." };
  const ratio = dims.width / dims.height;
  if (network === "instagram" && (ratio < 0.8 - 1e-6 || ratio > 1.91 + 1e-6)) {
    return { ok: false, reason: "Instagram exige una relación de aspecto entre 4:5 y 1,91:1 en el feed." };
  }
  if (network === "telegram" && (dims.width + dims.height > 10000 || Math.max(ratio, 1 / ratio) > 20)) {
    return { ok: false, reason: "Telegram rechaza imágenes con ancho+alto > 10000 o relación mayor a 20." };
  }
  return { ok: true };
}
