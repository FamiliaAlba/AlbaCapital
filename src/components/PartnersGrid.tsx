import { partners } from "@/data/partners";

/**
 * Grilla de logos con forma, fondo y marco uniformes. En escritorio ocupa una
 * columna igual a la de un agente (mismo ancho y alto que su foto 3:4), para
 * que ambas queden simétricas. En gris por defecto, a color al pasar el mouse.
 */
/**
 * Si el último logo queda solo en su fila (según las columnas de cada ancho de
 * pantalla), se centra para que la grilla siga siendo simétrica.
 */
const centerLast = (i: number): string =>
  i === partners.length - 1
    ? [
        partners.length % 2 === 1 ? "col-start-4" : "",
        partners.length % 4 === 1 ? "sm:col-start-5" : "sm:col-start-auto",
        partners.length % 3 === 1 ? "lg:col-start-5" : "lg:col-start-auto",
      ].join(" ")
    : "";

const PartnersGrid = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <ul className="grid grid-cols-12 gap-2 lg:aspect-[3/4] lg:auto-rows-fr">
      {partners.map((p, i) => (
        <li
          key={p.name}
          className={`group col-span-6 aspect-[3/2] overflow-hidden rounded-xl border border-border/60 bg-white sm:col-span-3 lg:col-span-4 lg:aspect-auto ${centerLast(i)}`}
        >
          <img
            src={p.logo}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain p-1.5 grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
          />
        </li>
      ))}
    </ul>
    {/* Mismo estilo que el nombre y el cargo debajo de la foto de cada agente */}
    <div className="mt-4">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="text-minimal text-muted-foreground mt-1">{subtitle}</p>
    </div>
  </div>
);

export default PartnersGrid;
