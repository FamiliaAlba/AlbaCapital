import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, isSuperadmin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Rutas administrativas: nunca indexables.
    let meta = document.head.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (!isSuperadmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="text-2xl font-light">Acceso no autorizado</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Tu cuenta no tiene el rol de superadministrador necesario para acceder a este panel.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
