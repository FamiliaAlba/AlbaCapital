import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import heroImage from "@/assets/hero-architecture.webp";
import {
  HERO_VIDEO,
  VIDEO_MAX_WAIT_MS,
  classifyPlayError,
  isHeadlineVisible,
  shouldAllowVideo,
  type ConnectionInfo,
} from "@/lib/heroVideo";

/** Mismo tratamiento que tenía la portada: monocromo sepia oscuro. Ahora va como capa por delante del video. */
const HERO_TONE = "grayscale(100%) sepia(35%) contrast(1.05) brightness(0.9)";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false),
    () => false,
  );
}

function usePageVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    },
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

function useInView(ref: React.RefObject<Element>): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/** backdrop-filter con soporte real (Safari lo exige con prefijo): si no existe, el tono se aplica directo sobre el contenedor. */
const supportsBackdrop = () =>
  typeof CSS !== "undefined" && typeof CSS.supports === "function" &&
  (CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)"));

interface LayerProps {
  narrow: boolean;
  allowVideo: boolean;
  playing: boolean;
  onActive: (active: boolean) => void;
  onTime: (t: number) => void;
}

function HeroMedia({ narrow, allowVideo, playing, onActive, onTime }: LayerProps) {
  const source = narrow ? HERO_VIDEO.mobile : HERO_VIDEO.desktop;
  const ref = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  /** El video se pide recién cuando la página terminó de cargar, para no competir con los recursos críticos. */
  const [armed, setArmed] = useState(false);
  const layered = supportsBackdrop();

  useEffect(() => {
    if (armed || !allowVideo) return;
    const arm = () => setArmed(true);
    const t = window.setTimeout(arm, document.readyState === "complete" ? 300 : VIDEO_MAX_WAIT_MS);
    window.addEventListener("load", arm, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", arm);
    };
  }, [armed, allowVideo]);

  const tryPlay = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => setBlocked(false)).catch((err: unknown) => {
        const outcome = classifyPlayError(err);
        if (outcome === "blocked") setBlocked(true);
        else if (outcome === "failed") setFailed(true);
      });
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing && allowVideo && !failed && armed) tryPlay();
    else el.pause();
  }, [playing, allowVideo, failed, armed, source.src, tryPlay]);

  // Si el navegador pidió un gesto, reintenta con el primer toque, clic o tecla.
  useEffect(() => {
    if (!blocked) return;
    const go = () => tryPlay();
    const events = ["pointerdown", "keydown", "touchend"] as const;
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, go));
  }, [blocked, tryPlay]);

  const videoOn = allowVideo && !failed && armed;
  useEffect(() => {
    if (!videoOn) onActive(false);
  }, [videoOn, onActive]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden" style={layered ? undefined : { filter: HERO_TONE }}>
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          decoding="async"
          {...{ fetchpriority: "high" }}
        />
        {videoOn && (
          <video
            key={source.src}
            ref={(el) => {
              ref.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
              }
            }}
            src={source.src}
            poster={source.poster}
            className={`absolute inset-0 h-full w-full object-cover object-center ${blocked ? "opacity-0" : ""}`}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => {
              setBlocked(false);
              onActive(true);
            }}
            onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {/* Capa de tono por delante del video: el mismo sepia oscuro de la portada original */}
      {layered && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ backdropFilter: HERO_TONE, WebkitBackdropFilter: HERO_TONE }}
        />
      )}
    </>
  );
}

const Hero = () => {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [time, setTime] = useState(0);

  const inView = useInView(sectionRef);
  const pageVisible = usePageVisible();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const narrow = useMediaQuery("(max-width: 639px)");
  const connection = typeof navigator !== "undefined" ? (navigator as Navigator & { connection?: ConnectionInfo }).connection : undefined;
  const allowVideo = shouldAllowVideo(reducedMotion, connection);
  const running = !userPaused && inView && pageVisible;
  const headline = isHeadlineVisible(videoActive, time);

  return (
    <section ref={sectionRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <HeroMedia narrow={narrow} allowVideo={allowVideo} playing={running} onActive={setVideoActive} onTime={setTime} />

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content: el texto siempre está en el documento; durante el video solo se ve en el tramo final */}
      <div
        className="relative z-10 text-center max-w-7xl mx-auto px-6 transition-opacity duration-700"
        style={{ opacity: headline ? 1 : 0 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-white text-architectural mb-8">
          <span className="block animate-fade-in" style={{ animationDelay: "0.2s", animationDuration: "1s", animationFillMode: "backwards" }}>
            {t("hero.line1")}
          </span>
          <span className="block animate-fade-in" style={{ animationDelay: "0.9s", animationDuration: "1s", animationFillMode: "backwards" }}>
            {t("hero.line2")}
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-light tracking-wide max-w-2xl mx-auto reveal-delayed">
          {t("hero.subtitle")}
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 reveal-delayed">
        <div className="w-px h-16 bg-white/40" />
        <div className="text-minimal text-white/60 mt-4 rotate-90 origin-center">{t("hero.scroll")}</div>
      </div>

      {videoActive && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? t("hero.play") : t("hero.pause")}
          aria-pressed={userPaused}
          className="absolute bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white/80 backdrop-blur-sm transition hover:bg-black/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </section>
  );
};

export default Hero;
