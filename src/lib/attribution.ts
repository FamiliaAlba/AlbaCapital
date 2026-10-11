const KEY = "alba_attribution";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const clean = (v: string | null, max: number): string | null => {
  if (!v) return null;
  const s = v.trim().replace(/[^\w.\-+ ]/g, "").slice(0, max);
  return s || null;
};

/** Guarda en sessionStorage (solo esa pestaña) el origen UTM de la visita. No envía nada a terceros. */
export function captureAttribution(search: string = window.location.search): void {
  try {
    const p = new URLSearchParams(search);
    const a: Attribution = {
      utm_source: clean(p.get("utm_source"), 50),
      utm_medium: clean(p.get("utm_medium"), 50),
      utm_campaign: clean(p.get("utm_campaign"), 120),
    };
    if (a.utm_source || a.utm_medium || a.utm_campaign) sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage no disponible: no se conserva atribución */
  }
}

export function readAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { utm_source: null, utm_medium: null, utm_campaign: null, ...JSON.parse(raw) };
  } catch {
    /* ignorar */
  }
  return { utm_source: null, utm_medium: null, utm_campaign: null };
}
