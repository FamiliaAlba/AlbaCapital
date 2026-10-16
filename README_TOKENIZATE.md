# Tokenizate | Alba Capital

Landing educativa (`/tokenizate`), captación de interesados y recepción privada de postulaciones de activos. **No** hay compra de tokens, recepción de dinero, wallets, custodia ni negociación: esas funciones no existen en el código y no se activan por estado, botón ni parámetro.

## Rutas y archivos

| Qué | Dónde |
|---|---|
| Landing | `/tokenizate` (`src/pages/Tokenizate.tsx`), acceso en la barra inferior y superior, y enlace desde `/oportunidades` |
| Postulación / consulta de expediente | `/tokenizate/postular` (`src/components/tokenizate/ApplicationFlow.tsx`) |
| Legales | `/tokenizate/privacidad`, `/tokenizate/bases-y-condiciones` (`src/data/tokenizateLegal.ts`) |
| Panel | `/admin/tokenizate` y `/admin/tokenizate/:id` |
| Servidor | Edge Function `supabase/functions/tokenizate/index.ts` (Supabase, service role inyectada) |
| Datos | `supabase/migrations/20261016000000_tokenizate.sql` (tablas `tk_*`, bucket privado `tokenizate-docs`) |

## Arquitectura y seguridad

- Todas las tablas `tk_*` tienen RLS **sin políticas** y sin permisos para `anon`/`authenticated`; solo la Edge Function accede.
- **Propietarios:** al crear el expediente se muestra una vez un número (`TK-AAAA-NNNNNN`) y una clave de 20 caracteres. Solo se guarda su hash SHA-256. Cada llamada verifica el par; los fallos están limitados (10 cada 15 min por IP) y las respuestas no distinguen expediente inexistente de clave incorrecta. Un propietario nunca accede a otro expediente (verificado). El correo declarado **no está verificado**.
- **Equipo:** JWT de Supabase + rol `superadmin` en `admin_users`, verificado en el servidor en cada acción `admin_*`. Hoy el único rol existente es `superadmin`; "permisos por rol" más finos requieren agregar roles.
- **Documentos:** bucket privado; la carga usa URL firmada de un solo uso; luego el servidor descarga el objeto y verifica el contenido real (firma PDF/JPEG/PNG coincidente con el tipo declarado, tamaño, y rechazo de PDFs con `/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`, `/OpenAction`). Los rechazados se borran. Los nombres internos son UUID; el nombre original es solo metadato. Las descargas (propietario y equipo) son enlaces temporales de 60 s y quedan registradas. **No es un antivirus**: escaneo de malware real requiere un servicio externo (ClamAV/proveedor) no configurado.
- Límites configurables (`tk_settings`): máx. archivos (25), MB por archivo (15, tope del bucket), conservación (24 meses tras el cierre). "Depurar vencidos" elimina los documentos de expedientes cerrados/no elegibles vencidos (ejecución manual desde el panel; no hay tarea programada).
- Antispam: honeypot + límites por IP (huella SHA-256, no se guarda la IP) y por correo, persistidos en la base. No hay CAPTCHA (requiere un servicio, p. ej. Turnstile, no configurado).
- Auditoría: `tk_events` registra creación, guardados, estados, asignaciones, solicitudes, cargas/eliminaciones, accesos a documentos, exportaciones y depuraciones, sin documentos ni datos sensibles en el detalle.
- Consentimientos: se guarda la versión de los textos aceptados (`TK_LEGAL_VERSION` = `2026-10-16`, también en la Edge Function). Si se cambian los textos de fondo, subir la versión en **ambos** lugares.
- El consentimiento comercial es un campo separado y opcional.
- Los logs de la función no incluyen datos personales.

## Qué requiere configuración externa

1. **Correo de confirmación:** no hay proveedor configurado. El sistema lo informa al usuario ("recibida, pero sin correo de confirmación") y guarda `email_status = not_configured`. Aviso al equipo: hoy se ve en el panel; no hay notificación por correo.
2. **Revisión legal** de `src/data/tokenizateLegal.ts` por el asesor de Alba Capital antes del uso definitivo (razón social, CUIT, domicilio y registro de la base ante la AAIP no figuran porque no están en el proyecto).
3. **Antivirus / CAPTCHA** (ver arriba).
4. **Analítica:** el sitio no tiene analítica instalada; no se enviaron eventos. Los UTM se guardan en `sessionStorage` y viajan con el formulario de interesados.

## Desactivar

Quitar las rutas de `src/App.tsx`/`AdminApp.tsx`, o desplegar una versión de la función que responda 503. Los datos quedan intactos.
