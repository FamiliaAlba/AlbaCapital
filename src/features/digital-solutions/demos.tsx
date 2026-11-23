import { useState } from "react";
import { ArrowRight, Check, Wifi, WifiOff, CalendarCheck, Smartphone, Workflow, Boxes } from "lucide-react";
import { TabList, type TabItem } from "./Tabs";
import { panelId, tabId } from "./tabIds";
import { SYSTEMS } from "./content";
import { CRM_LEADS, CRM_STAGES, ERP_MODULES, ERP_VIEWS, PWA_TASKS, type CrmLead, type CrmStage, type ErpModule } from "./demoData";

/* ───────────── CRM ───────────── */
function CrmDemo() {
  const [leads, setLeads] = useState<CrmLead[]>(CRM_LEADS);
  const [selected, setSelected] = useState<string>(CRM_LEADS[0].id);
  const current = leads.find((l) => l.id === selected) ?? leads[0];
  const stageLabel = (s: CrmStage) => CRM_STAGES.find((x) => x.key === s)!.label;
  const nextStage = (s: CrmStage): CrmStage | null => {
    const i = CRM_STAGES.findIndex((x) => x.key === s);
    return i < CRM_STAGES.length - 1 ? CRM_STAGES[i + 1].key : null;
  };
  const advance = () => {
    const to = nextStage(current.stage);
    if (!to) return;
    setLeads((all) => all.map((l) => (l.id === current.id ? { ...l, stage: to, agenda: to === "visita" ? "A coordinar" : l.agenda, next: to === "visita" ? "Agendar fecha y confirmar asistencia" : to === "propuesta" ? "Enviar propuesta por escrito" : "Definir la próxima acción" } : l)));
  };

  return (
    <div>
      <div className="ads-demo__value">
        <strong>Cada consulta tiene origen, responsable y próxima acción.</strong>
        <span>Tocá una tarjeta para ver su detalle y avanzala de etapa: así se ordena el seguimiento comercial.</span>
      </div>
      <div className="ads-kanban">
        {CRM_STAGES.map((st) => {
          const col = leads.filter((l) => l.stage === st.key);
          return (
            <div className="ads-col" key={st.key} role="group" aria-label={`Etapa ${st.label}: ${col.length} consultas`}>
              <h4><span>{st.label}</span><span aria-hidden="true">{col.length}</span></h4>
              {col.map((l) => (
                <button key={l.id} type="button" className="ads-card" aria-pressed={l.id === current.id} onClick={() => setSelected(l.id)}>
                  <b>{l.title}</b>
                  <small>{l.origin} · {l.owner}</small>
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div className="ads-detail" aria-live="polite">
        <strong style={{ fontSize: 17 }}>{current.title}</strong>
        <dl>
          <div><dt>Origen</dt><dd>{current.origin}</dd></div>
          <div><dt>Etapa</dt><dd>{stageLabel(current.stage)}</dd></div>
          <div><dt>Responsable</dt><dd>{current.owner}</dd></div>
          <div><dt>Agenda</dt><dd>{current.agenda}</dd></div>
          <div><dt>Próxima acción</dt><dd>{current.next}</dd></div>
        </dl>
        <div>
          {nextStage(current.stage) ? (
            <button type="button" className="ads-btn ads-btn--primary" onClick={advance}>
              Pasar a «{stageLabel(nextStage(current.stage)!)}» <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <span className="ads-tag"><CalendarCheck size={14} aria-hidden="true" style={{ marginRight: 6 }} />Última etapa del tablero</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── ERP ───────────── */
function ErpDemo() {
  const [mod, setMod] = useState<ErpModule>("compras");
  const view = ERP_VIEWS[mod];
  const items: TabItem<ErpModule>[] = ERP_MODULES;
  return (
    <div className="ads-erp">
      <div className="ads-demo__value">
        <strong>Compras, ventas, stock y administración en una sola vista.</strong>
        <span>Cambiá de módulo para ver cómo se conectan: cada pedido, documento o artículo tiene estado y responsable.</span>
      </div>
      <TabList<ErpModule> idBase="erp" items={items} value={mod} onChange={setMod} label="Módulos del sistema de gestión" />
      <div role="tabpanel" id={panelId("erp", mod)} aria-labelledby={tabId("erp", mod)} tabIndex={0} className="ads-erp">
        <div className="ads-kpis">
          {view.kpis.map((k) => (
            <div className="ads-kpi" key={k.label}><span>{k.label}</span><strong>{k.value}</strong></div>
          ))}
        </div>
        <div className="ads-table-wrap" role="region" tabIndex={0} aria-label={`Tabla del módulo ${ERP_MODULES.find((m) => m.key === mod)!.label}: se desplaza hacia los costados si no entra en pantalla`}>
          <table className="ads-table">
            <caption className="ads-sr">Detalle del módulo {ERP_MODULES.find((m) => m.key === mod)!.label} (datos ficticios)</caption>
            <thead>
              <tr>{view.headers.map((h) => <th scope="col" key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {view.rows.map((r) => (
                <tr key={r.cells[0]}>
                  {r.cells.map((c) => <td key={c}>{c}</td>)}
                  {r.bar !== undefined && (
                    <td><div className="ads-bar" role="img" aria-label={`Nivel de stock ${r.bar} por ciento`}><i style={{ width: `${r.bar}%` }} /></div></td>
                  )}
                  <td>{r.status && <span className={`ads-status ads-status--${r.status.tone}`}>{r.status.text}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--ads-muted)", fontSize: 15 }}>{view.note}</p>
      </div>
    </div>
  );
}

/* ───────────── PWA ───────────── */
function PwaDemo() {
  const [tasks, setTasks] = useState(PWA_TASKS);
  const [offline, setOffline] = useState(false);
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const toggle = (id: string) => setTasks((all) => all.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  return (
    <div className="ads-pwa">
      <div className="ads-phone">
        <div className="ads-phone__screen">
          <div className="ads-phone__notch" aria-hidden="true" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 17 }}>Parte diario</strong>
            <span className="ads-tag">{offline ? "Sin conexión" : "En línea"}</span>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--ads-muted)", marginBottom: 6 }}>
              <span>Avance de hoy</span><span aria-live="polite">{done} de {tasks.length}</span>
            </div>
            <div className="ads-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Avance de las tareas de hoy"><i style={{ width: `${pct}%` }} /></div>
          </div>
          {tasks.map((t) => (
            <button key={t.id} type="button" className="ads-task" aria-pressed={t.done} onClick={() => toggle(t.id)}>
              <span className="ads-task__box" aria-hidden="true">{t.done && <Check size={16} />}</span>
              <span className="ads-task__label">{t.label}</span>
            </button>
          ))}
          <p style={{ fontSize: 13.5, color: "var(--ads-muted)" }}>
            {offline ? "Los registros se guardan en el celular y se envían solos cuando vuelve la señal." : "Los registros llegan al equipo de oficina al instante."}
          </p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        <div className="ads-demo__value">
          <strong>Registro desde el celular, también en el campo.</strong>
          <span>Se instala como una aplicación, se usa con una mano y no pierde datos si falta la señal.</span>
        </div>
        <ul className="ads-points">
          <li><Smartphone size={22} aria-hidden="true" /><span>Pantallas grandes y simples, pensadas para usar en obra, en un depósito o en un campo.</span></li>
          <li><Workflow size={22} aria-hidden="true" /><span>Cada tarea registrada actualiza el tablero de la oficina, sin planillas ni mensajes sueltos.</span></li>
          <li><Boxes size={22} aria-hidden="true" /><span>Roles y permisos: cada persona ve y carga solo lo que le corresponde.</span></li>
        </ul>
        <div>
          <button type="button" className="ads-switch" aria-pressed={offline} onClick={() => setOffline((v) => !v)}>
            {offline ? <WifiOff size={18} aria-hidden="true" /> : <Wifi size={18} aria-hidden="true" />}
            {offline ? "Probando sin conexión" : "Probar sin conexión"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Contenedor con pestañas ───────────── */
type DemoKey = "crm" | "erp" | "pwa";
const DEMOS: TabItem<DemoKey>[] = [
  { key: "crm", label: "CRM" },
  { key: "erp", label: "ERP" },
  { key: "pwa", label: "PWA" },
];

export function SystemsDemo() {
  const [tab, setTab] = useState<DemoKey>("crm");
  return (
    <div className="ads-demo">
      <div className="ads-demo__head">
        <TabList<DemoKey> idBase="demo" items={DEMOS} value={tab} onChange={setTab} label={SYSTEMS.demoTitle} />
        <span className="ads-tag">{SYSTEMS.demoTag}</span>
      </div>
      <div className="ads-demo__body" role="tabpanel" id={panelId("demo", tab)} aria-labelledby={tabId("demo", tab)} tabIndex={0}>
        {tab === "crm" && <CrmDemo />}
        {tab === "erp" && <ErpDemo />}
        {tab === "pwa" && <PwaDemo />}
        <p style={{ marginTop: 20, fontSize: 13.5, color: "var(--ads-muted)" }}>{SYSTEMS.demoNote}</p>
      </div>
    </div>
  );
}
