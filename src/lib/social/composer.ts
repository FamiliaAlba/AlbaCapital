import { FORMATS } from "./formats";
import { opportunityFingerprint } from "./hash";
import type { FormatId, PostContent } from "./types";

export interface ComposeAssets {
  photo: HTMLImageElement;
  logo: HTMLImageElement;
  domain: string;
}

const FONT = '"Helvetica Neue", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:") && !src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

/** Firma del contenido gráfico: si cambia, las piezas ya generadas dejan de ser válidas para publicar. */
export const pieceSignature = (c: Pick<PostContent, "title" | "description" | "cta" | "imageUrl" | "focus" | "zoom">): string =>
  opportunityFingerprint([c.title, c.description, c.cta, c.imageUrl, String(c.focus.x), String(c.focus.y), String(c.zoom)]);

export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth || !line) line = test;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Ajusta el tamaño de fuente hasta que el texto entre en maxLines líneas; si no entra, recorta con "…". */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: string,
  maxWidth: number,
  maxLines: number,
  start: number,
  min: number,
): { lines: string[]; size: number } {
  for (let size = start; size >= min; size -= 2) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    const lines = wrapLines(ctx, text, maxWidth);
    if (lines.length <= maxLines) return { lines, size };
  }
  ctx.font = `${weight} ${min}px ${FONT}`;
  const lines = wrapLines(ctx, text, maxWidth);
  const cut = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    let last = cut[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    cut[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return { lines: cut, size: min };
}

/** Dibuja la foto sin deformarla: recorte tipo "cover" con punto focal y zoom. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  focus: { x: number; y: number },
  zoom: number,
): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = -(dw - w) * focus.x;
  const dy = -(dh - h) * focus.y;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function renderPiece(content: PostContent, format: FormatId, assets: ComposeAssets): HTMLCanvasElement {
  const { width: W, height: H } = FORMATS[format];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  const wide = W > H;
  const u = Math.min(W, H) / 1080; // unidad de diseño
  const margin = Math.round((wide ? 56 : 72) * (wide ? W / 1200 : u));
  const textW = W - margin * 2;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);
  drawCover(ctx, assets.photo, W, H, content.focus, content.zoom);

  // Degradado inferior (y leve superior para el logo) que garantiza contraste del texto.
  const g = ctx.createLinearGradient(0, H * (wide ? 0.25 : 0.38), 0, H);
  g.addColorStop(0, "rgba(10,10,10,0)");
  g.addColorStop(0.55, "rgba(10,10,10,0.72)");
  g.addColorStop(1, "rgba(10,10,10,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const gt = ctx.createLinearGradient(0, 0, 0, H * 0.2);
  gt.addColorStop(0, "rgba(10,10,10,0.55)");
  gt.addColorStop(1, "rgba(10,10,10,0)");
  ctx.fillStyle = gt;
  ctx.fillRect(0, 0, W, H * 0.2);

  // Logo (proporción original, nunca recortado).
  const logoH = Math.round((wide ? 62 : 88) * (wide ? W / 1200 : u));
  const logoW = (assets.logo.naturalWidth / assets.logo.naturalHeight) * logoH;
  const safeTop = format === "story" ? Math.round(H * 0.07) : margin;
  ctx.drawImage(assets.logo, margin, safeTop, logoW, logoH);

  // Bloque de texto, anclado abajo.
  const safeBottom = format === "story" ? Math.round(H * 0.1) : margin;
  const domainSize = Math.round((wide ? 26 : 30) * (wide ? W / 1200 : u));
  const ctaSize = Math.round((wide ? 26 : 32) * (wide ? W / 1200 : u));
  let y = H - safeBottom;

  // Dominio
  ctx.font = `600 ${domainSize}px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(assets.domain, margin, y);
  y -= domainSize + Math.round(26 * u);

  // Invitación (CTA) con filete
  const cta = fitText(ctx, content.cta, "500", textW, wide ? 2 : 3, ctaSize, Math.round(ctaSize * 0.7));
  ctx.fillStyle = "#ffffff";
  ctx.font = `500 ${cta.size}px ${FONT}`;
  const ctaLH = Math.round(cta.size * 1.3);
  for (let i = cta.lines.length - 1; i >= 0; i--) {
    ctx.fillText(cta.lines[i], margin, y);
    y -= ctaLH;
  }
  y += ctaLH - cta.size; // alinear tope
  y -= Math.round(18 * u);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(margin, y, Math.round(72 * u), Math.max(2, Math.round(3 * u)));
  y -= Math.round(34 * u);

  // Descripción breve
  const descSize = Math.round((wide ? 24 : 34) * (wide ? W / 1200 : u));
  const desc = fitText(ctx, content.description, "400", textW, wide ? 2 : format === "story" ? 5 : 4, descSize, Math.round(descSize * 0.75));
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = `400 ${desc.size}px ${FONT}`;
  const descLH = Math.round(desc.size * 1.4);
  if (content.description.trim()) {
    for (let i = desc.lines.length - 1; i >= 0; i--) {
      ctx.fillText(desc.lines[i], margin, y);
      y -= descLH;
    }
    y -= Math.round(14 * u);
  }

  // Título
  const title = fitText(ctx, content.title, "300", textW, wide ? 2 : 3, Math.round((wide ? 60 : 84) * (wide ? W / 1200 : u)), Math.round((wide ? 34 : 46) * (wide ? W / 1200 : u)));
  ctx.fillStyle = "#ffffff";
  ctx.font = `300 ${title.size}px ${FONT}`;
  const titleLH = Math.round(title.size * 1.12);
  for (let i = title.lines.length - 1; i >= 0; i--) {
    ctx.fillText(title.lines[i], margin, y);
    y -= titleLH;
  }
  return canvas;
}

export function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo exportar la imagen"))), "image/jpeg", quality),
  );
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error("No se pudo leer la imagen"));
    r.readAsDataURL(blob);
  });
}
