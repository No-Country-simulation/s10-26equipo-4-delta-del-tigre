# HostFlow - Backend

API REST de HostFlow (NoCountry, Simulación Laboral Abierta, equipo 4): onboarding B2B2C para pequeños alojamientos del Delta del Tigre. El dueño configura su complejo y sus adicionales; el huésped completa una ficha pública y el sistema registra la reserva, avisa por email y prepara la solicitud de bote.

## Stack

- Java 21 y Spring Boot 4.1 (Web, Security, Data JPA, Validation, Mail)
- MySQL 8.4 con migraciones Flyway; H2 en modo MySQL para los tests
- Autenticación stateless con JWT (Spring Security)
- Documentación OpenAPI con Swagger UI
- Mailpit para ver los emails en desarrollo

## Requisitos

- JDK 21
- Docker y Docker Compose
- El wrapper de Maven viene en el repositorio (`./mvnw`)

## Levantar el backend en desarrollo

### Opción A: todo el stack con Docker Compose

Desde la raíz del repositorio, con los scripts del equipo (ver el README de la raíz):

```bash
./delta.sh init
./delta.sh up
```

### Opción B: infraestructura en contenedores y backend con Maven

1. Desde la raíz del repositorio, levantar MySQL, Redis y Mailpit:

```bash
docker compose --env-file .env.desarrollo up -d mysql redis mailpit
```

2. En la carpeta `backend`, exportar las variables (los valores de `<...>` están en `.env.desarrollo`):

```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:<MYSQL_HOST_PORT>/<MYSQL_DATABASE>?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export SPRING_DATASOURCE_USERNAME="<MYSQL_USER>"
export SPRING_DATASOURCE_PASSWORD="<MYSQL_PASSWORD>"
export SPRING_DOCKER_COMPOSE_ENABLED=false
export JWT_SECRET="<un secreto de al menos 32 caracteres>"
```

El correo sale por defecto a Mailpit (`localhost:1025`), así que no hace falta configurar nada más para desarrollo.

3. Levantar la aplicación:

```bash
./mvnw spring-boot:run
```

Direcciones útiles:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Definición OpenAPI: `http://localhost:8080/v3/api-docs`
- Emails de desarrollo (Mailpit): `http://localhost:8025`

## Variables de entorno

Las variables solo aplican al correr con Maven o en Render

| Variable | Obligatoria | Valor por defecto | Descripción |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | No | MySQL en `localhost:3306/mydatabase` | URL JDBC de la base |
| `SPRING_DATASOURCE_USERNAME` | Sí | - | Usuario de la base |
| `SPRING_DATASOURCE_PASSWORD` | Sí | - | Contraseña de la base |
| `JWT_SECRET` | Sí | - | Clave para firmar los tokens, mínimo 32 caracteres |
| `JWT_EXPIRATION_MINUTES` | No | `120` | Duración del token |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000` | Orígenes permitidos (URL del frontend), separados por coma |
| `SPRING_MAIL_HOST` | No | `localhost` | Servidor SMTP |
| `SPRING_MAIL_PORT` | No | `1025` | Puerto SMTP |
| `SPRING_MAIL_USERNAME` | No | vacío | Usuario SMTP |
| `SPRING_MAIL_PASSWORD` | No | vacío | Contraseña SMTP |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH` | No | `false` | Autenticación SMTP |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE` | No | `false` | STARTTLS |
| `MAIL_FROM` | No | `no-reply@hostflow.local` | Remitente de los emails |
| `MAIL_NOTIFY_GUEST` | No | `true` | Si es `false`, no se envía la confirmación al huésped |
| `BOAT_WEBHOOK_URL` | No | vacío | Webhook del módulo de lanchas; vacío = no se envía |
| `APP_SEED_ENABLED` | No | `false` | Carga los datos de demo al arrancar |
| `SEED_OWNER_PASSWORD` | No | `Demo1234!` | Contraseña del dueño demo |
| `SPRING_DOCKER_COMPOSE_ENABLED` | No | - | Poner `false` fuera de Docker Compose (producción y desarrollo con Maven) |
| `SERVER_PORT` | No | `8080` | Puerto del servidor |

Las imágenes (logo del complejo e imagen de los adicionales) las sube el frontend a Cloudinary; el backend solo valida y guarda la URL, por lo que no necesita credenciales de Cloudinary.

## Base de datos y migraciones

El esquema lo maneja Flyway (`src/main/resources/db/migration`) y Hibernate solo valida (`ddl-auto=validate`).

| Migración | Contenido |
|---|---|
| `V1` | Esquema inicial: dueños, complejos, adicionales, reservas y solicitudes de bote |
| `V2` | Cantidad de huéspedes, bote con fecha y hora de ida y regreso, complejo abierto o cerrado |
| `V3` | Imagen opcional de los adicionales |

Reglas:

- No se editan migraciones ya aplicadas: los cambios van en una migración nueva.
- Las migraciones tienen que funcionar en MySQL y en H2 (modo MySQL), porque los tests las ejecutan sobre H2.
- En MySQL, si una migración falla a la mitad, el DDL no se revierte. En desarrollo se arregla con `docker compose --env-file .env.desarrollo down -v` y se vuelve a levantar (borra los datos locales).

## API

Las respuestas exitosas llegan dentro de `data`. Las rutas privadas requieren `Authorization: Bearer <accessToken>` y rol de dueño.

### Autenticación (pública)

| Método y ruta | Descripción |
|---|---|
| `POST /api/auth/register` | Registro de dueño; devuelve `data.accessToken` |
| `POST /api/auth/login` | Inicio de sesión; devuelve `data.accessToken` |
| `POST /api/auth/logout` | Cierre de sesión |

### Complejos (privada)

| Método y ruta | Descripción |
|---|---|
| `POST /api/complexes` | Crear complejo (nombre, dirección, datos de transferencia y `logoUrl` opcionales) |
| `GET /api/complexes` | Listar los complejos del dueño |
| `GET /api/complexes/{id}` | Ver un complejo |
| `PUT /api/complexes/{id}` | Editar nombre, dirección, color y logo (reemplaza: sin `logoUrl` se quita el logo) |
| `PATCH /api/complexes/{id}/payment-info` | Editar titular, alias o CBU y banco |
| `PATCH /api/complexes/{id}/status` | Abrir o cerrar el complejo: `{"open": true}` |

El slug lo genera el backend a partir del nombre.

### Adicionales (privada)

Alta, listado, edición y activación o desactivación de los adicionales de un complejo (ver Swagger, sección "Adicionales"). Cada adicional lleva nombre, descripción, precio e `imageUrl` opcional. La edición reemplaza: sin `imageUrl` se quita la imagen.

### Reservas del dueño (privada)

| Método y ruta | Descripción |
|---|---|
| `POST /api/complexes/{complexId}/bookings` | Crear una reserva manual |
| `GET /api/complexes/{complexId}/bookings` | Listar reservas; filtro opcional `?status=PENDIENTE`, `CONFIRMADA`, `FINALIZADA` o `CANCELADA` |
| `GET /api/bookings/{id}` | Detalle de una reserva (incluye adicionales y solicitud de bote) |
| `PATCH /api/bookings/{id}/status` | Cambiar el estado de la reserva |

### Público (sin autenticación)

| Método y ruta | Descripción |
|---|---|
| `GET /api/public/complexes/{slug}` | Ficha del complejo: nombre, dirección, `logoUrl`, color, `open` y adicionales activos con su `imageUrl` |
| `POST /api/public/complexes/{slug}/onboarding` | El huésped completa la ficha y se crea la reserva en estado `PENDIENTE` |

Cuerpo del onboarding:

```json
{
  "guestName": "Ana Pérez",
  "guestEmail": "ana@mail.com",
  "guestPhone": "+5491123456789",
  "checkIn": "2026-12-20",
  "checkOut": "2026-12-22",
  "guestsCount": 2,
  "preferences": "Cama matrimonial",
  "allergies": ["GLUTEN"],
  "addons": [
    { "addonId": "<id de un adicional activo del complejo>", "quantity": 2 }
  ],
  "boat": {
    "departureAt": "2026-12-20T09:00:00",
    "returnAt": "2026-12-22T17:00:00",
    "pickupPoint": "Muelle principal",
    "passengers": 2,
    "comments": "Llevamos equipaje"
  }
}
```

Respuesta `201`:

```json
{
  "data": {
    "bookingId": "3f2a0c1e-...",
    "status": "PENDIENTE",
    "total": 3000.00,
    "boatRequested": true,
    "paymentInfo": { "accountHolder": "Ana Pérez", "aliasCbu": "hostflow.delta", "bank": "Banco Nación" }
  }
}
```

Reglas del onboarding:

- Obligatorios: `guestName`, `guestEmail`, `checkIn` (hoy o una fecha futura), `checkOut` (posterior a `checkIn`) y `guestsCount` (de 1 a 10).
- `guestPhone` es opcional, pero se vuelve obligatorio si se solicita bote.
- Los campos opcionales se omiten o se envían como `null`; nunca como `""`.
- Alergias: `GLUTEN`, `LACTOSA`, `MANI`, `FRUTOS_SECOS`, `HUEVO`, `SOJA`, `MARISCOS`, `PESCADO`; más `otherAllergies` en texto libre.
- Adicionales: tienen que ser activos y del mismo complejo del slug; la cantidad es de 1 a 50 y, si el mismo adicional se repite, se suman las cantidades. El total es la suma de precio por cantidad.
- `paymentInfo` solo viene en la respuesta si el pedido tiene adicionales.
- Bote (opcional; si se envía): `departureAt` (futura) y `returnAt` son obligatorios y el regreso tiene que ser posterior a la salida; `passengers` de 1 a 10 y no mayor a `guestsCount`; `pickupPoint` y `comments` son opcionales (hasta 200 y 500 caracteres).
- Complejo cerrado: responde `409` y no crea la reserva.
- Errores habituales: `400` por validación o adicional inválido, `404` si el slug no existe, `409` si el complejo está cerrado.

## Qué pasa al crear una reserva

1. Se guarda la reserva con sus adicionales y la solicitud de bote (si la hay), todo en una transacción.
2. Una vez confirmada la transacción, de forma asíncrona:
   - Se envía un email al dueño con los datos del huésped, los adicionales, el total y el bote.
   - Se envía una confirmación al email del huésped (se apaga con `MAIL_NOTIFY_GUEST=false`).
   - Si hay bote y `BOAT_WEBHOOK_URL` está configurada, se hace un `POST` con el JSON de la solicitud.
3. Un fallo del correo o del webhook se registra en el log y no afecta a la reserva.

Estado de la solicitud de bote: `SENT` si el webhook respondió 2xx, `FAILED` si falló y `PENDING` si no hay webhook configurado. Se hace un solo envío, sin reintentos.

JSON que recibe el webhook (`POST`, `Content-Type: application/json`):

```json
{
  "bookingId": "3f2a0c1e-...",
  "complex": "Cabañas del Río",
  "guestName": "Ana Pérez",
  "guestPhone": "+5491123456789",
  "guestsCount": 2,
  "departureAt": "2026-12-20T09:00:00",
  "returnAt": "2026-12-22T17:00:00",
  "pickupPoint": "Muelle principal",
  "passengers": 2,
  "comments": null
}
```

## Datos de demo

Con `APP_SEED_ENABLED=true` el backend carga al arrancar un dueño demo, dos complejos y reservas de ejemplo. Es idempotente: si ya están cargados, no hace nada.

- Dueño: `demo@hostflow.local` con la contraseña `Demo1234!` (o la de `SEED_OWNER_PASSWORD`)
- `cabanas-del-rio-demo`: complejo abierto, con logo, 4 adicionales activos con imagen (más uno inactivo) y 4 reservas, dos con bote
- `posada-isla-verde-demo`: complejo cerrado, para probar ese estado

## Tests

Los tests usan H2 en memoria. Si tenés exportadas las variables `SPRING_DATASOURCE_*` de desarrollo, hay que desactivarlas para que no apunten a MySQL:

```bash
env -u SPRING_DATASOURCE_URL -u SPRING_DATASOURCE_USERNAME -u SPRING_DATASOURCE_PASSWORD ./mvnw clean test
```

Para correr una sola clase, agregar `-Dtest=NombreDelTest`. Hay tests de integración con MockMvc para autenticación, complejos, adicionales, reservas y onboarding, un test de flujo completo (`OnboardingEndToEndIntegrationTest`) y tests unitarios de las notificaciones y del webhook.

## Estructura del código

Paquete base `nocountry.grupo4.delta_tigre`, un paquete por módulo:

- `auth`, `owner`: registro, login y dueños
- `complex`: complejos, ficha pública y validación de imágenes
- `addon`: adicionales
- `booking`: reservas, onboarding y solicitudes de bote
- `notification`: emails y webhook al bote
- `security`: JWT y configuración de seguridad
- `config`: configuración general, OpenAPI y datos de demo
- `response`: formato de las respuestas y manejo de errores

## Despliegue

Variables mínimas en producción:

- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD` de la base MySQL
- `JWT_SECRET` (mínimo 32 caracteres)
- `SPRING_DOCKER_COMPOSE_ENABLED=false`
- `CORS_ALLOWED_ORIGINS` con la URL del frontend
- Un SMTP real: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true` y `MAIL_FROM`
- Opcionales: `BOAT_WEBHOOK_URL` y, solo para la demo, `APP_SEED_ENABLED=true`

Flyway aplica las migraciones al arrancar.

## Convenciones del equipo

- Ramas: `backend/<tipo>/<nº-de-issue>-<descripción>`
- Commits: Conventional Commits, en inglés
- Pull requests: título `[BACKEND] tipo: descripción` y revisión técnica antes de mergear
