import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import OpportunityCard from "@/components/OpportunityCard";
import LeadForm from "@/components/LeadForm";
import InvestmentDisclaimer from "@/components/InvestmentDisclaimer";
import { opportunities } from "@/data/opportunities";

const Oportunidades = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const abiertas = opportunities.filter((o) => o.status === "abierto");
  const dueDiligence = opportunities.filter((o) => o.status === "due-diligence");
  const cerradas = opportunities.filter((o) => o.status === "cerrado");

  return (
    <div className="min-h-screen pt-12 md:pt-16">
      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-minimal text-muted-foreground">OPORTUNIDADES</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-light text-architectural">
              Invertí en activos
              <br />
              estructurados
            </h1>
            <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
              Portfolio curado de oportunidades inmobiliarias con due diligence completo,
              proyecciones financieras transparentes y vehículos legales de inversión.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background pb-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl space-y-14">
            {abiertas.length > 0 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-light text-architectural">Abiertas a inversión</h2>
                  <span className="text-minimal text-muted-foreground">{abiertas.length} activas</span>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {abiertas.map((o) => (
                    <div key={o.id} id={o.id}>
                      <OpportunityCard opportunity={o} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dueDiligence.length > 0 && (
              <div>
                <h2 className="mb-6 text-2xl font-light text-architectural">En due diligence</h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {dueDiligence.map((o) => (
                    <div key={o.id} id={o.id}>
                      <OpportunityCard opportunity={o} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cerradas.length > 0 && (
              <div>
                <h2 className="mb-6 text-2xl font-light text-architectural">Cerradas</h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {cerradas.map((o) => (
                    <div key={o.id} id={o.id}>
                      <OpportunityCard opportunity={o} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <InvestmentDisclaimer />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <LeadForm
              source="oportunidades"
              title="Te interesa una oportunidad?"
              description="Dejanos tus datos y te enviamos el material privado del proyecto."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Oportunidades;
