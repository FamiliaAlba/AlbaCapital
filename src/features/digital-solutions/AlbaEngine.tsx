import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Compass, Eye } from "lucide-react";
import "./ads.css";
import { BRAND, FOOTER, HERO, RESUMEN, VISUALIZATION } from "./content";
import { MasterplanViewer } from "./MasterplanViewer";
import { HeroBackdrop, HeroSplash } from "./sections";

const PILLAR_ICONS = { sistemas: Boxes, visualizacion: Eye, desarrollo: Compass } as const;

/**
 * ALBA ENGINE dentro de Alba Capital (versión resumida): portada compacta, tres líneas de trabajo,
 * plano interactivo y un solo botón hacia el contacto que ya tiene el sitio.
 */
export default function AlbaEngine() {
  return (
    <div className="ads-root ads-root--embedded" id="alba-engine">
      <section className="ads-hero ads-hero--resumen" aria-labelledby="ads-h1">
        <HeroBackdrop />
        <HeroSplash whenVisible />
        <div className="ads-wrap ads-hero__grid">
          <div>
            <p className="ads-eyebrow ads-rise">{BRAND}</p>
            {/* Incrustada en otra página (que ya tiene su h1), este título se anuncia como nivel 2. */}
            <h1 id="ads-h1" className="ads-rise ads-rise--2" style={{ marginTop: 20 }} role="heading" aria-level={2}>{HERO.title}</h1>
            <p className="ads-hero__lead ads-rise ads-rise--3">{HERO.lead}.</p>
            <ul className="ads-hero__chips ads-rise ads-rise--3" aria-label="Qué hacemos">
              {HERO.chips.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="ads-section ads-section--paper" aria-labelledby="ads-hacemos-h">
        <div className="ads-wrap">
          <p className="ads-eyebrow">{RESUMEN.eyebrow}</p>
          <h2 id="ads-hacemos-h" className="ads-sr">{RESUMEN.eyebrow}</h2>
          <div className="ads-pillars" role="list">
            {RESUMEN.pillars.map((p) => {
              const Icon = PILLAR_ICONS[p.key as keyof typeof PILLAR_ICONS];
              return (
                <article className="ads-pillar" role="listitem" key={p.key}>
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  <h3>{p.title}</h3>
                  <p className="ads-pillar__lead">{p.lead}</p>
                  <p>{p.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ads-section ads-section--dark" aria-labelledby="ads-viz-h">
        <div className="ads-wrap">
          <p className="ads-eyebrow">{VISUALIZATION.eyebrow}</p>
          <h2 id="ads-viz-h" className="ads-title" style={{ marginTop: 16 }}>{VISUALIZATION.title}</h2>
          <div className="ads-viz">
            <div>
              <p className="ads-lead">{VISUALIZATION.lead}</p>
              <p className="ads-note">{RESUMEN.note}</p>
              <div style={{ marginTop: 28 }}>
                <Link className="ads-btn ads-btn--primary" to={RESUMEN.ctaTo}>
                  {RESUMEN.cta} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <p className="ads-fine">{FOOTER.line}</p>
            </div>
            <MasterplanViewer title={VISUALIZATION.mpTitle} hint={VISUALIZATION.mpHint} />
          </div>
        </div>
      </section>
    </div>
  );
}
