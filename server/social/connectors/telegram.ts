import { ProviderError } from "../sanitize.js";
import { providerError, requestJson } from "./fetch.js";
import type { AccountCheck, PublishContext, PublishResult } from "./types.js";

const api = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

interface TgRes<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

/** Verifica el bot y que pueda publicar en el canal. No envía ningún mensaje. */
export async function telegramVerify(
  botToken: string,
  chatId: string,
): Promise<{ check: AccountCheck; title: string; chatNumericId: string; botName: string }> {
  const me = await requestJson<TgRes<{ id: number; username?: string }>>(api(botToken, "getMe"));
  if (!me.body.ok || !me.body.result) throw new ProviderError("Token del bot inválido");
  const chat = await requestJson<TgRes<{ id: number; title?: string; type?: string }>>(api(botToken, "getChat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId }),
  });
  if (!chat.body.ok || !chat.body.result) throw new ProviderError("El bot no encuentra ese canal. Verificá el identificador y que el bot esté agregado.");
  if (chat.body.result.type !== "channel") throw new ProviderError("El destino debe ser un canal (no un chat privado ni un grupo).");
  const member = await requestJson<TgRes<{ status: string; can_post_messages?: boolean }>>(api(botToken, "getChatMember"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat.body.result.id, user_id: me.body.result.id }),
  });
  const m = member.body.result;
  const can = m?.status === "creator" || (m?.status === "administrator" && m.can_post_messages !== false);
  return {
    title: chat.body.result.title ?? String(chatId),
    chatNumericId: String(chat.body.result.id),
    botName: me.body.result.username ?? "bot",
    check: can
      ? { status: "connected", publishEnabled: true, permissions: ["can_post_messages"] }
      : { status: "insufficient_permissions", publishEnabled: false, detail: "El bot debe ser administrador del canal con permiso para publicar mensajes." },
  };
}

export async function telegramCheck(botToken: string, chatId: string): Promise<AccountCheck> {
  try {
    return (await telegramVerify(botToken, chatId)).check;
  } catch (e) {
    return { status: "needs_reconnect", publishEnabled: false, detail: e instanceof Error ? e.message : "No se pudo verificar" };
  }
}

export async function publishTelegram(ctx: PublishContext): Promise<PublishResult> {
  const r = await requestJson<TgRes<{ message_id: number; chat: { username?: string } }>>(api(ctx.token, "sendPhoto"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ctx.externalId, photo: ctx.imageUrl, caption: ctx.caption, disable_notification: false }),
  });
  if (r.status === 429) throw providerError(429, "Telegram pidió esperar antes de reintentar");
  if (!r.body.ok || !r.body.result) throw providerError(r.status, r.body.description ?? "Telegram rechazó el envío");
  const u = r.body.result.chat.username;
  return { externalId: String(r.body.result.message_id), externalUrl: u ? `https://t.me/${u}/${r.body.result.message_id}` : undefined };
}
