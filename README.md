# HostFlow

Plataforma web B2B2C para digitalizar el onboarding de huéspedes en alojamientos turísticos y facilitar la contratación de servicios adicionales, incluida la solicitud de cotización de lancha remis premium.

> **Estado:** definición del MVP  
> **Nombre del proyecto:** HostFlow (provisional)

## Visión general

Los dueños de cabañas, hoteles y complejos turísticos suelen recopilar los datos de sus huéspedes mediante conversaciones de WhatsApp y procesos manuales. A su vez, los turistas pueden tener dificultades para coordinar un transporte privado de calidad hasta su alojamiento.

HostFlow busca centralizar este proceso en una experiencia digital, profesional y optimizada para móviles. Cada alojamiento podrá compartir un formulario personalizado con su marca para que el huésped complete sus datos, indique sus preferencias, seleccione adicionales y, si lo necesita, solicite una cotización de lancha remis.

La plataforma conecta tres objetivos:

- **Para el alojamiento:** reducir tareas manuales y centralizar la información de sus huéspedes.
- **Para el turista:** completar el ingreso de datos desde el celular y gestionar servicios adicionales en un mismo flujo.
- **Para el negocio:** captar solicitudes calificadas para el servicio de lancha remis en el momento en que el turista manifiesta interés.

## Problema del negocio

La operación manual genera fricción tanto para los alojamientos como para sus huéspedes:

- Recopilación de datos personales mediante mensajes y conversaciones dispersas.
- Falta de una ficha digital centralizada por huésped y reserva.
- Presentación poco uniforme de la información del alojamiento.
- Dificultad para ofrecer y organizar adicionales, como comidas o experiencias.
- Coordinación del transporte privado en un proceso separado del onboarding.
- Gestión manual de los pedidos y necesidad de avisar al dueño cuando un huésped selecciona adicionales.

## Propuesta de solución

HostFlow ofrece dos interfaces principales conectadas por un flujo de datos compartido.

### 1. Dashboard B2B — Gestión del alojamiento

Panel privado para que el dueño configure y administre la información de su complejo.

Funciones previstas para el MVP:

- Crear y editar los datos del complejo turístico.
- Subir el logo y definir los colores de marca.
- Configurar disponibilidad básica.
- Crear, editar y administrar adicionales con nombre, descripción y precio.
- Configurar los datos bancarios del alojamiento (Alias/CBU) para recibir transferencias.
- Consultar una lista cronológica de reservas con check-in, check-out y estado.
- Recibir por email los pedidos de adicionales realizados por los huéspedes.

### 2. Onboarding B2C — Ficha del huésped

Formulario público y responsive que se personaliza con la identidad visual del alojamiento.

Funciones previstas para el MVP:

- Mostrar el logo y los colores del complejo.
- Recopilar datos personales del huésped.
- Registrar alergias y preferencias relevantes.
- Permitir la selección de adicionales disponibles.
- Mostrar el importe total de los adicionales seleccionados.
- Ofrecer la opción de solicitar una cotización de lancha remis e indicar los horarios de interés.
- Confirmar el envío y mostrar un resumen de la solicitud.

La ficha se accederá mediante una ruta dinámica, por ejemplo:

`/onboarding/:id-complejo`

No se requiere que cada alojamiento tenga un dominio personalizado.

### 3. Adicionales y pago por transferencia

El dueño podrá publicar servicios o productos adicionales, como comidas y experiencias, con sus respectivos precios.

Cuando el huésped seleccione uno o más adicionales, el sistema deberá:

1. Registrar la selección y asociarla al huésped y a su reserva.
2. Calcular y mostrar el total correspondiente.
3. Enviar un email al dueño con el detalle del pedido.
4. Mostrar al huésped una pantalla de confirmación con el resumen y los datos bancarios configurados por el alojamiento.
5. Informar claramente que debe realizar una transferencia para asegurar los adicionales.

**El MVP no procesará pagos con tarjeta ni verificará automáticamente las transferencias.** El pago se realizará fuera de la plataforma, directamente al alojamiento.

Texto orientativo para la confirmación:

> Transfiere el monto total a este Alias para asegurar tus adicionales.

### 4. Solicitud de cotización de lancha remis

La opción de cotización funcionará como un disparador de interés comercial, no como una compra ni una reserva confirmada de transporte.

Cuando el huésped la seleccione, el sistema deberá:

- Registrar la solicitud y los horarios indicados.
- Asociarla al huésped y al alojamiento correspondiente.
- Preparar los datos para enviarlos mediante un webhook o API a un módulo futuro.
- Evitar cobrar o confirmar automáticamente el servicio de lancha.

El contrato definitivo del JSON y la integración externa quedan pendientes de definición técnica.

## Flujo principal

1. El dueño configura su complejo, identidad visual, datos bancarios y adicionales.
2. El alojamiento comparte el enlace de su ficha de onboarding.
3. El huésped abre el enlace desde su celular.
4. El huésped completa sus datos personales, alergias y preferencias.
5. Selecciona los adicionales que desea solicitar y, opcionalmente, pide cotizar una lancha remis.
6. El sistema registra la información y los pedidos.
7. El dueño recibe por email el detalle del pedido de adicionales.
8. El huésped visualiza la confirmación, el resumen y los datos para realizar la transferencia.
9. Si solicitó una lancha, el sistema registra el interés y deja preparada la integración futura mediante webhook/API.

## Alcance del MVP

### Incluido

- Dashboard B2B para administrar la información del alojamiento.
- Personalización white-label liviana mediante logo y colores.
- Formulario de onboarding público y adaptable a móviles.
- Captura de datos personales, alergias y preferencias.
- Catálogo básico de adicionales con precios.
- Resumen de adicionales e importe total.
- Presentación de Alias/CBU para transferencias externas.
- Registro simplificado de huéspedes y reservas.
- Listado de reservas ordenado cronológicamente con check-in, check-out y estado.
- Notificación por email al dueño cuando se realice un pedido de adicionales.
- Registro de solicitudes de cotización de lancha y preparación del payload para una futura integración.

### Fuera del alcance inicial

- Pasarela de pagos con tarjeta o procesamiento de pagos dentro de la plataforma.
- Verificación automática de transferencias bancarias.
- Motor de reservas complejo con disponibilidad en tiempo real.
- Dominios personalizados para cada alojamiento.
- Reserva, asignación o cobro automático del servicio de lancha remis.
- Integración completa con el módulo de transporte, hasta que se defina su contrato de API/webhook.

## Reglas de negocio

1. **Mobile-first:** el formulario del huésped debe priorizar el uso desde el celular.
2. **White-label liviano:** la marca se adapta por alojamiento mediante logo y colores; el acceso se realiza con una ruta dinámica.
3. **Reservas simplificadas:** se necesita una lista cronológica con check-in, check-out y estado, no un motor de reservas complejo.
4. **Pago externo:** los adicionales se pagan mediante transferencia al Alias/CBU del alojamiento.
5. **Notificación al dueño:** cada pedido de adicionales debe generar un email con el detalle correspondiente.
6. **Cotización de lancha sin cobro:** la selección registra una solicitud y prepara la integración futura, pero no confirma el servicio.
7. **Separación de responsabilidades:** los pedidos de adicionales y las solicitudes de cotización de lancha deben poder identificarse como procesos distintos.

## Requisitos de UX/UI

- Diseñar primero para pantallas móviles y adaptar progresivamente a tabletas y escritorio.
- Reducir al mínimo los pasos necesarios para completar el onboarding.
- Usar etiquetas, validaciones y mensajes de error claros.
- Mantener visibles los precios y el total de los adicionales seleccionados.
- Mostrar una confirmación final inequívoca y los datos de transferencia de forma fácil de copiar.
- Aplicar la identidad visual del alojamiento sin sacrificar legibilidad ni accesibilidad.
- Comunicar que la transferencia se realiza por fuera de la plataforma y que la solicitud de lancha es una cotización, no una reserva confirmada.

## Entidades principales del dominio

Las entidades definitivas se determinarán durante el diseño del modelo de datos. Como punto de partida, el dominio contempla:

- **Alojamiento:** información del complejo, marca, configuración y datos bancarios.
- **Huésped:** datos personales, alergias y preferencias.
- **Reserva:** alojamiento asociado, fechas de check-in/check-out y estado.
- **Adicional:** nombre, descripción, precio y disponibilidad para ofrecerlo.
- **Pedido de adicionales:** selección de adicionales, cantidades si aplican, importe total y estado del pedido.
- **Solicitud de lancha:** datos de contacto y horarios solicitados para cotización.
- **Usuario del alojamiento:** identidad y acceso al dashboard.
- **Notificación:** información necesaria para comunicar un pedido al dueño.

Esta lista es conceptual y no define todavía tablas, relaciones, estados finales ni restricciones de persistencia.

## Arquitectura e integraciones

La solución se compone conceptualmente de:

- **Frontend web:** dashboard privado y ficha pública de onboarding.
- **Backend/API:** persistencia, reglas de negocio, validación y operaciones del sistema.
- **Servicio de email:** envío de notificaciones de pedidos al dueño.
- **Webhook/API futura:** envío de solicitudes de cotización de lancha a un módulo externo.

El stack tecnológico, el proveedor de email, el despliegue, la autenticación y el contrato definitivo de las integraciones deberán documentarse cuando el equipo los acuerde. No se consideran decisiones cerradas en esta etapa.

## Estructura propuesta del repositorio

La estructura final dependerá de cómo se organice el equipo. Si se utiliza un monorepo, una opción inicial es:

```text
hostflow/
├── frontend/       # Dashboard B2B y onboarding B2C
├── backend/        # API, lógica de negocio e integraciones
├── docs/           # Requisitos, modelo de datos y contrato de API
├── design/         # Wireframes, diseño visual y recursos de marca
└── testing/        # Casos de prueba y evidencias de QA
```

## Criterios de éxito del MVP

El MVP cumplirá su objetivo cuando:

- Un dueño pueda configurar su alojamiento y publicar un enlace de onboarding.
- Un huésped pueda completar la ficha desde el celular sin asistencia del alojamiento.
- Los datos enviados queden asociados al alojamiento y a la reserva correspondiente.
- El huésped pueda seleccionar adicionales y consultar el total.
- La confirmación muestre el resumen del pedido y el Alias/CBU configurado.
- El dueño reciba un email con el detalle del pedido.
- La solicitud de lancha quede registrada con los horarios indicados y los datos necesarios para una futura integración.
- El dueño pueda consultar las reservas en una lista cronológica sencilla.

## Próximas decisiones técnicas

- Definir stack y estructura definitiva del repositorio.
- Diseñar el modelo de datos y las relaciones entre alojamiento, huésped, reserva y pedidos.
- Definir autenticación y permisos del dashboard B2B.
- Acordar validaciones y tratamiento de datos personales.
- Definir proveedor, plantillas y contenido de los emails.
- Establecer el contrato JSON y la estrategia de reintentos para el webhook de lancha.
- Definir estados de reservas y pedidos.
- Preparar criterios de aceptación y pruebas funcionales del onboarding mobile-first.

---

HostFlow busca que el ingreso de datos del huésped, la solicitud de adicionales y la captación de interés por el transporte privado formen parte de una experiencia digital sencilla, coherente y trazable.

## Configuración de contenedores

Para desarrollo local, copia la plantilla y levanta el stack desde la raíz del repositorio:

```powershell
Copy-Item .env.desarrollo .env -Force
docker compose up --build
```

Para empezar a preparar producción, usa `Copy-Item .env.produccion .env -Force` y completa los campos vacíos antes de ejecutar Compose.

La plantilla de desarrollo usa credenciales solo locales. No reutilices esas contraseñas fuera de tu equipo. Mailpit se inicia con el perfil `development`; su interfaz está disponible en `http://localhost:8025`.

Para preparar producción, copia `.env.produccion` como `.env` y completa cada valor requerido. Los campos vacíos están intencionalmente incompletos: Compose se detendrá si falta una variable obligatoria. No despliegues esa plantilla sin rellenar y revisar secretos, imágenes y parámetros TLS. No subas el `.env` resultante al repositorio; en producción, inyecta los secretos desde el gestor de secretos de la plataforma siempre que sea posible.

`NEXT_PUBLIC_API_URL` se incorpora al bundle del frontend durante la compilación y debe ser una URL HTTPS accesible desde el navegador de los usuarios. Configura un proxy inverso con TLS para publicar frontend y API; los puertos de los contenedores se enlazan solo a `127.0.0.1` en el host. La aplicación aún no implementa un token de API/JWT, por lo que no hay un token que configurar en estas plantillas.

### Scripts de desarrollo y Dev Container

Los scripts `delta.ps1` (Windows) y `delta.sh` (Linux/macOS) administran Compose. Ejecuta `init` una vez para crear `.env` desde la plantilla de desarrollo; no sobrescribe un `.env` existente:

```powershell
.\delta.ps1 init
.\delta.ps1 up
.\delta.ps1 status
.\delta.ps1 logs backend
.\delta.ps1 connect backend
.\delta.ps1 down
```

En Linux/macOS, usa los mismos comandos con `bash ./delta.sh`, o dale permiso de ejecución con `chmod +x ./delta.sh` y ejecútalo como `./delta.sh`. `connect` sin servicio abre una shell en `workspace`; también puedes indicar `backend`, `frontend`, `mysql`, `redis` o `mailpit`. `down` conserva los volúmenes de datos.

En Linux/macOS el script pasa `id -u` e `id -g` a la construcción del contenedor `workspace`; en Windows usa `1000:1000`. No ejecutes el script como root en Linux/macOS. El servicio de desarrollo monta el proyecto y ejecuta VS Code con el usuario `vscode` que recibe esos IDs. MySQL y Redis conservan sus usuarios internos porque escriben en volúmenes Docker, no en carpetas del host; las imágenes del backend y frontend también mantienen sus usuarios no-root. Para VS Code Dev Containers, crea primero `.env` con `init` y luego abre el proyecto en el contenedor; `.devcontainer/devcontainer.json` se conecta al servicio `workspace`.
