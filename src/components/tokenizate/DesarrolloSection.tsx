import { Link } from "react-router-dom";
import { ArrowRight, Building2, Calculator, ClipboardList, FileSignature, Hotel, LineChart, ParkingSquare, Home, Store, Layers, Wrench } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const steps = [
  { icon: ClipboardList, title: "Presentás el desarrollo", text: "Describís el terreno, el proyecto, el presupuesto, el cronograma y qué querés financiar." },
  { icon: Calculator, title: "Evaluamos el negocio", text: "Analizamos titularidad, permisos, presupuesto, mercado, operador y la solidez de las proyecciones." },
  { icon: FileSignature, title: "Definimos la estructura", text: "Si corresponde, se evalúa el vehículo jurídico, el fiduciario, los derechos de los participantes y el encuadre normativo." },
  { icon: Wrench, title: "Obra y operación", text: "El proyecto contempla seguimiento de obra, del uso de fondos y de la operación del activo." },
  { icon: LineChart, title: "Resultados según contrato", text: "La renta y la salida de los participantes se rigen por lo que establezcan los instrumentos de cada proyecto aprobado." },
];

const kinds = [
  { icon: Hotel, title: "Hoteles y condo-hoteles", text: "Habitaciones o fracciones con operación a cargo de un gerenciador o una franquicia." },
  { icon: Home, title: "Residenciales", text: "Edificios y complejos de vivienda con ingresos por alquiler o venta." },
  { icon: ParkingSquare, title: "Cocheras y estacionamientos", text: "Unidades con renta compartida administrada por un operador." },
  { icon: Store, title: "Comerciales y oficinas", text: "Locales y oficinas con contratos de alquiler." },
  { icon: Layers, title: "Proyectos mixtos", text: "Complejos que combinan usos, evaluados por unidad de negocio." },
  { icon: Building2, title: "Otros desarrollos", text: "Cada caso se analiza antes de definir si corresponde estructurarlo." },
];

const checks = [
  "Titularidad del terreno, cargas y zonificación.",
  "Permisos de obra y estado del proyecto.",
  "Presupuesto, cronograma y riesgo de sobrecostos o demoras.",
  "Quién opera el activo, con qué contrato y por cuánto tiempo.",
  "Estudio de mercado y supuestos de ocupación, tarifas o alquileres.",
  "Vehículo jurídico y administración de los fondos (por ejemplo, un fideicomiso con fiduciario).",
  "Encuadre regulatorio: oferta pública u oferta privada, participantes y autorizaciones.",
  "Impuestos, costos de la estructura y forma de salida de los participantes.",
];

const faqs = [
  { q: "¿Alba Capital desarrolla u opera el proyecto?", a: "No. El desarrollo y la operación quedan a cargo del desarrollador y de su operador. Alba Capital evalúa, estructura si corresponde y hace seguimiento." },
  { q: "¿Qué recibirían quienes participen?", a: "Los derechos que establezcan los instrumentos jurídicos de cada proyecto aprobado, por ejemplo unidades o fracciones con renta compartida. Una participación digital no implica automáticamente propiedad directa de una parte física del inmueble." },
  { q: "¿La renta está garantizada?", a: "No. Las proyecciones son estimaciones basadas en supuestos de ocupación, tarifas o alquileres, y pueden no cumplirse. Ni la renta ni la devolución del capital están garantizadas." },
  { q: "¿Se puede vender la participación antes de tiempo?", a: "No está garantizado. La forma de salida o reventa debe definirse antes de cualquier operación y depende de cada estructura." },
  { q: "¿Se reciben fondos de inversores en el sitio?", a: "No. Esta sección solo recibe postulaciones y pedidos de información. Cualquier eventual operación requeriría documentación específica, los participantes adecuados y las autorizaciones que correspondan." },
  { q: "¿Tiene costo postular?", a: "Enviar la postulación no tiene costo. Cualquier honorario posterior se informa y acuerda por escrito antes de devengarse." },
  { q: "¿Postular garantiza financiación?", a: "No. Postular inicia una evaluación. Alba Capital no está obligada a estructurar ni ofrecer el proyecto, y solo si hay acuerdo definitivo se firma un contrato." },
];

const DesarrolloSection = () => (
  <section id="desarrollos-fraccionados" className="scroll-mt-24 bg-[#F3F5F8] py-16 md:py-24">
    <div className="container mx-auto px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]">Desarrollos fraccionados · Inmuebles y hoteles</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#0B2545] md:text-4xl">Un desarrollo puede financiarse con muchas participaciones más chicas.</h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground">
          ¿Desarrollás o gerenciás un hotel, un complejo residencial, cocheras u oficinas? Presentá tu proyecto. En Alba Capital evaluamos si existe una estructura adecuada para financiarlo con participaciones de menor importe, con derechos definidos por contrato y un operador que genere la renta.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          Cada propuesta debe identificar el terreno, el presupuesto, el cronograma, el operador, cómo se genera la renta y las condiciones de participación.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/tokenizate/postular?modalidad=desarrollos-fraccionados" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Postular mi desarrollo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#desarrollos-como-funciona" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-6 py-3.5 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Conocer cómo funciona
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">La postulación inicia una evaluación. No garantiza financiación ni emisión de tokens.</p>

        <div id="desarrollos-como-funciona" className="scroll-mt-24 pt-16">
          <h3 className="text-xl font-semibold text-[#0B2545]">Cómo funciona</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Es el recorrido previsto de un proyecto que resulte aprobado. Alba Capital no tiene emisiones activas en esta modalidad.</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-border bg-white p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2545] text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Paso {i + 1}</p>
                <h4 className="mt-1 text-base font-semibold text-[#0B2545]">{title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-16">
          <h3 className="text-xl font-semibold text-[#0B2545]">Qué tipos de desarrollo podemos evaluar</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kinds.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-border bg-white p-5">
                <Icon className="h-6 w-6 text-[#5B6B80]" aria-hidden="true" />
                <p className="mt-3 text-base font-semibold text-[#0B2545]">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border-l-4 border-[#5B6B80] bg-white px-4 py-3 text-sm text-foreground">Ejemplos de aplicación sujetos a evaluación. No son oportunidades de inversión disponibles.</p>
        </div>

        <div className="mt-16 rounded-2xl bg-[#0B2545] p-6 text-white md:p-8">
          <h3 className="text-xl font-semibold">Lo que debe estar definido antes de cualquier operación</h3>
          <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
            {checks.map((c) => <li key={c} className="flex gap-3 text-sm leading-relaxed text-[#E4E9F0]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C3CCD9]" aria-hidden="true" />{c}</li>)}
          </ul>
          <p className="mt-4 text-sm text-[#C3CCD9]">Alba Capital no actúa como fiduciario ni opera el activo. Las proyecciones son estimaciones: ni la renta ni la posibilidad de vender anticipadamente una participación están garantizadas.</p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]">Preguntas frecuentes</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#0B2545]">Desarrollos fraccionados</h3>
            <p className="mt-3 text-sm text-muted-foreground">Más condiciones en las <Link to="/tokenizate/bases-y-condiciones" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>.</p>
          </div>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`d${i}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  </section>
);

export default DesarrolloSection;
