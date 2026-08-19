import { useEffect, useRef, useState } from "react";

interface LazyVideoProps {
  sources: { src: string; type: string }[];
  poster: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Video de fondo (autoplay, muted, loop) que solo carga y reproduce
 * cuando entra en el viewport. Respeta prefers-reduced-motion mostrando
 * únicamente el poster en ese caso.
 */
const LazyVideo = ({ sources, poster, className, ariaLabel }: LazyVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (shouldLoad) {
      videoRef.current?.play().catch(() => {
        /* autoplay bloqueado por el navegador: el poster queda visible */
      });
    }
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={className} role="img" aria-label={ariaLabel}>
      {shouldLoad && !reducedMotion ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          className="h-full w-full object-cover"
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      ) : (
        <img src={poster} alt={ariaLabel ?? ""} className="h-full w-full object-cover" loading="lazy" />
      )}
    </div>
  );
};

export default LazyVideo;
