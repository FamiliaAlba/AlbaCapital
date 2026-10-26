import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { tkApi } from "@/lib/tokenizate/api";
import { ALL_DOC_CATEGORIES, CATEGORIES, EVAL_FIELDS, PROJECT_STATES, PYME_EVAL_FIELDS, PYME_INTEREST_MODES, PYME_PRODUCTION_MODES, RELATIONS, STATUS_LABEL, statusLabel } from "@/data/tokenizate";

/* eslint-disable @typescript-eslint/no-explicit-any */
const select = "h-10 rounded-md border border-input bg-background px-3 text-sm";
const ACTION: Record<string, string> = {
  created: "Expediente creado", draft_saved: "Borrador guardado", submitted: "Postulación enviada", status_changed: "Cambio de estado", assigned: "Asignación", docs_requested: "Documentación solicitada",
  doc_uploaded: "Documento cargado", doc_deleted: "Documento eliminado", doc_rejected: "Documento rechazado", doc_access: "Acceso a documento", note_added: "Observación interna", communication_logged: "Comunicación registrada",
  evaluation_saved: "Ficha de evaluación guardada", next_action_set: "Próxima acción actualizada", retention_purge: "Depuración por vencimiento", export: "Exportación",
};

const AdminTokenizateApp = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [d, setD] = useState<any>(null);
  const [staff, setStaff] = useState<{ id: string; email: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState({ kind: "note", channel: "", body: "" });
  const [request, setRequest] = useState("");
  const [next, setNext] = useState({ action: "", at: "" });
  const [evalF, setEvalF] = useState<Record<string, string>>({});
  const [fees, setFees] = useState<{ concept: string; amount: string; currency: string; note: string }[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await tkApi("admin_get_app", { id }, { admin: true });
      setD(r);
      setEvalF(r.evaluation?.fields ?? {});
      setNext({ action: r.application.next_action ?? "", at: r.application.next_action_at ?? "" });
      setFees((r.evaluation?.fees ?? []).map((f: any) => ({ ...f, amount: f.amount ?? "" })));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar");
    }
  }, [id]);

  useEffect(() => {
    load();
    tkApi("admin_staff", {}, { admin: true }).then((r) => setStaff(r.staff)).catch(() => undefined);
  }, [load]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); toast({ title: ok }); await load(); } catch (e) { toast({ title: "Error", description: e instanceof Error ? e.message : undefined, variant: "destructive" }); }
  };
  const openDoc = async (docId: string) => {
    try { const r = await tkApi("admin_doc_url", { docId }, { admin: true }); window.open(r.url, "_blank", "noopener"); await load(); } catch (e) { toast({ title: "No se pudo abrir", description: e instanceof Error ? e.message : undefined, variant: "destructive" }); }
  };

  if (error) return <AdminLayout><p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">{error}</p></AdminLayout>;
  if (!d) return <AdminLayout><Loader2 className="h-6 w-6 animate-spin" /></AdminLayout>;
  const a = d.application;
  const isPyme = a.modality === "produccion_pyme";
  const py = (a.pyme ?? {}) as Record<string, any>;
  const stateOf = (k: string) => ({ comprobado: "comprobado", estimado: "estimación", no_tengo: "todavía no lo tiene", orientacion: "necesita orientación" } as Record<string, string>)[py._state?.[k] ?? ""] ?? "";
  const pyRow = (k: string, l: string) => row(l, py[k] ? <span className="whitespace-pre-wrap">{py[k]}{stateOf(k) ? <em className="ml-2 text-xs text-muted-foreground">({stateOf(k)})</em> : null}</span> : null);
  const row = (k: string, v: any) => <div className="grid gap-1 py-2 sm:grid-cols-[12rem_1fr]"><dt className="text-sm text-muted-foreground">{k}</dt><dd className="text-sm">{v ?? "—"}</dd></div>;

  return (
    <AdminLayout>
      <Link to="/admin/tokenizate" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Todas las postulaciones</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-architectural">{a.project_name ?? "Sin nombre"}</h1>
          <p className="font-mono text-sm text-muted-foreground">{a.expediente} · {isPyme ? "Producción PyME · " : ""} confirmación por correo: {a.email_status === "not_configured" ? "no configurada" : a.email_status}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-xs">Estado<br /><select className={select} value={a.status} disabled={a.status === "borrador"} onChange={(e) => run(() => tkApi("admin_update_app", { id, status: e.target.value }, { admin: true }), "Estado actualizado")}>
            {Object.keys(STATUS_LABEL).map((k) => <option key={k} value={k} disabled={k === "borrador"}>{statusLabel(k, a.modality)}</option>)}</select></label>
          <label className="text-xs">Responsable<br /><select className={select} value={a.assigned_to ?? ""} onChange={(e) => run(() => tkApi("admin_update_app", { id, assigned_to: e.target.value || null }, { admin: true }), "Responsable asignado")}>
            <option value="">Sin asignar</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.email}</option>)}</select></label>
        </div>
      </div>
      <p className="mb-6 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">Marcar un expediente como “Viable con condiciones” es una conclusión interna: no publica el proyecto, no habilita su comercialización y no constituye aceptación ni compromiso hacia el propietario.</p>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-2 text-lg font-light">Datos de la postulación</h2>
          <dl className="divide-y divide-border">
            {row("Propietario", `${a.owner_name} · ${a.owner_email}`)}{row("Teléfono", a.owner_phone)}{row("Relación", RELATIONS[a.owner_relation])}
            {row("País / provincia", `${a.owner_country ?? "—"} / ${a.owner_province ?? "—"}`)}{row("CUIT / identificación", a.owner_tax_id)}
            {row("Categoría", CATEGORIES[a.category])}{row("Ubicación", a.location)}{row("Estado del activo", PROJECT_STATES[a.project_state])}
            {row("Resumen", <span className="whitespace-pre-wrap">{a.summary}</span>)}{row("Valor estimado", a.value_amount ? `${a.value_amount} ${a.value_currency ?? ""}` : null)}
            {row("Financiación buscada", a.funding_amount ? `${a.funding_amount} ${a.funding_currency}` : null)}{row("Destino de fondos", <span className="whitespace-pre-wrap">{a.funds_use}</span>)}
            {row("Genera ingresos", a.generates_income)}{row("Deudas / gravámenes (declarado)", `${a.has_liens ?? "—"} ${a.liens_detail ?? ""}`)}
            {row("Declaraciones", a.declarations?.veracity_at ? `Aceptadas ${new Date(a.declarations.veracity_at).toLocaleString("es-AR")} · textos v${a.declarations.legal_version} · comercial: ${a.declarations.marketing_opt_in ? "sí" : "no"}` : "Pendientes")}
            {row("Conservación hasta", a.retention_until ? new Date(a.retention_until).toLocaleDateString("es-AR") : null)}
          </dl>
          {Object.keys(a.data ?? {}).length > 0 && <div className="mt-3 text-xs text-muted-foreground"><p className="font-medium text-foreground">Documentación que el postulante indicó no tener todavía:</p>{Object.entries(a.data).filter(([k, v]) => k.startsWith("why_") && v).map(([k, v]) => <p key={k}>• {String(v)}</p>)}</div>}
        </section>

        {isPyme && (
          <section className="rounded-xl border border-border bg-background p-5 xl:col-span-2">
            <h2 className="mb-2 text-lg font-light">Producción PyME · datos informados</h2>
            <p className="mb-2 text-xs text-muted-foreground">Lo que figura entre paréntesis indica si el postulante lo marcó como dato comprobado, estimación o faltante.</p>
            <dl className="grid divide-y divide-border md:grid-cols-2 md:gap-x-8 md:divide-y-0">
              {pyRow("contact_name", "Contacto")}{pyRow("contact_role", "Función")}{pyRow("cuit", "CUIT")}{pyRow("representation", "Representación")}
              {pyRow("experience", "Experiencia")}{pyRow("capacity", "Capacidad de producción")}{row("Forma de producción", PYME_PRODUCTION_MODES[py.production_mode])}{pyRow("maker_info", "Fabricante a fasón")}
              {pyRow("lot_id", "Lote")}{pyRow("lot_volume", "Volumen")}{pyRow("lot_unit", "Unidad")}{pyRow("current_stage", "Etapa actual")}
              {pyRow("schedule", "Calendario")}{pyRow("budget", "Presupuesto")}{pyRow("own_contribution", "Aporte propio")}{pyRow("other_funding", "Otras fuentes")}
              {pyRow("sales_history", "Ventas históricas")}{pyRow("orders_buyers", "Pedidos y compradores")}{pyRow("price_estimate", "Precio estimado")}{pyRow("price_basis", "Fundamento del precio")}
              {pyRow("distribution_costs", "Costos de distribución")}{pyRow("risks", "Riesgos")}{pyRow("insurance", "Seguros")}{row("Modalidad de interés", PYME_INTEREST_MODES[py.interest_mode])}
            </dl>
          </section>
        )}

        <section className="rounded-xl border border-border bg-background p-5 xl:col-span-2">
          <h2 className="mb-2 text-lg font-light">Próxima acción (interna)</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[16rem] flex-1 text-sm">Qué sigue<Input className="mt-1" maxLength={500} value={next.action} onChange={(e) => setNext({ ...next, action: e.target.value })} /></label>
            <label className="text-sm">Fecha<Input type="date" className="mt-1" value={next.at} onChange={(e) => setNext({ ...next, at: e.target.value })} /></label>
            <Button size="sm" onClick={() => run(() => tkApi("admin_update_app", { id, next_action: next.action, next_action_at: next.at || null }, { admin: true }), "Próxima acción guardada")}>Guardar</Button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-2 text-lg font-light">Documentos (acceso con enlace temporal y registro)</h2>
          {d.documents.length === 0 ? <p className="text-sm text-muted-foreground">Sin documentos.</p> : (
            <ul className="divide-y divide-border text-sm">
              {d.documents.map((x: any) => (
                <li key={x.id} className="flex items-center justify-between gap-3 py-2"><span className="min-w-0 truncate">{x.original_name}<span className="ml-2 text-xs text-muted-foreground">{ALL_DOC_CATEGORIES[x.category] ?? x.category} · {x.stage} · {(x.size_bytes / 1048576).toFixed(2)} MB</span></span>
                  <Button size="sm" variant="outline" onClick={() => openDoc(x.id)}><Download className="mr-1 h-3.5 w-3.5" /> Abrir</Button></li>
              ))}
            </ul>
          )}
          <h3 className="mb-1 mt-5 text-sm font-medium">Solicitar documentación adicional</h3>
          <Textarea rows={3} value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Describí qué falta. El propietario lo verá en su expediente." />
          <Button className="mt-2" size="sm" disabled={request.trim().length < 3} onClick={() => run(async () => { await tkApi("admin_request_docs", { id, message: request }, { admin: true }); setRequest(""); }, "Solicitud registrada")}>Solicitar</Button>
          {d.requests.length > 0 && <ul className="mt-3 space-y-1 text-xs text-muted-foreground">{d.requests.map((r: any) => <li key={r.id}>{new Date(r.created_at).toLocaleDateString("es-AR")} — {r.message} {r.fulfilled_at ? "(atendida)" : "(pendiente)"}</li>)}</ul>}
        </section>

        <section className="rounded-xl border border-border bg-background p-5 xl:col-span-2">
          <h2 className="mb-1 text-lg font-light">Ficha interna de evaluación</h2>
          <p className="mb-4 text-xs text-muted-foreground">Registro cualitativo del equipo. No genera puntajes, probabilidades ni aprobaciones automáticas.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {(isPyme ? PYME_EVAL_FIELDS : EVAL_FIELDS).map((f) => (<label key={f.key} className="text-sm">{f.label}<Textarea rows={3} className="mt-1" value={evalF[f.key] ?? ""} onChange={(e) => setEvalF({ ...evalF, [f.key]: e.target.value })} /></label>))}
          </div>
          <h3 className="mb-2 mt-5 text-sm font-medium">Honorarios (registro interno, no se publican)</h3>
          {fees.map((f, i) => (
            <div key={i} className="mb-2 grid gap-2 sm:grid-cols-[1fr_8rem_6rem_1fr_auto]">
              <Input placeholder="Concepto" value={f.concept} onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, concept: e.target.value } : x)))} />
              <Input placeholder="Monto" inputMode="decimal" value={f.amount} onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
              <select className={select} value={f.currency} onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, currency: e.target.value } : x)))}><option value="">—</option><option>ARS</option><option>USD</option></select>
              <Input placeholder="Nota" value={f.note} onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
              <Button variant="ghost" size="sm" onClick={() => setFees(fees.filter((_, j) => j !== i))}>Quitar</Button>
            </div>
          ))}
          <div className="mt-2 flex gap-2"><Button variant="outline" size="sm" onClick={() => setFees([...fees, { concept: "", amount: "", currency: "", note: "" }])}>Agregar concepto</Button>
            <Button size="sm" onClick={() => run(() => tkApi("admin_save_eval", { id, fields: evalF, fees }, { admin: true }), "Evaluación guardada")}>Guardar evaluación</Button></div>
        </section>

        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-2 text-lg font-light">Observaciones y comunicaciones</h2>
          <div className="flex flex-wrap gap-2">
            <select className={select} value={note.kind} onChange={(e) => setNote({ ...note, kind: e.target.value })} aria-label="Tipo"><option value="note">Observación interna</option><option value="communication">Comunicación con el postulante</option></select>
            {note.kind === "communication" && <Input className="w-40" placeholder="Canal (mail, WhatsApp…)" value={note.channel} onChange={(e) => setNote({ ...note, channel: e.target.value })} />}
          </div>
          <Textarea className="mt-2" rows={3} value={note.body} onChange={(e) => setNote({ ...note, body: e.target.value })} />
          <Button className="mt-2" size="sm" disabled={!note.body.trim()} onClick={() => run(async () => { await tkApi("admin_add_note", { applicationId: id, ...note }, { admin: true }); setNote({ ...note, body: "" }); }, "Registrado")}>Agregar</Button>
          <ul className="mt-4 space-y-3 text-sm">{d.notes.map((n: any) => <li key={n.id} className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">{n.kind === "note" ? "Observación" : `Comunicación${n.channel ? ` (${n.channel})` : ""}`} · {new Date(n.created_at).toLocaleString("es-AR")}</p><p className="mt-1 whitespace-pre-wrap">{n.body}</p></li>)}</ul>
        </section>

        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-2 text-lg font-light">Historial de cambios y accesos</h2>
          <ul className="space-y-1.5 text-xs">{d.events.map((e: any) => <li key={e.id} className="flex gap-3"><span className="w-36 shrink-0 text-muted-foreground">{new Date(e.created_at).toLocaleString("es-AR")}</span><span>{ACTION[e.action] ?? e.action} <span className="text-muted-foreground">({e.actor_type}{e.detail?.to ? ` → ${statusLabel(e.detail.to, a.modality)}` : ""})</span></span></li>)}</ul>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminTokenizateApp;
