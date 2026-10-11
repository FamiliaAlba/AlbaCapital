import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let client: SupabaseClient | null = null;

/** Cliente con service role: SOLO en servidor, nunca expuesto. */
export function admin(): SupabaseClient {
  if (client) return client;
  const url = env.supabaseUrl();
  const key = env.serviceRoleKey();
  if (!url || !key) throw new Error("Supabase no configurado en el servidor");
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
