# Alba Capital — Sitio web oficial

Documentación de producción. Leer completo antes de desplegar.

## 1. Requisitos

- Node.js >= 20 (declarado en `package.json` → `engines`)
- npm >= 10
- Cuenta de Vercel con acceso al equipo/proyecto
- Proyecto de Supabase (ID de referencia en `supabase/config.toml`: `foqdqoopqpmhjpktzsyd` — confirmar si es el proyecto real de producción o uno de prueba)

## 2. Instalación

```bash
npm ci
```

`npm ci` requiere que `package-lock.json` esté sincronizado con `package.json`. Si falla, es señal de que alguien editó dependencias sin regenerar el lock — correr `npm install` y commitear el lock actualizado.

## 3. Desarrollo local

```bash
cp .env.example .env.local
# completar VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Corre en `http://localhost:8080`.

## 4. Variables de entorno

Definidas en `.env.example` (nombres únicamente, sin valores):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sí | Publishable/anon key. **Nunca** la `service_role` key. |
| `VITE_SUPABASE_PROJECT_ID` | No | Solo si se usa en el código (actualmente no) |
| `VITE_SITE_URL` | Recomendada | URL pública final, usada en SEO (canonical, og:url) y en la generación de `sitemap.xml` |

Si faltan las variables de Supabase, la app arranca igual pero loguea un error claro en consola y el formulario de contacto/newsletter no van a funcionar (ver `src/integrations/supabase/client.ts`).

En Vercel: configurar estas variables en **Project Settings → Environment Variables**, separadas por entorno (Production / Preview / Development). Si Preview y Production usan proyectos de Supabase distintos, usar valores distintos por entorno.

## 5. Configuración de Supabase

1. Crear (o confirmar) el proyecto de Supabase.
2. Aplicar las migraciones (sección 6).
3. En **Authentication → URL Configuration**, no aplica (no hay login de usuarios públicos en este sitio).
4. Copiar `Project URL` y `anon/public key` desde **Project Settings → API** a las variables de entorno.

## 6. Migraciones

Ubicadas en `supabase/migrations/`:

1. `20260418005418_..._leads.sql` — tabla `leads` (formulario de contacto/inversión), RLS solo-insert.
2. `20260418005436_..._leads_constraints.sql` — constraints de validación sobre `leads`.
3. `20260808210000_newsletter_subscribers.sql` — tabla `newsletter_subscribers` para el newsletter real, RLS solo-insert, email único.
4. `20260808220000_team_module.sql` — **nueva**, tablas `team_members`, `team_member_translations`, `admin_users`, función `is_superadmin()`, triggers de auditoría y RLS.
5. `20260808220100_team_photos_storage.sql` — **nueva**, bucket `team-photos` en Storage y sus políticas.
6. `20260819010000_opportunities_module.sql` — **nueva**, tablas `opportunities` y `opportunity_translations`, RLS (reutiliza `is_superadmin()`).
7. `20260819010100_opportunity_photos_storage.sql` — **nueva**, bucket `opportunity-photos` en Storage y sus políticas.

Aplicar con la Supabase CLI:

```bash
supabase link --project-ref <project-id>
supabase db push
```

O pegar el SQL directamente en el SQL Editor del dashboard de Supabase, **en el orden numérico de los archivos** (las migraciones del equipo dependen de `auth.users`, que ya existe por defecto en todo proyecto Supabase).

**Verificación post-migración:** confirmar que RLS está habilitada en las 7 tablas y que no existe ninguna policy de `SELECT` pública sobre `leads`, `newsletter_subscribers` ni `admin_users` (solo `service_role` o el propio usuario, según corresponda, debe poder leerlas). Para `team_members`/`team_member_translations` y `opportunities`/`opportunity_translations`, confirmar que la policy pública solo permite leer registros con `status = 'published'`.

### 6.1 Módulo "Oportunidades" — gestión de activos/proyectos de inversión

Igual estándar que el módulo de equipo: CRUD completo en `/admin/opportunities` (crear, editar, publicar/despublicar, reordenar, archivar, eliminar), traducciones ES/EN/PT, foto optimizada a WebP en Supabase Storage (bucket `opportunity-photos`, lectura pública / escritura solo superadmin), RLS en ambas tablas nuevas. La página pública `/oportunidades` y el `OpportunityCard` ahora leen de Supabase (`useOpportunities` hook) en vez del archivo estático `src/data/opportunities.ts` (eliminado). Sin oportunidades publicadas, la página muestra un mensaje neutral en vez de datos ficticios.

## 7. Compilación

```bash
npm run build
```

Ejecuta primero `scripts/generate-sitemap.mjs` (genera `public/sitemap.xml`) y luego `vite build`. Salida en `dist/`.

## 8. Pruebas

El proyecto no incluye una suite de tests automatizados (Vitest/Playwright). Se priorizaron correcciones funcionales, de seguridad y de rendimiento verificables por línea de comandos dentro del tiempo disponible. Se recomienda como siguiente paso agregar al menos:
- Tests de validación de `LeadForm` y `NewsletterForm` (Vitest + Testing Library).
- Un test E2E de Playwright que recorra las rutas principales y verifique que no haya errores de consola.

Verificaciones manuales realizadas y sus resultados están en la sección 11.

## 9. Despliegue en Vercel

**No se realizó un despliegue real.** El entorno de trabajo no tiene acceso a la red de vercel.com ni a credenciales de tu cuenta de Vercel/Supabase — la lista de dominios permitidos en este sandbox es un allowlist fijo (npm, GitHub, PyPI, etc.) que no incluye vercel.com ni supabase.com. No se afirma ni se inventa ninguna URL de producción.

Pasos para que el equipo (o quien tenga acceso) lo haga:

1. Importar el repositorio en Vercel (Framework Preset: **Vite**, detectado automáticamente por `vercel.json`).
2. Configurar las variables de entorno (sección 4) para Production y Preview.
3. Deploy → Vercel genera una Preview URL automáticamente.
4. Probar la Preview URL: navegación directa a cada ruta, formulario de contacto, newsletter, WhatsApp, selector de idioma, modo oscuro.
5. Promover a Production desde el dashboard de Vercel una vez verificado.
6. Correr Lighthouse sobre la URL de producción real y confirmar los objetivos de rendimiento.

## 10. Configuración del dominio

No se modificó DNS ni dominios personalizados (fuera del alcance sin autorización expresa y sin acceso al panel). En Vercel: **Project Settings → Domains → Add** y seguir las instrucciones de registros DNS que Vercel provee para el dominio real de Alba Capital.

## 11. Resultados verificados (medidos en este entorno, no en producción)

| Verificación | Resultado |
|---|---|
| `npm ci` | ✅ OK tras resincronizar `package-lock.json` (antes fallaba) |
| TypeScript (`npm run typecheck`) | ✅ 0 errores |
| ESLint (`npm run lint`) | ✅ 0 errores, 9 warnings (patrón estándar de shadcn/ui, no bloqueante) |
| `npm run build` | ✅ Compila sin errores, 10.8s |
| `npm audit` | 17 vulnerabilidades → 4 restantes (moderadas, requieren migración mayor de React Router v6→v7 y Vite 5→8; no se forzaron sin poder probar el impacto) |
| Peso de `public/` | 84MB → 16MB (video optimizado) |
| Peso de `src/assets/` | 75MB → 1MB (JPG/PNG → WebP) |
| Video principal | 87MB → 9.7MB MP4 + 6.3MB WebM, con poster y lazy-load real |
| Smoke test de rutas (vite preview) | `/`, `/oportunidades`, `/blog/:id`, ruta inexistente → 200 (SPA), HTML renderiza `<title>` y `#root` correctamente |
| Lighthouse sobre URL real | **No medido** — requiere despliegue real, no disponible en este entorno |

No se declaran los puntajes de Lighthouse (Performance/Accesibilidad/SEO/Buenas prácticas) porque no fueron medidos sobre una URL pública real, tal como se pidió explícitamente no hacer.

## 12. Datos comerciales pendientes de validar

**Ninguno de estos datos fue inventado ni confirmado — quedan tal como estaban en el proyecto original, con un aviso de riesgo agregado en las páginas donde se muestran.** Alba Capital debe confirmar, corregir o retirar cada ítem antes del lanzamiento real:

1. **Métricas del hero** (`src/data/metrics.ts`): TIR promedio 24%, capital colocado USD 42M, 37 proyectos ejecutados, 180+ inversores activos. Sin fuente verificable en el proyecto.
2. **Oportunidades de inversión** (`src/data/opportunities.ts`): 6 proyectos con nombres, ubicaciones, TIR (22%–32%), montos y porcentajes de capital captado específicos (ej. "Torre Residencial Palermo", "Centro Logístico Pilar"). Tienen estructura de contenido de demostración; deben confirmarse como reales o reemplazarse.
3. **Autores del blog** (`src/data/blogPosts.ts`): "Sarah Chen", "Marcus Rodriguez", "Elena Nakamura" — nombres genéricos de plantilla, sin relación aparente con el equipo real de Alba Capital.
4. **Contenido editorial del blog**: los 3 artículos son sobre arquitectura sostenible/urbanismo genérico, sin conexión editorial con un fondo de inversión inmobiliaria argentino. Evaluar si se publican, se reemplazan o se elimina la sección hasta tener contenido propio.
5. **Direcciones/zonas de operación**: el proyecto original tenía dos textos incompatibles (home: "San Luis, Córdoba, Buenos Aires, La Pampa, Río Negro, Neuquén" vs. página de contacto: solo "Buenos Aires"). Se unificó provisoriamente a "Buenos Aires" en `src/config/site.ts` — **confirmar cuál es la información correcta**.
6. **Redes sociales**: Instagram/LinkedIn/Facebook no tenían URL real (`href="#"`). Se ocultaron los íconos. Agregar las URLs reales en `src/config/site.ts` (`SOCIAL_LINKS`) cuando estén disponibles.
7. **Email de contacto**: `hola@albacapital.com` — confirmar que la casilla existe y está monitoreada.
8. **Número de WhatsApp**: `+54 9 266 465 6146` — confirmar que es el número real de atención y no un dato de prueba.
9. **ID de proyecto Supabase**: `foqdqoopqpmhjpktzsyd` en `supabase/config.toml` — confirmar que corresponde al proyecto de producción real.
10. **Integrantes del equipo**: no se cargó ningún integrante real (correctamente: no se inventaron perfiles). La sección `#equipo` queda oculta hasta que el superadministrador cargue al menos un integrante publicado desde `/admin`.
11. **Carrusel "Oportunidades activas" en la home** (`src/components/OpportunitiesCarousel.tsx`): las 10 fotografías originales (tierras/campos/complejos turísticos) **nunca existieron como archivos reales** en el proyecto entregado — el código original solo tenía punteros al CDN interno de Lovable (`/__l5e/assets-v1/...`), una ruta que no existe fuera del hosting de Lovable. Esto no se detectó en la primera auditoría y causaba el ícono de imagen rota en producción (reportado por Alba Capital tras el primer despliegue). Se corrigió ocultando la sección — **no se inventaron fotos de reemplazo**. Para reactivarla: agregar las 10 fotografías reales a `src/assets/` y completar el array `slides` en ese archivo (instrucciones en el comentario del propio código).

## 13. Procedimiento de rollback

Vercel mantiene todos los despliegues anteriores. Ante un problema en producción:

1. Ir a **Vercel → Project → Deployments**.
2. Ubicar el último despliegue estable anterior.
3. Click en **⋯ → Promote to Production**.
4. Verificar que la URL de producción vuelve a responder correctamente.

No requiere revertir código ni hacer un nuevo build — es instantáneo porque Vercel conserva los artefactos de cada deploy.

## 14. Seguridad — confirmación

- No se encontraron claves secretas (`service_role`, API keys) hardcodeadas en el código fuente en ningún archivo revisado.
- `.env`, `.env.*` y `.vercel` están en `.gitignore`. Solo `.env.example` (sin valores) debe commitearse.
- RLS habilitada en `leads`, `newsletter_subscribers`, `team_members`, `team_member_translations` y `admin_users`, sin policy de lectura pública sobre datos administrativos.
- El rol `superadmin` se verifica contra la tabla `admin_users` en cada carga de sesión, nunca se confía en `localStorage` ni en metadata del cliente.
- Si en algún momento se detecta que una clave real fue expuesta en un commit anterior del repositorio, **debe rotarse desde el dashboard de Supabase** — no alcanza con quitarla del código, porque queda en el historial de git.

## 15. Módulo "Nuestro equipo" — panel administrativo

### 15.1 Qué se implementó

- Sección pública `#equipo` en la home, con grilla responsive, modal de perfil accesible (foco atrapado, cierre con Escape) y estado vacío que oculta la sección si no hay integrantes publicados (sin datos ficticios).
- Panel privado en `/admin` (dashboard) y `/admin/login`, con `noindex, nofollow`, sin enlaces desde la navegación pública ni el sitemap.
- CRUD completo de integrantes: datos generales, traducciones ES/EN/PT, foto (compresión y conversión a WebP en el cliente antes de subir a Supabase Storage, nunca Base64 en la base), publicar/despublicar, archivar, eliminar (con borrado de la foto asociada), reordenamiento manual.
- Autenticación con Supabase Auth + tabla `admin_users` separada para el rol `superadmin`, verificada en cada carga de sesión y protegida por RLS — nunca se guarda el rol en `localStorage`.
- RLS en `team_members`, `team_member_translations` y `admin_users`, y políticas de Storage en el bucket `team-photos` (lectura pública, escritura solo superadmin).

### 15.2 Procedimiento seguro para crear el primer superadministrador

**Nunca se debe crear un usuario administrador con email/contraseña hardcodeados en el código o en una migración versionada en git.** El procedimiento correcto, hecho una sola vez por quien tenga acceso al dashboard de Supabase del proyecto real:

1. En el dashboard de Supabase → **Authentication → Users → Add user** (o **Invite user** para que la persona defina su propia contraseña vía email). Completar con el email real de la persona que va a administrar el equipo.
2. Copiar el `UUID` del usuario recién creado (columna `UID` en la tabla de usuarios).
3. Ir a **SQL Editor** y ejecutar, reemplazando `<uuid-copiado>`:
   ```sql
   insert into public.admin_users (id, role)
   values ('<uuid-copiado>', 'superadmin');
   ```
4. Confirmar que `SELECT * FROM public.admin_users` muestra el registro.
5. La persona ya puede iniciar sesión en `/admin/login` con su email y la contraseña que definió (o la que se le asignó, con instrucción de cambiarla en el primer ingreso vía "¿Olvidaste tu contraseña?").

Para agregar administradores adicionales en el futuro, repetir el mismo procedimiento — no existe (ni debe existir) un formulario de registro público de administradores.

### 15.3 Variables de entorno — sin cambios adicionales

El módulo de equipo reutiliza `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` ya documentadas en la sección 4. No se agregaron variables nuevas: la subida de fotos y la autenticación usan la misma publishable key (el control de permisos está en RLS y en las policies de Storage, no en una clave especial del cliente).

### 15.4 Migraciones agregadas por este módulo

- `20260808220000_team_module.sql` — tablas `team_members`, `team_member_translations`, `admin_users`, función `is_superadmin()`, triggers de auditoría, RLS.
- `20260808220100_team_photos_storage.sql` — bucket `team-photos` y sus políticas de Storage.

### 15.5 Pruebas — estado real (no todo pudo ejecutarse en este entorno)

Este entorno de trabajo no tiene un proyecto Supabase real conectado, así que las pruebas que requieren backend real (login efectivo, escritura en la base, subida de archivos) **no se ejecutaron de punta a punta** y no se declaran como verificadas. Lo que sí se hizo:

| # | Prueba | Estado |
|---|---|---|
| 1 | Acceso a `/admin` sin sesión → redirige a `/admin/login` | ✅ Verificado en código y por smoke test (renderiza `AdminLogin` vía `ProtectedRoute`) |
| 2–4 | Login correcto / incorrecto / usuario sin rol superadmin | ⚠️ Implementado (mensajes genéricos, bloqueo tras 5 intentos, chequeo de `admin_users`), **no probado contra un proyecto Supabase real** |
| 5 | Recuperación de contraseña | ⚠️ Implementado vía `resetPasswordForEmail`, no probado con envío de email real |
| 6–14 | CRUD, foto, traducciones, publicar/despublicar, reordenar, archivar | ⚠️ Implementado y compila sin errores de tipos; no probado contra base de datos real |
| 15–16 | Visualización pública, cambio de idioma | ✅ Compila y renderiza; sin integrantes reales cargados, la sección se oculta correctamente (comportamiento esperado, verificado) |
| 17 | Modal / ficha ampliada | ✅ Verificado el manejo de foco/Escape en el código; no hay integrantes reales para probar interacción completa en este entorno |
| 18 | Responsive | ✅ Clases Tailwind con breakpoints revisadas (1/2/3-4 columnas) |
| 19 | Recarga directa de `/admin` | ✅ Verificado por smoke test (200, SPA renderiza) |
| 20 | Despliegue en Vercel | ❌ No realizado — mismo motivo que el resto del proyecto: sin acceso a la red de Vercel/Supabase desde este entorno |
| 21–22 | Políticas RLS, intento de escritura no autorizada | ⚠️ Políticas escritas y revisadas manualmente línea por línea; **no ejecutadas contra una base real** para confirmar el comportamiento en runtime |
| 23 | Cierre de sesión | ✅ Verificado en código (`supabase.auth.signOut()` + redirección) |

**Recomendación concreta:** antes de dar por cerrado este módulo, alguien con acceso al proyecto Supabase real debe aplicar las migraciones en un entorno de Preview y ejecutar manualmente las pruebas marcadas con ⚠️, en particular los intentos de escritura no autorizada (por ejemplo, intentar insertar un `team_member` con la anon key sin sesión, y confirmar que RLS lo rechaza).

