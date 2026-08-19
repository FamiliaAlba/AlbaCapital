import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import { Loader2, CheckCircle2 } from "lucide-react";

const emailSchema = z.string().trim().email().max(255);

type Status = "idle" | "loading" | "success" | "already" | "error";

interface NewsletterFormProps {
  source?: string;
}

const NewsletterForm = ({ source = "blog" }: NewsletterFormProps) => {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // campo trampa anti-bots, debe quedar vacío
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam: si el honeypot fue completado, es un bot. Simulamos éxito
    // sin escribir nada en la base.
    if (honeypot) {
      setStatus("success");
      return;
    }

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrorMsg(t("newsletter.invalidEmail"));
      return;
    }
    if (!consent) {
      setErrorMsg(t("newsletter.consentRequired"));
      return;
    }

    setErrorMsg(null);
    setStatus("loading");

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: parsed.data,
      locale,
      source,
      consent: true,
    });

    if (error) {
      // 23505 = violación de UNIQUE (email ya suscripto)
      if (error.code === "23505") {
        setStatus("already");
        return;
      }
      setStatus("error");
      return;
    }

    setStatus("success");
    setEmail("");
    setConsent(false);
  };

  if (status === "success" || status === "already") {
    return (
      <div className="flex items-center justify-center gap-2 text-base text-foreground max-w-lg mx-auto">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p>{status === "already" ? t("newsletter.alreadySubscribed") : t("newsletter.success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
      {/* Honeypot: oculto visualmente, invisible para usuarios reales, atractivo para bots */}
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

      <div className="flex flex-col sm:flex-row gap-4">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("newsletter.emailLabel")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletter.placeholder")}
          className="flex-1 px-6 py-4 bg-background border border-border text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-4 bg-foreground text-background hover:bg-muted-foreground transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("newsletter.submit")}
        </button>
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground text-left">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        {t("newsletter.consentLabel")}
      </label>

      {errorMsg && <p className="text-sm text-destructive text-left">{errorMsg}</p>}
      {status === "error" && <p className="text-sm text-destructive text-left">{t("newsletter.error")}</p>}
    </form>
  );
};

export default NewsletterForm;
