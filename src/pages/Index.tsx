import { Link } from "react-router-dom";
import { ArrowRight, Search, FileCheck, TrendingUp } from "lucide-react";
import Hero from "@/components/Hero";
import LandPortfolioShowcase from "@/components/LandPortfolioShowcase";
import Capabilities from "@/components/Capabilities";
import Portfolio from "@/components/Portfolio";
import MetricCard from "@/components/MetricCard";
import OpportunitiesCarousel from "@/components/OpportunitiesCarousel";
import StepCard from "@/components/StepCard";
import LeadForm from "@/components/LeadForm";
import TeamSection from "@/components/TeamSection";
import { Button } from "@/components/ui/button";
import { heroMetrics } from "@/data/metrics";



const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Portfolio de activos productivos (carrusel animado) */}
      <LandPortfolioShowcase />

      {/* Métricas clave */}
      <section className="border-b border-border bg-background py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-minimal text-muted-foreground">PERFORMANCE</p>
                <h2 className="mt-2 text-3xl md:text-5xl font-light text-architectural">
                  Resultados que respaldan
                </h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Métricas históricas del portfolio gestionado por Alba Capital.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {heroMetrics.map((m) => (
                <MetricCard key={m.label} metric={m} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Oportunidades destacadas */}
      <OpportunitiesCarousel />

      <Capabilities />


      <section className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className="text-minimal text-muted-foreground">CÓMO FUNCIONA</p>
              <h2 className="mt-2 text-3xl md:text-5xl font-light text-architectural">
                Tres pasos para invertir
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <StepCard
                number="01"
                icon={Search}
                title="Explorá oportunidades"
                description="Accedé a un portfolio curado de proyectos inmobiliarios con due diligence completo y proyecciones financieras claras."
              />
              <StepCard
                number="02"
                icon={FileCheck}
                title="Estructurá tu inversión"
                description="Definí tu ticket y participá vía vehículos legales transparentes. Documentación profesional desde el día uno."
              />
              <StepCard
                number="03"
                icon={TrendingUp}
                title="Cobrá tu retorno"
                description="Seguimiento periódico, reporting trimestral y distribuciones según el cronograma del proyecto."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos destacados (video + carrusel Instagram) */}
      <Portfolio />

      {/* Nuestro equipo */}
      <TeamSection />

      {/* Lead magnet */}
      <section className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-minimal text-muted-foreground">ACCESO ANTICIPADO</p>
              <h2 className="mt-2 text-3xl md:text-5xl font-light text-architectural">
                Accedé a oportunidades antes del lanzamiento
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Sumate a la red privada de inversores de Alba Capital y recibí las nuevas
                oportunidades 7 días antes que el público general.
              </p>
            </div>
            <LeadForm
              source="lead-magnet-home"
              title="Sumate a la red privada"
              description="Sin spam. Solo oportunidades reales, una por mes."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
