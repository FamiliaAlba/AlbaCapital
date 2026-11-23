import { describe, expect, it, vi } from "vitest";
import { COOLDOWN_MS, getInquiryEndpoint, submitInquiry, validateInquiry } from "../src/features/digital-solutions/inquiry";

const valid = { name: "Ana Pérez", contact: "ana@example.com", type: "software", message: "Necesito ordenar el seguimiento de consultas." };

describe("validateInquiry", () => {
  it("acepta datos completos y recorta espacios", () => {
    const r = validateInquiry({ ...valid, name: "  Ana Pérez  " });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.name).toBe("Ana Pérez");
  });

  it("acepta un teléfono con código de área en lugar de un correo", () => {
    expect(validateInquiry({ ...valid, contact: "+54 9 266 465-6146" }).ok).toBe(true);
    expect(validateInquiry({ ...valid, contact: "(266) 4656146" }).ok).toBe(true);
  });

  it("rechaza todos los campos vacíos con un mensaje por campo", () => {
    const r = validateInquiry({ name: "", contact: "", type: "", message: "" });
    expect(r.ok).toBe(false);
    if ("errors" in r) {
      expect(Object.keys(r.errors).sort()).toEqual(["contact", "message", "name", "type"]);
      expect(r.errors.name).toMatch(/nombre/i);
      expect(r.errors.type).toMatch(/tipo de consulta/i);
    } else {
      throw new Error("se esperaban errores de validación");
    }
  });

  it("rechaza contactos que no son correo ni teléfono", () => {
    for (const contact of ["hola", "ana@", "123", "ana@example", "abc 12345678"]) {
      const r = validateInquiry({ ...valid, contact });
      expect(r.ok, contact).toBe(false);
    }
  });

  it("rechaza un tipo desconocido y mensajes muy cortos o muy largos", () => {
    expect(validateInquiry({ ...valid, type: "otro" }).ok).toBe(false);
    expect(validateInquiry({ ...valid, message: "corto" }).ok).toBe(false);
    expect(validateInquiry({ ...valid, message: "x".repeat(1001) }).ok).toBe(false);
    expect(validateInquiry({ ...valid, message: "x".repeat(1000) }).ok).toBe(true);
  });
});

describe("getInquiryEndpoint", () => {
  it("sin configurar devuelve null", () => {
    expect(getInquiryEndpoint("")).toBeNull();
    expect(getInquiryEndpoint(undefined)).toBeNull();
    expect(getInquiryEndpoint("   ")).toBeNull();
  });

  it("solo admite HTTPS o rutas relativas", () => {
    expect(getInquiryEndpoint("https://recibo.example.com/consultas")).toBe("https://recibo.example.com/consultas");
    expect(getInquiryEndpoint("/api/consultas")).toBe("/api/consultas");
    expect(getInquiryEndpoint("http://inseguro.example.com")).toBeNull();
    expect(getInquiryEndpoint("javascript:alert(1)")).toBeNull();
    expect(getInquiryEndpoint("//otro.example.com")).toBeNull();
    expect(getInquiryEndpoint("/\\otro.example.com")).toBeNull();
  });
});

describe("submitInquiry", () => {
  const data = { name: "Ana Pérez", contact: "ana@example.com", type: "software" as const, message: "Necesito ordenar el seguimiento de consultas." };

  it("sin receptor configurado no envía nada y nunca devuelve 'sent'", async () => {
    const fetchImpl = vi.fn();
    const r = await submitInquiry(data, { endpoint: null, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ status: "not-configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("el campo trampa bloquea el envío aunque haya receptor", async () => {
    const fetchImpl = vi.fn();
    const r = await submitInquiry(data, { endpoint: "https://recibo.example.com", honeypot: "http://spam", fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ status: "blocked" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("con receptor envía un POST JSON con el origen de la landing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const r = await submitInquiry(data, { endpoint: "https://recibo.example.com", fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r).toEqual({ status: "sent" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://recibo.example.com");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ ...data, source: "alba-digital-solutions" });
  });

  it("si el receptor responde con error, informa el error (no éxito)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const r = await submitInquiry(data, { endpoint: "https://recibo.example.com", fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r.status).toBe("error");
  });

  it("si falla la red, informa el error (no éxito)", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("network"));
    const r = await submitInquiry(data, { endpoint: "https://recibo.example.com", fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(r.status).toBe("error");
  });

  it("la espera entre envíos es de 30 segundos", () => {
    expect(COOLDOWN_MS).toBe(30_000);
  });
});
