/** Versión vigente de la Política de Privacidad y de las Bases y Condiciones. Debe coincidir con LEGAL_VERSION de la Edge Function. */
export const TK_LEGAL_VERSION = "2026-10-16.2";

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
