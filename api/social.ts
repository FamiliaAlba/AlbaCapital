import { randomBytes } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkPieceForNetwork, FORMATS, NETWORK_RULES } from "../src/lib/social/formats.js";
import { readJpegSize } from "../src/lib/social/jpeg.js";
import { withUtm } from "../src/lib/social/utm.js";
import type { FormatId, Network, PieceInfo } from "../src/lib/social/types.js";
import { rateLimit, requireAdmin, requireEnabled } from "../server/social/auth.js";
import { decryptSecret, encryptSecret } from "../server/social/crypto.js";
import { admin } from "../server/social/db.js";
import { configStatus, env } from "../server/social/env.js";
import { assertSameOrigin, fail, HttpError, json } from "../server/social/http.js";
import { loadOpportunity } from "../server/social/opportunity.js";
import { redirectUri, startOAuth, type Provider } from "../server/social/oauth.js";
import { idempotencyKey, processDelivery, reconcileDelivery, sweepStale } from "../server/social/publish.js";
import { sanitizeError } from "../server/social/sanitize.js";
import { metaCheck } from "../server/social/connectors/meta.js";
import { linkedinCheck } from "../server/social/connectors/linkedin.js";
import { telegramCheck, telegramVerify } from "../server/social/connectors/telegram.js";

export const config = { maxDuration: 60 };

const SAFE_ACCOUNT_COLS =
  "id, network, external_id, display_name, target_kind, parent_external_id, status, status_detail, selected, is_default, publish_enabled, permissions, token_expires_at, last_checked_at, created_at";

const NETWORKS: Network[] = ["instagram", "facebook", "linkedin", "telegram"];
const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
const str = (v: unknown, max: number): string => (typeof v === "string" ? v.slice(0, max) : "");

type Body = Record<string, unknown>;

async function accountsList() {
  const { data } = await admin().from("social_accounts").select(SAFE_ACCOUNT_COLS).order("network").order("display_name");
  return data ?? [];
}

async function runCheck(id: string) {
  const db = admin();
  const { data: a } = await db.from("social_accounts").select("*").eq("id", id).maybeSingle();
  if (!a) throw new HttpError(404, "Cuenta no encontrada");
  if (!a.token_enc) throw new HttpError(409, "La cuenta está desconectada");
  const token = decryptSecret(a.token_enc);
  let check;
  if (a.network === "telegram") check = await telegramCheck(token, a.external_id);
  else if (a.network === "linkedin")
    check = await linkedinCheck(a.target_kind, token, a.token_expires_at ? new Date(a.token_expires_at) : null, a.permissions ?? []);
  else check = await metaCheck(a.network, a.external_id, token, a.permissions ?? []);
  await db
    .from("social_accounts")
    .update({
      status: check.status,
      status_detail: check.detail ?? null,
      publish_enabled: check.publishEnabled,
      permissions: check.permissions ?? a.permissions,
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", id);
}

async function postsFor(opportunityId: string) {
  const db = admin();
  const opp = await loadOpportunity(opportunityId);
  if (!opp) throw new HttpError(404, "Oportunidad no encontrada");
  const { data: posts } = await db.from("social_posts").select("*").eq("opportunity_id", opportunityId).order("updated_at", { ascending: false }).limit(20);
  const { data: deliveries } = await db
    .from("social_deliveries")
    .select("id, post_id, content_version, account_id, network, format, status, error, external_id, external_url, attempts, published_at, confirmed_at, created_at, social_accounts(display_name)")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(100);
  return {
    opportunity: opp,
    posts: (posts ?? []).map((p) => ({ ...p, outdated: !!p.opportunity_hash && p.opportunity_hash !== opp.hash })),
    deliveries: deliveries ?? [],
  };
}

const sanitizeContent = (c: Body) => {
  const captions: Record<string, string> = {};
  const edited: Record<string, boolean> = {};
  const rawCaps = (c.captions ?? {}) as Record<string, unknown>;
  const rawEdited = (c.captionEdited ?? {}) as Record<string, unknown>;
  for (const n of NETWORKS) {
    if (typeof rawCaps[n] === "string") captions[n] = (rawCaps[n] as string).slice(0, NETWORK_RULES[n].maxCaption);
    if (rawEdited[n] === true) edited[n] = true;
  }
  const f = (c.focus ?? {}) as { x?: number; y?: number };
  const clamp = (n: unknown, d: number) => (typeof n === "number" && n >= 0 && n <= 1 ? n : d);
  return {
    title: str(c.title, 150),
    description: str(c.description, 2000),
    cta: str(c.cta, 200),
    imageUrl: str(c.imageUrl, 2000),
    focus: { x: clamp(f.x, 0.5), y: clamp(f.y, 0.5) },
    zoom: typeof c.zoom === "number" && c.zoom >= 1 && c.zoom <= 3 ? c.zoom : 1,
    captions,
    captionEdited: edited,
    pieceSig: str(c.pieceSig, 64),
    format: FORMATS[c.format as FormatId] ? (c.format as FormatId) : "square",
  };
};

async function handle(action: string, body: Body, req: VercelRequest, res: VercelResponse): Promise<void> {
  const cfg = configStatus();
  assertSameOrigin(req, [new URL(cfg.siteUrl).host]);
  if (cfg.base.length) {
    // Sin credenciales de servidor el módulo queda inoperante pero informa qué falta.
    if (action === "status") return json(res, 200, { ready: false, config: cfg, accounts: [], settings: null });
    throw new HttpError(503, "El módulo no está configurado en el servidor");
  }
  const { userId } = await requireAdmin(req);
  const db = admin();
  if (action === "status") {
    const { data: settings } = await db.from("social_settings").select("enabled, default_cta, design").eq("id", true).maybeSingle();
    await sweepStale();
    return json(res, 200, { ready: true, config: { ...cfg, redirectUris: { meta: redirectUri("meta"), linkedin: redirectUri("linkedin") } }, settings, accounts: await accountsList() });
  }
  await requireEnabled();

  switch (action) {
    case "settings_update": {
      const patch: Body = { updated_by: userId };
      if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
      if (typeof body.default_cta === "string" && body.default_cta.trim()) patch.default_cta = body.default_cta.trim().slice(0, 200);
      await db.from("social_settings").update(patch).eq("id", true);
      return json(res, 200, { ok: true });
    }
    case "oauth_start": {
      const provider = body.provider as Provider;
      if (provider !== "meta" && provider !== "linkedin") throw new HttpError(400, "Proveedor inválido");
      const missing = cfg[provider];
      if (missing.length) throw new HttpError(409, `Falta configurar: ${missing.join(", ")}`);
      await rateLimit(userId, "oauth_start", 10, 3600);
      return json(res, 200, { url: await startOAuth(userId, provider, res) });
    }
    case "telegram_connect": {
      await rateLimit(userId, "telegram_connect", 10, 3600);
      const botToken = str(body.botToken, 200).trim();
      const chatId = str(body.chatId, 100).trim();
      if (!/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(botToken) || !chatId) throw new HttpError(400, "Token de bot o identificador de canal inválido");
      let v;
      try {
        v = await telegramVerify(botToken, chatId);
      } catch (e) {
        throw new HttpError(422, sanitizeError(e));
      }
      const row = {
        display_name: v.title,
        target_kind: "channel",
        token_enc: encryptSecret(botToken),
        status: v.check.status,
        status_detail: v.check.detail ?? null,
        publish_enabled: v.check.publishEnabled,
        permissions: v.check.permissions ?? [],
        last_checked_at: new Date().toISOString(),
        connected_by: userId,
        meta: { bot: v.botName },
      };
      const { data: ex } = await db.from("social_accounts").select("id").eq("network", "telegram").eq("external_id", v.chatNumericId).maybeSingle();
      if (ex) await db.from("social_accounts").update(row).eq("id", ex.id);
      else await db.from("social_accounts").insert({ network: "telegram", external_id: v.chatNumericId, selected: true, ...row });
      return json(res, 200, { ok: true, accounts: await accountsList() });
    }
    case "account_update": {
      if (!isUuid(body.id)) throw new HttpError(400, "id inválido");
      const patch: Body = {};
      if (typeof body.selected === "boolean") patch.selected = body.selected;
      if (typeof body.is_default === "boolean") patch.is_default = body.is_default;
      await db.from("social_accounts").update(patch).eq("id", body.id);
      return json(res, 200, { accounts: await accountsList() });
    }
    case "account_check": {
      if (!isUuid(body.id)) throw new HttpError(400, "id inválido");
      await rateLimit(userId, "account_check", 60, 3600);
      await runCheck(body.id);
      return json(res, 200, { accounts: await accountsList() });
    }
    case "account_disconnect": {
      if (!isUuid(body.id)) throw new HttpError(400, "id inválido");
      // Se descartan los tokens; la cuenta queda para conservar el historial. La revocación en el proveedor se hace desde su configuración.
      await db.from("social_accounts").update({ token_enc: null, token_expires_at: null, selected: false, is_default: false, publish_enabled: false, status: "needs_reconnect", status_detail: "Desconectada" }).eq("id", body.id);
      return json(res, 200, { accounts: await accountsList() });
    }
    case "post_list": {
      if (!isUuid(body.opportunityId)) throw new HttpError(400, "oportunidad inválida");
      await sweepStale();
      return json(res, 200, { ...(await postsFor(body.opportunityId)), accounts: await accountsList(), settings: (await db.from("social_settings").select("enabled, default_cta").eq("id", true).maybeSingle()).data });
    }
    case "post_save": {
      if (!isUuid(body.opportunityId)) throw new HttpError(400, "oportunidad inválida");
      const opp = await loadOpportunity(body.opportunityId);
      if (!opp) throw new HttpError(404, "Oportunidad no encontrada");
      const content = sanitizeContent((body.content ?? {}) as Body);
      if (!content.title.trim()) throw new HttpError(400, "El título es obligatorio");
      if (isUuid(body.postId)) {
        const { data: cur } = await db.from("social_posts").select("content_version, opportunity_id").eq("id", body.postId).maybeSingle();
        if (!cur || cur.opportunity_id !== opp.id) throw new HttpError(404, "Borrador no encontrado");
        // Si la versión actual ya tuvo envíos, el cambio crea una versión nueva: lo ya publicado no se toca.
        const { count } = await db.from("social_deliveries").select("id", { count: "exact", head: true }).eq("post_id", body.postId).eq("content_version", cur.content_version);
        const version = (count ?? 0) > 0 ? cur.content_version + 1 : cur.content_version;
        const patch: Body = { content, content_version: version, updated_by: userId, status: body.generated ? "generated" : "draft" };
        if (body.acceptCurrent === true) patch.opportunity_hash = opp.hash;
        await db.from("social_posts").update(patch).eq("id", body.postId);
        return json(res, 200, { id: body.postId, version });
      }
      const { data: created, error } = await db.from("social_posts").insert({ opportunity_id: opp.id, content, opportunity_hash: opp.hash, created_by: userId, updated_by: userId, status: "draft" }).select("id, content_version").single();
      if (error || !created) throw error ?? new Error("insert");
      return json(res, 200, { id: created.id, version: created.content_version });
    }
    case "upload_piece": {
      if (!isUuid(body.postId) || !FORMATS[body.format as FormatId]) throw new HttpError(400, "Datos inválidos");
      await rateLimit(userId, "upload_piece", 60, 3600);
      const format = body.format as FormatId;
      const b64 = str(body.data, 6_000_000);
      const bytes = new Uint8Array(Buffer.from(b64, "base64"));
      if (!bytes.length || bytes.length > 3_000_000) throw new HttpError(413, "La imagen debe pesar hasta 3 MB");
      const dims = readJpegSize(bytes);
      if (!dims) throw new HttpError(415, "La pieza debe ser un JPEG válido");
      if (dims.width !== FORMATS[format].width || dims.height !== FORMATS[format].height) throw new HttpError(422, "Las dimensiones no coinciden con el formato");
      const { data: post } = await db.from("social_posts").select("pieces").eq("id", body.postId).maybeSingle();
      if (!post) throw new HttpError(404, "Borrador no encontrado");
      const path = `${body.postId}/${format}-${randomBytes(12).toString("hex")}.jpg`;
      const up = await db.storage.from("social-pieces").upload(path, bytes, { contentType: "image/jpeg", upsert: false });
      if (up.error) throw up.error;
      const url = db.storage.from("social-pieces").getPublicUrl(path).data.publicUrl;
      const info: PieceInfo & { sig: string } = { url, width: dims.width, height: dims.height, bytes: bytes.length, sig: str(body.sig, 64) };
      const old = (post.pieces as Record<string, PieceInfo>)[format];
      await db.from("social_posts").update({ pieces: { ...(post.pieces as object), [format]: info } }).eq("id", body.postId);
      if (old?.url) await db.storage.from("social-pieces").remove([old.url.split("/social-pieces/")[1]]);
      return json(res, 200, { piece: info });
    }
    case "publish": {
      if (!isUuid(body.postId) || body.confirm !== true) throw new HttpError(400, "Falta la confirmación explícita");
      const targets = Array.isArray(body.targets) ? (body.targets as Body[]).slice(0, 12) : [];
      if (!targets.length) throw new HttpError(400, "Elegí al menos una cuenta");
      await rateLimit(userId, "publish", 30, 3600);
      const { data: post } = await db.from("social_posts").select("*").eq("id", body.postId).maybeSingle();
      if (!post) throw new HttpError(404, "Borrador no encontrado");
      const opp = await loadOpportunity(post.opportunity_id);
      if (!opp || !opp.published) throw new HttpError(409, "La oportunidad no está publicada en el sitio");
      const content = post.content as ReturnType<typeof sanitizeContent>;
      const results: { accountId: string; ok: boolean; reason?: string; deliveryId?: string }[] = [];
      const toRun: string[] = [];
      for (const t of targets) {
        const accountId = String(t.accountId);
        const fail1 = (reason: string) => results.push({ accountId, ok: false, reason });
        if (!isUuid(accountId)) { fail1("Cuenta inválida"); continue; }
        const { data: acc } = await db.from("social_accounts").select("id, network, status, publish_enabled, selected").eq("id", accountId).maybeSingle();
        if (!acc) { fail1("Cuenta inexistente"); continue; }
        if (!acc.selected || acc.status !== "connected" || !acc.publish_enabled) { fail1("La cuenta no está habilitada para publicar"); continue; }
        const format = t.format as FormatId;
        const piece = (post.pieces as Record<string, PieceInfo & { sig?: string }>)[format];
        if (!FORMATS[format] || !piece) { fail1("Generá primero la pieza de ese formato"); continue; }
        if (!content.pieceSig || piece.sig !== content.pieceSig) { fail1("La pieza no corresponde al contenido guardado: guardá y generá de nuevo"); continue; }
        const net = acc.network as Network;
        const check = checkPieceForNetwork(net, format, piece);
        if (!check.ok) { fail1(check.reason!); continue; }
        const caption = str(t.caption, 6000);
        if (!caption.trim() || caption.length > NETWORK_RULES[net].maxCaption) { fail1(`El texto debe tener entre 1 y ${NETWORK_RULES[net].maxCaption} caracteres`); continue; }
        const link = withUtm(opp.url, net, opp.slug);
        const key = idempotencyKey(post.id, post.content_version, accountId);
        const { data: ins, error } = await db
          .from("social_deliveries")
          .insert({ post_id: post.id, opportunity_id: opp.id, content_version: post.content_version, account_id: accountId, network: net, format, status: "queued", payload: { caption, link, altText: opp.photoAlt || opp.title }, idempotency_key: key, confirmed_by: userId })
          .select("id")
          .single();
        if (error) {
          // Violación de unicidad: ya existe un envío de esta versión a esta cuenta. No se duplica.
          const { data: ex } = await db.from("social_deliveries").select("id, status").eq("idempotency_key", key).maybeSingle();
          results.push({ accountId, ok: false, reason: ex ? `Ya existe un envío de esta versión a esta cuenta (${ex.status}).` : "No se pudo registrar el envío", deliveryId: ex?.id });
          continue;
        }
        results.push({ accountId, ok: true, deliveryId: ins.id });
        toRun.push(ins.id);
      }
      // Cada red se procesa por separado: una falla no cancela ni duplica las demás.
      await Promise.allSettled(toRun.map((id) => processDelivery(id)));
      return json(res, 200, { results, ...(await postsFor(post.opportunity_id)) });
    }
    case "retry": {
      if (!isUuid(body.deliveryId)) throw new HttpError(400, "id inválido");
      await rateLimit(userId, "retry", 30, 3600);
      const { data: d } = await db.from("social_deliveries").select("status, opportunity_id").eq("id", body.deliveryId).maybeSingle();
      if (!d) throw new HttpError(404, "Envío no encontrado");
      if (d.status !== "failed") throw new HttpError(409, "Solo se reintentan envíos fallidos confirmados");
      await db.from("social_deliveries").update({ next_attempt_at: null }).eq("id", body.deliveryId);
      await processDelivery(body.deliveryId);
      return json(res, 200, await postsFor(d.opportunity_id));
    }
    case "reconcile": {
      if (!isUuid(body.deliveryId)) throw new HttpError(400, "id inválido");
      const outcome = await reconcileDelivery(body.deliveryId);
      return json(res, 200, { outcome });
    }
    case "resolve": {
      if (!isUuid(body.deliveryId)) throw new HttpError(400, "id inválido");
      const { data: d } = await db.from("social_deliveries").select("status, opportunity_id").eq("id", body.deliveryId).maybeSingle();
      if (!d || d.status !== "needs_review") throw new HttpError(409, "El envío no requiere revisión");
      if (body.outcome === "published") {
        await db.from("social_deliveries").update({ status: "published", published_at: new Date().toISOString(), external_url: str(body.externalUrl, 500) || null, error: null, confirmed_by: userId }).eq("id", body.deliveryId);
      } else if (body.outcome === "not_published") {
        await db.from("social_deliveries").update({ status: "failed", attempts: 0, provider_state: {}, error: "Verificado manualmente: no se publicó.", confirmed_by: userId }).eq("id", body.deliveryId);
      } else throw new HttpError(400, "Resultado inválido");
      return json(res, 200, await postsFor(d.opportunity_id));
    }
    case "history": {
      const q = db
        .from("social_deliveries")
        .select("id, opportunity_id, network, format, status, error, external_url, attempts, published_at, created_at, social_accounts(display_name), opportunities(slug)")
        .order("created_at", { ascending: false })
        .limit(150);
      const { data } = await (isUuid(body.opportunityId) ? q.eq("opportunity_id", body.opportunityId) : q);
      return json(res, 200, { deliveries: data ?? [] });
    }
    default:
      throw new HttpError(400, "Acción desconocida");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Método no permitido" });
  try {
    const body = (typeof req.body === "object" && req.body ? req.body : {}) as Body;
    await handle(String(body.action ?? ""), body, req, res);
  } catch (e) {
    fail(res, e);
  }
}
