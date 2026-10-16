import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BASES_Y_CONDICIONES, POLITICA_PRIVACIDAD, LEGAL_REVIEWED_ON } from "@/data/tokenizateLegal";

const TokenizateLegal = ({ kind }: { kind: "privacidad" | "bases" }) => {
  const doc = kind === "privacidad" ? POLITICA_PRIVACIDAD : BASES_Y_CONDICIONES;
  useEffect(() => {
    const prev = document.title;
    document.title = doc.title;
    return () => {
      document.title = prev;
    };
  }, [doc.title]);

  return (
    <div className="tk-scope min-h-screen pt-20 md:pt-24">
      <article className="container mx-auto px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <Link to="/tokenizate" className="inline-flex items-center gap-2 text-sm font-medium text-[#0B2545] underline-offset-4 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Tokenizate
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-[#0B2545] md:text-4xl">{doc.title}</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{doc.intro}</p>
          <div className="mt-10 space-y-9">
            {doc.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-xl font-semibold text-[#0B2545]">{s.title}</h2>
                {s.paragraphs?.map((p) => <p key={p} className="mt-3 leading-relaxed text-foreground">{p}</p>)}
                {s.items && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground">
                    {s.items.map((i) => <li key={i} className="leading-relaxed">{i}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
            Normativa consultada en fuentes oficiales el {LEGAL_REVIEWED_ON}. Este texto es informativo y no reemplaza el asesoramiento legal independiente.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <Link to="/tokenizate/privacidad" className="font-medium text-[#0B2545] underline">Política de Privacidad</Link>
            <Link to="/tokenizate/bases-y-condiciones" className="font-medium text-[#0B2545] underline">Bases y Condiciones</Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default TokenizateLegal;
