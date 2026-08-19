import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { prepareTeamPhoto, buildTeamPhotoPath, ImageValidationError } from "@/lib/imageUpload";
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
  full_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones."),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  public_email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  public_phone: z.string().trim().max(30).optional().or(z.literal("")),
  linkedin_url: z
    .string()
    .trim()
    .url("URL inválida")
    .refine((v) => /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//.test(v), "Debe ser una URL de linkedin.com")
    .optional()
    .or(z.literal("")),
  professional_url: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  photo_alt: z.string().trim().max(250).optional().or(z.literal("")),
});

type Translations = Record<Locale, { role_title: string; specialty: string; department: string; short_bio: string; full_bio: string; location_label: string }>;

const emptyTranslations = (): Translations => ({
  "es-AR": { role_title: "", specialty: "", department: "", short_bio: "", full_bio: "", location_label: "" },
  "en-US": { role_title: "", specialty: "", department: "", short_bio: "", full_bio: "", location_label: "" },
  "pt-BR": { role_title: "", specialty: "", department: "", short_bio: "", full_bio: "", location_label: "" },
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminMemberForm = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Locale>("es-AR");
  const [slugTouched, setSlugTouched] = useState(false);

  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [professionalUrl, setProfessionalUrl] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
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
      const { data: member, error } = await supabase.from("team_members").select("*").eq("id", id).single();
      if (error || !member) {
        toast({ title: "No se pudo cargar el integrante", variant: "destructive" });
        navigate("/admin");
        return;
      }
      setFullName(member.full_name);
      setSlug(member.slug);
      setCountry(member.country ?? "");
      setCity(member.city ?? "");
      setPublicEmail(member.public_email ?? "");
      setPublicPhone(member.public_phone ?? "");
      setLinkedinUrl(member.linkedin_url ?? "");
      setProfessionalUrl(member.professional_url ?? "");
      setPhotoAlt(member.photo_alt ?? "");
      setIsFeatured(member.is_featured);
      setStatus(member.status as "draft" | "published" | "archived");
      setPhotoPath(member.photo_path);
      setMeta({ created_at: member.created_at, updated_at: member.updated_at });
      if (member.photo_path) {
        setPhotoPreview(supabase.storage.from("team-photos").getPublicUrl(member.photo_path).data.publicUrl);
      }

      const { data: trs } = await supabase.from("team_member_translations").select("*").eq("team_member_id", id);
      if (trs) {
        setTranslations((prev) => {
          const next = { ...prev };
          for (const t of trs) {
            if (t.locale === "es-AR" || t.locale === "en-US" || t.locale === "pt-BR") {
              next[t.locale] = {
                role_title: t.role_title ?? "",
                specialty: t.specialty ?? "",
                department: t.department ?? "",
                short_bio: t.short_bio ?? "",
                full_bio: t.full_bio ?? "",
                location_label: t.location_label ?? "",
              };
            }
          }
          return next;
        });
      }
      setLoading(false);
    })();
  }, [id, isNew, navigate, toast]);

  const handleNameChange = (value: string) => {
    setFullName(value);
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
      full_name: fullName,
      slug,
      country,
      city,
      public_email: publicEmail,
      public_phone: publicPhone,
      linkedin_url: linkedinUrl,
      professional_url: professionalUrl,
      photo_alt: photoAlt,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      toast({ title: "Revisá los datos generales", variant: "destructive" });
      return;
    }
    if (!translations["es-AR"].role_title.trim()) {
      setErrors((e) => ({ ...e, roleEs: "El cargo en español es obligatorio (mínimo para publicar)." }));
      toast({ title: "Falta el cargo en español", variant: "destructive" });
      return;
    }
    setErrors({});
    setSaving(true);

    let finalPhotoPath = photoPath;
    try {
      if (newPhotoFile) {
        const optimized = await prepareTeamPhoto(newPhotoFile);
        const newPath = buildTeamPhotoPath(parsed.data.slug);
        const { error: uploadError } = await supabase.storage.from("team-photos").upload(newPath, optimized, {
          contentType: "image/webp",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        // Elimina la foto anterior para no dejar archivos huérfanos
        if (photoPath) {
          await supabase.storage.from("team-photos").remove([photoPath]);
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
      full_name: parsed.data.full_name,
      slug: parsed.data.slug,
      country: parsed.data.country || null,
      city: parsed.data.city || null,
      public_email: parsed.data.public_email || null,
      public_phone: parsed.data.public_phone || null,
      linkedin_url: parsed.data.linkedin_url || null,
      professional_url: parsed.data.professional_url || null,
      photo_alt: parsed.data.photo_alt || parsed.data.full_name,
      photo_path: finalPhotoPath,
      is_featured: isFeatured,
      status,
    };

    let memberId = id;
    if (isNew) {
      const { data, error } = await supabase.from("team_members").insert(payload).select("id").single();
      if (error) {
        setSaving(false);
        toast({ title: "No se pudo crear el integrante", description: error.message, variant: "destructive" });
        return;
      }
      memberId = data.id;
    } else {
      const { error } = await supabase.from("team_members").update(payload).eq("id", id);
      if (error) {
        setSaving(false);
        toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
        return;
      }
    }

    // Upsert de traducciones (una fila por locale)
    for (const { locale } of LOCALE_TABS) {
      const t = translations[locale];
      if (!t.role_title.trim() && !t.short_bio.trim() && !t.full_bio.trim()) continue; // no crear filas vacías
      const { error: trError } = await supabase.from("team_member_translations").upsert(
        {
          team_member_id: memberId,
          locale,
          role_title: t.role_title,
          specialty: t.specialty || null,
          department: t.department || null,
          short_bio: t.short_bio || null,
          full_bio: t.full_bio || null,
          location_label: t.location_label || null,
        },
        { onConflict: "team_member_id,locale" },
      );
      if (trError) {
        toast({ title: `Error guardando traducción ${locale}`, description: trError.message, variant: "destructive" });
      }
    }

    setSaving(false);
    toast({ title: isNew ? "Integrante creado" : "Cambios guardados" });
    navigate("/admin");
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
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/admin")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <h1 className="mb-1 text-2xl font-light text-architectural">
        {isNew ? "Nuevo integrante" : `Editar: ${fullName}`}
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
          <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted">
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
        </div>

        {/* Datos generales */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input id="full_name" value={fullName} onChange={(e) => handleNameChange(e.target.value)} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
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
              <Label htmlFor="country">País</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_email">Email profesional público</Label>
              <Input id="public_email" value={publicEmail} onChange={(e) => setPublicEmail(e.target.value)} />
              {errors.public_email && <p className="text-xs text-destructive">{errors.public_email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_phone">Teléfono profesional (opcional)</Label>
              <Input id="public_phone" value={publicPhone} onChange={(e) => setPublicPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input id="linkedin_url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
              {errors.linkedin_url && <p className="text-xs text-destructive">{errors.linkedin_url}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="professional_url">Otra URL profesional (opcional)</Label>
              <Input id="professional_url" value={professionalUrl} onChange={(e) => setProfessionalUrl(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="photo_alt">Texto alternativo de la foto</Label>
              <Input id="photo_alt" value={photoAlt} onChange={(e) => setPhotoAlt(e.target.value)} placeholder={fullName} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="featured" />
              <Label htmlFor="featured">Integrante destacado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status">Estado</Label>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Cargo {locale === "es-AR" && "(obligatorio)"}</Label>
                    <Input
                      value={translations[locale].role_title}
                      onChange={(e) => updateTranslation(locale, "role_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Especialidad</Label>
                    <Input
                      value={translations[locale].specialty}
                      onChange={(e) => updateTranslation(locale, "specialty", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Área / Departamento</Label>
                    <Input
                      value={translations[locale].department}
                      onChange={(e) => updateTranslation(locale, "department", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ubicación (texto libre, opcional)</Label>
                    <Input
                      value={translations[locale].location_label}
                      onChange={(e) => updateTranslation(locale, "location_label", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Biografía breve</Label>
                  <Textarea
                    rows={2}
                    value={translations[locale].short_bio}
                    onChange={(e) => updateTranslation(locale, "short_bio", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Biografía ampliada</Label>
                  <Textarea
                    rows={5}
                    value={translations[locale].full_bio}
                    onChange={(e) => updateTranslation(locale, "full_bio", e.target.value)}
                  />
                </div>
              </div>
            ))}
            {errors.roleEs && <p className="mt-2 text-xs text-destructive">{errors.roleEs}</p>}
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={() => navigate("/admin")}>
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

export default AdminMemberForm;
