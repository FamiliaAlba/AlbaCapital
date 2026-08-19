
const Services = () => {
  const services = [
    {
      number: "01",
      title: "RESIDENCIAL",
      description: "Diseñamos hogares que reflejan estilos de vida individuales manteniendo la integridad arquitectónica"
    },
    {
      number: "02",
      title: "COMERCIAL",
      description: "Creamos espacios funcionales que potencian los entornos de negocio y la experiencia del usuario"
    },
    {
      number: "03",
      title: "RENOVACIÓN",
      description: "Transformamos estructuras existentes con sensibilidad contemporánea y prácticas sostenibles"
    },
    {
      number: "04",
      title: "CONSULTORÍA",
      description: "Brindamos asesoramiento experto en dirección de diseño, planificación y soluciones arquitectónicas"
    }
  ];

  return (
    <div className="min-h-screen">
      
      <section className="pt-32 pb-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h1 className="text-minimal text-muted-foreground mb-4">SERVICIOS</h1>
              <h2 className="text-4xl md:text-6xl font-light text-architectural">
                Lo que hacemos
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
              {services.map((service, index) => (
                <div key={index} className="group">
                  <div className="flex items-start space-x-6">
                    <span className="text-minimal text-muted-foreground font-medium">
                      {service.number}
                    </span>
                    <div>
                      <h3 className="text-2xl font-light mb-4 text-architectural group-hover:text-muted-foreground transition-colors duration-500">
                        {service.title}
                      </h3>
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
    </div>
  );
};

export default Services;
