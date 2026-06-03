# Configuración de Stripe - Checklist Completo

## Paso 1: Obtener las claves de Stripe

1. Ve a [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copia la **clave publicable** (empieza con `pk_test_...`)
3. Copia la **clave secreta** (empieza con `sk_test_...`)

## Paso 2: Configurar el Backend

### 2.1 Variables de entorno

Edita `backend/.env` y actualiza:

```env
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TEMPORAL_SE_REEMPLAZA_EN_PASO_3
```

**Nota:** La clave secreta ya está configurada. Solo verifica que sea válida.

### 2.2 Verificar que el endpoint de webhook esté activo

El backend ya tiene el endpoint configurado:

- `POST /payments/webhook` - recibe eventos de Stripe
- Configurado con `rawBody: true` en `main.ts` para validación de firma

## Paso 3: Configurar el Frontend

### 3.1 Variables de entorno

Edita `frontend/src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  stripePublishableKey: "pk_test_TU_CLAVE_PUBLICABLE_AQUI", // ← Reemplazar aquí
};
```

**IMPORTANTE:** Solo usa la clave publicable (pk*test*...), nunca pongas la clave secreta en el frontend.

### 3.2 Opcional: Configurar producción

Edita `frontend/src/environments/environment.ts` cuando vayas a producción:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://tu-dominio.com",
  stripePublishableKey: "pk_live_TU_CLAVE_REAL_DE_PRODUCCION",
};
```

## Paso 4: Configurar Stripe CLI para webhooks locales

### 4.1 Instalar Stripe CLI

**macOS (Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Otras plataformas:**

- Descarga desde [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### 4.2 Autenticar Stripe CLI

```bash
stripe login
```

Esto abrirá tu navegador para autorizar la CLI con tu cuenta de Stripe.

### 4.3 Iniciar el listener de webhooks

Con el backend corriendo en `http://localhost:3000`, ejecuta:

```bash
stripe listen --forward-to localhost:3000/payments/webhook
```

**Salida esperada:**

```
> Ready! You are using Stripe API Version [2026-05-27]. Your webhook signing secret is whsec_abc123... (^C to quit)
```

### 4.4 Copiar el webhook secret

Copia el `whsec_...` que aparece en la salida y actualiza `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_EL_SECRET_QUE_TE_DIO_STRIPE_CLI
```

**IMPORTANTE:** Reinicia el servidor backend después de cambiar el `.env`.

## Paso 5: Preparar datos de prueba

### 5.1 Crear un evento de pago en la base de datos

Desde el frontend admin (asegúrate de tener rol ADMIN o ORGANIZADOR):

1. Ve al panel de eventos
2. Haz clic en **"Nuevo evento"**
3. Completa el formulario:
   - Título, descripción, fechas, capacidad
   - **Tipo de inscripción:** Selecciona **"De pago"**
   - **Precio (USD):** Ingresa un monto (ej: 50.00) - este campo aparece automáticamente al seleccionar "De pago"
4. Guarda el evento

**Nota:** El campo de precio solo aparece cuando seleccionas "Tipo de inscripción: De pago". Si es gratuito, el campo no es necesario.

### 5.2 Inscribirte al evento

1. Inicia sesión como usuario participante
2. Ve al catálogo de eventos (`/events`)
3. Inscríbete al evento de pago (quedará en estado **PENDIENTE**)
4. Ve a "Mis Inscripciones" (`/mis-inscripciones`)
5. Verás el botón **Pagar**

## Paso 6: Probar el flujo completo

### 6.1 Terminal 1: Backend

```bash
cd backend
npm run start:dev
```

### 6.2 Terminal 2: Frontend

```bash
cd frontend
npm start
```

### 6.3 Terminal 3: Stripe CLI

```bash
stripe listen --forward-to localhost:3000/payments/webhook
```

### 6.4 Realizar una prueba de pago

1. En el navegador, ve a `http://localhost:4200/mis-inscripciones`
2. Haz clic en **Pagar** en una inscripción pendiente
3. Completa el formulario de pago con tarjetas de prueba:

**Tarjetas de prueba de Stripe:**

| Número                | Resultado                             |
| --------------------- | ------------------------------------- |
| `4242 4242 4242 4242` | Pago exitoso                          |
| `4000 0000 0000 9995` | Pago declinado (fondos insuficientes) |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure      |

**Datos de prueba adicionales:**

- Fecha de expiración: cualquier fecha futura (ej: 12/28)
- CVC: cualquier 3 dígitos (ej: 123)
- Código postal: cualquier valor (ej: 12345)

### 6.5 Verificar el resultado

**En el navegador:**

- El checkout mostrará "Procesando..." → "Pago recibido. Estamos confirmando tu inscripción."
- Tras 2-4 segundos, redirigirá a `/mis-inscripciones` con mensaje de éxito
- La inscripción cambiará de **PENDIENTE** a **CONFIRMADA**

**En la terminal de Stripe CLI:**

```
[200] POST /payments/webhook [evt_xxx]
payment_intent.succeeded
```

**En los logs del backend:**

```
[PaymentsService] Pago confirmado para inscripción abc-123-def
```

## Paso 7: Casos de prueba adicionales

### Test 1: Idempotencia de PaymentIntent

1. Haz clic en "Pagar"
2. NO completes el formulario, cierra la pestaña
3. Vuelve a hacer clic en "Pagar"
4. **Resultado esperado:** El mismo formulario de pago se recarga (no se crea un nuevo PaymentIntent)

### Test 2: Pago declinado

1. Usa la tarjeta `4000 0000 0000 9995`
2. Completa el pago
3. **Resultado esperado:** Mensaje de error "El pago fue rechazado. Verifica tu método de pago."
4. La inscripción cambia a estado **FALLIDA**

### Test 3: Reintentar después de fallo

1. Después de un pago fallido, haz clic en "Pagar" nuevamente
2. Usa la tarjeta exitosa `4242 4242 4242 4242`
3. **Resultado esperado:** Se crea un nuevo PaymentIntent y el pago se procesa correctamente

### Test 4: Polling del webhook

1. Desactiva momentáneamente Stripe CLI (Ctrl+C en la terminal 3)
2. Completa un pago exitoso
3. **Resultado esperado:** El checkout mostrará "Esperando confirmación..." por hasta 18 segundos
4. Después de 10 intentos, mostrará "El pago fue enviado, pero la confirmación aún no llegó."
5. Reactiva Stripe CLI y verifica que el webhook llegue tarde pero procese el pago

## Paso 8: Monitoreo en el Dashboard de Stripe

Ve a [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments) para ver:

- Todos los PaymentIntents creados
- Estado de cada pago (succeeded, requires_payment_method, etc.)
- Metadata que incluye el `inscripcionId`

## Troubleshooting

### Error: "Firma de webhook inválida"

**Causa:** El `STRIPE_WEBHOOK_SECRET` en `.env` no coincide con el de Stripe CLI.

**Solución:**

1. Detén Stripe CLI y reinícialo
2. Copia el nuevo `whsec_...` que aparece
3. Actualiza `backend/.env`
4. Reinicia el servidor backend

### Error: "No se pudo cargar el procesador de pagos"

**Causa:** La clave publicable en `environment.development.ts` no es válida.

**Solución:**

1. Verifica que la clave empiece con `pk_test_`
2. Copia la clave directamente desde el dashboard de Stripe
3. Reconstruye el frontend: `npm run build`

### El pago se queda en "Esperando confirmación..."

**Causa:** El webhook no está llegando al backend.

**Solución:**

1. Verifica que Stripe CLI esté activo
2. Verifica que la URL en Stripe CLI sea `localhost:3000/payments/webhook`
3. Revisa los logs del backend para ver si el webhook llegó

### Error: "El evento no tiene un precio válido configurado"

**Causa:** El evento no tiene el campo `precio` configurado o es 0.

**Solución:**

1. Edita el evento desde el panel de admin
2. Asegúrate de que el tipo de inscripción sea **PAGA**
3. Ingresa un precio mayor a 0

## Configuración para producción

Cuando vayas a producción:

1. **Crea un webhook permanente en Stripe:**
   - Ve a [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Crea un nuevo endpoint: `https://tu-dominio.com/payments/webhook`
   - Selecciona los eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copia el `whsec_...` de producción

2. **Actualiza las variables de entorno de producción:**

   ```env
   STRIPE_SECRET_KEY=sk_live_TU_CLAVE_REAL
   STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_REAL_DE_PRODUCCION
   ```

3. **Frontend:**
   ```typescript
   stripePublishableKey: "pk_live_TU_CLAVE_REAL_DE_PRODUCCION";
   ```

## Recursos adicionales

- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Payment Element](https://stripe.com/docs/payments/payment-element)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
