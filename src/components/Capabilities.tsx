import { useEffect, useState } from "react";
import catDesarrollos from "@/assets/cat-desarrollos.webp";
import catRentaResidencial from "@/assets/cat-renta-residencial.webp";
import catSueloUrbano from "@/assets/cat-suelo-urbano.webp";
import catLoteos from "@/assets/cat-loteos.webp";
import catRentaComercial from "@/assets/cat-renta-comercial.webp";
import catProductivos from "@/assets/cat-productivos.webp";
import catTokenizacion from "@/assets/cat-tokenizacion.webp";
import catTuristico from "@/assets/cat-turistico.webp";
import { cn } from "@/lib/utils";

const REGIONS = "SAN LUIS / CÓRDOBA / BUENOS AIRES / LA PAMPA / RÍO NEGRO / NEUQUÉN / MENDOZA / SAN JUAN / SANTA FE / CHUBUT";

type Tab = {
  id: string;
  title: string;
  kicker: string;
  heading: string;
  paragraphs: string[];
  items?: string[];
};

const tabs: Tab[] = [
  {
    id: "inversion",
    title: "INVERSIÓN EN ACTIVOS",
    kicker: "CONFIDENCIALIDAD",
    heading: "INVERSIÓN EN ACTIVOS",
    paragraphs: [
      "Track record del equipo en operaciones y estructuraciones sobre el mercado inmobiliario argentino. Nuestro portfolio y servicio de originación incluye activos off-market y exclusivos, hechos a medida: desarrollos en pozo, suelo urbano estratégico, renta residencial y comercial, loteos con infraestructura y activos productivos de escala media.",
      "Desde un edificio en pozo en Córdoba capital, un loteo con servicios en San Luis, unidades de renta en Buenos Aires, un galpón logístico sobre ruta, campos productivos en La Pampa, un desarrollo turístico en Río Negro o Neuquén, hasta un activo tokenizado con respaldo real. Y todo lo que hay en el medio.",
    ],
  },
  {
    id: "gestion",
    title: "GESTIÓN LLAVE EN MANO",
    kicker: "REPORTING",
    heading: "GESTIÓN LLAVE EN MANO",
    paragraphs: [
      "Gestionamos el activo de punta a punta para que el inversor participe sin operar: obra, administración, comercialización y salida. Un único interlocutor responsable del resultado del proyecto.",
    ],
    items: [
      "Dirección de obra y avance de hitos",
      "Administración y comercialización",
      "Contabilidad y reporting trimestral",
      "Estructura legal e impositiva",
    ],
  },
  {
    id: "valuaciones",
    title: "VALUACIONES",
    kicker: "PRECISIÓN",
    heading: "VALUACIONES",
    paragraphs: [
      "Valuamos cada activo con criterio técnico y de mercado antes de estructurarlo. Nuestro equipo entrega información verificable y actualizada para determinar un valor sugerido dentro del contexto real de cada plaza.",
    ],
    items: [
      "Desarrollos residenciales",
      "Renta comercial y logística",
      "Suelo urbano y loteos",
      "Activos productivos",
      "Activos tokenizados",
    ],
  },
  {
    id: "control",
    title: "CONTROL Y REPORTE",
    kicker: "BRAZO DEL INVERSOR",
    heading: "CONTROL Y REPORTE",
    paragraphs: [
      "Actuando por cuenta y orden de inversores que no residen en la plaza del activo, controlamos las operaciones bajo gestión y reportamos con observaciones actualizadas y soluciones sugeridas.",
    ],
    items: [
      "Activos en renta: negociación, control de infraestructura y mantenimiento",
      "Activos bajo gestión: asesoramiento técnico, económico, financiero, legal e impositivo",
      "Representación del inversor en la toma de decisiones",
    ],
  },
];

const categories = [
  { label: "DESARROLLOS", img: catDesarrollos },
  { label: "RENTA RESIDENCIAL", img: catRentaResidencial },
  { label: "SUELO URBANO", img: catSueloUrbano },
  { label: "LOTEOS", img: catLoteos },
  { label: "RENTA COMERCIAL", img: catRentaComercial },
  { label: "ACTIVOS PRODUCTIVOS", img: catProductivos },
  { label: "TOKENIZACIÓN", img: catTokenizacion },
  { label: "TURÍSTICO", img: catTuristico },
];

const Capabilities = () => {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % tabs.length), 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="capacidades" className="border-y border-border bg-background">
      {/* Barra de pilares */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={cn(
                  "border-b border-r border-border px-4 py-6 text-left transition-colors md:border-b-0 last:border-r-0",
                  i === active ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "block text-sm md:text-base font-light tracking-tight",
                    i === active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t.title}
                </span>
                <span className="mt-1 block text-minimal text-muted-foreground">{t.kicker}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Regiones */}
      <div className="border-b border-border py-4">
        <p className="text-minimal text-center text-muted-foreground">{REGIONS}</p>
      </div>

      {/* Carrusel automático de categorías */}
      <div className="group overflow-hidden border-b border-border bg-muted/20 py-6">
        <div className="flex w-max animate-carousel-scroll gap-4 px-4 group-hover:[animation-play-state:paused]">
          {[...categories, ...categories].map((c, i) => (
            <div
              key={`${c.label}-${i}`}
              className="relative h-56 w-64 shrink-0 overflow-hidden rounded-xl border border-border md:h-72 md:w-80"
            >
              <img
                src={c.img}
                alt={`Alba Capital — ${c.label.toLowerCase()}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                style={{ filter: "grayscale(100%) sepia(30%)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="text-minimal absolute bottom-4 left-4 text-white">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del pilar activo */}
      <div className="container mx-auto px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <h2 className="text-4xl md:text-6xl font-light text-architectural">
            {current.heading}
          </h2>
          <div className="space-y-6">
            {current.paragraphs.map((p) => (
              <p key={p} className="text-lg text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
            {current.items && (
              <ul className="space-y-3 border-t border-border pt-6">
                {current.items.map((it) => (
                  <li key={it} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-foreground/50" />
                    {it}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Filosofía */}
      <div className="container mx-auto px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl rounded-2xl border border-border bg-muted/30 p-8 md:p-14">
          <p className="text-minimal text-muted-foreground">FILOSOFÍA DE ALBA CAPITAL</p>
          <h3 className="mt-3 text-3xl md:text-4xl font-light text-architectural">La milla extra</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <p className="text-muted-foreground leading-relaxed">
              Las empresas rentables del sector privado generan beneficios sostenidos, directos e
              indirectos, sobre la comunidad donde operan. Cada desarrollo que estructuramos mueve
              obra, empleo, proveedores locales e infraestructura urbana real.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Por eso entendemos que no solo aportamos generando trabajo y rentabilidad sostenible:
              también hacemos una diferencia acompañando la formación y el desarrollo de las
              comunidades donde invertimos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Creemos en el respaldo físico, la trazabilidad y el retorno ajustado al riesgo. Cada
              peso que entra a un vehículo de Alba Capital tiene un activo real detrás y un plan de
              salida escrito desde el día uno.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Si una porción de nuestro resultado puede sostener programas que mejoran el entorno
              donde operamos, entonces nuestra rentabilidad nos ayuda a caminar la milla extra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
