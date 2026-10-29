import { describe, expect, it } from "vitest";
import { ASSET_VERSION, HERO_VIDEO, HERO_VIDEO_TIMING, classifyPlayError, isHeadlineVisible, shouldAllowVideo } from "../src/lib/heroVideo";

describe("heroVideo", () => {
  it("las fuentes llevan versión para evitar cachés viejas", () => {
    for (const v of [HERO_VIDEO.desktop, HERO_VIDEO.mobile]) {
      expect(v.src).toMatch(new RegExp(`\\.mp4\\?v=${ASSET_VERSION}$`));
      expect(v.poster).toMatch(new RegExp(`\\.webp\\?v=${ASSET_VERSION}$`));
    }
  });
  it("sin video con reducir movimiento, ahorro de datos o 2G/3G", () => {
    expect(shouldAllowVideo(true)).toBe(false);
    expect(shouldAllowVideo(false, { saveData: true })).toBe(false);
    for (const t of ["slow-2g", "2g", "3g"]) expect(shouldAllowVideo(false, { effectiveType: t })).toBe(false);
  });
  it("con 4G, sin información de red o sin restricciones sí se permite", () => {
    expect(shouldAllowVideo(false, { effectiveType: "4g" })).toBe(true);
    expect(shouldAllowVideo(false)).toBe(true);
    expect(shouldAllowVideo(false, null)).toBe(true);
  });
  it("AbortError se ignora, NotAllowedError pide gesto y lo demás deja la imagen", () => {
    expect(classifyPlayError({ name: "AbortError" })).toBe("ignore");
    expect(classifyPlayError({ name: "NotAllowedError" })).toBe("blocked");
    expect(classifyPlayError({ name: "NotSupportedError" })).toBe("failed");
    expect(classifyPlayError(null)).toBe("failed");
  });
  it("el titular se ve sin video y, con video, solo en el tramo final", () => {
    expect(isHeadlineVisible(false, 5)).toBe(true);
    expect(isHeadlineVisible(true, 5)).toBe(false);
    expect(isHeadlineVisible(true, HERO_VIDEO_TIMING.textFrom)).toBe(true);
    expect(isHeadlineVisible(true, HERO_VIDEO_TIMING.textUntil)).toBe(true);
    expect(isHeadlineVisible(true, HERO_VIDEO_TIMING.duration)).toBe(false);
  });
});
