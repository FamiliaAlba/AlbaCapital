import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * PENDIENTE DE CONTENIDO: las 10 fotografías originales de este carrusel
 * (tierra-1.webp … tierra-10.webp) nunca llegaron como archivos reales en
 * el proyecto entregado — el código original solo tenía punteros al CDN
 * interno de Lovable (rutas "/__l5e/assets-v1/...", que no existen fuera
 * del hosting de Lovable, de ahí el ícono de imagen rota en producción).
 *
 * No se inventaron fotos de reemplazo. Esta sección se mantiene oculta
 * (return null más abajo) hasta que Alba Capital provea las 10 fotografías
 * reales. Para reactivarla: agregar los archivos a src/assets/, completar
 * el array `slides` con las rutas reales y sacar el `return null`.
 */
const slides: { image: string; label: string; title: string; location: string }[] = [];


const AUTOPLAY_MS = 5000;

const OpportunitiesCarousel = () => {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (hovered !== null || slides.length === 0) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [hovered]);

  const current = hovered ?? active;

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  // Sin fotografías reales cargadas: no se muestra la sección (ver nota
  // arriba). Evita el ícono de imagen rota y no publica contenido ficticio.
  if (slides.length === 0) return null;

  return (
    <section className="border-y border-border bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-minimal text-muted-foreground">DESTACADAS</p>
              <h2 className="mt-2 text-3xl md:text-5xl font-light text-architectural">
                Oportunidades activas
              </h2>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={prev}
                aria-label="Anterior"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Siguiente"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <Button asChild variant="outline" className="hidden md:inline-flex">
                <Link to="/oportunidades">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Texto institucional */}
          <div className="mb-10">
            <p className="text-minimal text-muted-foreground">INVERSIÓN EN TIERRAS</p>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">
              El equipo cuenta con una trayectoria que suma más de 1.000.000 de hectáreas en
              transacciones y ofertas en mercado Argentino. Nuestra cartera y servicios de búsqueda
              abarcan oportunidades exclusivas y fuera del mercado (<em>off-market</em>) adaptadas a
              medida: desde tierras agrícolas y forestales hasta grandes extensiones para
              conservación y propiedades rurales de prestigio.
            </p>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">
              Ofrecemos desde las tierras de cultivo más fértiles en la zona Núcleo Argentina,
              plantaciones de productos regionales en la zona de Cuyo, explotaciones de uva y
              cítricos de Mendoza, haciendas ganaderas en todo el territorio Argentino, Complejos
              Hoteleros en zona de bosques perennifolios, hasta centros ecuestres en Buenos Aires,
              fincas para pesca con mosca en la Patagonia o viñedos en Mendoza. Y cualquier otra
              opción intermedia.
            </p>
          </div>

          {/* Carrusel principal */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-[filter] duration-700"
                    style={{
                      filter:
                        hovered === i ? "none" : "grayscale(100%) sepia(30%)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-10">
                    <span className="text-minimal text-white/70">{slide.label}</span>
                    <h3 className="mt-2 text-2xl md:text-4xl font-light text-white">
                      {slide.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">{slide.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Barra de progreso */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <div
                className="h-full bg-white transition-all duration-300 ease-linear"
                style={{ width: `${((current + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Thumbnails / navegación inferior */}
          <div className="mt-6 grid grid-cols-4 gap-2 md:grid-cols-5">
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                aria-label={`Ver ${slide.title}`}
                className={`group relative overflow-hidden rounded-lg border transition-all ${
                  i === current
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <div className="aspect-[4/3]">
                  <img
                    src={slide.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{
                      filter:
                        hovered === i
                          ? "none"
                          : i === current
                          ? "grayscale(100%) sepia(30%)"
                          : "grayscale(100%)",
                    }}
                  />
                </div>
                <div
                  className={`absolute inset-0 transition-colors ${
                    i === current ? "bg-transparent" : "bg-black/40 group-hover:bg-black/20"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/oportunidades">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunitiesCarousel;
