const About = () => {
  return (
    <div className="min-h-screen pt-12 md:pt-16">
      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-minimal text-muted-foreground">NOSOTROS</p>
                <h1 className="mt-3 text-4xl md:text-6xl font-light text-architectural">
                  Estructuradores
                  <br />
                  de capital
                </h1>
                <div className="mt-10 space-y-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Alba Capital es una plataforma de inversión inmobiliaria que conecta capital
                    privado con oportunidades reales en activos productivos.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Operamos como estructurador y gestor: seleccionamos los proyectos, diseñamos el
                    vehículo financiero y ejecutamos toda la inversión hasta la salida. Nuestro
                    capital corre junto al de los inversores.
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <p className="text-minimal text-muted-foreground mb-6">PILARES</p>
                  <div className="space-y-6">
                    {[
                      {
                        title: "Selección rigurosa",
                        desc: "Due diligence financiero, legal y técnico sobre cada oportunidad antes de presentarla.",
                      },
                      {
                        title: "Estructuración financiera",
                        desc: "Capital mixto (equity, deuda, preventa) modelado para optimizar TIR ajustada al riesgo.",
                      },
                      {
                        title: "Gestión de riesgo",
                        desc: "Garantías reales, hitos de desembolso y co-inversión del equipo en cada proyecto.",
                      },
                      {
                        title: "Ejecución",
                        desc: "Equipo propio de gestión: obra, comercialización y reporting al inversor.",
                      },
                    ].map((p) => (
                      <div key={p.title} className="border-l-2 border-foreground/40 pl-6">
                        <h3 className="text-lg font-medium">{p.title}</h3>
                        <p className="mt-2 text-muted-foreground">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
                  <div>
                    <p className="text-minimal text-muted-foreground">FUNDADO</p>
                    <p className="mt-2 text-2xl font-light">2015</p>
                  </div>
                  <div>
                    <p className="text-minimal text-muted-foreground">PROYECTOS</p>
                    <p className="mt-2 text-2xl font-light">37</p>
                  </div>
                  <div>
                    <p className="text-minimal text-muted-foreground">CAPITAL</p>
                    <p className="mt-2 text-2xl font-light">USD 42M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
