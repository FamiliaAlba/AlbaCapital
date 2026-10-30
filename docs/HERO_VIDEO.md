# Video de portada (Hero)

Un solo clip de 28 s, sin audio, en bucle: campo, ganadería, obra, loteo, energía y puerto con títulos sobrios palabra por palabra, el logo de Alba Capital y el cierre sobre la imagen de portada de siempre (`src/assets/hero-architecture.webp`).

## Archivos
- `public/hero/alba-hero-desktop.mp4` (1920×1080) y `alba-hero-mobile.mp4` (720×1280), más las versiones `-en` y `-pt`. H.264 High 4.1, yuv420p, BT.709, `+faststart`, sin pista de audio.
- `public/hero/alba-hero-*.webp`: portada de cada recorte (la imagen original).
- `src/lib/heroVideo.ts`: rutas con `?v=ASSET_VERSION` (subirla al regenerar), tiempos y reglas puras (testeadas en `tests/hero-video.test.ts`).
- `src/components/Hero.tsx`: componente.

## Comportamiento
- La imagen de portada se ve primero; el video se pide recién cuando la página terminó de cargar (tope 2,5 s).
- `AbortError` se ignora; `NotAllowedError` deja la imagen y reintenta en el primer toque, clic o tecla.
- Con "reducir movimiento", ahorro de datos o conexión 2G/3G: solo imagen.
- Se pausa fuera de pantalla o con la pestaña oculta; botón accesible de pausa/reanudar (`hero.pause` / `hero.play`).
- El tono sepia oscuro original (`grayscale(100%) sepia(35%) contrast(1.05) brightness(0.9)`) va como capa por delante del video con `backdrop-filter` (con prefijo `-webkit-`); si el navegador no lo soporta, se aplica el filtro al contenedor. Por eso los clips se ven monocromos, igual que la portada.
- El titular (`h1` + subtítulo) siempre está en el documento. Sin video se ve como siempre; con video activo solo se ve en el tramo final (`HERO_VIDEO_TIMING`), cuando el cuadro es la portada original.
- Los títulos van dentro del video, así que hay una versión por idioma: `alba-hero-{desktop,mobile}.mp4` (español), `-en.mp4` y `-pt.mp4`. `heroVideoFor(locale)` elige la versión según el idioma activo; cualquier otro idioma usa español.

## Regenerar el montaje
Herramientas fuera del repo: `~/Projects/albacapital-hero-tools/alba` (`LANG_HERO=es|en|pt python3 titles.py` genera las capas de títulos y el logo; `LANG_HERO=… python3 build.py desktop|mobile` arma el video). Orígenes en `~/Downloads/ALBA CAPITAL MATERIAL` y `~/Downloads/27325-363287658.mp4`. Si cambian los tiempos, actualizar `HERO_VIDEO_TIMING` y `ASSET_VERSION`.
