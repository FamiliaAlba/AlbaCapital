/**
 * Contenido editable de la landing ALBA DIGITAL SOLUTIONS.
 * Todo el texto visible está acá (los datos de las demostraciones, en demoData.ts).
 */

export const BRAND = "ALBA ENGINE";

export const SECTIONS = {
  sistemas: "sistemas",
  visualizacion: "visualizacion",
  desarrollo: "desarrollo-inmobiliario",
  caso: "caso-integrado",
  contacto: "contacto",
} as const;

export const NAV = [
  { label: "Sistemas", href: `#${SECTIONS.sistemas}` },
  { label: "Visualización 3D", href: `#${SECTIONS.visualizacion}` },
  { label: "Desarrollo inmobiliario", href: `#${SECTIONS.desarrollo}` },
  { label: "Contacto", href: `#${SECTIONS.contacto}` },
] as const;

export const HERO = {
  title: "Tecnología a medida de tu empresa y desarrollo de modelos de negocios",
  lead: "Creamos sistemas para empresas y acompañamos a propietarios y desarrollistas a evaluar, visualizar y llevar sus proyectos al mercado",
  ctaSystems: "Necesito una solución digital",
  ctaDevelopment: "Quiero desarrollar un proyecto inmobiliario",
  chips: ["Sistemas de gestión", "Visualización 3D y 360°", "Asesoramiento inmobiliario"],
  note: "Se contratan por separado o combinados.",
};

/** Imagen de fondo de la portada (archivo en public/digital-solutions/). */
export const HERO_IMAGE = { src: "/digital-solutions/portada.webp", width: 996, height: 690 };

export const SYSTEMS = {
  eyebrow: "Sistemas para empresas",
  title: "Sistemas que ordenan tu operación",
  lead: "Software para empresas de cualquier sector y para equipos comerciales inmobiliarios. Definimos el flujo con vos, lo construimos y lo conectamos con las herramientas que ya usás.",
  items: [
    { key: "crm", name: "CRM", text: "Entrada de consultas, origen, etapas, responsable, agenda y próxima acción: ninguna consulta queda sin dueño ni sin siguiente paso." },
    { key: "erp", name: "ERP", text: "Compras, ventas, stock y administración en una vista centralizada, con el alcance que necesite tu operación." },
    { key: "pwa", name: "PWA", text: "Registro de tareas o avances desde el celular, con una pantalla pensada para el trabajo de campo y que se instala como una aplicación." },
    { key: "web", name: "Web", text: "Sitios, landing pages y portales con navegación clara, formularios y autogestión según el proyecto." },
    { key: "custom", name: "Sistemas a medida", text: "Flujos, roles, integraciones, automatizaciones y tableros según cómo trabaja tu empresa." },
  ],
  demoTitle: "Así se ve",
  demoTag: "Demostración",
  demoNote: "Datos ficticios para mostrar cómo se vería cada sistema.",
  cta: "Consultar por software a medida",
};

export const VISUALIZATION = {
  eyebrow: "Visualización 3D y 360°",
  title: "Mostrá el proyecto antes de construirlo",
  lead: "Un comprador entiende un proyecto cuando lo recorre. Pasamos del plano a la imagen y de la vista general al detalle de cada sector.",
  items: [
    { name: "Renders", text: "Imágenes de arquitectura y de implantación para presentar el proyecto con claridad." },
    { name: "Recorrido virtual", text: "Un paseo por los espacios, con acceso desde cualquier dispositivo." },
    { name: "Video arquitectónico", text: "Piezas audiovisuales que se cargan bajo demanda, sin sonido automático." },
    { name: "MasterPlan 360°", text: "El plano del loteo o desarrollo, navegable: de la vista general al lote." },
  ],
  mpTitle: "Masterplan ilustrativo",
  mpHint: "Tocá un sector, un lote o un punto del plano.",
  cta: "Consultar por visualización 3D y 360°",
};

export const ADVISORY = {
  eyebrow: "Desarrollo inmobiliario",
  title: "Definí qué desarrollar y cómo llevarlo al mercado",
  lead: "Antes de invertir en obra, ordenamos la información: qué se puede hacer, para quién y en qué etapas.",
  blocks: [
    { title: "Qué evaluamos", points: ["Contexto y situación inicial del terreno o inmueble.", "Posibles usos del terreno o inmueble.", "Escenarios preliminares para comparar."] },
    { title: "Qué definimos", points: ["Concepto de producto y público al que apunta.", "Etapas del desarrollo.", "Puntos de riesgo y especialistas que deben intervenir."] },
    { title: "Qué entregamos", points: ["Diagnóstico preliminar.", "Escenarios comparables.", "Hoja de ruta.", "Estrategia comercial."] },
  ],
  note: "La comercialización y las tareas reservadas se coordinan con los profesionales habilitados cuando corresponda. No ofrecemos dictámenes técnicos, permisos aprobados, captación de fondos ni rentabilidad garantizada.",
  cta: "Consultar por asesoramiento inmobiliario",
};

export const CASE = {
  eyebrow: "Caso integrado",
  tag: "Ejemplo ilustrativo",
  title: "Un loteo, del terreno al mercado",
  lead: "Las dos actividades se complementan. Seguimos un mismo loteo hipotético en cuatro etapas: lo evaluamos, lo visualizamos, gestionamos sus consultas y acompañamos la salida comercial.",
  steps: [
    {
      n: "1 · Evaluar",
      title: "Qué se puede hacer con el terreno",
      receive: "Una ficha del terreno y la comparación de dos escenarios de ocupación.",
      improves: "Decidir con qué escenario seguir antes de proyectar y de gastar en obra.",
    },
    {
      n: "2 · Visualizar",
      title: "El loteo, antes de construirlo",
      receive: "Un plano o masterplan que explica lotes, accesos y espacios comunes.",
      improves: "Mostrar el proyecto con claridad a socios, compradores y profesionales.",
    },
    {
      n: "3 · Gestionar",
      title: "De la consulta a la visita",
      receive: "Una web que capta la consulta sobre un lote y un CRM que la asigna, registra la visita y deja visible la próxima acción.",
      improves: "Que ninguna consulta quede sin responsable ni sin seguimiento.",
    },
    {
      n: "4 · Acompañar la salida comercial",
      title: "Seguimiento ordenado",
      receive: "Un orden de seguimiento e indicadores disponibles para el equipo.",
      improves: "Ver qué está funcionando y dónde ajustar la estrategia comercial.",
    },
  ],
  cta: "Consultar por una solución integral",
};

export const CONTACT = {
  eyebrow: "Contacto",
  title: "Contanos qué necesitás",
  lead: "Elegí el tipo de consulta, contanos en pocas líneas qué querés resolver y te respondemos.",
  privacy: "Usamos tus datos solo para responder esta consulta. No nos envíes documentación sensible ni datos de tarjetas o claves.",
  previewNotice:
    "Vista previa: este formulario todavía no está conectado a un receptor de consultas. Por ahora no se envía ni se guarda nada.",
  notConfigured:
    "No se envió tu consulta: este formulario todavía no recibe consultas. Tus datos siguen acá, no se perdieron.",
};

export const FOOTER = {
  line: "Los datos, proyectos y pantallas de esta página son ejemplos ilustrativos.",
  homeLabel: "Volver al inicio del sitio",
};
