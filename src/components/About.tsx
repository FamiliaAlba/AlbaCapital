const About = () => {
  return (
    <section id="about" className="py-32 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl p-8 md:p-16 shadow-lg">
            <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-minimal text-muted-foreground mb-4">NOSOTROS</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                Filosofía de inversión
              </h3>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Creemos que el valor inmobiliario no se encuentra, se construye estratégicamente. 
                  Cada activo representa una oportunidad de ser optimizado, reconfigurado y escalado 
                  mediante estructura de capital, visión de mercado y ejecución precisa.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nuestra práctica se centra en identificar ineficiencias, detectar potencial 
                  oculto y transformar activos físicos en vehículos de inversión rentables, 
                  alineando riesgo, liquidez y retorno.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Desde 2022, operamos en el mercado inmobiliario con un enfoque orientado a 
                  resultados, participando en múltiples operaciones residenciales y desarrollos 
                  de escala media. Cada proyecto comienza con un análisis profundo de viabilidad 
                  financiera y culmina con una estrategia de salida clara.
                </p>
              </div>
            </div>
            
            <div className="space-y-12">
              <div>
                <h4 className="text-minimal text-muted-foreground mb-6">ENFOQUE</h4>
                <div className="space-y-6">
                  <div className="border-l-2 border-architectural pl-6">
                    <h5 className="text-lg font-medium mb-2">Investigación de mercado</h5>
                    <p className="text-muted-foreground">Analizamos variables macro y microeconómicas, comportamiento de demanda y ciclos inmobiliarios para identificar el momento óptimo de entrada y salida en cada operación.</p>
                  </div>
                  <div className="border-l-2 border-architectural pl-6">
                    <h5 className="text-lg font-medium mb-2">Estructuración estratégica</h5>
                    <p className="text-muted-foreground">Diseñamos modelos de negocio y estructuras de capital (equity, deuda, preventa) que permiten maximizar el rendimiento y mitigar riesgos en cada proyecto.</p>
                  </div>
                  <div className="border-l-2 border-architectural pl-6">
                    <h5 className="text-lg font-medium mb-2">Ejecución y monetización</h5>
                    <p className="text-muted-foreground">Gestionamos activamente cada activo desde su adquisición hasta su salida, implementando estrategias de posicionamiento, comercialización y captura de valor.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-border">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-minimal text-muted-foreground mb-2">FUNDADO</h4>
                    <p className="text-xl">2022</p>
                  </div>
                  <div>
                    <h4 className="text-minimal text-muted-foreground mb-2">PROYECTOS</h4>
                    <p className="text-xl">100+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
