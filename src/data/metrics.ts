export interface Metric {
  label: string;
  value: string;
  detail: string;
}

export const heroMetrics: Metric[] = [
  { label: "TIR PROMEDIO", value: "24%", detail: "Anual en USD" },
  { label: "CAPITAL COLOCADO", value: "USD 42M", detail: "Últimos 5 años" },
  { label: "PROYECTOS EJECUTADOS", value: "37", detail: "Con salida exitosa" },
  { label: "INVERSORES ACTIVOS", value: "180+", detail: "Red privada" },
];
