import { env } from "../env.js";
import { ProviderError, sanitizeError } from "../sanitize.js";
import { providerError, requestJson, sleep } from "./fetch.js";
import type { AccountCheck, PublishContext, PublishResult } from "./types.js";

/**
 * Flujo elegido: Facebook Login (graph.facebook.com). Cubre Páginas de Facebook e Instagram
 * profesional vinculado a una Página. NO se usa Instagram Login: no se mezclan permisos.
 * Permisos: pages_show_list, pages_read_engagement, pages_manage_posts,
 * instagram_basic, instagram_content_publish. En modo desarrollo funcionan solo para
 * usuarios con rol en la app; para uso general requieren App Review de Meta.
 */
export const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
];

const graph = (path: string) => `https://graph.facebook.com/${env.metaGraphVersion()}${path}`;

export function metaAuthUrl(redirectUri: string, state: string): string {
  const u = new URL(`https://www.facebook.com/${env.metaGraphVersion()}/dialog/oauth`);
  u.searchParams.set("client_id", env.metaAppId()!);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", META_SCOPES.join(","));
  return u.toString();
}

export interface DiscoveredTarget {
  network: "facebook" | "instagram";
  externalId: string;
  displayName: string;
  targetKind: "page" | "ig_business";
  parentExternalId?: string;
  token: string;
  permissions: string[];
}

interface GraphError {
  error?: { message?: string; code?: number; type?: string };
}

const errMsg = (b: GraphError) => b.error?.message ?? "Error de Meta";

/** Intercambia el code por un token de larga duración y descubre Páginas y cuentas de Instagram. */
export async function metaExchangeAndDiscover(code: string, redirectUri: string): Promise<DiscoveredTarget[]> {
  const q = new URLSearchParams({
    client_id: env.metaAppId()!,
    client_secret: env.metaAppSecret()!,
    redirect_uri: redirectUri,
    code,
  });
  const short = await requestJson<{ access_token?: string } & GraphError>(graph(`/oauth/access_token?${q}`));
  if (!short.body.access_token) throw providerError(short.status, errMsg(short.body));

  const q2 = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: env.metaAppId()!,
    client_secret: env.metaAppSecret()!,
    fb_exchange_token: short.body.access_token,
  });
  const long = await requestJson<{ access_token?: string } & GraphError>(graph(`/oauth/access_token?${q2}`));
  const userToken = long.body.access_token ?? short.body.access_token;

  const granted = await requestJson<{ data?: { permission: string; status: string }[] }>(
    graph("/me/permissions"),
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  const permissions = (granted.body.data ?? []).filter((p) => p.status === "granted").map((p) => p.permission);

  const pages = await requestJson<{ data?: { id: string; name: string; access_token: string; instagram_business_account?: { id: string; username?: string } }[] } & GraphError>(
    graph(`/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100`),
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  if (pages.status >= 400) throw providerError(pages.status, errMsg(pages.body));

  const out: DiscoveredTarget[] = [];
  for (const p of pages.body.data ?? []) {
    out.push({ network: "facebook", externalId: p.id, displayName: p.name, targetKind: "page", token: p.access_token, permissions });
    if (p.instagram_business_account) {
      out.push({
        network: "instagram",
        externalId: p.instagram_business_account.id,
        displayName: p.instagram_business_account.username ? `@${p.instagram_business_account.username}` : `Instagram de ${p.name}`,
        targetKind: "ig_business",
        parentExternalId: p.id,
        token: p.access_token,
        permissions,
      });
    }
  }
  return out;
}

const need: Record<string, string[]> = {
  facebook: ["pages_manage_posts", "pages_read_engagement"],
  instagram: ["instagram_content_publish", "instagram_basic"],
};

export async function metaCheck(network: "facebook" | "instagram", externalId: string, token: string, permissions: string[]): Promise<AccountCheck> {
  const r = await requestJson<GraphError & { name?: string; username?: string }>(
    graph(`/${externalId}?fields=${network === "facebook" ? "name" : "username"}`),
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (r.status === 401 || r.body.error?.code === 190) {
    return { status: "needs_reconnect", publishEnabled: false, detail: "El token venció o fue revocado. Reconectá la cuenta." };
  }
  if (r.status >= 400) return { status: "insufficient_permissions", publishEnabled: false, detail: sanitizeError(errMsg(r.body)) };
  const missing = need[network].filter((p) => !permissions.includes(p));
  if (missing.length) {
    return {
      status: "insufficient_permissions",
      publishEnabled: false,
      detail: `Faltan permisos: ${missing.join(", ")}. En modo desarrollo solo funcionan para usuarios con rol en la app; para uso general Meta exige App Review.`,
      permissions,
    };
  }
  return { status: "connected", publishEnabled: true, permissions };
}

export async function publishFacebook(ctx: PublishContext): Promise<PublishResult> {
  const body = new URLSearchParams({ url: ctx.imageUrl, caption: ctx.caption, published: "true" });
  const r = await requestJson<{ id?: string; post_id?: string } & GraphError>(graph(`/${ctx.externalId}/photos`), {
    method: "POST",
    headers: { Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (r.status >= 400 || !(r.body.post_id || r.body.id)) throw providerError(r.status, errMsg(r.body));
  const id = r.body.post_id ?? r.body.id!;
  return { externalId: id, externalUrl: `https://www.facebook.com/${id}` };
}

export async function publishInstagram(ctx: PublishContext): Promise<PublishResult> {
  let creationId = typeof ctx.state.creationId === "string" ? ctx.state.creationId : undefined;
  if (!creationId) {
    const c = await requestJson<{ id?: string } & GraphError>(graph(`/${ctx.externalId}/media`), {
      method: "POST",
      headers: { Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ image_url: ctx.imageUrl, caption: ctx.caption }),
    });
    if (c.status >= 400 || !c.body.id) throw providerError(c.status, errMsg(c.body));
    creationId = c.body.id;
    await ctx.saveState({ creationId });
  }
  // Comprobación de procesamiento: el contenedor debe estar FINISHED antes de publicar.
  let finished = false;
  for (let i = 0; i < 8 && !finished; i++) {
    const s = await requestJson<{ status_code?: string } & GraphError>(graph(`/${creationId}?fields=status_code`), {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    const code = s.body.status_code;
    if (code === "FINISHED") finished = true;
    else if (code === "PUBLISHED") return { externalId: creationId };
    else if (code === "ERROR" || code === "EXPIRED") throw new ProviderError(`Instagram no pudo procesar la imagen (${code}).`);
    else await sleep(2500);
  }
  if (!finished) throw new ProviderError("Instagram sigue procesando la imagen; verificá el estado más tarde.", true, true);

  const p = await requestJson<{ id?: string } & GraphError>(graph(`/${ctx.externalId}/media_publish`), {
    method: "POST",
    headers: { Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: creationId }),
  });
  if (p.status >= 400 || !p.body.id) throw providerError(p.status, errMsg(p.body));
  let permalink: string | undefined;
  const pl = await requestJson<{ permalink?: string }>(graph(`/${p.body.id}?fields=permalink`), {
    headers: { Authorization: `Bearer ${ctx.token}` },
  });
  if (pl.body.permalink) permalink = pl.body.permalink;
  return { externalId: p.body.id, externalUrl: permalink };
}

/** Reconciliación: si el contenedor figura PUBLISHED, la publicación ocurrió. */
export async function reconcileInstagram(token: string, creationId: string): Promise<"published" | "not_published" | "unknown"> {
  const s = await requestJson<{ status_code?: string }>(graph(`/${creationId}?fields=status_code`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (s.body.status_code === "PUBLISHED") return "published";
  if (s.body.status_code === "FINISHED" || s.body.status_code === "ERROR" || s.body.status_code === "EXPIRED") return "not_published";
  return "unknown";
}
