import { supabase } from "@/integrations/supabase/client";
import { TK_FUNCTION } from "./backend";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${TK_FUNCTION}`;

export class TkApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/**
 * Llama a la Edge Function `tokenizate`. Las acciones públicas no llevan sesión; las del equipo
 * (`admin_*`) envían el JWT de la sesión administrativa y el servidor verifica el rol.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function tkApi<T = any>(action: string, body: Record<string, unknown> = {}, opts: { admin?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  if (opts.admin) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new TkApiError("Sesión vencida. Volvé a iniciar sesión.", 401);
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  let res: Response;
  try {
    res = await fetch(FN_URL, { method: "POST", headers, body: JSON.stringify({ action, ...body }) });
  } catch {
    throw new TkApiError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new TkApiError(json.error ?? "Error del servidor", res.status);
  return json as T;
}

/** Sube un archivo a la URL firmada con progreso. El servidor luego verifica el contenido real. */
export function uploadToSignedUrl(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("cacheControl", "3600");
    fd.append("", file);
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new TkApiError("No se pudo subir el archivo.", xhr.status)));
    xhr.onerror = () => reject(new TkApiError("Falló la conexión durante la carga.", 0));
    xhr.send(fd);
  });
}
