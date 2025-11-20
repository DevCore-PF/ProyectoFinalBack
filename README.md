# DevCore - Backend Plataforma Educativa 🚀

Backend modular para un marketplace de cursos con identidad unificada, flujos de pago avanzados, gestión de perfiles y automatizaciones basadas en cron jobs.

---

## 🧩 Stack Técnico

- **Framework:** NestJS (TypeScript), arquitectura modular y basada en decoradores.
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM (migraciones, relaciones, repositorios personalizados).
- **Almacenamiento de Archivos:** Cloudinary (certificados y fotos de perfil para los usuarios, y videos y pdf para las lecciones de cursos). 
- **Automatización:** `@nestjs/schedule` para cron jobs de carritos abandonados.

---

## 🧠 Arquitectura General

- **Módulo de Autenticación:** Manejo de login/registro local y social (Google, GitHub), verificación de email, recuperación de contraseña.
- **Módulo de Usuarios y Perfiles:** Entidades `User`, `StudentProfile`, `ProfessorProfile` con roles y estados de aprobación.
- **Módulo de Cursos y Enrollments:** Gestión de cursos, lecciones, matrículas (`Enrollment`) y lógica de ganancias 70/30.
- **Módulo de Pagos:** Integración con Stripe Checkout, webhooks y persistencia en `Payment`, `Payout`.
- **Módulo de Notificaciones:** Envío de emails transaccionales (verificación, recordatorios, notificaciones de aprobación entre otras).
- **Módulo de Configuración:** Tabla `Settings` para parámetros dinámicos como tiempos de carritos abandonados.

---

## 🔑 Autenticación Avanzada (Identidad Unificada)

### Flujo Local (Email + Password)

- **Registro:**  
  - Crea un usuario local con email y password hasheado.  
  - Envía email de verificación con token de un solo uso.  
  - Hasta verificar, restringe acciones sensibles (pagos, creación de cursos).

- **Login:**  
  - Valida credenciales, estado de verificación y `isActive`.  
  - Genera JWT con `sub`, `role` y `providersVinculados`.  

### Login / Registro Social (Google, GitHub)

- **Flujos separados de Login y Registro Social:**
  - Endpoints específicos por proveedor (`/auth/google`, `/auth/github`) usando estrategias de Passport. 
  - Si el proveedor no existe para el usuario, se agrega a la lista de conexiones.

- **Vinculación Automática por Email:**
  - Si el email ya existe (local o social), se vincula automáticamente el nuevo proveedor sin duplicar usuarios.
  - Mantiene un único registro de `User` con múltiples proveedores (local, google, github).

### Seguridad y Recuperación 🔐

- **Verificación de Email:**
  - Endpoint para confirmar el token.
  - Expiración configurable (por ejemplo, 12h).

- **Olvidé mi Contraseña:**
  - Generación de token temporal asociado al usuario.
  - Endpoint para reset mediante nueva contraseña validando token y expiración.

- **Añadir Contraseña Local (Usuarios Sociales):**
  - Endpoint protegido donde un usuario con proveedor social puede establecer una contraseña local.
  - A partir de este punto puede autenticarse vía email/password además de Google/GitHub.

---

## 👥 Gestión de Perfiles y Roles

### Roles Soportados

- `ADMIN`
- `PROFESSOR`
- `STUDENT`

### Flujo de Ascenso de Rol a Profesor 🎓

1. Usuario con rol `STUDENT` completa un formulario de aplicación a profesor.
2. Sube certificados y documentación a Cloudinary (PDF, imágenes) mediante endpoints que usan el SDK de Cloudinary. 
3. Se crea un `ProfessorProfile` en estado `PENDING`, asociado al `User`.

### Aprobación de Administrador

- Panel / endpoints para que `ADMIN`:
  - Liste solicitudes pendientes (`ProfessorProfile` con estado `PENDING`).
  - Cambie el estado a `APPROVED` o `REJECTED`.
- Al aprobar:
  - Se actualiza el rol del `User` a `PROFESSOR`.
  - Se registra fecha y usuario aprobador.
  - Se dispara un email de notificación al solicitante.
- Al rechazar:
  - Se mantiene el rol como `STUDENT`.
  - Se envía email con causa/recomendaciones.

---

## 🛒 E‑commerce y Monetización

### Carrito Persistente

- Entidad `Cart` asociada a `User`:
  - Items con referencia a cursos, cantidad (generalmente 1) y precio al momento de añadir.
  - Permite modificar, eliminar y limpiar el carrito.
- Solo usuarios autenticados pueden mantener un carrito persistente; invitados se gestionan en frontend.

### Stripe Checkout (Carritos con Múltiples Ítems) 💳

- Endpoint para crear sesión de Stripe Checkout a partir del carrito:
  - Mapeo de `CartItems` a `line_items` de Stripe Checkout. 
  - URL de éxito y cancelación configurables.
- Webhook de Stripe:
  - Valida la firma con `STRIPE_WEBHOOK_SECRET`. 
  - Procesa eventos relevantes (por ejemplo, `checkout.session.completed`).
  - Crea registros en `Payment` y `Enrollment`.

### Registro de Transacción (`Payment`)

- Campos típicos:
  - `amount`, `currency`, `stripePaymentIntentId`.
  - Últimos 4 dígitos de la tarjeta.
  - Tipo de tarjeta (Visa, Mastercard, etc.). 
  - Estado (`SUCCEEDED`, `FAILED`, etc.).
- Relación con usuario y cursos adquiridos (directa o a través de `Enrollment`).

### Lógica de Ganancias 70/30

- Al confirmar un pago exitoso:
  - Se crean `Enrollment` por cada curso comprado.
  - Se calcula:
    - `instructorShare = amount * 0.7`
    - `platformShare = amount * 0.3`
  - Se almacenan estos montos por `Enrollment` para tener trazabilidad histórica (aunque el precio cambie después).

### Sistema de Payouts (Pagos a Profesores) 💸

- Entidad `Payout`:
  - Agrupa `Enrollments` o balances pendientes de un profesor.
  - Campos: `totalAmount`, `status` (`PENDING`, `PAID`), `referenceNumber`, `paidAt`.
- Flujo:
  1. Cálculo de ingresos pendientes por profesor.
  2. Generación de reportes de payout (por rango de fechas, estado, profesor).
  3. Método/endpoint de administrador para marcar un lote como pagado:
     - Guarda `referenceNumber` de la transferencia bancaria.
     - Actualiza `status` a `PAID`.

---

## ⏱️ Automatización con Cron Jobs

### Carritos Abandonados 🛎️

- Uso de `@nestjs/schedule` con expresión `@Cron(CronExpression.EVERY_HOUR)` o equivalente. [web:19]
- Tabla `Settings`:
  - Define el tiempo de espera antes de considerar un carrito como abandonado (24, 48, 72 horas).
  - Permite cambiar el comportamiento sin redeploy.
- Flujo del cron job:
  1. Lee el valor de timeout de `Settings`.
  2. Busca carritos inactivos (sin actualización) que superen el umbral.
  3. Envía email de recordatorio con el resumen de cursos.
  4. Opcionalmente marca el carrito con un flag de “recordatorio enviado”.

---

## ⚙️ Configuración Local (.env)

Ejemplo de variables importantes para desarrollo local:

APP
PORT=3001

DB
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=prueba

JWT
JWT_SECRET=your-secret

Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

Social Login
GOOGLE_CLIENT_ID=Client-Id
GOOGLE_CLIENT_SECRET=Client-Secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/redirect

GITHUB_CLIENT_ID=Client-Id
GITHUB_CLIENT_SECRET=Client-Secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/redirect

Mail Service
EMAIL_USER=dcorreoprueba@gmail.com
EMAIL_PASS=your-Password


---

## 🛠️ Scripts de Desarrollo

- `npm run start:dev` – Levanta el backend en modo desarrollo con hot-reload.
  
---

## 🔌 Endpoints Clave (Referencia Rápida)

> Rutas a modo de referencia; los paths exactos pueden variar según versión del API.
> Mas informacion de los ednpoint puedes consultar la documentacion con swagguer http://localhost:3001/api

### Autenticación 🔑

| Método | Ruta                          | Descripción                                           |
|--------|-------------------------------|-------------------------------------------------------|
| POST   | `/auth/register`              | Registro local con email y password.                 |
| POST   | `/auth/login`                 | Login local y emisión de JWT.                        |
| POST   | `/auth/google/login`         | Login con Google.                                    |
| POST   | `/auth/google/register`      | Registro con Google.                                 |
| POST   | `/auth/github/login`         | Login con GitHub.                                    |
| POST   | `/auth/github/register`      | Registro con GitHub.                                 |
| POST   | `/auth/forgot-password`      | Solicitar email para resetear contraseña.            |
| POST   | `/auth/reset-password`       | Confirmar nueva contraseña con token.                |
| POST   | `/auth/add-password`         | Usuario social añade contraseña local.               |
| GET    | `/auth/verify-email/:token`  | Verificación de email.                               |

### Perfiles y Roles 👥

| Método | Ruta                                   | Descripción                                              |
|--------|----------------------------------------|----------------------------------------------------------|
| GET    | `/users/me`                           | Obtener perfil del usuario autenticado.                 |
| POST   | `/professors/apply`                  | Enviar solicitud para rol de profesor.                  |
| GET    | `/admin/professors/applications`     | Listar solicitudes de profesor (ADMIN).                 |
| PATCH  | `/admin/professors/:id/approve`      | Aprobar solicitud y cambiar rol a `PROFESSOR`.          |
| PATCH  | `/admin/professors/:id/reject`       | Rechazar solicitud.                                     |

### Carrito y Pagos 🛒

| Método | Ruta                                  | Descripción                                                   |
|--------|---------------------------------------|---------------------------------------------------------------|
| GET    | `/cart`                              | Obtener carrito actual del usuario.                          |
| POST   | `/cart/items`                        | Añadir curso al carrito.                                     |
| PATCH  | `/cart/items/:id`                    | Actualizar item del carrito.                                 |
| DELETE | `/cart/items/:id`                    | Eliminar item del carrito.                                   |
| POST   | `/payments/checkout`                | Crear sesión de Stripe Checkout desde el carrito.            |
| POST   | `/webhooks/stripe`                  | Endpoint de webhook para eventos de Stripe.                  |
| GET    | `/payments/history`                 | Listar pagos del usuario.                                    |

### Payouts 💸

| Método | Ruta                                  | Descripción                                           |
|--------|---------------------------------------|-------------------------------------------------------|
| GET    | `/admin/payouts`                    | Listar payouts generados.                            |
| POST   | `/admin/payouts/generate`           | Generar nuevos payouts en base a enrollments.        |
| PATCH  | `/admin/payouts/:id/mark-paid`      | Marcar payout como pagado con número de referencia.  |

### Automatización / Settings ⏱️

| Método | Ruta                         | Descripción                                           |
|--------|------------------------------|-------------------------------------------------------|
| GET    | `/admin/settings`           | Obtener configuración global (incluye carritos).     |
| PATCH  | `/admin/settings`           | Actualizar valores como timeout de carritos.         |

---

## 📁 Estructura de Carpetas
- src/
- src/config
- src/mail
- src/modules
- src/modules/admin
- src/modules/auth
- src/modules/cart
- src/modules/cloudinary
- src/modules/course
- src/modules/CourseFeedback
- src/modules/enrollments
- src/modules/lesson
- src/modules/moderation
- src/modules/payments
- src/modules/profiles
- src/modules/settings
- src/modules/studentprofile
- src/modules/task
- src/modules/users
