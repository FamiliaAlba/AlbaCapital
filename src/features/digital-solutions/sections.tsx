import { useEffect, useRef, useState } from "react";
import { BRAND, HERO_IMAGE } from "./content";

/* ───────────── Portada ───────────── */
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Imagen de fondo de la portada (decorativa). La capa de filtro oscura va encima y el splash del logo, sobre la capa. */
export function HeroBackdrop() {
  return (
    <div className="ads-hero__backdrop" aria-hidden="true">
      <img src={HERO_IMAGE.src} width={HERO_IMAGE.width} height={HERO_IMAGE.height} alt="" decoding="async" />
    </div>
  );
}

/**
 * Splash de entrada: el logo aparece animado sobre la capa oscura de la imagen y se desvanece solo.
 * Una vez por sesión; no se muestra con "reducir movimiento". No tapa ni bloquea nada (decorativo).
 */
const SPLASH_KEY = "ads-splash-seen";
export function HeroSplash({ whenVisible = false }: { whenVisible?: boolean }) {
  const [show, setShow] = useState(() => {
    if (prefersReducedMotion()) return false;
    try { return sessionStorage.getItem(SPLASH_KEY) !== "1"; } catch { return true; }
  });
  // Incrustada al pie de otra página, la portada queda lejos: el splash arranca cuando entra en pantalla.
  const [started, setStarted] = useState(!whenVisible);
  const sentinel = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (started || !show) return;
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") { setStarted(true); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { setStarted(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [started, show]);
  if (!show) return null;
  if (!started) return <span ref={sentinel} className="ads-splash-sentinel" aria-hidden="true" />;
  return (
    <div
      className="ads-splash"
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch { /* sin almacenamiento: se muestra de nuevo la próxima vez */ }
        setShow(false);
      }}
    >
      <div className="ads-splash__inner">
        <img className="ads-splash__logo" src="/digital-solutions/logo-ads-512.png" width={512} height={512} alt="" />
        <span className="ads-splash__rule" />
        <span className="ads-splash__word">{BRAND}</span>
      </div>
    </div>
  );
}
