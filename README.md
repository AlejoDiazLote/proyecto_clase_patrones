# 🎓 Sistema de Gestión de Eventos Académicos

Sistema completo de gestión de eventos académicos construido con **Angular 17** y **NestJS 10**, implementando patrones de diseño modernos y buenas prácticas de desarrollo.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Documentación](#-documentación)
- [Estado del Proyecto](#-estado-del-proyecto)

---

## ✨ Características Principales

### 🎫 Gestión de Eventos

- ✅ Catálogo público de eventos con filtros avanzados
- ✅ CRUD completo de eventos (Admin/Organizador)
- ✅ Estados del evento: BORRADOR → EN_REVISION → PUBLICADO → FINALIZADO → CANCELADO
- ✅ Modalidades: Presencial, Virtual, Híbrido
- ✅ Gestión de cupos disponibles con control de concurrencia

### 👥 Sistema de Usuarios

- ✅ Registro y autenticación local (JWT)
- ✅ Autenticación con Google OAuth 2.0
- ✅ Roles: ADMIN, ORGANIZADOR, PARTICIPANTE, PONENTE
- ✅ Perfil de usuario con datos personales

### 📝 Inscripciones

- ✅ Inscripción a eventos (gratuitos y de pago)
- ✅ Estados: PENDIENTE → CONFIRMADA / CANCELADA / FALLIDA
- ✅ Validación de cupos disponibles con transacciones
- ✅ Cancelación de inscripciones con devolución de cupos
- ✅ Vista "Mis Inscripciones" para participantes

### 💳 Pagos con Stripe

- ✅ Integración completa con Stripe Payment Element
- ✅ Flujo: Create PaymentIntent → Checkout → Webhook Confirmation
- ✅ Eventual consistency: Frontend polls hasta confirmar webhook
- ✅ Manejo de returns con query params (?payment_intent_client_secret)
- ✅ Idempotencia en creación de PaymentIntents
- ✅ Estados de pago: PENDIENTE → COMPLETADO / FALLIDO
- ✅ Webhooks seguros con firma validation

### 🏆 Certificados (NUEVO)

- ✅ Generación automática de certificados para asistentes
- ✅ PDF profesional con PDFKit (landscape A4)
- ✅ Código único UUID para cada certificado
- ✅ Vista "Mis Certificados" para participantes
- ✅ Descarga directa de PDF
- ✅ Botón "Generar Certificados" en panel organizador
- ✅ Solo para eventos FINALIZADOS con asistencia registrada

### 📧 Notificaciones por Email (NUEVO)

- ✅ Sistema queue-based con Bull + Redis
- ✅ 4 templates HTML profesionales:
  - **Welcome Email**: Al registrarse nuevo usuario
  - **Enrollment Confirmation**: Al inscribirse en evento
  - **Payment Confirmation**: Al confirmar pago exitoso
  - **Certificate Ready**: Al generar certificado
- ✅ Retry automático con backoff exponencial
- ✅ Diseño responsive con gradientes y branding

### 🎤 Gestión de Ponentes

- ✅ Invitación de ponentes a sesiones
- ✅ Sistema de respuestas: PENDIENTE → ACEPTADA / RECHAZADA
- ✅ Email de invitación con links de aceptar/rechazar

### 📊 Panel de Organizador

- ✅ Reportes de eventos con estadísticas
- ✅ Gestión de asistencia (manual y QR)
- ✅ Dashboard con métricas en tiempo real
- ✅ Publicación y aprobación de eventos

---

## 🛠️ Stack Tecnológico

### Backend (NestJS 10)

```
- Framework: NestJS 10 con TypeScript
- Database: PostgreSQL + TypeORM 0.3
- Authentication: JWT + Passport + Google OAuth
- Payments: Stripe SDK
- Email: Nodemailer + Handlebars
- Queue: Bull + Redis
- PDF: PDFKit
- Documentation: Swagger/OpenAPI
```

**Patrones Backend**:

- Repository Pattern
- Service Layer Pattern
- Dependency Injection
- Queue-based Processing
- Guard-based Authorization
- DTO Validation
- Event Sourcing (webhooks)

### Frontend (Angular 17)

```
- Framework: Angular 17.3.17 con SSR
- Forms: Reactive Forms + Validators
- HTTP: HttpClient + Interceptors
- State: RxJS + BehaviorSubject
- Routing: Lazy Loading Modules
- Styling: Tailwind CSS + SCSS
- Payments: @stripe/stripe-js
```

**Patrones Frontend**:

- Feature Modules (Lazy Loading)
- Smart/Dumb Components
- Service Layer (data abstraction)
- Route Guards
- HTTP Interceptors
- Observable Streams

### Infrastructure

```
- PostgreSQL 14+
- Redis 6+
- Node.js 18+
- npm 9+
```

---

## 📁 Estructura del Proyecto

```
PROYECTO_PATRONES/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Autenticación (JWT + Google)
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── roles/         # Sistema de roles
│   │   │   ├── events/        # CRUD de eventos
│   │   │   ├── registrations/ # Inscripciones
│   │   │   ├── payments/      # Stripe integration
│   │   │   ├── certificates/  # Generación PDFs
│   │   │   ├── sessions/      # Sesiones de eventos
│   │   │   ├── attendance/    # Control de asistencia
│   │   │   └── common/
│   │   │       └── notifications/  # Email system
│   │   │           ├── notifications.service.ts
│   │   │           ├── notifications.processor.ts
│   │   │           └── templates/  # HTML email templates
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   ├── enums/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── shared/
│   │       ├── decorators/
│   │       ├── guards/
│   │       └── dto/
│   └── package.json
│
├── frontend/                   # Angular 17 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/    # AuthGuard, RoleGuard
│   │   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   │   └── services/  # Global services
│   │   │   ├── features/
│   │   │   │   ├── auth/      # Login, Register
│   │   │   │   ├── events/    # Events catalog, CRUD
│   │   │   │   ├── registrations/  # My registrations
│   │   │   │   ├── payments/  # Stripe checkout
│   │   │   │   ├── certificates/   # My certificates
│   │   │   │   ├── organizer/ # Organizer dashboard
│   │   │   │   └── speaker-response/  # Speaker invitations
│   │   │   └── shared/
│   │   ├── environments/
│   │   └── styles/
│   └── package.json
│
├── IMPLEMENTACION_COMPLETA.md  # Resumen de implementación
├── CONFIGURACION_FINAL.md      # Setup checklist
├── STRIPE_SETUP.md             # Guía de Stripe
├── REVISION_FINAL.md           # Análisis técnico
├── PENDIENTES.md               # Features pendientes
└── README.md                   # Este archivo
```

---

## 🚀 Instalación

### Prerequisitos

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- npm >= 9

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd PROYECTO_PATRONES
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run migration:run

# Ejecutar seeds (roles iniciales)
npm run seed

# Iniciar en desarrollo
npm run start:dev
```

**Backend** estará en: `http://localhost:3000`  
**Swagger Docs**: `http://localhost:3000/api`

### 3. Configurar Frontend

```bash
cd frontend
npm install

# Editar src/environments/environment.ts
# Configurar apiUrl y stripePublishableKey

# Iniciar en desarrollo
npm start
```

**Frontend** estará en: `http://localhost:4200`

### 4. Configurar Servicios Externos

#### Stripe (para pagos)

```bash
# Obtener claves en https://dashboard.stripe.com
# Configurar en backend/.env:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configurar en frontend/src/environments/environment.ts:
stripePublishableKey: 'pk_test_...'

# Iniciar webhook forwarding (terminal separado)
stripe listen --forward-to localhost:3000/payments/webhook
```

#### Email (Gmail SMTP)

```bash
# En backend/.env:
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password  # De Google App Passwords
MAIL_FROM="Eventos Académicos <noreply@eventos.com>"
APP_URL=http://localhost:4200
```

#### Redis (para notificaciones)

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Configurar en backend/.env:
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📚 Documentación

Consulta los siguientes archivos para más detalles:

- **[CONFIGURACION_FINAL.md](./CONFIGURACION_FINAL.md)**: Checklist de configuración paso a paso
- **[IMPLEMENTACION_COMPLETA.md](./IMPLEMENTACION_COMPLETA.md)**: Resumen técnico completo de certificados y notificaciones
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)**: Guía detallada de configuración de Stripe
- **[REVISION_FINAL.md](./REVISION_FINAL.md)**: Análisis técnico del flujo completo
- **[PENDIENTES.md](./PENDIENTES.md)**: Features pendientes por prioridad

---

## 📊 Estado del Proyecto

### ✅ Completado (100%)

- Autenticación (Local + Google OAuth)
- Gestión de eventos completa
- Sistema de inscripciones
- Pagos con Stripe (con webhooks)
- **Certificados PDF** _(nuevo)_
- **Notificaciones por email** _(nuevo)_
- Panel de organizador
- Invitación de ponentes

### 🚧 En Progreso (Pendientes)

- Sesiones de eventos (Backend 80%, Frontend 0%)
- Reportes avanzados (Backend 50%, Frontend 0%)
- Asistencia con QR (Backend 70%, Frontend 0%)

### 📋 Por Hacer (Prioridad Media/Baja)

- Búsqueda avanzada de eventos
- Evaluaciones de eventos
- Gestión de salas
- Sistema de notificaciones in-app

---

## 🧪 Testing

### Backend

```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage
```

### Frontend

```bash
cd frontend
npm run test           # Karma tests
npm run test:coverage  # Coverage report
```

---

## 🏗️ Build para Producción

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
# Output en: dist/frontend/
```

---

## 📝 Patrones de Diseño Implementados

### Backend

- **Repository Pattern**: Acceso a datos con TypeORM
- **Service Layer**: Lógica de negocio separada de controladores
- **Dependency Injection**: Constructor injection en todos los servicios
- **Queue-based Processing**: Bull + Redis para emails asíncronos
- **Guard Pattern**: Authorization con JwtAuthGuard y RolesGuard
- **DTO Validation**: class-validator en todos los DTOs
- **Event Sourcing**: Webhooks de Stripe como source of truth

### Frontend

- **Feature Modules**: Lazy loading para optimización
- **Smart/Dumb Components**: Separación de lógica y presentación
- **Service Layer**: Abstracción de llamadas HTTP
- **Route Guards**: Control de acceso a rutas
- **Reactive Forms**: Validación declarativa
- **HTTP Interceptors**: Manejo centralizado de auth y errores

---

## 🔒 Seguridad

- ✅ JWT con expiración configurable
- ✅ Passwords hasheados con bcrypt (12 rounds)
- ✅ CORS configurado
- ✅ Rate limiting (recomendado en producción)
- ✅ Validación de DTOs con class-validator
- ✅ SQL Injection prevention (TypeORM parameterized queries)
- ✅ XSS protection (Angular sanitization)
- ✅ Stripe webhook signature validation

---

## 👥 Roles y Permisos

| Rol              | Permisos                                                           |
| ---------------- | ------------------------------------------------------------------ |
| **ADMIN**        | Acceso completo, aprobar eventos, gestión de usuarios              |
| **ORGANIZADOR**  | Crear/editar eventos propios, ver reportes, generar certificados   |
| **PARTICIPANTE** | Ver eventos, inscribirse, ver certificados, cancelar inscripciones |
| **PONENTE**      | Responder invitaciones, ver sesiones asignadas                     |

---

## 🌐 URLs del Sistema

| Servicio     | URL                         | Descripción               |
| ------------ | --------------------------- | ------------------------- |
| Frontend     | `http://localhost:4200`     | Aplicación web            |
| Backend API  | `http://localhost:3000`     | REST API                  |
| Swagger Docs | `http://localhost:3000/api` | Documentación interactiva |
| PostgreSQL   | `localhost:5432`            | Base de datos             |
| Redis        | `localhost:6379`            | Queue system              |

---

## 📞 Soporte

Para problemas o dudas:

1. Revisar logs del backend y frontend
2. Consultar documentación en archivos .md
3. Verificar configuración de .env
4. Revisar Swagger docs en `/api`

---

## 📄 Licencia

Este proyecto es de uso académico.

---

**Desarrollado con ❤️ usando Angular 17 y NestJS 10**

_Última actualización: 18 de Enero, 2025_
