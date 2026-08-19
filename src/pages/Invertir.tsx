import { Link } from "react-router-dom";
import { ArrowRight, Layers, Shield, Coins, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepCard from "@/components/StepCard";
import LeadForm from "@/components/LeadForm";
import InvestmentDisclaimer from "@/components/InvestmentDisclaimer";

const Invertir = () => {
  return (
    <div className="min-h-screen pt-12 md:pt-16">
      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-minimal text-muted-foreground">INVERTIR</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-light text-architectural">
              Capital inteligente.
              <br />
              Retornos reales.
            </h1>
            <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
              Estructuramos vehículos de inversión inmobiliaria que combinan rigor financiero,
              activos reales y proyecciones claras de retorno.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/oportunidades">
                  Ver oportunidades <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#formulario">Hablá con un asesor</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className="text-minimal text-muted-foreground">PROCESO</p>
              <h2 className="mt-2 text-3xl md:text-5xl font-light text-architectural">
                Cómo funciona tu inversión
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <StepCard
                number="01"
                icon={FileText}
                title="Onboarding"
                description="Conversamos tu perfil, horizonte y monto. Firmás NDA y accedés al material privado de cada oportunidad."
              />
              <StepCard
                number="02"
                icon={Coins}
                title="Estructuración"
                description="Suscribís el vehículo legal (SPV, fideicomiso o tokenización) según el proyecto. Aporte en USD."
              />
              <StepCard
                number="03"
                icon={Shield}
                title="Gestión y salida"
                description="Reporting trimestral, distribuciones programadas y ejecución de la salida según el plan financiero."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <p className="text-minimal text-muted-foreground">INSTRUMENTOS</p>
              <h2 className="mt-2 text-3xl md:text-5xl font-light text-architectural">
                Vehículos disponibles
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Layers,
                  title: "Equity directo",
                  desc: "Participación accionaria en el SPV del proyecto. Mayor upside, plazo extendido.",
                  ticket: "Desde USD 25.000",
                },
                {
                  icon: Shield,
                  title: "Renta dolarizada",
                  desc: "Activos en operación con contratos de renta firmados. Flujo trimestral en USD.",
                  ticket: "Desde USD 20.000",
                },
                {
                  icon: Coins,
                  title: "Tokenización",
                  desc: "Participación fraccionada vía token. Liquidez secundaria y ticket accesible.",
                  ticket: "Desde USD 5.000",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-6 md:p-8"
                >
                  <v.icon className="h-6 w-6" strokeWidth={1.5} />
                  <h3 className="mt-5 text-xl font-light text-architectural">{v.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  <p className="mt-6 text-minimal text-foreground">{v.ticket}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="formulario" className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <InvestmentDisclaimer />
            <LeadForm
              source="invertir"
              title="Hablemos de tu inversión"
              description="Completá el formulario y un asesor te contacta en menos de 24hs."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Invertir;
