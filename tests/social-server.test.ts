import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, safeEqual, sha256 } from "../server/social/crypto";
import { backoffSeconds, idempotencyKey, MAX_ATTEMPTS } from "../server/social/publish";
import { ProviderError, sanitizeError } from "../server/social/sanitize";
import { opportunityFingerprint } from "../src/lib/social/hash";

describe("cifrado de tokens", () => {
  const key = randomBytes(32);
  it("ida y vuelta, y el texto cifrado no contiene el token", () => {
    const enc = encryptSecret("EAAB-token-secreto", key);
    expect(enc).not.toContain("secreto");
    expect(decryptSecret(enc, key)).toBe("EAAB-token-secreto");
  });
  it("falla con otra clave o con datos alterados", () => {
    const enc = encryptSecret("x", key);
    expect(() => decryptSecret(enc, randomBytes(32))).toThrow();
    const tampered = enc.slice(0, -2) + (enc.endsWith("AA") ? "BB" : "AA");
    expect(() => decryptSecret(tampered, key)).toThrow();
  });
  it("cada cifrado usa un IV distinto", () => {
    expect(encryptSecret("x", key)).not.toBe(encryptSecret("x", key));
  });
  it("comparación en tiempo constante y hash", () => {
    expect(safeEqual(sha256("a"), sha256("a"))).toBe(true);
    expect(safeEqual(sha256("a"), sha256("b"))).toBe(false);
  });
});

describe("idempotencia y reintentos", () => {
  it("la clave es determinista por publicación+versión+cuenta (doble clic = misma clave)", () => {
    expect(idempotencyKey("p", 1, "a")).toBe(idempotencyKey("p", 1, "a"));
    expect(idempotencyKey("p", 1, "a")).not.toBe(idempotencyKey("p", 2, "a"));
    expect(idempotencyKey("p", 1, "a")).not.toBe(idempotencyKey("p", 1, "b"));
  });
  it("espera progresiva acotada y límite de intentos", () => {
    expect(backoffSeconds(1)).toBe(60);
    expect(backoffSeconds(2)).toBe(120);
    expect(backoffSeconds(20)).toBe(900);
    expect(MAX_ATTEMPTS).toBe(3);
  });
});

describe("errores", () => {
  it("redacta tokens y secretos", () => {
    const m = sanitizeError(new Error("fail access_token=EAAxyz123 Bearer abc.def.ghi bot123456:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"));
    expect(m).not.toMatch(/EAAxyz123|abc\.def\.ghi|AAAAAAAAAA/);
  });
  it("distingue resultados inciertos de fallas confirmadas", () => {
    expect(new ProviderError("timeout", true, true).uncertain).toBe(true);
    expect(new ProviderError("400", false, false).uncertain).toBe(false);
  });
});

describe("cambios de la oportunidad", () => {
  it("la huella cambia solo si cambian los datos públicos", () => {
    const a = opportunityFingerprint(["s", "t", "tipo", "d", "loc", "/f.webp"]);
    expect(opportunityFingerprint(["s", "t", "tipo", "d", "loc", "/f.webp"])).toBe(a);
    expect(opportunityFingerprint(["s", "t2", "tipo", "d", "loc", "/f.webp"])).not.toBe(a);
  });
});
