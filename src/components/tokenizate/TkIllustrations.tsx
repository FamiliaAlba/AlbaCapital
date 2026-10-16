import { FileText, Tractor, Warehouse, Hotel, Home, Boxes, type LucideIcon } from "lucide-react";

/** Diagrama simple de relaciones: activo → vehículo jurídico → participantes. Sin cifras ni datos. */
export const HeroDiagram = () => (
  <figure className="w-full" aria-label="Diagrama: un activo real se estructura mediante un vehículo jurídico documentado para que participen inversores, con análisis y seguimiento de Alba Capital">
    <svg viewBox="0 0 640 300" role="img" className="h-auto w-full">
      <title>Activo real, vehículo jurídico y participantes, con análisis y seguimiento de Alba Capital</title>
      <defs>
        <marker id="tk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#5B6B80" />
        </marker>
      </defs>
      <rect x="8" y="8" width="624" height="284" rx="20" fill="#F3F5F8" />
      {[
        { x: 40, label: "Activo real", sub: "Maquinaria, inmuebles, infraestructura", icon: "asset" },
        { x: 240, label: "Vehículo jurídico", sub: "Derechos definidos por escrito", icon: "doc" },
        { x: 440, label: "Participantes", sub: "Según la estructura de cada proyecto", icon: "people" },
      ].map((n) => (
        <g key={n.label}>
          <rect x={n.x} y="70" width="160" height="130" rx="14" fill="#fff" stroke="#C9D1DC" />
          <circle cx={n.x + 80} cy="110" r="22" fill="#0B2545" />
          {n.icon === "asset" && <path d={`M${n.x + 68} 118 h24 v-16 l-12 -8 l-12 8 z M${n.x + 76} 118 v-8 h8 v8`} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />}
          {n.icon === "doc" && <path d={`M${n.x + 70} 98 h14 l6 6 v18 h-20 z M${n.x + 74} 110 h12 M${n.x + 74} 116 h12`} fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />}
          {n.icon === "people" && (
            <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <circle cx={n.x + 74} cy="106" r="5" />
              <circle cx={n.x + 88} cy="108" r="4" />
              <path d={`M${n.x + 64} 122 c2 -9 16 -9 18 0 M${n.x + 84} 122 c1 -6 10 -6 12 0`} />
            </g>
          )}
          <text x={n.x + 80} y="156" textAnchor="middle" fontSize="15" fontWeight="600" fill="#0B2545">{n.label}</text>
          <text x={n.x + 80} y="176" textAnchor="middle" fontSize="10.5" fill="#4B5563">{n.sub.length > 26 ? n.sub.slice(0, n.sub.lastIndexOf(" ", 26)) : n.sub}</text>
          {n.sub.length > 26 && <text x={n.x + 80} y="190" textAnchor="middle" fontSize="10.5" fill="#4B5563">{n.sub.slice(n.sub.lastIndexOf(" ", 26) + 1)}</text>}
        </g>
      ))}
      <path d="M204 135 H236" stroke="#5B6B80" strokeWidth="2" markerEnd="url(#tk-arrow)" />
      <path d="M404 135 H436" stroke="#5B6B80" strokeWidth="2" markerEnd="url(#tk-arrow)" />
      <path d="M120 70 V48 H520 V70" fill="none" stroke="#5B6B80" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="320" y="40" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5B6B80" letterSpacing="1.2">ANÁLISIS PROFESIONAL DE ALBA CAPITAL</text>
      <path d="M120 200 V232 H520 V200" fill="none" stroke="#5B6B80" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="320" y="256" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5B6B80" letterSpacing="1.2">SEGUIMIENTO Y REPORTES</text>
    </svg>
  </figure>
);

/** Mockup de ficha de proyecto: estructura ilustrativa, SIN datos reales. */
export const ProjectCardMock = () => (
  <div className="rounded-2xl border border-border bg-white p-5 shadow-sm" aria-label="Ejemplo ilustrativo de ficha de proyecto, sin datos reales">
    <div className="flex items-center justify-between">
      <span className="rounded-full bg-[#E4E9F0] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0B2545]">Ejemplo ilustrativo</span>
      <span className="text-[11px] text-[#4B5563]">Sin datos reales</span>
    </div>
    <div className="mt-4 h-28 rounded-xl bg-gradient-to-br from-[#D5DDE8] to-[#EEF1F5]" aria-hidden="true" />
    <div className="mt-4 space-y-2" aria-hidden="true">
      <div className="h-3 w-2/3 rounded bg-[#C9D1DC]" />
      <div className="h-2.5 w-full rounded bg-[#E4E9F0]" />
      <div className="h-2.5 w-5/6 rounded bg-[#E4E9F0]" />
    </div>
    <ul className="mt-5 grid gap-2 text-sm text-[#1B1F27]">
      {["Descripción del activo y de su operación", "Origen de los ingresos", "Documentación disponible", "Derechos, condiciones y riesgos", "Reportes de seguimiento"].map((t) => (
        <li key={t} className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-[#5B6B80]" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  </div>
);

// eslint-disable-next-line react-refresh/only-export-components
export const ASSET_ICONS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Tractor, title: "Maquinaria y equipamiento", text: "Equipos productivos con documentación y operación verificables." },
  { icon: Warehouse, title: "Infraestructura productiva y logística", text: "Depósitos, plantas y espacios que generan actividad económica." },
  { icon: Hotel, title: "Proyectos turísticos y hoteleros", text: "Establecimientos y desarrollos de hospedaje y turismo." },
  { icon: Home, title: "Bienes raíces residenciales", text: "Inmuebles de vivienda con ingresos o plan de desarrollo." },
  { icon: Boxes, title: "Otros activos sujetos a evaluación", text: "Cada caso se analiza antes de definir si corresponde estructurarlo." },
];

