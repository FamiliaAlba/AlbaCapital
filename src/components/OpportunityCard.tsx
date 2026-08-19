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
  return (
    <Link
      to={`/oportunidades#${opportunity.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.02] to-transparent p-6 transition-all duration-500 hover:border-border hover:shadow-elegant"
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

      <div className="mt-2 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">TIR est.</p>
          <p className="mt-1 text-base font-medium">{opportunity.tirEstimada ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plazo</p>
          <p className="mt-1 text-base font-medium">{opportunity.plazo ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ticket</p>
          <p className="mt-1 text-base font-medium">{opportunity.ticketMinimo ?? "—"}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Capital captado</span>
          <span>{opportunity.capitalCaptado}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${opportunity.capitalCaptado}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {opportunity.capitalObjetivo ? `Objetivo ${opportunity.capitalObjetivo}` : ""}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1">
          Ver detalle <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};

export default OpportunityCard;
