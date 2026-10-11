import type { VercelRequest } from "@vercel/node";
import { admin } from "./db.js";
import { bearer, HttpError } from "./http.js";

export interface AdminContext {
  userId: string;
}

/** Verifica sesión (JWT de Supabase) y rol superadmin EN EL SERVIDOR. */
export async function requireAdmin(req: VercelRequest): Promise<AdminContext> {
  const token = bearer(req);
  if (!token) throw new HttpError(401, "Sesión requerida");
  const db = admin();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sesión inválida o vencida");
  const { data: row } = await db
    .from("admin_users")
    .select("role")
    .eq("id", data.user.id)
    .eq("role", "superadmin")
    .maybeSingle();
  if (!row) throw new HttpError(403, "No autorizado");
  return { userId: data.user.id };
}

export async function requireEnabled(): Promise<void> {
  const { data } = await admin().from("social_settings").select("enabled").eq("id", true).maybeSingle();
  if (data && data.enabled === false) throw new HttpError(403, "El módulo de redes sociales está desactivado");
}

/** Límite de frecuencia por usuario y acción, persistido en la base. */
export async function rateLimit(userId: string, action: string, max: number, windowSeconds: number): Promise<void> {
  const db = admin();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await db
    .from("social_rate_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", since);
  if ((count ?? 0) >= max) throw new HttpError(429, "Demasiados intentos. Esperá unos minutos.");
  await db.from("social_rate_events").insert({ user_id: userId, action });
}
