# 📋 Checklist de Configuración Final

## ⚙️ Variables de Entorno

### Backend (.env)

Verificar que el archivo `backend/.env` tenga las siguientes variables configuradas:

```bash
# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=eventos_academicos

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=1d

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Stripe (REQUERIDO para pagos)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Redis (REQUERIDO para notificaciones)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (REQUERIDO para notificaciones)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password-de-gmail
MAIL_FROM="Eventos Académicos <noreply@eventos.com>"

# App URL (para links en emails)
APP_URL=http://localhost:4200
```

### Frontend (environments)

Verificar `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  stripePublishableKey: "pk_test_xxxxxxxxxxxxxxxxxxxx",
};
```

---

## 🚀 Pasos de Instalación

### 1. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Ejecutar migraciones (si las hay)
npm run migration:run

# Ejecutar seeds (para roles y datos iniciales)
npm run seed

# Iniciar en desarrollo
npm run start:dev
```

**Verificar**:

- ✅ Backend corriendo en `http://localhost:3000`
- ✅ Swagger docs en `http://localhost:3000/api`
- ✅ PostgreSQL conectado
- ✅ Redis conectado (verificar logs "Bull queue is ready")

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start
```

**Verificar**:

- ✅ Frontend corriendo en `http://localhost:4200`
- ✅ No hay errores en consola del navegador
- ✅ Puede hacer login

---

## 📧 Configuración de Email (Gmail)

Para usar Gmail como proveedor SMTP:

### Paso 1: Habilitar autenticación de 2 factores

1. Ir a [myaccount.google.com](https://myaccount.google.com)
2. Seguridad → Autenticación en dos pasos → Activar

### Paso 2: Generar contraseña de aplicación

1. Ir a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Seleccionar "Correo" y dispositivo "Otro"
3. Copiar la contraseña generada (16 caracteres)
4. Usar esta contraseña en `MAIL_PASSWORD`

### Paso 3: Probar envío

```bash
# En el backend, ejecutar:
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "correo": "tu-email@gmail.com",
    "password": "password123"
  }'
```

**Verificar**:

- ✅ Email de bienvenida recibido en bandeja de entrada
- ✅ No hay errores en logs del backend

---

## 💳 Configuración de Stripe

### Paso 1: Obtener claves

1. Ir a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Modo prueba → API Keys
3. Copiar:
   - **Publishable key** (pk*test*...) → `frontend/src/environments/environment.ts`
   - **Secret key** (sk*test*...) → `backend/.env`

### Paso 2: Configurar Webhook

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks (dejar corriendo en terminal)
stripe listen --forward-to localhost:3000/payments/webhook
```

**Copiar webhook secret** (whsec\_...) a `STRIPE_WEBHOOK_SECRET` en `.env`

### Paso 3: Probar pago

1. Crear evento de pago desde el frontend
2. Inscribirse
3. Ir a checkout
4. Usar tarjeta de prueba: `4242 4242 4242 4242`
5. Fecha: cualquier futura, CVC: 123
6. Completar pago

**Verificar**:

- ✅ Pago confirmado en Stripe Dashboard
- ✅ Estado de inscripción cambió a CONFIRMADA
- ✅ Email de confirmación de pago recibido
- ✅ Webhook procesado en logs del backend

---

## 🗄️ Configuración de Redis

### Instalación

#### macOS

```bash
brew install redis
brew services start redis
```

#### Linux

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Windows

```bash
# Usar WSL2 o Docker
docker run -d -p 6379:6379 redis:alpine
```

### Verificar conexión

```bash
redis-cli ping
# Debe responder: PONG
```

---

## 🎓 Probar Funcionalidades Completas

### 1. Certificados

#### Como Organizador:

1. Crear evento con estado FINALIZADO
2. Registrar asistencia manual de participantes
3. Ir a "Panel de Evento" → Pestaña "Acciones"
4. Clic en "Generar certificados"
5. Verificar mensaje: "X certificados generados"

**Verificar**:

- ✅ Certificados creados en base de datos
- ✅ Emails enviados a participantes
- ✅ Usuarios reciben notificación de certificado listo

#### Como Participante:

1. Ir a `/mis-certificados` en navegación
2. Ver listado de certificados disponibles
3. Clic en "Descargar PDF"
4. Verificar PDF se abre en nueva pestaña

**Verificar**:

- ✅ Lista carga correctamente
- ✅ PDF se descarga con diseño correcto
- ✅ Código único visible en PDF

### 2. Notificaciones Email

#### Test 1: Welcome Email

```bash
# Registrar nuevo usuario desde frontend o Postman
POST http://localhost:3000/auth/register
{
  "nombre": "Usuario Test",
  "correo": "test@example.com",
  "password": "password123"
}
```

**Verificar**: Email de bienvenida con CTA "Explorar Eventos"

#### Test 2: Enrollment Confirmation

1. Inscribirse en un evento (gratuito o de pago)
2. Verificar email con detalles del evento
   - Badge verde "CONFIRMADA"
   - Fecha, modalidad, ubicación
   - Warning si es de pago

#### Test 3: Payment Confirmation

1. Completar pago de inscripción pendiente
2. Verificar email con:
   - Resumen de pago (monto, método, ID transacción)
   - Detalles del evento
   - Mensaje de comprobante

#### Test 4: Certificate Ready

1. Generar certificados como organizador
2. Verificar email con:
   - Código único
   - CTA "Descargar Certificado"
   - Detalles del evento

---

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Verificar logs
npm run start:dev

# Errores comunes:
# - PostgreSQL no conecta → Verificar credenciales en .env
# - Redis no conecta → Iniciar redis-server
# - Puerto 3000 ocupado → Cambiar en main.ts
```

### Frontend no compila

```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm install

# Verificar versiones
node -v  # Debe ser >= 18
npm -v   # Debe ser >= 9
```

### Emails no se envían

```bash
# Verificar logs del processor
# Buscar en consola: "Email de [tipo] enviado a [correo]"

# Verificar Redis
redis-cli
> KEYS *notifications*

# Verificar configuración SMTP
# Probar con https://mailtrap.io en desarrollo
```

### Stripe webhook no funciona

```bash
# Verificar que Stripe CLI está corriendo
stripe listen --forward-to localhost:3000/payments/webhook

# Verificar secret en .env coincide con el mostrado en CLI
# Logs deben mostrar: "Webhook received: payment_intent.succeeded"
```

### Certificados no se generan

```bash
# Verificar que evento esté FINALIZADO
# Verificar que hay registros de asistencia
# Verificar logs: "X certificados generados"

# Query manual en DB:
SELECT * FROM certificate WHERE "inscripcionId" = 'uuid-aqui';
```

---

## ✅ Checklist Final

Antes de considerar el proyecto listo:

### Backend

- [ ] Todas las variables de entorno configuradas
- [ ] PostgreSQL conectado y migraciones ejecutadas
- [ ] Redis corriendo y conectado
- [ ] `npm run build` exitoso sin errores
- [ ] Swagger docs accesibles en `/api`
- [ ] SMTP configurado y probado
- [ ] Stripe keys configuradas

### Frontend

- [ ] Variables de entorno configuradas
- [ ] `npm run build` exitoso sin errores
- [ ] Puede hacer login/registro
- [ ] Navegación a `/mis-certificados` funciona
- [ ] Checkout de Stripe funciona

### Funcionalidades

- [ ] Email de bienvenida se envía al registrarse
- [ ] Email de inscripción se envía al inscribirse
- [ ] Email de pago se envía al confirmar pago
- [ ] Email de certificado se envía al generar
- [ ] Certificados se generan correctamente
- [ ] PDFs se descargan correctamente
- [ ] Botón "Generar certificados" funciona en panel organizador

### Documentación

- [ ] README.md actualizado
- [ ] STRIPE_SETUP.md revisado
- [ ] IMPLEMENTACION_COMPLETA.md creado
- [ ] Variables de entorno documentadas
- [ ] Pasos de instalación documentados

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisar logs** del backend y frontend
2. **Verificar configuración** de .env
3. **Consultar documentación** en los archivos MD del proyecto
4. **Buscar errores** en consola del navegador (F12)

---

**¡Listo para producción! 🚀**

_Última actualización: 18 de Enero, 2025_
