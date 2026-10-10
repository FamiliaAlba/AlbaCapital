import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { DealStatus, PublicOpportunity } from "@/hooks/useOpportunities";

const statusLabel: Record<DealStatus, string> = {
  abierto: "Abierto",
  "due-diligence": "Due diligence",
  cerrado: "Cerrado",
};

const statusStyles: Record<DealStatus, string> = {
  abierto: "bg-foreground text-background",
  "due-diligence": "bg-muted text-foreground border border-border",
  cerrado: "bg-transparent text-muted-foreground border border-border",
};

const OpportunityCard = ({ opportunity }: { opportunity: PublicOpportunity }) => {
  // Cada ficha muestra solo los datos que tiene cargados: un campo en venta
  // no tiene TIR ni ticket, y no corresponde mostrar "—" ni una barra en 0%.
  const metrics = [
    { label: "Rendimiento", value: opportunity.tirEstimada },
    { label: "Plazo", value: opportunity.plazo },
    { label: "Ticket", value: opportunity.ticketMinimo },
  ].filter((m): m is { label: string; value: string } => !!m.value);

  return (
    <Link
      to={`/oportunidades/${opportunity.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.02] to-transparent p-6 transition-all duration-500 hover:border-border hover:shadow-elegant"
    >
      {opportunity.photoUrl && (
        <div className="mb-4 -mx-6 -mt-6 aspect-[16/9] overflow-hidden rounded-t-2xl">
          <img
            src={opportunity.photoUrl}
            alt={opportunity.photoAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {opportunity.tipo && <p className="text-minimal text-muted-foreground">{opportunity.tipo}</p>}
          <h3 className="mt-2 text-xl font-light text-architectural">{opportunity.title}</h3>
          {opportunity.location && <p className="mt-1 text-sm text-muted-foreground">{opportunity.location}</p>}
        </div>
        <Badge
          className={cn("shrink-0 rounded-full text-[10px] uppercase tracking-wider", statusStyles[opportunity.dealStatus])}
        >
          {statusLabel[opportunity.dealStatus]}
        </Badge>
      </div>

      {opportunity.descripcion && (
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{opportunity.descripcion}</p>
      )}

      {opportunity.highlights.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {opportunity.highlights.slice(0, 4).map((h) => (
            <li key={h} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              {h}
            </li>
          ))}
        </ul>
      )}

      {metrics.length > 0 && (
        <div
          className="mt-5 grid gap-3 border-t border-border/60 pt-4"
          style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
        >
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-base font-medium">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {opportunity.capitalCaptado !== null && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Capital captado</span>
            <span>{opportunity.capitalCaptado}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-foreground transition-all" style={{ width: `${opportunity.capitalCaptado}%` }} />
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="text-sm text-muted-foreground">{opportunity.capitalObjetivo ?? ""}</span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1">
          Ver detalle <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};

export default OpportunityCard;
