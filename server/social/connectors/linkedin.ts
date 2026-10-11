import { env } from "../env.js";
import { ProviderError } from "../sanitize.js";
import { providerError, request, requestJson } from "./fetch.js";
import type { AccountCheck, PublishContext, PublishResult } from "./types.js";

/**
 * LinkedIn: OAuth 2.0 (3-legged). Perfil personal: scopes openid, profile, w_member_social
 * (producto "Share on LinkedIn"). Páginas de empresa: w_organization_social +
 * r_organization_admin, que exigen el producto "Community Management API" aprobado por
 * LinkedIn; se piden solo si LINKEDIN_ENABLE_ORG_PAGES=true. PKCE no se usa: LinkedIn lo
 * admite solo para apps nativas; el flujo web usa state de un solo uso + cookie de sesión.
 */
export function linkedinScopes(): string[] {
  const base = ["openid", "profile", "w_member_social"];
  return env.linkedinOrgScopes() ? [...base, "w_organization_social", "r_organization_admin"] : base;
}

export function linkedinAuthUrl(redirectUri: string, state: string): string {
  const u = new URL("https://www.linkedin.com/oauth/v2/authorization");
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", env.linkedinClientId()!);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("scope", linkedinScopes().join(" "));
  return u.toString();
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Linkedin-Version": env.linkedinVersion(),
  "X-Restli-Protocol-Version": "2.0.0",
});

export interface LinkedinTarget {
  externalId: string;
  displayName: string;
  targetKind: "member" | "organization";
  token: string;
  expiresAt: Date;
  permissions: string[];
  pending?: string;
}

export async function linkedinExchangeAndDiscover(code: string, redirectUri: string): Promise<LinkedinTarget[]> {
  const t = await requestJson<{ access_token?: string; expires_in?: number; scope?: string; error_description?: string }>(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: env.linkedinClientId()!,
        client_secret: env.linkedinClientSecret()!,
      }),
    },
  );
  if (!t.body.access_token) throw providerError(t.status, t.body.error_description ?? "LinkedIn rechazó el código");
  const token = t.body.access_token;
  const expiresAt = new Date(Date.now() + (t.body.expires_in ?? 5184000) * 1000);
  const permissions = (t.body.scope ?? "").split(/[ ,]+/).filter(Boolean);

  const me = await requestJson<{ sub?: string; name?: string }>("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!me.body.sub) throw providerError(me.status, "No se pudo leer el perfil de LinkedIn");
  const out: LinkedinTarget[] = [
    { externalId: me.body.sub, displayName: me.body.name ?? "Perfil de LinkedIn", targetKind: "member", token, expiresAt, permissions },
  ];

  if (permissions.includes("w_organization_social")) {
    const acl = await requestJson<{ elements?: { organization?: string }[] }>(
      "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      { headers: headers(token) },
    );
    for (const el of acl.body.elements ?? []) {
      const id = el.organization?.split(":").pop();
      if (!id) continue;
      const org = await requestJson<{ localizedName?: string }>(`https://api.linkedin.com/rest/organizations/${id}`, { headers: headers(token) });
      out.push({ externalId: id, displayName: org.body.localizedName ?? `Página ${id}`, targetKind: "organization", token, expiresAt, permissions });
    }
  }
  return out;
}

export async function linkedinCheck(
  kind: string,
  token: string,
  expiresAt: Date | null,
  permissions: string[],
): Promise<AccountCheck> {
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    return { status: "needs_reconnect", publishEnabled: false, detail: "El token de LinkedIn venció (dura unos 60 días). Reconectá la cuenta." };
  }
  const r = await requestJson("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 401) return { status: "needs_reconnect", publishEnabled: false, detail: "Token inválido o revocado." };
  const scope = kind === "organization" ? "w_organization_social" : "w_member_social";
  if (!permissions.includes(scope)) {
    return {
      status: kind === "organization" ? "pending_approval" : "insufficient_permissions",
      publishEnabled: false,
      detail:
        kind === "organization"
          ? "Publicar en páginas de empresa requiere el producto Community Management API aprobado por LinkedIn."
          : "Falta el permiso w_member_social (producto Share on LinkedIn).",
      permissions,
    };
  }
  return { status: "connected", publishEnabled: true, permissions };
}

export async function publishLinkedin(ctx: PublishContext, imageBytes: Uint8Array): Promise<PublishResult> {
  const owner = ctx.targetKind === "organization" ? `urn:li:organization:${ctx.externalId}` : `urn:li:person:${ctx.externalId}`;
  const init = await requestJson<{ value?: { uploadUrl?: string; image?: string } }>(
    "https://api.linkedin.com/rest/images?action=initializeUpload",
    {
      method: "POST",
      headers: { ...headers(ctx.token), "Content-Type": "application/json" },
      body: JSON.stringify({ initializeUploadRequest: { owner } }),
    },
  );
  const uploadUrl = init.body.value?.uploadUrl;
  const imageUrn = init.body.value?.image;
  if (!uploadUrl || !imageUrn) throw providerError(init.status, "LinkedIn no devolvió la URL de carga");

  const put = await request(uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/octet-stream" }, body: imageBytes as unknown as BodyInit }, 30000);
  if (!put.ok) throw providerError(put.status, "Falló la carga de la imagen a LinkedIn");

  const post = await request("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: { ...headers(ctx.token), "Content-Type": "application/json" },
    body: JSON.stringify({
      author: owner,
      commentary: ctx.caption,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { id: imageUrn, altText: ctx.altText.slice(0, 4000) } },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (post.status !== 201) {
    const text = await post.text();
    throw providerError(post.status, `LinkedIn rechazó la publicación: ${text.slice(0, 160)}`);
  }
  const id = post.headers.get("x-restli-id");
  if (!id) throw new ProviderError("LinkedIn respondió 201 sin identificador de publicación", true);
  return { externalId: id, externalUrl: `https://www.linkedin.com/feed/update/${id}/` };
}
