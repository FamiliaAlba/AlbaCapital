import { ReactNode, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import albaLogo from "@/assets/alba-logo-black.webp";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Panel administrativo — Alba Capital";
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <meta name="robots" content="noindex, nofollow" />
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="flex md:w-64 md:flex-col border-b md:border-b-0 md:border-r border-border bg-background">
          <div className="flex items-center justify-between md:justify-start gap-3 px-5 py-4 md:flex-col md:items-start">
            <img src={albaLogo} alt="Alba Capital" className="h-7 w-auto dark:invert" />
          </div>
          <nav className="flex md:flex-col gap-1 px-3 pb-4 md:flex-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Integrantes
            </NavLink>
            <NavLink
              to="/admin/opportunities"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <TrendingUp className="h-4 w-4" />
              Oportunidades
            </NavLink>
          </nav>
          <div className="hidden md:block px-3 pb-4 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              Ver sitio público
            </a>
            <p className="truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
