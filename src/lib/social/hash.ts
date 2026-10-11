/** Huella estable (FNV-1a 64 bits como dos 32) de los datos públicos que alimentan una pieza. */
export function opportunityFingerprint(parts: Array<string | null | undefined>): string {
  const s = parts.map((p) => p ?? "").join("␟");
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
    h2 ^= h2 >>> 13;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}
