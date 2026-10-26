import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { DocPanel, type DocRow, type QueueItem } from "./DocPanel";
import type { ModCfg } from "./modalities";
import type { Pyme } from "./PymeForm";

const field = "mt-1.5 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-base text-foreground placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";
const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-5 py-3 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

export interface Decl { veracity: boolean; data_processing: boolean; no_guarantee: boolean; marketing: boolean }
type DocProps = React.ComponentProps<typeof DocPanel>;

interface Props {
  cfg: ModCfg;
  expediente: string;
  form: Record<string, string>;
  setF: (k: string, v: string) => void;
  mod: Pyme;
  setMod: (p: Pyme) => void;
  documents: DocRow[];
  data: Record<string, string | boolean>;
  setData: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>>;
  docProps: Omit<DocPanelPropsRest, "categories">;
  decl: Decl;
  setDecl: (d: Decl) => void;
  step: number;
  go: (n: number) => void;
  save: () => void;
  saving: "idle" | "saving" | "saved" | "error";
  error: string | null;
  submitting: boolean;
  submit: () => void;
  exit: () => void;
  missing: string[];
}
type DocPanelPropsRest = Omit<DocProps, never> & { queue: QueueItem[] };

/** Borrador de 6 etapas común a las modalidades con campos propios. */
const ModalDraft = ({ cfg, expediente, form, setF, mod, setMod, documents, data, setData, docProps, decl, setDecl, step, go, save, saving, error, submitting, submit, exit, missing }: Props) => {
  const items = cfg.checklist(mod);
  const last = cfg.stepNames.length;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">Expediente <span className="font-mono text-[#0B2545]">{expediente}</span> · {cfg.label} · Borrador</p>
        <p role="status" className="text-muted-foreground">{saving === "saving" ? "Guardando…" : saving === "saved" ? "Borrador guardado" : saving === "error" ? "No se pudo guardar" : ""}</p>
      </div>
      <ol className="grid grid-cols-3 gap-2 md:grid-cols-6" aria-label="Etapas">
        {cfg.stepNames.map((t, i) => (
          <li key={t}><button type="button" onClick={() => go(i + 1)} aria-current={step === i + 1 ? "step" : undefined} className={`w-full rounded-lg border px-2 py-2 text-left text-xs font-semibold ${step === i + 1 ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-border bg-white text-[#0B2545]"}`}>{i + 1}. {t}</button></li>
        ))}
      </ol>
      <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
        {step <= 4 && cfg.renderStep(step, { mod, setMod, form, setF })}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold text-[#0B2545]">Documentación privada</h2>
            <p className="mt-2 text-sm text-muted-foreground">No necesitás tener todo para enviar la postulación. Subí lo que tengas y marcá lo que todavía no tenés. La documentación no se publica.</p>
            <ul className="mt-5 space-y-3">
              {items.map((c, i) => {
                const k = String.fromCharCode(97 + i);
                const has = documents.some((d) => d.category === c.cat);
                return (
                  <li key={c.text} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span><strong>{c.text}</strong> <span className="text-muted-foreground">· {c.initial ? "inicial" : "complementaria"} · {cfg.docCats[c.cat]}</span></span>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4 accent-[#0B2545]" checked={data[`nodoc_${k}`] === true} onChange={(e) => setData((d) => ({ ...d, [`nodoc_${k}`]: e.target.checked }))} /> Todavía no lo tengo</label>
                    </div>
                    {has && <p className="mt-1 text-xs text-green-800">Hay archivos cargados en esta categoría.</p>}
                    {data[`nodoc_${k}`] === true && <input aria-label={`Explicá tu situación: ${c.text}`} placeholder="Contanos brevemente tu situación" className={`${field} mt-2`} value={String(data[`why_${k}`] ?? "")} onChange={(e) => setData((d) => ({ ...d, [`why_${k}`]: e.target.value }))} />}
                  </li>
                );
              })}
            </ul>
            <DocPanel categories={cfg.docCats} {...docProps} />
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="text-xl font-semibold text-[#0B2545]">Revisión y envío</h2>
            <dl className="mt-4 divide-y divide-border rounded-lg border border-border text-sm">
              {cfg.review(form, mod, documents.length).map(([k, v, st]) => (
                <div key={k} className="flex items-start justify-between gap-3 p-3"><div><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-foreground">{v}</dd></div><button type="button" onClick={() => go(st)} className="text-xs font-semibold text-[#0B2545] underline">Editar</button></div>
              ))}
            </dl>
            {missing.length > 0 && <p role="alert" className="mt-4 rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm text-amber-950">Faltan datos obligatorios en la etapa 1 para poder enviar.</p>}
            <fieldset className="mt-6 space-y-3 text-sm">
              <legend className="font-semibold text-[#0B2545]">Declaraciones obligatorias</legend>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.veracity} onChange={(e) => setDecl({ ...decl, veracity: e.target.checked })} /> Declaro que la información es veraz y que cuento con facultades para presentar {cfg.subject.veracity} en nombre de su titular.</label>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.data_processing} onChange={(e) => setDecl({ ...decl, data_processing: e.target.checked })} /> Acepto el tratamiento de mis datos para evaluar la solicitud, según la <Link to="/tokenizate/privacidad" target="_blank" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>.</label>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.no_guarantee} onChange={(e) => setDecl({ ...decl, no_guarantee: e.target.checked })} /> Reconozco que presentar {cfg.subject.noGuarantee} no garantiza aprobación, financiación ni emisión de tokens, y que Alba Capital no está obligada a estructurarlo ni ofrecerlo (ver <Link to="/tokenizate/bases-y-condiciones" target="_blank" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>).</label>
            </fieldset>
            <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#0B2545]" checked={decl.marketing} onChange={(e) => setDecl({ ...decl, marketing: e.target.checked })} /> Quiero recibir comunicaciones comerciales de Alba Capital (opcional).</label>
          </div>
        )}
        {error && <p role="alert" className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            {step > 1 && <button type="button" className={btnSecondary} onClick={() => go(step - 1)}>Atrás</button>}
            <button type="button" className={btnSecondary} onClick={() => save()}>Guardar borrador</button>
          </div>
          {step < last ? (
            <button type="button" className={btnPrimary} onClick={() => go(step + 1)}>{step === 5 ? "Revisar" : "Continuar"}</button>
          ) : (
            <button type="button" className={btnPrimary} disabled={submitting || missing.length > 0 || !decl.veracity || !decl.data_processing || !decl.no_guarantee} onClick={submit}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Enviar postulación
            </button>
          )}
        </div>
      </div>
      <button type="button" className="text-sm font-medium text-[#0B2545] underline" onClick={exit}>Salir (mi borrador queda guardado; vuelvo con mi clave)</button>
    </div>
  );
};

export default ModalDraft;
