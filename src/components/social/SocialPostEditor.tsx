import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Loader2, Save, Send, Sparkles, RefreshCw, TriangleAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { socialApi } from "@/lib/social/api";
import { blobToBase64, canvasToJpeg, loadImage, pieceSignature, renderPiece } from "@/lib/social/composer";
import { buildCaption, countHashtags } from "@/lib/social/captions";
import { checkPieceForNetwork, FORMAT_IDS, FORMATS, NETWORK_LABEL, NETWORK_RULES } from "@/lib/social/formats";
import { withUtm } from "@/lib/social/utm";
import type { FormatId, Network, PostContent } from "@/lib/social/types";
import logoWhite from "@/assets/alba-logo-white.webp";

interface Account {
  id: string;
  network: Network;
  display_name: string;
  status: string;
  status_detail: string | null;
  selected: boolean;
  is_default: boolean;
  publish_enabled: boolean;
}
interface Delivery {
  id: string;
  post_id: string;
  network: Network;
  format: FormatId;
  status: string;
  error: string | null;
  external_url: string | null;
  attempts: number;
  content_version: number;
  social_accounts?: { display_name: string } | null;
}
interface Snapshot {
  id: string;
  slug: string;
  title: string;
  tipo: string | null;
  description: string;
  location: string | null;
  photoUrl: string | null;
  url: string;
  published: boolean;
}
interface PostRow {
  id: string;
  content: Partial<PostContent> & { pieceSig?: string; format?: FormatId };
  content_version: number;
  outdated: boolean;
  updated_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  queued: "En cola",
  processing: "Enviando…",
  published: "Publicado",
  failed: "Falló",
  needs_review: "Requiere revisión",
};
const ACCOUNT_STATUS: Record<string, string> = {
  connected: "Conectada",
  needs_reconnect: "Requiere reconexión",
  insufficient_permissions: "Permisos insuficientes",
  pending_approval: "Pendiente de habilitación",
};

const DEFAULT_CTA = "Conocé el proyecto y registrá tu interés en Alba Capital";
const domainOf = (url: string) => new URL(url).host;

const SocialPostEditor = ({ opportunityId, open, onOpenChange }: { opportunityId: string; open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [post, setPost] = useState<PostRow | null>(null);
  const [outdated, setOutdated] = useState(false);
  const [content, setContent] = useState<PostContent | null>(null);
  const [format, setFormat] = useState<FormatId>("square");
  const [targets, setTargets] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const dirty = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await socialApi("post_list", { opportunityId });
      setSnap(r.opportunity);
      setAccounts(r.accounts);
      setDeliveries(r.deliveries);
      const latest: PostRow | undefined = r.posts[0];
      setPost(latest ?? null);
      setOutdated(!!latest?.outdated);
      const cta = r.settings?.default_cta ?? DEFAULT_CTA;
      const c = latest?.content ?? {};
      setContent({
        title: c.title ?? r.opportunity.title,
        description: c.description ?? r.opportunity.description,
        cta: c.cta ?? cta,
        imageUrl: c.imageUrl ?? r.opportunity.photoUrl ?? "",
        focus: c.focus ?? { x: 0.5, y: 0.5 },
        zoom: c.zoom ?? 1,
        captions: c.captions ?? {},
        captionEdited: c.captionEdited ?? {},
      });
      if (c.format) setFormat(c.format);
      setTargets(Object.fromEntries((r.accounts as Account[]).filter((a) => a.selected && a.publish_enabled && a.is_default).map((a) => [a.id, true])));
      dirty.current = false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar");
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const update = (patch: Partial<PostContent>) => {
    dirty.current = true;
    setContent((c) => (c ? { ...c, ...patch } : c));
  };

  const captionFor = useCallback(
    (n: Network): string => {
      if (!content || !snap) return "";
      if (content.captionEdited[n] && content.captions[n] !== undefined) return content.captions[n]!;
      return buildCaption(n, { title: content.title, description: content.description, cta: content.cta, url: withUtm(snap.url, n, snap.slug), tipo: snap.tipo, location: snap.location });
    },
    [content, snap],
  );

  const setCaption = (n: Network, value: string) =>
    update({ captions: { ...content!.captions, [n]: value }, captionEdited: { ...content!.captionEdited, [n]: true } });

  // Vista previa: misma función de render que la exportación.
  const sig = content ? pieceSignature(content) : "";
  const render = useCallback(
    async (fmt: FormatId): Promise<HTMLCanvasElement> => {
      const [photo, logo] = await Promise.all([loadImage(content!.imageUrl), loadImage(logoWhite)]);
      return renderPiece(content!, fmt, { photo, logo, domain: snap ? domainOf(snap.url) : "" });
    },
    [content, snap],
  );

  useEffect(() => {
    if (!content?.imageUrl || !snap || !previewRef.current) return;
    let cancelled = false;
    render(format)
      .then((c) => {
        if (cancelled || !previewRef.current) return;
        const dst = previewRef.current;
        dst.width = c.width;
        dst.height = c.height;
        dst.getContext("2d")!.drawImage(c, 0, 0);
      })
      .catch(() => !cancelled && setError("No se pudo componer la imagen (¿imagen no accesible?)"));
    return () => {
      cancelled = true;
    };
  }, [render, format, content?.imageUrl, snap]);

  const save = async (generated = false, acceptCurrent = false) => {
    if (!content) return null;
    const captions: Partial<Record<Network, string>> = {};
    (Object.keys(NETWORK_LABEL) as Network[]).forEach((n) => (captions[n] = captionFor(n)));
    const res = await socialApi("post_save", {
      opportunityId,
      postId: post?.id,
      generated,
      acceptCurrent,
      content: { ...content, captions, pieceSig: sig, format },
    });
    dirty.current = false;
    return res as { id: string; version: number };
  };

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast({ title: "No se pudo completar la acción", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const saveDraft = () =>
    run("save", async () => {
      await save(false);
      await load();
      toast({ title: "Borrador guardado", description: "No se publicó nada." });
    });

  const generate = () =>
    run("gen", async () => {
      const saved = await save(true);
      if (!saved) return;
      // Se generan y suben los 4 formatos; la subida es solo almacenamiento privado del pipeline, no publica.
      for (const f of FORMAT_IDS) {
        const blob = await canvasToJpeg(await render(f));
        await socialApi("upload_piece", { postId: saved.id, format: f, sig, data: await blobToBase64(blob) });
      }
      await load();
      toast({ title: "Piezas generadas", description: "Listas para descargar o publicar. No se publicó nada." });
    });

  const download = () =>
    run("dl", async () => {
      const blob = await canvasToJpeg(await render(format));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `alba-capital-${snap?.slug}-${format}.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });

  const copy = async (n: Network) => {
    try {
      await navigator.clipboard.writeText(captionFor(n));
      toast({ title: `Texto de ${NETWORK_LABEL[n]} copiado` });
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      toast({ title: "Imagen no válida", description: "Usá JPG, PNG o WebP de hasta 10 MB.", variant: "destructive" });
      return;
    }
    if (uploaded) URL.revokeObjectURL(uploaded);
    const url = URL.createObjectURL(file);
    setUploaded(url);
    update({ imageUrl: url });
  };

  const eligible = useMemo(() => accounts.filter((a) => a.selected), [accounts]);
  const chosen = eligible.filter((a) => targets[a.id]);
  const accountReason = (a: Account): string | null => {
    if (a.status !== "connected") return ACCOUNT_STATUS[a.status] + (a.status_detail ? ` — ${a.status_detail}` : "");
    if (!a.publish_enabled) return "No habilitada para publicar";
    const c = checkPieceForNetwork(a.network, format, { ...FORMATS[format], bytes: 1 });
    return c.ok ? null : c.reason!;
  };

  const publish = () =>
    run("publish", async () => {
      setConfirmOpen(false);
      const saved = await save(true);
      if (!saved) return;
      for (const f of new Set(chosen.map(() => format))) {
        const blob = await canvasToJpeg(await render(f));
        await socialApi("upload_piece", { postId: saved.id, format: f, sig, data: await blobToBase64(blob) });
      }
      const r = await socialApi("publish", {
        postId: saved.id,
        confirm: true,
        targets: chosen.map((a) => ({ accountId: a.id, format, caption: captionFor(a.network) })),
      });
      setDeliveries(r.deliveries);
      const bad = (r.results as { ok: boolean; reason?: string }[]).filter((x) => !x.ok);
      toast({ title: bad.length ? "Publicación con observaciones" : "Envío realizado", description: bad[0]?.reason, variant: bad.length ? "destructive" : undefined });
      await load();
    });

  const act = (key: string, action: string, body: Record<string, unknown>) =>
    run(key, async () => {
      const r = await socialApi(action, body);
      if (r.deliveries) setDeliveries(r.deliveries);
      else await load();
    });

  if (!open) return null;
  const currentDeliveries = deliveries.filter((d) => !post || d.post_id === post.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[94vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear publicación</DialogTitle>
            <DialogDescription>
              {snap?.title}. Guardar o generar no publica nada; solo “Publicar” envía a las redes, con tu confirmación.
            </DialogDescription>
          </DialogHeader>

          {loading || !content || !snap ? (
            <div className="flex h-60 items-center justify-center text-muted-foreground">
              {error ? <p className="max-w-md text-center text-sm text-destructive">{error}</p> : <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="space-y-4">
                {outdated && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p>La oportunidad cambió después de generar este borrador. Tu versión revisada se conserva.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          run("refresh", async () => {
                            update({ title: snap.title, description: snap.description, imageUrl: snap.photoUrl ?? content.imageUrl, captionEdited: {}, captions: {} });
                            await save(false, true);
                            setOutdated(false);
                          })
                        }
                      >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reemplazar con los datos actuales
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {FORMAT_IDS.map((f) => (
                    <Button key={f} size="sm" variant={f === format ? "default" : "outline"} onClick={() => setFormat(f)}>
                      {FORMATS[f].label}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-center rounded-xl bg-muted/50 p-3">
                  <canvas
                    ref={previewRef}
                    aria-label="Vista previa de la pieza"
                    className="max-h-[60vh] w-auto max-w-full rounded-lg shadow"
                    style={{ aspectRatio: `${FORMATS[format].width} / ${FORMATS[format].height}` }}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">Encuadre horizontal</Label>
                    <Slider min={0} max={100} value={[content.focus.x * 100]} onValueChange={([v]) => update({ focus: { ...content.focus, x: v / 100 } })} />
                  </div>
                  <div>
                    <Label className="text-xs">Encuadre vertical</Label>
                    <Slider min={0} max={100} value={[content.focus.y * 100]} onValueChange={([v]) => update({ focus: { ...content.focus, y: v / 100 } })} />
                  </div>
                  <div>
                    <Label className="text-xs">Zoom</Label>
                    <Slider min={100} max={250} value={[content.zoom * 100]} onValueChange={([v]) => update({ zoom: v / 100 })} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Imagen:</span>
                  {snap.photoUrl && (
                    <Button size="sm" variant={content.imageUrl === snap.photoUrl ? "default" : "outline"} onClick={() => update({ imageUrl: snap.photoUrl! })}>
                      Portada del proyecto
                    </Button>
                  )}
                  <Label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">
                    Subir otra imagen
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onUpload(e.target.files?.[0])} />
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Subí solo imágenes cuyos derechos sean de Alba Capital. El proyecto no tiene una galería propia: hoy solo existe la portada.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sp-title">Título</Label>
                  <Input id="sp-title" value={content.title} maxLength={150} onChange={(e) => update({ title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-desc">Descripción breve</Label>
                  <Textarea id="sp-desc" rows={3} value={content.description} maxLength={2000} onChange={(e) => update({ description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-cta">Llamada a la acción</Label>
                  <Input id="sp-cta" value={content.cta} maxLength={200} onChange={(e) => update({ cta: e.target.value })} />
                </div>
                <p className="break-all text-xs text-muted-foreground">
                  Enlace del proyecto: <span className="font-medium">{snap.url}</span> (cada red agrega sus propios UTM).
                </p>

                <div className="space-y-2">
                  <Label>Cuentas de destino</Label>
                  {eligible.length === 0 && (
                    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      No hay cuentas elegidas. Conectalas en Marketing → Redes sociales. Mientras tanto podés descargar la imagen y copiar el texto.
                    </p>
                  )}
                  {eligible.map((a) => {
                    const reason = accountReason(a);
                    return (
                      <label key={a.id} className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
                        <Checkbox checked={!!targets[a.id]} disabled={!!reason} onCheckedChange={(v) => setTargets((t) => ({ ...t, [a.id]: v === true }))} />
                        <span>
                          <span className="font-medium">{NETWORK_LABEL[a.network]}</span> · {a.display_name}
                          {reason ? <span className="mt-0.5 block text-xs text-destructive">{reason}</span> : <span className="mt-0.5 block text-xs text-muted-foreground">Habilitada para publicar</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <Label>Texto por red</Label>
                  {(Object.keys(NETWORK_LABEL) as Network[]).map((n) => {
                    const text = captionFor(n);
                    const over = text.length > NETWORK_RULES[n].maxCaption;
                    return (
                      <div key={n} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{NETWORK_LABEL[n]}</span>
                          <span className={over ? "text-destructive" : "text-muted-foreground"}>
                            {text.length}/{NETWORK_RULES[n].maxCaption} · {countHashtags(text)} hashtags
                          </span>
                        </div>
                        <Textarea rows={5} value={text} onChange={(e) => setCaption(n, e.target.value)} />
                        {!NETWORK_RULES[n].linkClickable && (
                          <p className="text-xs text-muted-foreground">El enlace no es clickeable en el pie de Instagram: se muestra como texto.</p>
                        )}
                        <Button type="button" variant="ghost" size="sm" onClick={() => copy(n)}>
                          <Copy className="mr-2 h-3.5 w-3.5" /> Copiar texto de {NETWORK_LABEL[n]}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button variant="outline" onClick={saveDraft} disabled={!!busy}>
                    {busy === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Guardar borrador
                  </Button>
                  <Button variant="outline" onClick={generate} disabled={!!busy}>
                    {busy === "gen" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generar pieza
                  </Button>
                  <Button variant="outline" onClick={download} disabled={!!busy}>
                    <Download className="mr-2 h-4 w-4" /> Descargar imagen
                  </Button>
                  <Button onClick={() => setConfirmOpen(true)} disabled={!!busy || chosen.length === 0 || !snap.published}>
                    {busy === "publish" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Publicar
                  </Button>
                </div>
                {!snap.published && <p className="text-xs text-destructive">La oportunidad no está publicada en el sitio: no se puede promocionar.</p>}

                {currentDeliveries.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <Label>Resultado por destino</Label>
                    {currentDeliveries.map((d) => (
                      <div key={d.id} className="rounded-lg border border-border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span>
                            {NETWORK_LABEL[d.network]} · {d.social_accounts?.display_name} · v{d.content_version}
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            {d.status === "published" ? <CheckCircle2 className="h-4 w-4" /> : d.status === "failed" ? <XCircle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4" />}
                            {STATUS_LABEL[d.status] ?? d.status}
                          </span>
                        </div>
                        {d.error && <p className="mt-1 text-xs text-destructive">{d.error}</p>}
                        {d.external_url && (
                          <a className="mt-1 block text-xs underline" href={d.external_url} target="_blank" rel="noopener noreferrer">
                            Ver publicación
                          </a>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {d.status === "failed" && d.attempts < 3 && (
                            <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act(`r${d.id}`, "retry", { deliveryId: d.id })}>
                              Reintentar
                            </Button>
                          )}
                          {d.status === "needs_review" && (
                            <>
                              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act(`c${d.id}`, "reconcile", { deliveryId: d.id }).then(load)}>
                                Comprobar con la red
                              </Button>
                              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act(`p${d.id}`, "resolve", { deliveryId: d.id, outcome: "published" })}>
                                Sí se publicó
                              </Button>
                              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act(`n${d.id}`, "resolve", { deliveryId: d.id, outcome: "not_published" })}>
                                No se publicó
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar ahora?</AlertDialogTitle>
            <AlertDialogDescription>Revisá el contenido final. Esto se enviará a las cuentas elegidas y quedará registrado a tu nombre.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Formato:</span> {FORMATS[format].label}
            </p>
            {chosen.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-3">
                <p className="font-medium">
                  {NETWORK_LABEL[a.network]} · {a.display_name}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{captionFor(a.network)}</p>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={publish}>Confirmar y publicar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SocialPostEditor;
