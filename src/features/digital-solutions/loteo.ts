/**
 * Loteo HIPOTÉTICO y original usado en el masterplan interactivo y en el caso integrado.
 * No representa ningún proyecto real. Coordenadas en un lienzo de 800 × 520.
 */

export type LotState = "disponible" | "reservado" | "vendido";
export type SectorId = "A" | "B" | "C";
export type View = "general" | SectorId;

export interface Lot {
  id: number;
  sector: SectorId;
  x: number;
  y: number;
  w: number;
  h: number;
  state: LotState;
  note: string;
}

export const CANVAS = { w: 800, h: 520 };
const LOT_W = 52;
const LOT_H = 48;
const STEP = 58;

// Estados ilustrativos (24 lotes).
const STATES: LotState[] = [
  "disponible", "disponible", "reservado", "vendido", "disponible", "disponible", "vendido", "disponible",
  "reservado", "disponible", "disponible", "vendido", "disponible", "reservado", "disponible", "disponible",
  "vendido", "disponible", "disponible", "reservado", "disponible", "vendido", "disponible", "disponible",
];

function note(sector: SectorId, row: "arriba" | "abajo" | "acceso", i: number): string {
  if (row === "acceso") return i === 0 ? "Esquina cercana al acceso" : "Cerca del acceso al loteo";
  if (row === "arriba") return i === 0 ? "Esquina sobre la avenida principal, cerca del club house" : "Frente a calle interna";
  return i === 0 ? "Esquina sobre la avenida principal, frente al parque lineal" : "Frente al parque lineal";
}

function build(): Lot[] {
  const lots: Lot[] = [];
  let id = 1;
  const add = (sector: SectorId, x: number, y: number, row: "arriba" | "abajo" | "acceso", i: number) => {
    lots.push({ id, sector, x, y, w: LOT_W, h: LOT_H, state: STATES[id - 1], note: note(sector, row, i) });
    id++;
  };
  // Sector A (izquierda de la avenida): 1-4 arriba, 5-8 abajo
  for (let i = 0; i < 4; i++) add("A", 333 - STEP * i, 190, "arriba", i);
  for (let i = 0; i < 4; i++) add("A", 333 - STEP * i, 262, "abajo", i);
  // Sector B (derecha): 9-12 arriba, 13-16 abajo
  for (let i = 0; i < 4; i++) add("B", 409 + STEP * i, 190, "arriba", i);
  for (let i = 0; i < 4; i++) add("B", 409 + STEP * i, 262, "abajo", i);
  // Sector C (cerca del acceso): 17-20 a la izquierda, 21-24 a la derecha
  for (let i = 0; i < 4; i++) add("C", 333 - STEP * i, 392, "acceso", i);
  for (let i = 0; i < 4; i++) add("C", 409 + STEP * i, 392, "acceso", i);
  return lots;
}

export const LOTS: Lot[] = build();

export const SECTORS: { id: SectorId; label: string; blurb: string; hit: [number, number, number, number]; viewBox: string }[] = [
  { id: "A", label: "Sector A", blurb: "Ocho lotes a la izquierda de la avenida principal, entre el club house y el parque lineal.", hit: [150, 182, 240, 134], viewBox: "122 152 300 195" },
  { id: "B", label: "Sector B", blurb: "Ocho lotes a la derecha de la avenida principal, entre el club house y el parque lineal.", hit: [410, 182, 240, 134], viewBox: "372 152 300 195" },
  { id: "C", label: "Sector C", blurb: "Ocho lotes cerca del acceso, con salida directa a la avenida.", hit: [150, 386, 500, 60], viewBox: "140 252 520 338" },
];

export const VIEWBOX: Record<View, string> = {
  general: `0 0 ${CANVAS.w} ${CANVAS.h}`,
  A: SECTORS[0].viewBox,
  B: SECTORS[1].viewBox,
  C: SECTORS[2].viewBox,
};

export type SpotId = "acceso" | "club" | "plaza" | "parque";
export const SPOTS: { id: SpotId; label: string; cx: number; cy: number; text: string }[] = [
  { id: "acceso", label: "Acceso", cx: 400, cy: 500, text: "Ingreso único al loteo, con control de acceso y conexión directa con la avenida principal." },
  { id: "club", label: "Club house", cx: 400, cy: 93, text: "Espacio común de reunión y recreación, al final de la avenida principal, con pileta." },
  { id: "plaza", label: "Plaza central", cx: 400, cy: 315, text: "Rotonda verde sobre la avenida, punto de encuentro entre los sectores A y B." },
  { id: "parque", label: "Parque lineal", cx: 250, cy: 345, text: "Franja verde que recorre el loteo de lado a lado, con senderos para caminar y andar en bicicleta." },
];

export const STATE_LABEL: Record<LotState, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const STATE_COLOR: Record<LotState, string> = {
  disponible: "#6caede",
  reservado: "#e7b04a",
  vendido: "#5d6d83",
};
