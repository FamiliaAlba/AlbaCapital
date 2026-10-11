import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomToken, safeEqual, sha256 } from "./crypto.js";
import { admin } from "./db.js";
import { env } from "./env.js";
import { encryptSecret } from "./crypto.js";
import { sanitizeError } from "./sanitize.js";
import { linkedinAuthUrl, linkedinExchangeAndDiscover } from "./connectors/linkedin.js";
import { metaAuthUrl, metaExchangeAndDiscover } from "./connectors/meta.js";
import { metaCheck } from "./connectors/meta.js";
import { linkedinCheck } from "./connectors/linkedin.js";

export type Provider = "meta" | "linkedin";
const COOKIE = "alba_social_oauth";

export const redirectUri = (provider: Provider): string => `${env.siteUrl()}/api/oauth/${provider}`;

/** Inicia OAuth: el state queda ligado al usuario administrador Y a su navegador (cookie HttpOnly). */
export async function startOAuth(userId: string, provider: Provider, res: VercelResponse): Promise<string> {
  const state = randomToken(24);
  const nonce = randomToken(24);
  await admin().from("social_oauth_states").insert({
    state_hash: sha256(state),
    nonce_hash: sha256(nonce),
    user_id: userId,
    provider,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  res.setHeader("Set-Cookie", `${COOKIE}=${nonce}; Path=/api/oauth; Max-Age=600; HttpOnly; Secure; SameSite=Lax`);
  return provider === "meta" ? metaAuthUrl(redirectUri("meta"), state) : linkedinAuthUrl(redirectUri("linkedin"), state);
}

const cookieValue = (req: VercelRequest): string | null => {
  const m = (req.headers.cookie ?? "").match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return m ? m[1] : null;
};

async function upsertAccount(row: {
  network: string;
  externalId: string;
  displayName: string;
  targetKind: string;
  parentExternalId?: string;
  token: string;
  expiresAt?: Date | null;
  permissions: string[];
  userId: string;
  check: Awaited<ReturnType<typeof metaCheck>>;
}) {
  const db = admin();
  const base = {
    display_name: row.displayName,
    target_kind: row.targetKind,
    parent_external_id: row.parentExternalId ?? null,
    token_enc: encryptSecret(row.token),
    token_expires_at: row.expiresAt?.toISOString() ?? null,
    permissions: row.check.permissions ?? row.permissions,
    status: row.check.status,
    status_detail: row.check.detail ?? null,
    publish_enabled: row.check.publishEnabled,
    last_checked_at: new Date().toISOString(),
    connected_by: row.userId,
  };
  const { data: existing } = await db.from("social_accounts").select("id").eq("network", row.network).eq("external_id", row.externalId).maybeSingle();
  if (existing) await db.from("social_accounts").update(base).eq("id", existing.id);
  else await db.from("social_accounts").insert({ network: row.network, external_id: row.externalId, selected: false, ...base });
}

/** Callback del proveedor. Devuelve la ruta del panel a la que redirigir. */
export async function handleCallback(req: VercelRequest, provider: Provider): Promise<string> {
  const back = (q: string) => `/admin/social?${q}`;
  const { state, code, error } = req.query as Record<string, string | undefined>;
  if (error) return back(`error=${encodeURIComponent(error === "access_denied" ? "Cancelaste la autorización." : "El proveedor devolvió un error.")}`);
  if (!state || !code) return back("error=Respuesta+incompleta");
  const nonce = cookieValue(req);
  const db = admin();
  const { data: row } = await db.from("social_oauth_states").select("*").eq("state_hash", sha256(state)).eq("provider", provider).maybeSingle();
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now() || !nonce || !safeEqual(sha256(nonce), row.nonce_hash)) {
    return back("error=Autorización+inv%C3%A1lida+o+vencida.+Reintent%C3%A1+desde+el+panel.");
  }
  // Uso único: se marca antes de intercambiar el código.
  const { data: used } = await db.from("social_oauth_states").update({ used_at: new Date().toISOString() }).eq("state_hash", row.state_hash).is("used_at", null).select("state_hash");
  if (!used?.length) return back("error=Autorizaci%C3%B3n+ya+utilizada");
  const { data: adminRow } = await db.from("admin_users").select("role").eq("id", row.user_id).eq("role", "superadmin").maybeSingle();
  if (!adminRow) return back("error=No+autorizado");

  try {
    let count = 0;
    if (provider === "meta") {
      for (const t of await metaExchangeAndDiscover(code, redirectUri("meta"))) {
        const check = await metaCheck(t.network, t.externalId, t.token, t.permissions);
        await upsertAccount({ ...t, userId: row.user_id, check });
        count++;
      }
    } else {
      for (const t of await linkedinExchangeAndDiscover(code, redirectUri("linkedin"))) {
        const check = await linkedinCheck(t.targetKind, t.token, t.expiresAt, t.permissions);
        await upsertAccount({ network: "linkedin", ...t, userId: row.user_id, check });
        count++;
      }
    }
    return back(count ? `connected=${provider}` : "error=No+se+encontraron+p%C3%A1ginas+o+cuentas+para+conectar");
  } catch (e) {
    console.error("[social oauth]", sanitizeError(e));
    return back("error=No+se+pudo+completar+la+conexi%C3%B3n");
  }
}
