import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { tkApi } from "@/lib/tokenizate/api";
import { CATEGORIES, STATUS_LABEL } from "@/data/tokenizate";

interface Interested { id: string; created_at: string; name: string; email: string; phone: string | null; country: string; asset_type: string; capital_range: string | null; status: string; marketing_consent: boolean }
interface AppRow { id: string; expediente: string; status: string; owner_name: string; owner_email: string; owner_country: string | null; category: string | null; project_name: string | null; funding_amount: number | null; funding_currency: string | null; submitted_at: string | null; updated_at: string }

const select = "h-10 rounded-md border border-input bg-background px-3 text-sm";

const AdminTokenizate = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"apps" | "interested">("apps");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [apps, setApps] = useState<AppRow[]>([]);
  const [people, setPeople] = useState<Interested[]>([]);
  const [overview, setOverview] = useState<Record<string, number> | null>(null);
  const [limits, setLimits] = useState<{ max_files: number; max_file_mb: number; retention_months: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([tkApi("admin_overview", {}, { admin: true }), tkApi("admin_settings_get", {}, { admin: true })]);
      setOverview(o);
      setLimits(s.settings);
      if (tab === "apps") setApps((await tkApi("admin_list_apps", { q, status }, { admin: true })).items);
      else setPeople((await tkApi("admin_list_interested", { q, status }, { admin: true })).items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar");
    } finally {
      setLoading(false);
    }
  }, [tab, q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const exportCsv = async () => {
    try {
      const r = await tkApi<{ csv: string; rows: number }>("admin_export", { kind: tab }, { admin: true });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([r.csv], { type: "text/csv;charset=utf-8" }));
      a.download = `tokenizate-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast({ title: `Exportadas ${r.rows} filas`, description: "La exportación queda registrada en el historial." });
    } catch (e) {
      toast({ title: "No se pudo exportar", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    }
  };

  const setInterestedStatus = async (id: string, st: string) => {
    await tkApi("admin_update_interested", { id, status: st }, { admin: true });
    load();
  };

  const saveLimits = async () => {
    if (!limits) return;
    try {
      await tkApi("admin_settings_save", limits, { admin: true });
      toast({ title: "Configuración guardada" });
    } catch (e) {
      toast({ title: "No se pudo guardar", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    }
  };

  const purge = async () => {
    if (!window.confirm("Se eliminarán los documentos de expedientes cerrados o no elegibles cuyo plazo de conservación venció. ¿Continuar?")) return;
    const r = await tkApi<{ expedientes: number; documents: number }>("admin_purge_expired", {}, { admin: true });
    toast({ title: "Depuración realizada", description: `${r.documents} documentos eliminados en ${r.expedientes} expedientes.` });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-light text-architectural">Tokenizate</h1>
        <p className="text-sm text-muted-foreground">Interesados en inversiones y postulaciones de activos. La viabilidad interna no publica ni habilita ninguna comercialización.</p>
      </div>

      {overview && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[["Interesados", overview.interested], ["Nuevos", overview.interestedNew], ["Postulaciones", overview.apps], ["Sin revisar", overview.appsReceived], ["Borradores", overview.drafts]].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl border border-border bg-background p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="text-2xl font-light">{v}</p></div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-background p-1 text-sm">
          {(["apps", "interested"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setStatus(""); }} className={`rounded-md px-4 py-1.5 ${tab === t ? "bg-foreground text-background" : ""}`}>{t === "apps" ? "Postulaciones de activos" : "Interesados en inversiones"}</button>
          ))}
        </div>
        <Input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" aria-label="Buscar" />
        <select className={select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {tab === "apps" ? Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>) : ["nuevo", "contactado", "cerrado"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
      {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Cargando" />}

      {!loading && tab === "apps" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="p-3 font-normal">Expediente</th><th className="p-3 font-normal">Postulante</th><th className="p-3 font-normal">Proyecto</th><th className="p-3 font-normal">Financiación</th><th className="p-3 font-normal">Estado</th><th className="p-3 font-normal">Actualizado</th></tr></thead>
            <tbody>
              {apps.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Sin resultados.</td></tr>}
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-border/50">
                  <td className="p-3"><Link className="font-mono underline" to={`/admin/tokenizate/${a.id}`}>{a.expediente}</Link></td>
                  <td className="p-3">{a.owner_name}<br /><span className="text-xs text-muted-foreground">{a.owner_email}</span></td>
                  <td className="p-3">{a.project_name ?? "—"}<br /><span className="text-xs text-muted-foreground">{a.category ? CATEGORIES[a.category] : ""}</span></td>
                  <td className="p-3">{a.funding_amount ? `${a.funding_amount.toLocaleString("es-AR")} ${a.funding_currency ?? ""}` : "—"}</td>
                  <td className="p-3">{STATUS_LABEL[a.status] ?? a.status}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(a.updated_at).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "interested" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="p-3 font-normal">Fecha</th><th className="p-3 font-normal">Contacto</th><th className="p-3 font-normal">País</th><th className="p-3 font-normal">Interés</th><th className="p-3 font-normal">Capital</th><th className="p-3 font-normal">Comercial</th><th className="p-3 font-normal">Estado</th></tr></thead>
            <tbody>
              {people.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Todavía no hay interesados.</td></tr>}
              {people.map((p) => (
                <tr key={p.id} className="border-b border-border/50 align-top">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("es-AR")}</td>
                  <td className="p-3">{p.name}<br /><span className="text-xs text-muted-foreground">{p.email}{p.phone ? ` · ${p.phone}` : ""}</span></td>
                  <td className="p-3">{p.country}</td><td className="p-3">{p.asset_type}</td><td className="p-3">{p.capital_range ?? "—"}</td>
                  <td className="p-3">{p.marketing_consent ? "Sí" : "No"}</td>
                  <td className="p-3"><select className={select} value={p.status} onChange={(e) => setInterestedStatus(p.id, e.target.value)} aria-label={`Estado de ${p.name}`}>{["nuevo", "contactado", "cerrado"].map((s) => <option key={s}>{s}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {limits && (
        <section className="mt-8 rounded-xl border border-border bg-background p-5">
          <h2 className="mb-3 text-lg font-light">Documentos: límites y conservación</h2>
          <div className="flex flex-wrap items-end gap-4 text-sm">
            <label>Máx. archivos<Input type="number" min={1} max={100} value={limits.max_files} onChange={(e) => setLimits({ ...limits, max_files: Number(e.target.value) })} className="mt-1 w-28" /></label>
            <label>Máx. MB por archivo (hasta 15)<Input type="number" min={1} max={15} value={limits.max_file_mb} onChange={(e) => setLimits({ ...limits, max_file_mb: Number(e.target.value) })} className="mt-1 w-28" /></label>
            <label>Conservación tras cierre (meses)<Input type="number" min={1} max={120} value={limits.retention_months} onChange={(e) => setLimits({ ...limits, retention_months: Number(e.target.value) })} className="mt-1 w-28" /></label>
            <Button onClick={saveLimits}>Guardar</Button>
            <Button variant="outline" onClick={purge}><Trash2 className="mr-2 h-4 w-4" /> Depurar vencidos</Button>
          </div>
        </section>
      )}
    </AdminLayout>
  );
};

export default AdminTokenizate;
