import { useRef, type KeyboardEvent } from "react";
import { panelId, tabId } from "./tabIds";

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
}

interface TabListProps<K extends string> {
  /** Prefijo único para los ids (los paneles usan `${idBase}-panel-${key}`). */
  idBase: string;
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  label: string;
}

/**
 * Lista de pestañas accesible (patrón WAI-ARIA): una sola pestaña entra en el orden de tabulación;
 * ← → cambian de pestaña, Inicio y Fin van a la primera y a la última.
 */
export function TabList<K extends string>({ idBase, items, value, onChange, label }: TabListProps<K>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (to: number) => {
    const next = items[(to + items.length) % items.length];
    onChange(next.key);
    refs.current[next.key]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") { e.preventDefault(); move(index + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); move(index - 1); }
    else if (e.key === "Home") { e.preventDefault(); move(0); }
    else if (e.key === "End") { e.preventDefault(); move(items.length - 1); }
  };

  return (
    <div role="tablist" aria-label={label} className="ads-tablist">
      {items.map((it, i) => {
        const selected = it.key === value;
        return (
          <button
            key={it.key}
            ref={(el) => { refs.current[it.key] = el; }}
            type="button"
            role="tab"
            id={tabId(idBase, it.key)}
            aria-selected={selected}
            aria-controls={panelId(idBase, it.key)}
            tabIndex={selected ? 0 : -1}
            className="ads-tab"
            onClick={() => onChange(it.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
