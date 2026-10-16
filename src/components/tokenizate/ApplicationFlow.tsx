import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Download, FileText, KeyRound, Loader2, Trash2, UploadCloud, X, AlertTriangle } from "lucide-react";
import { tkApi, uploadToSignedUrl } from "@/lib/tokenizate/api";
import {
  ALLOWED_EXT, ALLOWED_MIME, CATEGORIES, CHECKLISTS, COUNTRIES, DOC_CATEGORIES, PROJECT_STATES, PROVINCES, RELATIONS, STATUS_LABEL, TK_LEGAL_VERSION,
} from "@/data/tokenizate";

const field = "mt-1.5 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-base text-foreground placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-[#F3F5F8]";
const label = "block text-sm font-medium text-foreground";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";
const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-5 py-3 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Cred = { expediente: string; accessKey: string };
type Fields = Record<string, string>;
interface DocRow { id: string; category: string; original_name: string; mime: string; size_bytes: number; status: string; stage: string }
interface Loaded {
  application: Record<string, any>;
  documents: DocRow[];
  requests: { id: string; message: string; created_at: string; fulfilled_at: string | null }[];
  timeline: { action: string; detail: Record<string, any>; created_at: string }[];
  limits: { max_files: number; max_file_mb: number };
}
interface QueueItem { key: string; name: string; pct: number; state: "up" | "check" | "done" | "error"; error?: string }

const SKEY = "tk_cred";
const loadCred = (): Cred | null => {
  try { const v = sessionStorage.getItem(SKEY); return v ? JSON.parse(v) : null; } catch { return null; }
};
const saveCred = (c: Cred | null) => {
  try { if (c) sessionStorage.setItem(SKEY, JSON.stringify(c)); else sessionStorage.removeItem(SKEY); } catch { /* sin storage: se pedirá de nuevo */ }
};

const STEPS = ["Propietario", "Activo", "Documentación", "Revisión y envío"];
const fmtMB = (b: number) => `${(b / 1024 / 1024).toFixed(b > 1048576 ? 1 : 2)} MB`;

const ApplicationFlow = ({ consult }: { consult: boolean }) => {
  const [cred, setCred] = useState<Cred | null>(() => loadCred());
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"new" | "consult">(consult ? "consult" : "new");
  const [issued, setIssued] = useState<Cred | null>(null);
  const [keySaved, setKeySaved] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Fields>({});
  const [data, setData] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [decl, setDecl] = useState({ veracity: false, data_processing: false, no_guarantee: false, marketing: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ expediente: string; email: string } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [docCat, setDocCat] = useState("titularidad");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async (c: Cred) => {
    const r = await tkApi<Loaded>("app_get", { ...c });
    setLoaded(r);
    const a = r.application;
    setForm((f) => (Object.keys(f).length ? f : Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v === null ? "" : String(v)]))));
    setData((d) => (Object.keys(d).length ? d : (a.data as Record<string, string | boolean>) ?? {}));
    setStep((s) => (a.status === "borrador" && s === 1 ? Math.min(Math.max(a.stage ?? 1, 1), 3) : s));
    return r;
  }, []);

  useEffect(() => {
    if (!cred) return;
    setLoading(true);
    refresh(cred).catch((e) => { setError(e.message); saveCred(null); setCred(null); }).finally(() => setLoading(false));
  }, [cred, refresh]);

  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isDraft = loaded?.application.status === "borrador";

  const save = useCallback(async (nextStep?: number) => {
    if (!cred || !isDraft) return true;
    setSaving("saving");
    try {
      const keys = ["owner_name", "owner_phone", "owner_country", "owner_province", "owner_relation", "owner_tax_id", "project_name", "category", "location", "summary", "project_state", "value_amount", "value_currency", "funding_amount", "funding_currency", "funds_use", "generates_income", "has_liens", "liens_detail"];
      const fields = Object.fromEntries(keys.map((k) => [k, form[k] ?? ""]));
      await tkApi("app_save", { ...cred, fields, data, stage: nextStep ?? step });
      setSaving("saved");
      return true;
    } catch (e) {
      setSaving("error");
      setError(e instanceof Error ? e.message : "No se pudo guardar");
      return false;
    }
  }, [cred, isDraft, form, data, step]);

  // ---------- acceso inicial ----------
  const [accessErr, setAccessErr] = useState<string | null>(null);
  const startNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAccessErr(null);
    const f = new FormData(e.currentTarget);
    if (f.get("terms") !== "on" || f.get("privacy") !== "on") return setAccessErr("Para continuar, aceptá las Bases y Condiciones y la Política de Privacidad.");
    setLoading(true);
    try {
      const r = await tkApi<Cred>("app_start", {
        owner: { name: f.get("name"), email: f.get("email"), phone: f.get("phone"), country: f.get("country"), province: f.get("province"), relation: f.get("relation") },
        terms: true, privacy: true, legalVersion: TK_LEGAL_VERSION, website: f.get("website"),
      });
      setIssued(r);
    } catch (err) {
      setAccessErr(err instanceof Error ? err.message : "No se pudo crear el expediente");
    } finally {
      setLoading(false);
    }
  };
  const openExisting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAccessErr(null);
    const f = new FormData(e.currentTarget);
    const c = { expediente: String(f.get("expediente") ?? "").trim().toUpperCase(), accessKey: String(f.get("accessKey") ?? "").trim() };
    setLoading(true);
    try {
      await tkApi("app_get", { ...c });
      saveCred(c);
      setCred(c);
    } catch (err) {
      setAccessErr(err instanceof Error ? err.message : "No se pudo abrir el expediente");
    } finally {
      setLoading(false);
    }
  };
  const continueWithIssued = () => { if (issued) { saveCred(issued); setCred(issued); setIssued(null); setKeySaved(false); } };
  const exit = () => { saveCred(null); setCred(null); setLoaded(null); setForm({}); setData({}); setResult(null); setStep(1); };

  // ---------- documentos ----------
  const addFiles = async (files: FileList | File[]) => {
    if (!cred || !loaded) return;
    for (const file of Array.from(files)) {
      const key = `${file.name}-${file.size}-${Math.random()}`;
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      const set = (p: Partial<QueueItem>) => setQueue((q) => q.map((i) => (i.key === key ? { ...i, ...p } : i)));
      setQueue((q) => [...q, { key, name: file.name, pct: 0, state: "up" }]);
      if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(file.type)) { set({ state: "error", error: "Solo se aceptan PDF, JPG/JPEG o PNG." }); continue; }
      if (file.size > loaded.limits.max_file_mb * 1048576) { set({ state: "error", error: `Supera el máximo de ${loaded.limits.max_file_mb} MB.` }); continue; }
      try {
        const u = await tkApi<{ docId: string; uploadUrl: string }>("doc_upload_url", { ...cred, category: docCat, name: file.name, mime: file.type, size: file.size });
        await uploadToSignedUrl(u.uploadUrl, file, (pct) => set({ pct }));
        set({ state: "check", pct: 100 });
        await tkApi("doc_confirm", { ...cred, docId: u.docId });
        set({ state: "done" });
        await refresh(cred);
      } catch (err) {
        set({ state: "error", error: err instanceof Error ? err.message : "No se pudo subir" });
        refresh(cred).catch(() => undefined);
      }
    }
  };
  const removeDoc = async (id: string) => {
    if (!cred) return;
    try { await tkApi("doc_delete", { ...cred, docId: id }); await refresh(cred); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo eliminar"); }
  };
  const downloadDoc = async (id: string) => {
    if (!cred) return;
    try { const r = await tkApi<{ url: string }>("doc_download", { ...cred, docId: id }); window.location.assign(r.url); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo descargar"); }
  };

  const submit = async () => {
    if (!cred) return;
    setError(null);
    setSubmitting(true);
    try {
      if (!(await save(4))) return;
      const r = await tkApi<{ expediente: string; email: string }>("app_submit", { ...cred, declarations: decl, legalVersion: TK_LEGAL_VERSION });
      setResult(r);
      await refresh(cred);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setSubmitting(false);
    }
  };

  const checklist = useMemo(() => CHECKLISTS[form.category] ?? CHECKLISTS.otro, [form.category]);
  const missingForSubmit = ["project_name", "category", "location", "summary", "project_state", "funding_amount", "funding_currency", "funds_use", "generates_income", "has_liens", "owner_country", "owner_relation"].filter((k) => !form[k]);

  // =============== RENDER ===============
  if (issued) {
    const txt = `Alba Capital — Tokenizate\nExpediente: ${issued.expediente}\nClave de acceso: ${issued.accessKey}\n\nGuardá este archivo en un lugar seguro. La clave no se puede recuperar.`;
    return (
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        <KeyRound className="h-8 w-8 text-[#0B2545]" aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-semibold text-[#0B2545]">Tu expediente fue creado</h2>
        <p className="mt-2 text-muted-foreground">Esta es tu clave personal para volver a tu expediente. Se muestra <strong>una sola vez</strong> y Alba Capital no puede recuperarla.</p>
        <dl className="mt-5 grid gap-3 rounded-xl bg-[#F3F5F8] p-5">
          <div><dt className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Número de expediente</dt><dd className="mt-1 select-all font-mono text-xl text-[#0B2545]">{issued.expediente}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Clave de acceso</dt><dd className="mt-1 select-all font-mono text-xl text-[#0B2545]">{issued.accessKey}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={btnSecondary} onClick={() => navigator.clipboard?.writeText(`${issued.expediente}  ${issued.accessKey}`)}>Copiar</button>
          <a className={btnSecondary} href={`data:text/plain;charset=utf-8,${encodeURIComponent(txt)}`} download={`${issued.expediente}.txt`}>Descargar como archivo</a>
        </div>
        <label className="mt-6 flex items-start gap-3 text-sm"><input id="saved-key" type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={keySaved} onChange={(e) => setKeySaved(e.target.checked)} /> Guardé mi número de expediente y mi clave.</label>
        <button id="go" type="button" disabled={!keySaved} className={`${btnPrimary} mt-4`} onClick={continueWithIssued}>Continuar con mi postulación</button>
      </div>
    );
  }

  if (!cred) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
          <div className="mb-5 inline-flex rounded-lg bg-[#F3F5F8] p-1 text-sm font-medium" role="tablist">
            <button role="tab" aria-selected={mode === "new"} onClick={() => setMode("new")} className={`rounded-md px-4 py-2 ${mode === "new" ? "bg-[#0B2545] text-white" : "text-[#0B2545]"}`}>Nueva postulación</button>
            <button role="tab" aria-selected={mode === "consult"} onClick={() => setMode("consult")} className={`rounded-md px-4 py-2 ${mode === "consult" ? "bg-[#0B2545] text-white" : "text-[#0B2545]"}`}>Ya tengo un expediente</button>
          </div>
          {mode === "new" ? (
            <form onSubmit={startNew} className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0B2545]">Etapa 1 · Propietario o representante</h2>
              <p className="text-sm text-muted-foreground">Con estos pocos datos hacemos una revisión inicial. La documentación se pide después, en tu carpeta privada.</p>
              <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>No completar<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label htmlFor="a-name" className={label}>Nombre o razón social *</label><input id="a-name" name="name" required minLength={2} maxLength={160} className={field} autoComplete="name" /></div>
                <div><label htmlFor="a-email" className={label}>Correo electrónico *</label><input id="a-email" name="email" type="email" required className={field} autoComplete="email" /></div>
                <div><label htmlFor="a-phone" className={label}>Teléfono</label><input id="a-phone" name="phone" type="tel" className={field} autoComplete="tel" /></div>
                <div><label htmlFor="a-rel" className={label}>Relación con el activo *</label><select id="a-rel" name="relation" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{Object.entries(RELATIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label htmlFor="a-country" className={label}>País *</label><select id="a-country" name="country" required defaultValue="Argentina" className={field}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label htmlFor="a-prov" className={label}>Provincia *</label><select id="a-prov" name="province" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
              </div>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto las <Link to="/tokenizate/bases-y-condiciones" target="_blank" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>, incluida la aclaración de que postular no obliga a Alba Capital. *</span></label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="privacy" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto la <Link to="/tokenizate/privacidad" target="_blank" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>. *</span></label>
              {accessErr && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{accessErr}</p>}
              <button type="submit" disabled={loading} className={btnPrimary}>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Crear expediente y continuar</button>
            </form>
          ) : (
            <form onSubmit={openExisting} className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0B2545]">Consultar mi expediente</h2>
              <div><label htmlFor="c-exp" className={label}>Número de expediente</label><input id="c-exp" name="expediente" required placeholder="TK-2026-001001" className={field} autoComplete="off" /></div>
              <div><label htmlFor="c-key" className={label}>Clave de acceso</label><input id="c-key" name="accessKey" required type="password" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" className={field} autoComplete="off" /></div>
              {accessErr && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{accessErr}</p>}
              <button type="submit" disabled={loading} className={btnPrimary}>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Abrir expediente</button>
            </form>
          )}
        </div>
        <aside className="rounded-2xl bg-[#F3F5F8] p-6 text-sm leading-relaxed text-foreground md:p-8">
          <h3 className="text-lg font-semibold text-[#0B2545]">Antes de empezar</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Postular es pedirle a Alba Capital que evalúe tu activo. No lo vuelve tokenizable ni obliga a Alba Capital a ofrecerlo.</li>
            <li>Todo se analiza y aprueba primero; luego se generan las herramientas jurídicas y, solo si hay acuerdo definitivo, se firma un contrato.</li>
            <li>No necesitás tener toda la documentación para empezar.</li>
            <li>Tu clave es personal: sin ella nadie puede ver tu expediente, ni siquiera tu correo.</li>
          </ul>
        </aside>
      </div>
    );
  }

  if (loading || !loaded) return <div className="flex h-60 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#0B2545]" aria-label="Cargando" /></div>;

  const app = loaded.application;
  const status = app.status as string;

  // ---------- expediente ya enviado ----------
  if (!isDraft) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {result && <CheckCircle2 className="mb-2 h-9 w-9 text-[#0B2545]" aria-hidden="true" />}
              <h2 className="text-2xl font-semibold text-[#0B2545]">{result ? "Recibimos tu postulación" : "Tu expediente"}</h2>
              <p className="mt-1 font-mono text-lg text-[#0B2545]">{app.expediente}</p>
            </div>
            <span className="rounded-full bg-[#E4E9F0] px-4 py-1.5 text-sm font-semibold text-[#0B2545]">Estado: {STATUS_LABEL[status] ?? status}</span>
          </div>
          {result && (
            <div role="status" className="mt-4 space-y-2 text-sm text-foreground">
              <p>La postulación quedó guardada correctamente. Alba Capital va a hacer una revisión preliminar.</p>
              {result.email === "not_configured" && (
                <p className="rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-amber-950"><AlertTriangle className="mr-1 inline h-4 w-4" aria-hidden="true" /> Tu postulación fue recibida, pero <strong>no pudimos enviarte un correo de confirmación</strong> (el servicio de correo todavía no está habilitado). Guardá tu número de expediente y tu clave: con ellos podés consultar el estado cuando quieras.</p>
              )}
              <p className="text-muted-foreground">Recordá: presentar el proyecto no garantiza aprobación, financiación ni emisión de tokens.</p>
            </div>
          )}
          <ol className="mt-6 space-y-2 text-sm">
            {loaded.timeline.map((t, i) => (
              <li key={i} className="flex gap-3"><span className="w-36 shrink-0 text-muted-foreground">{new Date(t.created_at).toLocaleString("es-AR")}</span><span>{t.action === "created" ? "Expediente creado" : t.action === "submitted" ? "Postulación enviada" : t.action === "docs_requested" ? "Se solicitó documentación adicional" : `Estado: ${STATUS_LABEL[t.detail?.to] ?? t.detail?.to}`}</span></li>
            ))}
          </ol>
        </div>

        {loaded.requests.some((r) => !r.fulfilled_at) && (
          <div role="alert" className="rounded-2xl border border-amber-600/40 bg-amber-50 p-5 text-amber-950">
            <p className="font-semibold">Alba Capital solicitó documentación adicional</p>
            {loaded.requests.filter((r) => !r.fulfilled_at).map((r) => <p key={r.id} className="mt-2 whitespace-pre-wrap text-sm">{r.message}</p>)}
          </div>
        )}

        {!["cerrado", "no_elegible"].includes(status) && (
          <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
            <h3 className="text-xl font-semibold text-[#0B2545]">Documentación</h3>
            <DocPanel {...{ loaded, docCat, setDocCat, drag, setDrag, fileRef, addFiles, queue, setQueue, removeDoc, downloadDoc }} />
          </div>
        )}
        {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <button type="button" className={btnSecondary} onClick={exit}>Cerrar sesión del expediente</button>
      </div>
    );
  }

  // ---------- borrador (4 etapas) ----------
  const go = async (n: number) => { if (await save(n)) { setStep(n); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">Expediente <span className="font-mono text-[#0B2545]">{app.expediente}</span> · Borrador</p>
        <p role="status" className="text-muted-foreground">{saving === "saving" ? "Guardando…" : saving === "saved" ? "Borrador guardado" : saving === "error" ? "No se pudo guardar" : ""}</p>
      </div>
      <ol className="grid grid-cols-4 gap-2" aria-label="Etapas">
        {STEPS.map((s, i) => (
          <li key={s}><button type="button" onClick={() => go(i + 1)} aria-current={step === i + 1 ? "step" : undefined} className={`w-full rounded-lg border px-2 py-2 text-left text-xs font-semibold md:text-sm ${step === i + 1 ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-border bg-white text-[#0B2545]"}`}><span className="hidden md:inline">{i + 1}. </span>{s}</button></li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Propietario o representante</h2></div>
            <div><label htmlFor="s1-name" className={label}>Nombre o razón social *</label><input id="s1-name" className={field} value={form.owner_name ?? ""} onChange={(e) => setF("owner_name", e.target.value)} /></div>
            <div><label htmlFor="s1-email" className={label}>Correo (verificado al crear el expediente)</label><input id="s1-email" className={field} value={form.owner_email ?? ""} disabled /></div>
            <div><label htmlFor="s1-phone" className={label}>Teléfono</label><input id="s1-phone" className={field} value={form.owner_phone ?? ""} onChange={(e) => setF("owner_phone", e.target.value)} /></div>
            <div><label htmlFor="s1-rel" className={label}>Relación con el activo *</label><select id="s1-rel" className={field} value={form.owner_relation ?? ""} onChange={(e) => setF("owner_relation", e.target.value)}><option value="" disabled>Elegí una opción</option>{Object.entries(RELATIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label htmlFor="s1-country" className={label}>País *</label><select id="s1-country" className={field} value={form.owner_country ?? ""} onChange={(e) => setF("owner_country", e.target.value)}><option value="" disabled>Elegí una opción</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label htmlFor="s1-prov" className={label}>Provincia</label><select id="s1-prov" className={field} value={form.owner_province ?? ""} onChange={(e) => setF("owner_province", e.target.value)}><option value="">Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="md:col-span-2"><label htmlFor="s1-tax" className={label}>CUIT o identificación equivalente (opcional por ahora)</label><input id="s1-tax" className={field} value={form.owner_tax_id ?? ""} onChange={(e) => setF("owner_tax_id", e.target.value)} aria-describedby="tax-note" /><p id="tax-note" className="mt-1 text-xs text-muted-foreground">Se solicitará cuando avance la etapa documental. Si actúa un representante, adjuntá su autorización en la etapa 3 (Titularidad y representación).</p></div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Activo o proyecto</h2></div>
            <div><label htmlFor="s2-name" className={label}>Nombre del proyecto *</label><input id="s2-name" className={field} maxLength={160} value={form.project_name ?? ""} onChange={(e) => setF("project_name", e.target.value)} /></div>
            <div><label htmlFor="s2-cat" className={label}>Categoría *</label><select id="s2-cat" className={field} value={form.category ?? ""} onChange={(e) => setF("category", e.target.value)}><option value="" disabled>Elegí una opción</option>{Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label htmlFor="s2-loc" className={label}>Ubicación *</label><input id="s2-loc" className={field} value={form.location ?? ""} onChange={(e) => setF("location", e.target.value)} /></div>
            <div><label htmlFor="s2-state" className={label}>Estado *</label><select id="s2-state" className={field} value={form.project_state ?? ""} onChange={(e) => setF("project_state", e.target.value)}><option value="" disabled>Elegí una opción</option>{Object.entries(PROJECT_STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="md:col-span-2"><label htmlFor="s2-sum" className={label}>Resumen breve *</label><textarea id="s2-sum" rows={4} maxLength={3000} className={field} value={form.summary ?? ""} onChange={(e) => setF("summary", e.target.value)} /></div>
            <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="s2-val" className={label}>Valor estimado (opcional)</label><input id="s2-val" inputMode="decimal" className={field} value={form.value_amount ?? ""} onChange={(e) => setF("value_amount", e.target.value)} /></div><div><label htmlFor="s2-valc" className={label}>Moneda</label><select id="s2-valc" className={field} value={form.value_currency ?? ""} onChange={(e) => setF("value_currency", e.target.value)}><option value="">—</option><option>ARS</option><option>USD</option></select></div></div>
            <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="s2-fund" className={label}>Financiación buscada *</label><input id="s2-fund" inputMode="decimal" className={field} value={form.funding_amount ?? ""} onChange={(e) => setF("funding_amount", e.target.value)} /></div><div><label htmlFor="s2-func" className={label}>Moneda *</label><select id="s2-func" className={field} value={form.funding_currency ?? ""} onChange={(e) => setF("funding_currency", e.target.value)}><option value="" disabled>—</option><option>ARS</option><option>USD</option></select></div></div>
            <div className="md:col-span-2"><label htmlFor="s2-use" className={label}>Destino de los fondos *</label><textarea id="s2-use" rows={3} maxLength={2000} className={field} value={form.funds_use ?? ""} onChange={(e) => setF("funds_use", e.target.value)} /></div>
            <div><label htmlFor="s2-inc" className={label}>¿Genera ingresos actualmente? *</label><select id="s2-inc" className={field} value={form.generates_income ?? ""} onChange={(e) => setF("generates_income", e.target.value)}><option value="" disabled>Elegí una opción</option><option value="si">Sí</option><option value="parcial">Parcialmente</option><option value="no">No</option></select></div>
            <div><label htmlFor="s2-lien" className={label}>¿Tiene deudas o gravámenes? (declaración) *</label><select id="s2-lien" className={field} value={form.has_liens ?? ""} onChange={(e) => setF("has_liens", e.target.value)}><option value="" disabled>Elegí una opción</option><option value="no">No</option><option value="si">Sí</option><option value="no_se">No lo sé todavía</option></select></div>
            {form.has_liens === "si" && <div className="md:col-span-2"><label htmlFor="s2-ld" className={label}>Detalle</label><textarea id="s2-ld" rows={2} className={field} value={form.liens_detail ?? ""} onChange={(e) => setF("liens_detail", e.target.value)} /></div>}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-[#0B2545]">Documentación privada</h2>
            <p className="mt-2 text-sm text-muted-foreground">No necesitás tener todo para enviar la postulación. Subí lo que tengas y, si algo todavía no lo tenés, indicalo.</p>
            <h3 className="mt-6 text-base font-semibold text-[#0B2545]">Lista orientativa para {CATEGORIES[form.category] ?? "tu activo"}</h3>
            <ul className="mt-3 space-y-3">
              {checklist.map((c, i) => {
                const k = String.fromCharCode(97 + i);
                const has = loaded.documents.some((d) => d.category === c.cat);
                return (
                  <li key={c.text} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span><strong>{c.text}</strong> <span className="text-muted-foreground">· {c.initial ? "inicial" : "complementaria"} · {DOC_CATEGORIES[c.cat]}</span></span>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4 accent-[#0B2545]" checked={data[`nodoc_${k}`] === true} onChange={(e) => setData((d) => ({ ...d, [`nodoc_${k}`]: e.target.checked }))} /> Todavía no lo tengo</label>
                    </div>
                    {has && <p className="mt-1 text-xs text-green-800">Hay archivos cargados en esta categoría.</p>}
                    {data[`nodoc_${k}`] === true && <input aria-label={`Explicá tu situación: ${c.text}`} placeholder="Contanos brevemente tu situación" className={`${field} mt-2`} value={String(data[`why_${k}`] ?? "")} onChange={(e) => setData((d) => ({ ...d, [`why_${k}`]: e.target.value }))} />}
                  </li>
                );
              })}
            </ul>
            <DocPanel {...{ loaded, docCat, setDocCat, drag, setDrag, fileRef, addFiles, queue, setQueue, removeDoc, downloadDoc }} />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-[#0B2545]">Revisión y envío</h2>
            <dl className="mt-4 divide-y divide-border rounded-lg border border-border text-sm">
              {[
                ["Propietario", `${form.owner_name} · ${form.owner_email}`, 1], ["Relación / país", `${RELATIONS[form.owner_relation] ?? "—"} · ${form.owner_country ?? "—"}`, 1],
                ["Proyecto", `${form.project_name || "—"} (${CATEGORIES[form.category] ?? "—"})`, 2], ["Ubicación / estado", `${form.location || "—"} · ${PROJECT_STATES[form.project_state] ?? "—"}`, 2],
                ["Financiación buscada", form.funding_amount ? `${form.funding_amount} ${form.funding_currency}` : "—", 2], ["Destino de fondos", form.funds_use || "—", 2],
                ["Documentos cargados", String(loaded.documents.length), 3],
              ].map(([k, v, s]) => (
                <div key={String(k)} className="flex items-start justify-between gap-3 p-3"><div><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-foreground">{v}</dd></div><button type="button" onClick={() => go(Number(s))} className="text-xs font-semibold text-[#0B2545] underline">Editar</button></div>
              ))}
            </dl>
            {missingForSubmit.length > 0 && <p role="alert" className="mt-4 rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm text-amber-950">Faltan datos obligatorios en las etapas 1 y 2 para poder enviar.</p>}
            <fieldset className="mt-6 space-y-3 text-sm">
              <legend className="font-semibold text-[#0B2545]">Declaraciones obligatorias</legend>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.veracity} onChange={(e) => setDecl({ ...decl, veracity: e.target.checked })} /> Declaro que la información es veraz y que cuento con facultades para presentar este activo o proyecto.</label>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.data_processing} onChange={(e) => setDecl({ ...decl, data_processing: e.target.checked })} /> Acepto el tratamiento de mis datos para evaluar la solicitud, según la <Link to="/tokenizate/privacidad" target="_blank" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>.</label>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.no_guarantee} onChange={(e) => setDecl({ ...decl, no_guarantee: e.target.checked })} /> Reconozco que presentar el proyecto no garantiza aprobación, financiación ni emisión de tokens, y que Alba Capital no está obligada a estructurarlo ni ofrecerlo (ver <Link to="/tokenizate/bases-y-condiciones" target="_blank" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>).</label>
            </fieldset>
            <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.marketing} onChange={(e) => setDecl({ ...decl, marketing: e.target.checked })} /> Quiero recibir comunicaciones comerciales de Alba Capital (opcional).</label>
          </div>
        )}

        {error && <p role="alert" className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            {step > 1 && <button type="button" className={btnSecondary} onClick={() => go(step - 1)}>Atrás</button>}
            <button type="button" className={btnSecondary} onClick={() => save()}>Guardar borrador</button>
          </div>
          {step < 4 ? (
            <button type="button" className={btnPrimary} onClick={() => go(step + 1)}>{step === 3 ? "Revisar" : "Continuar"}</button>
          ) : (
            <button type="button" className={btnPrimary} disabled={submitting || missingForSubmit.length > 0 || !decl.veracity || !decl.data_processing || !decl.no_guarantee} onClick={submit}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Enviar postulación
            </button>
          )}
        </div>
      </div>
      <button type="button" className="text-sm font-medium text-[#0B2545] underline" onClick={exit}>Salir (mi borrador queda guardado; vuelvo con mi clave)</button>
    </div>
  );
};

interface DocPanelProps {
  loaded: Loaded; docCat: string; setDocCat: (v: string) => void; drag: boolean; setDrag: (v: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement>; addFiles: (f: FileList | File[]) => void; queue: QueueItem[]; setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  removeDoc: (id: string) => void; downloadDoc: (id: string) => void;
}
const DocPanel = ({ loaded, docCat, setDocCat, drag, setDrag, fileRef, addFiles, queue, setQueue, removeDoc, downloadDoc }: DocPanelProps) => (
  <div className="mt-6">
    <label htmlFor="doc-cat" className={label}>Categoría para los archivos que subas</label>
    <select id="doc-cat" className={field} value={docCat} onChange={(e) => setDocCat(e.target.value)}>{Object.entries(DOC_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
      className={`mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center ${drag ? "border-[#0B2545] bg-[#EEF1F5]" : "border-[#9AA7B8]"}`}
    >
      <UploadCloud className="h-8 w-8 text-[#5B6B80]" aria-hidden="true" />
      <p className="text-sm text-foreground">Arrastrá archivos acá o</p>
      <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>Elegir archivos</button>
      <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} aria-label="Elegir archivos" />
      <p className="text-xs text-muted-foreground">PDF, JPG/JPEG o PNG · hasta {loaded.limits.max_file_mb} MB por archivo · máximo {loaded.limits.max_files} archivos</p>
    </div>
    {queue.length > 0 && (
      <ul className="mt-3 space-y-2" aria-live="polite">
        {queue.map((q) => (
          <li key={q.key} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center justify-between gap-2"><span className="truncate">{q.name}</span>
              <span className="flex items-center gap-2 text-xs">{q.state === "up" ? `${q.pct}%` : q.state === "check" ? "Verificando…" : q.state === "done" ? "Listo" : "Error"}
                {(q.state === "done" || q.state === "error") && <button type="button" aria-label="Quitar de la lista" onClick={() => setQueue((x) => x.filter((i) => i.key !== q.key))}><X className="h-4 w-4" /></button>}</span></div>
            {q.state === "up" && <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#E4E9F0]"><div className="h-full bg-[#0B2545]" style={{ width: `${q.pct}%` }} /></div>}
            {q.error && <p role="alert" className="mt-1 text-xs text-destructive">{q.error}</p>}
          </li>
        ))}
      </ul>
    )}
    <h4 className="mt-6 text-sm font-semibold text-[#0B2545]">Archivos cargados ({loaded.documents.length})</h4>
    {loaded.documents.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Todavía no cargaste archivos.</p> : (
      <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
        {loaded.documents.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#5B6B80]" aria-hidden="true" /><span className="truncate">{d.original_name}</span><span className="shrink-0 text-xs text-muted-foreground">{DOC_CATEGORIES[d.category]} · {fmtMB(d.size_bytes)}</span></span>
            <span className="flex shrink-0 gap-3">
              <button type="button" aria-label={`Descargar ${d.original_name}`} onClick={() => downloadDoc(d.id)}><Download className="h-4 w-4 text-[#0B2545]" /></button>
              <button type="button" aria-label={`Eliminar ${d.original_name}`} onClick={() => removeDoc(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default ApplicationFlow;
