import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ArrowUp, ArrowDown, Pencil, Archive, Trash2, Loader2 } from "lucide-react";

interface Row {
  id: string;
  slug: string;
  full_name: string;
  photo_path: string | null;
  status: string;
  display_order: number;
  updated_at: string;
  role_title: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select(
        "id, slug, full_name, photo_path, status, display_order, updated_at, team_member_translations(locale, role_title)",
      )
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error al cargar integrantes", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setRows(
      (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        full_name: r.full_name,
        photo_path: r.photo_path,
        status: r.status,
        display_order: r.display_order,
        updated_at: r.updated_at,
        role_title: r.team_member_translations?.find((t) => t.locale === "es-AR")?.role_title ?? null,
      })),
    );
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.full_name.toLowerCase().includes(q) || (r.role_title ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const total = rows.length;
  const published = rows.filter((r) => r.status === "published").length;
  const hidden = rows.filter((r) => r.status !== "published").length;
  const lastUpdated = rows.reduce<string | null>((max, r) => (!max || r.updated_at > max ? r.updated_at : max), null);

  const move = async (row: Row, direction: "up" | "down") => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= rows.length) return;
    const swapRow = rows[swapIdx];

    setBusyId(row.id);
    const { error: e1 } = await supabase
      .from("team_members")
      .update({ display_order: swapRow.display_order })
      .eq("id", row.id);
    const { error: e2 } = await supabase
      .from("team_members")
      .update({ display_order: row.display_order })
      .eq("id", swapRow.id);
    setBusyId(null);

    if (e1 || e2) {
      toast({ title: "No se pudo reordenar", variant: "destructive" });
      return;
    }
    load();
  };

  const toggleStatus = async (row: Row, newStatus: "published" | "draft") => {
    setBusyId(row.id);
    const { error } = await supabase.from("team_members").update({ status: newStatus }).eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast({ title: "No se pudo actualizar el estado", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: newStatus === "published" ? "Integrante publicado" : "Integrante despublicado" });
    load();
  };

  const archive = async (row: Row) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("team_members")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast({ title: "No se pudo archivar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Integrante archivado" });
    load();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const row = pendingDelete;
    setPendingDelete(null);
    setBusyId(row.id);

    if (row.photo_path) {
      await supabase.storage.from("team-photos").remove([row.photo_path]);
    }
    const { error } = await supabase.from("team_members").delete().eq("id", row.id);
    setBusyId(null);

    if (error) {
      toast({ title: "No se pudo eliminar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${row.full_name} fue eliminado.` });
    load();
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-light text-architectural">Integrantes del equipo</h1>
          <p className="text-sm text-muted-foreground">Conectado como {user?.email}</p>
        </div>
        <Button asChild>
          <Link to="/admin/members/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo integrante
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-light">{total}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Publicados</p>
          <p className="text-2xl font-light">{published}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Ocultos / borrador</p>
          <p className="text-2xl font-light">{hidden}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Última actualización</p>
          <p className="text-sm font-light">{lastUpdated ? new Date(lastUpdated).toLocaleString("es-AR") : "—"}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o cargo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs whitespace-nowrap ${
                statusFilter === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No hay integrantes que coincidan.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 hidden md:table-cell">Cargo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => move(row, "up")}
                        disabled={i === 0 || busyId === row.id}
                        aria-label="Subir"
                        className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => move(row, "down")}
                        disabled={i === filtered.length - 1 || busyId === row.id}
                        aria-label="Bajar"
                        className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.full_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{row.role_title ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.status === "published"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : row.status === "draft"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/members/${row.id}`} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {row.status === "published" ? (
                        <Button variant="ghost" size="sm" disabled={busyId === row.id} onClick={() => toggleStatus(row, "draft")}>
                          Despublicar
                        </Button>
                      ) : row.status === "draft" ? (
                        <Button variant="ghost" size="sm" disabled={busyId === row.id} onClick={() => toggleStatus(row, "published")}>
                          Publicar
                        </Button>
                      ) : null}
                      {row.status !== "archived" && (
                        <Button variant="ghost" size="sm" disabled={busyId === row.id} onClick={() => archive(row)} aria-label="Archivar">
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() => setPendingDelete(row)}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {pendingDelete?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borra el perfil y su fotografía de forma permanente. No se puede deshacer. Si preferís
              conservar el historial, usá "Archivar" en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
