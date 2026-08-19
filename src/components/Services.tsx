const Services = () => {
  const services = [
    {
      number: "01",
      title: "ESTRUCTURACIÓN DE INVERSIONES",
      description: "Diseñamos vehículos de inversión inmobiliaria que transforman activos en oportunidades de alto rendimiento, combinando capital, estrategia y timing de mercado."
    },
    {
      number: "02",
      title: "DESARROLLO ESTRATÉGICO",
      description: "dentificamos y ejecutamos proyectos con máximo potencial, aplicando análisis de highest and best use para optimizar valor desde la adquisición hasta la salida."
    },
    {
      number: "03",
      title: "INGENIERÍA FINANCIERA",
      description: "Estructuramos modelos de negocio con capital mixto (equity, deuda y preventa), proyectando flujos, TIR y escenarios para maximizar el retorno ajustado al riesgo."
    },
    {
      number: "04",
      title: "CAPTACIÓN Y GESTIÓN DE CAPITAL",
      description: "Conectamos oportunidades con inversores, creando propuestas claras, escalables y respaldadas por activos reales, gestionando todo el ciclo de inversión."
    }
  ];

  return (
    <section id="services" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-minimal text-muted-foreground mb-4">SERVICIOS</h2>
            <h3 className="text-4xl md:text-6xl font-light text-architectural">
              Lo que hacemos
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10" style={{ perspective: '1200px' }}>
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative rounded-lg border border-border/40 bg-gradient-to-br from-foreground/[0.02] to-transparent p-8 md:p-10 backdrop-blur-sm transition-all duration-700 ease-out hover:border-border/80 hover:shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.15)]"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  const y = (e.clientY - rect.top) / rect.height - 0.5;
                  card.style.transform = `rotateX(${-y * 4}deg) rotateY(${x * 6}deg) translateY(-4px)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0)';
                }}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-foreground/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="flex items-start space-x-6 relative">
                  <span className="text-minimal text-muted-foreground font-medium">
                    {service.number}
                  </span>
                  <div>
                    <h4 className="text-2xl font-light mb-4 text-architectural transition-all duration-500 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent group-hover:tracking-wide">
                      {service.title}
                    </h4>
                    <div className="h-px w-10 bg-gradient-to-r from-foreground/40 to-transparent mb-4 transition-all duration-500 group-hover:w-20 group-hover:from-foreground/70" />
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
