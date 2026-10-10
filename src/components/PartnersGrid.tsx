import { partners } from "@/data/partners";

/**
 * Grilla de logos con forma, fondo y marco uniformes. En escritorio ocupa una
 * columna igual a la de un agente (mismo ancho y alto que su foto 3:4), para
 * que ambas queden simétricas. En gris por defecto, a color al pasar el mouse.
 */
const PartnersGrid = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:aspect-[3/4] lg:grid-cols-2 lg:grid-rows-4">
      {partners.map((p) => (
        <li
          key={p.name}
          className="group aspect-[3/2] overflow-hidden rounded-xl border border-border/60 bg-white lg:aspect-auto"
        >
          <img
            src={p.logo}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
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
