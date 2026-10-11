# Marketing → Redes sociales

Módulo para crear piezas de promoción de cada oportunidad y publicarlas en Instagram, Facebook, LinkedIn y un canal opcional de Telegram, desde el panel `/admin`.

## Arquitectura (decidida a partir del repositorio)

| Capa | Qué se usó |
|---|---|
| Frontend | Vite + React (existente). Editor: `src/components/social/SocialPostEditor.tsx`; botón: `SocialPostButton.tsx` (en la ficha pública y en el listado admin, solo visible a superadmins); panel: `src/pages/admin/AdminSocial.tsx` (`/admin/social`). |
| Pieza gráfica | Canvas del navegador (`src/lib/social/composer.ts`): la vista previa y la descarga usan **la misma función**. Exporta JPEG. |
| Servidor | Vercel Functions: `api/social.ts` (acciones), `api/oauth/meta.ts` y `api/oauth/linkedin.ts` (callbacks), `api/og.ts` (Open Graph para rastreadores). Lógica en `server/social/`. |
| Datos | Supabase (migración `20261011000000_social_publishing.sql`). Todas las tablas `social_*` tienen RLS **sin políticas** para `anon`/`authenticated`: solo accede el servidor con la service role. |
| Autenticación | La sesión Supabase existente. El servidor valida el JWT y el rol `superadmin` en **cada** acción. Se usa `Authorization: Bearer` (no cookies), por lo que no aplica CSRF; además se valida `Origin`. |
| Archivos | Bucket público `social-pieces` (JPEG ≤ 4 MB, escritura solo desde el servidor). Los proveedores descargan la imagen por URL; el servidor **solo** envía URLs de ese bucket (sin SSRF). |

Los datos de las piezas salen **solo** de los campos públicos de la oportunidad (es-AR). No hay IA configurada en el proyecto: título, resumen (2–3 frases tomadas del texto) y hashtags se generan por plantilla; no se inventan cifras, rentabilidades ni condiciones.

## Variables de entorno (Vercel → Settings → Environment Variables)

Ver `.env.example`. Obligatorias para operar: `SUPABASE_SERVICE_ROLE_KEY`, `SOCIAL_TOKEN_ENC_KEY` (`openssl rand -base64 32`; **no** guardarla en la base ni en el repositorio). Por red: `META_APP_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET`. Sin ellas el panel muestra qué falta y la exportación manual (descargar imagen, copiar texto) sigue funcionando.

## Guía de conexión

Las URI de redirección exactas se muestran al pie de `/admin/social` (formato `https://<dominio>/api/oauth/meta` y `/api/oauth/linkedin`).

**Facebook + Instagram (Meta).** Flujo elegido: *Facebook Login* (graph.facebook.com). No se usa Instagram Login: no se mezclan permisos.
1. developers.facebook.com → crear app tipo Business → agregar *Facebook Login*; registrar la URI de redirección.
2. Permisos: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`.
3. Instagram debe ser cuenta **profesional** vinculada a una Página de Facebook.
4. En modo desarrollo solo funciona con usuarios con rol en la app. Para uso general Meta exige **App Review** y verificación del negocio: hasta entonces las cuentas figuran “Permisos insuficientes”/no habilitadas y se usa exportación manual.
5. Instagram: solo JPEG, feed 4:5 a 1,91:1. Las historias **no** se publican por API desde acá (solo se exportan). El enlace en el pie de foto no es clickeable y no se presenta como tal. No se modifica la biografía.

**LinkedIn.** OAuth 2.0 (3 patas). Producto *Share on LinkedIn* + *Sign in with LinkedIn using OpenID Connect* para el perfil (`w_member_social`). Páginas de empresa requieren *Community Management API* aprobada por LinkedIn (`w_organization_social`, `r_organization_admin`); activar `LINKEDIN_ENABLE_ORG_PAGES=true` solo cuando esté aprobada. Se usa la Posts API versionada (`Linkedin-Version`, por defecto 202609) y la Images API (carga previa). El token dura ~60 días y no se renueva sin programa de partners: la cuenta pasa a “Requiere reconexión”. PKCE no se implementa porque LinkedIn lo admite solo para apps nativas; el `state` es de un solo uso, vence a los 10 min y está ligado al usuario y a su navegador (cookie HttpOnly).

**Telegram.** Crear bot con @BotFather, agregarlo como administrador del canal con permiso de publicar, y cargar token + `@canal` en el panel. El servidor verifica `getMe`, `getChat` y `getChatMember` sin enviar mensajes. Publica `sendPhoto` (caption ≤ 1024).

## Seguridad

- Tokens cifrados con AES-256-GCM (clave en variable de entorno, separada de la base). Nunca se devuelven al navegador; los errores se sanitizan (se redactan tokens).
- Límites de frecuencia persistidos por usuario/acción (`social_rate_events`).
- Publicar exige confirmación explícita (`confirm: true`) y se registra quién confirmó.
- Idempotencia: clave única `(post, versión, cuenta)` en la base + reclamo atómico `queued → processing`. Doble clic o reintentos concurrentes no duplican.
- Resultado incierto (timeout / interrupción) ⇒ estado `needs_review`: no se reintenta solo; se puede “Comprobar con la red” (Instagram) o resolver manualmente.
- Fallas por red: independientes. Reintento solo de las fallidas confirmadas, máx. 3 intentos, espera progresiva.
- Editar un borrador cuyo contenido ya se envió crea una **versión nueva**; no edita ni borra lo ya publicado.

## Atribución

Cada enlace lleva `utm_source=<red>&utm_medium=social&utm_campaign=oportunidad-<slug>`. El sitio guarda esos valores en `sessionStorage` y, solo si la persona envía el formulario “Me interesa”, se guardan en `leads.utm_*`. No hay analítica de terceros en el sitio ni se miden clics.

## Despliegue

1. Aplicar la migración `supabase/migrations/20261011000000_social_publishing.sql` (ya aplicada en el proyecto `ffamwpnrinuxvglcglaq`).
2. Cargar las variables en Vercel y redeployar (push a `main`).
3. Registrar las URI de redirección en Meta/LinkedIn, abrir `/admin/social` y conectar.

**Activar/desactivar:** interruptor “Módulo activo” en `/admin/social` (`social_settings.enabled`); desactivado, el servidor rechaza todas las acciones y las oportunidades no cambian.

## Limitaciones conocidas

- Los trabajos viven en la base (`social_deliveries`) y se procesan dentro de la solicitud de “Publicar”; si la función se corta, el envío queda `needs_review`. No hay cron (Vercel Hobby lo limita a diario).
- Tipografía de la pieza: pila del sistema (el sitio no carga fuentes web); el resultado puede variar levemente entre sistemas operativos, pero vista previa y descarga coinciden en el mismo equipo.
- Las oportunidades tienen una sola foto (portada); “elegir otra imagen” se resuelve subiendo una imagen autorizada.
- `api/og.ts` entrega Open Graph por oportunidad a rastreadores (Facebook, LinkedIn, WhatsApp, etc.); necesita `SUPABASE_SERVICE_ROLE_KEY`, si no devuelve los metadatos genéricos del sitio.
- Pendiente de permisos externos: App Review de Meta, Community Management API de LinkedIn, y todas las credenciales.
