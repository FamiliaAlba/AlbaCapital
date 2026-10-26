import { Link } from "react-router-dom";
import { ArrowRight, Building, Factory, FileSignature, ListChecks, Scale, Sprout, Tractor, Warehouse, FileSearch, Info, Landmark } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const steps = [
  { icon: Building, title: "Presentás el activo", text: "Identificás el campo o la planta, su titularidad, cómo genera renta y qué buscás." },
  { icon: FileSearch, title: "Evaluamos titularidad y renta", text: "Revisamos documentación, contratos, valuación, cargas y la solidez de los ingresos." },
  { icon: FileSignature, title: "Definimos la estructura", text: "Si corresponde, se diseñan los instrumentos jurídicos, los participantes y las reglas de administración." },
  { icon: ListChecks, title: "Se administra y se informa", text: "El proyecto contempla seguimiento del activo, de sus contratos y de la renta cobrada." },
  { icon: Landmark, title: "Se distribuye según contrato", text: "Los derechos y la distribución de resultados son los que establezcan los documentos de cada proyecto aprobado." },
];

const assets = [
  { icon: Sprout, title: "Campos agrícolas", text: "Tierra arrendada a productores, con renta pactada en dinero o en producto." },
  { icon: Tractor, title: "Campos ganaderos", text: "Establecimientos con explotación propia o de terceros y contratos definidos." },
  { icon: Factory, title: "Plantas industriales", text: "Instalaciones productivas con operador, contratos de uso y flujo de ingresos identificable." },
  { icon: Warehouse, title: "Logística y agroindustria", text: "Depósitos, silos, galpones y plantas de procesamiento con renta contractual." },
];

const checks = [
  "Titularidad, situación registral y cargas sobre el activo.",
  "Quién lo explota o arrienda, y qué dicen los contratos (plazo, renta, incumplimientos).",
  "Una valuación independiente y comprobable.",
  "Cómo se fija la renta y de qué depende: precio de la producción, clima, mercado.",
  "Costos legales, tecnológicos, administrativos e impositivos de la estructura.",
  "Encuadre regulatorio aplicable: oferta pública o privada, participantes y autorizaciones.",
  "Qué ocurre ante vencimientos, incumplimientos, ventas parciales o necesidad de liquidez.",
];

const faqs = [
  { q: "¿Alba Capital trabaja el campo o la planta?", a: "No. El activo lo explota su titular o un tercero (por ejemplo, un arrendatario). Alba Capital evalúa, estructura si corresponde y hace seguimiento; no opera el activo." },
  { q: "¿Es lo mismo que vender el campo?", a: "No. Se evalúa una estructura para que el titular financie el activo o incorpore participantes sin necesidad de venderlo. La propiedad y los derechos se rigen por los instrumentos jurídicos de cada proyecto aprobado." },
  { q: "¿La renta está garantizada?", a: "No. Depende del contrato, del arrendatario o del operador y de factores externos como el precio de la producción y el clima. Ninguna renta ni la devolución del capital están garantizadas." },
  { q: "¿Qué derechos tendrían quienes participen?", a: "Los que defina el instrumento jurídico de cada proyecto, por ejemplo derechos económicos sobre la renta. Una participación digital no implica automáticamente propiedad directa de una fracción física del activo." },
  { q: "¿Puedo postular un campo en condominio o con hipoteca?", a: "Podés postularlo: informá la situación. Se analiza caso por caso y puede que no sea elegible o requiera condiciones previas." },
  { q: "¿Tiene costo postular?", a: "Enviar la postulación no tiene costo. Cualquier honorario posterior se informa y acuerda por escrito antes de devengarse." },
  { q: "¿Postular garantiza financiación?", a: "No. Postular inicia una evaluación. Alba Capital no está obligada a estructurar ni ofrecer el activo, y solo si hay acuerdo definitivo se firma un contrato." },
];

const CamposSection = () => (
  <section id="campos-industrias" className="scroll-mt-24 bg-white py-16 md:py-24">
    <div className="container mx-auto px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]">Campos e industrias · Grandes activos de renta</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#0B2545] md:text-4xl">Un activo grande puede financiarse en partes más chicas.</h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground">
          ¿Tenés un campo, una planta o una industria que genera renta? Presentá el activo. En Alba Capital evaluamos si existe una estructura adecuada para financiarlo o incorporar participantes mediante participaciones digitales con derechos definidos por contrato, sin que tengas que venderlo.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          Cada propuesta debe identificar al titular, cómo se genera la renta, quién explota el activo, su valuación y las condiciones de participación.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/tokenizate/postular?modalidad=campos-industrias" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#13315c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Postular mi campo o industria <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#campos-como-funciona" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-6 py-3.5 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Conocer cómo funciona
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">La postulación inicia una evaluación. No garantiza financiación ni emisión de tokens.</p>

        <div id="campos-como-funciona" className="scroll-mt-24 pt-16">
          <h3 className="text-xl font-semibold text-[#0B2545]">Cómo funciona</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Es el recorrido previsto de un proyecto que resulte aprobado. Alba Capital no tiene emisiones activas en esta modalidad.</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-border bg-[#F3F5F8] p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2545] text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#5B6B80]">Paso {i + 1}</p>
                <h4 className="mt-1 text-base font-semibold text-[#0B2545]">{title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-16">
          <h3 className="text-xl font-semibold text-[#0B2545]">Qué tipos de activos podemos evaluar</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl bg-[#F3F5F8] p-5">
                <Icon className="h-6 w-6 text-[#5B6B80]" aria-hidden="true" />
                <p className="mt-3 text-base font-semibold text-[#0B2545]">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg border-l-4 border-[#5B6B80] bg-[#F3F5F8] px-4 py-3 text-sm text-foreground">Ejemplos de aplicación sujetos a evaluación. No son oportunidades de inversión disponibles.</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border p-6 md:p-8">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-[#0B2545]"><Scale className="h-5 w-5" aria-hidden="true" /> Lo que debe estar claro antes de cualquier operación</h3>
            <ul className="mt-4 space-y-2.5">
              {checks.map((c) => (
                <li key={c} className="flex gap-3 text-sm leading-relaxed text-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0B2545]" aria-hidden="true" />{c}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Ni la renta ni la posibilidad de vender anticipadamente una participación están garantizadas.</p>
          </div>

          <aside className="rounded-2xl bg-[#F3F5F8] p-6 md:p-8" aria-label="Caso externo de referencia">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B6B80]"><Info className="h-4 w-4" aria-hidden="true" /> Caso externo de referencia</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              Landtoken, una plataforma argentina, fraccionó en participaciones digitales dos campos que se alquilan a productores (en Buenos Aires y Santa Fe) y distribuye la renta entre quienes participan. Según las fuentes citadas, el alquiler se fija en quintales de soja por hectárea: por eso lo que se cobra en dólares depende también del precio del grano y del clima de cada campaña.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Fuentes consultadas por Alba Capital sin verificación independiente: Bichos de Campo (2023 y 2025), Ámbito (2024) y calificación de UNTREF ACR UP (2025). Es un caso ajeno: Alba Capital no tiene relación con esa empresa, y el ejemplo no implica montos, condiciones ni resultados para ningún proyecto de Alba Capital.
            </p>
          </aside>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6B80]">Preguntas frecuentes</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#0B2545]">Campos e industrias</h3>
            <p className="mt-3 text-sm text-muted-foreground">Más condiciones en las <Link to="/tokenizate/bases-y-condiciones" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>.</p>
          </div>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`c${i}`}>
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

export default CamposSection;
