import { TK_LEGAL_VERSION_CURRENT } from "@/lib/tokenizate/backend";

/** Versión vigente de la Política de Privacidad y de las Bases y Condiciones. Debe coincidir con LEGAL_VERSION de la Edge Function. */
export const TK_LEGAL_VERSION = TK_LEGAL_VERSION_CURRENT;

export const COUNTRIES = ["Argentina", "Uruguay", "Chile", "Paraguay", "Brasil", "Bolivia", "México", "España", "Estados Unidos", "Otro país"];

export const INTEREST_ASSET_TYPES = [
  "Maquinaria y equipamiento",
  "Infraestructura productiva y logística",
  "Proyectos turísticos y hoteleros",
  "Bienes raíces residenciales",
  "Otros activos sujetos a evaluación",
  "Todavía no lo sé",
];

export const CAPITAL_RANGES = ["Hasta USD 1.000", "USD 1.000 a 5.000", "USD 5.000 a 25.000", "Más de USD 25.000", "Prefiero no indicarlo"];

export const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán", "Otra / fuera de Argentina",
];

export const RELATIONS: Record<string, string> = {
  propietario: "Soy propietario/a del activo",
  representante: "Soy representante (con autorización)",
  empresa_titular: "Soy una empresa titular",
};

export const CATEGORIES: Record<string, string> = {
  inmueble_residencial: "Inmueble residencial",
  hotel_turistico: "Hotel o proyecto turístico",
  maquinaria: "Maquinaria y equipamiento",
  infraestructura_productiva: "Infraestructura productiva o logística",
  proyecto_productivo: "Proyecto productivo",
  lote_pyme: "Lote o producción PyME",
  otro: "Otro activo",
};

export const PROJECT_STATES: Record<string, string> = {
  operativo: "Operativo",
  ampliacion: "En ampliación",
  desarrollo: "En desarrollo",
  otro: "Otro",
};

export const DOC_CATEGORIES: Record<string, string> = {
  titularidad: "Titularidad y representación",
  tecnica: "Información técnica",
  valuacion: "Valuación",
  ingresos_costos: "Ingresos y costos",
  plan_negocios: "Plan de negocios y proyecciones",
  contratos: "Contratos",
  permisos_seguros: "Permisos y seguros",
  fotografias: "Fotografías",
  otros: "Otros antecedentes",
};

/** Checklist orientativo por categoría. `initial` = documentación inicial; el resto es complementaria. Nada es obligatorio para iniciar. */
export const CHECKLISTS: Record<string, { cat: string; text: string; initial: boolean }[]> = {
  inmueble_residencial: [
    { cat: "titularidad", text: "Título de propiedad", initial: true },
    { cat: "tecnica", text: "Informes disponibles y planos", initial: false },
    { cat: "contratos", text: "Contratos de alquiler vigentes", initial: false },
    { cat: "permisos_seguros", text: "Habilitaciones y seguros", initial: false },
    { cat: "tecnica", text: "Antecedentes técnicos", initial: false },
    { cat: "fotografias", text: "Fotografías actuales", initial: true },
  ],
  hotel_turistico: [
    { cat: "titularidad", text: "Título de propiedad o derecho de explotación", initial: true },
    { cat: "permisos_seguros", text: "Habilitaciones y seguros", initial: false },
    { cat: "ingresos_costos", text: "Ingresos y costos históricos", initial: false },
    { cat: "plan_negocios", text: "Plan de negocios y proyecciones", initial: false },
    { cat: "fotografias", text: "Fotografías actuales", initial: true },
  ],
  maquinaria: [
    { cat: "titularidad", text: "Facturas de compra", initial: true },
    { cat: "tecnica", text: "Identificación y números de serie", initial: true },
    { cat: "tecnica", text: "Registros de mantenimiento", initial: false },
    { cat: "permisos_seguros", text: "Seguros", initial: false },
    { cat: "contratos", text: "Contratos de explotación o alquiler", initial: false },
    { cat: "valuacion", text: "Antecedentes de valuación", initial: false },
    { cat: "fotografias", text: "Fotografías del equipo", initial: true },
  ],
  infraestructura_productiva: [
    { cat: "titularidad", text: "Título o derecho sobre el predio", initial: true },
    { cat: "tecnica", text: "Planos y antecedentes técnicos", initial: false },
    { cat: "permisos_seguros", text: "Habilitaciones y seguros", initial: false },
    { cat: "ingresos_costos", text: "Ingresos y costos históricos", initial: false },
    { cat: "fotografias", text: "Fotografías actuales", initial: true },
  ],
  proyecto_productivo: [
    { cat: "plan_negocios", text: "Plan de negocios", initial: true },
    { cat: "plan_negocios", text: "Uso de fondos y cronograma", initial: true },
    { cat: "ingresos_costos", text: "Presupuestos", initial: false },
    { cat: "ingresos_costos", text: "Ingresos históricos y proyecciones", initial: false },
    { cat: "titularidad", text: "Documentación de titularidad", initial: false },
  ],
  otro: [
    { cat: "titularidad", text: "Documentación de titularidad", initial: true },
    { cat: "tecnica", text: "Información técnica", initial: false },
    { cat: "ingresos_costos", text: "Ingresos y costos", initial: false },
    { cat: "fotografias", text: "Fotografías", initial: true },
  ],
};

export const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  recibido: "Recibido",
  revision_preliminar: "Revisión preliminar",
  documentacion_pendiente: "Documentación pendiente",
  analisis_tecnico_financiero: "Análisis técnico y financiero",
  analisis_juridico: "Análisis jurídico",
  viable_con_condiciones: "Viable con condiciones",
  propuesta_estructuracion: "Propuesta de estructuración",
  no_elegible: "No elegible",
  cerrado: "Cerrado",
};

export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png"];

export const EVAL_FIELDS: { key: string; label: string }[] = [
  { key: "titularidad", label: "Titularidad" },
  { key: "estado_tecnico", label: "Estado técnico" },
  { key: "operador", label: "Operador" },
  { key: "ingresos_verificables", label: "Ingresos verificables" },
  { key: "proyecciones_supuestos", label: "Proyecciones y supuestos" },
  { key: "escenarios", label: "Escenarios" },
  { key: "capacidad_pago", label: "Capacidad de pago" },
  { key: "garantias", label: "Garantías" },
  { key: "costos_estructuracion", label: "Costos de estructuración" },
  { key: "estructura_propuesta", label: "Estructura propuesta" },
  { key: "alternativas_financiacion", label: "Alternativas de financiación" },
  { key: "conclusiones", label: "Conclusiones del equipo" },
];

/** En Producción PyME algunos estados existentes se rotulan distinto (mismos valores en la base). */
export const PYME_STATUS_LABEL: Record<string, string> = {
  ...STATUS_LABEL,
  recibido: "Recibida",
  analisis_tecnico_financiero: "Análisis técnico y económico",
  no_elegible: "No viable",
  cerrado: "Archivada",
};
export const statusLabel = (status: string, modality?: string): string =>
  (modality === "produccion_pyme" ? PYME_STATUS_LABEL : STATUS_LABEL)[status] ?? status;

export const PYME_DOC_CATEGORIES: Record<string, string> = {
  identidad_empresarial: "Identidad empresarial y representación",
  presupuesto_cotizaciones: "Presupuesto y cotizaciones",
  tecnica_producto: "Información técnica del producto",
  habilitaciones: "Habilitaciones aplicables",
  capacidad_produccion: "Capacidad de producción o contrato a fasón",
  antecedentes_ventas: "Antecedentes de ventas",
  pedidos_ordenes: "Pedidos u órdenes de compra",
  cronograma_flujo: "Cronograma y flujo de fondos",
  fotografias: "Fotografías",
  seguros_respaldos: "Seguros y otros respaldos",
};
/** Nombre legible de cualquier categoría de documento, de cualquier modalidad. */
export const ALL_DOC_CATEGORIES: Record<string, string> = { ...DOC_CATEGORIES, ...PYME_DOC_CATEGORIES };

export const PYME_CHECKLIST: { cat: string; text: string; initial: boolean; mode?: "propia" | "tercerizada" | "mixta" }[] = [
  { cat: "identidad_empresarial", text: "Constancia de CUIT y datos de la empresa", initial: true },
  { cat: "identidad_empresarial", text: "Autorización, si presenta un representante", initial: false },
  { cat: "presupuesto_cotizaciones", text: "Presupuesto del lote y cotizaciones de proveedores", initial: true },
  { cat: "tecnica_producto", text: "Ficha técnica del producto", initial: false },
  { cat: "habilitaciones", text: "Habilitaciones y registros aplicables al producto", initial: false },
  { cat: "capacidad_produccion", text: "Capacidad de producción (instalaciones, equipos, personal)", initial: false, mode: "propia" },
  { cat: "capacidad_produccion", text: "Contrato o acuerdo con el fabricante a fasón", initial: false, mode: "tercerizada" },
  { cat: "antecedentes_ventas", text: "Antecedentes de ventas (facturación o listados)", initial: false },
  { cat: "pedidos_ordenes", text: "Pedidos u órdenes de compra, si existen", initial: false },
  { cat: "cronograma_flujo", text: "Cronograma de producción y flujo de fondos", initial: false },
  { cat: "fotografias", text: "Fotografías del producto o del proceso", initial: true },
  { cat: "seguros_respaldos", text: "Seguros y otros respaldos", initial: false },
];

export const PYME_PRODUCTION_MODES: Record<string, string> = { propia: "Producción propia", tercerizada: "Producción tercerizada o a fasón", mixta: "Mixta" };
export const PYME_INTEREST_MODES: Record<string, string> = {
  entrega_producto: "Producción con entrega de producto",
  participacion_economica: "Participación económica en el proyecto productivo",
  asesoramiento: "Necesito asesoramiento para definirla",
};
export const PYME_EVAL_FIELDS: { key: string; label: string }[] = [
  { key: "p_productor", label: "Identificación y capacidad del productor" },
  { key: "p_demanda", label: "Evidencia de demanda" },
  { key: "p_costos", label: "Costos y márgenes" },
  { key: "p_ciclo", label: "Duración del ciclo y necesidad de capital" },
  { key: "p_costos_estructura", label: "Costos legales, tecnológicos y administrativos" },
  { key: "p_logistica", label: "Logística, seguros e impuestos" },
  { key: "p_riesgo", label: "Riesgo de incumplimiento y venta parcial" },
  { key: "p_reutilizacion", label: "Posibilidad de reutilizar la estructura en futuros lotes" },
  { key: "p_recomendacion", label: "Recomendación sobre el esquema (repetible por productor, preventa o postergar)" },
  { key: "p_escenario_conservador", label: "Escenario conservador (con supuestos explícitos)" },
  { key: "p_escenario_base", label: "Escenario base (con supuestos explícitos)" },
  { key: "p_escenario_favorable", label: "Escenario favorable (con supuestos explícitos)" },
];
