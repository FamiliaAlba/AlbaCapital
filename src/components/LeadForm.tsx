import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { Loader2, CheckCircle2 } from "lucide-react";

interface LeadFormProps {
  oportunidadId?: string;
  source?: string;
  title?: string;
  description?: string;
}

const LeadForm = ({ oportunidadId, source = "web", title, description }: LeadFormProps) => {
  const { t, locale } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const { toast } = useToast();

  const schema = z.object({
    nombre: z.string().trim().min(2, t("form.errMin")).max(100, t("form.errMax")),
    email: z.string().trim().email(t("form.errEmail")).max(255, t("form.errMax")),
    telefono: z.string().trim().max(30, t("form.errMax")).optional().or(z.literal("")),
    monto_interes: z.string().trim().max(50, t("form.errMax")).optional().or(z.literal("")),
    mensaje: z.string().trim().max(2000, t("form.errMax")).optional().or(z.literal("")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    // Anti-spam: honeypot invisible completado por bots
    if (honeypot) {
      setSubmitted(true);
      reset();
      return;
    }

    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    const { error } = await supabase.from("leads").insert({
      nombre: values.nombre,
      email: values.email,
      telefono: values.telefono || null,
      monto_interes: values.monto_interes || null,
      mensaje: values.mensaje || null,
      oportunidad_id: oportunidadId || null,
      source: `${source}:${locale}`,
    });

    if (error) {
      toast({
        title: t("form.errorTitle"),
        description: t("form.errorDesc"),
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    reset();
    toast({ title: t("form.successToastTitle"), description: t("form.successToastDesc") });
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-foreground" />
        <h3 className="mt-4 text-2xl font-light text-architectural">{t("form.sentTitle")}</h3>
        <p className="mt-2 text-muted-foreground">{t("form.sentDesc")}</p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          {t("form.sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-6 md:p-8 space-y-5"
    >
      <div>
        <h3 className="text-2xl font-light text-architectural">{title ?? t("form.title")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description ?? t("form.description")}</p>
      </div>

      {/* Honeypot: oculto para usuarios reales, visible para bots automatizados */}
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">{t("form.name")}</Label>
          <Input id="nombre" {...register("nombre")} placeholder={t("form.namePlaceholder")} />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input id="email" type="email" {...register("email")} placeholder={t("form.emailPlaceholder")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">{t("form.phone")}</Label>
          <Input id="telefono" {...register("telefono")} placeholder={t("form.phonePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monto_interes">{t("form.amount")}</Label>
          <Input id="monto_interes" {...register("monto_interes")} placeholder={t("form.amountPlaceholder")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensaje">{t("form.message")}</Label>
        <Textarea id="mensaje" rows={4} {...register("mensaje")} placeholder={t("form.messagePlaceholder")} />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setConsentError(false);
          }}
          className="mt-0.5"
        />
        {t("form.disclaimer")}
      </label>
      {consentError && <p className="text-xs text-destructive">{t("newsletter.consentRequired")}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("form.submit")}
      </Button>
    </form>
  );
};

export default LeadForm;
