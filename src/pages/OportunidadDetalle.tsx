import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LeadForm from "@/components/LeadForm";
import SocialPostButton from "@/components/social/SocialPostButton";
import NotFound from "@/pages/NotFound";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { useOpportunityDetail, type DetailSection } from "@/hooks/useOpportunityDetail";
import type { DealStatus } from "@/hooks/useOpportunities";

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

const Section = ({ section }: { section: DetailSection }) => (
  <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.02] to-transparent p-6 md:p-8">
    <h2 className="text-xl md:text-2xl font-light text-architectural">{section.title}</h2>

    {section.text && <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">{section.text}</p>}

    {section.rows && section.rows.length > 0 && (
      <dl className="mt-5 divide-y divide-border/60 border-y border-border/60">
        {section.rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    )}

    {section.table && (
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              {section.table.headers.map((h) => (
                <th key={h} className="py-2 pr-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className={cn("py-3 pr-4", j === 0 ? "text-foreground" : "text-muted-foreground")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {section.items && section.items.length > 0 && (
      <ul className="mt-5 space-y-2">
        {section.items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )}

    {section.note && <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{section.note}</p>}
  </section>
);

const OportunidadDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useI18n();
  const { opportunity, loading } = useOpportunityDetail(slug, locale);

  useEffect(() => {
    if (opportunity) document.title = `${opportunity.title} — Alba Capital`;
  }, [opportunity]);

  if (!loading && !opportunity) return <NotFound />;

  if (loading || !opportunity) {
    return (
      <div className="min-h-screen pt-24 md:pt-28">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="aspect-[16/7] w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Rendimiento", value: opportunity.tirEstimada },
    { label: "Plazo", value: opportunity.plazo },
    { label: "Ticket", value: opportunity.ticketMinimo },
    { label: "Monto", value: opportunity.capitalObjetivo },
  ].filter((m): m is { label: string; value: string } => !!m.value);

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <article className="container mx-auto px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/oportunidades"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Todas las oportunidades
            </Link>
            <SocialPostButton opportunityId={opportunity.id} />
          </div>

          <div className="mt-6 aspect-[16/8] w-full overflow-hidden rounded-2xl bg-muted">
            <img src={opportunity.photoUrl ?? ""} alt={opportunity.photoAlt} className="h-full w-full object-cover" />
          </div>

          <header className="mt-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              {opportunity.tipo && <p className="text-minimal text-muted-foreground">{opportunity.tipo}</p>}
              <h1 className="mt-2 text-3xl md:text-5xl font-light text-architectural">{opportunity.title}</h1>
              {opportunity.location && <p className="mt-2 text-muted-foreground">{opportunity.location}</p>}
            </div>
            <Badge
              className={cn(
                "shrink-0 self-start rounded-full text-[10px] uppercase tracking-wider",
                statusStyles[opportunity.dealStatus],
              )}
            >
              {statusLabel[opportunity.dealStatus]}
            </Badge>
          </header>

          {metrics.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-border/60 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-base font-medium">{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {opportunity.descripcion && (
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">{opportunity.descripcion}</p>
          )}

          {opportunity.highlights.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {opportunity.highlights.map((h) => (
                <li key={h} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  {h}
                </li>
              ))}
            </ul>
          )}

          {opportunity.detail && (
            <div className="mt-10 space-y-6">
              {opportunity.detail.sections.map((section) => (
                <Section key={section.title} section={section} />
              ))}
              {opportunity.detail.source && (
                <p className="text-xs leading-relaxed text-muted-foreground">{opportunity.detail.source}</p>
              )}
            </div>
          )}
        </div>
      </article>

      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <LeadForm
              source="oportunidad-detalle"
              oportunidadId={opportunity.slug}
              title="Te interesa esta oportunidad?"
              description="Dejanos tus datos y te enviamos el material privado del proyecto."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OportunidadDetalle;
