import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Calculator, Coffee, Droplets, Factory, FileSignature, Flag, Package, PackageOpen, Shirt, Wine, ListChecks, ClipboardCheck, Truck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const steps = [
  { icon: PackageOpen, title: "Presentás tu producción", text: "Identificás el producto, el lote, el presupuesto y el destino de los fondos." },
  { icon: Calculator, title: "Evaluamos el negocio", text: "Analizamos capacidad productiva, costos, plazos, ventas previstas y documentación." },
  { icon: FileSignature, title: "Definimos la estructura", text: "Si corresponde, se establecen contratos, derechos, responsables y mecanismos de administración." },
  { icon: ListChecks, title: "Se ejecuta y se informa", text: "El proyecto contempla hitos productivos, seguimiento del uso de fondos e información sobre su evolución." },
  { icon: Flag, title: "Se cierra el ciclo", text: "La entrega de productos o la liquidación económica se realiza según el contrato y los resultados efectivos." },
];

const sectors = [
  { icon: Coffee, title: "Yerba, té y café", text: "Compra de materia prima, estacionamiento y envasado de una partida." },
  { icon: Wine, title: "Vinos, pasas y otros regionales", text: "Cosecha, secado, elaboración o estacionamiento de un lote." },
  { icon: Droplets, title: "Aceites, miel y alimentos envasados", text: "Materia prima, elaboración y envasado de una producción." },
  { icon: Shirt, title: "Textiles e indumentaria", text: "Telas, insumos y confección de una colección u orden." },
  { icon: Package, title: "Envases y manufacturas", text: "Materia prima, matrices y producción de una orden de fabricación." },
  { icon: Factory, title: "Otros productos con ciclos verificables", text: "Cualquier etapa con costos, plazos y ventas identificables." },
];

const faqs = [
  { q: "¿Quién puede postular?", a: "PyMEs, fabricantes, productores y cooperativas con un producto concreto, capacidad para producirlo (propia o a través de un tercero) y un mercado al que venderlo. Cada propuesta se evalúa de manera individual." },
  { q: "¿Es lo mismo postular que obtener financiación?", a: "No. Postular inicia una evaluación. No garantiza financiación ni emisión de tokens, y Alba Capital no está obligada a estructurar ni ofrecer ninguna propuesta." },
  { q: "¿Qué documentación necesito?", a: "No hace falta tener una carpeta completa para empezar. Podés cargar lo que tengas (presupuestos, antecedentes de ventas, pedidos, habilitaciones, fotografías) e indicar “todavía no lo tengo” en lo que falte. La documentación es privada y solo la ve el equipo autorizado." },
  { q: "¿Tiene costo postular?", a: "Enviar la postulación no tiene costo. Cualquier honorario posterior de evaluación, estructuración o seguimiento se informa y acuerda por escrito antes de devengarse." },
  { q: "¿Cuánto tarda la respuesta?", a: "No fijamos plazos: dependen de la documentación disponible y de la complejidad de cada caso. Podés consultar el estado de tu expediente en cualquier momento con tu clave." },
  { q: "¿Qué derechos tendrían quienes participen?", a: "Los que defina el contrato de cada proyecto aprobado: por ejemplo, una entrega futura de producto o derechos económicos vinculados al ciclo productivo. No implican acciones de la empresa ni propiedad directa sobre la mercadería, salvo que un contrato lo establezca expresamente." },
  { q: "¿Cualquier lote es viable?", a: "No. Los costos de estructuración pesan más en lotes pequeños. Según el caso, podemos recomendar un esquema repetible por productor, una alternativa de preventa o posponer el proyecto." },
  { q: "¿Sirve si fabrico a través de un tercero?", a: "Sí, se contempla la producción propia, tercerizada o a fasón, siempre identificando a los responsables y presentando la documentación que respalde la relación." },
];

const PymeSection = () => (
  <section id="produccion-pyme" className="scroll-mt-24 bg-[#F3F5F8] py-16 md:py-24">
    <div className="container mx-auto px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]">Producción PyME · Financiación por lotes</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#0B2545] md:text-4xl">Tu próxima producción puede empezar con una nueva forma de financiarse.</h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground">
          ¿Tenés un producto, capacidad para producirlo y un mercado al que venderlo? Presentá tu lote, partida u orden de fabricación. En Alba Capital evaluamos cómo estructurar su financiación mediante participaciones digitales vinculadas a un proyecto productivo concreto.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          Materia prima, elaboración, estacionamiento, envasado o preparación de pedidos: cada propuesta debe identificar el destino de los fondos, su ciclo comercial y las condiciones de participación.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/tokenizate/postular?modalidad=produccion-pyme" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Postular mi producción <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#pyme-como-funciona" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-6 py-3.5 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Conocer cómo funciona
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">La postulación inicia una evaluación. No garantiza financiación ni emisión de tokens.</p>

        <div id="pyme-como-funciona" className="scroll-mt-24 pt-16">
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
          <h3 className="text-xl font-semibold text-[#0B2545]">Productos y sectores</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-border bg-white p-5">
                <Icon className="h-6 w-6 text-[#5B6B80]" aria-hidden="true" />
                <p className="mt-3 text-base font-semibold text-[#0B2545]">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">Etapa que podría necesitar financiación:</span> {text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border-l-4 border-[#5B6B80] bg-white px-4 py-3 text-sm text-foreground">
            Ejemplos de aplicación sujetos a evaluación. No son oportunidades de inversión disponibles.
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground"><Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Se contempla la producción propia y la tercerizada o a fasón, siempre identificando responsables y documentación.</p>
        </div>

        <div className="pt-16">
          <h3 className="text-xl font-semibold text-[#0B2545]">Dos modalidades posibles, sujetas a análisis</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Modalidad A</p>
              <h4 className="mt-1 text-lg font-semibold text-[#0B2545]">Producción con entrega de producto</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">El contrato puede establecer la entrega futura de una cantidad y calidad determinadas, con condiciones de cumplimiento, logística y contingencias.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Modalidad B</p>
              <h4 className="mt-1 text-lg font-semibold text-[#0B2545]">Participación económica en un proyecto productivo</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">El contrato puede establecer derechos económicos vinculados al ciclo, con condiciones, costos y riesgos específicos.</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">En esta etapa ambas son opciones de interés y evaluación: no se habilita contratación, cobros ni emisión.</p>
        </div>

        <div className="mt-16 rounded-2xl bg-[#0B2545] p-6 text-white md:p-8">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-1 h-6 w-6 shrink-0 text-[#C3CCD9]" aria-hidden="true" />
            <div>
              <h3 className="text-xl font-semibold">Un lote definido. Un destino de fondos claro.</h3>
              <p className="mt-3 leading-relaxed text-[#E4E9F0]">
                Cada propuesta deberá identificar quién administra los fondos, qué usos están permitidos, cómo se documentan los desembolsos y qué ocurre ante contingencias: financiación insuficiente, demoras, sobrecostos, pérdida de mercadería, ventas parciales y cierre anticipado.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#C3CCD9]">
                Un fideicomiso es una posible estructura a evaluar, no una estructura existente ni una garantía del capital: el riesgo comercial del proyecto no desaparece.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Preguntas frecuentes</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#0B2545]">Producción PyME</h3>
            <p className="mt-3 text-sm text-muted-foreground">Más condiciones en las <Link to="/tokenizate/bases-y-condiciones" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>.</p>
          </div>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`p${i}`}>
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

export default PymeSection;
