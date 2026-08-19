import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import albaLogo from "@/assets/alba-logo-black.webp";

const credsSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

const AdminLogin = () => {
  const { session, isSuperadmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Acceso administrativo — Alba Capital";
  }, []);

  if (!loading && session && isSuperadmin) {
    const dest = (location.state as { from?: string } | null)?.from ?? "/admin";
    return <Navigate to={dest} replace />;
  }

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot
    if (isLocked) return;

    const parsed = credsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMsg(parsed.error.errors[0]?.message ?? "Datos inválidos.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);

    if (error) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCK_MS);
        setErrorMsg(`Demasiados intentos fallidos. Esperá ${LOCK_MS / 1000} segundos antes de reintentar.`);
      } else {
        // Mensaje genérico: no revela si el email existe o no en el sistema
        setErrorMsg("Email o contraseña incorrectos.");
      }
      return;
    }

    navigate("/admin", { replace: true });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    const parsedEmail = z.string().trim().email().safeParse(email);
    if (!parsedEmail.success) {
      setErrorMsg("Ingresá un email válido.");
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    setSubmitting(false);
    // Siempre mostramos el mismo mensaje exista o no la cuenta.
    setResetSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <meta name="robots" content="noindex, nofollow" />
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src={albaLogo} alt="Alba Capital" className="mx-auto h-10 w-auto dark:invert" />
          <p className="mt-4 text-sm text-muted-foreground">Panel administrativo</p>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

            <Button type="submit" className="w-full" disabled={submitting || isLocked}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingresar"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setErrorMsg(null);
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            {resetSent ? (
              <p className="text-center text-sm text-muted-foreground">
                Si el email ingresado corresponde a una cuenta autorizada, vas a recibir un enlace para restablecer tu
                contraseña.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar enlace de recuperación"}
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setResetSent(false);
                setErrorMsg(null);
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Volver al login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
