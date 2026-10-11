import { supabase } from "@/integrations/supabase/client";

export class SocialApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Llama a la función de servidor con el JWT de la sesión administrativa (no hay cookies: no aplica CSRF). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function socialApi<T = any>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new SocialApiError("Sesión vencida. Volvé a iniciar sesión.", 401);
  const res = await fetch("/api/social", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...body }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new SocialApiError(json.error ?? "Error del servidor", res.status);
  return json as T;
}
