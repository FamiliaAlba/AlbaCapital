import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, ClipboardCheck, FileSearch, Layers, ScrollText, Scale, ShieldAlert, ShieldCheck, Gavel, Search, FileCheck2, Landmark, FolderLock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import InterestForm from "@/components/tokenizate/InterestForm";
import PymeSection from "@/components/tokenizate/PymeSection";
import CamposSection from "@/components/tokenizate/CamposSection";
import DesarrolloSection from "@/components/tokenizate/DesarrolloSection";
import { PYME_ENABLED } from "@/lib/tokenizate/backend";
import { ASSET_ICONS, HeroDiagram, ProjectCardMock } from "@/components/tokenizate/TkIllustrations";

const TITLE = "Tokenizate | Alba Capital";
const DESCRIPTION = "Conocé cómo funciona la inversión tokenizada o postulá tu activo para que Alba Capital evalúe sus posibilidades de financiación.";

const concepts = [
  { icon: Layers, title: "Participación fraccionada", text: "Permite dividir una inversión en unidades, con mínimos definidos por cada emisión." },
  { icon: FileSearch, title: "Activos identificables", text: "Información sobre el proyecto y el origen de sus ingresos." },
  { icon: ScrollText, title: "Derechos documentados", text: "Condiciones y obligaciones establecidas antes de invertir." },
  { icon: BarChart3, title: "Seguimiento", text: "Reportes sobre evolución, resultados y acontecimientos relevantes." },
];

const investorSteps = [
  "Conocer el proyecto",
  "Revisar documentación y condiciones",
  "Completar los requisitos correspondientes",
  "Participar mediante el canal habilitado",
  "Consultar reportes",
];

const ownerSteps = [
  { icon: ClipboardCheck, title: "Postulación", text: "Cargás los datos básicos del activo. Podés guardar un borrador." },
  { icon: Search, title: "Revisión preliminar", text: "Alba Capital hace una primera lectura con pocos datos." },
  { icon: FileCheck2, title: "Documentación", text: "Solo si avanza, se pide documentación, a través de tu carpeta privada." },
  { icon: Landmark, title: "Análisis", text: "Evaluación técnica, económica y jurídica del activo y del negocio." },
  { icon: Gavel, title: "Estructuración y acuerdo", text: "Si el análisis es favorable, se diseñan las herramientas jurídicas y, si hay acuerdo, se firma un contrato." },
];

const faqs = [
  { q: "¿Qué es un token?", a: "Un token puede representar digitalmente derechos definidos en un instrumento jurídico vinculado a un activo o proyecto. Esos derechos pueden consistir en cobrar una deuda, participar de resultados u otras modalidades, según la estructura de cada inversión." },
  { q: "¿Voy a ser propietario de una parte del bien?", a: "No automáticamente. Adquirir un token no implica recibir una escritura ni ser propietario directo de una parte física del bien: lo que recibís son los derechos que defina el instrumento jurídico de cada inversión." },
  { q: "¿Puedo invertir hoy?", a: "Todavía no hay oportunidades habilitadas en esta sección. Estamos evaluando nuevos proyectos. Si registrás tu interés, te avisamos cuando haya novedades. Registrar interés no es una orden de inversión." },
  { q: "¿La rentabilidad está garantizada? ¿Puedo vender cuando quiera?", a: "No. Cada proyecto tiene condiciones, costos y riesgos propios. La rentabilidad y la posibilidad de vender anticipadamente la participación no están garantizadas." },
  { q: "Si postulo mi activo, ¿se tokeniza?", a: "No. Postular es pedirle a Alba Capital que lo evalúe. Ningún activo es tokenizable por el solo hecho de postularse y Alba Capital no está obligada a estructurarlo ni ofrecerlo. Primero se analiza y aprueba; luego, si corresponde, se generan las herramientas jurídicas y, solo si hay acuerdo definitivo, se firma un contrato con el propietario o desarrollador." },
  { q: "¿Tiene costo postular?", a: "Enviar la postulación no tiene costo. Cualquier honorario o gasto posterior se informa y acuerda por escrito antes de devengarse." },
  { q: "¿Cómo cuidan mi documentación?", a: "Se guarda en un espacio privado. Solo accedés vos a tu expediente con tu clave personal y el equipo autorizado de Alba Capital. No se envía a servicios de inteligencia artificial externos." },
];

const legalPoints = [
  { icon: Scale, text: "Un token necesita un derecho jurídico real detrás: sin instrumento y encuadre normativo, no hay inversión tokenizada." },
  { icon: ShieldCheck, text: "Cada eventual oferta requerirá revisión previa del instrumento, los destinatarios, la publicidad, los participantes y las autorizaciones." },
  { icon: FolderLock, text: "Registrar interés no es una oferta ni una suscripción, y esta página no recibe dinero ni conecta billeteras." },
];

const setMeta = (sel: string, attr: string, value: string) => {
  const el = document.head.querySelector<HTMLMetaElement>(sel);
  if (el) el.setAttribute(attr, value);
};

const Tokenizate = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = TITLE;
    const old = {
      desc: document.head.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      ogt: document.head.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "",
      ogd: document.head.querySelector('meta[property="og:description"]')?.getAttribute("content") ?? "",
    };
    setMeta('meta[name="description"]', "content", DESCRIPTION);
    setMeta('meta[property="og:title"]', "content", TITLE);
    setMeta('meta[property="og:description"]', "content", DESCRIPTION);
    return () => {
      document.title = prev;
      setMeta('meta[name="description"]', "content", old.desc);
      setMeta('meta[property="og:title"]', "content", old.ogt);
      setMeta('meta[property="og:description"]', "content", old.ogd);
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, []);

  const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-6 py-3.5 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const eyebrow = "text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]";

  return (
    <div className="tk-scope min-h-screen pt-14 md:pt-16">
      {/* Encabezado */}
      <section className="bg-gradient-to-b from-[#EEF1F5] to-white">
        <div className="container mx-auto px-6 py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className={eyebrow}>Tokenizate | Alba Capital</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#0B2545] md:text-5xl">Activos reales. Nuevas formas de participar y financiar.</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Conocé cómo funciona la inversión tokenizada o postulá tu activo para que Alba Capital evalúe sus posibilidades de financiación.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#invertir" className={btnPrimary}>Quiero conocer cómo invertir <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="#postular" className={btnSecondary}>Quiero postular mi activo</a>
                {PYME_ENABLED && <a href="#produccion-pyme" className={btnSecondary}>Quiero financiar mi producción</a>}
                {PYME_ENABLED && <a href="#campos-industrias" className={btnSecondary}>Quiero postular un campo o industria</a>}
                {PYME_ENABLED && <a href="#desarrollos-fraccionados" className={btnSecondary}>Quiero financiar un desarrollo</a>}
              </div>
              <p className="mt-6 max-w-xl text-sm text-muted-foreground">Alba Capital conecta activos, proyectos e inversores mediante análisis profesional y estructuras adecuadas para cada oportunidad.</p>
            </div>
            <HeroDiagram />
          </div>
        </div>
      </section>

      {/* Cuerpo A: inversores */}
      <section id="invertir" className="scroll-mt-24 bg-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <p className={eyebrow}>Para quienes quieren participar</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0B2545] md:text-4xl">Conocé la inversión tokenizada</h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground">
              Un token puede representar digitalmente derechos definidos en un instrumento jurídico vinculado a un activo o proyecto. Esos derechos pueden consistir en cobrar una deuda, participar de resultados u otras modalidades, según la estructura de cada inversión.
            </p>
            <p className="mt-3 max-w-3xl rounded-lg border-l-4 border-[#5B6B80] bg-[#F3F5F8] px-4 py-3 text-foreground">
              Adquirir un token no implica automáticamente recibir una escritura o ser propietario directo de una parte física del bien.
            </p>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {concepts.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl border border-border bg-white p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2545] text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 text-lg font-semibold text-[#0B2545]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>

            <h3 className="mt-16 text-xl font-semibold text-[#0B2545]">Tipos de activos que podemos evaluar</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ASSET_ICONS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-xl bg-[#F3F5F8] p-4">
                  <Icon className="h-6 w-6 text-[#5B6B80]" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-[#0B2545]">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>

            <h3 className="mt-16 text-xl font-semibold text-[#0B2545]">Cómo es el recorrido</h3>
            <ol className="mt-5 grid gap-3 md:grid-cols-5">
              {investorSteps.map((s, i) => (
                <li key={s} className="relative rounded-xl border border-border bg-white p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2545] text-sm font-semibold text-white" aria-hidden="true">{i + 1}</span>
                  <p className="mt-3 text-sm font-medium text-foreground"><span className="sr-only">Paso {i + 1}: </span>{s}</p>
                </li>
              ))}
            </ol>

            <div role="note" className="mt-10 flex gap-3 rounded-xl border border-[#B9C3D1] bg-[#F3F5F8] p-5">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#0B2545]" aria-hidden="true" />
              <p className="text-foreground"><strong>Cada proyecto tiene condiciones, costos y riesgos propios.</strong> La rentabilidad y la posibilidad de vender anticipadamente la participación no están garantizadas.</p>
            </div>

            <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <h3 className="text-xl font-semibold text-[#0B2545]">Oportunidades disponibles</h3>
                <div className="mt-4 rounded-2xl border border-dashed border-[#9AA7B8] bg-[#F3F5F8] p-6">
                  <p className="text-lg font-semibold text-[#0B2545]">Estamos evaluando nuevos proyectos.</p>
                  <p className="mt-1.5 text-muted-foreground">Registrá tu interés para recibir novedades.</p>
                </div>
                <div className="mt-6"><ProjectCardMock /></div>
                <p className="mt-4 text-sm text-muted-foreground">
                  ¿Buscás inversiones inmobiliarias ya estructuradas? Mirá las <Link to="/oportunidades" className="font-medium text-[#0B2545] underline">oportunidades de Alba Capital</Link>.
                </p>
              </div>
              <InterestForm />
            </div>
          </div>
        </div>
      </section>

      {PYME_ENABLED && <PymeSection />}
      {PYME_ENABLED && <CamposSection />}
      {PYME_ENABLED && <DesarrolloSection />}

      {/* Cuerpo B: propietarios */}
      <section id="postular" className="scroll-mt-24 bg-[#0B2545] py-16 text-white md:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C3CCD9]">Para propietarios y desarrolladores</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Tu activo puede impulsar su próxima etapa.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#E4E9F0]">
              Presentá tu bien de capital o proyecto. Analizamos su documentación, capacidad de generar ingresos y alternativas de estructuración para determinar si la tokenización resulta conveniente.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {["Evaluación del activo y del negocio", "Revisión técnica, económica y jurídica", "Definición de necesidades y destino de los fondos", "Análisis de alternativas de financiación", "Seguimiento de la postulación"].map((t) => (
                <li key={t} className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm font-medium">{t}</li>
              ))}
            </ul>

            <ol className="mt-12 grid gap-4 md:grid-cols-5">
              {ownerSteps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="rounded-xl bg-white p-5 text-foreground">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B6B80]"><Icon className="h-4 w-4" aria-hidden="true" /> Etapa {i + 1}</span>
                  <h3 className="mt-2 text-base font-semibold text-[#0B2545]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>

            <div role="note" className="mt-10 rounded-xl border border-white/25 bg-white/10 p-5 leading-relaxed">
              <p className="font-semibold">Qué significa postular</p>
              <p className="mt-1.5 text-[#E4E9F0]">
                Postular no vuelve a tu activo tokenizable ni obliga a Alba Capital a posicionarlo con estas condiciones. Todo debe ser analizado y aprobado primero por Alba Capital; luego se generan las herramientas jurídicas y, solo si se llega a un acuerdo definitivo, se firma un contrato entre Alba Capital y el propietario o desarrollador. Presentar el proyecto no garantiza aprobación, financiación ni emisión de tokens.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/tokenizate/postular" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#E4E9F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2545]">
                Iniciar postulación <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/tokenizate/postular?modo=consultar" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2545]">
                Consultar mi expediente
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marco legal en breve + FAQ */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <div>
              <p className={eyebrow}>Marco legal, en breve</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#0B2545] md:text-3xl">Claridad antes de invertir o postular</h2>
              <ul className="mt-6 space-y-4">
                {legalPoints.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#5B6B80]" aria-hidden="true" /><span className="text-foreground">{text}</span></li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Leé la <Link to="/tokenizate/privacidad" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link> y las <Link to="/tokenizate/bases-y-condiciones" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>.
              </p>
            </div>
            <div>
              <p className={eyebrow}>Preguntas frecuentes</p>
              <Accordion type="single" collapsible className="mt-4">
                {faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`f${i}`}>
                    <AccordionTrigger className="text-left text-base font-medium text-foreground">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tokenizate;
