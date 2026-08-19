import { useEffect, useState } from "react";
import { Heart, Bookmark, Home, Search, Film, ShoppingBag, MoreHorizontal, PlusSquare } from "lucide-react";
import LazyVideo from "@/components/LazyVideo";
import project1 from "@/assets/project-1.webp";
import project2 from "@/assets/project-2.webp";
import project3 from "@/assets/project-3.webp";
import fondoCiudad from "@/assets/fondo-ciudad.webp";
import carousel1 from "@/assets/carousel-1.webp";
import carousel2 from "@/assets/carousel-2.webp";
import carousel3 from "@/assets/carousel-3.webp";
import carousel4 from "@/assets/carousel-4.webp";
import carousel5 from "@/assets/carousel-5.webp";
import carousel6 from "@/assets/carousel-6.webp";
import carousel7 from "@/assets/carousel-7.webp";
import albaLogo from "@/assets/alba-logo-black.webp";

const carouselImages = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6, carousel7];
const sepiaFilter = "[filter:grayscale(100%)_sepia(30%)]";

const Portfolio = () => {
  const CAROUSEL_DURATION_MS = 40000;
  const PER_IMAGE_MS = CAROUSEL_DURATION_MS / carouselImages.length;
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % carouselImages.length);
    }, PER_IMAGE_MS);
    return () => clearInterval(id);
  }, [PER_IMAGE_MS]);

  const projects = [
    {
      image: project1,
      title: "ESTRUCTURAMOS VALOR. GARANTIZAMOS RETORNO.",
      location: "JESUS MARIA CORDOBA, 2024",
      description: "Transformamos activos inmobiliarios en oportunidades de inversión rentables."
    },
    {
      image: project2,
      title: "Asesoría en Modelos de Negocio Tokenizados",
      location: "San Luis, Argentina",
      description: "infraestructura de inversión + innovación financiera"
    },
    {
      image: project3,
      title: "",
      location: "",
      description: "transformando activos en instrumentos de negocios"
    }
  ];

  return (
    <section id="work" className="py-32 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-minimal text-muted-foreground mb-4">PROYECTOS DESTACADOS</h2>
            <h3 className="text-4xl md:text-6xl font-light text-architectural">
              Intervensión en campo
            </h3>
          </div>
          
          <div className="space-y-32">
            {projects.map((project, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden">
                  {index === 0 ? (
                    <LazyVideo
                      sources={[
                        { src: "/video/portfolio-video.webm", type: "video/webm" },
                        { src: "/video/portfolio-video.mp4", type: "video/mp4" },
                      ]}
                      poster="/video/portfolio-video-poster.webp"
                      ariaLabel={project.title}
                      className="w-full h-[70vh] transition-transform duration-700 group-hover:scale-105 [filter:grayscale(100%)_sepia(30%)] overflow-hidden"
                    />
                  ) : index === 1 ? (
                    <div
                      className="relative w-full h-[70vh] bg-muted overflow-hidden"
                      style={{
                        backgroundImage: `url(${fondoCiudad})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "contain",
                      }}
                    >
                      {/* Overlay para suavizar la imagen a gris translúcido */}
                      <div className="absolute inset-0 bg-muted/70 [filter:grayscale(100%)]" aria-hidden="true" />

                      {/* Símbolos informáticos flotando suavemente de derecha a izquierda */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                        {[
                          { s: "$", top: "8%", size: "text-3xl md:text-4xl", dur: "22s", delay: "0s", op: 0.2 },
                          { s: "€", top: "16%", size: "text-2xl md:text-3xl", dur: "26s", delay: "-5s", op: 0.18 },
                          { s: "₿", top: "24%", size: "text-3xl md:text-4xl", dur: "28s", delay: "-9s", op: 0.2 },
                          { s: "¥", top: "32%", size: "text-2xl md:text-3xl", dur: "30s", delay: "-12s", op: 0.16 },
                          { s: "£", top: "40%", size: "text-2xl md:text-3xl", dur: "24s", delay: "-3s", op: 0.18 },
                          { s: "▲", top: "48%", size: "text-xl md:text-2xl", dur: "26s", delay: "-7s", op: 0.16 },
                          { s: "$", top: "56%", size: "text-2xl md:text-3xl", dur: "32s", delay: "-14s", op: 0.16 },
                          { s: "▼", top: "64%", size: "text-xl md:text-2xl", dur: "28s", delay: "-2s", op: 0.16 },
                          { s: "€", top: "72%", size: "text-3xl md:text-4xl", dur: "30s", delay: "-18s", op: 0.18 },
                          { s: "₿", top: "80%", size: "text-2xl md:text-3xl", dur: "24s", delay: "-6s", op: 0.18 },
                          { s: "¥", top: "88%", size: "text-2xl md:text-3xl", dur: "34s", delay: "-11s", op: 0.16 },
                          { s: "£", top: "20%", size: "text-3xl md:text-4xl", dur: "32s", delay: "-20s", op: 0.16 },
                          { s: "▲", top: "68%", size: "text-base md:text-lg", dur: "26s", delay: "-4s", op: 0.18 },
                        ].map((sym, i) => (
                          <span
                            key={i}
                            className="absolute font-mono text-foreground animate-drift-rtl whitespace-nowrap"
                            style={{
                              top: sym.top,
                              right: "-10%",
                              opacity: 0,
                              animationDuration: sym.dur,
                              animationDelay: sym.delay,
                              ["--drift-distance" as never]: "120vw",
                              ["--drift-opacity" as never]: String(sym.op),
                              ["--drift-y" as never]: `${(i % 2 === 0 ? -1 : 1) * 20}px`,
                            } as React.CSSProperties}
                          >
                            <span className={`${sym.size} tracking-widest`}>{sym.s}</span>
                          </span>
                        ))}
                      </div>
                      <div className="relative z-10 h-full w-full flex items-stretch justify-between gap-4 md:gap-8 p-4 md:p-10">
                        {/* Bloque izquierdo con el texto descriptivo */}
                        <div className="flex items-center w-full max-w-[280px] md:max-w-md">
                          <div className="group relative rounded-lg border border-border/40 bg-gradient-to-br from-foreground/[0.02] to-transparent p-4 md:p-6 backdrop-blur-sm transition-all duration-700 ease-out hover:border-border/80 hover:shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.15)]">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-foreground/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <p className="text-[11px] md:text-sm tracking-widest text-foreground mb-3 relative">
                              ASESORÍA EN MODELOS DE NEGOCIO TOKENIZADOS
                            </p>
                            <div className="space-y-2 md:space-y-3 text-[10px] md:text-xs text-muted-foreground leading-snug md:leading-relaxed relative">
                              <p>
                                Diseñamos modelos de negocio inmobiliarios orientados a la tokenización de activos, transformando proyectos de capital intensivo en instrumentos digitales fraccionables, líquidos y accesibles a un espectro ampliado de inversores.
                              </p>
                              <p>
                                Analizamos cada oportunidad bajo criterios de highest and best use, estructurando no solo su desarrollo físico, sino también su arquitectura financiera y digital. Integramos esquemas de capital (equity, deuda, preventa) con modelos de emisión de tokens respaldados por activos reales, permitiendo optimizar la captación de fondos y diversificar el riesgo.
                              </p>
                              <p>
                                Nuestra intervención abarca desde la conceptualización del proyecto hasta su estructuración como vehículo de inversión tokenizado, incluyendo proyecciones financieras, diseño de gobernanza, estrategia de comercialización y narrativa de valor para el mercado.
                              </p>
                              <p>
                                De esta manera, convertimos activos inmobiliarios en unidades de inversión escalables, transferibles y alineadas con las nuevas dinámicas del capital global, manteniendo siempre respaldo físico, trazabilidad y foco en el retorno ajustado al riesgo.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bloques derechos */}
                        <div className="flex flex-col justify-center gap-2 md:gap-3 w-full max-w-[220px] md:max-w-[260px]">
                          {[
                            { k: "TOKENIZACIÓN", v: "Activos digitalizados sobre blockchain" },
                            { k: "ESTRUCTURACIÓN", v: "Diseño legal y financiero a medida" },
                            { k: "LIQUIDEZ", v: "Mercados secundarios accesibles" },
                            { k: "GOBERNANZA", v: "Reglas claras para todos los actores" },
                            { k: "TRAZABILIDAD", v: "Registro inmutable de operaciones" },
                            { k: "ESCALABILIDAD", v: "Modelos replicables y globales" },
                          ].map((b) => (
                            <div
                              key={b.k}
                              className="group relative rounded-lg border border-border/40 bg-gradient-to-br from-foreground/[0.02] to-transparent px-3 py-2 md:px-4 md:py-3 backdrop-blur-sm transition-all duration-700 ease-out hover:border-border/80 hover:shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.15)]"
                            >
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-foreground/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                              <p className="text-[10px] md:text-xs tracking-widest text-foreground mb-0.5 relative">{b.k}</p>
                              <p className="text-[10px] md:text-xs text-muted-foreground leading-snug relative">
                                {b.v}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : index === 2 ? (
                    <div className="relative w-full h-[70vh] bg-muted overflow-hidden flex items-center justify-center">
                      {/* Carrusel de fondo (auto-scroll infinito) */}
                      <div className="absolute inset-0 flex items-center overflow-hidden" aria-hidden="true">
                        <div className="flex gap-2 animate-carousel-scroll" style={{ width: "max-content" }}>
                          {[...Array(2)].flatMap((_, loop) =>
                            carouselImages.map((img, i) => (
                              <img
                                key={`${loop}-${i}`}
                                src={img}
                                alt=""
                                loading="lazy"
                                style={{ filter: "grayscale(100%) sepia(30%) blur(8px)" }}
                                className="h-[40vh] md:h-[45vh] w-auto object-cover opacity-70 scale-110"
                              />
                            ))
                          )}
                        </div>
                      </div>

                      {/* Mockup de teléfono Instagram al frente */}
                      <div className="relative z-10 w-[260px] md:w-[300px] aspect-[9/19] my-6">
                        {/* Marco metálico exterior */}
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-700 rounded-[2.6rem] shadow-2xl" />

                        {/* Botones físicos laterales */}
                        {/* Silenciador (izquierda arriba) */}
                        <div className="absolute -left-[3px] top-[12%] w-[3px] h-5 bg-zinc-800 rounded-l-sm z-0" />
                        {/* Volumen + */}
                        <div className="absolute -left-[3px] top-[20%] w-[3px] h-9 bg-zinc-800 rounded-l-sm z-0" />
                        {/* Volumen - */}
                        <div className="absolute -left-[3px] top-[30%] w-[3px] h-9 bg-zinc-800 rounded-l-sm z-0" />
                        {/* Botón de encendido (derecha) */}
                        <div className="absolute -right-[3px] top-[24%] w-[3px] h-14 bg-zinc-800 rounded-r-sm z-0" />

                        {/* Cuerpo interior del mockup */}
                        <div className="relative w-full h-full bg-foreground rounded-[2.5rem] p-2">
                        <div className="relative w-full h-full bg-background rounded-[2rem] overflow-hidden flex flex-col">
                          {/* Altavoz superior */}
                          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-700 rounded-full z-30" />
                          {/* Notch */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground rounded-full z-20 flex items-center justify-end pr-2">
                            {/* Cámara frontal */}
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 ring-[1px] ring-zinc-600" />
                          </div>

                          {/* Header IG */}
                          <div className="pt-8 pb-2 px-3 flex items-center justify-between border-b border-border/40">
                            <span className="font-serif italic text-base text-foreground">Instagram</span>
                            <div className="flex items-center gap-2 text-foreground">
                              <Heart className="w-4 h-4" />
                              <PlusSquare className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Stories */}
                          <div className="flex gap-2 px-3 py-2 overflow-hidden border-b border-border/40">
                            {carouselImages.map((img, i) => (
                              <div key={i} className="flex-shrink-0 w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                                <img src={img} alt="" className={`w-full h-full rounded-full object-cover border-2 border-background ${sepiaFilter}`} />
                              </div>
                            ))}
                          </div>

                          {/* Post */}
                          <div className="flex items-center gap-2 px-3 py-2">
                            <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                              <div className="w-full h-full rounded-full bg-background flex items-center justify-center border border-background overflow-hidden">
                                <img src={albaLogo} alt="alba.capital" className="w-[80%] h-[80%] object-contain" />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-foreground flex-1">alba.capital</span>
                            <MoreHorizontal className="w-4 h-4 text-foreground" />
                          </div>

                          {/* Imagen principal — sincronizada con el carrusel de fondo */}
                          <div className="flex-1 relative overflow-hidden bg-muted">
                            {carouselImages.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="Centro Cultural"
                                loading="lazy"
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${sepiaFilter} ${activeIdx === i ? "opacity-100" : "opacity-0"}`}
                              />
                            ))}
                            {/* Indicador de carrusel */}
                            <div className="absolute top-2 right-2 bg-foreground/60 text-background text-[10px] px-2 py-0.5 rounded-full z-10">
                              {activeIdx + 1}/{carouselImages.length}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="px-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-3 text-foreground">
                                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                <Search className="w-5 h-5" />
                                <Film className="w-5 h-5" />
                              </div>
                              <Bookmark className="w-5 h-5 text-foreground" />
                            </div>
                            <p className="text-[10px] font-semibold text-foreground">100 Me gusta</p>
                            <p className="text-[10px] text-foreground leading-tight mt-0.5">
                              <span className="font-semibold">alba.capital</span> Hacemos que suceda!
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Ver los 16 comentarios</p>
                          </div>

                          {/* Bottom nav */}
                          <div className="flex items-center justify-around py-2 border-t border-border/40 text-foreground">
                            <Home className="w-4 h-4" />
                            <Search className="w-4 h-4" />
                            <Film className="w-4 h-4" />
                            <ShoppingBag className="w-4 h-4" />
                            <div className="w-4 h-4 rounded-full bg-muted" />
                          </div>

                          {/* Home indicator (barra de inicio) */}
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-foreground/70 rounded-full z-30" />
                        </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-[70vh] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="mt-8 grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-[11px] sm:text-sm md:text-base lg:text-lg font-light text-architectural mb-2 whitespace-nowrap">
                      {project.title}
                    </h4>
                    <p className="text-minimal text-muted-foreground">
                      {project.location}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2 md:text-right md:flex md:justify-end">
                    <p className="text-muted-foreground leading-relaxed md:whitespace-nowrap text-sm md:text-xs lg:text-sm">
                      {project.description}
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

export default Portfolio;
