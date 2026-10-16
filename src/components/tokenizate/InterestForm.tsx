import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { tkApi } from "@/lib/tokenizate/api";
import { readAttribution } from "@/lib/attribution";
import { CAPITAL_RANGES, COUNTRIES, INTEREST_ASSET_TYPES, TK_LEGAL_VERSION } from "@/data/tokenizate";

const field = "mt-1.5 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-base text-foreground placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const label = "block text-sm font-medium text-foreground";

/** Registro de interés (solicitud de información). No es una orden ni una suscripción. */
const InterestForm = () => {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!privacy) {
      setError("Para continuar, aceptá la Política de Privacidad.");
      return;
    }
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const a = readAttribution();
      await tkApi("interested_create", {
        name: f.get("name"), email: f.get("email"), phone: f.get("phone"), country: f.get("country"),
        assetType: f.get("assetType"), capitalRange: f.get("capitalRange"), website: f.get("website"),
        privacy: true, marketing, legalVersion: TK_LEGAL_VERSION, source: "tokenizate", ...a,
      });
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "No pudimos registrar tu solicitud.");
    }
  };

  if (state === "done") {
    return (
      <div role="status" className="rounded-2xl border border-border bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#0B2545]" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-semibold text-[#0B2545]">Recibimos tu solicitud</h3>
        <p className="mt-2 text-muted-foreground">
          Registramos tu interés. Es una solicitud de información: no implica una inversión ni una oferta. Te vamos a contactar cuando haya novedades.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="rounded-2xl border border-border bg-white p-6 md:p-8" aria-describedby="interest-note">
      <h3 className="text-2xl font-semibold text-[#0B2545]">Quiero recibir información</h3>
      <p id="interest-note" className="mt-2 text-sm text-muted-foreground">
        Es una solicitud de información. No es una orden de inversión ni la aceptación de una oferta.
      </p>

      {/* Honeypot: invisible para personas, lo completan los bots */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          No completar
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="tk-name" className={label}>Nombre *</label>
          <input id="tk-name" name="name" required minLength={2} maxLength={120} autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor="tk-email" className={label}>Correo electrónico *</label>
          <input id="tk-email" name="email" type="email" required maxLength={255} autoComplete="email" className={field} />
        </div>
        <div>
          <label htmlFor="tk-phone" className={label}>Teléfono o WhatsApp (opcional)</label>
          <input id="tk-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} />
        </div>
        <div>
          <label htmlFor="tk-country" className={label}>País de residencia *</label>
          <select id="tk-country" name="country" required defaultValue="" className={field}>
            <option value="" disabled>Elegí una opción</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tk-asset" className={label}>Tipo de activo de interés *</label>
          <select id="tk-asset" name="assetType" required defaultValue="" className={field}>
            <option value="" disabled>Elegí una opción</option>
            {INTEREST_ASSET_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tk-range" className={label}>Capital orientativo (opcional)</label>
          <select id="tk-range" name="capitalRange" defaultValue="Prefiero no indicarlo" className={field} aria-describedby="range-note">
            {CAPITAL_RANGES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <p id="range-note" className="mt-1 text-xs text-muted-foreground">No determina elegibilidad ni perfil de riesgo.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1 h-4 w-4 rounded border-input accent-[#0B2545]" required />
          <span>
            Leí y acepto la <Link to="/tokenizate/privacidad" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link> y las{" "}
            <Link to="/tokenizate/bases-y-condiciones" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>. *
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 h-4 w-4 rounded border-input accent-[#0B2545]" />
          <span className="text-muted-foreground">Quiero recibir novedades y comunicaciones comerciales de Alba Capital (opcional).</span>
        </label>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={state === "sending"} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 md:w-auto">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Quiero recibir información
      </button>
    </form>
  );
};

export default InterestForm;
