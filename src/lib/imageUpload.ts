const MAX_DIMENSION = 1200; // px, lado mayor
const OUTPUT_QUALITY = 0.85;
const MAX_INPUT_BYTES = 5 * 1024 * 1024; // 5MB, límite antes de optimizar
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class ImageValidationError extends Error {}

/**
 * Valida tipo/tamaño y devuelve una versión WebP redimensionada y
 * comprimida de la imagen, lista para subir a Storage. Nunca se sube ni
 * se guarda en Base64 en la base de datos: esto produce un Blob binario
 * real para subir directamente al bucket.
 */
export async function prepareTeamPhoto(file: File): Promise<Blob> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageValidationError("Formato no permitido. Usá JPG, PNG o WebP.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageValidationError("La imagen supera los 5MB permitidos.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageValidationError("No se pudo procesar la imagen en este navegador.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", OUTPUT_QUALITY));
  if (!blob) throw new ImageValidationError("No se pudo generar la imagen optimizada.");
  return blob;
}

export function buildTeamPhotoPath(slug: string): string {
  const random = crypto.randomUUID();
  return `${slug}/${random}.webp`;
}
