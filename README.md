# Restaurante — Sitio público + CRM (HTML / CSS / JS)

Proyecto estático que incluye:
- Sitio público bilingüe (Español por defecto) con menú, carrito y formulario de reservas.
- Panel CRM en `crm.html` con lista en tiempo real de pedidos (aceptar / procesar / rechazar).
- Integración con **Firebase Firestore** (pedidos y reservas).
- SEO básico, accesibilidad, responsive (móvil y escritorio).

✅ Tecnologías: HTML, CSS puro, JavaScript (ES modules), Firebase Firestore (cliente).

---

## Ejecutar localmente
1. Instala un servidor estático (opcional):
   - npm start (usa `npx serve . -p 3000` desde la raíz del proyecto)
   - O abre `index.html` / `crm.html` directamente en el navegador.

## Firebase — configuración rápida
1. Crea un proyecto en https://console.firebase.google.com/
2. Habilita Firestore (modo de pruebas para desarrollo).
4. (Opcional) Habilita Authentication (Google Sign-in) en la consola de Firebase si quieres proteger el CRM.
   - Console > Authentication > Sign-in method > habilita Google.
5. En `js/firebase-config.js` reemplaza `firebaseConfig` si usas otro proyecto (ya contiene tu configuración actual).
6. Colecciones usadas (se crean automáticamente al escribir): `orders`, `reservations`. (El CRM no requiere inicio de sesión por defecto).

Reglas mínimas para pruebas (no para producción):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Desarrollo: permite todas las lecturas/escrituras (NO usar en producción)
      allow read, write: if true;
    }
  }
}
```

**Cómo aplicar estas reglas**
- Consola Firebase: Firestore → Rules → pega el bloque y pulsa *Publish*.
- Firebase CLI: coloca `firestore.rules` en la raíz del proyecto y ejecuta `firebase deploy --only firestore:rules`.

⚠️ **Seguridad:** estas reglas permiten acceso público completo. Úsalas solo durante el desarrollo. Antes de publicar, reemplázalas por reglas que validen `request.auth` y los campos de los documentos.

Troubleshooting — si los pedidos no aparecen en el CRM
1. Abre las DevTools del navegador (F12) en la página pública y en `crm.html` y mira la pestaña "Console" cuando presionas `Enviar a cocina`.
   - Debes ver `Sending order to server:` seguido por el objeto pedido.
   - Si hay un error, busca mensajes como `permission-denied` o `Network`.
2. Verifica en la consola de Firebase (Firestore → Data) si existe un documento nuevo en la colección `orders`.
   - Si el documento no existe y la consola muestra `permission-denied`, actualiza temporalmente las reglas de Firestore para permitir escritura en desarrollo.
3. Asegúrate de que `js/firebase-config.js` contiene las credenciales del mismo proyecto (projectId).
4. En caso de fallo por red o permisos, el sitio ahora guarda pedidos localmente y los sincronizará automáticamente cuando la conexión/regras lo permita (ver `offline_orders_v1` en localStorage).

Mobile testing
- En móviles el `cart drawer` se abre a pantalla completa; los botones de acción están apilados para facilitar el toque.
- Para probar comportamiento offline: desconéctate de la red y envía un pedido — se almacenará en `localStorage` y el CRM recibirá la entrada cuando vuelvas a conectar.

Order IDs
- El CRM muestra ahora un `displayId` numérico fácil (si está disponible) además del ID interno de Firestore.
- Nota: si has desplegado la Cloud Function, el `displayId` será generado por el servidor (canónico) en el momento en que el documento `orders` se cree; el cliente ya no fuerza ese valor para evitar duplicados.

Cambia reglas antes de publicar (restringe por auth y validación).
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Desarrollo: permite todo — reemplaza por reglas seguras antes de publicar
      allow read, write: if true;
    }
  }
}
```
Cambia reglas antes de publicar (restringe por auth y validación).

## Qué hace cada archivo
- `index.html` — sitio público (carrito, menú, reservas).
- `crm.html` — panel CRM (escucha pedidos en tiempo real).
- `css/style.css` — estilos responsivos y animaciones.
- `js/firebase-config.js` — inicializa Firebase y exporta helpers (addOrder, listenOrders, updateOrderStatus, addReservation).
- `js/app.js` — lógica del sitio público (carrito local + envío a Firestore, reservas).
- `js/crm.js` — lógica del CRM (escucha en tiempo real, acciones).

## Personalizar el menú / traducciones
- Cambia los elementos del menú en `js/app.js` (array `menuData`). Cada item incluye `title` y `desc` en `es` y `en`.
- Las cadenas UI están en el objeto `i18n` dentro de `js/app.js` y `js/crm.js`.

## SEO y accesibilidad
- Meta tags (JSON-LD removed by request) en `index.html`.
- Elementos con `aria-live`, roles y controles por teclado.

## Siguientes pasos recomendados
1. Configurar seguridad de Firestore (reglas) y autenticación para CRM.
2. Añadir imágenes reales en `/assets` y sustituir los SVG placeholders.
3. Implementar tests E2E si vas a desplegar en producción.

### Server-side backup (Cloud Function) — recomendado ✅
Se añadió una Cloud Function que actúa como respaldo y fuente de verdad del servidor cuando se crea un nuevo documento en `orders`.
- Qué hace la función (`functions/index.js`):
  - Genera un `displayId` secuencial **en el servidor** (transacción en `counters/orders`) si el pedido no lo tiene.
  - Asegura que `createdAt` y `status` existan (valores server-side cuando sea necesario).
  - Crea una copia de respaldo en `orders_backup/{orderId}` con `serverBackupAt`.

Requisitos / despliegue
- Requiere Firebase CLI y un proyecto Firebase (el mismo `projectId` ya usado por el cliente).
- **Nota:** las Cloud Functions requieren el plan Blaze para despliegue en la consola de Firebase.

Pasos rápidos para desplegar la función:
1. Instala y autentica Firebase CLI: `npm i -g firebase-tools` → `firebase login`.
2. Desde la raíz del proyecto ejecuta `firebase init functions` (elige JavaScript) — o copia `functions/index.js` en la carpeta `functions/` si ya la añadiste.
3. `npm --prefix functions install` para instalar dependencias localmente (o `cd functions && npm install`).
4. Despliega: `firebase deploy --only functions`.

Verificación
- Tras el despliegue envía un pedido desde la web pública; la función añadirá `displayId` y creará un documento espejo en `orders_backup`.
- Revisa la sección _Functions > Logs_ en la consola de Firebase si algo falla.

Si quieres, despliego la función por ti (necesitaré que conectes tu Firebase CLI) o te doy los comandos exactos para ejecutar en tu máquina.

---

Si quieres, preparo:
- Reglas de Firestore sugeridas para producción.
- Despliegue con Firebase Hosting (comandos y configuración).
- Conversión del proyecto a una SPA con rutas y autenticación para el CRM.


## CRM staff access setup (required)

1. Enable Google provider in Firebase Auth:
   - Firebase Console -> Authentication -> Sign-in method -> Google -> Enable.
2. Publish the secure Firestore rules from `firestore.rules`.
3. Create one document per staff user in `staff/{uid}` (collection: `staff`, document id: user uid):

```json
{
  "active": true,
  "role": "admin"
}
```

Allowed roles are: `admin`, `agent`, `representative`.

How to get uid quickly:
1. Open `crm.html` and sign in with Google once.
2. If access is denied, copy the uid from Firebase Authentication -> Users.
3. Create the corresponding `staff/{uid}` document above.
4. Reload `crm.html`.
