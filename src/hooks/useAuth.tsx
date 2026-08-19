import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isSuperadmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * El rol de superadmin NUNCA se lee de localStorage ni de metadata del
 * cliente: se consulta la tabla `admin_users` en cada carga de sesión,
 * protegida por RLS (solo el propio usuario puede leer su registro).
 * Esto evita que alguien falsifique el rol manipulando el navegador.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSuperadmin = async (userId: string | undefined) => {
    if (!userId) {
      setIsSuperadmin(false);
      return;
    }
    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", userId)
      .eq("role", "superadmin")
      .maybeSingle();
    setIsSuperadmin(!error && !!data);
  };

  useEffect(() => {
    // 1) Suscripción a cambios de sesión (login/logout/refresh de token)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Se difiere para no bloquear el callback de Supabase (evita deadlocks)
      setTimeout(() => {
        checkSuperadmin(newSession?.user?.id);
      }, 0);
    });

    // 2) Sesión inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      checkSuperadmin(initialSession?.user?.id).finally(() => setLoading(false));
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsSuperadmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isSuperadmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
