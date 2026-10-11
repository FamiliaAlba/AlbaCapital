import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCallback } from "../../server/social/oauth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", "alba_social_oauth=; Path=/api/oauth; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
  let target = "/admin/social?error=Error+interno";
  try {
    target = await handleCallback(req, "linkedin");
  } catch {
    /* mensaje genérico */
  }
  res.redirect(302, target);
}
