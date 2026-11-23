/**
 * Contenido de ALBA ENGINE dentro de Alba Capital (versión resumida).
 * Todo el texto visible está acá.
 */

export const BRAND = "ALBA ENGINE";

export const HERO = {
  title: "Tecnología a medida de tu empresa y desarrollo de modelos de negocios",
  lead: "Creamos sistemas para empresas y acompañamos a propietarios y desarrollistas a evaluar, visualizar y llevar sus proyectos al mercado",
  chips: ["Sistemas de gestión", "Visualización 3D y 360°", "Asesoramiento inmobiliario"],
};

/** Imagen de fondo de la portada (archivo en public/digital-solutions/). */
export const HERO_IMAGE = { src: "/digital-solutions/portada.webp", width: 996, height: 690 };

export const VISUALIZATION = {
  eyebrow: "Visualización 3D y 360°",
  title: "Mostrá el proyecto antes de construirlo",
  lead: "Un comprador entiende un proyecto cuando lo recorre. Pasamos del plano a la imagen y de la vista general al detalle de cada sector.",
  mpTitle: "Masterplan ilustrativo",
  mpHint: "Tocá un sector, un lote o un punto del plano.",
};

/** Versión resumida para Alba Capital: tres líneas de trabajo y un solo botón hacia el contacto que ya tiene el sitio. */
export const RESUMEN = {
  eyebrow: "Qué hacemos",
  cta: "Consultar por Alba Engine",
  ctaTo: "/contact",
  pillars: [
    { key: "sistemas", title: "Sistemas para empresas", lead: "CRM, ERP, PWA, Web y sistemas a medida.", text: "Definimos el flujo con vos, lo construimos y lo conectamos con las herramientas que ya usás." },
    { key: "visualizacion", title: "Visualización 3D y 360°", lead: "Renders, recorrido virtual, video arquitectónico y MasterPlan 360°.", text: "Un comprador entiende un proyecto cuando lo recorre." },
    { key: "desarrollo", title: "Desarrollo inmobiliario", lead: "Evaluamos, definimos y entregamos: diagnóstico preliminar, escenarios comparables, hoja de ruta y estrategia comercial.", text: "Antes de invertir en obra, ordenamos la información: qué se puede hacer, para quién y en qué etapas." },
  ],
  note: "La comercialización y las tareas reservadas se coordinan con los profesionales habilitados cuando corresponda. No ofrecemos dictámenes técnicos, permisos aprobados, captación de fondos ni rentabilidad garantizada.",
};

export const FOOTER = {
  line: "Los datos, proyectos y pantallas de esta página son ejemplos ilustrativos.",
  homeLabel: "Volver al inicio del sitio",
};
