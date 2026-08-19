import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { prepareTeamPhoto, buildOpportunityPhotoPath, ImageValidationError } from "@/lib/imageUpload";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import type { Locale } from "@/i18n/types";

const LOCALE_TABS: { locale: Locale; label: string }[] = [
  { locale: "es-AR", label: "Español (AR)" },
  { locale: "en-US", label: "English (US)" },
  { locale: "pt-BR", label: "Português (BR)" },
];

const generalSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones."),
  location: z.string().trim().max(150).optional().or(z.literal("")),
  tir_estimada: z.string().trim().max(50).optional().or(z.literal("")),
  plazo: z.string().trim().max(50).optional().or(z.literal("")),
  ticket_minimo: z.string().trim().max(50).optional().or(z.literal("")),
  capital_objetivo: z.string().trim().max(50).optional().or(z.literal("")),
  capital_captado: z.coerce.number().min(0).max(100),
  photo_alt: z.string().trim().max(250).optional().or(z.literal("")),
});

type Translations = Record<Locale, { title: string; tipo: string; descripcion: string; highlights: string }>;

const emptyTranslations = (): Translations => ({
  "es-AR": { title: "", tipo: "", descripcion: "", highlights: "" },
  "en-US": { title: "", tipo: "", descripcion: "", highlights: "" },
  "pt-BR": { title: "", tipo: "", descripcion: "", highlights: "" },
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminOpportunityForm = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Locale>("es-AR");
  const [slugTouched, setSlugTouched] = useState(false);

  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [tirEstimada, setTirEstimada] = useState("");
  const [plazo, setPlazo] = useState("");
  const [ticketMinimo, setTicketMinimo] = useState("");
  const [capitalObjetivo, setCapitalObjetivo] = useState("");
  const [capitalCaptado, setCapitalCaptado] = useState("0");
  const [photoAlt, setPhotoAlt] = useState("");
  const [dealStatus, setDealStatus] = useState<"abierto" | "due-diligence" | "cerrado">("abierto");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [translations, setTranslations] = useState<Translations>(emptyTranslations());

  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ created_at?: string; updated_at?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data: opp, error } = await supabase.from("opportunities").select("*").eq("id", id).single();
      if (error || !opp) {
        toast({ title: "No se pudo cargar la oportunidad", variant: "destructive" });
        navigate("/admin/opportunities");
        return;
      }
      setSlug(opp.slug);
      setLocation(opp.location ?? "");
      setTirEstimada(opp.tir_estimada ?? "");
      setPlazo(opp.plazo ?? "");
      setTicketMinimo(opp.ticket_minimo ?? "");
      setCapitalObjetivo(opp.capital_objetivo ?? "");
      setCapitalCaptado(String(opp.capital_captado));
      setPhotoAlt(opp.photo_alt ?? "");
      setDealStatus(opp.deal_status as typeof dealStatus);
      setIsFeatured(opp.is_featured);
      setStatus(opp.status as typeof status);
      setPhotoPath(opp.photo_path);
      setMeta({ created_at: opp.created_at, updated_at: opp.updated_at });
      if (opp.photo_path) {
        setPhotoPreview(supabase.storage.from("opportunity-photos").getPublicUrl(opp.photo_path).data.publicUrl);
      }

      const { data: trs } = await supabase.from("opportunity_translations").select("*").eq("opportunity_id", id);
      if (trs) {
        setTranslations((prev) => {
          const next = { ...prev };
          for (const t of trs) {
            if (t.locale === "es-AR" || t.locale === "en-US" || t.locale === "pt-BR") {
              next[t.locale] = {
                title: t.title ?? "",
                tipo: t.tipo ?? "",
                descripcion: t.descripcion ?? "",
                highlights: t.highlights ?? "",
              };
            }
          }
          return next;
        });
      }
      setLoading(false);
    })();
  }, [id, isNew, navigate, toast]);

  const handleTitleChange = (value: string) => {
    setTranslations((prev) => ({ ...prev, "es-AR": { ...prev["es-AR"], title: value } }));
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const updateTranslation = (locale: Locale, field: keyof Translations[Locale], value: string) => {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  };

  const handleSave = async () => {
    const parsed = generalSchema.safeParse({
      slug,
      location,
      tir_estimada: tirEstimada,
      plazo,
      ticket_minimo: ticketMinimo,
      capital_objetivo: capitalObjetivo,
      capital_captado: capitalCaptado,
      photo_alt: photoAlt,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      toast({ title: "Revisá los datos generales", variant: "destructive" });
      return;
    }
    if (!translations["es-AR"].title.trim()) {
      setErrors((e) => ({ ...e, titleEs: "El título en español es obligatorio (mínimo para publicar)." }));
      toast({ title: "Falta el título en español", variant: "destructive" });
      return;
    }
    setErrors({});
    setSaving(true);

    let finalPhotoPath = photoPath;
    try {
      if (newPhotoFile) {
        const optimized = await prepareTeamPhoto(newPhotoFile);
        const newPath = buildOpportunityPhotoPath(parsed.data.slug);
        const { error: uploadError } = await supabase.storage.from("opportunity-photos").upload(newPath, optimized, {
          contentType: "image/webp",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        if (photoPath) {
          await supabase.storage.from("opportunity-photos").remove([photoPath]);
        }
        finalPhotoPath = newPath;
      }
    } catch (err) {
      setSaving(false);
      const message = err instanceof ImageValidationError ? err.message : "No se pudo procesar la fotografía.";
      toast({ title: message, variant: "destructive" });
      return;
    }

    const payload = {
      slug: parsed.data.slug,
      location: parsed.data.location || null,
      tir_estimada: parsed.data.tir_estimada || null,
      plazo: parsed.data.plazo || null,
      ticket_minimo: parsed.data.ticket_minimo || null,
      capital_objetivo: parsed.data.capital_objetivo || null,
      capital_captado: parsed.data.capital_captado,
      photo_alt: parsed.data.photo_alt || translations["es-AR"].title,
      photo_path: finalPhotoPath,
      deal_status: dealStatus,
      is_featured: isFeatured,
      status,
    };

    let opportunityId = id;
    if (isNew) {
      const { data, error } = await supabase.from("opportunities").insert(payload).select("id").single();
      if (error) {
        setSaving(false);
        toast({ title: "No se pudo crear la oportunidad", description: error.message, variant: "destructive" });
        return;
      }
      opportunityId = data.id;
    } else {
      const { error } = await supabase.from("opportunities").update(payload).eq("id", id);
      if (error) {
        setSaving(false);
        toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
        return;
      }
    }

    for (const { locale } of LOCALE_TABS) {
      const t = translations[locale];
      if (!t.title.trim() && !t.descripcion.trim()) continue;
      const { error: trError } = await supabase.from("opportunity_translations").upsert(
        {
          opportunity_id: opportunityId,
          locale,
          title: t.title,
          tipo: t.tipo || null,
          descripcion: t.descripcion || null,
          highlights: t.highlights || null,
        },
        { onConflict: "opportunity_id,locale" },
      );
      if (trError) {
        toast({ title: `Error guardando traducción ${locale}`, description: trError.message, variant: "destructive" });
      }
    }

    setSaving(false);
    toast({ title: isNew ? "Oportunidad creada" : "Cambios guardados" });
    navigate("/admin/opportunities");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/admin/opportunities")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <h1 className="mb-1 text-2xl font-light text-architectural">
        {isNew ? "Nueva oportunidad" : `Editar: ${translations["es-AR"].title || slug}`}
      </h1>
      {meta && (
        <p className="mb-6 text-xs text-muted-foreground">
          Creado: {meta.created_at && new Date(meta.created_at).toLocaleString("es-AR")} · Modificado:{" "}
          {meta.updated_at && new Date(meta.updated_at).toLocaleString("es-AR")}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Foto */}
        <div className="space-y-3">
          <Label>Fotografía</Label>
          <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
            {photoPreview ? (
              <img src={photoPreview} alt="Vista previa" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin foto</div>
            )}
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:bg-muted">
            <Upload className="h-4 w-4" />
            {photoPreview ? "Reemplazar foto" : "Subir foto"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </label>
          <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 5MB. Se optimiza automáticamente.</p>

          <div className="space-y-2 pt-2">
            <Label htmlFor="photo_alt">Texto alternativo de la foto</Label>
            <Input
              id="photo_alt"
              value={photoAlt}
              onChange={(e) => setPhotoAlt(e.target.value)}
              placeholder={translations["es-AR"].title}
            />
          </div>
        </div>

        {/* Datos generales */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Título (español)</Label>
              <Input
                id="title"
                value={translations["es-AR"].title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              {errors.titleEs && <p className="text-xs text-destructive">{errors.titleEs}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Palermo, CABA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tir">TIR estimada</Label>
              <Input id="tir" value={tirEstimada} onChange={(e) => setTirEstimada(e.target.value)} placeholder="28% anual" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plazo">Plazo</Label>
              <Input id="plazo" value={plazo} onChange={(e) => setPlazo(e.target.value)} placeholder="30 meses" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket">Ticket mínimo</Label>
              <Input id="ticket" value={ticketMinimo} onChange={(e) => setTicketMinimo(e.target.value)} placeholder="USD 25.000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objetivo">Capital objetivo</Label>
              <Input id="objetivo" value={capitalObjetivo} onChange={(e) => setCapitalObjetivo(e.target.value)} placeholder="USD 4.2M" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captado">Capital captado (%)</Label>
              <Input
                id="captado"
                type="number"
                min={0}
                max={100}
                value={capitalCaptado}
                onChange={(e) => setCapitalCaptado(e.target.value)}
              />
              {errors.capital_captado && <p className="text-xs text-destructive">{errors.capital_captado}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="featured" />
              <Label htmlFor="featured">Oportunidad destacada</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="deal_status">Estado del deal</Label>
              <select
                id="deal_status"
                value={dealStatus}
                onChange={(e) => setDealStatus(e.target.value as typeof dealStatus)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="abierto">Abierto</option>
                <option value="due-diligence">Due diligence</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status">Visibilidad</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          {/* Traducciones */}
          <div>
            <div className="mb-3 flex gap-2 border-b border-border">
              {LOCALE_TABS.map(({ locale, label }) => (
                <button
                  key={locale}
                  onClick={() => setActiveTab(locale)}
                  className={`px-3 py-2 text-sm ${
                    activeTab === locale ? "border-b-2 border-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {LOCALE_TABS.map(({ locale }) => (
              <div key={locale} className={activeTab === locale ? "space-y-4" : "hidden"}>
                {locale !== "es-AR" && (
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={translations[locale].title}
                      onChange={(e) => updateTranslation(locale, "title", e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Tipo (ej. "Desarrollo residencial premium")</Label>
                  <Input
                    value={translations[locale].tipo}
                    onChange={(e) => updateTranslation(locale, "tipo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    rows={4}
                    value={translations[locale].descripcion}
                    onChange={(e) => updateTranslation(locale, "descripcion", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Highlights (uno por línea)</Label>
                  <Textarea
                    rows={3}
                    value={translations[locale].highlights}
                    onChange={(e) => updateTranslation(locale, "highlights", e.target.value)}
                    placeholder={"Permisos aprobados\nPreventa 40% colocada\nSalida 2027"}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={() => navigate("/admin/opportunities")}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOpportunityForm;
