import { useState, type KeyboardEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { LOTS, SECTORS, SPOTS, STATE_COLOR, STATE_LABEL, VIEWBOX, type LotState, type SectorId, type SpotId, type View } from "./loteo";

type Selection = { kind: "none" } | { kind: "sector"; id: SectorId } | { kind: "lot"; id: number } | { kind: "spot"; id: SpotId };

const onActivate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

interface DrawingProps {
  view: View;
  interactive: boolean;
  selectedLot?: number | null;
  selectedSpot?: SpotId | null;
  onSector?: (id: SectorId) => void;
  onLot?: (id: number) => void;
  onSpot?: (id: SpotId) => void;
  label: string;
}

/** Dibujo del loteo (plano esquemático). Con `interactive` los sectores, lotes y puntos son botones accesibles. */
export function LoteoDrawing({ view, interactive, selectedLot, selectedSpot, onSector, onLot, onSpot, label }: DrawingProps) {
  const general = view === "general";
  const lots = LOTS;
  return (
    <svg
      className="ads-mp__svg"
      viewBox={VIEWBOX[view]}
      preserveAspectRatio="xMidYMid meet"
      role={interactive ? "group" : "img"}
      aria-label={label}
      width={800}
      height={520}
    >
      <defs>
        <pattern id="mp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#16263b" strokeWidth="1" />
        </pattern>
        <pattern id="mp-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#2c6b4e" strokeWidth="2" />
        </pattern>
      </defs>
      <rect x={-400} y={-300} width={1600} height={1100} fill="#0a121f" />
      <rect x={-400} y={-300} width={1600} height={1100} fill="url(#mp-grid)" />

      {/* Perímetro y cinturón verde */}
      <rect x={100} y={44} width={600} height={452} rx={26} fill="#0d1b2c" stroke="#2f8f68" strokeWidth={2} strokeDasharray="10 7" />

      {/* Parque lineal */}
      <rect x={118} y={322} width={564} height={46} rx={8} fill="url(#mp-hatch)" opacity={0.55} />
      <rect x={118} y={322} width={564} height={46} rx={8} fill="#1f5e45" opacity={0.35} />
      <text x={150} y={349} fill="#a9e0c6" fontSize={13} letterSpacing={2}>PARQUE LINEAL</text>

      {/* Calles */}
      <g stroke="#1c2c43" strokeLinecap="round">
        <line x1={400} y1={496} x2={400} y2={128} strokeWidth={22} />
        <line x1={110} y1={250} x2={690} y2={250} strokeWidth={16} />
        <line x1={110} y1={380} x2={690} y2={380} strokeWidth={16} />
      </g>
      <g stroke="#3a5576" strokeWidth={1.5} strokeDasharray="9 9">
        <line x1={400} y1={492} x2={400} y2={130} />
        <line x1={114} y1={250} x2={686} y2={250} />
        <line x1={114} y1={380} x2={686} y2={380} />
      </g>

      {/* Club house con pileta */}
      <rect x={330} y={62} width={140} height={62} rx={10} fill="#16385a" stroke="#6caede" strokeWidth={1.5} />
      <rect x={346} y={98} width={46} height={16} rx={4} fill="#3078ba" opacity={0.85} />
      <text x={400} y={86} textAnchor="middle" fill="#dcecf9" fontSize={13} fontWeight={650} letterSpacing={2}>CLUB HOUSE</text>

      {/* Plaza central */}
      <circle cx={400} cy={315} r={15} fill="#1f5e45" stroke="#a9e0c6" strokeWidth={1.5} />

      {/* Acceso */}
      <rect x={380} y={494} width={40} height={10} rx={3} fill="#e8eef6" />
      <text x={400} y={518} textAnchor="middle" fill="#9fb0c4" fontSize={12} letterSpacing={2}>ACCESO</text>

      {/* Lotes */}
      {lots.map((l) => {
        const inView = general || l.sector === view;
        const canPick = interactive && !general && l.sector === view;
        const selected = selectedLot === l.id;
        const g = (
          <g
            key={l.id}
            className={canPick ? "lot" : undefined}
            opacity={inView ? 1 : 0.28}
            {...(canPick
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": `Lote ${l.id}, sector ${l.sector}, ${STATE_LABEL[l.state].toLowerCase()}`,
                  "aria-pressed": selected,
                  onClick: () => onLot?.(l.id),
                  onKeyDown: onActivate(() => onLot?.(l.id)),
                }
              : { "aria-hidden": true })}
          >
            <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={5} fill={STATE_COLOR[l.state]} fillOpacity={l.state === "vendido" ? 0.55 : 0.9} stroke={selected ? "#fff" : "#0a121f"} strokeWidth={selected ? 3 : 1.5} />
            <text x={l.x + l.w / 2} y={l.y + l.h / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={l.state === "reservado" ? "#2a1d00" : l.state === "disponible" ? "#06223a" : "#e8eef6"} pointerEvents="none">
              {l.id}
            </text>
          </g>
        );
        return g;
      })}

      {/* Sectores (vista general) */}
      {interactive && general &&
        SECTORS.map((s) => (
          <g key={s.id} role="button" tabIndex={0} aria-label={`${s.label}: ver sus lotes`} onClick={() => onSector?.(s.id)} onKeyDown={onActivate(() => onSector?.(s.id))}>
            <rect className="sector-hit" x={s.hit[0]} y={s.hit[1]} width={s.hit[2]} height={s.hit[3]} rx={10} />
            <text x={s.hit[0] + 12} y={s.hit[1] - 6} fill="#6caede" fontSize={15} fontWeight={700} letterSpacing={2} pointerEvents="none">
              {s.label.toUpperCase()}
            </text>
          </g>
        ))}

      {/* Puntos de interés (vista general) */}
      {interactive && general &&
        SPOTS.map((p) => (
          <g key={p.id} className="hotspot" role="button" tabIndex={0} aria-label={p.label} aria-pressed={selectedSpot === p.id} onClick={() => onSpot?.(p.id)} onKeyDown={onActivate(() => onSpot?.(p.id))}>
            <circle className="ring" cx={p.cx} cy={p.cy} r={13} fill="rgba(10,18,31,0.55)" stroke={selectedSpot === p.id ? "#fff" : "#6caede"} strokeWidth={2} />
            <circle cx={p.cx} cy={p.cy} r={5} fill="#6caede" />
          </g>
        ))}
    </svg>
  );
}

const counts = (id: SectorId) => {
  const c: Record<LotState, number> = { disponible: 0, reservado: 0, vendido: 0 };
  LOTS.filter((l) => l.sector === id).forEach((l) => c[l.state]++);
  return c;
};

interface ViewerProps {
  title: string;
  hint: string;
}

export function MasterplanViewer({ title, hint }: ViewerProps) {
  const [view, setView] = useState<View>("general");
  const [sel, setSel] = useState<Selection>({ kind: "none" });

  const pickSector = (id: SectorId) => {
    setView(id);
    setSel({ kind: "sector", id });
  };
  const pickSpot = (id: SpotId) => {
    setView("general");
    setSel({ kind: "spot", id });
  };
  const reset = () => {
    setView("general");
    setSel({ kind: "none" });
  };

  let panel: { title: string; text: string; extra?: string } = { title: "Elegí un sector", text: hint };
  if (sel.kind === "sector") {
    const s = SECTORS.find((x) => x.id === sel.id)!;
    const c = counts(s.id);
    panel = { title: s.label, text: s.blurb, extra: `${c.disponible} disponibles · ${c.reservado} reservados · ${c.vendido} vendidos (estados ilustrativos). Tocá un lote para ver su detalle.` };
  } else if (sel.kind === "lot") {
    const l = LOTS.find((x) => x.id === sel.id)!;
    panel = { title: `Lote ${l.id} · Sector ${l.sector}`, text: l.note, extra: `Estado: ${STATE_LABEL[l.state]} (ilustrativo).` };
  } else if (sel.kind === "spot") {
    const p = SPOTS.find((x) => x.id === sel.id)!;
    panel = { title: p.label, text: p.text };
  }

  return (
    <div className="ads-mp">
      <div className="ads-mp__head">
        <span className="ads-tag">{title}</span>
        {view !== "general" && (
          <button type="button" className="ads-chip" onClick={reset}>
            <ArrowLeft aria-hidden="true" size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
            Volver a la vista general
          </button>
        )}
      </div>
      <LoteoDrawing
        view={view}
        interactive
        selectedLot={sel.kind === "lot" ? sel.id : null}
        selectedSpot={sel.kind === "spot" ? sel.id : null}
        onSector={pickSector}
        onSpot={pickSpot}
        onLot={(id) => setSel({ kind: "lot", id })}
        label="Plano esquemático de un loteo hipotético con tres sectores, club house, plaza central, parque lineal y acceso"
      />
      <div className="ads-mp__chips" role="group" aria-label="Ir a un sector o a un punto del plano">
        <button type="button" className="ads-chip" aria-pressed={view === "general" && sel.kind === "none"} onClick={reset}>Vista general</button>
        {SECTORS.map((s) => (
          <button key={s.id} type="button" className="ads-chip" aria-pressed={sel.kind === "sector" && sel.id === s.id} onClick={() => pickSector(s.id)}>{s.label}</button>
        ))}
        {SPOTS.map((p) => (
          <button key={p.id} type="button" className="ads-chip" aria-pressed={sel.kind === "spot" && sel.id === p.id} onClick={() => pickSpot(p.id)}>{p.label}</button>
        ))}
      </div>
      <div className="ads-mp__panel" aria-live="polite">
        <h3>{panel.title}</h3>
        <p>{panel.text}</p>
        {panel.extra && <p style={{ color: "var(--ads-muted)", fontSize: 14.5 }}>{panel.extra}</p>}
        <div className="ads-legend" aria-hidden="true">
          {(Object.keys(STATE_COLOR) as LotState[]).map((k) => (
            <span key={k}><i style={{ background: STATE_COLOR[k] }} />{STATE_LABEL[k]}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
