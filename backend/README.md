# Backend

Backend NestJS para la plataforma de gestión de eventos académicos.

## Stack

- NestJS 10
- TypeORM 0.3
- PostgreSQL
- JWT + Google OAuth
- Stripe
- Bull + Redis
- Mailer + Handlebars

## Módulos principales

- `auth`: autenticación local y OAuth Google
- `users`: gestión de usuarios
- `roles`: autorización por rol
- `events`: creación, edición, publicación y aprobación de eventos
- `sessions`: agenda e invitaciones a ponentes
- `registrations`: inscripciones de usuarios
- `payments`: creación de PaymentIntents y recepción de webhooks
- `organizer`: reportes, asistencia y certificados

## Patrones aplicados

### 1. Modularidad por dominio

Cada capacidad del sistema se encapsula en un módulo Nest con su controlador, servicio, DTOs y entidades. Esto reduce acoplamiento y mejora mantenibilidad.

### 2. DTO + Validation Pipe

Los datos de entrada se validan con DTOs y `ValidationPipe` global. El controlador delega objetos ya validados a la capa de servicio.

### 3. Service Layer

La lógica de negocio vive en servicios, no en controladores. Los controladores actúan como adaptadores HTTP.

### 4. Guards para seguridad transversal

- `JwtAuthGuard`: exige autenticación
- `RolesGuard`: valida acceso por rol
- decorador `@Roles(...)`: declara autorización de forma explícita por endpoint

### 5. Idempotencia en pagos

`PaymentsService.createPaymentIntent()` reutiliza un PaymentIntent pendiente existente antes de crear uno nuevo. Ese patrón evita cargos duplicados cuando el usuario refresca el checkout o reintenta la operación.

### 6. Eventual Consistency vía webhook

La confirmación final del pago no se resuelve en el request del frontend. Stripe notifica por webhook a `/payments/webhook` y el backend actualiza:

- `Payment.estado -> COMPLETADO | FALLIDO`
- `Registration.estado -> CONFIRMADA | FALLIDA`

Eso mantiene el sistema alineado con la fuente de verdad de Stripe.

## Variables de entorno

Archivo: `.env`

```env
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=eventos_academicos
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123

JWT_SECRET=super_secret_dev
JWT_EXPIRES_IN=1d

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FRONTEND_URL=http://localhost:4200

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASS=
MAIL_FROM="Eventos Académicos <no-reply@eventos.edu>"

REDIS_HOST=localhost
REDIS_PORT=6379
```

## Flujo de pago

1. El frontend solicita `POST /payments/create-intent` con `inscripcionId`.
2. El backend valida que la inscripción exista y esté en `PENDIENTE`.
3. Si ya existe un PaymentIntent pendiente, se reutiliza.
4. Si no existe, se crea uno nuevo en Stripe.
5. Stripe procesa el cobro.
6. Stripe envía `payment_intent.succeeded` o `payment_intent.payment_failed` al webhook.
7. El backend actualiza pago e inscripción.

## Webhook local de Stripe

Para desarrollo local, usa Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/payments/webhook
```

Luego copia el `whsec_...` entregado por Stripe CLI y colócalo en `.env` como `STRIPE_WEBHOOK_SECRET`.

## Desarrollo

```bash
npm install
npm run start:dev
```

Swagger:

- `http://localhost:3000/api/docs`

## Nota importante

Aunque Stripe confirme el pago en el cliente, la inscripción solo debe considerarse cerrada cuando el webhook haya actualizado el estado en la base de datos. Ese es el contrato de consistencia del sistema.
