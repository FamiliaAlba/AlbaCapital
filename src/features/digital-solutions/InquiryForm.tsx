import { useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { CONTACT } from "./content";
import {
  COOLDOWN_MS, INQUIRY_TYPES, getInquiryEndpoint, isInquiryType, submitInquiry, validateInquiry,
  type InquiryErrors, type InquiryField, type InquiryType,
} from "./inquiry";

type Status = "idle" | "sending" | "sent" | "error" | "not-configured" | "blocked" | "cooldown";

interface Props {
  type: InquiryType | "";
  onTypeChange: (t: InquiryType | "") => void;
  /** Para pruebas: fuerza el endpoint (null = sin receptor). Por defecto sale de VITE_DS_INQUIRY_ENDPOINT. */
  endpoint?: string | null;
  now?: () => number;
  fetchImpl?: typeof fetch;
}

export function InquiryForm({ type, onTypeChange, endpoint, now = Date.now, fetchImpl }: Props) {
  const base = useId();
  const id = (k: string) => `${base}-${k}`;
  const resolvedEndpoint = endpoint === undefined ? getInquiryEndpoint() : endpoint;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");
  const lastSent = useRef<number | null>(null);
  const fields = useRef<Partial<Record<InquiryField, HTMLElement | null>>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const v = validateInquiry({ name, contact, type, message });
    if ("errors" in v) {
      setErrors(v.errors);
      setStatus("idle");
      const first = (["name", "contact", "type", "message"] as InquiryField[]).find((k) => v.errors[k]);
      if (first) requestAnimationFrame(() => fields.current[first]?.focus());
      return;
    }
    setErrors({});
    const t = now();
    if (lastSent.current !== null && t - lastSent.current < COOLDOWN_MS) {
      setStatus("cooldown");
      return;
    }
    setStatus("sending");
    const r = await submitInquiry(v.data, { endpoint: resolvedEndpoint, honeypot: trap, fetchImpl });
    if (r.status === "sent") {
      lastSent.current = t;
      setName(""); setContact(""); setMessage(""); onTypeChange("");
      setStatus("sent");
    } else if (r.status === "error") {
      setServerMsg(r.message);
      setStatus("error");
    } else {
      setStatus(r.status);
    }
  };

  const err = (k: InquiryField) => errors[k];
  const describe = (k: InquiryField, extra?: string) => [err(k) ? id(`${k}-err`) : null, extra].filter(Boolean).join(" ") || undefined;
  const Err = ({ k }: { k: InquiryField }) =>
    err(k) ? (
      <p className="ads-error" id={id(`${k}-err`)}><AlertCircle size={18} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} />{err(k)}</p>
    ) : null;

  return (
    <form className="ads-form" onSubmit={onSubmit} noValidate aria-describedby={!resolvedEndpoint ? id("notice") : undefined}>
      {!resolvedEndpoint && (
        <p className="ads-notice ads-notice--info" role="note" id={id("notice")}>
          <Info size={20} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} />
          <span>{CONTACT.previewNotice}</span>
        </p>
      )}

      <div className="ads-field">
        <label htmlFor={id("name")}>Nombre</label>
        <input id={id("name")} ref={(el) => { fields.current.name = el; }} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err("name")} aria-describedby={describe("name")} maxLength={80} />
        <Err k="name" />
      </div>

      <div className="ads-field">
        <label htmlFor={id("contact")}>Correo o teléfono</label>
        <input id={id("contact")} ref={(el) => { fields.current.contact = el; }} name="contact" autoComplete="email" inputMode="email" value={contact} onChange={(e) => setContact(e.target.value)} aria-invalid={!!err("contact")} aria-describedby={describe("contact", id("contact-help"))} maxLength={120} />
        <p className="ads-help" id={id("contact-help")}>Para responderte. Si es un teléfono, con código de área.</p>
        <Err k="contact" />
      </div>

      <div className="ads-field">
        <label htmlFor={id("type")}>Tipo de consulta</label>
        <select id={id("type")} ref={(el) => { fields.current.type = el; }} name="type" value={type} onChange={(e) => onTypeChange(isInquiryType(e.target.value) ? e.target.value : "")} aria-invalid={!!err("type")} aria-describedby={describe("type")}>
          <option value="">Elegí una opción</option>
          {INQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Err k="type" />
      </div>

      <div className="ads-field">
        <label htmlFor={id("message")}>Mensaje</label>
        <textarea id={id("message")} ref={(el) => { fields.current.message = el; }} name="message" value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!err("message")} aria-describedby={describe("message", id("message-help"))} maxLength={1000} />
        <p className="ads-help" id={id("message-help")}>{message.length} de 1000 caracteres</p>
        <Err k="message" />
      </div>

      {/* Campo trampa para bots: las personas no lo ven ni lo completan. */}
      <div className="ads-hp" aria-hidden="true">
        <label htmlFor={id("web")}>No completar este campo</label>
        <input id={id("web")} name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>

      <p className="ads-help">{CONTACT.privacy}</p>

      <div>
        <button type="submit" className="ads-btn ads-btn--ink" disabled={status === "sending"} aria-disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar consulta"}
        </button>
      </div>

      <div role="status" aria-live="polite">
        {status === "sent" && (
          <p className="ads-notice ads-notice--ok"><CheckCircle2 size={20} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} /><span>Recibimos tu consulta. Te respondemos a la brevedad.</span></p>
        )}
        {status === "not-configured" && (
          <p className="ads-notice ads-notice--error"><AlertCircle size={20} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} /><span>{CONTACT.notConfigured}</span></p>
        )}
        {status === "error" && (
          <p className="ads-notice ads-notice--error"><AlertCircle size={20} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} /><span>{serverMsg}</span></p>
        )}
        {status === "blocked" && (
          <p className="ads-notice ads-notice--error"><AlertCircle size={20} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} /><span>No pudimos enviar la consulta. Probá de nuevo en unos minutos.</span></p>
        )}
        {status === "cooldown" && (
          <p className="ads-notice ads-notice--info"><Info size={20} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} /><span>Ya enviaste una consulta hace instantes. Esperá unos segundos antes de enviar otra.</span></p>
        )}
      </div>
    </form>
  );
}
