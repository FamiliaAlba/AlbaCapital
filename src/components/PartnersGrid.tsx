import { partners } from "@/data/partners";

/** Grilla de logos con forma, fondo y marco uniformes. En gris por defecto, a color al pasar el mouse. */
const PartnersGrid = ({ label }: { label: string }) => (
  <div>
    <p className="text-minimal text-muted-foreground mb-4">{label}</p>
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
      {partners.map((p) => (
        <li
          key={p.name}
          className="group aspect-[3/2] overflow-hidden rounded-xl border border-border/60 bg-white"
        >
          <img
            src={p.logo}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  </div>
);

export default PartnersGrid;
