/**
 * Datos FICTICIOS de las demostraciones (se muestran rotulados «Demostración»).
 * No contienen clientes, personas ni cifras reales.
 */

export type CrmStage = "nuevas" | "contactadas" | "visita" | "propuesta";

export const CRM_STAGES: { key: CrmStage; label: string }[] = [
  { key: "nuevas", label: "Nuevas" },
  { key: "contactadas", label: "Contactadas" },
  { key: "visita", label: "Visita agendada" },
  { key: "propuesta", label: "Propuesta" },
];

export interface CrmLead {
  id: string;
  title: string;
  origin: "Web" | "Redes" | "Recomendación" | "Teléfono";
  owner: string;
  stage: CrmStage;
  agenda: string;
  next: string;
}

export const CRM_LEADS: CrmLead[] = [
  { id: "c1", title: "Consulta por el lote 12", origin: "Web", owner: "Equipo comercial A", stage: "nuevas", agenda: "Sin agendar", next: "Responder hoy antes de las 17:00" },
  { id: "c2", title: "Consulta por dos lotes", origin: "Redes", owner: "Equipo comercial B", stage: "nuevas", agenda: "Sin agendar", next: "Enviar el plano y la ficha" },
  { id: "c3", title: "Quiere conocer el club house", origin: "Recomendación", owner: "Equipo comercial A", stage: "contactadas", agenda: "Sin agendar", next: "Proponer dos horarios de visita" },
  { id: "c4", title: "Pregunta por formas de pago", origin: "Teléfono", owner: "Equipo comercial B", stage: "contactadas", agenda: "Sin agendar", next: "Llamar mañana a la mañana" },
  { id: "c5", title: "Visita al lote 7", origin: "Web", owner: "Equipo comercial A", stage: "visita", agenda: "Sábado 11:00", next: "Confirmar asistencia el viernes" },
  { id: "c6", title: "Segunda visita", origin: "Recomendación", owner: "Equipo comercial B", stage: "propuesta", agenda: "Realizada", next: "Enviar propuesta por escrito" },
];

export type ErpModule = "compras" | "ventas" | "stock" | "administracion";

export const ERP_MODULES: { key: ErpModule; label: string }[] = [
  { key: "compras", label: "Compras" },
  { key: "ventas", label: "Ventas" },
  { key: "stock", label: "Stock" },
  { key: "administracion", label: "Administración" },
];

export interface ErpView {
  kpis: { label: string; value: string }[];
  headers: string[];
  rows: { cells: string[]; status?: { text: string; tone: "ok" | "warn" | "danger" }; bar?: number }[];
  note: string;
}

export const ERP_VIEWS: Record<ErpModule, ErpView> = {
  compras: {
    kpis: [{ label: "Pedidos abiertos", value: "6" }, { label: "A recibir esta semana", value: "3" }, { label: "Proveedores activos", value: "14" }],
    headers: ["Pedido", "Proveedor", "Detalle", "Estado"],
    rows: [
      { cells: ["P-0041", "Proveedor A", "Insumos de obra"], status: { text: "En camino", tone: "ok" } },
      { cells: ["P-0042", "Proveedor B", "Herramientas"], status: { text: "Pendiente de aprobación", tone: "warn" } },
      { cells: ["P-0043", "Proveedor C", "Materiales eléctricos"], status: { text: "Recibido parcial", tone: "warn" } },
    ],
    note: "Cada pedido pasa por aprobación y queda asociado a su recepción y a su pago.",
  },
  ventas: {
    kpis: [{ label: "Presupuestos abiertos", value: "9" }, { label: "Pedidos a entregar", value: "4" }, { label: "Cobros pendientes", value: "5" }],
    headers: ["Documento", "Cliente", "Detalle", "Estado"],
    rows: [
      { cells: ["V-0112", "Cliente A", "Presupuesto de servicio"], status: { text: "Enviado", tone: "ok" } },
      { cells: ["V-0113", "Cliente B", "Pedido de productos"], status: { text: "A entregar", tone: "warn" } },
      { cells: ["V-0114", "Cliente C", "Factura emitida"], status: { text: "Cobro vencido", tone: "danger" } },
    ],
    note: "Del presupuesto a la entrega y al cobro, con el estado de cada paso a la vista.",
  },
  stock: {
    kpis: [{ label: "Artículos", value: "128" }, { label: "Bajo mínimo", value: "5" }, { label: "Depósitos", value: "2" }],
    headers: ["Artículo", "Depósito", "Nivel", "Estado"],
    rows: [
      { cells: ["Artículo 001", "Central"], bar: 82, status: { text: "Normal", tone: "ok" } },
      { cells: ["Artículo 014", "Central"], bar: 34, status: { text: "Reponer pronto", tone: "warn" } },
      { cells: ["Artículo 027", "Obra"], bar: 9, status: { text: "Bajo el mínimo", tone: "danger" } },
    ],
    note: "Alertas de stock mínimo y movimientos entre depósitos.",
  },
  administracion: {
    kpis: [{ label: "Pagos de la semana", value: "7" }, { label: "Cobros de la semana", value: "11" }, { label: "Documentos a conciliar", value: "3" }],
    headers: ["Concepto", "Responsable", "Vence", "Estado"],
    rows: [
      { cells: ["Pago a proveedor", "Administración", "Jueves"], status: { text: "Programado", tone: "ok" } },
      { cells: ["Cobro de cliente", "Administración", "Viernes"], status: { text: "Pendiente", tone: "warn" } },
      { cells: ["Conciliación bancaria", "Administración", "Lunes"], status: { text: "Por revisar", tone: "warn" } },
    ],
    note: "Pagos, cobros y conciliaciones con responsables y vencimientos.",
  },
};

export const PWA_TASKS = [
  { id: "t1", label: "Foto del avance de la losa", done: true },
  { id: "t2", label: "Control de materiales recibidos", done: false },
  { id: "t3", label: "Inspección de seguridad", done: false },
  { id: "t4", label: "Parte diario del equipo", done: false },
];
