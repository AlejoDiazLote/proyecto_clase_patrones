# Frontend

Frontend Angular 17 para la plataforma de gestión de eventos académicos.

## Stack

- Angular 17 con SSR habilitado
- Router con módulos lazy-loaded
- Reactive Forms
- Stripe.js para pagos con Payment Element
- Tailwind + SCSS para estilos

## Estructura principal

- `src/app/features/auth`: login, registro y callback OAuth
- `src/app/features/events`: catálogo, detalle y administración de eventos
- `src/app/features/registrations`: inscripciones del usuario, QR y certificados
- `src/app/features/organizer`: panel del organizador, reportes y asistencia
- `src/app/features/payments`: checkout de Stripe
- `src/app/core`: guards, interceptores y servicios transversales

## Patrones aplicados

### 1. Feature Modules + Lazy Loading

Cada dominio funcional vive en su propio módulo y se carga bajo demanda desde `app-routing.module.ts`. Esto reduce el bundle inicial y mantiene el código aislado por contexto.

### 2. Service Layer

La interacción con la API se concentra en servicios (`AuthService`, `EventsService`, `RegistrationsService`). Los componentes orquestan UI y delegan lógica de acceso a datos.

### 3. Route Guards por responsabilidad

- `AuthGuard`: protege rutas autenticadas
- `roleGuard`: restringe acceso por rol para paneles administrativos y de organizador

### 4. Checkout con orquestación por estados

El flujo de pago usa un patrón de máquina de estados ligera en el componente de checkout:

- `loading`: prepara Stripe y el Payment Element
- `elementReady`: habilita el botón cuando Stripe terminó de montar el formulario
- `paying`: evita doble submit
- `waitingForWebhook`: mantiene feedback mientras el backend confirma el pago

### 5. Confirmación eventual basada en webhook

Después de `stripe.confirmPayment`, el frontend no asume éxito inmediato. Stripe redirige de vuelta a `/checkout`, el componente recupera el `payment_intent_client_secret`, consulta el estado del PaymentIntent y luego espera a que el webhook del backend confirme la inscripción antes de redirigir a `mis-inscripciones`.

Ese patrón evita inconsistencias entre “pago aceptado por Stripe” y “inscripción confirmada en la base de datos”.

## Variables de entorno

Archivo: `src/environments/environment.development.ts`

```ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  stripePublishableKey: "pk_test_TU_CLAVE_PUBLICABLE",
};
```

Para desarrollo, reemplaza `stripePublishableKey` por tu clave real de Stripe (`pk_test_...`).

## Flujo de pago

1. El usuario abre una inscripción pendiente.
2. El frontend navega a `/checkout?id=<inscripcionId>`.
3. `RegistrationsService.createPaymentIntent()` solicita el `clientSecret` al backend.
4. Stripe monta el Payment Element.
5. `stripe.confirmPayment()` redirige de vuelta al checkout.
6. El checkout reanuda el flujo, consulta el estado del PaymentIntent y espera la confirmación del webhook.
7. Cuando la inscripción queda en `CONFIRMADA`, el usuario es redirigido a `mis-inscripciones`.

## Desarrollo

```bash
npm install
npm start
```

Build de producción:

```bash
npm run build
```

## Notas operativas

- Si el webhook tarda unos segundos, el checkout espera la sincronización antes de redirigir.
- Si Stripe devuelve `requires_payment_method`, el mismo checkout permite reintentar sin romper la navegación.
- El frontend no guarda secretos de Stripe; solo usa la clave publicable.
