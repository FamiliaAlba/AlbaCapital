import { useCallback, useState } from "react";
import "./ads.css";
import type { InquiryType } from "./inquiry";
import { AdvisorySection, CaseSection, ContactSection, Footer, Header, Hero, SystemsSection, VisualizationSection } from "./sections";

/**
 * Landing de ALBA DIGITAL SOLUTIONS incrustada al pie de otra página (Oportunidades).
 * Mismo contenido que la página propia: textos en content.ts y datos de demostración (ficticios) en demoData.ts.
 */
export default function AlbaEngine() {
  const [type, setType] = useState<InquiryType | "">("");

  /** Los botones de cada sección preseleccionan el tipo de consulta y llevan al formulario. */
  const goToContact = useCallback((t: InquiryType) => {
    setType(t);
    window.setTimeout(() => {
      const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("contacto")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      document.querySelector<HTMLElement>("#contacto input[name='name']")?.focus({ preventScroll: true });
    }, 0);
  }, []);

  return (
    <div className="ads-root ads-root--embedded" id="alba-engine">
      <Header topId="alba-engine" />
      <div>
        <Hero embedded />
        <SystemsSection onInquire={goToContact} />
        <VisualizationSection onInquire={goToContact} />
        <AdvisorySection onInquire={goToContact} />
        <CaseSection onInquire={goToContact} />
        <ContactSection type={type} onTypeChange={setType} />
      </div>
      <Footer />
    </div>
  );
}
