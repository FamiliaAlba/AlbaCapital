import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("404: ruta inexistente ->", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <p className="text-minimal text-muted-foreground">ERROR 404</p>
        <h1 className="mt-3 mb-4 text-4xl md:text-6xl font-light text-architectural">Página no encontrada</h1>
        <p className="mb-8 text-muted-foreground">
          El contenido que buscás no existe o fue movido.
        </p>
        <Link to="/" className="text-foreground underline hover:text-muted-foreground">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
