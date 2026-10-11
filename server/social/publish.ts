import { createHash } from "node:crypto";
import { checkPieceForNetwork, NETWORK_RULES } from "../../src/lib/social/formats.js";
import type { FormatId, Network, PieceInfo } from "../../src/lib/social/types.js";
import { decryptSecret } from "./crypto.js";
import { admin } from "./db.js";
import { env } from "./env.js";
import { ProviderError, sanitizeError } from "./sanitize.js";
import { publishLinkedin } from "./connectors/linkedin.js";
import { publishFacebook, publishInstagram, reconcileInstagram } from "./connectors/meta.js";
import { publishTelegram } from "./connectors/telegram.js";
import { request } from "./connectors/fetch.js";
import type { PublishContext } from "./connectors/types.js";

export const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 120;

export const idempotencyKey = (postId: string, version: number, accountId: string): string =>
  createHash("sha256").update(`${postId}:${version}:${accountId}`).digest("hex");

/** Backoff progresivo (segundos) tras un fallo confirmado y reintentable. */
export const backoffSeconds = (attempts: number): number => Math.min(60 * 2 ** Math.max(0, attempts - 1), 900);

/** Las imágenes que se envían a los proveedores solo pueden salir del bucket propio (evita SSRF/archivos ajenos). */
export function isOwnPieceUrl(url: string): boolean {
  const base = env.supabaseUrl();
  return !!base && url.startsWith(`${base.replace(/\/+$/, "")}/storage/v1/object/public/social-pieces/`);
}

interface DeliveryRow {
  id: string;
  post_id: string;
  account_id: string;
  network: Network;
  format: FormatId;
  content_version: number;
  payload: { caption: string; link: string; altText: string };
  provider_state: Record<string, unknown>;
  attempts: number;
}

export async function processDelivery(id: string): Promise<void> {
  const db = admin();
  const now = new Date().toISOString();
  // Reclamo atómico: solo un proceso puede pasar a "processing". Evita duplicados por doble clic o reintentos concurrentes.
  const { data: claimed } = await db
    .from("social_deliveries")
    .update({ status: "processing", locked_until: new Date(Date.now() + LOCK_SECONDS * 1000).toISOString(), error: null })
    .eq("id", id)
    .or(`status.eq.queued,and(status.eq.failed,attempts.lt.${MAX_ATTEMPTS},or(next_attempt_at.is.null,next_attempt_at.lte.${now}))`)
    .select("*")
    .maybeSingle();
  if (!claimed) return;
  const d = claimed as unknown as DeliveryRow;
  const attempts = d.attempts + 1;

  const finish = async (patch: Record<string, unknown>) => {
    await db.from("social_deliveries").update({ locked_until: null, attempts, ...patch }).eq("id", id);
  };

  try {
    const { data: acc } = await db.from("social_accounts").select("*").eq("id", d.account_id).maybeSingle();
    if (!acc || acc.status !== "connected" || !acc.publish_enabled || !acc.token_enc) {
      return await finish({ status: "failed", error: "La cuenta no está habilitada para publicar. Revisá su estado en Marketing → Redes sociales.", next_attempt_at: null, attempts: MAX_ATTEMPTS });
    }
    if (acc.token_expires_at && new Date(acc.token_expires_at).getTime() < Date.now()) {
      await db.from("social_accounts").update({ status: "needs_reconnect", publish_enabled: false, status_detail: "El token venció." }).eq("id", acc.id);
      return await finish({ status: "failed", error: "El token de la cuenta venció. Reconectala.", attempts: MAX_ATTEMPTS });
    }

    const { data: post } = await db.from("social_posts").select("pieces").eq("id", d.post_id).maybeSingle();
    const piece = (post?.pieces as Record<string, PieceInfo> | undefined)?.[d.format];
    if (!piece || !isOwnPieceUrl(piece.url)) {
      return await finish({ status: "failed", error: "La pieza gráfica no está generada o su URL no es válida.", attempts: MAX_ATTEMPTS });
    }
    const check = checkPieceForNetwork(d.network, d.format, piece);
    if (!check.ok) return await finish({ status: "failed", error: check.reason, attempts: MAX_ATTEMPTS });
    if (d.payload.caption.length > NETWORK_RULES[d.network].maxCaption) {
      return await finish({ status: "failed", error: "El texto supera el límite de la red.", attempts: MAX_ATTEMPTS });
    }

    const ctx: PublishContext = {
      token: decryptSecret(acc.token_enc),
      externalId: acc.external_id,
      parentExternalId: acc.parent_external_id,
      targetKind: acc.target_kind,
      caption: d.payload.caption,
      imageUrl: piece.url,
      link: d.payload.link,
      altText: d.payload.altText,
      state: d.provider_state ?? {},
      saveState: async (state) => {
        await db.from("social_deliveries").update({ provider_state: { ...(d.provider_state ?? {}), ...state } }).eq("id", id);
      },
    };

    let result;
    if (d.network === "facebook") result = await publishFacebook(ctx);
    else if (d.network === "instagram") result = await publishInstagram(ctx);
    else if (d.network === "telegram") result = await publishTelegram(ctx);
    else {
      const img = await request(piece.url, {}, 20000);
      if (!img.ok) throw new ProviderError("No se pudo leer la pieza para subirla a LinkedIn");
      result = await publishLinkedin(ctx, new Uint8Array(await img.arrayBuffer()));
    }
    // Solo ahora, con confirmación real del proveedor, se marca publicado.
    await finish({
      status: "published",
      external_id: result.externalId,
      external_url: result.externalUrl ?? null,
      published_at: new Date().toISOString(),
      next_attempt_at: null,
      error: null,
    });
  } catch (e) {
    const msg = sanitizeError(e);
    if (e instanceof ProviderError && e.uncertain) {
      // La solicitud pudo haber llegado: no se repite automáticamente.
      return await finish({ status: "needs_review", error: `${msg} — resultado incierto, revisá en la red antes de reintentar.` });
    }
    const retryable = e instanceof ProviderError && e.retryable && attempts < MAX_ATTEMPTS;
    await finish({
      status: "failed",
      error: msg,
      next_attempt_at: retryable ? new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString() : null,
      attempts: retryable ? attempts : MAX_ATTEMPTS,
    });
  }
}

/** Trabajos "processing" cuyo bloqueo venció: el proceso murió a mitad de camino → revisión manual, nunca reintento ciego. */
export async function sweepStale(): Promise<void> {
  const db = admin();
  const now = new Date().toISOString();
  await db
    .from("social_deliveries")
    .update({ status: "needs_review", locked_until: null, error: "El envío se interrumpió y su resultado es incierto. Verificá en la red." })
    .eq("status", "processing")
    .lt("locked_until", now);
}

/** Intenta resolver un envío incierto consultando al proveedor. */
export async function reconcileDelivery(id: string): Promise<"published" | "not_published" | "unknown"> {
  const db = admin();
  const { data: d } = await db.from("social_deliveries").select("*").eq("id", id).eq("status", "needs_review").maybeSingle();
  if (!d) return "unknown";
  if (d.network === "instagram" && typeof d.provider_state?.creationId === "string") {
    const { data: acc } = await db.from("social_accounts").select("token_enc").eq("id", d.account_id).maybeSingle();
    if (!acc?.token_enc) return "unknown";
    const r = await reconcileInstagram(decryptSecret(acc.token_enc), d.provider_state.creationId as string);
    if (r === "published") {
      await db.from("social_deliveries").update({ status: "published", external_id: d.provider_state.creationId, published_at: new Date().toISOString(), error: null }).eq("id", id);
    }
    return r;
  }
  return "unknown";
}
