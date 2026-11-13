# Memoria del proyecto — HostFlow (Delta del Tigre)

> Contexto persistente para agentes/desarrolladores. Actualizar cuando cambien arquitectura, alcance o convenciones.

## Qué es

**HostFlow** es una plataforma web **B2B2C** para digitalizar el onboarding de huéspedes en alojamientos turísticos (cabañas, hoteles y complejos del Delta del Tigre) y facilitar la contratación de adicionales y la solicitud de cotización de **lancha remis**.

- **Para el alojamiento:** dashboard privado para configurar complejo, marca, adicionales, datos de pago y reservas.
- **Para el huésped:** formulario público mobile-first con la identidad visual del complejo, datos personales, alergias/preferencias, adicionales y cotización de lancha.
- **Para el negocio:** captar solicitudes calificadas de lancha remis.

**Estado:** MVP en desarrollo. Equipo 4 — Simulación Laboral Abierta NoCountry.

## Estructura del monorepo

```
.
├── backend/     API Spring Boot (Java 21)
├── frontend/    App Next.js (donde se trabaja actualmente)
├── design/      Recursos de diseño (vacío por ahora)
├── docs/        Documentación (vacío por ahora)
├── testing/     QA: plan, casos, reportes y evidencias
├── compose.yaml Docker Compose (MySQL, Redis, Mailpit, backend, frontend)
├── delta.ps1 / delta.sh  Scripts de arranque
├── .env.desarrollo / .env.produccion  Variables de entorno (NO deben versionarse)
└── memory.md
```

## Stack

### Frontend (`frontend/`)
- **Next.js 16.4.2** (App Router) + **React 19.3**
- **TypeScript 5**
- **Tailwind CSS v4** (`@tailwindcss/turbopack`)
- **shadcn/ui** sobre **Base UI** (`@base-ui/react`) + `class-variance-authority`
- **lucide-react** para iconos
- **zod 4** para validación
- **React Compiler** (`babel-plugin-react-compiler`)
- Alias de imports: `@/*` → `src/*`

> Importante: esta versión de Next.js tiene cambios respecto a versiones anteriores. Antes de escribir código, revisar `frontend/node_modules/next/dist/docs/` (ver `frontend/AGENTS.md`).

### Backend (`backend/`)
- **Spring Boot 4.1.1**, Java 21, Maven
- Spring Web MVC, Security, Data JPA, JDBC, Redis, Mail, Validation
- MySQL + Flyway (`src/main/resources/db/migration`)
- JWT para autenticación
- Cloudinary para logos
- Webhook de lancha remis
- Endpoints actuales bajo `/api/v1`:
  - `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
  - `POST /complexes`, `GET /complexes`, `GET /complexes/{id}`, `PUT /complexes/{id}`
- Dominios: `auth`, `owner`, `complex`, `booking`, `addon`

## Frontend: rutas

Route groups de App Router:

- `src/app/(auth)/` → `login`, `register` (layout propio)
- `src/app/(admin)/` → área privada con sidebar:
  - `/dashboard` — inicio / resumen del complejo
  - `/complejos` — listado con búsqueda y filtro por estado
  - `/complejos/[id]` — detalle del complejo
  - `/reservas` — listado de reservas con filtros y métricas
  - `/reservas/[id]` — detalle de reserva
  - `/adicionales` — catálogo de servicios extra por complejo (listado, crear, editar, activar/desactivar)
  - `/adicionales/nuevo` — formulario de creación de adicional
  - `/adicionales/[id]/editar` — edición de adicional
   - `/datos-pago` — datos bancarios para transferencias
   - `/onboarding` — link de onboarding del panel (placeholder)
- `src/app/onboarding/[slug]/` → onboarding público white label del complejo (4 pasos completos: "Tus datos", "Preferencias y alergias", "Adicionales" y "Lancha remis", con envío final a la API)
- `src/app/api/auth/logout/route.ts` — logout
- `src/app/not-found.tsx`, `src/app/unauthorized.tsx`

El layout admin (`(admin)/layout.tsx`) valida sesión y redirige a `/login?session=expired`.

## Autenticación actual (MOCK)

- No hay integración real con el backend todavía.
- `src/services/auth/auth.service.ts` delega en `src/mocks/auth.mock.ts`.
- Credenciales demo: **`demo@hostflow.com`** / **`hostflow123`**.
- Sesión mock en cookie `hostflow_mock_session`, manejada por `src/services/auth/mock-session.server.ts` (Map en memoria, 30 min).
- Server Actions en `src/app/(auth)/actions.ts`: `loginWithMockSession`, `logoutMockSession`.
- Esquemas zod en `src/app/(auth)/schemas/auth.schema.ts`.

## Capa de datos actual (MOCK)

- **Complejos:** `src/app/(admin)/complejos/data/complejo.json` + `complejos.data.ts`.
  - `ownerId` mock: `user-001`.
  - Estados calculados: `sin-configurar`, `faltan-datos`, `completado`, `sin-publicar`, `abierto`, `cerrado`.
- **Reservas:** `src/lib/reservas.ts` con array `MOCK` y helpers `getReservas`, `getReservaById`, `getResumen`.
  - Formato de fechas `es-AR`, timezone `America/Argentina/Buenos_Aires`, moneda `ARS`.
- **Datos de pago:** formulario mock en `src/components/datos-pago-form.tsx`.
- **Adicionales:** `src/app/(admin)/adicionales/data/adicionales.data.ts` con store mock en memoria (globalThis) y `src/services/adicionales/adicionales.service.ts`.
   - Si existe `NEXT_PUBLIC_API_URL` usa `/api/v1/complexes/{id}/addons` y `/api/v1/addons/{id}`; si no, cae a mock.
   - Server Actions en `src/app/(admin)/adicionales/actions.ts` (crear/editar/estado/eliminar) + `useActionState` en el formulario.
   - El formulario permite subir imagen (PNG/JPG, máx. 2 MB) con vista previa; en modo mock se guarda como data URL.
   - UI de catálogo en tarjetas con imagen, toggle de estado, precio y acciones.
   - El backend no expone DELETE de adicionales: la eliminación funciona en modo mock y queda deshabilitada cuando hay `NEXT_PUBLIC_API_URL`.
- **Onboarding público:** `src/services/onboarding/onboarding.service.ts` consulta `GET /api/v1/public/complexes/{slug}` cuando hay `NEXT_PUBLIC_API_URL`; sin API cae al mock `complejo.json` buscando por `slug`.
   - El logo y `coloresMarca` del complejo se usan para el white label (el primer color hex válido es el acento).
   - Validación de pasos en `src/app/onboarding/[slug]/schemas/onboarding.schema.ts` (zod). Paso 2 usa el enum de alergias del backend (`GLUTEN`, `LACTOSA`, `MANI`, `FRUTOS_SECOS`, `HUEVO`, `SOJA`, `MARISCOS`, `PESCADO`) + preferencias y "otra alergia" de texto libre.
   - Paso 3: tarjetas horizontales con imagen del adicional (o fallback), stepper de cantidad (1-50) y total estimado.
   - Paso 4: tarjeta "Cotizar lancha remis" con checkbox, horarios de llegada/regreso, punto de salida (select) y pasajeros ≤ huéspedes; reglas de fechas futuras y `returnAt > departureAt`.
   - Submit final: `POST /api/v1/public/complexes/{slug}/onboarding` con `enviarOnboarding`; sin API simula la respuesta en modo mock (reserva `DS-####` y datos de pago del complejo). Muestra pantalla centrada de éxito con resumen de adicionales, total, alias copiable y aviso de solicitud de lancha.
   - UI del wizard en `src/app/onboarding/[slug]/onboarding-wizard.tsx`; 404 y error boundary en `onboarding/not-found.tsx` y `onboarding/[slug]/error.tsx`.

> TODO: reemplazar mocks por llamadas al backend (`NEXT_PUBLIC_API_URL` / server fetch) cuando la API esté lista.

## Componentes y convenciones

- UI base en `src/components/ui/` (avatar, badge, button, card, dropdown-menu, input, label, select, separator, sheet, sidebar, skeleton, table, tooltip).
- Layout en `src/components/layout/` (`app-sidebar.tsx`, `admin-header.tsx`).
- Componentes de dominio en `src/components/` (`complejo-selector`, `datos-pago-form`, `estado-badge`, `reservas-filtros`, `reservas-lista`, `volver-button`).
- Server Components por defecto; `"use client"` solo cuando se necesita estado/eventos.
- Textos e interfaz en **español**.
- Paleta usada con hex directos: verde principal `#174f40` / `#28745b`, fondos `#f5f8f6`, bordes `#dce5e0`, texto `#172c28` / `#71817b`.
- No agregar comentarios al código salvo pedido explícito.

## Comandos

Desde `frontend/`:

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint
```

Backend (desde `backend/`):

```bash
./mvnw spring-boot:run
./mvnw test
```

Infra local (desde la raíz): `docker compose --env-file .env.desarrollo up` o scripts `delta.ps1` / `delta.sh`.

## QA

`testing/` contiene plan de pruebas, casos por feature (FEAT-01…FEAT-06 + transversal), equivalencia y límites, reportes y evidencias. Rol QA: Karol Trujillo.

## Seguridad / repositorio

- Los `.env` contienen credenciales y secretos (MySQL, Redis, JWT, Cloudinary). **No deben versionarse.**
- `.gitignore` raíz ignora `.env*` (excepto `.env.example`), `*.pem`, `*.key`, `secrets/`, `db.txt`, `*.log`.
- `.gitignore` de frontend ignora `node_modules`, `.next`, `out`, `build`, `coverage`, `.env*`, `*.tsbuildinfo`, `next-env.d.ts`, `.vercel`.
- Si se agregan archivos generados nuevos (caché, builds, reportes de cobertura), agregarlos al `.gitignore` correspondiente.
