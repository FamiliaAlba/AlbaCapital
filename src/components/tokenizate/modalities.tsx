import type { ComponentType, ReactNode } from "react";
import {
  DESARROLLO_CHECKLIST, DESARROLLO_DOC_CATEGORIES, DESARROLLO_INTEREST_MODES, DESARROLLO_KINDS,
  GRANDE_ASSET_KINDS, GRANDE_CHECKLIST, GRANDE_DOC_CATEGORIES, GRANDE_INTEREST_MODES, GRANDE_OPERATION_MODES,
  PYME_CHECKLIST, PYME_DOC_CATEGORIES, PYME_INTEREST_MODES, PYME_PRODUCTION_MODES,
} from "@/data/tokenizate";
import { PymeStartForm, PymeStep, type Pyme } from "./PymeForm";
import { GrandeStartForm, GrandeStep } from "./GrandeForm";
import { DesarrolloStartForm, DesarrolloStep } from "./DesarrolloForm";

type StepProps = { mod: Pyme; setMod: (p: Pyme) => void; form: Record<string, string>; setF: (k: string, v: string) => void };

/** Todo lo que cambia entre modalidades de postulación con campos propios; el flujo y el servidor son los mismos. */
export interface ModCfg {
  key: string;
  col: string; // columna jsonb en tk_applications
  label: string;
  stepNames: string[];
  docCats: Record<string, string>;
  defaultDocCat: string;
  checklist: (mod: Pyme) => { cat: string; text: string; initial: boolean }[];
  StartForm: ComponentType<{ onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; loading: boolean; error: string | null }>;
  startPayload: (f: FormData) => Record<string, unknown>;
  renderStep: (step: number, p: StepProps) => ReactNode;
  review: (form: Record<string, string>, mod: Pyme, docs: number) => [string, string, number][];
  subject: { veracity: string; noGuarantee: string };
}

const owner = (f: FormData, relation: string) => ({ name: f.get("name"), email: f.get("email"), phone: f.get("phone"), country: f.get("country"), province: f.get("province"), relation });
const common = (f: FormData) => ({ summary: f.get("summary"), fundingAmount: f.get("fundingAmount"), fundingCurrency: f.get("fundingCurrency"), fundsUse: f.get("fundsUse") });
const money = (form: Record<string, string>) => (form.funding_amount ? `${form.funding_amount} ${form.funding_currency}` : "—");

export const MOD_CONFIG: Record<string, ModCfg> = {
  produccion_pyme: {
    key: "produccion_pyme", col: "pyme", label: "Producción PyME",
    stepNames: ["Datos iniciales", "Empresa", "Lote y presupuesto", "Comercialización", "Documentación", "Revisión y envío"],
    docCats: PYME_DOC_CATEGORIES, defaultDocCat: "identidad_empresarial",
    checklist: (m) => PYME_CHECKLIST.filter((c) => !c.mode || !m.production_mode || m.production_mode === "mixta" || c.mode === m.production_mode),
    StartForm: PymeStartForm,
    startPayload: (f) => ({
      modality: "produccion_pyme", owner: owner(f, "empresa_titular"),
      pyme: { contact_name: f.get("contact_name"), contact_role: f.get("contact_role"), locality: f.get("locality") }, product: f.get("product"), ...common(f),
    }),
    renderStep: (step, { mod, setMod, form, setF }) => <PymeStep step={step} pyme={mod} setPyme={setMod} form={form} setF={setF} />,
    review: (form, m, docs) => [
      ["Empresa", `${form.owner_name} · ${m.contact_name ?? "—"}`, 1], ["Contacto", `${form.owner_email} · ${form.owner_phone || "—"}`, 1],
      ["Producto", form.project_name || "—", 1], ["Ubicación", `${m.locality ?? "—"}, ${form.owner_province || "—"}`, 1],
      ["Financiación buscada", money(form), 1], ["Destino de fondos", form.funds_use || "—", 1],
      ["Forma de producción", PYME_PRODUCTION_MODES[m.production_mode] ?? "Sin indicar", 2], ["Lote", `${m.lot_id ?? "—"} · ${m.lot_volume ?? ""} ${m.lot_unit ?? ""}`, 3],
      ["Modalidad de interés", PYME_INTEREST_MODES[m.interest_mode] ?? "Sin indicar", 4], ["Documentos cargados", String(docs), 5],
    ],
    subject: { veracity: "esta producción", noGuarantee: "la producción" },
  },
  campos_industrias: {
    key: "campos_industrias", col: "grande", label: "Campos e industrias",
    stepNames: ["Datos iniciales", "Activo y titularidad", "Renta y contratos", "Cargas y estructura", "Documentación", "Revisión y envío"],
    docCats: GRANDE_DOC_CATEGORIES, defaultDocCat: "titularidad",
    checklist: () => GRANDE_CHECKLIST,
    StartForm: GrandeStartForm,
    startPayload: (f) => ({
      modality: "campos_industrias", owner: owner(f, "propietario"),
      grande: { contact_name: f.get("contact_name"), contact_role: f.get("contact_role"), locality: f.get("locality"), asset_kind: f.get("asset_kind") }, assetName: f.get("assetName"), ...common(f),
    }),
    renderStep: (step, { mod, setMod, form, setF }) => <GrandeStep step={step} grande={mod} setGrande={setMod} form={form} setF={setF} />,
    review: (form, m, docs) => [
      ["Titular", `${form.owner_name} · ${m.contact_name ?? "—"}`, 1], ["Contacto", `${form.owner_email} · ${form.owner_phone || "—"}`, 1],
      ["Activo", `${form.project_name || "—"} (${GRANDE_ASSET_KINDS[m.asset_kind] ?? "—"})`, 1], ["Ubicación", `${m.locality ?? "—"}, ${form.owner_province || "—"}`, 1],
      ["Financiación buscada", money(form), 1], ["Destino de fondos", form.funds_use || "—", 1],
      ["Cómo se explota hoy", GRANDE_OPERATION_MODES[m.operation_mode] ?? "Sin indicar", 2], ["Renta declarada", m.rent_amount ?? "—", 3],
      ["Participación a evaluar", GRANDE_INTEREST_MODES[m.interest_mode] ?? "Sin indicar", 4], ["Documentos cargados", String(docs), 5],
    ],
    subject: { veracity: "este activo", noGuarantee: "el activo" },
  },
  desarrollos_fraccionados: {
    key: "desarrollos_fraccionados", col: "desarrollo", label: "Desarrollos fraccionados",
    stepNames: ["Datos iniciales", "Desarrollador y terreno", "Proyecto y obra", "Operación y renta", "Documentación", "Revisión y envío"],
    docCats: DESARROLLO_DOC_CATEGORIES, defaultDocCat: "titularidad",
    checklist: () => DESARROLLO_CHECKLIST,
    StartForm: DesarrolloStartForm,
    startPayload: (f) => ({
      modality: "desarrollos_fraccionados", owner: owner(f, "empresa_titular"),
      desarrollo: { contact_name: f.get("contact_name"), contact_role: f.get("contact_role"), locality: f.get("locality"), project_kind: f.get("project_kind") }, projectName: f.get("projectName"), ...common(f),
    }),
    renderStep: (step, { mod, setMod, form, setF }) => <DesarrolloStep step={step} mod={mod} setMod={setMod} form={form} setF={setF} />,
    review: (form, m, docs) => [
      ["Desarrollador", `${form.owner_name} · ${m.contact_name ?? "—"}`, 1], ["Contacto", `${form.owner_email} · ${form.owner_phone || "—"}`, 1],
      ["Proyecto", `${form.project_name || "—"} (${DESARROLLO_KINDS[m.project_kind] ?? "—"})`, 1], ["Ubicación", `${m.locality ?? "—"}, ${form.owner_province || "—"}`, 1],
      ["Monto a financiar", money(form), 1], ["Destino de fondos", form.funds_use || "—", 1],
      ["Unidades", m.units_total ?? "—", 3], ["Operador previsto", m.operator ?? "—", 4],
      ["Participación a evaluar", DESARROLLO_INTEREST_MODES[m.interest_mode] ?? "Sin indicar", 4], ["Documentos cargados", String(docs), 5],
    ],
    subject: { veracity: "este desarrollo", noGuarantee: "el desarrollo" },
  },
};
