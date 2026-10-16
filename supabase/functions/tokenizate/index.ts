// Edge Function "tokenizate": captación de interesados, postulaciones de activos y gestión interna.
// Corre con la service role (inyectada por Supabase). Cada acción autoriza por su cuenta:
//  - público: honeypot + límites de frecuencia en base;
//  - propietario: número de expediente + clave de acceso (solo se guarda su hash SHA-256);
//  - equipo: JWT de Supabase + rol superadmin en admin_users.
import { createClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const BUCKET = "tokenizate-docs";
const LEGAL_VERSION = "2026-10-16.2"; // versión vigente de Política de Privacidad y Bases y Condiciones
const ORIGINS = [
  "https://alba-capital.vercel.app",
  "https://albacapital.com",
  "https://www.albacapital.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];
const STATUSES = ["borrador", "recibido", "revision_preliminar", "documentacion_pendiente", "analisis_tecnico_financiero", "analisis_juridico", "viable_con_condiciones", "no_elegible", "cerrado"];
const CATEGORIES = ["inmueble_residencial", "hotel_turistico", "maquinaria", "infraestructura_productiva", "proyecto_productivo", "otro"];
const DOC_CATEGORIES = ["titularidad", "tecnica", "valuacion", "ingresos_costos", "plan_negocios", "contratos", "permisos_seguros", "fotografias", "otros"];
const RELATIONS = ["propietario", "representante", "empresa_titular"];
const STATES = ["operativo", "ampliacion", "desarrollo", "otro"];
const MIME_EXT: Record<string, string[]> = { "application/pdf": ["pdf"], "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"] };

const SITE = (Deno.env.get("SITE_URL") ?? "https://alba-capital.vercel.app").replace(/\/+$/, "");

/** Envío por SMTP (Gmail). Nunca lanza: devuelve el resultado para registrarlo y mostrarlo con honestidad. */
async function sendMail(to: string, subject: string, text: string): Promise<"sent" | "failed" | "not_configured"> {
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  if (!user || !pass) return "not_configured";
  const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
  try {
    await Promise.race([client.send({ from: `Alba Capital <${user}>`, to, subject, content: text }), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 9000))]);
    return "sent";
  } catch (e) {
    console.error("mail error", e instanceof Error ? e.message.slice(0, 60) : "unknown"); // sin datos personales ni credenciales
    return "failed";
  } finally {
    try { await client.close(); } catch { /* ya cerrado */ }
  }
}
const teamEmail = () => Deno.env.get("TEAM_EMAIL") ?? Deno.env.get("SMTP_USER") ?? "";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
type Body = Record<string, any>;

const enc = new TextEncoder();
async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v: unknown, max: number): string | null => str(v, max) || null;
const oneOf = (v: unknown, list: string[]): string | null => (typeof v === "string" && list.includes(v) ? v : null);
const num = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 1e15 ? n : null;
};
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function genKey(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}
const normKey = (k: unknown): string => String(k ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

async function rate(key: string, action: string, max: number, windowSec: number): Promise<void> {
  const since = new Date(Date.now() - windowSec * 1000).toISOString();
  const { count } = await db.from("tk_rate_events").select("id", { count: "exact", head: true }).eq("rate_key", key).eq("action", action).gte("created_at", since);
  if ((count ?? 0) >= max) throw new HttpError(429, "Demasiados intentos. Esperá unos minutos e intentá de nuevo.");
  await db.from("tk_rate_events").insert({ rate_key: key, action });
}
async function ipKey(req: Request): Promise<string> {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  return sha256(`tk:${ip}`);
}
async function ev(e: { app?: string; interested?: string; actor: "owner" | "staff" | "system"; actorId?: string; action: string; detail?: Body }) {
  await db.from("tk_events").insert({ application_id: e.app ?? null, interested_id: e.interested ?? null, actor_type: e.actor, actor_id: e.actorId ?? null, action: e.action, detail: e.detail ?? {} });
}
async function settings() {
  const { data } = await db.from("tk_settings").select("*").eq("id", true).maybeSingle();
  return data ?? { max_files: 25, max_file_mb: 15, retention_months: 24 };
}
function requireLegal(body: Body, ...keys: string[]) {
  for (const k of keys) if (body[k] !== true) throw new HttpError(400, "Tenés que aceptar los textos obligatorios para continuar.");
  if (body.legalVersion !== LEGAL_VERSION) throw new HttpError(409, "Los textos legales se actualizaron. Recargá la página y volvé a aceptarlos.");
}

const APP_PUBLIC_COLS =
  "id, expediente, status, stage, owner_name, owner_email, owner_phone, owner_country, owner_province, owner_relation, owner_tax_id, project_name, category, location, summary, project_state, value_amount, value_currency, funding_amount, funding_currency, funds_use, generates_income, has_liens, liens_detail, data, declarations, submitted_at, email_status, created_at, updated_at";

async function authOwner(req: Request, body: Body) {
  const ip = await ipKey(req);
  const exp = str(body.expediente, 30).toUpperCase();
  const key = normKey(body.accessKey);
  const { data: app } = await db.from("tk_applications").select("id, expediente, status, access_hash, owner_email").eq("expediente", exp).maybeSingle();
  const ok = !!app && key.length >= 16 && safeEq(await sha256(key), app.access_hash);
  if (!ok) {
    await rate(ip, "auth_fail", 10, 900);
    throw new HttpError(401, "Expediente o clave de acceso incorrectos.");
  }
  return app!;
}

async function requireStaff(req: Request): Promise<string> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Sesión requerida");
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sesión inválida o vencida");
  const { data: row } = await db.from("admin_users").select("role").eq("id", data.user.id).eq("role", "superadmin").maybeSingle();
  if (!row) throw new HttpError(403, "No autorizado");
  return data.user.id;
}

const csvCell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita inyección de fórmulas en planillas
  return `"${s.replace(/"/g, '""')}"`;
};

function sniff(bytes: Uint8Array): string | null {
  const h = (a: number[]) => a.every((v, i) => bytes[i] === v);
  if (h([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (h([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (h([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  return null;
}

async function handle(action: string, body: Body, req: Request): Promise<unknown> {
  switch (action) {
    // ------------------------------------------------------------------ público
    case "meta":
      return { legalVersion: LEGAL_VERSION, limits: await settings() };

    case "interested_create": {
      if (body.website) return { ok: true }; // honeypot: se descarta en silencio
      requireLegal(body, "privacy");
      const email = str(body.email, 255).toLowerCase();
      const name = str(body.name, 120);
      const country = str(body.country, 80);
      const asset = str(body.assetType, 80);
      if (name.length < 2 || !EMAIL.test(email) || !country || !asset) throw new HttpError(400, "Revisá los datos obligatorios.");
      const ip = await ipKey(req);
      await rate(ip, "interested", 5, 3600);
      await rate(await sha256(`e:${email}`), "interested", 3, 86400);
      const { data, error } = await db.from("tk_interested").insert({
        name, email, phone: opt(body.phone, 40), country, asset_type: asset, capital_range: opt(body.capitalRange, 60),
        privacy_version: LEGAL_VERSION, marketing_consent: body.marketing === true, source: opt(body.source, 40),
        utm_source: opt(body.utm_source, 50), utm_medium: opt(body.utm_medium, 50), utm_campaign: opt(body.utm_campaign, 120),
      }).select("id").single();
      if (error) throw new HttpError(400, "No pudimos registrar tu solicitud. Revisá los datos.");
      await ev({ interested: data.id, actor: "system", action: "created" });
      // Aviso interno sin datos personales: solo enlaza al panel autenticado.
      if (teamEmail()) await sendMail(teamEmail(), "Tokenizate: nuevo interesado", `Hay un nuevo interesado en inversiones.\n\nRevisalo en el panel (requiere iniciar sesión):\n${SITE}/admin/tokenizate`);
      return { ok: true };
    }

    case "app_start": {
      if (body.website) return { ok: true };
      requireLegal(body, "terms", "privacy");
      const o = body.owner ?? {};
      const email = str(o.email, 255).toLowerCase();
      const name = str(o.name, 160);
      if (name.length < 2 || !EMAIL.test(email)) throw new HttpError(400, "Revisá el nombre y el correo.");
      const relation = oneOf(o.relation, RELATIONS);
      if (!relation) throw new HttpError(400, "Indicá tu relación con el activo.");
      await rate(await ipKey(req), "app_start", 5, 3600);
      const key = genKey();
      const now = new Date().toISOString();
      const { data, error } = await db.from("tk_applications").insert({
        access_hash: await sha256(normKey(key)), owner_name: name, owner_email: email, owner_phone: opt(o.phone, 40),
        owner_country: opt(o.country, 80), owner_province: opt(o.province, 80), owner_relation: relation,
        terms_version: LEGAL_VERSION, privacy_version: LEGAL_VERSION,
        declarations: { terms_accepted_at: now, privacy_accepted_at: now },
      }).select("id, expediente").single();
      if (error) throw new HttpError(400, "No pudimos crear el expediente. Revisá los datos.");
      await ev({ app: data.id, actor: "owner", action: "created" });
      return { expediente: data.expediente, accessKey: key };
    }

    case "app_get": {
      const a = await authOwner(req, body);
      const { data: app } = await db.from("tk_applications").select(APP_PUBLIC_COLS).eq("id", a.id).single();
      const { data: docs } = await db.from("tk_documents").select("id, category, original_name, mime, size_bytes, status, stage, created_at").eq("application_id", a.id).in("status", ["pending", "verified"]).order("created_at");
      const { data: reqs } = await db.from("tk_doc_requests").select("id, message, created_at, fulfilled_at").eq("application_id", a.id).order("created_at", { ascending: false });
      const { data: tl } = await db.from("tk_events").select("action, detail, created_at").eq("application_id", a.id).in("action", ["created", "submitted", "status_changed", "docs_requested"]).order("created_at");
      return { application: app, documents: docs ?? [], requests: reqs ?? [], timeline: tl ?? [], limits: await settings(), legalVersion: LEGAL_VERSION };
    }

    case "app_save": {
      const a = await authOwner(req, body);
      if (a.status !== "borrador") throw new HttpError(409, "La postulación ya fue enviada y no puede editarse. Podés agregar documentación si se solicita.");
      const f = body.fields ?? {};
      const patch: Body = {};
      const put = (k: string, v: unknown) => { if (v !== undefined) patch[k] = v; };
      if ("owner_name" in f) { const v = str(f.owner_name, 160); if (v.length < 2) throw new HttpError(400, "Nombre inválido"); put("owner_name", v); }
      if ("owner_phone" in f) put("owner_phone", opt(f.owner_phone, 40));
      if ("owner_country" in f) put("owner_country", opt(f.owner_country, 80));
      if ("owner_province" in f) put("owner_province", opt(f.owner_province, 80));
      if ("owner_relation" in f) put("owner_relation", oneOf(f.owner_relation, RELATIONS));
      if ("owner_tax_id" in f) put("owner_tax_id", opt(f.owner_tax_id, 30));
      if ("project_name" in f) put("project_name", opt(f.project_name, 160));
      if ("category" in f) put("category", oneOf(f.category, CATEGORIES));
      if ("location" in f) put("location", opt(f.location, 200));
      if ("summary" in f) put("summary", opt(f.summary, 3000));
      if ("project_state" in f) put("project_state", oneOf(f.project_state, STATES));
      if ("value_amount" in f) put("value_amount", num(f.value_amount));
      if ("value_currency" in f) put("value_currency", oneOf(f.value_currency, ["ARS", "USD"]));
      if ("funding_amount" in f) put("funding_amount", num(f.funding_amount));
      if ("funding_currency" in f) put("funding_currency", oneOf(f.funding_currency, ["ARS", "USD"]));
      if ("funds_use" in f) put("funds_use", opt(f.funds_use, 2000));
      if ("generates_income" in f) put("generates_income", oneOf(f.generates_income, ["si", "no", "parcial"]));
      if ("has_liens" in f) put("has_liens", oneOf(f.has_liens, ["si", "no", "no_se"]));
      if ("liens_detail" in f) put("liens_detail", opt(f.liens_detail, 2000));
      if (body.data && typeof body.data === "object") {
        // datos específicos por categoría y explicaciones "todavía no lo tengo": solo texto corto, claves acotadas
        const d: Body = {};
        for (const [k, v] of Object.entries(body.data as Body).slice(0, 40)) if (/^[a-z_]{1,40}$/.test(k)) d[k] = typeof v === "string" ? v.slice(0, 1000) : typeof v === "boolean" ? v : null;
        put("data", d);
      }
      if (Number.isInteger(body.stage) && body.stage >= 1 && body.stage <= 4) put("stage", body.stage);
      if (Object.keys(patch).length === 0) return { ok: true };
      const { error } = await db.from("tk_applications").update(patch).eq("id", a.id);
      if (error) throw new HttpError(400, "No se pudo guardar. Revisá los datos.");
      await ev({ app: a.id, actor: "owner", action: "draft_saved", detail: { fields: Object.keys(patch) } });
      return { ok: true };
    }

    case "doc_upload_url": {
      const a = await authOwner(req, body);
      if (["cerrado", "no_elegible"].includes(a.status)) throw new HttpError(409, "El expediente no admite más documentación.");
      await rate(a.id, "doc_upload", 80, 3600);
      const s = await settings();
      const category = oneOf(body.category, DOC_CATEGORIES);
      const mime = String(body.mime ?? "");
      const name = str(body.name, 200).replace(/[\u0000-\u001f\\/]/g, "_");
      const size = Number(body.size);
      if (!category) throw new HttpError(400, "Elegí la categoría del documento.");
      const ext = (name.split(".").pop() ?? "").toLowerCase();
      if (!MIME_EXT[mime] || !MIME_EXT[mime].includes(ext)) throw new HttpError(415, "Solo se aceptan archivos PDF, JPG/JPEG o PNG.");
      if (!Number.isFinite(size) || size <= 0 || size > s.max_file_mb * 1024 * 1024) throw new HttpError(413, `Cada archivo puede pesar hasta ${s.max_file_mb} MB.`);
      const { count } = await db.from("tk_documents").select("id", { count: "exact", head: true }).eq("application_id", a.id).in("status", ["pending", "verified"]);
      if ((count ?? 0) >= s.max_files) throw new HttpError(409, `Alcanzaste el máximo de ${s.max_files} archivos por expediente.`);
      const path = `${a.id}/${crypto.randomUUID()}.${MIME_EXT[mime][0]}`;
      const { data: row, error } = await db.from("tk_documents").insert({
        application_id: a.id, category, original_name: name || "documento", storage_path: path, mime, size_bytes: size,
        stage: a.status === "borrador" ? "inicial" : "complementaria",
      }).select("id").single();
      if (error) throw new HttpError(400, "No se pudo registrar el archivo.");
      const { data: up, error: upErr } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
      if (upErr || !up) throw new HttpError(500, "No se pudo preparar la carga.");
      return { docId: row.id, uploadUrl: up.signedUrl };
    }

    case "doc_confirm": {
      const a = await authOwner(req, body);
      const { data: doc } = await db.from("tk_documents").select("*").eq("id", str(body.docId, 50)).eq("application_id", a.id).maybeSingle();
      if (!doc || doc.status !== "pending") throw new HttpError(404, "Archivo no encontrado.");
      const s = await settings();
      const reject = async (why: string) => {
        await db.storage.from(BUCKET).remove([doc.storage_path]);
        await db.from("tk_documents").update({ status: "rejected", deleted_at: new Date().toISOString() }).eq("id", doc.id);
        await ev({ app: a.id, actor: "system", action: "doc_rejected", detail: { reason: why } });
        throw new HttpError(422, why);
      };
      const { data: blob, error } = await db.storage.from(BUCKET).download(doc.storage_path);
      if (error || !blob) throw new HttpError(409, "El archivo todavía no llegó. Reintentá la carga.");
      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (bytes.length === 0 || bytes.length > s.max_file_mb * 1024 * 1024) return await reject("El archivo supera el peso permitido o está vacío.");
      const real = sniff(bytes);
      if (!real || real !== doc.mime) return await reject("El contenido del archivo no coincide con un PDF, JPG o PNG válido.");
      if (real === "application/pdf") {
        const text = new TextDecoder("latin1").decode(bytes);
        if (/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction)\b/.test(text)) return await reject("El PDF contiene elementos activos no permitidos. Exportalo nuevamente sin scripts ni adjuntos.");
      }
      await db.from("tk_documents").update({ status: "verified", verified_at: new Date().toISOString(), size_bytes: bytes.length }).eq("id", doc.id);
      await ev({ app: a.id, actor: "owner", action: "doc_uploaded", detail: { category: doc.category, mime: doc.mime, bytes: bytes.length } });
      await db.from("tk_doc_requests").update({ fulfilled_at: new Date().toISOString() }).eq("application_id", a.id).is("fulfilled_at", null);
      return { ok: true };
    }

    case "doc_delete": {
      const a = await authOwner(req, body);
      if (["cerrado", "no_elegible"].includes(a.status)) throw new HttpError(409, "El expediente no admite cambios.");
      const { data: doc } = await db.from("tk_documents").select("id, storage_path").eq("id", str(body.docId, 50)).eq("application_id", a.id).in("status", ["pending", "verified"]).maybeSingle();
      if (!doc) throw new HttpError(404, "Archivo no encontrado.");
      await db.storage.from(BUCKET).remove([doc.storage_path]);
      await db.from("tk_documents").update({ status: "deleted", deleted_at: new Date().toISOString() }).eq("id", doc.id);
      await ev({ app: a.id, actor: "owner", action: "doc_deleted" });
      return { ok: true };
    }

    case "doc_download": {
      const a = await authOwner(req, body);
      const { data: doc } = await db.from("tk_documents").select("id, storage_path, original_name").eq("id", str(body.docId, 50)).eq("application_id", a.id).eq("status", "verified").maybeSingle();
      if (!doc) throw new HttpError(404, "Archivo no encontrado.");
      const { data } = await db.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60, { download: doc.original_name });
      await ev({ app: a.id, actor: "owner", action: "doc_access" });
      return { url: data?.signedUrl };
    }

    case "app_submit": {
      const a = await authOwner(req, body);
      if (a.status !== "borrador") throw new HttpError(409, "La postulación ya fue enviada.");
      const { data: app } = await db.from("tk_applications").select("*").eq("id", a.id).single();
      const missing = ["project_name", "category", "location", "summary", "project_state", "funding_amount", "funding_currency", "funds_use", "generates_income", "has_liens", "owner_country", "owner_relation"].filter((k) => app[k] === null || app[k] === "");
      if (missing.length) throw new HttpError(400, "Completá los datos obligatorios antes de enviar.");
      const d = body.declarations ?? {};
      if (d.veracity !== true || d.data_processing !== true || d.no_guarantee !== true) throw new HttpError(400, "Tenés que aceptar las tres declaraciones obligatorias.");
      if (body.legalVersion !== LEGAL_VERSION) throw new HttpError(409, "Los textos legales se actualizaron. Recargá y volvé a confirmar.");
      const s = await settings();
      const now = new Date();
      const retention = new Date(now.getTime());
      retention.setMonth(retention.getMonth() + s.retention_months);
      const declarations = { ...(app.declarations ?? {}), veracity_at: now.toISOString(), data_processing_at: now.toISOString(), no_guarantee_at: now.toISOString(), marketing_opt_in: d.marketing === true, legal_version: LEGAL_VERSION };
      const { error } = await db.from("tk_applications").update({ status: "recibido", stage: 4, submitted_at: now.toISOString(), declarations, retention_until: retention.toISOString(), email_status: "not_configured" }).eq("id", a.id).eq("status", "borrador");
      if (error) throw new HttpError(500, "No se pudo guardar el envío. Tus datos siguen como borrador; reintentá.");
      await ev({ app: a.id, actor: "owner", action: "submitted" });
      // La postulación ya está guardada: el resultado del correo se informa por separado y nunca la deshace.
      const mail = await sendMail(
        app.owner_email,
        `Recibimos tu postulación ${a.expediente} | Tokenizate`,
        `Hola ${app.owner_name},\n\nRecibimos tu postulación en Tokenizate | Alba Capital.\nNúmero de expediente: ${a.expediente}\n\nPara consultar el estado ingresá a ${SITE}/tokenizate/postular?modo=consultar con tu número de expediente y la clave de acceso que se te mostró al crearlo (por seguridad no la incluimos en este correo).\n\nRecordá que presentar el proyecto no garantiza aprobación, financiación ni emisión de tokens, y que Alba Capital no está obligada a estructurarlo ni ofrecerlo. Todo se analiza y aprueba primero; si corresponde y hay acuerdo definitivo, se formaliza con un contrato.\n\nAlba Capital`,
      );
      await db.from("tk_applications").update({ email_status: mail === "sent" ? "sent" : mail === "failed" ? "failed" : "not_configured" }).eq("id", a.id);
      if (teamEmail()) await sendMail(teamEmail(), `Tokenizate: nueva postulación ${a.expediente}`, `Se recibió una nueva postulación.\n\nRevisala en el panel (requiere iniciar sesión):\n${SITE}/admin/tokenizate/${a.id}\n\nNo se adjuntan documentos.`);
      return { ok: true, expediente: a.expediente, status: "recibido", email: mail };
    }

    // ------------------------------------------------------------------ equipo
    case "admin_overview": {
      await requireStaff(req);
      const c = async (t: string, f?: (q: any) => any) => { let q = db.from(t).select("id", { count: "exact", head: true }); if (f) q = f(q); return (await q).count ?? 0; };
      return { interested: await c("tk_interested"), interestedNew: await c("tk_interested", (q) => q.eq("status", "nuevo")), apps: await c("tk_applications", (q) => q.neq("status", "borrador")), appsReceived: await c("tk_applications", (q) => q.eq("status", "recibido")), drafts: await c("tk_applications", (q) => q.eq("status", "borrador")) };
    }

    case "admin_list_interested": {
      await requireStaff(req);
      let q = db.from("tk_interested").select("*").order("created_at", { ascending: false }).limit(300);
      if (oneOf(body.status, ["nuevo", "contactado", "cerrado"])) q = q.eq("status", body.status);
      const term = str(body.q, 80).replace(/[%,()]/g, " ");
      if (term) q = q.or(`name.ilike.%${term}%,email.ilike.%${term}%,country.ilike.%${term}%`);
      const { data } = await q;
      return { items: data ?? [] };
    }

    case "admin_list_apps": {
      await requireStaff(req);
      let q = db.from("tk_applications").select("id, expediente, status, owner_name, owner_email, owner_country, category, project_name, funding_amount, funding_currency, assigned_to, submitted_at, created_at, updated_at").order("updated_at", { ascending: false }).limit(300);
      if (oneOf(body.status, STATUSES)) q = q.eq("status", body.status);
      const term = str(body.q, 80).replace(/[%,()]/g, " ");
      if (term) q = q.or(`expediente.ilike.%${term}%,owner_name.ilike.%${term}%,owner_email.ilike.%${term}%,project_name.ilike.%${term}%`);
      const { data } = await q;
      return { items: data ?? [] };
    }

    case "admin_staff": {
      await requireStaff(req);
      const { data: rows } = await db.from("admin_users").select("id").eq("role", "superadmin");
      const out = [];
      for (const r of rows ?? []) { const u = await db.auth.admin.getUserById(r.id); out.push({ id: r.id, email: u.data.user?.email ?? r.id }); }
      return { staff: out };
    }

    case "admin_get_app": {
      await requireStaff(req);
      const id = str(body.id, 50);
      const { data: app } = await db.from("tk_applications").select(APP_PUBLIC_COLS + ", assigned_to, retention_until, terms_version, privacy_version").eq("id", id).maybeSingle();
      if (!app) throw new HttpError(404, "Expediente no encontrado");
      const [docs, reqs, notes, events, evaluation] = await Promise.all([
        db.from("tk_documents").select("id, category, original_name, mime, size_bytes, status, stage, created_at").eq("application_id", id).in("status", ["pending", "verified"]).order("created_at"),
        db.from("tk_doc_requests").select("*").eq("application_id", id).order("created_at", { ascending: false }),
        db.from("tk_notes").select("*").eq("application_id", id).order("created_at", { ascending: false }),
        db.from("tk_events").select("*").eq("application_id", id).order("created_at", { ascending: false }).limit(150),
        db.from("tk_evaluations").select("*").eq("application_id", id).maybeSingle(),
      ]);
      return { application: app, documents: docs.data ?? [], requests: reqs.data ?? [], notes: notes.data ?? [], events: events.data ?? [], evaluation: evaluation.data ?? null };
    }

    case "admin_update_app": {
      const uid = await requireStaff(req);
      const id = str(body.id, 50);
      const { data: cur } = await db.from("tk_applications").select("status").eq("id", id).maybeSingle();
      if (!cur) throw new HttpError(404, "Expediente no encontrado");
      const patch: Body = {};
      if (body.status !== undefined) {
        const st = oneOf(body.status, STATUSES);
        if (!st || st === "borrador") throw new HttpError(400, "Estado inválido");
        patch.status = st;
        if (["cerrado", "no_elegible"].includes(st)) {
          patch.closed_at = new Date().toISOString();
          const s = await settings();
          const r = new Date(); r.setMonth(r.getMonth() + s.retention_months);
          patch.retention_until = r.toISOString();
        }
      }
      if (body.assigned_to !== undefined) patch.assigned_to = body.assigned_to ? str(body.assigned_to, 50) : null;
      if (!Object.keys(patch).length) return { ok: true };
      await db.from("tk_applications").update(patch).eq("id", id);
      if (patch.status && patch.status !== cur.status) await ev({ app: id, actor: "staff", actorId: uid, action: "status_changed", detail: { from: cur.status, to: patch.status } });
      if ("assigned_to" in patch) await ev({ app: id, actor: "staff", actorId: uid, action: "assigned", detail: { to: patch.assigned_to } });
      return { ok: true };
    }

    case "admin_add_note": {
      const uid = await requireStaff(req);
      const appId = opt(body.applicationId, 50);
      const intId = opt(body.interestedId, 50);
      if (!appId === !intId) throw new HttpError(400, "Destino inválido");
      const text = str(body.body, 4000);
      if (!text) throw new HttpError(400, "Escribí el texto");
      const kind = oneOf(body.kind, ["note", "communication"]) ?? "note";
      await db.from("tk_notes").insert({ application_id: appId, interested_id: intId, kind, channel: opt(body.channel, 40), body: text, author: uid });
      await ev({ app: appId ?? undefined, interested: intId ?? undefined, actor: "staff", actorId: uid, action: kind === "note" ? "note_added" : "communication_logged" });
      return { ok: true };
    }

    case "admin_list_notes": {
      await requireStaff(req);
      const intId = str(body.interestedId, 50);
      const { data } = await db.from("tk_notes").select("*").eq("interested_id", intId).order("created_at", { ascending: false });
      return { notes: data ?? [] };
    }

    case "admin_request_docs": {
      const uid = await requireStaff(req);
      const id = str(body.id, 50);
      const message = str(body.message, 2000);
      if (message.length < 3) throw new HttpError(400, "Describí qué documentación falta");
      await db.from("tk_doc_requests").insert({ application_id: id, message, requested_by: uid });
      const { data: cur } = await db.from("tk_applications").select("status").eq("id", id).single();
      if (cur && ["recibido", "revision_preliminar"].includes(cur.status)) await db.from("tk_applications").update({ status: "documentacion_pendiente" }).eq("id", id);
      await ev({ app: id, actor: "staff", actorId: uid, action: "docs_requested" });
      return { ok: true };
    }

    case "admin_save_eval": {
      const uid = await requireStaff(req);
      const id = str(body.id, 50);
      const fields: Body = {};
      for (const [k, v] of Object.entries((body.fields ?? {}) as Body).slice(0, 30)) if (/^[a-z_]{1,40}$/.test(k)) fields[k] = str(v, 4000);
      const fees = Array.isArray(body.fees) ? (body.fees as Body[]).slice(0, 20).map((f) => ({ concept: str(f.concept, 120), amount: num(f.amount), currency: oneOf(f.currency, ["ARS", "USD"]) ?? "", note: str(f.note, 300) })) : [];
      await db.from("tk_evaluations").upsert({ application_id: id, fields, fees, updated_by: uid, updated_at: new Date().toISOString() });
      await ev({ app: id, actor: "staff", actorId: uid, action: "evaluation_saved" });
      return { ok: true };
    }

    case "admin_doc_url": {
      const uid = await requireStaff(req);
      const { data: doc } = await db.from("tk_documents").select("id, application_id, storage_path, original_name").eq("id", str(body.docId, 50)).eq("status", "verified").maybeSingle();
      if (!doc) throw new HttpError(404, "Archivo no encontrado");
      const { data } = await db.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60, { download: doc.original_name });
      await ev({ app: doc.application_id, actor: "staff", actorId: uid, action: "doc_access", detail: { doc: doc.id } });
      return { url: data?.signedUrl };
    }

    case "admin_update_interested": {
      const uid = await requireStaff(req);
      const id = str(body.id, 50);
      const patch: Body = {};
      if (body.status !== undefined) { const st = oneOf(body.status, ["nuevo", "contactado", "cerrado"]); if (!st) throw new HttpError(400, "Estado inválido"); patch.status = st; }
      if (body.assigned_to !== undefined) patch.assigned_to = body.assigned_to ? str(body.assigned_to, 50) : null;
      await db.from("tk_interested").update(patch).eq("id", id);
      await ev({ interested: id, actor: "staff", actorId: uid, action: "updated", detail: patch });
      return { ok: true };
    }

    case "admin_export": {
      const uid = await requireStaff(req);
      const kind = body.kind === "apps" ? "apps" : "interested";
      let rows: Body[]; let cols: string[];
      if (kind === "apps") {
        cols = ["expediente", "status", "created_at", "submitted_at", "owner_name", "owner_email", "owner_phone", "owner_country", "owner_province", "owner_relation", "category", "project_name", "location", "project_state", "funding_amount", "funding_currency", "has_liens", "generates_income"];
        rows = (await db.from("tk_applications").select(cols.join(",")).neq("status", "borrador").order("created_at", { ascending: false }).limit(5000)).data ?? [];
      } else {
        cols = ["created_at", "name", "email", "phone", "country", "asset_type", "capital_range", "status", "marketing_consent", "utm_source", "utm_campaign"];
        rows = (await db.from("tk_interested").select(cols.join(",")).order("created_at", { ascending: false }).limit(5000)).data ?? [];
      }
      await ev({ actor: "staff", actorId: uid, action: "export", detail: { kind, rows: rows.length } });
      return { csv: [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n"), rows: rows.length };
    }

    case "admin_settings_get": {
      await requireStaff(req);
      return { settings: await settings() };
    }
    case "admin_settings_save": {
      await requireStaff(req);
      const patch: Body = { updated_at: new Date().toISOString() };
      const mf = Number(body.max_files), mm = Number(body.max_file_mb), rm = Number(body.retention_months);
      if (Number.isInteger(mf) && mf >= 1 && mf <= 100) patch.max_files = mf;
      if (Number.isInteger(mm) && mm >= 1 && mm <= 15) patch.max_file_mb = mm; // el bucket admite hasta 15 MB
      if (Number.isInteger(rm) && rm >= 1 && rm <= 120) patch.retention_months = rm;
      await db.from("tk_settings").update(patch).eq("id", true);
      return { ok: true };
    }

    case "admin_purge_expired": {
      const uid = await requireStaff(req);
      const { data: apps } = await db.from("tk_applications").select("id").in("status", ["cerrado", "no_elegible"]).lt("retention_until", new Date().toISOString());
      let removed = 0;
      for (const a of apps ?? []) {
        const { data: docs } = await db.from("tk_documents").select("id, storage_path").eq("application_id", a.id).in("status", ["pending", "verified"]);
        if (docs?.length) { await db.storage.from(BUCKET).remove(docs.map((d) => d.storage_path)); await db.from("tk_documents").update({ status: "deleted", deleted_at: new Date().toISOString() }).in("id", docs.map((d) => d.id)); removed += docs.length; }
        await ev({ app: a.id, actor: "staff", actorId: uid, action: "retention_purge", detail: { documents: docs?.length ?? 0 } });
      }
      return { expedientes: apps?.length ?? 0, documents: removed };
    }

    default:
      throw new HttpError(400, "Acción desconocida");
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ORIGINS.includes(origin);
  const cors = {
    "Access-Control-Allow-Origin": allowed ? origin : ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Método no permitido" });
  if (origin && !allowed) return reply(403, { error: "Origen no permitido" });
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    return reply(200, await handle(String(body.action ?? ""), body, req));
  } catch (e) {
    if (e instanceof HttpError) return reply(e.status, { error: e.message });
    console.error("tokenizate error", e instanceof Error ? e.message : "unknown"); // sin datos personales
    return reply(500, { error: "Error interno. Reintentá en unos minutos." });
  }
});
