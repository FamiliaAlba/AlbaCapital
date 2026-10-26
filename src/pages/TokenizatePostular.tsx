import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ApplicationFlow from "@/components/tokenizate/ApplicationFlow";

const TokenizatePostular = () => {
  const [params] = useSearchParams();
  useEffect(() => {
    const prev = document.title;
    document.title = "Postular un activo | Tokenizate | Alba Capital";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => {
      document.title = prev;
      robots.remove();
    };
  }, []);

  return (
    <div className="tk-scope min-h-screen pt-20 md:pt-24">
      <div className="container mx-auto px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <Link to="/tokenizate#postular" className="inline-flex items-center gap-2 text-sm font-medium text-[#0B2545] underline-offset-4 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Tokenizate
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-[#0B2545] md:text-4xl">Tu activo puede impulsar su próxima etapa.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Presentá tu bien de capital o proyecto para que Alba Capital lo evalúe. Es un proceso por etapas, con guardado de borrador.</p>
          <div className="mt-8">
            <ApplicationFlow consult={params.get("modo") === "consultar"} initialModality={params.get("modalidad") === "produccion-pyme" ? "produccion_pyme" : params.get("modalidad") === "campos-industrias" ? "campos_industrias" : "activo"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenizatePostular;
