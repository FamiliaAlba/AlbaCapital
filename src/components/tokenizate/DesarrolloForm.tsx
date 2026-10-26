import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { COUNTRIES, DESARROLLO_INTEREST_MODES, DESARROLLO_KINDS, PROVINCES } from "@/data/tokenizate";
import { Field, field, label, type Pyme } from "./PymeForm";

const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/** Primer paso, corto, de la postulación de un desarrollo inmobiliario u hotelero. */
export const DesarrolloStartForm = ({ onSubmit, loading, error }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean; error: string | null }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-2xl font-semibold text-[#0B2545]">Paso 1 · Tu desarrollo</h2>
    <p className="text-sm text-muted-foreground">Son pocos datos. El detalle del terreno, la obra y la operación se completa después, con borrador y clave personal.</p>
    <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>No completar<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div><label htmlFor="d-name" className={label}>Desarrollador o sociedad *</label><input id="d-name" name="name" required minLength={2} maxLength={160} className={field} autoComplete="organization" /></div>
      <div><label htmlFor="d-contact" className={label}>Nombre de contacto *</label><input id="d-contact" name="contact_name" required maxLength={160} className={field} autoComplete="name" /></div>
      <div><label htmlFor="d-role" className={label}>Función del contacto</label><input id="d-role" name="contact_role" maxLength={120} className={field} /></div>
      <div><label htmlFor="d-email" className={label}>Correo electrónico *</label><input id="d-email" name="email" type="email" required className={field} autoComplete="email" /></div>
      <div><label htmlFor="d-phone" className={label}>WhatsApp *</label><input id="d-phone" name="phone" type="tel" required className={field} autoComplete="tel" /></div>
      <div><label htmlFor="d-country" className={label}>País *</label><select id="d-country" name="country" required defaultValue="Argentina" className={field}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="d-prov" className={label}>Provincia del proyecto *</label><select id="d-prov" name="province" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="d-loc" className={label}>Localidad *</label><input id="d-loc" name="locality" required maxLength={120} className={field} /></div>
      <div><label htmlFor="d-kind" className={label}>Tipo de desarrollo *</label><select id="d-kind" name="project_kind" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{Object.entries(DESARROLLO_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div><label htmlFor="d-proj" className={label}>Nombre del proyecto *</label><input id="d-proj" name="projectName" required maxLength={160} className={field} /></div>
      <div className="md:col-span-2"><label htmlFor="d-sum" className={label}>Resumen *</label><textarea id="d-sum" name="summary" required minLength={10} rows={4} maxLength={3000} className={field} placeholder="Qué se construye, cuántas unidades, quién lo opera y qué se busca financiar" /></div>
      <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="d-amt" className={label}>Monto a financiar con participaciones *</label><input id="d-amt" name="fundingAmount" inputMode="decimal" required className={field} /></div><div><label htmlFor="d-cur" className={label}>Moneda *</label><select id="d-cur" name="fundingCurrency" required defaultValue="" className={field}><option value="" disabled>—</option><option>ARS</option><option>USD</option></select></div></div>
      <div><label htmlFor="d-use" className={label}>Destino principal de los fondos *</label><input id="d-use" name="fundsUse" required maxLength={2000} className={field} placeholder="Ej.: terminación de obra y equipamiento" /></div>
    </div>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto las <Link to="/tokenizate/bases-y-condiciones" target="_blank" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>, incluida la aclaración de que postular no obliga a Alba Capital ni garantiza financiación. *</span></label>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="privacy" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto la <Link to="/tokenizate/privacidad" target="_blank" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>. *</span></label>
    {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <button type="submit" disabled={loading} className={btnPrimary}>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Crear expediente y continuar</button>
  </form>
);

interface SP { mod: Pyme; setMod: (p: Pyme) => void; form: Record<string, string>; setF: (k: string, v: string) => void }

/** Pasos 1 a 4 de la postulación de un desarrollo. */
export const DesarrolloStep = ({ step, mod, setMod, form, setF }: SP & { step: number }) => {
  const p = { pyme: mod, setPyme: setMod };
  if (step === 1) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Datos iniciales</h2></div>
        <div><label htmlFor="ds1-name" className={label}>Desarrollador o sociedad *</label><input id="ds1-name" className={field} value={form.owner_name ?? ""} onChange={(e) => setF("owner_name", e.target.value)} /></div>
        <Field k="contact_name" text="Nombre de contacto *" {...p} withState={false} />
        <Field k="contact_role" text="Función del contacto" {...p} withState={false} />
        <div><label htmlFor="ds1-email" className={label}>Correo (el de la creación del expediente)</label><input id="ds1-email" className={field} value={form.owner_email ?? ""} disabled /></div>
        <div><label htmlFor="ds1-phone" className={label}>WhatsApp *</label><input id="ds1-phone" className={field} value={form.owner_phone ?? ""} onChange={(e) => setF("owner_phone", e.target.value)} /></div>
        <div><label htmlFor="ds1-prov" className={label}>Provincia *</label><select id="ds1-prov" className={field} value={form.owner_province ?? ""} onChange={(e) => setF("owner_province", e.target.value)}><option value="">Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <Field k="locality" text="Localidad *" {...p} withState={false} />
        <div><label htmlFor="ds1-kind" className={label}>Tipo de desarrollo *</label><select id="ds1-kind" className={field} value={mod.project_kind ?? ""} onChange={(e) => setMod({ ...mod, project_kind: e.target.value })}><option value="">Elegí una opción</option>{Object.entries(DESARROLLO_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label htmlFor="ds1-proj" className={label}>Nombre del proyecto *</label><input id="ds1-proj" className={field} value={form.project_name ?? ""} onChange={(e) => setF("project_name", e.target.value)} /></div>
        <div className="md:col-span-2"><label htmlFor="ds1-sum" className={label}>Resumen *</label><textarea id="ds1-sum" rows={4} className={field} value={form.summary ?? ""} onChange={(e) => setF("summary", e.target.value)} /></div>
        <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="ds1-amt" className={label}>Monto a financiar con participaciones *</label><input id="ds1-amt" inputMode="decimal" className={field} value={form.funding_amount ?? ""} onChange={(e) => setF("funding_amount", e.target.value)} /></div><div><label htmlFor="ds1-cur" className={label}>Moneda *</label><select id="ds1-cur" className={field} value={form.funding_currency ?? ""} onChange={(e) => setF("funding_currency", e.target.value)}><option value="">—</option><option>ARS</option><option>USD</option></select></div></div>
        <div><label htmlFor="ds1-use" className={label}>Destino principal de los fondos *</label><input id="ds1-use" className={field} value={form.funds_use ?? ""} onChange={(e) => setF("funds_use", e.target.value)} /></div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Desarrollador y terreno</h2><p className="mt-1 text-sm text-muted-foreground">Todo es opcional por ahora: indicá “Todavía no lo tengo” o “Necesito orientación” donde corresponda.</p></div>
        <Field k="cuit" text="CUIT de la sociedad" {...p} withState={false} hint="Se solicitará de todos modos en la etapa documental si avanza." />
        <Field k="developer_track" text="Antecedentes del desarrollador (obras terminadas, años de experiencia)" {...p} long />
        <Field k="land_title" text="Titularidad del terreno" {...p} long rows={2} hint="Quién es el titular, si hay boleto, fideicomiso previo u otra situación." />
        <Field k="land_status" text="Estado del terreno y de la zonificación" {...p} long rows={2} />
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Proyecto, presupuesto y cronograma</h2></div>
        <Field k="units_total" text="Cantidad de unidades, habitaciones o plazas" {...p} />
        <Field k="unit_model" text="Cómo se fraccionaría (habitación, fracción, cochera…)" {...p} />
        <Field k="total_budget" text="Presupuesto total de obra y desarrollo" {...p} long rows={4} hint="Rubros y montos. Indicá la moneda." />
        <Field k="financing_structure" text="Cómo se financia el proyecto (aporte propio, crédito, participaciones)" {...p} long />
        <Field k="schedule" text="Cronograma de obra y habilitación" {...p} long />
        <Field k="permits" text="Permisos de obra y habilitaciones: estado" {...p} long rows={2} />
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Operación, renta y estructura</h2></div>
      <Field k="operator" text="Quién operaría el activo (gerenciadora, franquicia, propio)" {...p} long rows={2} />
      <Field k="operator_term" text="Plazo del contrato con el operador" {...p} />
      <Field k="revenue_model" text="Cómo se genera la renta" {...p} long hint="Ocupación y tarifas, alquileres, ventas de servicios." />
      <Field k="revenue_projection" text="Proyección de renta y sus supuestos" {...p} long hint="Es una estimación: indicá cómo la calculaste. No se publica como promesa." />
      <Field k="market_study" text="Estudio de mercado o antecedentes de la zona" {...p} long />
      <Field k="operating_costs" text="Costos operativos y comisiones previstas" {...p} long rows={2} />
      <Field k="insurance" text="Seguros previstos" {...p} long rows={2} />
      <Field k="trustee_info" text="Estructura o fiduciario previstos, si ya existen" {...p} long rows={2} />
      <Field k="exit_options" text="Salida o reventa prevista para los participantes" {...p} long rows={2} />
      <Field k="risks" text="Riesgos principales que identificás" {...p} long />
      <div>
        <label htmlFor="ds4-liens" className={label}>¿Hay hipotecas, embargos o cargas sobre el terreno o el proyecto? (declaración)</label>
        <select id="ds4-liens" className={field} value={form.has_liens ?? ""} onChange={(e) => setF("has_liens", e.target.value)}><option value="">Elegí una opción</option><option value="no">No</option><option value="si">Sí</option><option value="no_se">No lo sé todavía</option></select>
      </div>
      {form.has_liens === "si" && <div><label htmlFor="ds4-ld" className={label}>Detalle</label><textarea id="ds4-ld" rows={2} className={field} value={form.liens_detail ?? ""} onChange={(e) => setF("liens_detail", e.target.value)} /></div>}
      <div className="md:col-span-2">
        <label htmlFor="ds4-int" className={label}>Qué tipo de participación te interesa evaluar (no es una elección vinculante)</label>
        <select id="ds4-int" className={field} value={mod.interest_mode ?? ""} onChange={(e) => setMod({ ...mod, interest_mode: e.target.value })}><option value="">Elegí una opción</option>{Object.entries(DESARROLLO_INTEREST_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <Field k="structure_notes" text="Ideas o restricciones sobre la estructura" {...p} long />
    </div>
  );
};
