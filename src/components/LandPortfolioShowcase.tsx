import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import landConservation from "@/assets/land-conservation.webp";
import landFlyFishing from "@/assets/land-fly-fishing.webp";
import landCorn from "@/assets/land-corn.webp";
import landSoy from "@/assets/land-soy.webp";
import landWheat from "@/assets/land-wheat.webp";
import landHunting from "@/assets/land-hunting.webp";
import landHorseFarm from "@/assets/land-horse-farm.webp";
import landLivestockSunset from "@/assets/land-livestock-sunset.webp";
import landLivestockMorning from "@/assets/land-livestock-morning.webp";
import landLivestockCattle from "@/assets/land-livestock-cattle.webp";
import landTimberland from "@/assets/land-timberland.webp";
import landCarbonCredits from "@/assets/land-carbon-credits.webp";

const images: { src: string; alt: string }[] = [
  { src: landConservation, alt: "Paisaje de conservación patagónico" },
  { src: landFlyFishing, alt: "Pesca con mosca en la Patagonia" },
  { src: landCorn, alt: "Cultivo de maíz" },
  { src: landSoy, alt: "Cultivo de soja" },
  { src: landWheat, alt: "Cosecha de trigo" },
  { src: landHunting, alt: "Coto de caza deportiva" },
  { src: landHorseFarm, alt: "Haras y centro ecuestre" },
  { src: landLivestockSunset, alt: "Ganadería al atardecer" },
  { src: landLivestockMorning, alt: "Ganadería por la mañana" },
  { src: landLivestockCattle, alt: "Ganado vacuno en el campo" },
  { src: landTimberland, alt: "Forestación y bosque productivo" },
  { src: landCarbonCredits, alt: "Tierras de conservación y créditos de carbono" },
];

/**
 * Franja de fotografías institucionales en loop continuo (marquee),
 * reutiliza la animación `carousel-scroll` ya definida en tailwind.config.ts.
 * Se duplica el array de imágenes para que el loop sea perfectamente
 * continuo (-50% de translateX = un set completo).
 */
const LandPortfolioShowcase = () => {
  const { t } = useI18n();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const track = [...images, ...images];

  return (
    <section className="border-b border-border bg-background py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-10 max-w-7xl">
          <p className="text-minimal text-muted-foreground">{t("landPortfolio.kicker")}</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-light text-architectural md:text-5xl">
            {t("landPortfolio.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("landPortfolio.description")}
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent md:w-32" />

        <div
          className={`flex w-max gap-4 md:gap-6 ${
            reducedMotion ? "" : "animate-carousel-scroll hover:[animation-play-state:paused]"
          }`}
        >
          {track.map((img, i) => (
            <div
              key={i}
              className="group relative h-64 w-44 shrink-0 overflow-hidden rounded-xl md:h-80 md:w-56"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-700 ease-smooth group-hover:scale-105"
                style={{ filter: "grayscale(100%) sepia(15%) contrast(1.05)" }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "none")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.filter = "grayscale(100%) sepia(15%) contrast(1.05)")
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandPortfolioShowcase;
