# Estado del Proyecto - Funcionalidades Pendientes

**Fecha:** 3 de junio de 2026  
**Estado actual:** ✅ **Sistema de pagos con Stripe 100% funcional**

---

## ✅ Módulos 100% Completos (Backend + Frontend)

### 1. Autenticación y Autorización

- ✅ Registro de usuarios
- ✅ Login con correo/contraseña
- ✅ Login con Google OAuth 2.0
- ✅ Guards de ruta (AuthGuard, RolesGuard)
- ✅ Gestión de roles (ADMIN, ORGANIZADOR, PARTICIPANTE)

### 2. Gestión de Eventos

- ✅ CRUD completo de eventos
- ✅ Estados (BORRADOR, PUBLICADO, EN_CURSO, FINALIZADO, CANCELADO)
- ✅ Modalidades (PRESENCIAL, VIRTUAL, HÍBRIDO)
- ✅ Tipos de inscripción (GRATUITA, PAGA)
- ✅ Campo de precio con validación
- ✅ Control de cupos
- ✅ Catálogo público con búsqueda y filtros

### 3. Inscripciones

- ✅ Inscripción a eventos publicados
- ✅ Control de duplicados
- ✅ Control de cupos con transacciones
- ✅ Vista "Mis Inscripciones"
- ✅ Estados (PENDIENTE, CONFIRMADA, CANCELADA, FALLIDA)

### 4. Sistema de Pagos con Stripe ⭐ **RECIÉN COMPLETADO**

- ✅ Creación de PaymentIntent
- ✅ Idempotencia de pagos
- ✅ Integración de Payment Element
- ✅ Flujo completo de checkout
- ✅ Webhook con validación de firma
- ✅ Polling de confirmación
- ✅ Manejo de errores y reintentos
- ✅ Feedback visual en cada fase
- ✅ Documentación completa (STRIPE_SETUP.md)

### 5. Panel de Organizador (Básico)

- ✅ Vista de eventos propios
- ✅ Registro de asistencia manual
- ✅ Lista de inscritos por evento
- ✅ Vista de asistencia básica

---

## ⚠️ Módulos Parcialmente Implementados

### 1. Gestión de Sesiones (Sessions)

**Backend:** ✅ 100% completo  
**Frontend:** ❌ No implementado

**Funcionalidades backend:**

- CRUD de sesiones dentro de eventos
- Invitación de speakers por correo
- Respuesta de invitaciones (aceptar/rechazar)
- Relación sesión-speakers (SessionSpeaker)
- Estados de invitación (PENDIENTE, ACEPTADA, RECHAZADA)

**Lo que falta en frontend:**

- [ ] Interfaz para crear/editar sesiones de un evento
- [ ] Lista de sesiones de un evento
- [ ] Formulario para invitar speakers
- [ ] Panel para que organizadores vean respuestas de speakers
- [ ] Vista de agenda del evento con sesiones

**Impacto:** Eventos multi-track o con múltiples sesiones no se pueden gestionar desde el frontend.

**Prioridad:** 🟡 Media (útil para eventos complejos)

---

### 2. Certificados

**Backend:** ✅ 100% completo  
**Frontend:** ❌ No implementado

**Funcionalidades backend:**

- Generación automática de certificados PDF
- Endpoint POST `/certificates/generate/:eventoId` (genera para todos los asistentes de evento FINALIZADO)
- Endpoint GET `/certificates/:codigoUnico` (descarga PDF individual)
- Código único por certificado (UUID)
- Validación: solo para eventos finalizados e inscripciones confirmadas
- Prevención de duplicados

**Lo que falta en frontend:**

- [ ] Botón "Generar Certificados" en panel de organizador (para eventos finalizados)
- [ ] Vista "Mis Certificados" para participantes
- [ ] Descarga de PDF de certificado
- [ ] Vista previa del certificado
- [ ] Compartir certificado (link público con código único)

**Impacto:** Participantes no pueden descargar certificados de asistencia.

**Prioridad:** 🔴 Alta (funcionalidad esperada en eventos académicos)

---

### 3. Reportes y Estadísticas

**Backend:** ✅ 100% completo  
**Frontend:** ❌ No implementado

**Funcionalidades backend:**

- Endpoint GET `/reports/event/:eventoId` devuelve:
  - Total de inscritos
  - Total de asistentes
  - Tasa de asistencia (%)
  - Distribución por estado (PENDIENTE, CONFIRMADA, CANCELADA, FALLIDA)
  - Modalidad del evento

**Lo que falta en frontend:**

- [ ] Panel de estadísticas en vista de organizador
- [ ] Gráficos de inscritos vs asistentes
- [ ] Distribución por estado (torta/barras)
- [ ] Exportar reporte a PDF/Excel
- [ ] Dashboard general con resumen de todos los eventos

**Impacto:** Organizadores no tienen visibilidad de métricas del evento.

**Prioridad:** 🟡 Media (útil para análisis post-evento)

---

### 4. Notificaciones por Email

**Backend:** ⚠️ Parcialmente configurado  
**Frontend:** ❌ No integrado

**Estado actual:**

- Mailer configurado con Mailhog (desarrollo)
- Module de notificaciones existe pero sin implementación completa

**Lo que falta:**

- [ ] Email al registrarse (bienvenida)
- [ ] Email al inscribirse a evento
- [ ] Email al confirmar pago
- [ ] Email con certificado adjunto
- [ ] Email de invitación a speakers
- [ ] Email de recordatorio de evento (1 día antes)
- [ ] Email al cancelar inscripción
- [ ] Plantillas de email con diseño (HTML)

**Impacto:** Usuarios no reciben confirmaciones ni notificaciones.

**Prioridad:** 🟡 Media-Alta (mejora UX significativamente)

---

## ❌ Funcionalidades No Implementadas

### 1. Gestión Completa de Asistencia

**Estado actual:** Solo registro manual básico en panel organizador

**Funcionalidades pendientes:**

- [ ] Código QR por inscripción (para check-in rápido)
- [ ] Escaneo de QR desde app móvil o web
- [ ] Registro de asistencia por sesión (no solo evento completo)
- [ ] Historial de check-ins con timestamp
- [ ] Exportar lista de asistencia a CSV/Excel
- [ ] Vista en tiempo real de asistentes presentes

**Impacto:** Check-in manual es lento para eventos grandes.

**Prioridad:** 🟡 Media (útil para eventos presenciales grandes)

---

### 2. Búsqueda Avanzada y Filtros

**Estado actual:** Búsqueda básica por texto en catálogo

**Funcionalidades pendientes:**

- [ ] Filtro por fecha (rango)
- [ ] Filtro por modalidad (PRESENCIAL, VIRTUAL, HÍBRIDO)
- [ ] Filtro por tipo (GRATUITA, PAGA)
- [ ] Filtro por estado (PUBLICADO, EN_CURSO)
- [ ] Ordenamiento (más recientes, más cercanos, precio, popularidad)
- [ ] Guardar eventos favoritos
- [ ] Recomendaciones personalizadas

**Impacto:** Difícil encontrar eventos específicos si hay muchos.

**Prioridad:** 🟢 Baja (nice to have)

---

### 3. Gestión de Ubicaciones y Salas

**Estado actual:** Campo de texto libre "ubicación" en evento

**Funcionalidades pendientes:**

- [ ] Catálogo de ubicaciones/salas predefinidas
- [ ] Capacidad por sala
- [ ] Conflictos de horario (misma sala, dos eventos simultáneos)
- [ ] Mapa interactivo de ubicación
- [ ] Disponibilidad de salas en tiempo real

**Impacto:** Posibles conflictos de salas en eventos presenciales.

**Prioridad:** 🟢 Baja (para instituciones con múltiples sedes)

---

### 4. Evaluaciones y Feedback

**Estado actual:** No implementado

**Funcionalidades pendientes:**

- [ ] Formulario de evaluación post-evento
- [ ] Calificación por estrellas
- [ ] Comentarios de participantes
- [ ] Vista de evaluaciones para organizador
- [ ] Estadísticas de satisfacción (NPS)

**Impacto:** No hay retroalimentación de los participantes.

**Prioridad:** 🟡 Media (útil para mejora continua)

---

### 5. Sistema de Aprobación de Inscripciones

**Estado actual:** Campo `requiereAprobacion` existe en evento pero no se usa

**Funcionalidades pendientes:**

- [ ] Flujo de aprobación manual por organizador
- [ ] Estado PENDIENTE_APROBACION
- [ ] Notificación al organizador de nueva solicitud
- [ ] Panel para aprobar/rechazar inscripciones
- [ ] Notificación al usuario sobre decisión

**Impacto:** Todos los eventos tienen inscripción abierta.

**Prioridad:** 🟢 Baja (útil para eventos exclusivos)

---

## 📊 Resumen de Prioridades

### 🔴 Prioridad Alta (Hacer pronto)

1. **Certificados** - funcionalidad clave de eventos académicos
2. **Notificaciones por email** - mejora UX significativamente

### 🟡 Prioridad Media (Hacer después)

3. **Gestión de Sesiones** - para eventos multi-track
4. **Reportes y Estadísticas** - análisis de eventos
5. **Gestión completa de Asistencia** - check-in con QR
6. **Evaluaciones post-evento** - retroalimentación

### 🟢 Prioridad Baja (Nice to have)

7. **Búsqueda avanzada** - cuando hay muchos eventos
8. **Gestión de Salas** - para instituciones grandes
9. **Sistema de Aprobación** - eventos exclusivos

---

## 🚀 Recomendación de Próximos Pasos

Si quieres continuar desarrollando, te sugiero este orden:

### Fase 1: Completar Experiencia del Usuario (2-3 días)

1. ✅ **Pagos con Stripe** - ✅ YA ESTÁ COMPLETO
2. **Certificados** - descargar certificado de asistencia
3. **Notificaciones básicas** - email al inscribirse y al pagar

### Fase 2: Funcionalidades para Organizadores (2-3 días)

4. **Reportes básicos** - estadísticas del evento
5. **Gestión de Sesiones** - crear sesiones e invitar speakers
6. **Asistencia con QR** - check-in rápido

### Fase 3: Mejoras y Optimizaciones (1-2 días)

7. **Evaluaciones** - formulario post-evento
8. **Búsqueda avanzada** - filtros por fecha, modalidad, precio
9. **Pulir UI/UX** - animaciones, skeleton loaders, responsive

---

## 💡 ¿Qué quieres hacer primero?

Opciones:

- **A) Certificados** - Permitir que usuarios descarguen certificados de asistencia
- **B) Sesiones** - Gestionar sesiones dentro de eventos y speakers
- **C) Reportes** - Panel de estadísticas para organizadores
- **D) Notificaciones** - Emails automáticos en flujos clave
- **E) Otra cosa** - Dime qué funcionalidad necesitas

**Estado actual:** ✅ El core del sistema está completo y funcional. Todo lo listado aquí son mejoras/extensiones.
