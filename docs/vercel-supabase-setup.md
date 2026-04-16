# Frida Restaurant: Vercel + Supabase Setup

## Public values

These values can be used by frontend code:

```env
SUPABASE_URL=https://htmtmpmmhsdbzsqtwynz.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_z6OHNBssdY3I2-P7_-dThw_6yCavvIT
```

## Private values

Set these in Vercel Project Settings > Environment Variables. Do not commit real values.

```env
SUPABASE_SERVICE_ROLE_KEY=
WEB_ORIGINS=https://fridarestauranthn.web.app,https://fridarestauranthn.com
STAFF_EMAIL_DOMAIN=frida.local
```

Firebase Messaging server-side keys will be added later:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FCM_VAPID_KEY=
```

## Supabase schema

Open Supabase SQL Editor and run:

```text
supabase/frida_schema.sql
```

Then create Supabase Auth users with internal emails:

```text
admin@frida.local
cocina@frida.local
caja@frida.local
```

After creating each Auth user, add one `staff_profiles` row with the matching `user_id`, `username`, and `role`.

## Order flow

```text
dine_in  -> preparing
takeaway -> pending
delivery -> pending
```

Staff-facing labels:

```text
pending   -> Pendiente
accepted  -> Aceptada
preparing -> Preparando
ready     -> Lista
delivered -> Entregada
rejected  -> Rechazada
cancelled -> Cancelada
```
