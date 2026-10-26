import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { COUNTRIES, PROVINCES, PYME_INTEREST_MODES, PYME_PRODUCTION_MODES } from "@/data/tokenizate";

export const field = "mt-1.5 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-base text-foreground placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-[#F3F5F8]";
export const label = "block text-sm font-medium text-foreground";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Pyme = Record<string, any> & { _state?: Record<string, string> };

/** Primer paso, corto: contacto y datos esenciales del proyecto productivo. */
export const PymeStartForm = ({ onSubmit, loading, error }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean; error: string | null }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-2xl font-semibold text-[#0B2545]">Paso 1 · Tu producción</h2>
    <p className="text-sm text-muted-foreground">Son pocos datos. Después podés completar el resto, guardar el borrador y volver con tu clave.</p>
    <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>No completar<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div><label htmlFor="p-name" className={label}>Nombre o razón social *</label><input id="p-name" name="name" required minLength={2} maxLength={160} className={field} autoComplete="organization" /></div>
      <div><label htmlFor="p-contact" className={label}>Nombre de contacto *</label><input id="p-contact" name="contact_name" required maxLength={160} className={field} autoComplete="name" /></div>
      <div><label htmlFor="p-role" className={label}>Función del contacto</label><input id="p-role" name="contact_role" maxLength={120} className={field} /></div>
      <div><label htmlFor="p-email" className={label}>Correo electrónico *</label><input id="p-email" name="email" type="email" required className={field} autoComplete="email" /></div>
      <div><label htmlFor="p-phone" className={label}>WhatsApp *</label><input id="p-phone" name="phone" type="tel" required className={field} autoComplete="tel" /></div>
      <div><label htmlFor="p-country" className={label}>País *</label><select id="p-country" name="country" required defaultValue="Argentina" className={field}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="p-prov" className={label}>Provincia *</label><select id="p-prov" name="province" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="p-loc" className={label}>Localidad *</label><input id="p-loc" name="locality" required maxLength={120} className={field} /></div>
      <div className="md:col-span-2"><label htmlFor="p-prod" className={label}>Producto *</label><input id="p-prod" name="product" required maxLength={160} className={field} placeholder="Qué producís o querés producir" /></div>
      <div className="md:col-span-2"><label htmlFor="p-sum" className={label}>Resumen del proyecto *</label><textarea id="p-sum" name="summary" required minLength={10} rows={4} maxLength={3000} className={field} placeholder="Qué es el lote, para quién es y cómo lo vas a vender" /></div>
      <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="p-amt" className={label}>Financiación buscada *</label><input id="p-amt" name="fundingAmount" inputMode="decimal" required className={field} /></div><div><label htmlFor="p-cur" className={label}>Moneda *</label><select id="p-cur" name="fundingCurrency" required defaultValue="" className={field}><option value="" disabled>—</option><option>ARS</option><option>USD</option></select></div></div>
      <div><label htmlFor="p-use" className={label}>Destino principal de los fondos *</label><input id="p-use" name="fundsUse" required maxLength={2000} className={field} placeholder="Ej.: materia prima y envasado" /></div>
    </div>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto las <Link to="/tokenizate/bases-y-condiciones" target="_blank" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>, incluida la aclaración de que postular no obliga a Alba Capital ni garantiza financiación. *</span></label>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="privacy" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto la <Link to="/tokenizate/privacidad" target="_blank" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>. *</span></label>
    {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <button type="submit" disabled={loading} className={btnPrimary}>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Crear expediente y continuar</button>
  </form>
);

const STATE_LABEL: Record<string, string> = { "": "Sin indicar", comprobado: "Dato comprobado", estimado: "Estimación", no_tengo: "Todavía no lo tengo", orientacion: "Necesito orientación" };

interface FP { k: string; text: string; pyme: Pyme; setPyme: (p: Pyme) => void; long?: boolean; rows?: number; hint?: string; withState?: boolean; placeholder?: string }
/** Campo de texto con indicación de si el dato está comprobado, es una estimación o falta. */
const Field = ({ k, text, pyme, setPyme, long, rows = 3, hint, withState = true, placeholder }: FP) => {
  const state = pyme._state?.[k] ?? "";
  const set = (v: string) => setPyme({ ...pyme, [k]: v });
  const setState = (v: string) => setPyme({ ...pyme, _state: { ...(pyme._state ?? {}), ...(v ? { [k]: v } : {}) } });
  const unknown = state === "no_tengo" || state === "orientacion";
  return (
    <div className={long ? "md:col-span-2" : ""}>
      <label htmlFor={`py-${k}`} className={label}>{text}</label>
      {long ? <textarea id={`py-${k}`} rows={rows} className={field} value={pyme[k] ?? ""} placeholder={placeholder} onChange={(e) => set(e.target.value)} aria-describedby={hint ? `h-${k}` : undefined} />
        : <input id={`py-${k}`} className={field} value={pyme[k] ?? ""} placeholder={placeholder} onChange={(e) => set(e.target.value)} aria-describedby={hint ? `h-${k}` : undefined} />}
      {hint && <p id={`h-${k}`} className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {withState && (
        <div className="mt-1.5">
          <label htmlFor={`pys-${k}`} className="sr-only">Estado del dato: {text}</label>
          <select id={`pys-${k}`} className="rounded-md border border-input bg-white px-2 py-1 text-xs text-foreground" value={state} onChange={(e) => setState(e.target.value)}>
            {Object.entries(STATE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {unknown && <span className="ml-2 text-xs text-muted-foreground">Contanos brevemente tu situación en el campo.</span>}
        </div>
      )}
    </div>
  );
};

type Fs = (k: string, v: string) => void;
interface SP { pyme: Pyme; setPyme: (p: Pyme) => void; form: Record<string, string>; setF: Fs }

/** Pasos 2 a 4 de la postulación productiva. */
export const PymeStep = ({ step, pyme, setPyme, form, setF }: SP & { step: number }) => {
  const p = { pyme, setPyme };
  if (step === 1) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Datos iniciales</h2></div>
        <div><label htmlFor="s1-name" className={label}>Nombre o razón social *</label><input id="s1-name" className={field} value={form.owner_name ?? ""} onChange={(e) => setF("owner_name", e.target.value)} /></div>
        <Field k="contact_name" text="Nombre de contacto *" {...p} withState={false} />
        <Field k="contact_role" text="Función del contacto" {...p} withState={false} />
        <div><label htmlFor="s1-email" className={label}>Correo (el de la creación del expediente)</label><input id="s1-email" className={field} value={form.owner_email ?? ""} disabled /></div>
        <div><label htmlFor="s1-phone" className={label}>WhatsApp *</label><input id="s1-phone" className={field} value={form.owner_phone ?? ""} onChange={(e) => setF("owner_phone", e.target.value)} /></div>
        <div><label htmlFor="s1-prov" className={label}>Provincia *</label><select id="s1-prov" className={field} value={form.owner_province ?? ""} onChange={(e) => setF("owner_province", e.target.value)}><option value="">Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <Field k="locality" text="Localidad *" {...p} withState={false} />
        <div><label htmlFor="s1-prod" className={label}>Producto *</label><input id="s1-prod" className={field} value={form.project_name ?? ""} onChange={(e) => setF("project_name", e.target.value)} /></div>
        <div className="md:col-span-2"><label htmlFor="s1-sum" className={label}>Resumen del proyecto *</label><textarea id="s1-sum" rows={4} className={field} value={form.summary ?? ""} onChange={(e) => setF("summary", e.target.value)} /></div>
        <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="s1-amt" className={label}>Financiación buscada *</label><input id="s1-amt" inputMode="decimal" className={field} value={form.funding_amount ?? ""} onChange={(e) => setF("funding_amount", e.target.value)} /></div><div><label htmlFor="s1-cur" className={label}>Moneda *</label><select id="s1-cur" className={field} value={form.funding_currency ?? ""} onChange={(e) => setF("funding_currency", e.target.value)}><option value="">—</option><option>ARS</option><option>USD</option></select></div></div>
        <div><label htmlFor="s1-use" className={label}>Destino principal de los fondos *</label><input id="s1-use" className={field} value={form.funds_use ?? ""} onChange={(e) => setF("funds_use", e.target.value)} /></div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Empresa y capacidad de producción</h2><p className="mt-1 text-sm text-muted-foreground">Todo es opcional por ahora: indicá “Todavía no lo tengo” o “Necesito orientación” donde corresponda.</p></div>
        <Field k="cuit" text="CUIT de la empresa" {...p} withState={false} hint="Se solicitará de todos modos en la etapa documental si avanza." />
        <Field k="representation" text="Representación (quién firma y con qué facultades)" {...p} long rows={2} />
        <Field k="experience" text="Experiencia en el rubro" {...p} long />
        <Field k="capacity" text="Capacidad de producción (instalaciones, equipos, personal)" {...p} long />
        <div>
          <label htmlFor="py-production_mode" className={label}>Forma de producción</label>
          <select id="py-production_mode" className={field} value={pyme.production_mode ?? ""} onChange={(e) => setPyme({ ...pyme, production_mode: e.target.value })}>
            <option value="">Elegí una opción</option>{Object.entries(PYME_PRODUCTION_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {(pyme.production_mode === "tercerizada" || pyme.production_mode === "mixta") && <Field k="maker_info" text="Quién fabrica (razón social, ubicación, acuerdo vigente)" {...p} long rows={2} />}
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Lote, calendario y presupuesto</h2></div>
        <Field k="lot_id" text="Identificación del lote, partida u orden" {...p} />
        <Field k="lot_volume" text="Volumen" {...p} />
        <Field k="lot_unit" text="Unidad de medida" {...p} placeholder="kg, unidades, litros…" />
        <Field k="current_stage" text="Etapa actual" {...p} />
        <Field k="schedule" text="Calendario de producción y comercialización" {...p} long />
        <Field k="budget" text="Presupuesto desglosado" {...p} long rows={5} hint="Rubros y montos (materia prima, mano de obra, envases, flete…). Indicá la moneda." />
        <Field k="own_contribution" text="Aporte propio" {...p} />
        <Field k="other_funding" text="Otras fuentes de financiación" {...p} />
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Comercialización y riesgos</h2></div>
      <Field k="sales_history" text="Ventas históricas o antecedentes comerciales" {...p} long />
      <Field k="orders_buyers" text="Pedidos, compradores o canales previstos" {...p} long />
      <Field k="price_estimate" text="Precio de venta estimado" {...p} />
      <Field k="price_basis" text="Fundamento del precio" {...p} />
      <Field k="distribution_costs" text="Costos de distribución y comercialización" {...p} long rows={2} />
      <Field k="risks" text="Riesgos productivos y de conservación" {...p} long />
      <Field k="insurance" text="Seguros, cuando correspondan" {...p} long rows={2} />
      <div>
        <label htmlFor="py-liens" className={label}>¿Hay deudas, gravámenes o compromisos sobre este lote? (declaración)</label>
        <select id="py-liens" className={field} value={form.has_liens ?? ""} onChange={(e) => setF("has_liens", e.target.value)}><option value="">Elegí una opción</option><option value="no">No</option><option value="si">Sí</option><option value="no_se">No lo sé todavía</option></select>
      </div>
      {form.has_liens === "si" && <div><label htmlFor="py-ld" className={label}>Detalle</label><textarea id="py-ld" rows={2} className={field} value={form.liens_detail ?? ""} onChange={(e) => setF("liens_detail", e.target.value)} /></div>}
      <div className="md:col-span-2">
        <label htmlFor="py-interest_mode" className={label}>Modalidad de interés (sujeta a análisis, no es una elección vinculante)</label>
        <select id="py-interest_mode" className={field} value={pyme.interest_mode ?? ""} onChange={(e) => setPyme({ ...pyme, interest_mode: e.target.value })}>
          <option value="">Elegí una opción</option>{Object.entries(PYME_INTEREST_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
    </div>
  );
};
