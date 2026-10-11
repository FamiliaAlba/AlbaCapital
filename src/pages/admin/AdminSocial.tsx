import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, RefreshCw, Unplug, CheckCircle2, TriangleAlert } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { socialApi } from "@/lib/social/api";
import { NETWORK_LABEL } from "@/lib/social/formats";
import type { Network } from "@/lib/social/types";

interface Account {
  id: string;
  network: Network;
  display_name: string;
  target_kind: string;
  status: string;
  status_detail: string | null;
  selected: boolean;
  is_default: boolean;
  publish_enabled: boolean;
  permissions: string[];
  token_expires_at: string | null;
  last_checked_at: string | null;
}
interface Status {
  ready: boolean;
  config: { base: string[]; meta: string[]; linkedin: string[]; siteUrl: string; redirectUris?: { meta: string; linkedin: string }; linkedinOrgPages: boolean };
  settings: { enabled: boolean; default_cta: string } | null;
  accounts: Account[];
}
interface HistoryRow {
  id: string;
  network: Network;
  status: string;
  error: string | null;
  external_url: string | null;
  created_at: string;
  published_at: string | null;
  social_accounts?: { display_name: string } | null;
  opportunities?: { slug: string } | null;
}

const STATUS: Record<string, string> = {
  connected: "Conectada",
  needs_reconnect: "Requiere reconexión",
  insufficient_permissions: "Permisos insuficientes",
  pending_approval: "Pendiente de habilitación",
};
const KIND: Record<string, string> = { page: "Página", ig_business: "Cuenta profesional", member: "Perfil", organization: "Página de empresa", channel: "Canal" };
const DELIVERY: Record<string, string> = { queued: "En cola", processing: "Enviando", published: "Publicado", failed: "Falló", needs_review: "Requiere revisión" };

const AdminSocial = () => {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [cta, setCta] = useState("");
  const [bot, setBot] = useState({ token: "", chat: "" });

  const load = useCallback(async () => {
    try {
      const s = await socialApi<Status>("status");
      setStatus(s);
      setCta(s.settings?.default_cta ?? "");
      if (s.ready) setHistory((await socialApi("history")).deliveries);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const ok = params.get("connected");
    const err = params.get("error");
    if (ok) toast({ title: "Autorización completada", description: "Elegí qué cuentas usar como destino." });
    if (err) toast({ title: "No se pudo conectar", description: err, variant: "destructive" });
    if (ok || err) setParams({}, { replace: true });
  }, [params, setParams, toast]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const connect = (provider: "meta" | "linkedin") =>
    run(provider, async () => {
      const { url } = await socialApi<{ url: string }>("oauth_start", { provider });
      window.location.assign(url);
    });

  const setAccounts = (accounts: Account[]) => setStatus((s) => (s ? { ...s, accounts } : s));
  const accountAction = (key: string, action: string, body: Record<string, unknown>) =>
    run(key, async () => {
      const r = await socialApi<{ accounts: Account[] }>(action, body);
      setAccounts(r.accounts);
    });

  if (error) {
    return (
      <AdminLayout>
        <h1 className="text-2xl font-light text-architectural">Marketing · Redes sociales</h1>
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">{error}</p>
      </AdminLayout>
    );
  }
  if (!status) {
    return (
      <AdminLayout>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </AdminLayout>
    );
  }
  const cfg = status.config;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-light text-architectural">Marketing · Redes sociales</h1>
        <p className="text-sm text-muted-foreground">Conectá las cuentas desde las que se promocionan las oportunidades.</p>
      </div>

      {!status.ready && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">El servidor todavía no está configurado.</p>
            <p className="mt-1">
              Faltan variables de entorno en Vercel: <code>{cfg.base.join(", ")}</code>. Mientras tanto, “Crear publicación” sigue sin funcionar; ver README_SOCIAL.md.
            </p>
          </div>
        </div>
      )}

      {status.ready && status.settings && (
        <section className="mb-8 rounded-xl border border-border bg-background p-5">
          <h2 className="mb-4 text-lg font-light">Preferencias</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Módulo activo</p>
              <p className="text-xs text-muted-foreground">Al desactivarlo se ocultan las acciones de publicación; las oportunidades no cambian.</p>
            </div>
            <Switch
              checked={status.settings.enabled}
              onCheckedChange={(v) => run("toggle", async () => { await socialApi("settings_update", { enabled: v }); await load(); })}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="cta">Llamada a la acción predeterminada</Label>
              <Input id="cta" value={cta} maxLength={200} onChange={(e) => setCta(e.target.value)} />
            </div>
            <Button variant="outline" disabled={busy === "cta" || !cta.trim()} onClick={() => run("cta", async () => { await socialApi("settings_update", { default_cta: cta }); toast({ title: "Guardado" }); })}>
              Guardar
            </Button>
          </div>
        </section>
      )}

      <section className="mb-8 rounded-xl border border-border bg-background p-5">
        <h2 className="mb-1 text-lg font-light">Conectar cuentas</h2>
        <p className="mb-4 text-xs text-muted-foreground">No se piden ni guardan contraseñas: se usa OAuth y los tokens se guardan cifrados en el servidor.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">Facebook + Instagram</p>
            <p className="mt-1 text-xs text-muted-foreground">Páginas administradas e Instagram profesional vinculado (Facebook Login).</p>
            {cfg.meta.length > 0 ? (
              <p className="mt-3 text-xs text-amber-600">Pendiente: {cfg.meta.join(", ")}</p>
            ) : (
              <Button className="mt-3" size="sm" disabled={!status.ready || busy === "meta"} onClick={() => connect("meta")}>Conectar / reconectar</Button>
            )}
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">LinkedIn</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Perfil autorizado{cfg.linkedinOrgPages ? " y páginas de empresa" : "; las páginas de empresa requieren Community Management API aprobada por LinkedIn"}.
            </p>
            {cfg.linkedin.length > 0 ? (
              <p className="mt-3 text-xs text-amber-600">Pendiente: {cfg.linkedin.join(", ")}</p>
            ) : (
              <Button className="mt-3" size="sm" disabled={!status.ready || busy === "linkedin"} onClick={() => connect("linkedin")}>Conectar / reconectar</Button>
            )}
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">Telegram (canal opcional)</p>
            <div className="mt-2 space-y-2">
              <Input type="password" autoComplete="off" placeholder="Token del bot" value={bot.token} onChange={(e) => setBot({ ...bot, token: e.target.value })} />
              <Input placeholder="@canal o ID (-100…)" value={bot.chat} onChange={(e) => setBot({ ...bot, chat: e.target.value })} />
              <Button size="sm" disabled={!status.ready || busy === "tg" || !bot.token || !bot.chat} onClick={() => run("tg", async () => {
                const r = await socialApi<{ accounts: Account[] }>("telegram_connect", { botToken: bot.token, chatId: bot.chat });
                setAccounts(r.accounts);
                setBot({ token: "", chat: "" });
                toast({ title: "Canal verificado" });
              })}>
                Verificar y conectar
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-border bg-background p-5">
        <h2 className="mb-4 text-lg font-light">Cuentas</h2>
        {status.accounts.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay cuentas conectadas.</p>}
        <div className="space-y-3">
          {status.accounts.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {NETWORK_LABEL[a.network]} · {a.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {KIND[a.target_kind]} · {a.permissions.length ? a.permissions.join(", ") : "sin permisos registrados"}
                    {a.token_expires_at && ` · vence ${new Date(a.token_expires_at).toLocaleDateString("es-AR")}`}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs">
                    {a.status === "connected" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5 text-amber-600" />}
                    {STATUS[a.status]} · {a.publish_enabled ? "Habilitada para publicar" : "No habilitada para publicar"}
                  </p>
                  {a.status_detail && <p className="mt-1 text-xs text-muted-foreground">{a.status_detail}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={a.selected} onCheckedChange={(v) => accountAction(`s${a.id}`, "account_update", { id: a.id, selected: v === true })} /> Usar como destino
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox checked={a.is_default} onCheckedChange={(v) => accountAction(`d${a.id}`, "account_update", { id: a.id, is_default: v === true })} /> Predeterminada
                  </label>
                  <Button size="sm" variant="outline" disabled={busy === `c${a.id}`} onClick={() => accountAction(`c${a.id}`, "account_check", { id: a.id })}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Comprobar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => accountAction(`x${a.id}`, "account_disconnect", { id: a.id })}>
                    <Unplug className="mr-1 h-3.5 w-3.5" /> Desconectar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-border bg-background p-5">
        <h2 className="mb-4 text-lg font-light">Historial de publicaciones</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin publicaciones todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-normal">Fecha</th>
                  <th className="py-2 pr-3 font-normal">Proyecto</th>
                  <th className="py-2 pr-3 font-normal">Red / cuenta</th>
                  <th className="py-2 pr-3 font-normal">Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-border/50 align-top">
                    <td className="py-2 pr-3">{new Date(h.published_at ?? h.created_at).toLocaleString("es-AR")}</td>
                    <td className="py-2 pr-3">{h.opportunities?.slug}</td>
                    <td className="py-2 pr-3">
                      {NETWORK_LABEL[h.network]} · {h.social_accounts?.display_name}
                    </td>
                    <td className="py-2 pr-3">
                      {DELIVERY[h.status] ?? h.status}
                      {h.external_url && (
                        <a href={h.external_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
                          ver
                        </a>
                      )}
                      {h.error && <span className="block text-xs text-destructive">{h.error}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {cfg.redirectUris && (
        <section className="rounded-xl border border-border bg-background p-5 text-xs text-muted-foreground">
          <h2 className="mb-2 text-sm font-medium text-foreground">URI de redireccionamiento (para registrar en cada app)</h2>
          <p>Meta: <code>{cfg.redirectUris.meta}</code></p>
          <p>LinkedIn: <code>{cfg.redirectUris.linkedin}</code></p>
        </section>
      )}
    </AdminLayout>
  );
};

export default AdminSocial;
