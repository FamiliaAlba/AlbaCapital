import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { COUNTRIES, GRANDE_ASSET_KINDS, GRANDE_INTEREST_MODES, GRANDE_OPERATION_MODES, PROVINCES } from "@/data/tokenizate";
import { Field, field, label, type Pyme } from "./PymeForm";

const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/** Primer paso, corto, de la postulación de un campo o industria. */
export const GrandeStartForm = ({ onSubmit, loading, error }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean; error: string | null }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-2xl font-semibold text-[#0B2545]">Paso 1 · Tu campo o industria</h2>
    <p className="text-sm text-muted-foreground">Son pocos datos. La documentación y el detalle de contratos y renta se piden después, con borrador y clave personal.</p>
    <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>No completar<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div><label htmlFor="g-name" className={label}>Titular (nombre o razón social) *</label><input id="g-name" name="name" required minLength={2} maxLength={160} className={field} autoComplete="organization" /></div>
      <div><label htmlFor="g-contact" className={label}>Nombre de contacto *</label><input id="g-contact" name="contact_name" required maxLength={160} className={field} autoComplete="name" /></div>
      <div><label htmlFor="g-role" className={label}>Función del contacto</label><input id="g-role" name="contact_role" maxLength={120} className={field} /></div>
      <div><label htmlFor="g-email" className={label}>Correo electrónico *</label><input id="g-email" name="email" type="email" required className={field} autoComplete="email" /></div>
      <div><label htmlFor="g-phone" className={label}>WhatsApp *</label><input id="g-phone" name="phone" type="tel" required className={field} autoComplete="tel" /></div>
      <div><label htmlFor="g-country" className={label}>País *</label><select id="g-country" name="country" required defaultValue="Argentina" className={field}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="g-prov" className={label}>Provincia del activo *</label><select id="g-prov" name="province" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="g-loc" className={label}>Localidad o partido *</label><input id="g-loc" name="locality" required maxLength={120} className={field} /></div>
      <div><label htmlFor="g-kind" className={label}>Tipo de activo *</label><select id="g-kind" name="asset_kind" required defaultValue="" className={field}><option value="" disabled>Elegí una opción</option>{Object.entries(GRANDE_ASSET_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div><label htmlFor="g-asset" className={label}>Nombre del activo *</label><input id="g-asset" name="assetName" required maxLength={160} className={field} placeholder="Ej.: nombre del campo o de la planta" /></div>
      <div className="md:col-span-2"><label htmlFor="g-sum" className={label}>Resumen *</label><textarea id="g-sum" name="summary" required minLength={10} rows={4} maxLength={3000} className={field} placeholder="Qué es el activo, cómo genera ingresos y qué se busca" /></div>
      <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="g-amt" className={label}>Financiación buscada *</label><input id="g-amt" name="fundingAmount" inputMode="decimal" required className={field} /></div><div><label htmlFor="g-cur" className={label}>Moneda *</label><select id="g-cur" name="fundingCurrency" required defaultValue="" className={field}><option value="" disabled>—</option><option>ARS</option><option>USD</option></select></div></div>
      <div><label htmlFor="g-use" className={label}>Destino principal de los fondos *</label><input id="g-use" name="fundsUse" required maxLength={2000} className={field} /></div>
    </div>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto las <Link to="/tokenizate/bases-y-condiciones" target="_blank" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>, incluida la aclaración de que postular no obliga a Alba Capital ni garantiza financiación. *</span></label>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="privacy" className="mt-1 h-4 w-4 accent-[#0B2545]" /><span>Leí y acepto la <Link to="/tokenizate/privacidad" target="_blank" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>. *</span></label>
    {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <button type="submit" disabled={loading} className={btnPrimary}>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Crear expediente y continuar</button>
  </form>
);

interface SP { grande: Pyme; setGrande: (p: Pyme) => void; form: Record<string, string>; setF: (k: string, v: string) => void }

/** Pasos 1 a 4 de la postulación de un campo o industria. */
export const GrandeStep = ({ step, grande, setGrande, form, setF }: SP & { step: number }) => {
  const p = { pyme: grande, setPyme: setGrande };
  if (step === 1) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Datos iniciales</h2></div>
        <div><label htmlFor="gs1-name" className={label}>Titular *</label><input id="gs1-name" className={field} value={form.owner_name ?? ""} onChange={(e) => setF("owner_name", e.target.value)} /></div>
        <Field k="contact_name" text="Nombre de contacto *" {...p} withState={false} />
        <Field k="contact_role" text="Función del contacto" {...p} withState={false} />
        <div><label htmlFor="gs1-email" className={label}>Correo (el de la creación del expediente)</label><input id="gs1-email" className={field} value={form.owner_email ?? ""} disabled /></div>
        <div><label htmlFor="gs1-phone" className={label}>WhatsApp *</label><input id="gs1-phone" className={field} value={form.owner_phone ?? ""} onChange={(e) => setF("owner_phone", e.target.value)} /></div>
        <div><label htmlFor="gs1-prov" className={label}>Provincia *</label><select id="gs1-prov" className={field} value={form.owner_province ?? ""} onChange={(e) => setF("owner_province", e.target.value)}><option value="">Elegí una opción</option>{PROVINCES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <Field k="locality" text="Localidad o partido *" {...p} withState={false} />
        <div>
          <label htmlFor="gs1-kind" className={label}>Tipo de activo *</label>
          <select id="gs1-kind" className={field} value={grande.asset_kind ?? ""} onChange={(e) => setGrande({ ...grande, asset_kind: e.target.value })}><option value="">Elegí una opción</option>{Object.entries(GRANDE_ASSET_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </div>
        <div><label htmlFor="gs1-asset" className={label}>Nombre del activo *</label><input id="gs1-asset" className={field} value={form.project_name ?? ""} onChange={(e) => setF("project_name", e.target.value)} /></div>
        <div className="md:col-span-2"><label htmlFor="gs1-sum" className={label}>Resumen *</label><textarea id="gs1-sum" rows={4} className={field} value={form.summary ?? ""} onChange={(e) => setF("summary", e.target.value)} /></div>
        <div className="grid grid-cols-[1fr_7rem] gap-2"><div><label htmlFor="gs1-amt" className={label}>Financiación buscada *</label><input id="gs1-amt" inputMode="decimal" className={field} value={form.funding_amount ?? ""} onChange={(e) => setF("funding_amount", e.target.value)} /></div><div><label htmlFor="gs1-cur" className={label}>Moneda *</label><select id="gs1-cur" className={field} value={form.funding_currency ?? ""} onChange={(e) => setF("funding_currency", e.target.value)}><option value="">—</option><option>ARS</option><option>USD</option></select></div></div>
        <div><label htmlFor="gs1-use" className={label}>Destino principal de los fondos *</label><input id="gs1-use" className={field} value={form.funds_use ?? ""} onChange={(e) => setF("funds_use", e.target.value)} /></div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Activo, titularidad y operación</h2><p className="mt-1 text-sm text-muted-foreground">Todo es opcional por ahora: indicá “Todavía no lo tengo” o “Necesito orientación” donde corresponda.</p></div>
        <Field k="surface" text="Superficie o capacidad" {...p} placeholder="Hectáreas, m², toneladas por año…" />
        <Field k="owner_structure" text="Quiénes son los titulares (personas humanas o sociedad)" {...p} />
        <Field k="cuit" text="CUIT del titular" {...p} withState={false} hint="Se solicitará de todos modos en la etapa documental si avanza." />
        <Field k="cadastre" text="Datos registrales o catastrales (matrícula, nomenclatura)" {...p} />
        <Field k="title_status" text="Titularidad y situación registral" {...p} long rows={3} hint="Condominio, sucesión, usufructo, inhibiciones u otras situaciones que conozcas." />
        <div>
          <label htmlFor="gs2-op" className={label}>Cómo se explota hoy</label>
          <select id="gs2-op" className={field} value={grande.operation_mode ?? ""} onChange={(e) => setGrande({ ...grande, operation_mode: e.target.value })}><option value="">Elegí una opción</option>{Object.entries(GRANDE_OPERATION_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </div>
        <Field k="operator" text="Quién lo explota o arrienda" {...p} />
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Renta, contratos y valuación</h2></div>
        <Field k="lease_contracts" text="Contratos vigentes (partes, objeto, condiciones principales)" {...p} long />
        <Field k="lease_term" text="Plazo y vencimiento de los contratos" {...p} />
        <Field k="rent_basis" text="Cómo se fija la renta" {...p} placeholder="En dinero, en quintales por hectárea, otra forma…" />
        <Field k="rent_amount" text="Renta actual declarada" {...p} />
        <Field k="rent_history" text="Historial de ingresos de las últimas campañas o ejercicios" {...p} long />
        <Field k="income_risks" text="De qué depende la renta y qué puede afectarla" {...p} long hint="Precio de la producción, clima, mercado, incumplimiento del arrendatario." />
        <Field k="valuation" text="Tasación o valuación disponible" {...p} long rows={2} />
        <Field k="taxes_costs" text="Impuestos, tasas y costos asociados al activo" {...p} long rows={2} />
        <Field k="insurance" text="Seguros vigentes" {...p} long rows={2} />
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><h2 className="text-xl font-semibold text-[#0B2545]">Cargas y estructura buscada</h2></div>
      <div>
        <label htmlFor="gs4-liens" className={label}>¿Hay deudas, hipotecas, embargos u otras cargas sobre el activo? (declaración)</label>
        <select id="gs4-liens" className={field} value={form.has_liens ?? ""} onChange={(e) => setF("has_liens", e.target.value)}><option value="">Elegí una opción</option><option value="no">No</option><option value="si">Sí</option><option value="no_se">No lo sé todavía</option></select>
      </div>
      {form.has_liens === "si" && <div><label htmlFor="gs4-ld" className={label}>Detalle</label><textarea id="gs4-ld" rows={2} className={field} value={form.liens_detail ?? ""} onChange={(e) => setF("liens_detail", e.target.value)} /></div>}
      <Field k="capex_plan" text="Inversiones o mejoras previstas con los fondos" {...p} long />
      <Field k="objective" text="Qué buscás lograr" {...p} long rows={2} placeholder="Financiar mejoras, liquidez, incorporar socios, otro objetivo" />
      <div className="md:col-span-2">
        <label htmlFor="gs4-int" className={label}>Qué tipo de participación te interesa evaluar (no es una elección vinculante)</label>
        <select id="gs4-int" className={field} value={grande.interest_mode ?? ""} onChange={(e) => setGrande({ ...grande, interest_mode: e.target.value })}><option value="">Elegí una opción</option>{Object.entries(GRANDE_INTEREST_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <Field k="structure_notes" text="Ideas o restricciones sobre la estructura" {...p} long hint="Por ejemplo: que el titular conserve el activo, plazos, derechos que se quieren o no se quieren ceder." />
    </div>
  );
};
