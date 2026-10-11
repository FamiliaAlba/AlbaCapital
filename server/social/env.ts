/** Lectura centralizada de variables de entorno del módulo. Nunca se devuelven los valores al cliente. */
const get = (name: string): string | undefined => {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
};

export const env = {
  supabaseUrl: () => get("SUPABASE_URL") ?? get("VITE_SUPABASE_URL"),
  serviceRoleKey: () => get("SUPABASE_SERVICE_ROLE_KEY"),
  encKey: () => get("SOCIAL_TOKEN_ENC_KEY"),
  siteUrl: () => (get("SOCIAL_SITE_URL") ?? get("VITE_SITE_URL") ?? "https://albacapital.com").replace(/\/+$/, ""),
  metaAppId: () => get("META_APP_ID"),
  metaAppSecret: () => get("META_APP_SECRET"),
  metaGraphVersion: () => get("META_GRAPH_VERSION") ?? "v23.0",
  linkedinClientId: () => get("LINKEDIN_CLIENT_ID"),
  linkedinClientSecret: () => get("LINKEDIN_CLIENT_SECRET"),
  linkedinVersion: () => get("LINKEDIN_API_VERSION") ?? "202609",
  linkedinOrgScopes: () => get("LINKEDIN_ENABLE_ORG_PAGES") === "true",
};

/** Qué piezas de configuración faltan (solo nombres, nunca valores). */
export function configStatus() {
  const base = [
    !env.supabaseUrl() && "SUPABASE_URL",
    !env.serviceRoleKey() && "SUPABASE_SERVICE_ROLE_KEY",
    !env.encKey() && "SOCIAL_TOKEN_ENC_KEY",
  ].filter(Boolean) as string[];
  return {
    base,
    meta: [!env.metaAppId() && "META_APP_ID", !env.metaAppSecret() && "META_APP_SECRET"].filter(Boolean) as string[],
    linkedin: [
      !env.linkedinClientId() && "LINKEDIN_CLIENT_ID",
      !env.linkedinClientSecret() && "LINKEDIN_CLIENT_SECRET",
    ].filter(Boolean) as string[],
    siteUrl: env.siteUrl(),
    linkedinOrgPages: env.linkedinOrgScopes(),
  };
}
