import { Suspense, lazy, useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SocialPostEditor = lazy(() => import("./SocialPostEditor"));

/**
 * Botón “Crear publicación”. Solo se muestra a administradores (la verificación de interfaz
 * usa RLS sobre admin_users; el servidor vuelve a verificar rol y sesión en cada acción).
 */
const SocialPostButton = ({ opportunityId, className }: { opportunityId: string; className?: string }) => {
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user.id;
        if (!uid) return;
        const { data: row } = await supabase.from("admin_users").select("role").eq("id", uid).eq("role", "superadmin").maybeSingle();
        if (!cancelled && row) setAllowed(true);
      } catch {
        /* sin sesión: no se muestra */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) return null;
  return (
    <>
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}>
        <Megaphone className="mr-2 h-4 w-4" /> Crear publicación
      </Button>
      {open && (
        <Suspense fallback={null}>
          <SocialPostEditor opportunityId={opportunityId} open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
};

export default SocialPostButton;
