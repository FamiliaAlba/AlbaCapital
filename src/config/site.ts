/**
 * Configuración centralizada del sitio Alba Capital.
 *
 * IMPORTANTE: los valores marcados como "pendiente de validación" en
 * README_PRODUCTION.md deben ser confirmados por Alba Capital antes de
 * publicar el sitio en producción. No se debe modificar este archivo
 * con datos inventados.
 */

export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://albacapital.com";

export const WHATSAPP_NUMBER = "5492664656146";

/** El mensaje efectivo se resuelve vía i18n (clave "whatsapp.message"). */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  phoneDisplay: "+54 9 266 465 6146",
  phoneHref: "tel:+5492664656146",
  email: "hola@albacapital.com",
};

/**
 * Direcciones/zonas de operación. PENDIENTE DE VALIDACIÓN: el proyecto
 * original tenía dos textos distintos e incompatibles entre el componente
 * de inicio ("San Luis, Córdoba, Buenos Aires, La Pampa, Río Negro,
 * Neuquén") y la página de contacto ("Buenos Aires"). Se unificó
 * provisoriamente a un único texto; Alba Capital debe confirmar cuál es
 * la información correcta.
 */
export const OFFICE_LOCATIONS = ["Buenos Aires"];

/**
 * Redes sociales. Solo se muestra el ícono si la URL está confirmada.
 * PENDIENTE DE VALIDACIÓN: el proyecto original tenía href="#" en los
 * tres íconos (Instagram, LinkedIn, Facebook) sin URL real. No se
 * inventaron perfiles — permanecen ocultos hasta tener la URL real.
 */
export const SOCIAL_LINKS: { name: string; url: string | null }[] = [
  { name: "Instagram", url: null },
  { name: "LinkedIn", url: null },
  { name: "Facebook", url: null },
];
