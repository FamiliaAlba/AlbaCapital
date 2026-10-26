import { Download, FileText, Trash2, UploadCloud, X } from "lucide-react";
import { ALL_DOC_CATEGORIES } from "@/data/tokenizate";

export interface DocRow { id: string; category: string; original_name: string; mime: string; size_bytes: number; status: string; stage: string }
export interface QueueItem { key: string; name: string; pct: number; state: "up" | "check" | "done" | "error"; error?: string }

const field = "mt-1.5 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-base text-foreground placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-[#F3F5F8]";
const label = "block text-sm font-medium text-foreground";
const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0B2545] bg-white px-5 py-3 text-base font-semibold text-[#0B2545] transition-colors hover:bg-[#EEF1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";
const fmtMB = (b: number) => `${(b / 1024 / 1024).toFixed(b > 1048576 ? 1 : 2)} MB`;

interface DocPanelProps {
  categories: Record<string, string>;
  loaded: { documents: DocRow[]; limits: { max_files: number; max_file_mb: number } }; docCat: string; setDocCat: (v: string) => void; drag: boolean; setDrag: (v: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement>; addFiles: (f: FileList | File[]) => void; queue: QueueItem[]; setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  removeDoc: (id: string) => void; downloadDoc: (id: string) => void;
}
export const DocPanel = ({ categories, loaded, docCat, setDocCat, drag, setDrag, fileRef, addFiles, queue, setQueue, removeDoc, downloadDoc }: DocPanelProps) => (
  <div className="mt-6">
    <label htmlFor="doc-cat" className={label}>Categoría para los archivos que subas</label>
    <select id="doc-cat" className={field} value={docCat} onChange={(e) => setDocCat(e.target.value)}>{Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
      className={`mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center ${drag ? "border-[#0B2545] bg-[#EEF1F5]" : "border-[#9AA7B8]"}`}
    >
      <UploadCloud className="h-8 w-8 text-[#5B6B80]" aria-hidden="true" />
      <p className="text-sm text-foreground">Arrastrá archivos acá o</p>
      <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>Elegir archivos</button>
      <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} aria-label="Elegir archivos" />
      <p className="text-xs text-muted-foreground">PDF, JPG/JPEG o PNG · hasta {loaded.limits.max_file_mb} MB por archivo · máximo {loaded.limits.max_files} archivos</p>
    </div>
    {queue.length > 0 && (
      <ul className="mt-3 space-y-2" aria-live="polite">
        {queue.map((q) => (
          <li key={q.key} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center justify-between gap-2"><span className="truncate">{q.name}</span>
              <span className="flex items-center gap-2 text-xs">{q.state === "up" ? `${q.pct}%` : q.state === "check" ? "Verificando…" : q.state === "done" ? "Listo" : "Error"}
                {(q.state === "done" || q.state === "error") && <button type="button" aria-label="Quitar de la lista" onClick={() => setQueue((x) => x.filter((i) => i.key !== q.key))}><X className="h-4 w-4" /></button>}</span></div>
            {q.state === "up" && <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#E4E9F0]"><div className="h-full bg-[#0B2545]" style={{ width: `${q.pct}%` }} /></div>}
            {q.error && <p role="alert" className="mt-1 text-xs text-destructive">{q.error}</p>}
          </li>
        ))}
      </ul>
    )}
    <h4 className="mt-6 text-sm font-semibold text-[#0B2545]">Archivos cargados ({loaded.documents.length})</h4>
    {loaded.documents.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Todavía no cargaste archivos.</p> : (
      <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
        {loaded.documents.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#5B6B80]" aria-hidden="true" /><span className="truncate">{d.original_name}</span><span className="shrink-0 text-xs text-muted-foreground">{ALL_DOC_CATEGORIES[d.category] ?? d.category} · {fmtMB(d.size_bytes)}</span></span>
            <span className="flex shrink-0 gap-3">
              <button type="button" aria-label={`Descargar ${d.original_name}`} onClick={() => downloadDoc(d.id)}><Download className="h-4 w-4 text-[#0B2545]" /></button>
              <button type="button" aria-label={`Eliminar ${d.original_name}`} onClick={() => removeDoc(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

