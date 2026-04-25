# Frida Restaurant

Sistema web para restaurante con sitio público, pedidos, reservas, CRM operativo, pantalla de cocina, panel de meseros, configuración de productos, reportes y facturación fiscal.

El proyecto está construido como una aplicación web ligera: HTML, CSS y JavaScript en el frontend, APIs server-side en Vercel, Supabase como base de datos y autenticación del personal, y Firebase Cloud Messaging para notificaciones push.

## Módulos incluidos

- `index.html`: sitio público bilingüe con menú, carrito, pedidos, seguimiento de orden y formulario de reservas.
- `crm.html`: panel administrativo para pedidos, reservas, ventas, reportes, facturación y configuración.
- `kitchen.html`: pantalla dedicada para cocina con pedidos en preparación.
- `agent.html`: vista de meseros para consultar órdenes activas del día.
- `api/`: endpoints server-side para autenticación, pedidos, reservas, notificaciones y ajustes.
- `supabase/`: esquema SQL, migraciones e instrucciones para base de datos.
- `js/`: lógica del frontend, menú, fiscal, CRM, cocina, meseros y conexión con API.
- `css/style.css`: estilos responsive para sitio público y paneles internos.

## Tecnologías

- Frontend: HTML, CSS puro, JavaScript ES modules.
- Backend: Vercel Serverless Functions en `api/`.
- Base de datos: Supabase Postgres.
- Autenticación del personal: Supabase Auth + tabla `staff_profiles`.
- Notificaciones: Firebase Cloud Messaging.
- Hosting público: Firebase Hosting.

## Funcionalidad principal

- Menú digital por categorías con imágenes y precios.
- Carrito con pedidos para restaurante, recoger o delivery.
- Reservas con fecha, hora, personas, ocasión, alergias y notas.
- CRM con filtros de estado, resumen de ventas, calendario y reportes.
- Gestión de productos: precios y disponibilidad.
- Pantalla de cocina para avanzar pedidos.
- Panel de meseros de solo lectura.
- Facturación fiscal con CAI, rango autorizado, RTN, exoneraciones e impuestos.
- Notificaciones push para clientes y personal.
- Roles de personal: `admin`, `representative`, `kitchen`, `cashier`, `agent`.

## Ejecutar localmente

```bash
npm install
npm start
```

El comando `npm start` sirve los archivos estáticos en:

```text
http://localhost:3000
```

Para probar las APIs localmente con Vercel:

```bash
npm run dev:api
```

## Variables de entorno

Usa `.env.example` como referencia. Las variables públicas y privadas principales son:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WEB_ORIGINS=
STAFF_EMAIL_DOMAIN=frida.local

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FCM_VAPID_KEY=
```

Notas importantes:

- `SUPABASE_SERVICE_ROLE_KEY` es privada y debe vivir solo en Vercel Environment Variables.
- `WEB_ORIGINS` debe incluir los dominios autorizados del frontend, por ejemplo `https://fridarestauranthn.web.app`.
- Las credenciales privadas de Firebase solo se usan en backend para enviar notificaciones.

## Supabase

1. Crear proyecto en Supabase.
2. Ejecutar el esquema:

```text
supabase/frida_schema.sql
```

3. Aplicar migraciones adicionales si existen en:

```text
supabase/migrations/
```

4. Crear usuarios internos en Supabase Auth.
5. Crear un perfil por usuario en `staff_profiles`.

Ejemplo de perfil:

```json
{
  "username": "admin",
  "role": "admin",
  "active": true,
  "login_email": "admin@frida.local"
}
```

## Acceso del personal

Los paneles internos usan usuario y contraseña:

- `crm.html`: administración, pedidos, reservas, reportes y facturación.
- `kitchen.html`: cocina.
- `agent.html`: meseros.

La validación ocurre en `/api/auth/login`. El frontend guarda una sesión local y renueva el token con `/api/auth/refresh`.

## Despliegue

Frontend en Firebase Hosting:

```bash
firebase deploy --only hosting
```

APIs en Vercel:

```bash
npm run dev:api
```

Para producción, conecta el repositorio a Vercel y configura las variables privadas en el dashboard del proyecto.

## Archivos de configuración clave

- `firebase.json`: configuración de hosting y archivos ignorados en despliegue.
- `.firebaserc`: proyectos Firebase vinculados.
- `vercel.json`: configuración Vercel actual.
- `.env.example`: plantilla de variables.
- `docs/vercel-supabase-setup.md`: guía adicional de Supabase + Vercel.

## Checklist antes de vender o entregar

- Confirmar dominio final en `WEB_ORIGINS`.
- Confirmar que el API base usado por `js/firebase-config.js` apunta al deployment correcto.
- Crear al menos un usuario demo `admin`.
- Probar flujo completo: pedido público -> CRM -> cocina -> listo -> entregado.
- Probar reserva pública -> CRM -> aceptar/rechazar.
- Configurar datos fiscales reales antes de emitir facturas.
- Confirmar Firebase Messaging si se van a vender notificaciones push.
- Limpiar logs locales antes de entregar el repositorio.

## Estado del proyecto

El sistema ya tiene la estructura principal para venderse como solución operativa para restaurante. La base de datos y las APIs centralizan la información sensible en servidor, y el frontend queda ligero para desplegarse fácilmente en Firebase Hosting.
