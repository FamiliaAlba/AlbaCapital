import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Globe, Smartphone, Users, Workflow } from "lucide-react";
import { ADVISORY, BRAND, CASE, CONTACT, FOOTER, HERO, HERO_IMAGE, NAV, SECTIONS, SYSTEMS, VISUALIZATION } from "./content";
import { HeroMockup, PanoramaArt } from "./art";
import { SystemsDemo } from "./demos";
import { LoteoDrawing, MasterplanViewer } from "./MasterplanViewer";
import { InquiryForm } from "./InquiryForm";
import type { InquiryType } from "./inquiry";

const LOGO = "/digital-solutions/logo-ads-256.png";

interface WithInquiry {
  onInquire: (t: InquiryType) => void;
}

/* ───────────── Marca y navegación ───────────── */
export function BrandMark() {
  return (
    <span className="ads-brand">
      <img className="ads-brand__logo" src={LOGO} width={256} height={256} alt="" />
      <span className="ads-brand__name">ALBA DIGITAL<span>SOLUTIONS</span></span>
    </span>
  );
}

export function Header({ topId = "top" }: { topId?: string }) {
  return (
    <div className="ads-header">
      <div className="ads-wrap ads-header__bar">
        <a href={`#${topId}`} className="ads-brandlink" aria-label={BRAND}>
          <BrandMark />
        </a>
        <nav className="ads-nav" aria-label="Secciones de la página">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} className={i === NAV.length - 1 ? "ads-nav__cta" : undefined}>{n.label}</a>
          ))}
        </nav>
      </div>
    </div>
  );
}

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
        <div className="ads-splash__mark">
          <span className="ads-splash__ring" />
          <span className="ads-splash__plate"><img src="/digital-solutions/logo-ads-512.png" width={512} height={512} alt="" /></span>
        </div>
        <span className="ads-splash__word">{BRAND}</span>
      </div>
    </div>
  );
}

export function Hero({ embedded = false }: { embedded?: boolean }) {
  return (
    <section className="ads-hero" aria-labelledby="ads-h1">
      <HeroBackdrop />
      <HeroSplash whenVisible={embedded} />
      <div className="ads-wrap ads-hero__grid">
        <div>
          <div className="ads-hero__brandrow ads-rise">
            <span className="ads-hero__badge" aria-hidden="true"><img src={LOGO} width={256} height={256} alt="" /></span>
            <p className="ads-eyebrow">{BRAND}</p>
          </div>
          {/* Incrustada en otra página (que ya tiene su h1), este título se anuncia como nivel 2. */}
          <h1 id="ads-h1" className="ads-rise ads-rise--2" style={{ marginTop: 20 }} {...(embedded ? { role: "heading", "aria-level": 2 } : {})}>{HERO.title}</h1>
          <p className="ads-hero__lead ads-rise ads-rise--3">{HERO.lead}.</p>
          <div className="ads-hero__actions ads-rise ads-rise--3">
            <a className="ads-btn ads-btn--primary" href={`#${SECTIONS.sistemas}`}>
              {HERO.ctaSystems} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="ads-btn ads-btn--ghost" href={`#${SECTIONS.desarrollo}`}>
              {HERO.ctaDevelopment}
            </a>
          </div>
          <ul className="ads-hero__chips" aria-label="Qué hacemos">
            {HERO.chips.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p style={{ marginTop: 6, color: "var(--ads-muted)", fontSize: 15 }}>{HERO.note}</p>
        </div>
        <div className="ads-hero__visual"><HeroMockup /></div>
      </div>
      <div className="ads-hero__panorama" aria-hidden="false">
        <PanoramaArt className="ads-hero__art" />
      </div>
    </section>
  );
}

/* ───────────── Sistemas ───────────── */
const SYSTEM_ICONS = { crm: Users, erp: Boxes, pwa: Smartphone, web: Globe, custom: Workflow } as const;

export function SystemsSection({ onInquire }: WithInquiry) {
  return (
    <section id={SECTIONS.sistemas} className="ads-section ads-section--paper" aria-labelledby="ads-sistemas-h">
      <div className="ads-wrap">
        <p className="ads-eyebrow">{SYSTEMS.eyebrow}</p>
        <h2 id="ads-sistemas-h" className="ads-title" style={{ marginTop: 16 }}>{SYSTEMS.title}</h2>
        <p className="ads-lead" style={{ marginTop: 20 }}>{SYSTEMS.lead}</p>
        <div className="ads-systems" role="list">
          {SYSTEMS.items.map((it) => {
            const Icon = SYSTEM_ICONS[it.key as keyof typeof SYSTEM_ICONS];
            return (
              <div className="ads-system-row" role="listitem" key={it.key}>
                <h3><Icon size={26} aria-hidden="true" />{it.name}</h3>
                <p>{it.text}</p>
              </div>
            );
          })}
        </div>
        <h3 style={{ marginTop: 64, fontSize: 28 }}>{SYSTEMS.demoTitle}</h3>
        <SystemsDemo />
        <div style={{ marginTop: 32 }}>
          <button type="button" className="ads-btn ads-btn--ink" onClick={() => onInquire("software")}>
            {SYSTEMS.cta} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Visualización 3D y 360° ───────────── */
export function VisualizationSection({ onInquire }: WithInquiry) {
  return (
    <section id={SECTIONS.visualizacion} className="ads-section ads-section--dark" aria-labelledby="ads-viz-h">
      <div className="ads-wrap">
        <p className="ads-eyebrow">{VISUALIZATION.eyebrow}</p>
        <h2 id="ads-viz-h" className="ads-title" style={{ marginTop: 16 }}>{VISUALIZATION.title}</h2>
        <div className="ads-viz">
          <div>
            <p className="ads-lead">{VISUALIZATION.lead}</p>
            <ul className="ads-deliver">
              {VISUALIZATION.items.map((it) => (
                <li key={it.name}><strong>{it.name}</strong><span>{it.text}</span></li>
              ))}
            </ul>
            <div style={{ marginTop: 28 }}>
              <button type="button" className="ads-btn ads-btn--primary" onClick={() => onInquire("visualizacion")}>
                {VISUALIZATION.cta} <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <MasterplanViewer title={VISUALIZATION.mpTitle} hint={VISUALIZATION.mpHint} />
        </div>
      </div>
    </section>
  );
}

/* ───────────── Asesoramiento ───────────── */
export function AdvisorySection({ onInquire }: WithInquiry) {
  return (
    <section id={SECTIONS.desarrollo} className="ads-section ads-section--paper" aria-labelledby="ads-adv-h">
      <div className="ads-wrap">
        <p className="ads-eyebrow">{ADVISORY.eyebrow}</p>
        <h2 id="ads-adv-h" className="ads-title" style={{ marginTop: 16 }}>{ADVISORY.title}</h2>
        <p className="ads-lead" style={{ marginTop: 20 }}>{ADVISORY.lead}</p>
        <div className="ads-adv">
          {ADVISORY.blocks.map((b) => (
            <div className="ads-adv__row" key={b.title}>
              <h3>{b.title}</h3>
              <ul>{b.points.map((p) => <li key={p}><span>{p}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="ads-note">{ADVISORY.note}</p>
        <div style={{ marginTop: 32 }}>
          <button type="button" className="ads-btn ads-btn--ink" onClick={() => onInquire("asesoramiento")}>
            {ADVISORY.cta} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Caso integrado ───────────── */
function CaseVisual({ index }: { index: number }) {
  if (index === 0) {
    const rows = [
      { label: "Ubicación y accesos", value: "A relevar en el terreno" },
      { label: "Servicios disponibles", value: "A verificar" },
      { label: "Normativa aplicable", value: "A consultar con profesionales" },
    ];
    const scenarios = [
      { name: "Escenario A · lotes más amplios", area: 80, count: 40 },
      { name: "Escenario B · más lotes, más compactos", area: 45, count: 85 },
    ];
    return (
      <div className="ads-mini">
        <span className="ads-tag" style={{ justifySelf: "start" }}>Ficha del terreno · ejemplo</span>
        {rows.map((r) => <div className="ads-mini__row" key={r.label}><b>{r.label}</b><small style={{ marginLeft: "auto" }}>{r.value}</small></div>)}
        {scenarios.map((s) => (
          <div key={s.name} className="ads-mini__row" style={{ display: "grid", gap: 8 }}>
            <b>{s.name}</b>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8, alignItems: "center" }}>
              <small>Superficie por lote</small><div className="ads-mini__bar"><i style={{ width: `${s.area}%` }} /></div>
              <small>Cantidad de lotes</small><div className="ads-mini__bar"><i style={{ width: `${s.count}%`, background: "#3078ba" }} /></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    return <LoteoDrawing view="general" interactive={false} label="Plano esquemático ilustrativo del loteo: lotes, accesos y espacios comunes" />;
  }
  if (index === 2) {
    const steps = [
      ["1", "La web capta la consulta", "Consulta por el lote 12 · origen: formulario del sitio"],
      ["2", "El CRM la asigna", "Responsable: Equipo comercial A"],
      ["3", "Se registra la visita", "Sábado · 11:00"],
      ["4", "Queda la próxima acción", "Confirmar asistencia el viernes"],
    ];
    return (
      <ol className="ads-timeline">
        {steps.map(([n, a, b]) => <li key={n}><i>{n}</i><span><b>{a}</b><small>{b}</small></span></li>)}
      </ol>
    );
  }
  const ind = [
    ["Consultas por origen", 70], ["Visitas agendadas por semana", 52], ["Tiempo hasta la primera respuesta", 36], ["Lotes por estado", 60],
  ] as const;
  return (
    <div className="ads-mini">
      <span className="ads-tag" style={{ justifySelf: "start" }}>Indicadores disponibles · esquema</span>
      {ind.map(([l, w]) => (
        <div className="ads-mini__row" key={l} style={{ display: "grid", gap: 8 }}>
          <b>{l}</b>
          <div className="ads-mini__bar"><i style={{ width: `${w}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function CaseSection({ onInquire }: WithInquiry) {
  return (
    <section id={SECTIONS.caso} className="ads-section ads-section--surface" aria-labelledby="ads-case-h">
      <div className="ads-wrap">
        <p className="ads-eyebrow">{CASE.eyebrow}</p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 16 }}>
          <h2 id="ads-case-h" className="ads-title" style={{ maxWidth: "20ch" }}>{CASE.title}</h2>
          <span className="ads-tag">{CASE.tag}</span>
        </div>
        <p className="ads-lead" style={{ marginTop: 20 }}>{CASE.lead}</p>
        <ol className="ads-case" style={{ listStyle: "none", padding: 0, marginBottom: 0 }}>
          {CASE.steps.map((s, i) => (
            <li className="ads-step" key={s.n}>
              <div className="ads-step__visual"><CaseVisual index={i} /></div>
              <div className="ads-step__body">
                <span className="ads-step__n">{s.n}</span>
                <h3>{s.title}</h3>
                <dl>
                  <div><dt>Qué recibe el cliente</dt><dd>{s.receive}</dd></div>
                  <div><dt>Qué mejora</dt><dd>{s.improves}</dd></div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 36 }}>
          <button type="button" className="ads-btn ads-btn--primary" onClick={() => onInquire("integral")}>
            {CASE.cta} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Contacto ───────────── */
export function ContactSection({ type, onTypeChange }: { type: InquiryType | ""; onTypeChange: (t: InquiryType | "") => void }) {
  return (
    <section id={SECTIONS.contacto} className="ads-section ads-section--paper" aria-labelledby="ads-contact-h">
      <div className="ads-wrap ads-contact">
        <div>
          <p className="ads-eyebrow">{CONTACT.eyebrow}</p>
          <h2 id="ads-contact-h" className="ads-title" style={{ marginTop: 16 }}>{CONTACT.title}</h2>
          <p className="ads-lead" style={{ marginTop: 20 }}>{CONTACT.lead}</p>
        </div>
        <InquiryForm type={type} onTypeChange={onTypeChange} />
      </div>
    </section>
  );
}

/* ───────────── Pie ───────────── */
export function Footer() {
  return (
    <footer className="ads-footer">
      <div className="ads-wrap ads-footer__grid">
        <div style={{ display: "grid", gap: 14 }}>
          <BrandMark />
          <p style={{ maxWidth: "52ch" }}>{FOOTER.line}</p>
        </div>
        <nav aria-label="Pie de página">
          {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          <Link to="/">{FOOTER.homeLabel}</Link>
        </nav>
      </div>
    </footer>
  );
}
