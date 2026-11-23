/**
 * Piezas gráficas ORIGINALES de la landing (SVG propio): no se reutiliza ninguna imagen de terceros.
 */

const TREES = [95, 150, 215, 268, 790, 840, 1130, 1175, 1260, 1330, 1395];

/** Panorama arquitectónico: un desarrollo hipotético con torre, bloques, pabellón de acceso y espejo de agua. */
export function PanoramaArt({ className }: { className?: string }) {
  const horizon = 400;
  return (
    <svg className={className} viewBox="0 0 1440 520" role="img" aria-label="Ilustración de un desarrollo inmobiliario panorámico: torre, bloques residenciales, pabellón de acceso y espejo de agua" width={1440} height={520} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="pa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a101a" />
          <stop offset="0.7" stopColor="#12263d" />
          <stop offset="1" stopColor="#1a3856" />
        </linearGradient>
        <linearGradient id="pa-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b3b5c" />
          <stop offset="1" stopColor="#0b1626" />
        </linearGradient>
        <radialGradient id="pa-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#6caede" stopOpacity="0.45" />
          <stop offset="1" stopColor="#6caede" stopOpacity="0" />
        </radialGradient>
        <pattern id="pa-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="#6caede" strokeOpacity="0.07" />
        </pattern>
        <pattern id="pa-win" width="14" height="16" patternUnits="userSpaceOnUse">
          <rect x="3" y="4" width="8" height="8" fill="#6caede" fillOpacity="0.42" />
        </pattern>
        <pattern id="pa-win-lit" width="28" height="32" patternUnits="userSpaceOnUse">
          <rect x="6" y="8" width="8" height="8" fill="#f4f7fb" fillOpacity="0.8" />
          <rect x="20" y="24" width="8" height="8" fill="#f4f7fb" fillOpacity="0.6" />
        </pattern>
      </defs>

      <rect width="1440" height="520" fill="url(#pa-sky)" />
      <rect width="1440" height="520" fill="url(#pa-grid)" />
      <ellipse className="ads-glow" cx="1030" cy="250" rx="360" ry="220" fill="url(#pa-glow)" />

      {/* Sierras lejanas */}
      <path d="M0 330 C120 290 210 300 320 320 C430 260 520 270 640 316 C760 262 860 258 980 300 C1100 270 1210 280 1320 310 C1380 300 1420 306 1440 312 V400 H0 Z" fill="#0f2238" />
      <path d="M0 360 C160 330 280 345 420 352 C560 318 700 330 820 356 C960 330 1100 336 1260 352 C1340 346 1400 350 1440 354 V400 H0 Z" fill="#132a44" />

      {/* Bloques residenciales */}
      <g stroke="#6caede" strokeOpacity="0.7" strokeWidth="1.2">
        <rect x="1100" y="270" width="120" height="130" fill="#13273f" />
        <rect x="1100" y="270" width="120" height="130" fill="url(#pa-win)" stroke="none" />
        <rect x="1236" y="310" width="90" height="90" fill="#13273f" />
        <rect x="1236" y="310" width="90" height="90" fill="url(#pa-win)" stroke="none" />
        <rect x="830" y="236" width="130" height="164" fill="#13273f" />
        <rect x="830" y="236" width="130" height="164" fill="url(#pa-win)" stroke="none" />
        <rect x="830" y="236" width="130" height="164" fill="url(#pa-win-lit)" stroke="none" />
        {/* Torre */}
        <rect x="980" y="120" width="96" height="280" fill="#16304d" />
        <rect x="980" y="120" width="96" height="280" fill="url(#pa-win)" stroke="none" />
        <rect x="980" y="120" width="96" height="280" fill="url(#pa-win-lit)" stroke="none" />
        <line x1="1028" y1="120" x2="1028" y2="88" />
        <line x1="1020" y1="96" x2="1036" y2="96" />
      </g>

      {/* Pabellón de acceso con cubierta en voladizo */}
      <g stroke="#6caede" strokeOpacity="0.85" strokeWidth="1.4">
        <rect x="300" y="338" width="470" height="62" fill="#14304d" fillOpacity="0.9" />
        <rect x="270" y="326" width="540" height="10" fill="#e8eef6" fillOpacity="0.9" stroke="none" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={320 + i * 42} y1={338} x2={320 + i * 42} y2={400} strokeOpacity="0.55" />
        ))}
        <rect x="320" y="350" width="140" height="50" fill="#6caede" fillOpacity="0.25" />
        <rect x="620" y="350" width="120" height="50" fill="#f4f7fb" fillOpacity="0.18" />
      </g>

      {/* Viviendas bajas */}
      <g stroke="#6caede" strokeOpacity="0.7" strokeWidth="1.2" fill="#13273f">
        {[60, 130, 200].map((x, i) => (
          <g key={x}>
            <rect x={x} y={364 - i * 4} width="56" height={36 + i * 4} />
            <path d={`M${x - 6} ${364 - i * 4} L${x + 28} ${340 - i * 4} L${x + 62} ${364 - i * 4} Z`} />
            <rect x={x + 22} y={382 - i * 4} width="12" height={18 + i * 4} fill="#f4f7fb" fillOpacity="0.5" stroke="none" />
          </g>
        ))}
      </g>

      {/* Árboles */}
      <g>
        {TREES.map((x, i) => {
          const r = 12 + (i % 4) * 4;
          return (
            <g key={x}>
              <line x1={x} y1={horizon} x2={x} y2={horizon - r - 6} stroke="#2a5a46" strokeWidth="3" />
              <circle cx={x} cy={horizon - r - 12} r={r} fill="#1f5e45" fillOpacity="0.85" />
            </g>
          );
        })}
      </g>

      {/* Suelo y espejo de agua */}
      <line x1="0" y1={horizon} x2="1440" y2={horizon} stroke="#6caede" strokeOpacity="0.5" />
      <rect x="0" y={horizon} width="1440" height="120" fill="url(#pa-water)" />
      <g opacity="0.16" transform={`translate(0 ${horizon * 2}) scale(1 -1)`}>
        <rect x="980" y="120" width="96" height="280" fill="#6caede" />
        <rect x="830" y="236" width="130" height="164" fill="#6caede" />
        <rect x="300" y="338" width="470" height="62" fill="#6caede" />
      </g>
      <g stroke="#6caede" strokeOpacity="0.22">
        {[420, 440, 462, 486].map((y) => (
          <line key={y} x1="0" y1={y} x2="1440" y2={y} strokeDasharray="60 36" />
        ))}
      </g>

      {/* Cotas y norte (detalle de plano) */}
      <g stroke="#6caede" strokeOpacity="0.55" strokeWidth="1" fill="none" fontFamily="Inter Tight, sans-serif">
        <line x1="300" y1="300" x2="770" y2="300" />
        <line x1="300" y1="294" x2="300" y2="306" />
        <line x1="770" y1="294" x2="770" y2="306" />
        <text x="535" y="292" textAnchor="middle" fill="#9fb0c4" stroke="none" fontSize="13" letterSpacing="3">PABELLÓN DE ACCESO</text>
        <circle cx="70" cy="70" r="20" />
        <path d="M70 54 L76 74 L70 70 L64 74 Z" fill="#6caede" fillOpacity="0.7" />
        <text x="70" y="104" textAnchor="middle" fill="#9fb0c4" stroke="none" fontSize="13">N</text>
      </g>
    </svg>
  );
}

/** Mockup de gestión (portada): tablero comercial con datos ficticios. */
export function HeroMockup() {
  const cols = [
    { n: "Nuevas", h: 78 },
    { n: "Contactadas", h: 58 },
    { n: "Visita", h: 38 },
    { n: "Propuesta", h: 24 },
  ];
  const rows = [
    ["Consulta por el lote 12", "Responder hoy · 17:00"],
    ["Visita al lote 7", "Sábado · 11:00"],
    ["Propuesta por escrito", "Enviar mañana"],
  ];
  return (
    <div className="ads-mock" role="img" aria-label="Pantalla de demostración de un sistema de gestión comercial: consultas por etapa y próximas acciones">
      <div className="ads-mock__bar">
        <span className="ads-mock__dots" aria-hidden="true"><i /><i /><i /></span>
        <span style={{ marginLeft: 6 }}>Gestión comercial</span>
        <span className="ads-tag" style={{ marginLeft: "auto" }}>Demostración</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[["Consultas nuevas", "12"], ["Visitas agendadas", "5"], ["Próximas acciones", "9"]].map(([l, v]) => (
            <div key={l} className="ads-kpi"><span>{l}</span><strong>{v}</strong></div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 84, padding: "0 4px" }}>
          {cols.map((c) => (
            <div key={c.n} style={{ flex: 1, minWidth: 0, display: "grid", gap: 6, alignItems: "end" }}>
              <div style={{ height: c.h, background: "linear-gradient(180deg,#6caede,#3078ba)", borderRadius: 6 }} />
              <span style={{ fontSize: "clamp(10.5px, 3vw, 11.5px)", color: "var(--ads-muted)", textAlign: "center", whiteSpace: "nowrap" }}>{c.n}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map(([a, b]) => (
            <div key={a} className="ads-mini__row"><b style={{ fontSize: 14 }}>{a}</b><small style={{ marginLeft: "auto", fontSize: 13 }}>{b}</small></div>
          ))}
        </div>
      </div>
    </div>
  );
}
